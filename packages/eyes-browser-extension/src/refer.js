import * as utils from '@applitools/utils'

export function makeRefer() {
  const store = new Map()

  return {ref, deref}

  function ref(value) {
    if (value instanceof HTMLElement) {
      const elementId = utils.general.guid()
      store.set(elementId, value)
      return {elementId}
    } else if (utils.types.isArray(value)) {
      return value.map(ref)
    } else if (utils.types.isObject(value)) {
      return Object.entries(value).reduce((obj, [key, value]) => Object.assign(obj, {[key]: ref(value)}), {})
    } else {
      return value
    }
  }

  function deref(value) {
    if (utils.types.has(value, 'elementId')) {
      const element = store.get(value.elementId)
      if (!element || !element.isConnected) {
        const error = new Error('The referenced web element is no longer attached to the DOM')
        error.name = 'StaleElementReferenceError'
        throw error
      }
      return element
    } else if (utils.types.isArray(value)) {
      return value.map(deref)
    } else if (utils.types.isObject(value)) {
      return Object.entries(value).reduce((obj, [key, value]) => Object.assign(obj, {[key]: deref(value)}), {})
    } else {
      return value
    }
  }
}
