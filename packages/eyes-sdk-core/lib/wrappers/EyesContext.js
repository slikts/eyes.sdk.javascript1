const TypeUtils = require('../utils/TypeUtils')
const Location = require('../geometry/Location')
const RectangleSize = require('../geometry/RectangleSize')
const Region = require('../geometry/Region')
const EyesUtils = require('../EyesUtils')
const EyesElement = require('./EyesElement')

class EyesContext {
  static specialize(spec) {
    return class SpecializedContext extends EyesContext {
      static get spec() {
        return spec
      }
      get spec() {
        return spec
      }
    }
  }

  static isReference(reference) {
    return (
      reference instanceof EyesContext ||
      TypeUtils.isInteger(reference) ||
      TypeUtils.isString(reference) ||
      this.spec.isSelector(reference) ||
      this.spec.isElement(reference)
    )
  }

  static isElement(element) {
    return element instanceof EyesElement || this.spec.isElement(element)
  }

  static isSelector(selector) {
    return this.spec.isSelector(selector)
  }

  constructor(logger, context, options) {
    this._logger = logger
    this._context = context

    if (!options || (!options.reference && !options.element)) {
      // main context
      this._element = null
      this._parent = null
      this._scrollRootElement = options && options.scrollRootElement
      this._driver = options && options.driver
    } else if (this.constructor.isReference(options.reference)) {
      // child context
      if (options.reference instanceof EyesContext) {
        return options.reference
      }
      if (!options.parent) {
        throw new Error('Cannot construct child context without reference to the parent')
      }
      this._reference = options.reference
      this._parent = options.parent
      this._scrollRootElement = options.scrollRootElement
      this._driver = options.driver || this._parent.driver
    } else {
      throw new TypeError('EyesContext constructor called with argument of unknown type!')
    }
  }

  get unwrapped() {
    return this._context
  }

  get driver() {
    return this._driver || this.main._driver
  }

  get parent() {
    return this._parent
  }

  get main() {
    return this._parent ? this._parent.main : this
  }

  get path() {
    return [...(this._parent ? this._parent.path : []), this]
  }

  get isDetached() {
    return !this.main.driver
  }

  get isRef() {
    return !this._context
  }

  get isMain() {
    return this.main === this
  }

  get isCurrent() {
    return !this.isDetached && this._driver.currentContext === this
  }

  get scrollRootElement() {
    return this._scrollRootElement
  }

  set scrollRootElement(scrollRootElement) {
    this._scrollRootElement = scrollRootElement
  }

  attach(context) {
    if (!context.isDetached) {
      throw new Error('Context need to be detached before attach')
    }
    const [main, second, ...others] = context.path
    this._scrollRootElement = main.scrollRootElement
    if (second) {
      second._parent = this
      second._driver = this._driver
      others.forEach(context => (context._driver = this._driver))
    }
    return context
  }

  async equals(context) {
    if (context === this) return true
    if (!this._element) return false
    return this._element.equals(context.element)
  }

  async init(driver) {
    if (this.isDetached) {
      throw new Error('Cannot initialize detached context')
    }

    this._driver = driver
    this._logger = driver._logger

    if (this.isMain) return this
    if (this._parent.isRef) {
      await this._parent.init(driver)
    }

    await this._parent.focus()

    if (this._reference && !this._element) {
      this._logger.verbose(`Context initialization from reference - ${this._reference}`)

      if (TypeUtils.isInteger(this._reference)) {
        this._logger.verbose('Getting frames list...')
        const elements = await this._parent.elements('frame, iframe')
        if (this._reference > elements.length) {
          throw new TypeError(`Frame index [${this._reference}] is invalid!`)
        }
        this._element = elements[this._reference]
      } else if (TypeUtils.isString(this._reference) || this.spec.isSelector(this._reference)) {
        this._logger.verbose('Getting frames by name or id or selector...')
        if (TypeUtils.isString(this._reference)) {
          this._element = await this._parent.element(
            `iframe[name="${this._reference}"], iframe#${this._reference}`,
          )
        }
        if (!this._element && this.spec.isSelector(this._reference)) {
          this._element = await this._parent.element(this._reference)
        }
        if (!this._element) {
          throw new TypeError(`No frame with selector, name or id '${this._reference}' exists!`)
        }
      } else if (this.spec.isElement(this._reference)) {
        this._element = this.spec.newElement(this._logger, this._parent, this._reference)
      } else {
        throw new TypeError('Reference type does not supported!')
      }
      this._reference = null
      this._logger.verbose('Done! getting the specific frame...')
    }

    if (this._element) {
      this._rect = await this._element.getRect()
      this._clientRect = await this._element.getClientRect()
    }

    return this
  }

