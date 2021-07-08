import {makeMessenger} from './messenger'
import {mark} from './marker'

const messenger = makeMessenger({
  onMessage: fn => window.addEventListener('applitools-message', ({detail}) => fn(detail)),
  sendMessage: detail => window.dispatchEvent(new CustomEvent('applitools-message', {detail: mark(detail)}))
})

class Core {
  async makeEyes(config) {
    const eyes = await messenger.request('Core.makeEyes', config)
    return new Eyes({eyes})
  }
  async makeManager(config) {
    const manager = await messenger.request('Core.makeManager', config)
    return new EyesManager({manager})
  }
  async getViewportSize() {
    return messenger.request('Core.getViewportSize')
  }
  async setViewportSize(options) {
    return messenger.request('Core.setViewportSize', options)
  }
  async closeBatches(options) {
    return messenger.request('Core.closeBatches', options)
  }
  async deleteTest(options) {
    return messenger.request('Core.deleteTest', options)
  }
}

class EyesManager {
  constructor({manager}) {
    this._manager = manager
  }
  async makeEyes(options) {
    const eyes = await messenger.request('EyesManager.makeEyes', {manager: this._manager, ...options})
    return new Eyes({eyes})
  }
  async closeAllEyes() {
    return messenger.request('EyesManager.closeAllEyes', {manager: this._manager})
  }
}

class Eyes {
  constructor({eyes}) {
    this._eyes = eyes
  }
  async check(options) {
    return messenger.request('Eyes.check', {eyes: this._eyes, ...options})
  }
  async locate(options) {
    return messenger.request('Eyes.locate', {eyes: this._eyes, ...options})
  }
  async extractText(options) {
    return messenger.request('Eyes.extractText', {eyes: this._eyes, ...options})
  }
  async extractTextRegions(options) {
    return messenger.request('Eyes.extractTextRegions', {eyes: this._eyes, ...options})
  }
  async close() {
    return messenger.request('Eyes.close', {eyes: this._eyes})
  }
  async abort() {
    return messenger.request('Eyes.abort', {eyes: this._eyes})
  }
}

window.__applitools = new Core()
