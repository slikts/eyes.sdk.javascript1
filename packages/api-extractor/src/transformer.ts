import './typescript-internals'

import * as ts from 'typescript'
import * as path from 'path'

// TODO handle missed rootDir, outDir, declarationDir
interface TransformerConfig {
  rootFile?: string
  allowModules?: string[]
  allowGlobalNamespaces?: string[]
  ignoreBrands?: string[]
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

  const externalModules = config?.allowModules?.reduce((externalModules, moduleName) => {
    const moduleCache = moduleResolutionCache.getOrCreateCacheForModuleName(moduleName, undefined)
    if (!moduleCache) return externalModules
    const {resolvedModule} = moduleCache.get(undefined)
    const resolvedDir = resolvedModule.resolvedFileName.replace(`/${resolvedModule.packageId.subModuleName}`, '')
    externalModules[resolvedModule.packageId.name] = {
      name: resolvedModule.packageId.name.replace(/^@types\//, ''),
      resolvedDir,
    }
    return externalModules
  }, {} as Record<string, {name: string; resolvedDir: string}>)

  return function transformerFactory(context) {
    const host = context.getEmitHost()
    host.isEmitBlocked = emitFileName => emitFileName.endsWith('.d.ts') && emitFileName !== declarationFileName

    const imports = new Map<ts.Symbol, ts.ImportDeclaration>()
    const exports = new Map<ts.Symbol, ts.Statement | ts.Statement[]>()
    const names = new Set<string>()
    const assignments = new Map<ts.Symbol, ts.Statement[]>()

    return function transformSourceFile(sourceFile: ts.SourceFile): ts.SourceFile {
      if (sourceFile.fileName !== rootFileName) return sourceFile
      const module = checker.getSymbolAtLocation(sourceFile)

      for (const symbol of checker.getExportsOfModule(module)) {
        exports.set(symbol, null)
        names.add(symbol.getName())
      }

      for (const symbol of checker.getExportsOfModule(module)) {
        const name = symbol.getName()
        const type = checker.getTypeOfSymbolAtLocation(symbol, sourceFile)

        // TODO check what name will be in case of export assignment
        if (name === 'default' /* `export default` or `export =` */) {
          assignments.set(symbol, createExportDefault({type, node: symbol.valueDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.Function /* `export function` */) {
          exports.set(symbol, createFunctionDeclaration({type, name, node: symbol.valueDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.TypeAlias /* `export type` */) {
          exports.set(symbol, createTypeAliasDeclaration({symbol, name, node: symbol.declarations[0]}))
        } else if (symbol.flags & ts.SymbolFlags.Class /* `export class` */) {
          // TODO createClassDeclaration
        } else if (symbol.flags & ts.SymbolFlags.Interface /* `export interface` */) {
          // TODO createInterfaceDeclaration
        } else if (symbol.flags & ts.SymbolFlags.Variable /* `export const` or `export let` or `export var` */) {
          // TODO createVariableDeclaration
        }
      }
      const statements = [...imports.values(), ...exports.values(), ...assignments.values()].flat().filter(s => s)

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
        return Object.values(externalModules).some((module: any) => moduleFile.fileName.startsWith(module.resolvedDir))
      } else if (symbol.flags & ts.SymbolFlags.NamespaceModule) {
        const namespaceName = symbol.getName()
        return Boolean(config?.allowGlobalNamespaces?.includes(namespaceName))
      } else {
        return false
      }
    }

    function isExportedType(type: ts.Type): type is ts.TypeReference {
      const symbol = type.aliasSymbol ?? type.symbol
      if (!symbol) return false
      return exports.has(symbol)
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

    function getKnownModuleName(sourceFile: ts.SourceFile): string {
      const knownModule: any = Object.values(externalModules).find((module: any) =>
        sourceFile.fileName.startsWith(module.resolvedDir),
      )
      return knownModule?.name ?? path.relative(process.cwd(), sourceFile.fileName)
    }

    function getTypeName(type: ts.Type): string {
      const chunks = []
      let symbol = type.aliasSymbol ?? type.symbol
      while (symbol) {
        if (symbol.getName() === '__global') break
        const name =
          symbol.flags & ts.SymbolFlags.ValueModule
            ? `import('${getKnownModuleName(symbol.valueDeclaration as ts.SourceFile)}')`
            : symbol.getName()
        chunks.unshift(name)
        if (exports.has(symbol)) break
        symbol = symbol.parent
      }
      if (!exports.has(symbol) && names.has(chunks[0])) {
        chunks.unshift('globalThis')
      }
      return chunks.join('.')
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

    function createTypeAliasDeclaration(options: {symbol: ts.Symbol; name: string; node?: ts.Node}): ts.Statement {
      const {symbol, name, node} = options
      const type = checker.getDeclaredTypeOfSymbol(symbol)
      return ts.factory.createTypeAliasDeclaration(
        undefined /* decorators */,
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        name,
        [],
        createTypeNode({type, node, skipRef: true}),
      )
    }

    function createTypeNode(options: {type: ts.Type; node?: ts.Node; skipRef?: boolean}): ts.TypeNode {
      const {type, node, skipRef} = options

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
      return ts.factory.createTypeReferenceNode(
        getTypeName(type),
        checker.getTypeArguments(type)?.map(type => createTypeNode({type, node})),
      )
    }

    function createTypeLiteralNode(options: {type: ts.ObjectType; node?: ts.Node}): ts.TypeNode {
      const {type, node} = options

      const properties = type.getProperties()
      const callSignatures = type.getCallSignatures()
      const constructSignatures = type.getConstructSignatures()

      if (callSignatures.length === 1 && properties.length === 0 && constructSignatures.length === 0) {
        const [signature] = callSignatures
        const typeParameters = signature.getTypeParameters()
        const parameters = signature.getParameters()
        const returnType = signature.getReturnType()
        const typePredicate = checker.getTypePredicateOfSignature(signature)
        return ts.factory.createFunctionTypeNode(
          typeParameters?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node})),
          parameters?.map(symbol => createParameterDeclaration({symbol, node})),
          typePredicate
            ? ts.factory.createTypePredicateNode(
                undefined /* assetModifiers */,
                typePredicate.parameterName,
                createTypeNode({type: typePredicate.type, node}),
              )
            : createTypeNode({type: returnType, node}),
        )
      }

      if (constructSignatures.length === 1 && properties.length === 0 && callSignatures.length === 0) {
        const [signature] = callSignatures
        const typeParameters = signature.getTypeParameters()
        const parameters = signature.getParameters()
        const returnType = signature.getReturnType()
        const typePredicate = checker.getTypePredicateOfSignature(signature)
        return ts.factory.createConstructorTypeNode(
          undefined /* modifiers */,
          typeParameters?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node})),
          parameters?.map(symbol => createParameterDeclaration({symbol, node})),
          typePredicate
            ? ts.factory.createTypePredicateNode(
                undefined /* assetModifiers */,
                typePredicate.parameterName,
                createTypeNode({type: typePredicate.type, node}),
              )
            : createTypeNode({type: returnType, node}),
        )
      }

      const propertyMembers = properties.flatMap(symbol => {
        const name = symbol.getName()
        if (isIgnoredBrandProperty(name)) return []
        const type = checker.getTypeOfSymbolAtLocation(symbol, node)
        const isOptional = Boolean(symbol.flags & ts.SymbolFlags.Optional)
        if (symbol.flags & ts.SymbolFlags.Method) {
          return type.getCallSignatures().map(signature => {
            const typeParameters = signature.getTypeParameters()
            const parameters = signature.getParameters()
            const returnType = signature.getReturnType()
            const typePredicate = checker.getTypePredicateOfSignature(signature)

            return ts.factory.createMethodSignature(
              undefined /* modifiers */,
              isQuotedProperty(name) ? ts.factory.createStringLiteral(name, true /* isSingleQuoted */) : name,
              isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
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
            )
          })
        } else if (symbol.flags & ts.SymbolFlags.Property) {
          return ts.factory.createPropertySignature(
            undefined /* modifiers */,
            isQuotedProperty(name) ? ts.factory.createStringLiteral(name, true /* isSingleQuoted */) : name,
            isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
            createTypeNode({type, node}),
          )
        } else if (symbol.flags & ts.SymbolFlags.Accessor) {
          // TODO handle accessors
          return null as ts.TypeElement
        }
      })

      const callSignatureMembers = callSignatures.map(signature => {
        const typeParameters = signature.getTypeParameters()
        const parameters = signature.getParameters()
        const returnType = signature.getReturnType()
        const typePredicate = checker.getTypePredicateOfSignature(signature)
        return ts.factory.createCallSignature(
          typeParameters?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node})),
          parameters?.map(symbol => createParameterDeclaration({symbol, node})),
          typePredicate
            ? ts.factory.createTypePredicateNode(
                undefined /* assetModifiers */,
                typePredicate.parameterName,
                createTypeNode({type: typePredicate.type, node}),
              )
            : createTypeNode({type: returnType, node}),
        )
      })

      const members = [...callSignatureMembers, ...propertyMembers]

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
      const typeNodes = type.types
        .map(type => createTypeNode({type, node}))
        .filter(typeNode => {
          return !ts.isTypeLiteralNode(typeNode) || typeNode.members.length > 0
        })

      return typeNodes.length === 1 ? typeNodes[0] : ts.factory.createIntersectionTypeNode(typeNodes)
    }

    function createUnionTypeNode(options: {type: ts.UnionType; node?: ts.Node}): ts.TypeNode {
      const {type, node} = options
      return ts.factory.createUnionTypeNode(type.types.map(type => createTypeNode({type, node})))
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
  }
}
