import type * as types from '@applitools/types'
import type * as Playwright from 'playwright'
import * as utils from '@applitools/utils'

export type Driver = Playwright.Page
export type Element = Playwright.ElementHandle
export type Context = Playwright.Frame
export type Selector = types.SpecSelector<string>

export class SpecDriver implements types.SpecDriver<Driver, Context, Element, Selector> {
  get commands(): string[] {
    return Object.keys(this).filter(key => !key.startsWith('_'))
  }

  // #region HELPERS
  private async _handleToObject(handle: Playwright.JSHandle): Promise<any> {
    const [, type] = handle.toString().split('@')
    if (type === 'array') {
      const map = await handle.getProperties()
      return Promise.all(Array.from(map.values(), this._handleToObject))
    } else if (type === 'object') {
      const map = await handle.getProperties()
      const chunks = await Promise.all(
        Array.from(map, async ([key, handle]) => ({[key]: await this._handleToObject(handle)})),
      )
      return chunks.length > 0 ? Object.assign(...(chunks as [any])) : {}
    } else if (type === 'node') {
      return handle.asElement()
    } else {
      return handle.jsonValue()
    }
  }
  private _transformSelector(selector: any): string {
    if (utils.types.has(selector, ['type', 'selector'])) {
      if (selector.type === 'css') return `css=${selector.selector}`
      else if (selector.type === 'xpath') return `xpath=${selector.selector}`
    }
    return selector
  }
  // #endregion

  // #region UTILITY

  isDriver(page: any): page is Driver {
    if (!page) return false
    return page.constructor.name === 'Page'
  }
  isContext(context: any): context is Context {
    if (!context) return false
    return context.constructor.name === 'Frame'
  }
  isElement(element: any): element is Element {
    if (!element) return false
    return element.constructor.name === 'ElementHandle'
  }
  isSelector(selector: any): selector is Selector {
    return utils.types.isString(selector) || utils.types.has(selector, ['type', 'selector'])
  }
  extractContext(page: Driver | Context): Context {
    return this.isDriver(page) ? page.mainFrame() : page
  }
  isStaleElementError(err: any): boolean {
    return err && err.message && err.message.includes('Protocol error (DOM.describeNode)')
  }
  async isEqualElements(frame: Context, element1: Element, element2: Element): Promise<boolean> {
    return frame.evaluate(([element1, element2]) => element1 === element2, [element1, element2]).catch(() => false)
  }

  // #endregion

  // #region COMMANDS

  async executeScript(frame: Context, script: ((arg: any) => any) | string, arg: any): Promise<any> {
    script = utils.types.isString(script) ? (new Function(script) as (arg: any) => any) : script
    const result = await frame.evaluateHandle(script, arg)
    return this._handleToObject(result)
  }
  async mainContext(frame: Context): Promise<Context> {
    frame = this.extractContext(frame)
    let mainFrame = frame
    while (mainFrame.parentFrame()) {
      mainFrame = mainFrame.parentFrame()
    }
    return mainFrame
  }
  async parentContext(frame: Context): Promise<Context> {
    frame = this.extractContext(frame)
    return frame.parentFrame()
  }
  async childContext(_frame: Context, element: Element): Promise<Context> {
    return element.contentFrame()
  }
  async findElement(frame: Context, selector: Selector): Promise<Element | null> {
    return frame.$(this._transformSelector(selector))
  }
  async findElements(frame: Context, selector: Selector): Promise<Element[]> {
    return frame.$$(this._transformSelector(selector))
  }
  async takeScreenshot(page: Driver): Promise<string> {
    const buffer = await page.screenshot()
    return buffer.toString('base64')
  }
  async getViewportSize(page: Driver): Promise<types.Size> {
    return page.viewportSize()
  }
  async setViewportSize(page: Driver, size: types.Size): Promise<void> {
    return page.setViewportSize(size)
  }
  async getTitle(page: Driver): Promise<string> {
    return page.title()
  }
  async getUrl(page: Driver): Promise<string> {
    return page.url()
  }
  async visit(page: Driver, url: string): Promise<void> {
    await page.goto(url)
  }
  async click(frame: Context, element: Element | Selector): Promise<void> {
    if (this.isSelector(element)) element = await this.findElement(frame, element)
    await element.click()
  }
  async type(frame: Context, element: Element | Selector, keys: string): Promise<void> {
    if (this.isSelector(element)) element = await this.findElement(frame, element)
    await element.type(keys)
  }
  async hover(frame: Context, element: Element | Selector): Promise<void> {
    if (this.isSelector(element)) element = await this.findElement(frame, element)
    await element.hover()
  }
  async scrollIntoView(frame: Context, element: Element | Selector, align = false): Promise<void> {
    if (this.isSelector(element)) element = await this.findElement(frame, element)
    // @ts-ignore
    await frame.evaluate(([element, align]) => element.scrollIntoView(align), [element, align])
  }
  async waitUntilDisplayed(frame: Context, selector: Selector): Promise<void> {
    await frame.waitForSelector(this._transformSelector(selector))
  }
  // #endregion

  // #region BUILD

  async build(env: any): Promise<[Driver, () => Promise<void>]> {
    const playwright = require('playwright')
    const parseEnv = require('@applitools/test-utils/src/parse-env')

    const browserNames: Record<string, string> = {
      chrome: 'chromium',
      safari: 'webkit',
      firefox: 'firefox',
    }

    const {browser, device, url, attach, proxy, args = [], headless} = parseEnv(env, 'cdp')
    const launcher = playwright[browserNames[browser] || browser]
    if (!launcher) throw new Error(`Browser "${browser}" is not supported.`)
    if (attach) throw new Error(`Attaching to the existed browser doesn't supported by playwright`)
    const options: any = {
      args,
      headless,
      ignoreDefaultArgs: ['--hide-scrollbars'],
    }
    if (proxy) {
      options.proxy = {
        server: proxy.https || proxy.http || proxy.server,
        bypass: proxy.bypass.join(','),
      }
    }
    let driver: any
    if (url) {
      if (utils.types.isArray(options.ignoreDefaultArgs)) {
        url.searchParams.set('ignoreDefaultArgs', options.ignoreDefaultArgs.join(','))
      }
      url.searchParams.set('headless', options.headless)
      options.args.forEach((arg: string) => url.searchParams.set(...arg.split('=')))
      driver = await launcher.connect({wsEndpoint: url.href})
    } else {
      driver = await launcher.launch(options)
    }
    const context = await driver.newContext(device ? playwright.devices[device] : {})
    const page = await context.newPage()
    return [page, () => driver.close()]
  }

  // #endregion
}
