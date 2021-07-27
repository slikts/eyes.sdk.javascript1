import type * as types from '@applitools/types'
import type {Context} from './context'
import * as utils from '@applitools/utils'
const snippets = require('@applitools/snippets')

export type ElementState = {
  scrollOffset?: types.Location
  transforms?: any
}

export class Element<TDriver, TContext, TElement, TSelector> {
  private _target: TElement

  private _context: Context<TDriver, TContext, TElement, TSelector>
  private _selector: types.SpecSelector<TSelector>
  private _index: number
  private _state: ElementState = {}
  private _originalOverflow: any
  private _logger: any

  protected readonly _spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>

  constructor(options: {
    spec: types.SpecDriver<TDriver, TContext, TElement, TSelector>
    element?: TElement | Element<TDriver, TContext, TElement, TSelector>
    context?: Context<TDriver, TContext, TElement, TSelector>
    selector?: types.SpecSelector<TSelector>
    index?: number
    logger?: any
  }) {
    if (options.element instanceof Element) return options.element

    this._spec = options.spec

    if (options.context) this._context = options.context
    if (options.logger) this._logger = options.logger

    if (this._spec.isElement(options.element)) {
      this._target = this._spec.transformElement?.(options.element) ?? options.element
      // Some frameworks contains information about the selector inside an element
      this._selector = options.selector ?? this._spec.extractSelector?.(options.element)
      this._index = options.index
    } else if (this._spec.isSelector(options.selector)) {
      this._selector = options.selector
    } else {
      throw new TypeError('Element constructor called with argument of unknown type!')
    }
  }

  get target() {
    return this._target
  }

  get selector() {
    return this._selector
  }

  get context() {
    return this._context
  }

  get driver() {
    return this.context.driver
  }

  get isRef() {
    return this.context.isRef || !this.target
  }

  async equals(element: Element<TDriver, TContext, TElement, TSelector> | TElement): Promise<boolean> {
    if (this.isRef) return false

    if (this._spec.isEqualElements) {
      element = element instanceof Element ? element.target : element
      return this._spec.isEqualElements(this.context.target, this.target, element)
    } else {
      return this.context.execute(snippets.isEqualElements, [this, element]).catch(() => false)
    }
  }

  async init(context: Context<TDriver, TContext, TElement, TSelector>): Promise<this> {
    this._context = context
    this._logger = (context as any)._logger
    if (this._target) return this

    if (this._selector) {
      const element = await this._context.element(this._selector)
      if (!element) throw new Error(`Cannot find element with selector ${JSON.stringify(this._selector)}`)
      this._target = element.target
      return this
    }
  }

  async getRegion(): Promise<types.Region> {
    return this.withRefresh(async () => {
      if (this.driver.isNative) {
        const region = await this._spec.getElementRegion(this.driver.target, this.target)
        return this.driver.normalizeRegion(region)
      } else {
        return this.context.execute(snippets.getElementRect, [this, false])
      }
    })
  }

  async getClientRegion(): Promise<types.Region> {
    return this.withRefresh(async () => {
      if (this.driver.isNative) {
        const region = await this._spec.getElementRegion(this.driver.target, this.target)
        return this.driver.normalizeRegion(region)
      } else {
        return this.context.execute(snippets.getElementRect, [this, true])
      }
    })
  }

  async getContentSize(): Promise<types.Size> {
    return this.withRefresh(async () => {
      if (this.driver.isNative) {
        const data = JSON.parse(await this._spec.getElementAttribute(this.driver.target, this.target, 'contentSize'))
        await utils.general.sleep(1500)
        const contentSize = this.driver.isIOS
          ? {width: data.width, height: data.scrollableOffset}
          : {width: data.width, height: data.height + data.scrollableOffset}

        return utils.geometry.scale(contentSize, 1 / this.driver.pixelRatio)
      } else {
        return this.context.execute(snippets.getElementContentSize, [this])
      }
    })
  }

  async isScrollable() {
    return this.withRefresh(async () => {
      if (this.driver.isNative) {
        const isScrollable = JSON.parse(
          await this._spec.getElementAttribute(this.driver.target, this.target, 'scrollable'),
        )
        return isScrollable || false
      } else {
        return this.context.execute(snippets.isElementScrollable, [this])
      }
    })
  }

