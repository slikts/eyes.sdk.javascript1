const browser = require('webextension-polyfill')
process.hrtime = require('browser-process-hrtime')
const {EyesSDK} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
const {version} = require('../../package.json')
const {EyesFactory: Eyes} = EyesSDK({
  name: 'eyes.browser-extension',
  version,
  spec: {},
  VisualGridClient,
})
//const eyes = new Eyes()

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.direction === 'from-page' && message.command === 'ping') {
    const r = {result: 'pong', ...message}
    console.log(`background script: ${JSON.stringify(r)}`)
    return sendResponse(r)
  }
})
