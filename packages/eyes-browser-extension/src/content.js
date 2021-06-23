import browser from 'webextension-polyfill'
import * as utils from '@applitools/utils'
import {makeRefer} from './refer'

const elementForInjectingScript = document.createElement('script')
elementForInjectingScript.src = browser.runtime.getURL('api.js')
window.document.body.appendChild(elementForInjectingScript)

const refer = makeRefer()

// NOTE: Listen for commands from page/api script.
// This is required because user API cannot directly communicate with background script
window.addEventListener('message', async ({data, source}) => {
  if (!data.isAPI) return
  try {
    const result = await browser.runtime.sendMessage(data)
    source.postMessage({name: data.name, key: data.key, payload: {result}, isContent: true}, '*')
  } catch (error) {
    source.postMessage({name: data.name, key: data.key, payload: {error}, isContent: true}, '*')
  }
})

// NOTE: Listen for one single command triggered from childContext in spec driver
// This is a workaround to get frameId of cross origin iframe
window.addEventListener('message', async ({data}) => {
  if (!data.isPing) return
  await browser.runtime.sendMessage({key: data.key, isPong: true})
})

// NOTE: Listen for dom-manipulation commands from background script.
browser.runtime.onMessage.addListener((message, _sender, resolve) => {
  if (message.name === 'Driver.findElement') {
    const {selector} = message.payload
    const element = findElement(selector)
    resolve(refer.ref(element))
  } else if (message.name === 'Driver.findElements') {
    const {selector} = message.payload
    const elements = findElements(selector)
    resolve(refer.ref(elements))
  } else if (message.name === 'Driver.executeScript') {
    const {script, arg} = message.payload
    const result = executeScript(script, refer.deref(arg))
    resolve(refer.ref(result))
  }
})

function findElement(selector) {
  selector = utils.types.isString(selector) ? {type: 'css', selector} : selector
  if (selector.type === 'css') {
    return document.querySelector(selector.selector)
  } else if (selector.type === 'xpath') {
    return document.evaluate(selector.selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue
  }
}

function findElements(selector) {
  selector = utils.types.isString(selector) ? {type: 'css', selector} : selector
  if (selector.type === 'css') {
    return Array.from(document.querySelectorAll(selector.selector))
  } else if (selector.type === 'xpath') {
    const iterator = document.evaluate(selector.selector, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE)
    const elements = []
    let element
    while(element = iterator.iterateNext()) elements.push(element)
    return elements
  }
}

function executeScript(script, arg) {
  const fn = new Function(script.startsWith('function') ? `return (${script}).apply(null, arguments)` : script)
  return fn(arg)
}