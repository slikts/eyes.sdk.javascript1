import * as utils from '@applitools/utils'

const REF_ID = 'applitools-ref-id'

export function makeRefer({check = () => true, validate = () => {}} = {}) {
  const store = new Map()

  return {isRef, ref, deref}

  function isRef(ref) {
    return utils.types.has(ref, REF_ID)
  }

  function ref(value) {
    if (check(value)) {
      const refId = utils.general.guid()
      store.set(refId, value)
      return {[REF_ID]: refId}
    } else if (utils.types.isArray(value)) {
      return value.map(ref)
    } else if (utils.types.isObject(value)) {
      return Object.entries(value).reduce((obj, [key, value]) => Object.assign(obj, {[key]: ref(value)}), {})
    } else {
      return value
    }
  }

  function deref(ref) {
    if (isRef(ref)) {
      const value = store.get(ref[REF_ID])
      validate(value)
      return value
    } else if (utils.types.isArray(ref)) {
      return ref.map(deref)
    } else if (utils.types.isObject(ref)) {
      return Object.entries(ref).reduce((obj, [key, ref]) => Object.assign(obj, {[key]: deref(ref)}), {})
    } else {
      return ref
    }
  }
}
