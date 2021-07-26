const utils = require('@applitools/utils')

async function scrollIntoViewport({logger, context, scroller, region}) {
  if (context.driver.isNative) {
    logger.verbose(`NATIVE context identified, skipping 'ensure element visible'`)
    return
  }
  const elementContextRegion = region ? {...region} : await scroller.getClientRegion()
  const contextViewportLocation = await context.getLocationInViewport()
  const elementViewportRegion = utils.geometry.offset(elementContextRegion, contextViewportLocation)
  const viewportRegion = await context.main.getRegion()
  if (utils.geometry.contains(viewportRegion, elementViewportRegion)) return {x: 0, y: 0}

  let currentContext = context
  let remainingOffset = {x: elementContextRegion.x, y: elementContextRegion.y}
  while (currentContext) {
    const scrollRootElement = await currentContext.getScrollRootElement()
    const scrollRootOffset = scrollRootElement
      ? await scrollRootElement.getClientRegion().then(rect => ({x: rect.x, y: rect.y}))
      : {x: 0, y: 0}

    const actualOffset = await scroller.moveTo(
      utils.geometry.offsetNegative(remainingOffset, scrollRootOffset),
      scrollRootElement,
    )

    remainingOffset = utils.geometry.offset(
      utils.geometry.offsetNegative(remainingOffset, actualOffset),
      await currentContext.getClientLocation(),
    )
    currentContext = currentContext.parent
  }
  return remainingOffset
}

module.exports = scrollIntoViewport
