'use strict'
const {makeDriver} = require('@applitools/driver')
const screenshoter = require('@applitools/screenshoter')
const ArgumentGuard = require('../utils/ArgumentGuard')
const Region = require('../geometry/Region')
const Location = require('../geometry/Location')
const RectangleSize = require('../geometry/RectangleSize')
const ReadOnlyPropertyHandler = require('../handler/ReadOnlyPropertyHandler')
const TestFailedError = require('../errors/TestFailedError')
const EyesBase = require('./EyesBase')
const Logger = require('../logging/Logger')
const GeneralUtils = require('../utils/GeneralUtils')
const TypeUtils = require('../utils/TypeUtils')
const TestResults = require('../TestResults')
const takeDomCapture = require('../utils/takeDomCapture')

class EyesCore extends EyesBase {
  constructor(serverUrl, isDisabled) {
    super(serverUrl, isDisabled)

    /** @type {EyesWrappedDriver<TDriver, TElement, TSelector>} */
    this._driver = undefined
    /** @private @type {EyesBrowsingContext<TDriver, TElement, TSelector>} */
    this._context = undefined
    /** @private */
    this._rotation = undefined
  }

  async check(checkSettings) {
    return this._check(checkSettings)
  }

  async checkAndClose(checkSettings, throwEx) {
    if (this._configuration.getIsDisabled()) {
      this._logger.log(`checkAndClose(${checkSettings}): Ignored`)
      return new TestResults()
    }
    ArgumentGuard.isValidState(this._isOpen, 'Eyes not open')

    checkSettings = this.spec.newCheckSettings(checkSettings)

    this._logger.verbose(`checkAndClose(checkSettings) - begin`)

    return this._check(checkSettings, true, throwEx)
  }

  async locate(visualLocatorSettings) {
    ArgumentGuard.notNull(visualLocatorSettings, 'visualLocatorSettings')
    this._logger.verbose('Get locators with given names: ', visualLocatorSettings.locatorNames)
    const screenshot = await this._getViewportScreenshot()
    const screenshotBuffer = await screenshot.getImage().getImageBuffer()
    const id = GeneralUtils.guid()
    await this.getAndSaveRenderingInfo()
    const imageUrl = await this._serverConnector.uploadScreenshot(id, screenshotBuffer)
    const appName = this._configuration.getAppName()
    return this._serverConnector.postLocators({
      appName,
      imageUrl,
      locatorNames: visualLocatorSettings.locatorNames,
      firstOnly: visualLocatorSettings.firstOnly,
    })
  }

  async extractText(regions) {
    if (!TypeUtils.isArray(regions)) regions = [regions]

    const driver = makeDriver(this._driver.spec, this._logger, this._driver.wrapper)
    await driver.refreshContexts()

    const extractTextInputs = []

    for (const userRegion of regions) {
      const region = {...userRegion}

      const screenshot = await screenshoter({
        logger: this._logger,
        driver,
        target: Region.isRegionCompatible(region.target)
          ? {
              x: region.target.left,
              y: region.target.top,
              width: region.target.width,
              height: region.target.height,
            }
          : region.target,
        fully: true,
        dom: true,
        hideScrollbars: false, // because otherwise DOM will not be aligned with image // this._configuration.getHideScrollbars(),
        hideCaret: this._configuration.getHideCaret(),
        scrollingMode: this._configuration.getStitchMode().toLocaleLowerCase(),
        overlap: this._configuration.getStitchOverlap(),
        wait: this._configuration.getWaitBeforeScreenshots(),
        stabilization: {
          crop:
            this._cutProviderHandler.get() instanceof NullCutProvider
              ? null
              : this._cutProviderHandler.get().toObject(),
          scale:
            this._scaleProviderHandler.get() instanceof NullScaleProvider
              ? null
              : this._scaleProviderHandler.get().getScaleRatio(),
        },
        debug: {
          path:
            this._debugScreenshotsProvider instanceof NullDebugScreenshotProvider
              ? null
              : this._debugScreenshotsProvider.getPath(),
        },
        takeDomCapture: () => takeDomCapture(this._logger, this._context),
      })

      if (region.hint === undefined && !Region.isRegionCompatible(region.target)) {
        const element = await this._context.element(region.target)
        if (!element) {
          throw new Error(`Unable to find element using provided selector - "${region.target}"`)
        }
        // TODO create a separate snippet with more sophisticated logic
        region.hint = await this._context.execute('return arguments[0].innerText', element)
        if (region.hint) {
          region.hint = region.hint.replace(/[.\\+]/g, '\\$&')
        }
      }

      await this.getAndSaveRenderingInfo()
      const [screenshotUrl, domUrl] = await Promise.all([
        this._serverConnector.uploadScreenshot(GeneralUtils.guid(), await screenshot.image.toPng()),
        this._serverConnector.postDomSnapshot(GeneralUtils.guid(), screenshot.dom),
      ])
      extractTextInputs.push({
        domUrl,
        screenshotUrl,
        location: {x: Math.round(screenshot.region.x), y: Math.round(screenshot.region.y)},
        region: {
          left: 0,
          top: 0,
          width: screenshot.image.width,
          height: screenshot.image.height,
          expected: region.hint,
        },
        minMatch: region.minMatch,
        language: region.language,
      })
    }

    const results = await Promise.all(
      extractTextInputs.map(input => this._serverConnector.extractText(input)),
    )

    return results.reduce((strs, result) => strs.concat(result), [])
  }

