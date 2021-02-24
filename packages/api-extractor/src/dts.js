const ts = require('typescript')
const {ReflectionKind} = require('typedoc')

function dts(prj, context) {
  const exports = prj.children.reduce((exports, child) => {
    if (child.kind === ReflectionKind.Class) {
      return exports.concat(`export ${$class(child)}`)
    } else if (child.kind === ReflectionKind.Interface) {
      return exports.concat(`export ${$interface(child)}`)
    } else if (child.kind === ReflectionKind.TypeAlias) {
      return exports.concat(`export ${$typedef(child)}`)
    } else if (child.kind === ReflectionKind.Enum) {
      return exports.concat(`export ${$enum(child)}`)
    } else if (child.kind === ReflectionKind.Function) {
      return exports.concat($function(child).map(signature => `export ${signature}`).join('\n'))
    } else if (child.kind === ReflectionKind.Variable) {
      return exports.concat(`export ${$variable(child)}`)
    } else {
      return exports
    }
  }, [])

  return exports.join('\n\n')

  function $variable(node) {
    return `const ${node.name}: ${$type(node.type)}`
  }

  function $enum(node) {
    const members = node.children.map(member => `${member.name} ${member.defaultValue ? `= ${member.defaultValue}` : ''}`)
    return `enum ${node.name} {${members.join(', ')}}`
  }

  function $class(node) {
    const extendedType = node.extendedTypes ? $type(node.extendedTypes[0]) : null
    const extendsExpression = extendedType && !extendedType.unknown ? `extends ${extendedType}` : ''
    const implementedTypes = node.implementedTypes ? node.implementedTypes.map(type => $type(type)).filter(type => !type.unknown) : []
    const implementsExpression = implementedTypes.length > 0 ? `implements ${implementedTypes.join(', ')}` : ''

    const members = node.children.reduce((members, member) => {
      if (member.kind === ReflectionKind.Constructor) return members.concat($constructor(member))
      else if (member.kind === ReflectionKind.Property) return members.concat($property(member))
      else if (member.kind === ReflectionKind.Accessor) return members.concat($accessor(member))
      else if (member.kind === ReflectionKind.Method) return members.concat($method(member))
      else members
    }, [])

    return `class ${node.name}${$generics(node)} ${extendsExpression} ${implementsExpression} {${members.join('\n')}}`
  }

  function $interface(node) {
    const extended = node.extendedTypes ? `extends ${node.implementedTypes.map(type).join(', ')}` : ''

    const members = node.children.reduce((members, member) => {
      if (member.kindString === 'Constructor') return members.concat($constructor(member))
      else if (member.kindString === 'Property') return members.concat($property(member))
      else if (member.kindString === 'Accessor') return members.concat($accessor(member))
      else if (member.kindString === 'Method') return members.concat($method(member))
      else members
    }, [])

    return `interface ${node.name}${$generics(node)} ${extended} {${members.join('\n')}}`
  }

  function $typedef(node) {
    return `type ${node.name}${$generics(node)} = ${$type(node.type)}`
  }

  function $function(node) {
    return node.signatures.map(signature => {
      return `function ${node.name}${$generics(signature)}${$arguments(signature)}: ${$type(signature.type)}`
    })
  }

  function $constructor(node) {
    return node.signatures.map(signature => {
      if (signature.name === 'new __type') {
        return `new ${$arguments(signature)}: ${$type(signature.type)}`
      } else {
        return `${$flags(signature)} constructor${$arguments(signature)}`
      }
    })
  }

  function $accessor(node) {
    const signatures = []
    if (node.getSignature) {
      signatures.push(`${$flags(node.getSignature.flags)} get ${node.name}(): ${$type(node.getSignature.type)}`)
    }
    if (node.setSignature) {
      signatures.push(`${$flags(node.setSignature.flags)} set ${node.name}${$arguments(node.setSignature)}`)
    }
    return signatures
  }

  function $method(node, parent) {
    const signatures = node.signatures || node.type.declaration.signatures

    function spreadType(type, parent) {
      const parsedType = $type(type, parent)
      return parsedType.type === 'union'
        ? parsedType.types.reduce((types, type) => types.concat(spreadType(type, parsedType)), [])
        : [parsedType]
    }

    return signatures
      .reduce((signatures, signature) => {
        if (!signature.parameters || signature.parameters.length === 0) return signatures.concat(signature)

        const params = signature.parameters
          .map(param => {
            const paramTypes = spreadType(param.type, parent)

            return paramTypes.map(type => ({...param, type}))
          })
          .reduce((paramsA, paramsB) => {
            return paramsA.reduce((params, paramA) => params.concat(paramsB.map(paramB => [].concat(paramA, paramB))), [])
          })
          .map(params => {
            return Array.isArray(params) ? params : [params]
          })

        return signatures.concat(params.map(parameters => ({...signature, parameters})))
      }, [])
      .map(signature => {
        return `${$flags(node.flags)} ${node.name}${$generics(signature)}${$arguments(signature, parent)}: ${$type(signature.type, parent)}`
      })
  }

  function $property(node, parent) {
    const type = $type(node.type, parent)
    if (type.type === 'reflection' && type.declaration.signatures) return $method(node, parent)
    return `${$flags(node.flags)} ${node.name}${node.flags.isOptional ? '?' : ''}: ${type}`
  }

  function $flags(flags) {
    return [
      flags.isPrivate ? 'private' : '',
      flags.isProtected ? 'protected' : '',
      flags.isAbstract ? 'abstract' : '',
      flags.isStatic ? 'static' : '',
      flags.isReadonly ? 'readonly' : '',
    ].filter(flag => Boolean(flag)).join(' ')
  }

  function $generics(node) {
    const generics = node.typeParameter || node.typeParameters
    if (!generics) return ''

    const types = generics.map(param => {
      return `${param.name} ${param.type ? `extends ${$type(param.type)}` : ''} ${param.default ? `= ${$type(param.default)}` : ''}`
    })

    return `<${types.join(', ')}>`
  }

  function $arguments(node, parent) {
    if (!node.parameters) return '()'

    const args = node.parameters.map(param => {
      return `${param.flags.isRest ? '...' : ''}${param.name}${param.flags.isOptional ? '?' : ''}: ${$type(param.type, parent)}`
    })

    return `(${args.join(', ')})`
  }

  function $type(type, parent = {}) {
    const state = {_type: type, replacer: type.replacer || parent.replacer, toString}

    if (state.replacer) {
      const replacedType = state.replacer(state._type)
      if (replacedType) {
        state._type = replacedType
        state.replacer = null
      }
    }

    if (state._type.type === 'reference' && !state._type.reflection) {
      const {unknown, type, replacer} = convertType(state)
      if (unknown) {
        state.unknown = unknown
      } else {
        if (type) state._type = type
        if (replacer) state.replacer = replacer
      }
    }

    return new Proxy(state._type, {
      get(target, key) {
        if (key in state) return Reflect.get(state, key)
        return Reflect.get(target, key)
      },
    })

    function convertType(state) {
      const target = state._type._target
      const typeArguments = state._type.typeArguments
      const declaration = target.declarations.find(decl => decl.kind === ts.SyntaxKind.TypeAliasDeclaration)
      if (!declaration) return {unknown: true}
      if (declaration.parent.path.includes('node_modules/typescript')) return {builtin: true}
      const originalReplacer = state.replacer
      const newReplacer =
        declaration.typeParameters && declaration.typeParameters.length > 0
          ? type => typeArguments.find((_, index) => type.name === declaration.typeParameters[index].name.escapedText)
          : null

      return {
        type: context.converter.convertType(context, declaration.type),
        replacer(type) {
          const replacedType = newReplacer && newReplacer(type)
          return originalReplacer ? originalReplacer(replacedType || type) : replacedType
        },
      }
    }

    function toString() {
      if (state._type.type === 'literal') return `${JSON.stringify(state._type.value)}`
      if (state._type.type === 'array') return `(${$type(state._type.elementType, state)})[]`
      if (state._type.type === 'intersection') return `(${state._type.types.map(type => $type(type, state)).join('&')})`
      if (state._type.type === 'union') return `(${state._type.types.map(type => $type(type, state)).join('|')})`
      if (state._type.type === 'reflection') {
        const parts = []
        if (state._type.declaration.children) {
          const members = state._type.declaration.children.reduce((members, member) => {
            if (member.kind === ReflectionKind.Property) return members.concat($property(member, state))
            else if (member.kind === ReflectionKind.Accessor) return members.concat($accessor(member, state))
            else if (member.kind === ReflectionKind.Method) return members.concat($method(member, state))
            else if (member.kind === ReflectionKind.Constructor) return members.concat($constructor(member, state))
          }, [])
          parts.push(...members)
        }
        if (state._type.declaration.signatures) {
          const signatures = state._type.declaration.signatures.map(signature => {
            return `${$arguments(signature, state)}: ${$type(signature.type, state)}`
          })
          parts.push(...signatures)
        }
        if (state._type.declaration.indexSignature) {
          const signature = state._type.declaration.indexSignature
          parts.push(
            `[${signature.parameters[0].name}: ${signature.parameters[0].type}]: ${$type(signature.type, state)}`,
          )
        }
        return `{${parts.join('; ')}}`
      }

      const name = state._type.reflection ? state._type.reflection.name : state._type.name

      if (state._type.typeArguments && state._type.typeArguments.length > 0) {
        return `${name}<${state._type.typeArguments.map(type => $type(type, state)).join(', ')}>`
      } else {
        return name
      }
    }
  }
}

module.exports = dts
