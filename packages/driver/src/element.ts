import type * as types from '@applitools/types'
import type {Context} from './context'
import * as utils from '@applitools/utils'
const snippets = require('@applitools/snippets')

const ANDROID_CLASSES = [
  'android.support.v7.widget.RecyclerView',
  'androidx.recyclerview.widget.RecyclerView',
  'androidx.viewpager2.widget.ViewPager2',
  'android.widget.ListView',
  'android.widget.GridView',
]

export type ElementState = {
  contentSize?: types.Size
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
      if (this.driver.isWeb) {
        return this.context.execute(snippets.getElementRect, [this, false])
      } else {
        const region = await this._spec.getElementRegion(this.driver.target, this.target)
        return this.driver.normalizeRegion(region)
      }
    })
  }

  async getClientRegion(): Promise<types.Region> {
    return this.withRefresh(async () => {
      if (this.driver.isWeb) {
        return this.context.execute(snippets.getElementRect, [this, true])
      } else {
        const region = await this._spec.getElementRegion(this.driver.target, this.target)
        return this.driver.normalizeRegion(region)
      }
    })
  }

  async getContentSize(): Promise<types.Size> {
    return this.withRefresh(async () => {
      if (this.driver.isWeb) {
        return this.context.execute(snippets.getElementContentSize, [this])
      } else {
        if (this._state.contentSize) return this._state.contentSize
        try {
          const data = JSON.parse(await this._spec.getElementAttribute(this.driver.target, this.target, 'contentSize'))

          let contentHeight

          if (data.scrollableOffset === 0) {
            const className = await this._spec.getElementAttribute(this.driver.target, this.target, 'className')
            console.log(className)
            if (ANDROID_CLASSES.includes(className)) {
              const hiddenElement = await this.driver.element({
                type: '-android uiautomator',
                selector: 'new UiSelector().description("EyesAppiumHelper")',
              })
              if (hiddenElement) {
                const g: any = this.driver.target
                const e = await g.$(hiddenElement.target)
                await e.click()
                contentHeight = Number(await e.getText())
              }
            }
          } else {
            contentHeight = this.driver.isIOS ? data.scrollableOffset : data.height + data.scrollableOffset
          }

          this._state.contentSize = utils.geometry.scale(
            {width: data.width, height: contentHeight},
            1 / this.driver.pixelRatio,
          )

          // android has a bug when after extracting 'contentSize' attribute the element is being scrolled by undetermined number of pixels
          const originalScrollOffset = await this.getScrollOffset()
          this._state.scrollOffset = {x: -1, y: -1}
          await this.scrollTo({x: 0, y: 0})
          await this.scrollTo(originalScrollOffset)

          return this._state.contentSize
        } catch (err) {
          console.log(err)
          return utils.geometry.size(await this.getClientRegion())
        }
      }
    })
  }

  async isScrollable() {
    return this.withRefresh(async () => {
      if (this.driver.isWeb) {
        return this.context.execute(snippets.isElementScrollable, [this])
      } else {
        const data = JSON.parse(await this._spec.getElementAttribute(this.driver.target, this.target, 'scrollable'))
        return Boolean(data) || false
      }
    })
  }

  async scrollTo(offset: types.Location): Promise<types.Location> {
    return this.withRefresh(async () => {
      offset = {x: Math.round(offset.x), y: Math.round(offset.y)}
      if (this.driver.isWeb) {
        return this.context.execute(snippets.scrollTo, [this, offset])
      } else {
        const currentScrollOffset = await this.getScrollOffset()
        if (utils.geometry.equals(offset, currentScrollOffset)) return currentScrollOffset

        const contentSize = await this.getContentSize()
        const scrollableRegion = await this._spec.getElementRegion(this.driver.target, this.target)
        const scaledScrollableRegion = utils.geometry.scale(scrollableRegion, 1 / this.driver.pixelRatio)
        const maxOffset = {
          x: Math.round(scaledScrollableRegion.width * (contentSize.width / scaledScrollableRegion.width - 1)),
          y: Math.round(scaledScrollableRegion.height * (contentSize.height / scaledScrollableRegion.height - 1)),
        }
        let requiredOffset
        let remainingOffset
        if (offset.x === 0 && offset.y === 0) {
          requiredOffset = offset
          remainingOffset = {x: -maxOffset.x, y: -maxOffset.y}
        } else {
          requiredOffset = {x: Math.min(offset.x, maxOffset.x), y: Math.min(offset.y, maxOffset.y)}
          remainingOffset = utils.geometry.offsetNegative(requiredOffset, currentScrollOffset)
        }
        remainingOffset = utils.geometry.scale(remainingOffset, this.driver.pixelRatio)

        const actions = []

        const xPadding = Math.floor(scrollableRegion.width * 0.1)
        const yCenter = Math.floor(scrollableRegion.y + scrollableRegion.height / 2)
        const xLeft = scrollableRegion.y + xPadding
        const xDirection = remainingOffset.y > 0 ? 'right' : 'left'
        let xRemaining = Math.abs(remainingOffset.x)
        while (xRemaining > 0) {
          const xRight = scrollableRegion.x + Math.min(xRemaining + xPadding, scrollableRegion.width - xPadding)
          const [xStart, xEnd] = xDirection === 'right' ? [xRight, xLeft] : [xLeft, xRight]
          actions.push(
            {action: 'press', x: xStart, y: yCenter},
            {action: 'wait', ms: 1500},
            {action: 'moveTo', x: xEnd, y: yCenter},
            {action: 'release'},
          )
          xRemaining -= xRight - xLeft
        }

        const yPadding = Math.floor(scrollableRegion.height * 0.1)
        const xCenter = Math.floor(scrollableRegion.x + scrollableRegion.width / 2) // 0
        const yTop = scrollableRegion.y + yPadding
        const yDirection = remainingOffset.y > 0 ? 'down' : 'up'
        let yRemaining = Math.abs(remainingOffset.y) + 48
        while (yRemaining > 0) {
          const yBottom = scrollableRegion.y + Math.min(yRemaining + yPadding, scrollableRegion.height - yPadding)
          const [yStart, yEnd] = yDirection === 'down' ? [yBottom, yTop] : [yTop, yBottom]
          actions.push(
            {action: 'press', x: xCenter, y: yStart},
            {action: 'wait', ms: 1500},
            {action: 'moveTo', x: xCenter, y: yEnd},
            {action: 'wait', ms: 1500},
            {action: 'release'},
          )
          yRemaining -= yBottom - yTop
        }

        if (actions.length > 0) {
          await this._spec.performAction(this.driver.target, actions)
        }

        this._state.scrollOffset = requiredOffset
        return this._state.scrollOffset
      }
    })
  }

  async translateTo(offset: types.Location): Promise<types.Location> {
    offset = {x: Math.round(offset.x), y: Math.round(offset.y)}
    if (this.driver.isWeb) {
      return this.withRefresh(async () => this.context.execute(snippets.translateTo, [this, offset]))
    } else {
      throw new Error('Cannot apply css translate scrolling on non-web element')
    }
  }

  async getScrollOffset(): Promise<types.Location> {
    if (this.driver.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementScrollOffset, [this]))
    } else {
      return this._state.scrollOffset ?? {x: 0, y: 0}
    }
  }

  async getTranslateOffset(): Promise<types.Location> {
    if (this.driver.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementTranslateOffset, [this]))
    } else {
      throw new Error('Cannot apply css translate scrolling on non-web element')
    }
  }

  async getInnerOffset(): Promise<types.Location> {
    if (this.driver.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementInnerOffset, [this]))
    } else {
      return this.getScrollOffset()
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
