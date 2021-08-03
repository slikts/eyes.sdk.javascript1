const utils = require('@applitools/utils')
const snippets = require('@applitools/snippets')
const makeScroller = require('./scroller')
const takeStitchedScreenshot = require('./takeStitchedScreenshot')
const takeViewportScreenshot = require('./takeViewportScreenshot')
const scrollIntoViewport = require('./scrollIntoViewport')

async function screenshoter({
  logger,
  driver,
  frames = [],
  target,
  fully,
  hideScrollbars,
  hideCaret,
  scrollingMode,
  overlap,
  framed,
  wait,
  dom,
  lazyRestorePageState,
  stabilization,
  debug,
  takeDomCapture,
}) {
  const originalContext = driver.currentContext

  const targetContext =
    frames.length > 0
      ? await originalContext.context(frames.reduce((parent, frame) => ({...frame, parent}), null))
      : originalContext

  for (const nextContext of targetContext.path) {
    const scrollingElement = await nextContext.getScrollingElement()
    if (scrollingElement) {
      if (driver.isWeb && hideScrollbars) await scrollingElement.hideScrollbars()
      await scrollingElement.preserveState()
    }
  }

  const activeElement = hideCaret && !driver.isNative ? await targetContext.blurElement() : null

  const window = !target && (!frames || frames.length === 0)
  const {context, scroller, region} = await getTargetArea({
    logger,
    context: targetContext,
    window,
    target,
    fully,
    scrollingMode,
  })

  // IMHO problem with scrollbars should be solved by extracting client size of the content (without scrollbars),
  // here we use a historical solution
  if (driver.isWeb && (hideScrollbars || fully)) await scroller.element.hideScrollbars()
  const scrollerState = await scroller.preserveState()

  if (!window) await scrollIntoViewport({logger, context, scroller, region})

  try {
    const screenshot = fully
      ? await takeStitchedScreenshot({
          logger,
          context,
          scroller,
          region,
          overlap,
          framed: framed && !region,
          wait,
          stabilization,
          debug,
        })
      : await takeViewportScreenshot({logger, context, region, wait, stabilization, debug})

    if (dom) {
      // temporary solution
      if (fully) {
        await context.execute(snippets.setElementAttributes, [
          scroller.element,
          {'data-applitools-scroll': true},
        ])
      }

      const scrollingElement = await context.main.getScrollingElement()
      await scroller.moveTo({x: 0, y: 0}, scrollingElement)

      screenshot.dom = await takeDomCapture()
    }

    if (lazyRestorePageState) {
      screenshoter.restorePageState = restorePageState
    }

    return screenshot
  } finally {
    if (!lazyRestorePageState) await restorePageState()
  }
  async function restorePageState() {
    if (scroller.element) {
      await scroller.element.restoreScrollbars()
      await scroller.restoreState(scrollerState)
    }

    if (hideCaret && activeElement) await targetContext.focusElement(activeElement)

    for (const prevContext of targetContext.path.reverse()) {
      const scrollingElement = await prevContext.getScrollingElement()
      if (scrollingElement) {
        if (driver.isWeb && hideScrollbars) await scrollingElement.restoreScrollbars()
        await scrollingElement.restoreState()
      }
    }

    await originalContext.focus()
  }
}

async function getTargetArea({logger, context, target, window, fully, scrollingMode}) {
  if (window) {
    const scrollingElement = await context.main.getScrollingElement()
    return {
      context: context.main,
      scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
    }
  } else if (target) {
    if (utils.types.has(target, ['x', 'y', 'width', 'height'])) {
      const scrollingElement = await context.getScrollingElement()
      return {
        context,
        region: target,
        scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
      }
    } else {
      const element = await context.element(target)
      if (!element) throw new Error('Element not found!')

      if (fully) {
        const isScrollable = await element.isScrollable()
        const scrollingElement = isScrollable ? element : await context.getScrollingElement()
        return {
          context,
          region: isScrollable ? null : await element.getRegion(),
          scroller: makeScroller({
            logger,
            element: scrollingElement,
            scrollingMode:
              scrollingMode === 'css' && !(await scrollingElement.isRoot())
                ? 'mixed'
                : scrollingMode,
          }),
        }
      } else {
        const scrollingElement = await context.getScrollingElement()
        return {
          context,
          region: await element.getRegion(),
          scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
        }
      }
    }
  } else if (!context.isMain && !fully) {
    const scrollingElement = await context.parent.getScrollingElement()
    const element = await context.getContextElement()
    return {
      context: context.parent,
      region: await element.getRegion(), // IMHO we should use CLIENT (without borders) region here
      scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
    }
  } else {
    const scrollingElement = await context.getScrollingElement()
    return {
      context,
      scroller: makeScroller({logger, element: scrollingElement, scrollingMode}),
    }
  }
}

module.exports = screenshoter
