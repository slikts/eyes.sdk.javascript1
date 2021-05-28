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
    return page.constructor.name === 'Page'
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
  async takeScreenshot(page: Driver): Promise<Buffer> {
    return page.screenshot()
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
}
