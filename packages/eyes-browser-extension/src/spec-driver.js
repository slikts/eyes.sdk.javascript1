import browser from 'webextension-polyfill'
import * as utils from '@applitools/utils'

export function isDriver(driver) {
  return utils.types.has(driver, ['windowId', 'tabId'])
}

export function isContext(context) {
  return utils.types.has(context, ['windowId', 'tabId', 'frameId'])
}

export function isElement(element) {
  return utils.types.has(element, 'elementId')
}

export function isSelector(selector) {
  return utils.types.isString(selector) || utils.types.has(selector, ['type', 'selector'])
}

export function isStaleElementError(error) {
  if (!error) return false
  error = error.originalError || error
  return error instanceof Error && error.name === 'StaleElementReferenceError'
}

export async function mainContext(context) {
  const frames = await browser.webNavigation.getAllFrames({tabId: context.tabId})
  const mainFrame = frames.find(frame => frame.parentFrameId === -1)
  return {...context, frameId: mainFrame.frameId}
}

export async function parentContext(context) {
  const frames = await browser.webNavigation.getAllFrames({tabId: context.tabId})
  const frame = frames.find(frame => frame.frameId === context.frameId)
  return {...context, frameId: frame.parentFrameId}
}

export async function childContext(context, element) {
  const childFrameId = await new Promise(async (resolve, reject) => {
    const key = utils.general.guid()
    function handler(data, sender) {
      if (data.isPong && data.key === key) {
        resolve(sender.frameId)
        browser.runtime.onMessage.removeListener(handler)
      }
    }
    browser.runtime.onMessage.addListener(handler)
    await browser.tabs.sendMessage(
      context.tabId,
      {
        name: 'Driver.executeScript',
        payload: {script: `return arguments[0].contentWindow.postMessage({key: ${key}, isPing: true})`, arg: element},
      },
      {frameId: context.frameId},
    )
    setTimeout(() => reject(new Error('No such frame')), 5000)
  })

  return {...context, frameId: childFrameId}
}

export async function executeScript(context, script, arg) {
  return await browser.tabs.sendMessage(
    context.tabId,
    {name: 'Driver.executeScript', payload: {script: script.toString(), arg}},
    {frameId: context.frameId},
  )
}

export async function findElement(context, selector) {
  return await browser.tabs.sendMessage(
    context.tabId,
    {name: 'Driver.findElement', payload: {selector}},
    {frameId: context.frameId},
  )
}

export async function findElements(context, selector) {
  return await browser.tabs.sendMessage(
    context.tabId,
    {name: 'Driver.findElements', payload: {selector}},
    {frameId: context.frameId},
  )
}

export async function takeScreenshot(driver) {
  const [activeTab] = await browser.tabs.query({windowId: driver.windowId, active: true})
  await browser.tabs.update(driver.tabId, {active:true})
  const url = await browser.tabs.captureVisibleTab(driver.windowId, {format: 'png'})
  await browser.tabs.update(activeTab.id, {active:true})
  return url.replace(/^data:image\/png;base64,/, '')
}

export async function getTitle(driver) {
  const {title} = await browser.tabs.get(driver.tabId);
  return title
}

export async function getUrl(driver) {
  const {url} = await browser.tabs.get(driver.tabId);
  return url
}

export async function getWindowSize(driver) {
  const [size] = await browser.tabs.executeScript(driver.tabId, {
    code: 'JSON.stringify({width: window.outerWidth, height: window.outerHeight})'
  })
  return JSON.parse(size)
}

export async function setWindowSize(driver, size) {
  await browser.windows.update(driver.windowId, {
    left: 0,
    top: 0,
    width: size.width,
    height: size.height
  })
}
