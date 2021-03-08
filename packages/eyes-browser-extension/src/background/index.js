const browser = require('webextension-polyfill')
process.hrtime = require('browser-process-hrtime')
const {EyesSDK} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
const {version} = require('../../package.json')

async function executeScript(script, args) {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true
  })
  const {id: activeTab} = tabs[0]
  const result = await browser.tabs.sendMessage(
    activeTab,
    {
      direction: 'from-background-script',
      command: 'executeScript',
      script, 
      args
    }
  )
  return result
}

const {EyesFactory: Eyes} = EyesSDK({
  name: 'eyes.browser-extension',
  version,
  spec: {
    isDriver: () => true,
    executeScript,
  },
  VisualGridClient,
})

const eyes = {}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.direction === 'from-page' && message.id) {
    switch (message.command) {
      case 'executeScriptRoundTrip':
        executeScript(message.script, message.args).then(result => {
          return sendResponse({
            direction: 'from-background-script',
            id: message.id,
            result,
          })
        })
        return true
      case 'ping':
        const result = {result: 'pong', direction: 'from-background-script', id: message.id}
        return sendResponse(result)
      case 'open':
        const eyesId = uuidv4()
        eyes[eyesId] = new Eyes()
        eyes.open({}, message.params.appName, message.params.testName).then(result => {
          return sendResponse({
            direction: 'from-background-script',
            id: message.id,
            result: eyesId,
          })
        })
        return true
        // NOTE:
        // There's a weird API in browser extensions when dealing w/ async
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#sending_an_asynchronous_response_using_sendresponse
    }
  }
})