  async scrollTo(offset: types.Location): Promise<types.Location> {
    return this.withRefresh(async () => {
      if (this.driver.isNative) {
        const currentScrollOffset = await this.getScrollOffset()
        if (utils.geometry.equals(offset, currentScrollOffset)) {
          return utils.geometry.scale(currentScrollOffset, 1 / this.driver.pixelRatio)
        }
        const scaledCurrentScrollOffset = utils.geometry.scale(currentScrollOffset, this.driver.pixelRatio)
        const scaledOffset = utils.geometry.scale(offset, this.driver.pixelRatio)

        const region = await this._spec.getElementRegion(this.driver.target, this.target)
        let contentSize = JSON.parse(
          await this._spec.getElementAttribute(this.driver.target, this.target, 'contentSize'),
        )
        await utils.general.sleep(1500)
        contentSize = this.driver.isIOS
          ? {width: contentSize.width, height: contentSize.scrollableOffset}
          : {width: contentSize.width, height: contentSize.height + contentSize.scrollableOffset}
        const requiredOffset = {
          x: Math.min(scaledOffset.x, region.width * (contentSize.width / region.width - 1)),
          y: Math.min(scaledOffset.y, region.height * (contentSize.height / region.height - 1)),
        }
        const padding = 24

        const actions = []

        const yDefaultOffset = Math.floor(region.y + region.height / 2)
        let xOffset = requiredOffset.x - scaledCurrentScrollOffset.x
        while (xOffset > 0) {
          const xStart = region.x + Math.min(xOffset + padding, region.width - padding)
          const xEnd = region.y + padding
          actions.push(
            {action: 'press', x: xStart, y: yDefaultOffset},
            {action: 'wait', ms: 1500},
            {action: 'moveTo', x: xEnd, y: yDefaultOffset},
            {action: 'release'},
          )
          xOffset -= xStart - xEnd
        }

        const xDefaultOffset = Math.floor(region.x + region.width / 2)
        let yOffset = requiredOffset.y - scaledCurrentScrollOffset.y
        while (yOffset > 0) {
          const yStart = region.y + Math.min(yOffset + padding, region.height - padding)
          const yEnd = region.y + padding
          actions.push(
            {action: 'press', x: xDefaultOffset, y: yStart},
            {action: 'wait', ms: 1500},
            {action: 'moveTo', x: xDefaultOffset, y: yEnd},
            {action: 'release'},
          )
          yOffset -= yStart - yEnd
        }

        if (actions.length > 0) {
          await this._spec.performAction(this.driver.target, actions)
        }

        this._state.scrollOffset = utils.geometry.scale(requiredOffset, 1 / this.driver.pixelRatio)
        return this._state.scrollOffset
      } else {
        return this.context.execute(snippets.scrollTo, [this, {x: Math.round(offset.x), y: Math.round(offset.y)}])
      }
    })
  }

  async translateTo(offset: types.Location): Promise<types.Location> {
    return this.withRefresh(async () => {
      if (this.driver.isNative) {
        throw new Error('Cannot apply css translate scrolling on non-web element')
      } else {
        return this.context.execute(snippets.translateTo, [this, {x: Math.round(offset.x), y: Math.round(offset.y)}])
      }
    })
  }

  async getScrollOffset(): Promise<types.Location> {
    if (this.driver.isNative) {
      return utils.geometry.scale(this._state.scrollOffset ?? {x: 0, y: 0}, 1 / this.driver.pixelRatio)
    } else {
      return this.withRefresh(() => this.context.execute(snippets.getElementScrollOffset, [this]))
    }
  }

  async getTranslateOffset(): Promise<types.Location> {
    if (this.driver.isNative) {
      throw new Error('Cannot apply css translate scrolling on non-web element')
    } else {
      return this.withRefresh(() => this.context.execute(snippets.getElementTranslateOffset, [this]))
    }
  }

  async getInnerOffset(): Promise<types.Location> {
    if (this.driver.isNative) {
      return this._state.scrollOffset
        ? utils.geometry.scale(this._state.scrollOffset, 1 / this.driver.pixelRatio)
        : {x: 0, y: 0}
    } else {
      return this.withRefresh(() => this.context.execute(snippets.getElementInnerOffset, [this]))
    }
  }

  async preserveState(): Promise<ElementState> {
    if (this.driver.isNative) return
    // TODO create one js snippet
    const scrollOffset = await this.getScrollOffset()
    const transforms = await this.context.execute(snippets.getElementStyleProperties, [
      this,
      ['transform', '-webkit-transform'],
    ])
    this._state = {scrollOffset, transforms}
    return this._state
  }

  async restoreState(state: ElementState = this._state): Promise<void> {
    if (this.driver.isNative) return
    if (!state) return
    if (state.scrollOffset) await this.scrollTo(state.scrollOffset)
    if (state.transforms) await this.context.execute(snippets.setElementStyleProperties, [this, state.transforms])
  }

  async hideScrollbars(): Promise<void> {
    if (this.driver.isNative) return
    return this.withRefresh(async () => {
      const {overflow} = await this.context.execute(snippets.setElementStyleProperties, [this, {overflow: 'hidden'}])
      this._originalOverflow = overflow
    })
  }

  async restoreScrollbars(): Promise<void> {
    return this.withRefresh(async () => {
      await this.context.execute(snippets.setElementStyleProperties, [this, {overflow: this._originalOverflow}])
    })
  }

  async refresh(freshElement?: TElement): Promise<boolean> {
    if (this._spec.isElement(freshElement)) {
      this._target = freshElement
      return true
    }
    if (!this._selector) return false
    const element =
      this._index > 0
        ? await this.context.elements(this._selector).then(elements => elements[this._index])
        : await this.context.element(this._selector)
    if (element) {
      this._target = element.target
    }
    return Boolean(element)
  }

  async withRefresh<TResult>(operation: (...args: any[]) => TResult): Promise<TResult> {
    if (!this._spec.isStaleElementError) return operation()
    try {
      const result = await operation()
      // Some frameworks could handle stale element reference error by itself or doesn't throw an error
      if (this._spec.isStaleElementError(result, this.selector)) {
        await this.refresh()
        return operation()
      }
      return result
    } catch (err) {
      if (this._spec.isStaleElementError(err)) {
        const refreshed = await this.refresh()
        if (refreshed) return operation()
      }
      throw err
    }
  }

  toJSON(): TElement {
    return this.target
  }
}
