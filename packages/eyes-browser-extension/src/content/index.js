import browser from 'webextension-polyfill'

const elementForInjectingScript = document.createElement('script')
elementForInjectingScript.src = browser.runtime.getURL('/assets/pageScripts.js')
window.document.body.appendChild(elementForInjectingScript)

window.addEventListener('message', async event => {
  console.log(`content script: called with ${JSON.stringify(event.data)}`)
  if (event.data && event.data.direction === 'from-page') {
    const result = await browser.runtime.sendMessage(event.data)
    console.log(`content script: received result from background script ${JSON.stringify(event.data)}`)
    const payload = {
      direction: 'from-content-script',
      id: result.id,
      result: result.result,
    }
    console.log(`content script: payload for page ${JSON.stringify(payload)}`)
    console.log('sending message to page')
    window.postMessage(payload, '*')
  }
})
