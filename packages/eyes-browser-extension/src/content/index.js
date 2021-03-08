import browser from 'webextension-polyfill'
const {v4: uuidv4} = require('uuid')

const elementForInjectingScript = document.createElement('script')
elementForInjectingScript.src = browser.runtime.getURL('/assets/pageScripts.js')
window.document.body.appendChild(elementForInjectingScript)

window.addEventListener('message', async event => {
  console.log(`content script: called with ${JSON.stringify(event.data)}`)
  if (event.data && event.data.direction === 'from-page') {
    if (event.data.command === 'executeScript' && event.data.id) {
      window.__eyes.promises[event.data.id].res(event.data.result)
      delete window.__eyes.promises[event.data.id]
    } else {
      const result = await browser.runtime.sendMessage(event.data)
      console.log(`content script: received result from background script ${JSON.stringify(event.data)}`)
      console.log('sending message to page')
      event.source.postMessage(result, '*')
    }
  }
})

window.__eyes = {
  promises: {},
}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.direction === 'from-background-script' && message.command === 'executeScript') {
    const id = uuidv4()
    const p = new Promise((res, rej) => {
      window.__eyes.promises[id] = {res, rej}
    })
    window.postMessage({id, ...message}, '*')
    p.then(result => {
      return sendResponse(result)
    })
    return true
  }
})
