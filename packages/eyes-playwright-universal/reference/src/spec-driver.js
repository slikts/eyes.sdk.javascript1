class SpecDriver {
  constructor(refer) {
    this.commands = {
      isEqualElements,
      executeScript,
      mainContext,
      parentContext,
      childContext,
      findElement,
      findElements,
      getViewportSize,
      setViewportSize,
      getTitle,
      getUrl,
      getDriverInfo,
      takeScreenshot,
      isElement,
    }

    // #region HELPERS
    function transformSelector(selector) {
      // if (TypeUtils.has(selector, ['type', 'selector'])) {
      if (typeof selector === 'object' && 'type' in selector) {
        if (selector.type === 'css') return `css=${selector.selector}`
        else if (selector.type === 'xpath') return `xpath=${selector.selector}`
      }
      return selector
    }
    function extractContext(page) {
      return page.constructor.name === 'Page' ? page.mainFrame() : page
    }
    // #endregion

    // #region COMMANDS
    async function isEqualElements(frame, element1, element2) {
      return refer
        .deref(frame)
        .evaluate(([element1, element2]) => element1 === element2, [
          refer.deref(element1),
          refer.deref(element2),
        ])
        .catch(() => false)
    }
    async function executeScript(frame, script, arg) {
      script = new Function(
        script.startsWith('return') ? script : `return (${script}).apply(null, arguments)`,
      )
      const result = await refer.deref(frame).evaluateHandle(script, deserialize(arg))
      return serialize(result)

      async function serialize(result) {
        const [_, type] = result.toString().split('@')
        if (type === 'array') {
          const map = await result.getProperties()
          return Promise.all(Array.from(map.values(), serialize))
        } else if (type === 'object') {
          const map = await result.getProperties()
          const chunks = await Promise.all(
            Array.from(map, async ([key, handle]) => ({[key]: await serialize(handle)})),
          )
          return Object.assign(...chunks)
        } else if (type === 'node') {
          return refer.ref(result.asElement(), frame)
        } else {
          return result.jsonValue()
        }
      }

      function deserialize(arg) {
        if (!arg) {
          return arg
        } else if (refer.isRef(arg)) {
          return refer.deref(arg)
        } else if (Array.isArray(arg)) {
          return arg.map(deserialize)
        } else if (typeof arg === 'object') {
          return Object.entries(arg).reduce(
            (arg, [key, value]) => Object.assign(arg, {[key]: deserialize(value)}),
            {},
          )
        } else {
          return arg
        }
      }
    }
    async function mainContext(frame) {
      let mainFrame = extractContext(refer.deref(frame))
      while (mainFrame.parentFrame()) {
        mainFrame = mainFrame.parentFrame()
      }
      return refer.ref(mainFrame, frame)
    }
    async function parentContext(frame) {
      frame = extractContext(refer.deref(frame))
      const parentFrame = frame.parentFrame()
      return refer.ref(parentFrame, frame)
    }
    async function childContext(_frame, element) {
      const childFrame = refer.deref(element).contentFrame()
      return refer.ref(childFrame, element)
    }
    async function findElement(frame, selector) {
      const element = await refer.deref(frame).$(transformSelector(selector))
      return element ? refer.ref(element, frame) : null
    }
    async function findElements(frame, selector) {
      const elements = await refer.deref(frame).$$(transformSelector(selector))
      return elements.map(element => refer.ref(element, frame))
    }
    async function getViewportSize(page) {
      return refer.deref(page).viewportSize()
    }
    async function setViewportSize(page, size = {}) {
      return refer.deref(page).setViewportSize(size)
    }
    async function getTitle(page) {
      return refer.deref(page).title()
    }
    async function getUrl(page) {
      return refer.deref(page).url()
    }
    async function getDriverInfo(_page) {
      return {}
    }
    async function takeScreenshot(page) {
      return refer.deref(page).screenshot()
    }

    // #endregion

    // #region Client Implementation

    function isElement(element) {
      if (!element) return false
      return element.constructor.name === 'ElementHandle'
    }

    // #endregion
  }
}

module.exports = SpecDriver
