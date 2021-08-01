const utils = require('@applitools/utils')
const makeTakeScreenshot = require('./takeScreenshot')

async function takeViewportScreenshot({logger, context, region, wait, stabilization, debug = {}}) {
  logger.verbose('Taking image of...')

  const driver = context.driver
  const takeScreenshot = makeTakeScreenshot({logger, driver, stabilization, debug})

  const image = await takeScreenshot()

  await utils.general.sleep(wait)

  if (region) {
    const cropRegion = await context.getRegionInViewport(region)
    if (utils.geometry.isEmpty(cropRegion)) throw new Error('Screenshot region is out of viewport')
    await image.crop(cropRegion)
    await image.debug({path: debug.path, suffix: 'region'})
    return {image, viewportRegion: cropRegion}
  } else {
    return {image, viewportRegion: {x: 0, y: 0, width: image.width, height: image.height}}
  }
}

module.exports = takeViewportScreenshot
