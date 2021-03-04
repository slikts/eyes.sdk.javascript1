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

export function withLegacyDriverAPI(browser) {
  const api = {
    get remoteWebDriver() {
      return browser
    },
    async executeScript(script, ...args) {
      const {value} = await browser.execute(script, ...args)
      return value
    },
    async executeAsyncScript(script, ...args) {
      const {value} = await browser.executeAsync(script, ...args)
      return value
    },
    async findElement(selector) {
      if (selector instanceof LegacySelector) {
        const element = await browser.element(selector.toString())
        return element ? withLegacyElementAPI(element, this) : null
      }
    },
    async findElements(selector) {
      if (selector instanceof LegacySelector) {
        const {value} = await browser.elements(selector.toString())
        return value ? value.map(element => withLegacyElementAPI(element, this)) : []
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
        defaultContent: () => browser.frame(null),
        frame: arg => browser.frame(arg),
        parentFrame: () => browser.frameParent(),
      }
    },
    async takeScreenshot() {
      return browser.saveScreenshot()
    },
    async close() {
      return browser.end()
    },
    async sleep(ms) {
      return browser.pause(ms)
    },
    async getCapabilities() {
      return browser.desiredCapabilities
    },
    async getCurrentUrl() {
      return browser.getUrl()
    },
    async getBrowserName() {
      return browser.desiredCapabilities.browserName
    },
    async click(selector) {
      return browser.click(selector instanceof LegacySelector ? selector.toString() : selector)
    },
  }
  return new Proxy(browser, {
    get(target, key, receiver) {
      if (key === 'then') return
      if (Object.hasOwnProperty.call(api, key)) {
        return Reflect.get(api, key, receiver)
      }
      return Reflect.get(target, key)
    },
  })
}

export function withLegacyElementAPI(element, driver) {
  const api = {
    get element() {
      return element.value || element
    },
    get locator() {
      return element.selector
    },
    getDriver() {
      return driver
    },
    getId() {
      return element.value ? element.value.ELEMENT : element.ELEMENT
    },
    async executeScript(script) {
      const {value} = await driver.execute(script, this.element)
      return value
    },
    async findElement(selector) {
      const {value} = await driver.elementIdElement(this.getId(), selector.toString())
      return value ? withLegacyElementAPI(value, driver) : null
    },
    async findElements(selector) {
      const {value} = await driver.elementIdElement(this.getId(), selector.toString())
      return value ? value.map(element => withLegacyElementAPI(element, driver)) : []
    },
    async sendKeys(keysToSend) {
      return driver.elementIdValue(this.getId(), keysToSend)
    },
    async click() {
      return driver.elementIdClick(this.getId())
    },
  }
  return new Proxy(element, {
    get(target, key, receiver) {
      if (key in api) {
        return Reflect.get(api, key, receiver)
      }
      return Reflect.get(target, key)
    },
  })
}
