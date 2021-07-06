import browser from 'webextension-polyfill'
import {makeSDK} from '@applitools/eyes-sdk-core'
import {makeMessenger} from './messenger'
import {makeRefer} from './refer'
import * as spec from './spec-driver'

window.browser = browser
window.spec = spec
window.sdk = makeSDK({
  name: 'eyes.browser-extension',
  version: require('../package.json').version,
  spec,
  VisualGridClient: require('@applitools/visual-grid-client'),
})

const refer = makeRefer()
const messenger = makeMessenger({
  onMessage: fn => browser.runtime.onMessage.addListener((message, sender) => fn(message, sender)),
  sendMessage: (message, receiver) => browser.tabs.sendMessage(receiver.tab.id, message, {frameId: receiver.frameId})
})

messenger.command('Core.makeManager', async config => {
  const manager = await sdk.makeManager(config)
  return refer.ref(manager)
})
messenger.command('Core.makeEyes', async (config, sender) => {
  const manager = await sdk.makeManager(config)
  const eyes = await manager.makeEyes({
    driver: {tabId: sender.tab.id, windowId: sender.tab.windowId, frameId: sender.frameId},
    config: config.config,
    on: config.on
  })
  return refer.ref(eyes)
})
messenger.command('Core.getViewportSize', async (_, sender) => {
  return sdk.getViewportSize({
    driver: {tabId: sender.tab.id, windowId: sender.tab.windowId},
  })
})
messenger.command('Core.setViewportSize', async ({size}, sender) => {
  return sdk.setViewportSize({
    driver: {tabId: sender.tab.id, windowId: sender.tab.windowId},
    size,
  })
})
messenger.command('Core.closeBatches', async settings => {
  return sdk.closeAllBatches(settings)
})
messenger.command('Core.deleteTest', async settings => {
  return sdk.deleteTest(settings) 
})

messenger.command('EyesManager.makeEyes', async ({manager, config, on}, sender) => {
  const eyes = await refer.deref(manager).makeEyes({
    driver: {tabId: sender.tab.id, windowId: sender.tab.windowId, frameId: sender.frameId},
    config,
    on,
  })
  return refer.ref(eyes)
})
messenger.command('EyesManager.closeAllEyes', async ({manager}) => {
  return refer.deref(manager).closeAllEyes()
})

messenger.command('Eyes.check', async ({eyes, settings, config}) => {
  return refer.deref(eyes).check({settings, config})
})
messenger.command('Eyes.locate', async ({eyes, settings, config}) => {
  return refer.deref(eyes).locate({settings, config})
})
messenger.command('Eyes.extractTextRegions', async ({eyes, settings, config}) => {
  return refer.deref(eyes).extractTextRegions({settings, config})
})
messenger.command('Eyes.extractText', async ({eyes, regions, config}) => {
  return refer.deref(eyes).extractText({regions, config})
})
messenger.command('Eyes.close', async ({eyes}) => {
  return refer.deref(eyes).close()
})
messenger.command('Eyes.abort', async ({eyes}) => {
  return refer.deref(eyes).abort()
})
