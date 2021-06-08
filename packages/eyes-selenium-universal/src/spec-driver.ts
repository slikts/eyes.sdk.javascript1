import type * as types from '@applitools/types'
import type * as Selenium from 'selenium-webdriver'
import * as utils from '@applitools/utils'

export type Driver = Selenium.WebDriver
export type Element = Selenium.WebElement
export type Selector = types.SpecSelector<Selenium.Locator>

export type TransformedDriver = any
export type TransformedElement = {elementId: string}
export type TransformedSelector = types.SpecSelector<Selenium.ByHash | {using: string; value: string}>

const byHash = ['className', 'css', 'id', 'js', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath']

export function isDriver(driver: any): driver is Driver {
  return utils.types.instanceOf(driver, 'WebDriver')
}
export function isElement(element: any): element is Element {
  return utils.types.instanceOf(element, 'WebElement')
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return (
    utils.types.has(selector, ['type', 'selector']) ||
    utils.types.has(selector, ['using', 'value']) ||
    Object.keys(selector).some(key => byHash.includes(key)) ||
    utils.types.isString(selector)
  )
}

export async function transformDriver(driver: Driver): Promise<TransformedDriver> {
  const session = await driver.getSession()
  const capabilities = await driver.getCapabilities()
  return {
    protocol: 'http',
    hostname: 'localhost',
    port: '4444',
    path: '/wd/hub',
    sessionId: session.getId(),
    capabilities: Array.from(capabilities.keys()).reduce((caps, key) => {
      caps[key] = capabilities.get(key)
      return caps
    }, {} as Record<string, any>),
  }
}

export async function transformElement(element: Element): Promise<TransformedElement> {
  return {elementId: await element.getId()}
}

function transformSelector(selector: Selector): Selenium.Locator {
  if (utils.types.isString(selector)) {
    return {css: selector}
  } else if (utils.types.has(selector, ['type', 'selector'])) {
    if (selector.type === 'css') return {css: selector.selector}
    else if (selector.type === 'xpath') return {xpath: selector.selector}
    else return {using: selector.type, value: selector.selector}
  }
  return selector
}

// #region TESTING

export async function visit(driver: Driver, url: string): Promise<void> {
  await driver.get(url)
}
export async function click(driver: Driver, element: Element | Selector): Promise<void> {
  if (isSelector(element)) element = await driver.findElement(transformSelector(element))
  await element.click()
}
export async function hover(driver: Driver, element: Element | Selector) {
  if (isSelector(element)) element = await driver.findElement(transformSelector(element))
  await driver.actions().move({origin: element}).perform()
}
export async function type(driver: Driver, element: Element | Selector, keys: string): Promise<void> {
  if (isSelector(element)) element = await driver.findElement(transformSelector(element))
  await element.sendKeys(keys)
}
export async function scrollIntoView(driver: Driver, element: Element | Selector, align = false): Promise<void> {
  if (isSelector(element)) element = await driver.findElement(transformSelector(element))
  await driver.executeScript('arguments[0].scrollIntoView(arguments[1])', element, align)
}
export async function waitUntilDisplayed(driver: Driver, selector: Selector, timeout: number): Promise<void> {
  const {until} = require('selenium-webdriver')
  const element = await driver.findElement(transformSelector(selector))
  await driver.wait(until.elementIsVisible(element), timeout)
}

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
  const {Builder} = require('selenium-webdriver')
  const parseEnv = require('@applitools/test-utils/src/parse-env')

  const {
    browser = '',
    capabilities,
    url,
    attach,
    proxy,
    configurable = true,
    appium = false,
    args = [],
    headless,
  } = parseEnv({...env, legacy: env.legacy ?? process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3'})
  const desiredCapabilities = {browserName: browser, ...capabilities}
  if (configurable) {
    const browserOptionsName = browserOptionsNames[browser || desiredCapabilities.browserName]
    if (browserOptionsName) {
      const browserOptions = desiredCapabilities[browserOptionsName] || {}
      browserOptions.args = [...(browserOptions.args || []), ...args]
      if (headless) browserOptions.args.push('headless')
      if (attach) {
        browserOptions.debuggerAddress = attach === true ? 'localhost:9222' : attach
        if (browser !== 'firefox') browserOptions.w3c = false
      }
      desiredCapabilities[browserOptionsName] = browserOptions
    }
  }
  if (appium && browser === 'chrome') {
    desiredCapabilities['appium:chromeOptions'] = {w3c: false}
  }
  const builder = new Builder().withCapabilities(desiredCapabilities)
  if (url && !attach) builder.usingServer(url.href)
  if (proxy) {
    builder.setProxy({
      proxyType: 'manual',
      httpProxy: proxy.http || proxy.server,
      sslProxy: proxy.https || proxy.server,
      ftpProxy: proxy.ftp,
      noProxy: proxy.bypass,
    })
  }
  const driver = await builder.build()
  return [driver, () => driver.quit()]
}

// #endregion
