const utils = require('@applitools/utils')
const snippets = require('@applitools/snippets')
const findPattern = require('./findPattern')
const makeCalculateScaleRatio = require('./calculateScaleRatio')
const makeImage = require('./image')

function makeTakeScreenshot(options) {
  const {driver} = options
  if (driver.isNative) {
    return makeTakeNativeScreenshot(options)
  } else if (driver.browserName === 'Firefox') {
    try {
      const browserVersion = Number.parseInt(driver.browserVersion, 10)
      if (browserVersion >= 48 && browserVersion <= 72) {
        return makeTakeMainContextScreenshot(options)
      }
    } catch (ignored) {}
  } else if (driver.browserName === 'Safari') {
    if (driver.isIOS) {
      return makeTakeMarkedScreenshot(options)
    } else if (driver.browserVersion === '11') {
      return makeTakeSafari11Screenshot(options)
    }
  }

  return makeTakeDefaultScreenshot(options)
}

function makeTakeDefaultScreenshot({logger, driver, stabilization = {}, debug = {}}) {
  let calculateScaleRatio
  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking screenshot...')
    const image = makeImage(await driver.takeScreenshot())
    await image.debug({path: debug.path, name, suffix: 'original'})

    if (stabilization.rotate) {
      await image.rotate(stabilization.rotate)
      await image.debug({path: debug.path, name, suffix: 'rotated'})
    }

    if (stabilization.crop) {
      await image.crop(stabilization.crop)
      await image.debug({path: debug.path, name, suffix: 'cropped'})
    }

    if (stabilization.scale) {
      await image.scale(stabilization.scale)
    } else {
      if (!calculateScaleRatio) {
        const viewportSize = await driver.getViewportSize()
        const documentSize = await driver.mainContext.getContentSize()
        calculateScaleRatio = makeCalculateScaleRatio({
          viewportWidth: viewportSize.width,
          documentWidth: documentSize.width,
          pixelRatio: driver.pixelRatio,
        })
      }
      await image.scale(calculateScaleRatio(image.width))
    }
    await image.debug({path: debug.path, name, suffix: 'scaled'})

    return image
  }
}

function makeTakeMainContextScreenshot({logger, driver, stabilization = {}, debug = {}}) {
  let calculateScaleRatio
  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking screenshot...')
    const originalContext = driver.currentContext
    await driver.mainContext.focus()
    const image = makeImage(await driver.takeScreenshot())
    await originalContext.focus()
    await image.debug({path: debug.path, name, suffix: 'original'})

    if (stabilization.rotate) {
      await image.rotate(stabilization.rotate)
      await image.debug({path: debug.path, name, suffix: 'rotated'})
    }

    if (stabilization.crop) {
      await image.crop(stabilization.crop)
      await image.debug({path: debug.path, name, suffix: 'cropped'})
    }

    if (stabilization.scale) {
      await image.scale(stabilization.scale)
    } else {
      if (!calculateScaleRatio) {
        const viewportSize = await driver.getViewportSize()
        const documentSize = await driver.mainContext.getContentSize()
        calculateScaleRatio = makeCalculateScaleRatio({
          viewportWidth: viewportSize.width,
          documentWidth: documentSize.width,
          pixelRatio: driver.pixelRatio,
        })
      }
      await image.scale(calculateScaleRatio(image.width))
    }
    await image.debug({path: debug.path, name, suffix: 'scaled'})

    return image
  }
}

