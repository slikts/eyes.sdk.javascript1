const utils = require('@applitools/utils')
const makeTakeScreenshot = require('./takeScreenshot')

async function takeViewportScreenshot({logger, context, region, wait, stabilization, debug = {}}) {
  logger.verbose('Taking image of...')

  const driver = context.driver
  const takeScreenshot = makeTakeScreenshot({logger, driver, stabilization, debug})

  const image = await takeScreenshot()

  await utils.general.sleep(wait)

  if (region) {
    const cropRegion = await driver.getRegionInViewport(context, region)
    await image.crop(cropRegion)
    await image.debug({path: debug.path, suffix: 'region'})
    return {image, region: cropRegion}
  } else {
    return {image, region: {x: 0, y: 0, width: image.width, height: image.height}}
  }
}

module.exports = takeViewportScreenshot
