const browser = require('webextension-polyfill')
process.hrtime = require('browser-process-hrtime')
const {EyesSDK, Logger, VisualGridRunner, _TypeUtils} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
const {version} = require('../../package.json')
const {v4: uuidv4} = require('uuid')

//function transformSelector(selector) {
//  if (TypeUtils.has(selector, ['type', 'selector'])) return `${selector.selector}`
//  return selector
//}
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
    isDriver: _driver => true,
    isElement: _element => {
      console.log(`isElement: ${JSON.stringify(arguments)}`)
      return true
    },
    isEqualElements: (_driver, element1, element2) => {
      console.log(`isEqualElements: ${JSON.stringify(arguments)}`)
      return true
    },
    isSelector: _selector => {
      console.log(`isSelector: ${JSON.stringify(arguments)}`)
      return true
    },
    mainContext: _driver => {
      console.log(`mainContext: ${JSON.stringify(arguments)}`)
      return true
    },
    parentContext: _driver => {
      console.log(`parentContent: ${JSON.stringify(arguments)}`)
      return true
    },
    childContext: (_driver, _element) => {
      console.log(`childContent: ${JSON.stringify(arguments)}`)
      return true
    },
    findElement: _selector => {
      console.log(`findElement: ${JSON.stringify(arguments)}`)
      return true
    },
    findElements: _selector => {
      console.log(`findElements: ${JSON.stringify(arguments)}`)
      return true
    },
    getViewportSize: () => {
      console.log(`getViewportSize: ${JSON.stringify(arguments)}`)
      return {width: 1024, height: 768}
    },
    setViewportSize: _rect => {
      console.log(`setViewportSize: ${JSON.stringify(arguments)}`)
      return true
    },
    //getDriverInfo: _driver => {
    //  console.log(`getDriverInfo: ${JSON.stringify(arguments)}`)
    //  return {}
    //},
  },
  VisualGridClient,
})

const eyes = {}

// NOTE:
// There's a weird API in browser extensions when dealing w/ async
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#sending_an_asynchronous_response_using_sendresponse
// Although, I think we can just return a promise (seeing warnings about this approach getting deprecated soon)
browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  function sendMessage(sendResponse, message, result) {
    return sendResponse({direction: 'from-background-script', id: message.id, result})
  }
  const reply = sendMessage.bind(undefined, sendResponse, message)
  if (message.direction === 'from-page' && message.id) {
    switch (message.command) {
      case 'executeScriptRoundTrip':
        executeScript({}, message.script, message.args).then(result => {
          return reply(result)
        })
        return true
      case 'ping':
        return reply('pong')
      case 'open':
        const eyesId = uuidv4()
        eyes[eyesId] = new Eyes(new VisualGridRunner())
        eyes[eyesId].logger = new Logger(message.showLogs)
        const config = eyes[eyesId].getConfiguration()
        config.setApiKey(message.apiKey)
        eyes[eyesId].setConfiguration(config)
        eyes[eyesId].open({}, message.appName, message.testName).then(result => {
          return reply(eyesId)
        })
        return true
      case 'close':
        eyes[message.eyesId].close(message.throwException).then(result => {
          return reply(result)
        })
        return true
      case 'abort':
        eyes[message.eyesId].abort().then(result => {
          return reply(true)
        })
        return true
      case 'check':
        console.log(`checkSettings: ${JSON.stringify(message.checkSettings)}`)
        eyes[message.eyesId].check(message.checkSettings).then(result => {
          return reply(true)
        })
        return true
    }
  }
})
