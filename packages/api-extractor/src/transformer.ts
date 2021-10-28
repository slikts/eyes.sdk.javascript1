import './typescript-internals'

import * as ts from 'typescript'
import * as path from 'path'

// TODO handle missed rootDir, outDir, declarationDir
interface TransformerConfig {
  rootFile?: string
  allowModules?: string[]
  allowGlobalNamespaces?: string[]
  ignoreBrands?: string[]
  ignorePrivate?: boolean
  ignoreProtected?: boolean
}

export default function transformer(
  program: ts.Program,
  config?: TransformerConfig,
): ts.TransformerFactory<ts.SourceFile> {
  const checker = program.getTypeChecker()
  const options = program.getCompilerOptions()
  const moduleResolutionCache = program.getModuleResolutionCache()

  const rootFileName = path.resolve(options.rootDir, config?.rootFile ?? 'index.ts')
  const declarationFileName = path.resolve(options.declarationDir, path.basename(rootFileName, '.ts') + '.d.ts')

  return function transformerFactory(context) {
    const host = context.getEmitHost()
    host.isEmitBlocked = emitFileName => emitFileName.endsWith('.d.ts') && emitFileName !== declarationFileName

    const exports = {
      names: new Map<string, {name: string; type: ts.Type; symbol: ts.Symbol}>(), // by names
      types: new Map<ts.Type, {name: string; type: ts.Type; symbol: ts.Symbol}>(), // by types
      symbols: new Map<ts.Symbol, {name: string; type: ts.Type; symbol: ts.Symbol}>(), // by symbols
    }

    return function transformSourceFile(sourceFile: ts.SourceFile): ts.SourceFile {
      if (sourceFile.fileName !== rootFileName) return sourceFile

      const module = checker.getSymbolAtLocation(sourceFile)
      for (let symbol of checker.getExportsOfModule(module)) {
        const name = symbol.getName()

        // if alias is exported original symbol should be found, bc only original symbol could reference to the type
        if (symbol.flags & ts.SymbolFlags.Alias) {
          symbol = checker.getAliasedSymbol(symbol)
        }

        let type = checker.getTypeOfSymbolAtLocation(symbol, sourceFile)
        // some symbols (e.g. TypeAlias) cannot resolve type at location, so declared type should be taken
        if (type.flags & ts.TypeFlags.Any) {
          type = checker.getDeclaredTypeOfSymbol(symbol)
        }

        const exported = {name, type, symbol}
        exports.names.set(name, exported)
        exports.types.set(type, exported)
        exports.symbols.set(symbol, exported)

        if (symbol.flags & ts.SymbolFlags.TypeAlias) {
          const declaration = symbol.declarations[0] as ts.TypeAliasDeclaration
          if (ts.isTypeReferenceNode(declaration.type)) {
            let symbol = checker.getSymbolAtLocation(
              ts.isIdentifier(declaration.type.typeName) ? declaration.type.typeName : declaration.type.typeName.right,
            )
            if (symbol.flags & ts.SymbolFlags.Alias) {
              symbol = checker.getAliasedSymbol(symbol)
            }
            exports.symbols.set(symbol, exported)
          }
        }
      }

      const statements = [] as ts.Statement[]
      for (const {name, type, symbol} of exports.names.values()) {
        if (!['ConfigurationPlain', 'Driver', 'Element', 'Selector', 'Configuration'].includes(name)) continue

        // TODO check what name will be in case of export assignment
        if (name === 'default' /* `export default` or `export =` */) {
          statements.push(...createExportDefault({type, node: symbol.valueDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.Function /* `export function` */) {
          statements.push(...createFunctionDeclaration({type, name, node: symbol.valueDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.TypeAlias /* `export type` */) {
          statements.push(createTypeAliasDeclaration({type, name, node: symbol.declarations[0]}))
        } else if (symbol.flags & ts.SymbolFlags.Class /* `export class` */) {
          statements.push(createClassDeclaration({type: type as ts.InterfaceType, name, node: symbol.valueDeclaration}))
          // TODO createClassDeclaration
        } else if (symbol.flags & ts.SymbolFlags.Interface /* `export interface` */) {
          // TODO createInterfaceDeclaration
        } else if (symbol.flags & ts.SymbolFlags.Variable /* `export const` or `export let` or `export var` */) {
          // TODO createVariableDeclaration
        }
      }

      return ts.factory.createSourceFile(
        statements,
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None,
      )
    }

    function isIgnoredBrandProperty(propertyName: string): boolean {
      if (!config?.ignoreBrands) return false
      if (Array.isArray(config.ignoreBrands)) {
        return config.ignoreBrands.some(brandName => propertyName === `__${brandName}Brand`)
      }
      return true
    }

    function isQuotedProperty(propertyName: string): boolean {
      return !/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(propertyName)
    }

    function isReferenceType(type: ts.Type): type is ts.TypeReference {
      return Boolean(ts.getObjectFlags(type) & ts.ObjectFlags.Reference && (type.symbol || type.aliasSymbol))
    }

    function isLibType(type: ts.Type): type is ts.TypeReference {
      const symbol = type.aliasSymbol ?? type.symbol
      return Boolean(symbol) && program.isSourceFileDefaultLibrary(symbol.declarations[0].getSourceFile())
    }

    function isImportedType(type: ts.Type): type is ts.TypeReference {
      let symbol = type.aliasSymbol ?? type.symbol
      if (!symbol) return false
      while (symbol.parent) symbol = symbol.parent
      if (symbol.flags & ts.SymbolFlags.ValueModule) {
        const moduleFile = symbol.valueDeclaration.getSourceFile()
        const moduleName = getModuleName(moduleFile)
        return config?.allowModules.includes(moduleName)
      } else if (symbol.flags & ts.SymbolFlags.NamespaceModule) {
        const namespaceName = symbol.getName()
        return config?.allowGlobalNamespaces?.includes(namespaceName)
      } else {
        return false
      }
    }

    function isExportedType(type: ts.Type): type is ts.TypeReference {
      return exports.types.has(type) || exports.symbols.has(type.aliasSymbol ?? type.symbol)
    }

    function isTupleType(type: ts.Type): type is ts.TupleTypeReference {
      return Boolean(
        ts.getObjectFlags(type) & ts.ObjectFlags.Reference &&
          ts.getObjectFlags((<ts.TypeReference>type).target) & ts.ObjectFlags.Tuple,
      )
    }

    function isTypeLiteral(type: ts.Type): type is ts.ObjectType {
      return Boolean(
        type.flags & ts.TypeFlags.Object && type.symbol.flags & (ts.SymbolFlags.TypeLiteral | ts.SymbolFlags.Interface),
      )
    }

    function isBooleanLiteralType(type: ts.Type): boolean {
      return Boolean(type?.flags & ts.TypeFlags.BooleanLiteral)
    }

    function isPrimitiveType(type: ts.Type): boolean {
      return Boolean(
        type.flags &
          (ts.TypeFlags.Any |
            ts.TypeFlags.Unknown |
            ts.TypeFlags.Never |
            ts.TypeFlags.Null |
            ts.TypeFlags.VoidLike |
            ts.TypeFlags.BooleanLike |
            ts.TypeFlags.NumberLike |
            ts.TypeFlags.BigIntLike |
            ts.TypeFlags.StringLike |
            ts.TypeFlags.ESSymbolLike),
      )
    }

    function isOptional(symbol: ts.Symbol): boolean {
      return Boolean(symbol.flags & ts.SymbolFlags.Optional)
    }

    function isHiddenDeclaration(declaration: ts.Declaration): boolean {
      const isPrivateModifier = (modifier: ts.Modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
      const isProtectedModifier = (modifier: ts.Modifier) => modifier.kind === ts.SyntaxKind.ProtectedKeyword
      if (config?.ignorePrivate && config?.ignoreProtected) {
        return declaration?.modifiers?.some(modifier => isPrivateModifier(modifier) || isProtectedModifier(modifier))
      } else if (config?.ignorePrivate) {
        return declaration?.modifiers?.some(isPrivateModifier)
      } else if (config?.ignoreProtected) {
        return declaration?.modifiers?.some(isProtectedModifier)
      } else {
        return false
      }
    }

    function getModuleName(sourceFile: ts.SourceFile): string {
      const dirCache = moduleResolutionCache.getOrCreateCacheForDirectory(path.dirname(sourceFile.fileName))
      const fileCache = dirCache.get(`./${path.basename(sourceFile.fileName, '.d.ts')}`, undefined)
      return fileCache?.resolvedModule?.packageId?.name ?? path.relative(process.cwd(), sourceFile.fileName)
    }

    function getTypeName(type: ts.Type): string {
      if (exports.types.has(type)) return exports.types.get(type).name
      const chunks = []
      let symbol = type.aliasSymbol ?? type.symbol
      while (symbol) {
        if (symbol.getName() === '__global') break
        const name =
          symbol.flags & ts.SymbolFlags.ValueModule
            ? `import('${getModuleName(symbol.valueDeclaration as ts.SourceFile)}')`
            : symbol.getName()
        chunks.unshift(name)
        if (exports.symbols.has(symbol)) break
        symbol = symbol.parent
      }
      if (!exports.symbols.has(symbol) && exports.names.has(chunks[0])) {
        chunks.unshift('globalThis')
      }
      return chunks.join('.')
    }

    function getReplacedType(type: ts.Type): ts.Type {
      const symbol = type.symbol ?? type.aliasSymbol
      return exports.symbols.get(symbol)?.type ?? type
    }

    function getBaseTypes(type: ts.InterfaceType): {extendedTypes: ts.Type[]; implementedTypes: ts.Type[]} {
      let extendedTypes = checker.getBaseTypes(type)
      let implementedTypes = [] as ts.Type[]
      if (type.symbol.flags & ts.SymbolFlags.Class) {
        const otherBaseTypes = [] as {extendedTypes: ts.Type[]; implementedTypes: ts.Type[]}[]
        extendedTypes = extendedTypes.filter(type => {
          const isReferable = isLibType(type) || isImportedType(type) || isExportedType(type)
          if (!isReferable) otherBaseTypes.push(getBaseTypes(type as ts.InterfaceType))
          return isReferable
        })
        const declaration = type.symbol.valueDeclaration as ts.ClassDeclaration
        const implementationClause = declaration.heritageClauses.find(
          heritageClause => heritageClause.token === ts.SyntaxKind.ImplementsKeyword,
        )
        implementedTypes = implementationClause?.types.map(typeNode => checker.getTypeFromTypeNode(typeNode)) ?? []
        otherBaseTypes.forEach(otherBaseTypes => {
          extendedTypes.push(...otherBaseTypes.extendedTypes)
          implementedTypes.push(...otherBaseTypes.implementedTypes)
        })
      }

      return {extendedTypes, implementedTypes}
    }

    function createExportDefault(options: {type: ts.Type; node?: ts.Node; isExportEquals?: boolean}): ts.Statement[] {
      const {type, node, isExportEquals} = options
      return [
        ts.factory.createVariableStatement(
          [ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                '_default',
                undefined /* exclamationToken */,
                createTypeNode({type, node}),
                undefined /* initializer */,
              ),
            ],
            ts.NodeFlags.Const,
          ),
        ),
        ts.factory.createExportAssignment(
          undefined /* decorators*/,
          undefined /* modifiers */,
          isExportEquals,
          ts.factory.createIdentifier('_default'),
        ),
      ]
    }

    function createClassDeclaration(options: {type: ts.InterfaceType; name: string; node?: ts.Node}): ts.Statement {
      const {type, name, node} = options
      const {extendedTypes, implementedTypes} = getBaseTypes(type)

      const heritageClauses = [] as ts.HeritageClause[]
      if (extendedTypes.length > 0) {
        heritageClauses.push(
          ts.factory.createHeritageClause(
            ts.SyntaxKind.ExtendsKeyword,
            extendedTypes.map(type => createTypeNode({type, node}) as ts.ExpressionWithTypeArguments),
          ),
        )
      }
      if (implementedTypes.length > 0) {
        heritageClauses.push(
          ts.factory.createHeritageClause(
            ts.SyntaxKind.ImplementsKeyword,
            implementedTypes.map(type => createTypeNode({type, node})),
          ),
        )
      }

      return ts.factory.createClassDeclaration(
        undefined /* decorators */,
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        name,
        [] /* typeParameters */,
        heritageClauses,
        createMembers({type, node, isClass: true}) as ts.ClassElement[],
      )
    }

    function createFunctionDeclaration(options: {type: ts.Type; name: string; node?: ts.Node}): ts.Statement[] {
      const {type, name, node} = options
      return type.getCallSignatures().map(signature => {
        const typeParameters = signature.getTypeParameters()
        const parameters = signature.getParameters()
        const returnType = signature.getReturnType()
        const typePredicate = checker.getTypePredicateOfSignature(signature)
        return ts.factory.createFunctionDeclaration(
          undefined /* decorators */,
          [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          undefined /* asteriskToken */,
          name,
          typeParameters?.map(typeParameter =>
            checker.typeParameterToDeclaration(typeParameter, node, ts.NodeBuilderFlags.None),
          ),
          parameters?.map(symbol => createParameterDeclaration({symbol, node})),
          typePredicate
            ? ts.factory.createTypePredicateNode(
                undefined /* assetModifiers */,
                typePredicate.parameterName,
                createTypeNode({type: typePredicate.type, node}),
              )
            : createTypeNode({type: returnType, node}),
          undefined /* body */,
        )
      })
    }

    function createTypeAliasDeclaration(options: {type: ts.Type; name: string; node?: ts.Node}): ts.Statement {
      const {type, name, node} = options

      return ts.factory.createTypeAliasDeclaration(
        undefined /* decorators */,
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        name,
        [] /* typeParameters */, // TODO figure out where it should come from
        createTypeNode({type, node, skipRef: true}),
      )
    }

    function createTypeNode(options: {type: ts.Type; node?: ts.Node; skipRef?: boolean}): ts.TypeNode {
      let {type} = options
      const {node, skipRef} = options

      if (checker.typeToString(type) === 'Selector<Selector>') {
        console.log(checker.typeToString(type), checker.typeToString(getReplacedType(type)))
      }

      type = getReplacedType(type)

      if (!skipRef) {
        if (isLibType(type) || isImportedType(type) || isExportedType(type) || isReferenceType(type)) {
          return createTypeReferenceNode({type, node})
        }
      }

      if (isPrimitiveType(type)) {
        return checker.typeToTypeNode(type, node, ts.NodeBuilderFlags.None)
      } else if (isTupleType(type)) {
        return createTupleTypeNode({type, node})
      } else if (isTypeLiteral(type)) {
        return createTypeLiteralNode({type, node})
      } else if (type.isIntersection()) {
        const origin = (<any>type).origin ?? type
        delete origin.origin
        if (!origin.isIntersection()) return createIntersectionTypeNode({type: origin, node})
        return createIntersectionTypeNode({type, node})
      } else if (type.isUnion()) {
        const origin = (<any>type).origin ?? type
        delete origin.origin
        if (!origin.isUnion()) return createTypeNode({type: origin, node})
        return createUnionTypeNode({type: origin, node})
      } else {
        return checker.typeToTypeNode(type, node, ts.NodeBuilderFlags.None)
      }
    }

    function createTypeReferenceNode(options: {type: ts.TypeReference; node?: ts.Node}): ts.TypeNode {
      const {type, node} = options
      const typeArguments = type.aliasTypeArguments ?? checker.getTypeArguments(type)
      return ts.factory.createTypeReferenceNode(
        getTypeName(type),
        typeArguments?.map(type => createTypeNode({type, node})),
      )
    }

    function createTypeLiteralNode(options: {type: ts.ObjectType; node?: ts.Node}): ts.TypeNode {
      const {type, node} = options

      const members = createMembers({type, node, isClass: false}) as ts.TypeElement[]

      if (members.length === 1) {
        const member = members[0]
        if (ts.isCallSignatureDeclaration(member)) {
          return ts.factory.createFunctionTypeNode(member.typeParameters, member.parameters, member.type)
        }
        if (ts.isConstructSignatureDeclaration(member)) {
          return ts.factory.createConstructorTypeNode(
            undefined /* modifiers */,
            member.typeParameters,
            member.parameters,
            member.type,
          )
        }
      }

      const typeNode = ts.factory.createTypeLiteralNode(members)
      if (members.length <= 4) ts.setEmitFlags(typeNode, ts.EmitFlags.SingleLine)

      return typeNode
    }

    function createTupleTypeNode(options: {type: ts.TupleTypeReference; node?: ts.Node}): ts.TypeNode {
      // TODO add support of named tuples
      const {type, node} = options
      const typeArguments = checker.getTypeArguments(type)
      const typeNode = ts.factory.createTupleTypeNode(typeArguments?.map(type => createTypeNode({type, node})))
      if (typeArguments.length < 6) ts.setEmitFlags(typeNode, ts.EmitFlags.SingleLine)
      return typeNode
    }

    function createIntersectionTypeNode(options: {type: ts.IntersectionType; node?: ts.Node}): ts.TypeNode {
      const {type, node} = options
      const typeNodes = []
      for (const typeItem of type.types) {
        const typeNode = createTypeNode({type: typeItem, node})
        if (ts.isTypeLiteralNode(typeNode) && typeNode.members.length === 0) continue
        typeNodes.push(typeNode)
      }
      return typeNodes.every(ts.isTypeLiteralNode)
        ? ts.factory.createTypeLiteralNode(typeNodes.flatMap(typeNode => typeNode.members))
        : ts.factory.createIntersectionTypeNode(typeNodes)
    }

    function createUnionTypeNode(options: {type: ts.UnionType; node?: ts.Node}): ts.TypeNode {
      const {type, node} = options
      const typeNodes = []
      for (let index = 0; index < type.types.length; ++index) {
        // if both boolean literals are in union replace with their base type - boolean
        // TODO the same could be done with enums
        if (isBooleanLiteralType(type.types[index]) && isBooleanLiteralType(type.types[index + 1])) {
          typeNodes.push(createTypeNode({type: checker.getBaseTypeOfLiteralType(type.types[index]), node}))
          index += 1
        } else {
          typeNodes.push(createTypeNode({type: type.types[index], node}))
        }
      }
      return ts.factory.createUnionTypeNode(typeNodes)
    }

    function createMembers(options: {
      type: ts.Type
      node?: ts.Node
      isClass?: boolean
    }): ts.TypeElement[] | ts.ClassElement[] {
      const {type, node, isClass} = options

      const members = []

      for (const info of checker.getIndexInfosOfType(type)) {
        members.push(createIndexDeclaration({info, node}))
      }

      for (const signature of type.getCallSignatures()) {
        members.push(createCallDeclaration({signature, node}))
      }

      for (const signature of type.getConstructSignatures()) {
        if (isHiddenDeclaration(signature.declaration)) continue
        members.push(createConstructorDeclaration({signature, node, isDeclaration: isClass}))
      }

      for (const symbol of type.getProperties()) {
        if (
          (isClass && symbol.getName() === 'prototype') ||
          isIgnoredBrandProperty(symbol.getName()) ||
          isHiddenDeclaration(symbol.declarations.at(-1))
        ) {
          continue
        }
        if (symbol.flags & ts.SymbolFlags.Method) {
          members.push(...createMethodDeclaration({symbol, node, isDeclaration: isClass}))
        } else if (symbol.flags & ts.SymbolFlags.Property) {
          members.push(createPropertyDeclaration({symbol, node, isDeclaration: isClass}))
        } else if (symbol.flags & ts.SymbolFlags.Accessor) {
          if (symbol.flags & ts.SymbolFlags.GetAccessor) members.push(createGetAccessorDeclaration({symbol, node}))
          if (symbol.flags & ts.SymbolFlags.SetAccessor) members.push(createSetAccessorDeclaration({symbol, node}))
        }
      }

      if (isClass && type.getProperty('prototype')) {
        const prototypeMembers = createMembers({
          type: checker.getTypeOfSymbolAtLocation(type.getProperty('prototype'), node),
          node,
          isClass,
        })
        members.push(...prototypeMembers)
      }

      return members as any
    }

    function createTypeParameterDeclaration(options: {
      typeParameter: ts.TypeParameter
      node?: ts.Node
    }): ts.TypeParameterDeclaration {
      const {typeParameter, node} = options
      return checker.typeParameterToDeclaration(typeParameter, node, ts.NodeBuilderFlags.None)
    }

    function createParameterDeclaration(options: {symbol: ts.Symbol; node?: ts.Node}): ts.ParameterDeclaration {
      const {symbol, node} = options
      const type = checker.getTypeOfSymbolAtLocation(symbol, node)
      const name = symbol.getName()
      const isRest = Boolean(symbol.checkFlags & ts.CheckFlags.RestParameter)
      const isOptional = Boolean(symbol.checkFlags & ts.CheckFlags.RestParameter)

      return ts.factory.createParameterDeclaration(
        undefined /* decorators */,
        undefined /* modifiers */,
        isRest ? ts.factory.createToken(ts.SyntaxKind.DotDotDotToken) : undefined,
        name,
        isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
        createTypeNode({type, node}),
        undefined /* initializer */,
      )
    }

    function createCallDeclaration(options: {signature: ts.Signature; node?: ts.Node}): ts.CallSignatureDeclaration {
      const {signature, node} = options
      const typeParameters = signature
        .getTypeParameters()
        ?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node}))
      const parameters = signature.getParameters()?.map(symbol => createParameterDeclaration({symbol, node}))
      const typePredicate = checker.getTypePredicateOfSignature(signature)
      const returnType = typePredicate
        ? ts.factory.createTypePredicateNode(
            undefined /* assetModifiers */,
            typePredicate.parameterName,
            createTypeNode({type: typePredicate.type, node}),
          )
        : createTypeNode({type: signature.getReturnType(), node})

      return ts.factory.createCallSignature(typeParameters, parameters, returnType)
    }

    function createIndexDeclaration(options: {info: ts.IndexInfo; node?: ts.Node}): ts.IndexSignatureDeclaration {
      const {info, node} = options
      return ts.factory.createIndexSignature(
        undefined /* decorators */,
        info.declaration.modifiers,
        info.declaration.parameters, // TODO construct own parameters object
        createTypeNode({type: info.type, node}),
      )
    }

    function createConstructorDeclaration(options: {
      signature: ts.Signature
      node?: ts.Node
      isDeclaration?: boolean
    }): ts.ConstructorDeclaration | ts.ConstructSignatureDeclaration {
      const {signature, node, isDeclaration} = options
      const modifiers = signature.declaration.modifiers
      const typeParameters = signature
        .getTypeParameters()
        ?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node}))
      const parameters = signature.getParameters()?.map(symbol => createParameterDeclaration({symbol, node}))
      const typePredicate = checker.getTypePredicateOfSignature(signature)
      const returnType = typePredicate
        ? ts.factory.createTypePredicateNode(
            undefined /* assetModifiers */,
            typePredicate.parameterName,
            createTypeNode({type: typePredicate.type, node}),
          )
        : createTypeNode({type: signature.getReturnType(), node})

      return isDeclaration
        ? ts.factory.createConstructorDeclaration(
            undefined /* decorators */,
            modifiers,
            parameters,
            undefined /* body */,
          )
        : ts.factory.createConstructSignature(typeParameters, parameters, returnType)
    }

    function createPropertyDeclaration(options: {
      symbol: ts.Symbol
      node?: ts.Node
      isDeclaration?: boolean
    }): ts.PropertyDeclaration | ts.PropertySignature {
      const {symbol, node, isDeclaration} = options
      const modifiers = symbol.declarations.at(-1).modifiers
      const propertyName = isQuotedProperty(symbol.getName())
        ? ts.factory.createStringLiteral(symbol.getName(), true /* isSingleQuoted */)
        : symbol.getName()
      const optionalToken = isOptional(symbol) ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined
      const type = createTypeNode({type: checker.getTypeOfSymbolAtLocation(symbol, node), node})

      const property = isDeclaration
        ? ts.factory.createPropertyDeclaration(
            undefined /* decorators */,
            modifiers,
            propertyName,
            optionalToken,
            type,
            undefined /* initializer */,
          )
        : ts.factory.createPropertySignature(modifiers, propertyName, optionalToken, type)
      return property
    }

    function createGetAccessorDeclaration(options: {symbol: ts.Symbol; node?: ts.Node}): ts.GetAccessorDeclaration {
      const {symbol, node} = options
      const modifiers = symbol.declarations.at(-1).modifiers
      const accessorName = isQuotedProperty(symbol.getName())
        ? ts.factory.createStringLiteral(symbol.getName(), true /* isSingleQuoted */)
        : symbol.getName()
      const type = createTypeNode({type: checker.getTypeOfSymbolAtLocation(symbol, node), node})
      return ts.factory.createGetAccessorDeclaration(
        undefined /* decorators */,
        modifiers,
        accessorName,
        [] /* parameters */,
        type,
        undefined /* body */,
      )
    }

    function createSetAccessorDeclaration(options: {symbol: ts.Symbol; node?: ts.Node}): ts.SetAccessorDeclaration {
      const {symbol, node} = options
      const modifiers = symbol.declarations.at(-1).modifiers
      const accessorName = isQuotedProperty(symbol.getName())
        ? ts.factory.createStringLiteral(symbol.getName(), true /* isSingleQuoted */)
        : symbol.getName()

      return ts.factory.createSetAccessorDeclaration(
        undefined /* decorators */,
        modifiers,
        accessorName,
        [createParameterDeclaration({symbol, node})],
        undefined /* body */,
      )
    }

    function createMethodDeclaration(options: {
      symbol: ts.Symbol
      node?: ts.Node
      isDeclaration?: boolean
    }): ts.MethodDeclaration[] | ts.MethodSignature[] {
      const {symbol, node, isDeclaration} = options
      const type = checker.getTypeOfSymbolAtLocation(symbol, node)
      const modifiers = symbol.declarations.at(-1).modifiers
      const methodName = isQuotedProperty(symbol.getName())
        ? ts.factory.createStringLiteral(symbol.getName(), true /* isSingleQuoted */)
        : symbol.getName()
      const optionalToken = isOptional(symbol) ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined

      const overloads: any = type.getCallSignatures().map(signature => {
        const typeParameters = signature
          .getTypeParameters()
          ?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node}))
        const parameters = signature.getParameters()?.map(symbol => createParameterDeclaration({symbol, node}))
        const typePredicate = checker.getTypePredicateOfSignature(signature)
        const returnType = typePredicate
          ? ts.factory.createTypePredicateNode(
              undefined /* assetModifiers */,
              typePredicate.parameterName,
              createTypeNode({type: typePredicate.type, node}),
            )
          : createTypeNode({type: signature.getReturnType(), node})

        return isDeclaration
          ? ts.factory.createMethodDeclaration(
              undefined /* decorators */,
              modifiers /* modifiers */,
              undefined /* asteriskToken */,
              methodName,
              optionalToken,
              typeParameters,
              parameters,
              returnType,
              undefined /* body */,
            )
          : ts.factory.createMethodSignature(
              modifiers,
              methodName,
              optionalToken,
              typeParameters,
              parameters,
              returnType,
            )
      })
      return overloads
    }
  }
}