function makeTakeSafari11Screenshot({logger, driver, stabilization = {}, debug = {}}) {
  let viewportSize = null
  let calculateScaleRatio = null

  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking safari 11 driver screenshot...')
    const image = makeImage(await driver.takeScreenshot())
    await image.debug({path: debug.path, name, suffix: 'original'})

    if (stabilization.rotate) {
      await image.rotate(stabilization.rotate)
      await image.debug({path: debug.path, name, suffix: 'rotated'})
    }

    if (stabilization.crop) {
      await image.crop(stabilization.crop)
    } else {
      if (!viewportSize) viewportSize = await driver.getViewportSize()
      const viewportLocation = await driver.mainContext.execute(snippets.getElementScrollOffset, [])
      await image.crop(
        utils.geometry.scale({...viewportLocation, ...viewportSize}, driver.pixelRatio),
      )
    }
    await image.debug({path: debug.path, name, suffix: 'cropped'})

    if (stabilization.scale) {
      await image.scale(stabilization.scale)
    } else {
      if (!calculateScaleRatio) {
        if (!viewportSize) viewportSize = await driver.getViewportSize()
        const documentSize = await driver.mainContext.getContentSize()
        calculateScaleRatio = makeCalculateScaleRatio({
          viewportWidth: viewportSize.width,
          documentWidth: documentSize.width,
          pixelRatio: driver.pixelRatio,
        })
      }
      await image.scale(calculateScaleRatio(image.width))
    }
    await image.debug({path: debug.path, name, suffix: 'scaled'})

    return image
  }
}

function makeTakeMarkedScreenshot({logger, driver, stabilization = {}, debug = {}}) {
  let calculateScaleRatio = null
  let viewportRegion = null

  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking viewport screenshot (using markers)...')
    const image = makeImage(await driver.takeScreenshot())
    await image.debug({path: debug.path, name, suffix: 'original'})

    if (stabilization.rotate) {
      await image.rotate(stabilization.rotate)
      await image.debug({path: debug.path, name, suffix: 'rotated'})
    }

    if (stabilization.crop) {
      await image.crop(stabilization.crop)
    } else {
      if (!viewportRegion) viewportRegion = await getViewportRegion()
      await image.crop(viewportRegion)
    }
    await image.debug({path: debug.path, name, suffix: 'cropped'})

    if (stabilization.scale) {
      await image.scale(stabilization.scale)
    } else {
      if (!calculateScaleRatio) {
        const viewportSize = await driver.getViewportSize()
        const documentSize = await driver.mainContext.getContentSize()
        calculateScaleRatio = makeCalculateScaleRatio({
          viewportWidth: viewportSize.width,
          documentWidth: documentSize.width,
          pixelRatio: driver.pixelRatio,
        })
      }
      await image.scale(calculateScaleRatio(image.width))
    }
    await image.debug({path: debug.path, name, suffix: 'scaled'})

    return image
  }

  async function getViewportRegion() {
    const marker = await driver.mainContext.execute(snippets.addPageMarker)
    try {
      const image = makeImage(await driver.takeScreenshot())
      if (stabilization.rotate) await image.rotate(stabilization.rotate)

      await image.debug('marker') // TODix

      const markerLocation = findPattern(await image.toObject(), marker)
      if (!markerLocation) return null

      const viewportSize = await driver.getViewportSize()
      const scaledViewportSize = utils.geometry.scale(viewportSize, driver.pixelRatio)

      return {...markerLocation, ...scaledViewportSize}
    } finally {
      await driver.mainContext.execute(snippets.cleanupPageMarker)
    }
  }
}

function makeTakeNativeScreenshot({logger, driver, stabilization = {}, debug = {}}) {
  return async function takeScreenshot({name} = {}) {
    logger.verbose('Taking native driver screenshot...')
    const image = makeImage(
      stabilization.crop ? await driver.takeScreenshot() : await takeViewportScreenshot(),
    )
    await image.debug({path: debug.path, name, suffix: 'original'})

    if (stabilization.rotate) {
      await image.rotate(stabilization.rotate)
      await image.debug({path: debug.path, name, suffix: 'rotated'})
    }

    if (stabilization.crop) {
      await image.crop(stabilization.crop)
      await image.debug({path: debug.path, name, suffix: 'cropped'})
    }

    if (stabilization.scale) {
      await image.scale(stabilization.scale)
    } else {
      await image.scale(1 / driver.pixelRatio)
    }
    await image.debug({path: debug.path, name, suffix: 'scaled'})

    return image
  }

  async function takeViewportScreenshot() {
    const base64 = await driver.execute('mobile:viewportScreenshot')
    // trimming line breaks since 3rd party grid providers can return them
    return base64.replace(/\r\n/g, '')
  }
}

module.exports = makeTakeScreenshot
