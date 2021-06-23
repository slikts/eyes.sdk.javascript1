import * as utils from '@applitools/utils'

function sendMessage(name, payload) {
  const key = utils.general.guid()
  window.postMessage({name, key, payload, isAPI: true}, '*')
  return new Promise((resolve, reject) => {
    window.addEventListener('message', handler)
    function handler({data}) {
      if (!data.isContent) return
      if (data.name === name && data.key === key) {
        if (data.payload.error) reject(data.payload.error)
        else resolve(data.payload.result)
        window.removeEventListener('message', handler)
      }
    }
  })
}

class Core {
  async makeManager(config) {
    const manager = await sendMessage('Core.makeManager', config)
    return new EyesManager({manager})
  }
  async getViewportSize() {
    return sendMessage('Core.getViewportSize')
  }
  async setViewportSize(options) {
    return sendMessage('Core.setViewportSize', options)
  }
  async closeBatches(options) {
    return sendMessage('Core.closeBatches', options)
  }
  async deleteTest(options) {
    return sendMessage('Core.deleteTest', options)
  }
}

class EyesManager {
  constructor({manager}) {
    this._manager = manager
  }
  async makeEyes(options) {
    const eyes = await sendMessage('EyesManager.makeEyes', {manager: this._manager, ...options})
    return new Eyes({eyes})
  }
  async closeAllEyes() {
    return sendMessage('EyesManager.closeAllEyes', {manager: this._manager})
  }
}

class Eyes {
  constructor({eyes}) {
    this._eyes = eyes
  }
  async check(options) {
    return sendMessage('Eyes.check', {eyes: this._eyes, ...options})
  }
  async locate(options) {
    return sendMessage('Eyes.locate', {eyes: this._eyes, ...options})
  }
  async extractText(options) {
    return sendMessage('Eyes.extractText', {eyes: this._eyes, ...options})
  }
  async extractTextRegions(options) {
    return sendMessage('Eyes.extractTextRegions', {eyes: this._eyes, ...options})
  }
  async close() {
    return sendMessage('Eyes.close', {eyes: this._eyes})
  }
  async abort() {
    return sendMessage('Eyes.abort', {eyes: this._eyes})
  }
}

window.__applitools = new Core()