  async extractTextRegions(config) {
    ArgumentGuard.notNull(config.patterns, 'patterns')

    const driver = makeDriver(this._driver.spec, this._logger, this._driver.wrapper)
    await driver.refreshContexts()

    const screenshot = await screenshoter({
      logger: this._logger,
      driver,
      dom: true,
      hideScrollbars: false,
      hideCaret: this._configuration.getHideCaret(),
      scrollingMode: this._configuration.getStitchMode().toLocaleLowerCase(),
      overlap: this._configuration.getStitchOverlap(),
      wait: this._configuration.getWaitBeforeScreenshots(),
      stabilization: {
        crop:
          this._cutProviderHandler.get() instanceof NullCutProvider
            ? null
            : this._cutProviderHandler.get().toObject(),
        scale:
          this._scaleProviderHandler.get() instanceof NullScaleProvider
            ? null
            : this._scaleProviderHandler.get().getScaleRatio(),
      },
      debug: {
        path:
          this._debugScreenshotsProvider instanceof NullDebugScreenshotProvider
            ? null
            : this._debugScreenshotsProvider.getPath(),
      },
      takeDomCapture: () => takeDomCapture(this._logger, this._context),
    })

    await this.getAndSaveRenderingInfo()
    const [screenshotUrl, domUrl] = await Promise.all([
      this._serverConnector.uploadScreenshot(GeneralUtils.guid(), await screenshot.image.toPng()),
      this._serverConnector.postDomSnapshot(GeneralUtils.guid(), screenshot.dom),
    ])

    return this._serverConnector.extractTextRegions({
      domUrl,
      screenshotUrl,
      location: {x: Math.round(screenshot.region.x), y: Math.round(screenshot.region.y)},
      patterns: config.patterns,
      ignoreCase: config.ignoreCase,
      firstOnly: config.firstOnly,
      language: config.language,
    })
  }

  /* ------------ Getters/Setters ------------ */

  async getViewportSize() {
    const viewportSize = this._viewportSizeHandler.get()
    return viewportSize ? viewportSize : this._driver.getViewportSize()
  }

  static async setViewportSize(driver, viewportSize) {
    const logger = new Logger(process.env.APPLITOOLS_SHOW_LOGS)
    const eyesDriver = await this.spec.newDriver(logger, driver).init()
    if (!eyesDriver.isMobile) {

      ArgumentGuard.notNull(viewportSize, 'viewportSize')
      await eyesDriver.setViewportSize(viewportSize)
    }
  }

  static async getViewportSize(driver) {
    const logger = new Logger(process.env.APPLITOOLS_SHOW_LOGS)
    const eyesDriver = await this.spec.newDriver(logger, driver).init()
    const viewportSize = await eyesDriver.getViewportSize()
    return viewportSize.toJSON()
  }

  async setViewportSize(viewportSize) {
    if (this._viewportSizeHandler instanceof ReadOnlyPropertyHandler) {
      this._logger.verbose('Ignored (viewport size given explicitly)')
      return Promise.resolve()
    }

    if (!this._driver.isMobile) {
      ArgumentGuard.notNull(viewportSize, 'viewportSize')
      viewportSize = new RectangleSize(viewportSize)
      try {
        await this._driver.setViewportSize(viewportSize.toJSON())
        this._effectiveViewport = new Region(Location.ZERO, viewportSize)
      } catch (e) {
        const viewportSize = await this._driver.getViewportSize()
        this._viewportSizeHandler.set(new RectangleSize(viewportSize))
        throw new TestFailedError('Failed to set the viewport size', e)
      }
    }

    this._viewportSizeHandler.set(new RectangleSize(viewportSize))
  }

  async _getAndSaveBatchInfoFromServer(batchId) {
    ArgumentGuard.notNullOrEmpty(batchId, 'batchId')
    return this._runner.getBatchInfoWithCache(batchId)
  }

  async getAndSaveRenderingInfo() {
    const renderingInfo = await this._runner.getRenderingInfoWithCache()
    this._serverConnector.setRenderingInfo(renderingInfo)
  }

  async getAUTSessionId() {
    if (!this._driver) {
      return undefined
    }
    return this._driver.sessionId
  }

  async getTitle() {
    return this._driver.getTitle()
  }

  getDriver() {
    return this._driver
  }

  getRemoteWebDriver() {
    return this._driver.unwrapped
  }

  getRunner() {
    return this._runner
  }

  getDevicePixelRatio() {
    return this._devicePixelRatio
  }

  getRegionToCheck() {
    return this._regionToCheck
  }

  setRegionToCheck(regionToCheck) {
    this._regionToCheck = regionToCheck
  }

  shouldStitchContent() {
    return this._stitchContent
  }

  setScrollRootElement(scrollRootElement) {
    if (scrollRootElement === null) {
      this._scrollRootElement = null
    } else if (this.spec.isSelector(scrollRootElement) || this.spec.isElement(scrollRootElement)) {
      this._scrollRootElement = scrollRootElement
    } else {
      this._scrollRootElement = undefined
    }
  }

  getScrollRootElement() {
    return this._scrollRootElement
  }

  setRotation(rotation) {
    this._rotation = rotation

    if (this._driver) {
      this._driver.setRotation(rotation)
    }
  }

  getRotation() {
    return this._rotation
  }

  setForcedImageRotation(degrees) {
    this.setRotation(new ImageRotation(degrees))
  }

  getForcedImageRotation() {
    return this.getRotation().getRotation()
  }

  getDomUrl() {
    return this._domUrl
  }

  setDomUrl(domUrl) {
    this._domUrl = domUrl
  }

  setCorsIframeHandle(corsIframeHandle) {
    this._corsIframeHandle = corsIframeHandle
  }

  getCorsIframeHandle() {
    return this._corsIframeHandle
  }
}

module.exports = EyesCore
