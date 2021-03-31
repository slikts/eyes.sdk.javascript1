import * as utils from '@applitools/utils'
import type * as Nightwatch from 'nightwatch'

export type Driver = Nightwatch.NightwatchAPI
export type Element =
  | {ELEMENT: string}
  | {'element-6066-11e4-a52e-4f735466cecf': string}
  | Nightwatch.NightwatchTypedCallbackResult<{ELEMENT: string} | {'element-6066-11e4-a52e-4f735466cecf': string}>
export type Selector =
  | {locateStrategy: Nightwatch.LocateStrategy; selector: 'string'}
  | string
  | {type: string; selector: string}

//// #region HELPERS

const LEGACY_ELEMENT_ID = 'ELEMENT'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'
function extractElementId(element: Element): string {
  if (utils.types.has(element, ELEMENT_ID)) return element[ELEMENT_ID]
  else if (utils.types.has(element, LEGACY_ELEMENT_ID)) return element[LEGACY_ELEMENT_ID]
}
function transformSelector(selector: Selector): [Nightwatch.LocateStrategy, string] {
  if (utils.types.isString(selector)) {
    return ['css selector', selector]
  } else if (utils.types.has(selector, ['type', 'selector'])) {
    if (selector.type === 'css') return ['css selector', selector.selector]
    else if (selector.type === 'xpath') return ['xpath', selector.selector]
    else return [selector.type as Nightwatch.LocateStrategy, selector.selector]
  } else if (utils.types.has(selector, ['locateStrategy', 'selector'])) {
    return [selector.locateStrategy, selector.selector]
  }
  // else if (isNative) return ['id', selector]
}
function call<
  TCommand extends keyof {
    [TCommand in keyof Driver as Driver[TCommand] extends (...args: [...infer TArgs, (...args: any[]) => any]) => any
      ? TCommand
      : never]: void
  },
  TResult = Driver[TCommand] extends (
    ...args: [...infer TArgs, (result: Nightwatch.NightwatchCallbackResult<infer TResult>) => any]
  ) => any
    ? TResult
    : void
>(driver: Driver, command: TCommand, ...args: any[]): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) =>
    (driver[command] as any)(...args, (result: Nightwatch.NightwatchCallbackResult<TResult>) => {
      if (!result.value) resolve(result as any)
      else if (!result.status) resolve(result.value as TResult)
      else reject(result.value)
    }),
  )
}

// #endregion

//// #region UTILITY

export function isDriver(driver: any): driver is Driver {
  return utils.types.instanceOf(driver, 'NightwatchAPI')
}
export function isElement(element: any): element is Element {
  if (!element || element.error) return false
  return Boolean(extractElementId(element.value || element))
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return (
    utils.types.has(selector, ['locateStrategy', 'selector']) ||
    utils.types.isString(selector) ||
    utils.types.has(selector, ['type', 'selector'])
  )
}
export function transformElement(element: Element): Element {
  const elementId = extractElementId(element)
  return {[ELEMENT_ID]: elementId, [LEGACY_ELEMENT_ID]: elementId}
}
export function isStaleElementError(err: any): boolean {
  if (!err) return false
  const errOrResult = err.originalError || err
  const error = errOrResult && errOrResult.error
  return error && (error.includes('stale element reference') || error.includes('is stale'))
}
export function isEqualElements(_driver: Driver, element1: Element, element2: Element) {
  if (!element1 || !element2) return false
  const elementId1 = extractElementId(element1)
  const elementId2 = extractElementId(element2)
  return elementId1 === elementId2
}

//// #endregion

//// #region COMMANDS

