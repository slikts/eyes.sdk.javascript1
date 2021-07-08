import browser from 'webextension-polyfill'
import {makeRefer} from './refer'
import {makeMessenger} from './messenger'
import {unmark} from './marker'

const apiScript = document.createElement('script')
apiScript.src = browser.runtime.getURL('api.js')
window.document.body.appendChild(apiScript)

window.refer = makeRefer({
  check: element => element instanceof HTMLElement,
  validate: element => {
    if (!element || !element.isConnected) {
      const error = new Error('The referenced web element is no longer attached to the DOM')
      error.name = 'StaleElementReferenceError'
      throw error
    }
  }
})

const apiMessenger = makeMessenger({
  onMessage: fn => window.addEventListener('applitools-message', ({detail}) => fn(unmark(detail))),
  sendMessage: detail => window.dispatchEvent(new CustomEvent('applitools-message', {detail}))
})
const frameMessenger = makeMessenger({
  onMessage: fn => window.addEventListener('applitools-frame-message', ({detail}) => fn(detail)),
  sendMessage: detail => window.dispatchEvent(new CustomEvent('applitools-frame-message', {detail}))
})
const backgroundMessenger = makeMessenger({
  onMessage: fn => browser.runtime.onMessage.addListener(message => fn(message)),
  sendMessage: message => browser.runtime.sendMessage(message)
})

// NOTE: Listen for commands from page/api script.
// This is required because user API cannot directly communicate with background script
apiMessenger.command(async (name, payload) => backgroundMessenger.request(name, payload))

// NOTE: Listen for one single command triggered from childContext in spec driver
// This is a workaround to get frameId of cross origin iframe
frameMessenger.on('*', (_, type) => backgroundMessenger.emit(type))
