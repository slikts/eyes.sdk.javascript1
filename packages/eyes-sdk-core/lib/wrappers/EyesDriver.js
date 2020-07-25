'use strict'
const ArgumentGuard = require('../utils/ArgumentGuard')
const TypeUtils = require('../utils/TypeUtils')
const RectangleSize = require('../geometry/RectangleSize')
const Region = require('../geometry/Region')
const MutableImage = require('../images/MutableImage')
const EyesUtils = require('../EyesUtils')

/**
 * @template TDriver, TElement, TSelector
 * @typedef {Object} SpecDriver
 * @prop {(driver: any) => driver is TDriver} isDriver
 * @prop {(element: any) => element is TElement} isElement
 * @prop {(selector: any) => selector is TSelector} isSelector
 * @prop {(driver: TDriver) => TDriver} [transformDriver]
 * @prop {(element: TElement) => TElement} [transformElement]
 * @prop {(driver: TDriver, selector: TSelector) => TElement} findElement
 * @prop {(driver: TDriver, selector: TSelector) => TElement[]} findElements
 * @prop {(driver: TDriver, script: Function, ...args: any[]) => Promise<any>} executeScript
 */

/**
 * @template TDriver - TDriver provided by wrapped framework
 * @template TElement - TElement provided by wrapped framework
 * @template TSelector - TSelector supported by framework
 */
class EyesDriver {
  static specialize(spec) {
    return class SpecializedDriver extends EyesDriver {
      static spec() {
        return spec
      }
      get spec() {
        return spec
      }
    }
  }

  static isDriver(driver) {
    return driver instanceof EyesDriver || this.spec.isDriver(driver)
  }

  static toFrameworkSelector(selector) {
    return this.spec.toFrameworkSelector(selector)
  }

  static toEyesSelector(selector) {
    return this.spec.toEyesSelector(selector)
  }

  constructor(logger, driver) {
    if (driver instanceof EyesDriver) {
      return driver
    }

    this._logger = logger

    if (this.spec.isDriver(driver)) {
      this._driver = this.spec.transformDriver ? this.spec.transformDriver(driver) : driver
    } else {
      throw new TypeError('EyesDriver constructor called with argument of unknown type!')
    }

    // TODO extract main context before pass it to the frame
    this._mainContext = this.spec.newContext(this._logger, this._driver, {driver: this})
    this._currentContext = this._mainContext
  }

  get spec() {
    throw new TypeError('The class is not specialized. Create a specialize EyesDriver first')
  }

  get currentContext() {
    return this._currentContext
  }

  get mainContext() {
    return this._mainContext
  }

  updateCurrentContext(context) {
    this._currentContext = context
  }

  async init() {
    await this._mainContext.init(this)
    this._mainContext._context = this._driver
    // this._isStateless = await this.spec.isStateless(this._driver)
    // this._isNative = await this.spec.isNative(this._driver)
    // this._isMobile = await this.spec.isMobile(this._driver)
    // this._isAndroid = await this.spec.isAndroid(this._driver)
    // this._isIOS = await this.spec.isIOS(this._driver)
    return this
  }

  async refreshContexts() {
    if (this._isNative || this._isStateless) return
    let contextInfo = await EyesUtils.getContextInfo(this._logger, this)
    if (contextInfo.isRoot) {
      return (this._currentContext = this._mainContext)
    }
    const path = []
    while (!contextInfo.isRoot) {
      await this.spec.parentContext()
      let contextReference
      if (contextInfo.selector) {
        contextReference = await this.spec.findElement(
          this._driver,
          this.spec.toFrameworkSelector({type: 'xpath', selector: contextInfo.selector}),
        )
      } else {
        const framesInfo = await EyesUtils.getChildFramesInfo(this._logger, this)
        for (const frameInfo of framesInfo) {
          if (frameInfo.isCORS !== contextInfo.isCORS) continue
          await this.spec.childContext(frameInfo.element)
          const contentDocument = await this.spec.findElement(
            this._driver,
            this.spec.toFrameworkSelector({type: 'css', selector: 'html'}),
          )
          if (await this.spec.isEqualElements(contentDocument, contextInfo.contentDocument)) {
            contextReference = frameInfo.element
            await context.frameParent()
            break
          }
        }
      }
      if (!contextReference) throw new Error('Unable to find out the chain of frames')
      path.unshift(contextReference)
      contextInfo = await EyesUtils.getContextInfo(this._logger, this)
    }
    this._currentContext = this._mainContext
    return this.switchToChildContext(...path)
  }

