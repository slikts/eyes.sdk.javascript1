const utils = require('@applitools/utils')
const makeImage = require('./image')
const makeTakeScreenshot = require('./takeScreenshot')

async function takeStitchedScreenshot({
  logger,
  context,
  scroller,
  region,
  overlap = 50,
  framed,
  wait,
  stabilization,
  debug = {},
}) {
  logger.verbose('Taking full image of...')

  const scrollerRegion = utils.geometry.region({x: 0, y: 0}, await scroller.getSize())
  logger.verbose(`Scroller size: ${scrollerRegion}`)

  const driver = context.driver
  const takeScreenshot = makeTakeScreenshot({logger, driver, stabilization, debug})

  const initialOffset = region ? utils.geometry.location(region) : {x: 0, y: 0}
  const actualOffset = await scroller.moveTo(initialOffset)
  const expectedRemainingOffset = utils.geometry.offsetNegative(initialOffset, actualOffset)

  await utils.general.sleep(wait)

  logger.verbose('Getting initial image...')
  let image = await takeScreenshot({name: 'initial'})
  const frameImage = framed ? makeImage(image) : null

  const cropRegion = await driver.getRegionInViewport(
    context,
    region || (await scroller.getClientRegion()),
  )

  logger.verbose('cropping...')
  await image.crop(cropRegion)
  await image.debug({path: debug.path, name: 'initial', suffix: 'region'})

  if (region) region = utils.geometry.intersect(region, scrollerRegion)
  else region = scrollerRegion

  region = {
    x: Math.round(region.x),
    y: Math.round(region.y),
    width: Math.round(region.width),
    height: Math.round(region.height),
  }

  const padding = {top: 0, bottom: 0}
  const [_, ...partRegions] = utils.geometry.divide(region, image.size, padding)
  logger.verbose('Part regions', partRegions)

  logger.verbose('Creating stitched image composition container')
  const composition = makeImage({width: region.width, height: region.height})

  logger.verbose('Adding initial image...')
  await composition.copy(await image.toObject(), {x: 0, y: 0})

  logger.verbose('Getting the rest of the image parts...')

  let stitchedSize = {width: image.width, height: image.height}
  for (const partRegion of partRegions) {
    const partName = `${partRegion.x}_${partRegion.y}_${partRegion.width}x${partRegion.height}`
    logger.verbose(`Processing part ${partName}`)

    const partOffset = utils.geometry.location(partRegion)
    const requiredOffset = utils.geometry.offsetNegative(partOffset, {x: 0, y: padding.top})

    logger.verbose(`Move to ${requiredOffset}`)
    const actualOffset = await scroller.moveTo(requiredOffset)
    const remainingOffset = utils.geometry.offsetNegative(
      utils.geometry.offsetNegative(requiredOffset, actualOffset),
      expectedRemainingOffset,
    )
    const cropPartRegion = {
      x: cropRegion.x + remainingOffset.x,
      y: cropRegion.y + remainingOffset.y + padding.top,
      width: Math.min(cropRegion.width, partRegion.width),
      height: Math.min(cropRegion.height, partRegion.height),
    }
    logger.verbose(`Actual offset is ${actualOffset}, remaining offset is ${remainingOffset}`)

    await utils.general.sleep(wait)

    // TODO maybe remove
    if (utils.geometry.isEmpty(cropPartRegion)) continue

    logger.verbose('Getting image...')
    image = await takeScreenshot({name: partName})

    logger.verbose('cropping...')
    await image.crop(cropPartRegion)
    await image.debug({path: debug.path, name: partName, suffix: 'region'})

    await composition.copy(
      await image.toObject(),
      utils.geometry.offsetNegative(partOffset, initialOffset),
    )

    stitchedSize = {width: partOffset.x + image.width, height: partOffset.y + image.height}
  }

  logger.verbose(`Extracted entire size: ${region}`)
  logger.verbose(`Actual stitched size: ${stitchedSize}`)

  if (stitchedSize.width < composition.width || stitchedSize.height < composition.height) {
    logger.verbose('Trimming unnecessary margins...')
    await composition.crop({
      x: 0,
      y: 0,
      width: Math.min(stitchedSize.width, composition.width),
      height: Math.min(stitchedSize.height, composition.height),
    })
  }

  await composition.debug({path: debug.path, name: 'stitched'})

  if (frameImage) {
    await frameImage.replace(await composition.toObject(), cropRegion)
    await frameImage.debug({path: debug.path, name: 'framed'})

    return {image: frameImage, region: utils.geometry.region(cropRegion, composition.size)}
  } else {
    return {image: composition, region: cropRegion}
  }
}

module.exports = takeStitchedScreenshot
