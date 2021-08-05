const utils = require('@applitools/utils')
const makeTakeScreenshot = require('./take-screenshot')

async function takeViewportScreenshot({logger, context, region, wait, stabilization, debug = {}}) {
  logger.verbose('Taking image of...')

  const driver = context.driver
  const takeScreenshot = makeTakeScreenshot({logger, driver, stabilization, debug})

  const image = await takeScreenshot()

  await utils.general.sleep(wait)

  if (region) {
    const cropRegion = await driver.getRegionInViewport(context, region)
    if (utils.geometry.isEmpty(cropRegion)) throw new Error('Screenshot region is out of viewport')
    await image.crop(cropRegion)
    await image.debug({path: debug.path, suffix: 'region'})
    return {image, region: utils.geometry.offset(region, await context.getLocationInMainContext())}
  } else {
    return {image, region: utils.geometry.region(await context.main.getInnerOffset(), image.size)}
  }
}

module.exports = takeViewportScreenshot