export async function executeScript(
  driver: Driver,
  script: ((...args: any) => any) | string,
  ...args: any[]
): Promise<any> {
  return call(driver, 'execute', script, args)
}
export async function mainContext(driver: Driver): Promise<void> {
  await call(driver, 'frame')
}
export async function parentContext(driver: Driver): Promise<void> {
  await call(driver, 'frameParent')
}
export async function childContext(driver: Driver, element: Element): Promise<void> {
  await call(driver, 'frame', element)
}
export async function findElement(driver: Driver, selector: Selector): Promise<Element> {
  try {
    return await call(driver, 'element', ...transformSelector(selector))
  } catch {
    return null
  }
}
export async function findElements(driver: Driver, selector: Selector): Promise<Element[]> {
  return call(driver, 'elements', ...transformSelector(selector))
}
export async function getElementRect(
  driver: Driver,
  element: Element,
): Promise<{x: number; y: number; width: number; height: number}> {
  const {x, y} = await call(driver, 'elementIdLocation', extractElementId(element))
  const {width, height} = await call(driver, 'elementIdSize', extractElementId(element))
  return {x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height)}
}
export async function getWindowRect(driver: Driver): Promise<{x: number; y: number; width: number; height: number}> {
  // NOTE:
  // https://github.com/nightwatchjs/nightwatch/blob/fd4aff1e2cc3e691a82e61c7e550fb088ee47d5a/lib/transport/jsonwire/actions.js#L165-L167
  // getWindowRect is implemented on JWP drivers even though it won't work
  // So we need to catch and retry a window size command that will work on JWP
  try {
    return await call(driver, 'getWindowRect' as any)
  } catch {
    const location = await call(driver, 'windowPosition', 'current')
    const size = await call(driver, 'windowSize', 'current')
    return {...location, ...size}
  }
}
export async function setWindowRect(
  driver: Driver,
  rect: {x?: number; y?: number; width?: number; height?: number},
): Promise<void> {
  // NOTE:
  // Same deal as with getWindowRect. If running on JWP, need to catch and retry
  // with a different command.
  try {
    await call(driver, 'windowRect' as any, rect)
  } catch {
    const {x = null, y = null, width = null, height = null} = rect || {}
    if (x !== null && y !== null) {
      await call(driver, 'windowPosition', x, y)
    }
    if (width !== null && height !== null) {
      await call(driver, 'windowSize', width, height)
    }
  }
}
export async function getOrientation(driver: Driver): Promise<string> {
  const capabilities = driver.options.desiredCapabilities as Record<string, any>
  const orientation = capabilities.orientation || capabilities.deviceOrientation
  return orientation ? orientation.toLowerCase() : 'portrait'
}
export async function getDriverInfo(driver: Driver): Promise<any> {
  const capabilities = driver.options.desiredCapabilities as Record<string, any>
  const sessionId = driver.sessionId
  const browserName = capabilities.browserName
  const deviceName = capabilities.device ? capabilities.device : capabilities.deviceName
  const platformName = capabilities.platformName || capabilities.platform
  const platformVersion = capabilities.osVersion ? capabilities.osVersion : capabilities.platformVersion
  const isMobile = ['android', 'ios'].includes(platformName && platformName.toLowerCase())
  const isNative = isMobile && !browserName
  return {
    browserName,
    deviceName,
    isMobile,
    isNative,
    platformName,
    platformVersion,
    sessionId,
  }
}
export async function getTitle(driver: Driver): Promise<string> {
  return call(driver, 'title')
}
export async function getUrl(driver: Driver): Promise<string> {
  return call(driver, 'url')
}
export async function visit(driver: Driver, url: string): Promise<string> {
  return call(driver, 'url', url)
}
export async function takeScreenshot(driver: Driver): Promise<string> {
  // TODO: ask forum about how to track error handling
  return call(driver, 'screenshot', false)
}
export async function click(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await call(driver, 'elementIdClick', extractElementId(element))
}
export async function hover(
  driver: Driver,
  element: Element | Selector,
  offset?: {x: number; y: number},
): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await call(driver, 'moveTo', extractElementId(element), offset?.x, offset?.y)
}
export async function type(driver: Driver, element: Element | Selector, keys: string): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  await driver.elementIdValue(extractElementId(element), keys)
}
export async function scrollIntoView(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await findElement(driver, element)
  // NOTE: moveTo will scroll the element into view, but it also moves the mouse
  // cursor to the element. This might have unintended side effects.
  // Will need to wait and see, since there's no simple alternative.
  await call(driver, 'moveTo', extractElementId(element), 0, 0)
}
export async function waitUntilDisplayed(driver: Driver, selector: Selector, timeout: number): Promise<void> {
  await call(driver, 'waitForElementVisible' as any, ...transformSelector(selector), timeout)
}

// #endregion

// #region TESTING

function createBrowserOptions(browserName: string, argsArray: string[] = []) {
  const browserOptionsNames: Record<string, string> = {
    chrome: 'goog:chromeOptions',
    firefox: 'moz:firefoxOptions',
  }
  const browserOption = browserOptionsNames[browserName]
  if (!browserOption) return
  const browserOptions = {
    [browserOption]: {
      w3c: browserName === 'chrome' ? false : undefined,
      args: argsArray,
    },
  }
  return browserName === 'firefox' ? {alwaysMatch: browserOptions} : browserOptions
}
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
  // config prep
  const {testSetup} = require('@applitools/sdk-shared')
  const testSetupConfig = testSetup.Env(env)
  const conf: any = {
    test_settings: {
      default: {
        webdriver: {
          port: 4444,
          default_path_prefix: '/wd/hub',
        },
      },
    },
  }
  // NOTE: https://github.com/nightwatchjs/nightwatch/issues/2501
  //if (testSetupConfig.browser === 'ie-11') {
  //  conf.test_settings.default.capabilities = testSetupConfig.capabilities
  //  conf.test_settings.default.capabilities['sauce:options'].seleniumVersion = '3.141.59'
  //  conf.test_settings.default.capabilities['sauce:options'].iedriverVersion = '3.150.1'
  //}
  conf.test_settings.default.desiredCapabilities = Object.assign(
    {},
    testSetupConfig.capabilities,
    createBrowserOptions(testSetupConfig.browser, [testSetupConfig.headless ? '--headless' : '//--headless']),
  )
  const host = testSetupConfig.url.host
  const port = testSetupConfig.url.port
  if (port) conf.test_settings.default.webdriver.port = port
  if (!host.includes('localhost')) {
    conf.test_settings.default.selenium_host = host
    conf.test_settings.default.username = process.env.SAUCE_USERNAME
    conf.test_settings.default.access_key = process.env.SAUCE_ACCESS_KEY
  }

  // building
  const Nightwatch = require('nightwatch')
  const Settings = require('nightwatch/lib/settings/settings')
  const client = Nightwatch.client(Settings.parse({}, conf, {}, 'default'))
  client.isES6AsyncTestcase = true
  await client.createSession()
  return [client.api, () => client.session.close()]
}

//// #endregion