  async switchTo(context) {
    if (await this._currentContext.equals(context)) return
    const currentPath = this._currentContext.path
    const requiredPath = context.path

    let diffIndex = -1
    for (const [index, context] of requiredPath.entries()) {
      if (currentPath[index] && !(await currentPath[index].equals(context))) {
        diffIndex = index
        break
      }
    }

    if (diffIndex === 0) {
      throw new Error('Cannot switch to the context, because it has different main context')
    } else if (diffIndex === -1) {
      if (currentPath.length === requiredPath.length) {
        // required and current paths are the same
        return this._currentContext
      } else if (requiredPath.length > currentPath.length) {
        // current path is a sub-path of required path
        return this.switchToChildContext(...requiredPath)
      } else if (currentPath.length - requiredPath.length <= requiredPath.length) {
        // required path is a sub-path of current path
        return this.switchToParentContext(currentPath.length - requiredPath.length)
      } else {
        // required path is a sub-path of current path
        await this.switchToMainContext()
        return this.switchToChildContext(...requiredPath)
      }
    } else if (currentPath.length - diffIndex <= diffIndex) {
      // required path is different from current or they are partially intersected
      // chose an optimal way to traverse from current context to target context
      await this.switchToParentContext(currentPath.length - diffIndex)
      return this.switchToChildContext(...requiredPath.slice(diffIndex))
    } else {
      await this.switchToMainContext()
      return this.switchToChildContext(...requiredPath)
    }
  }

  async switchToMainContext() {
    if (this._isNative) return
    this._logger.verbose('EyesDriver.switchToMainContext()')
    if (!this._isStateless) {
      await this.spec.mainContext(this._currentContext.unwrapped)
    }
    this._currentContext = this._mainContext
    return this._currentContext
  }

  async switchToParentContext(elevation = 1) {
    if (this._isNative) return this._currentContext
    this._logger.verbose(`EyesDriver.switchToParentContext(${elevation})`)
    if (this._currentContext.path.length <= elevation) {
      return this.switchToMainContext()
    }

    try {
      while (elevation > 0) {
        await this.spec.parentContext(this._currentContext.unwrapped)
        this._currentContext = this._currentContext.parent
        elevation -= 1
      }
    } catch (err) {
      this._logger.verbose('WARNING: error during switch to parent frame', err)
      const path = this._currentContext.path.slice(1, -elevation)
      await this.switchToMainContext()
      await this.switchToChildContext(...path)
      elevation = 0
    }
    return this._currentContext
  }

  async switchToChildContext(...references) {
    if (this._isNative) return
    this._logger.verbose('EyesDriver.childContext()')
    for (const reference of references) {
      if (reference === this._mainContext) continue
      const context = await this._currentContext.context(reference)
      await context.focus()
    }
    return this._currentContext
  }

  async element(selector) {
    return this._currentContext.element(selector)
  }

  async elements(selector) {
    return this._currentContext.elements(selector)
  }

  async execute(script, ...args) {
    return this._currentContext.execute(script, ...args)
  }

  async takeScreenshot() {
    const screenshot = await this.spec.takeScreenshot(this._driver)
    return new MutableImage(screenshot)
  }

  async getViewportSize() {
    const size = this.spec.getViewportSize
      ? await this.spec.getViewportSize(this._driver)
      : await EyesUtils.getViewportSize(this._logger, this._mainContext)
    return new RectangleSize(size)
  }

  async setViewportSize(size) {
    return this.spec.setViewportSize
      ? this.spec.setViewportSize(this._driver, size)
      : EyesUtils.setViewportSize(this._logger, this._mainContext, new RectangleSize(size))
  }

  async getWindowRect() {
    const {x = 0, y = 0, width, height} = this.spec.getWindowRect
      ? await this.spec.getWindowRect(this._driver)
      : await this.spec.getViewportSize(this._driver)
    return new Region({x, y, width, height})
  }

  async setWindowRect(rect) {
    return this.spec.getWindowRect
      ? this.spec.getWindowRect(this._driver)
      : this.spec.getViewportSize(this._driver, {width: rect.width, height: rect.height})
  }

  async getPixelRatio() {
    if (this._isNative) {
      const viewportSize = await this.getViewportSize()
      const screenshot = await this.takeScreenshot()
      return screenshot.getWidth() / viewportSize.getWidth()
    } else {
      return EyesUtils.getPixelRatio()
    }
  }

  async getTitle() {
    if (this._isNative) return null
    return this.spec.getTitle(this._driver)
  }

  async getUrl() {
    if (this._isNative) return null
    return this.spec.getTitle(this._driver)
  }

  async proxify(driver) {
    return this.spec.proxyDriver(driver, this)
  }
}

module.exports = EyesDriver
