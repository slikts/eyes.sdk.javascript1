import browser from 'webextension-polyfill'
const {v4: uuidv4} = require('uuid')

const elementForInjectingScript = document.createElement('script')
elementForInjectingScript.src = browser.runtime.getURL('/assets/pageScripts.js')
window.document.body.appendChild(elementForInjectingScript)

window.addEventListener('message', async event => {
  if (event.data && event.data.direction === 'from-page') {
    console.log(`content script: called from page with ${JSON.stringify(event.data)}`)
    if (event.data.command === 'executeScript' && event.data.id) {
      window.__eyes.promises[event.data.id].res(event.data.result)
      delete window.__eyes.promises[event.data.id]
    } else {
      const result = await browser.runtime.sendMessage(event.data)
      console.log(`content script: received result from background script ${JSON.stringify(event.data)}`)
      event.source.postMessage(result, '*')
    }
  }
})

window.__eyes = {
  promises: {},
}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.direction === 'from-background-script' && message.command === 'executeScript') {
    console.log(`content script: called from background-script with ${JSON.stringify(message)}`)
    const id = uuidv4()
    const p = new Promise((res, rej) => {
      window.__eyes.promises[id] = {res, rej}
    })
    window.postMessage({id, ...message}, '*')
    p.then(result => {
      console.log(`content script: received result from page ${JSON.stringify(result)}`)
      return sendResponse(result)
    })
    return true
  }
})