  async focus() {
    if (this.isDetached) {
      throw new Error('Cannot focus on the detached context')
    } else if (this.isMain) {
      return this._driver.switchToMainContext()
    } else if (!this._parent.isCurrent) {
      return this._driver.switchTo(this)
    }

    // await this._parent.preserveOffset()

    this._context = await this.spec.childContext(this._parent.unwrapped, this._element.unwrapped)

    if (this._scrollRootElement) {
      await this._scrollRootElement.init(this._context)
    }

    await this._driver.updateCurrentContext(this)
  }

  async context(reference) {
    const context =
      reference instanceof EyesContext
        ? reference
        : new this.constructor(null, null, {reference, parent: this})

    if (context.parent !== this) {
      throw Error(`Couldn't find a child context because it has a different parent`)
    }
    return this.isCurrent ? context.init(this._driver) : context
  }

  async element(selectorOrElement) {
    if (this.constructor.isElement(selectorOrElement)) {
      return this.spec.newElement(this._logger, this, selectorOrElement)
    }
    let selector = selectorOrElement
    if (!this.constructor.isSelector(selector)) {
      selector = this.spec.toFrameworkSelector(selector)
    }
    if (this.isDetached) {
      return this.spec.newElement(null, this, null, selector)
    }
    await this.focus()
    const element = await this.spec.findElement(this._context, selector)
    return element ? this.spec.newElement(this._logger, this, element, selector) : null
  }

  async elements(selector) {
    if (!this.constructor.isSelector(selector)) {
      selector = this.spec.toFrameworkSelector(selector)
    }
    await this.focus()
    const elements = await this.spec.findElements(this._context, selector)
    return elements.map(element =>
      this.spec.newElement(this._logger, this._driver, element, selector),
    )
  }

  async execute(script, ...args) {
    await this.focus()
    try {
      const result = await this.spec.executeScript(this._context, script, ...args)
      return result
    } catch (err) {
      this._logger.verbose(`WARNING: execute script error: ${err}`)
      throw err
    }
  }

  async getClientLocation() {
    return // TODO
  }

  async getClientSize() {
    return // TODO
  }

  async getRect() {
    return // TODO
  }

  async getClientRect() {
    return // TODO
  }

  async getLocationInPage() {
    return this.path.reduce(
      (location, context) =>
        location.then(async location => {
          return location.offset(await context.getClientLocation())
        }),
      Promise.resolve(Location.ZERO),
    )
  }

  async getLocationInViewport() {
    return this.path.reduce(
      (location, context) =>
        location.then(async location => {
          const contextLocation = await context.getClientLocation()
          const parentContextLocation = context.parent
            ? await context.parent.getOffset()
            : Location.ZERO
          return location.offset(
            contextLocation.getX() - parentContextLocation.getX(),
            contextLocation.getY() - parentContextLocation.getY(),
          )
        }),
      Promise.resolve(Location.ZERO),
    )
  }

  async getEffectiveSize() {
    const rect = await this.path.reduce(
      (rect, context) =>
        rect.then(async rect => {
          rect.intersect(new Region(Location.ZERO, context.getClientSize()))
          return rect
        }),
      Promise.resolve(new Region(Location.ZERO, this.main.getClientSize())),
    )
    return rect.getSize()
  }

  async getDocumentSize() {
    return // TODO
  }
}

module.exports = EyesContext
