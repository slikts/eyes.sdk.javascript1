// @ts-nocheck
import * as utils from '@applitools/utils'
import type {Driver, Element} from './spec-driver'

export class LegacySelector {
  static css(css: string): LegacySelector {
    return new LegacySelector(css)
  }
  static cssSelector(css: string): LegacySelector {
    return LegacySelector.css(css)
  }
  static id(id: string): LegacySelector {
    return new LegacySelector(`*[id="${id}"]`)
  }
  static className(className: string): LegacySelector {
    return new LegacySelector(`.${className}`)
  }
  static attributeValue(attr: string, value: string): LegacySelector {
    return new LegacySelector(`*[${attr}="${value}"]`)
  }
  // @ts-ignore
  static name(name: string): LegacySelector {
    return LegacySelector.attributeValue('name', name)
  }
  static tagName(tagName: string): LegacySelector {
    return new LegacySelector(tagName)
  }
  static xpath(xpath: string): LegacySelector {
    return new LegacySelector(xpath, 'xpath')
  }
  static xPath(xpath: string): LegacySelector {
    return LegacySelector.xpath(xpath)
  }

  constructor(readonly value: string, readonly using: string = 'css selector') {}

  toString(): string {
    return `${this.using}:${this.value}`
  }
}

export function withLegacyDriverAPI(browser: Driver): Driver {
  const api = {
    get remoteWebDriver() {
      return browser
    },
    async executeScript(script, ...args) {
      if (utils.types.isFunction(script) || args.length > 1 || !utils.types.isArray(args[0])) {
        return browser.execute(script, ...args)
      } else {
        return browser.executeScript(script, args[0])
      }
    },
    async executeAsyncScript(script, ...args) {
      if (utils.types.isFunction(script) || args.length > 1 || !utils.types.isArray(args[0])) {
        return browser.executeAsync(script, ...args)
      } else {
        return browser.executeAsyncScript(script, args[0])
      }
    },
    async findElement(usingOrLocator, value) {
      if (usingOrLocator instanceof LegacySelector) {
        const element: any = await browser.$(usingOrLocator.toString())
        return !element.error ? withLegacyElementAPI(element, this) : null
      } else {
        return browser.findElement(usingOrLocator, value)
      }
    },
    async findElements(usingOrLocator, value) {
      if (usingOrLocator instanceof LegacySelector) {
        const elements = await browser.$$(usingOrLocator.toString())
        return Array.from(elements, element => withLegacyElementAPI(element, this))
      } else {
        return browser.findElements(usingOrLocator, value)
      }
    },
    async findElementById(id) {
      return this.findElement(LegacySelector.id(id))
    },
    async findElementsById(id) {
      return this.findElements(LegacySelector.id(id))
    },
    async findElementByName(name) {
      return this.findElement(LegacySelector.name(name))
    },
    async findElementsByName(name) {
      return this.findElements(LegacySelector.name(name))
    },
    async findElementByCssSelector(cssSelector) {
      return this.findElement(LegacySelector.cssSelector(cssSelector))
    },
    async findElementsByCssSelector(cssSelector) {
      return this.findElements(LegacySelector.cssSelector(cssSelector))
    },
    async findElementByClassName(_className) {
      throw new TypeError('findElementByClassName method is not implemented!')
    },
    async findElementsByClassName(_className) {
      throw new TypeError('findElementsByClassName method is not implemented!')
    },
    async findElementByLinkText(_linkText) {
      throw new TypeError('findElementByLinkText method is not implemented!')
    },
    async findElementsByLinkText(_linkText) {
      throw new TypeError('findElementsByLinkText method is not implemented!')
    },
    async findElementByPartialLinkText(_partialLinkText) {
      throw new TypeError('findElementByPartialLinkText method is not implemented!')
    },
    async findElementsByPartialLinkText(_partialLinkText) {
      throw new TypeError('findElementsByPartialLinkText method is not implemented!')
    },
    async findElementByTagName(tagName) {
      return this.findElement(LegacySelector.tagName(tagName))
    },
    async findElementsByTagName(tagName) {
      return this.findElements(LegacySelector.tagName(tagName))
    },
    async findElementByXPath(xpath) {
      return this.findElement(LegacySelector.xPath(xpath))
    },
    async findElementsByXPath(xpath) {
      return this.findElements(LegacySelector.xPath(xpath))
    },
    switchTo() {
      return {
        defaultContent: () => browser.switchToFrame(null),
        frame: arg => browser.switchToFrame(arg),
        parentFrame: () => browser.switchToParentFrame(),
      }
    },
    async end() {
      return browser.deleteSession()
    },
    async close() {
      return browser.deleteSession()
    },
    async sleep(ms) {
      return browser.pause(ms)
    },
    async getCapabilities() {
      return browser.capabilities
    },
    async getCurrentUrl() {
      return browser.getUrl()
    },
    async getBrowserName() {
      return browser.capabilities.browserName
    },
  }
  return new Proxy(browser, {
    get(target, key, receiver) {
      if (Object.hasOwnProperty.call(api, key)) {
        return Reflect.get(api, key, receiver)
      }
      return Reflect.get(target, key)
    },
  })
  // @ts-ignore-end
}

export function withLegacyElementAPI(element: Element, driver: Driver): Element {
  const api = {
    get element() {
      return element
    },
    get locator() {
      return this.selector
    },
    getDriver() {
      return driver
    },
    getId() {
      return this.elementId
    },
    async executeScript(script) {
      return driver.execute(script, this)
    },
    async findElement(locator) {
      const extendedParentElement = await this.$(this)
      const element = await extendedParentElement.$(
        locator instanceof LegacySelector ? locator.toString() : locator,
      )
      return !element.error ? withLegacyElementAPI(element, driver) : null
    },
    async findElements(locator) {
      const elements = await this.$$(
        locator instanceof LegacySelector ? locator.toString() : locator,
      )
      return Array.from(elements, element => withLegacyElementAPI(element, driver))
    },
    async sendKeys(keysToSend) {
      await driver.elementClick(this.elementId)
      return driver.keys(keysToSend)
    },
    async click() {
      return driver.elementClick(this.elementId)
    },
  }
  return new Proxy(element, {
    get(target, key, receiver) {
      if (Object.hasOwnProperty.call(api, key)) {
        return Reflect.get(api, key, receiver)
      }
      return Reflect.get(target, key)
    },
  })
}

