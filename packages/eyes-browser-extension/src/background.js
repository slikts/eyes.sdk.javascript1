import browser from 'webextension-polyfill'
import * as utils from '@applitools/utils'
import * as spec from './spec-driver'
import {makeSDK} from '@applitools/eyes-sdk-core'

window.spec = spec
window.sdk = makeSDK({
  name: 'eyes.browser-extension',
  version: require('../package.json').version,
  spec,
  VisualGridClient: require('@applitools/visual-grid-client'),
})

window.eyes = new Map()
window.managers = new Map()

browser.runtime.onMessage.addListener(async ({name, payload}, sender) => {
  if (name === 'Core.makeManager') {
    const manager = await sdk.makeManager(payload)
    const managerId = utils.general.guid()
    window.managers.set(managerId, manager)
    return {managerId}
  } else if (name === 'Core.getViewportSize') {
    const result = await sdk.getViewportSize({
      driver: {tabId: sender.tab.id, windowId: sender.tab.windowId, frameId: sender.frameId}
    }) 
    return result
  } else if (name === 'Core.setViewportSize') {
    const result = await sdk.setViewportSize({
      ...payload,
      driver: {tabId: sender.tab.id, windowId: sender.tab.windowId, frameId: sender.frameId}
    }) 
    return result
  } else if (name === 'Core.closeBatches') {
    const result = await sdk.closeAllBatches(payload) 
    return result
  } else if (name === 'Core.deleteTest') {
    const result = await sdk.deleteTest(payload) 
    return result
  } else if (name === 'EyesManager.makeEyes') {
    const {manager: {managerId}, ...options} = payload
    const manager = window.managers.get(managerId)
    const eyes = await manager.makeEyes({
      ...options,
      driver: {tabId: sender.tab.id, windowId: sender.tab.windowId, frameId: sender.frameId}
    })
    const eyesId = utils.general.guid()
    window.eyes.set(eyesId, eyes)
    return {eyesId}
  } else if (name === 'EyesManager.closeAllEyes') {
    const {manager: {managerId}} = payload
    const manager = window.managers.get(managerId)
    const result = await manager.closeAllEyes(options)
    return result
  } else if (name === 'Eyes.check') {
    try {
    const {eyes: {eyesId}, ...options} = payload
    const eyes = window.eyes.get(eyesId)
    const result = await eyes.check(options)
    return result
    } catch (Err) {
      console.log(Err)
      throw Err
    }
  } else if (name === 'Eyes.locate') {
    const {eyes: {eyesId}, ...options} = payload
    const eyes = window.eyes.get(eyesId)
    const result = await eyes.locate(options)
    return result
  } else if (name === 'Eyes.extractText') {
    const {eyes: {eyesId}, ...options} = payload
    const eyes = window.eyes.get(eyesId)
    const result = await eyes.extractText(options)
    return result
  } else if (name === 'Eyes.extractTextRegions') {
    const {eyes: {eyesId}, ...options} = payload
    const eyes = window.eyes.get(eyesId)
    const result = await eyes.extractTextRegions(options)
    return result
  } else if (name === 'Eyes.close') {
    const {eyes: {eyesId}} = payload
    const eyes = window.eyes.get(eyesId)
    const result = await eyes.close()
    return result
  } else if (name === 'Eyes.abort') {
    const {eyes: {eyesId}} = payload
    const eyes = window.eyes.get(eyesId)
    const result = await eyes.abort()
    return result
  }
})
