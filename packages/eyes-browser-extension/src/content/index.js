import browser from 'webextension-polyfill'

const elementForInjectingScript = document.createElement('script')
elementForInjectingScript.src = browser.runtime.getURL('/assets/pageScripts.js')
window.document.body.appendChild(elementForInjectingScript)
