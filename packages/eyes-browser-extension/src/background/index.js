const browser = require('webextension-polyfill')
process.hrtime = require('browser-process-hrtime')
const {EyesSDK} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
const {version} = require('../../package.json')
const {EyesFactory: Eyes} = EyesSDK({
  name: 'eyes.browser-extension',
  version,
  spec: {
    isDriver: () => true,
    executeScript: () => {
      // TODO: call to executeScript in page
    },
  },
  VisualGridClient,
})

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.direction === 'from-page' && message.id) {
    switch (message.command) {
      case 'ping':
        const result = {result: 'pong', direction: 'from-background-script', id: message.id}
        console.log(`background script: ${JSON.stringify(result)}`)
        return sendResponse(result)
      case 'open':
        console.log('HEY')
        console.log(message)
        const eyes = new Eyes()
        const driver = {}
        eyes.open(driver, message.params.appName, message.params.testName).then(result => {
          return sendResponse({
            direction: 'from-background-script',
            id: message.id,
            result,
          })
        })
        return true
        // NOTE:
        // There's a weird API in browser extensions when dealing w/ async
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#sending_an_asynchronous_response_using_sendresponse
    }
  }
})
