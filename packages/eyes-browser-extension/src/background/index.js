const browser = require('webextension-polyfill')
process.hrtime = require('browser-process-hrtime')
const {EyesSDK, Logger, VisualGridRunner} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
const {version} = require('../../package.json')
const {v4: uuidv4} = require('uuid')

async function executeScript(_driver, script, args) {
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
    executeScript,
    isDriver: () => true,
    isElement: () => true,
    isEqualElements: (_driver, element1, element2) => true,
    isSelector: () => true,
    mainContext: () => true,
    parentContext: () => true,
    childContext: () => true,
    findElement: () => true,
    findElements: () => true,
    getViewportSize: () => {
      return {width: 1024, height: 768}
    },
    setViewportSize: () => true,
  },
  VisualGridClient,
})

const eyes = {}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.direction === 'from-page' && message.id) {
    switch (message.command) {
      case 'executeScriptRoundTrip':
        executeScript({}, message.script, message.args).then(result => {
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
        eyes[eyesId] = new Eyes(new VisualGridRunner())
        eyes[eyesId].logger = new Logger(message.showLogs)
        const config = eyes[eyesId].getConfiguration()
        config.setApiKey(message.apiKey)
        eyes[eyesId].setConfiguration(config)
        eyes[eyesId].open({}, message.appName, message.testName).then(result => {
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
