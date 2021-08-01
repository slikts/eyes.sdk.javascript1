const utils = require('@applitools/utils')
const {Driver} = require('@applitools/driver')
const screenshoter = require('@applitools/screenshoter')
const TypeUtils = require('../utils/TypeUtils')
const ArgumentGuard = require('../utils/ArgumentGuard')
const Location = require('../geometry/Location')
const FailureReports = require('../FailureReports')
const ClassicRunner = require('../runner/ClassicRunner')
const takeDomCapture = require('../utils/takeDomCapture')
const EyesCore = require('./EyesCore')
const CheckSettingsUtils = require('../fluent/CheckSettingsUtils')

class EyesClassic extends EyesCore {
  static specialize({agentId, spec}) {
    return class extends EyesClassic {
      static get spec() {
        return spec
      }
      get spec() {
        return spec
      }
      /**
       * @return {string} base agent id
       */
      getBaseAgentId() {
        return agentId
      }
    }
  }

  constructor(serverUrl, isDisabled = false, runner = new ClassicRunner()) {
    super(serverUrl, isDisabled)
    /** @private */
    this._runner = runner
    this._runner.attachEyes(this, this._serverConnector)

    /** @private @type {string}*/
    this._domUrl
    /** @private @type {EyesWrappedElement<TDriver, TElement, TSelector>} */
    this._scrollRootElement = undefined
    /** @private @type {Promise<void>} */
    this._closePromise = Promise.resolve()
  }

  async open(driver, appName, testName, viewportSize, sessionType) {
    ArgumentGuard.notNull(driver, 'driver')

    this._driver = await new Driver({spec: this.spec, driver, logger: this._logger}).init()
    this._context = this._driver.currentContext

    this._configuration.setAppName(TypeUtils.getOrDefault(appName, this._configuration.getAppName()))
    this._configuration.setTestName(TypeUtils.getOrDefault(testName, this._configuration.getTestName()))
    this._configuration.setViewportSize(TypeUtils.getOrDefault(viewportSize, this._configuration.getViewportSize()))
    this._configuration.setSessionType(TypeUtils.getOrDefault(sessionType, this._configuration.getSessionType()))

    if (!this._configuration.getViewportSize()) {
      const vs = await this._driver.getViewportSize()
      this._configuration.setViewportSize(vs)
    }

    if (this._driver.isMobile) {
      // set viewportSize to null if browser is mobile
      this._configuration.setViewportSize(null)
    }

    await this.openBase(
      this._configuration.getAppName(),
      this._configuration.getTestName(),
      this._configuration.getViewportSize(),
      this._configuration.getSessionType(),
    )
  }

  async _check(checkSettings, closeAfterMatch = false, throwEx = true) {
    this._context = await this._driver.refreshContexts()
    await this._context.main.setScrollingElement(this._scrollRootElement)
    await this._context.setScrollingElement(checkSettings.scrollRootElement)

    this._checkSettings = checkSettings

    this._screenshotSettings = {
      driver: this._driver,
      frames:
        checkSettings.frames &&
        checkSettings.frames.map(frame => ({
          reference: utils.types.has(frame, 'frame') ? frame.frame : frame,
          scrollingElement: frame.scrollRootElement,
        })),
      target: checkSettings.region,
      fully: checkSettings.fully || this._configuration.getForceFullPageScreenshot(),
      hideScrollbars: this._configuration.getHideScrollbars(),
      hideCaret: this._configuration.getHideCaret(),
      scrollingMode: this._configuration.getStitchMode().toLocaleLowerCase(),
      overlap: this._configuration.getStitchOverlap(),
      wait: this._configuration.getWaitBeforeScreenshots(),
      dom: checkSettings.sendDom || this._configuration.getSendDom(),
      stabilization: {}, // TODO
      // debug: {path: './'},
      logger: this._logger,
      takeDomCapture: () => takeDomCapture(this._logger, this._context),
    }

    return this.checkWindowBase({
      name: checkSettings.name,
      url: await this._driver.getUrl(),
      renderId: checkSettings.renderId,
      variationGroupId: checkSettings.variationGroupId,
      sendDom: checkSettings.sendDom,
      retryTimeout: checkSettings.timeout,
      closeAfterMatch,
      throwEx,
    })
  }

  async getScreenshot() {
    this._logger.verbose('getScreenshot()')

    const screenshot = await screenshoter(this._screenshotSettings)
    this._imageLocation = new Location(Math.round(screenshot.viewportRegion.x), Math.round(screenshot.viewportRegion.y))
    this._dom = screenshot.dom

    this._matchSettings = await CheckSettingsUtils.toMatchSettings({
      context: this._context,
      checkSettings: this._checkSettings,
      configuration: this._configuration,
      targetRegion: screenshot.region,
    })

    return screenshot
  }

  async close(throwEx = true) {
    let isErrorCaught = false
    this._closePromise = super
      .close(true)
      .catch(err => {
        isErrorCaught = true
        return err
      })
      .then(results => {
        if (this._runner) {
          this._runner._allTestResult.push(results)
        }
        if (isErrorCaught) {
          if (throwEx || !results.getTestResults) throw results
          else return results.getTestResults()
        }
        return results
      })

    return this._closePromise
  }

  async tryCaptureDom() {
    // this._logger.verbose('Getting window DOM...')
    // const positionProvider = this._positionProviderHandler.get()
    // let originalPosition
    // try {
    //   if (
    //     !this._driver.isNative &&
    //     !this._shouldCheckFullRegion &&
    //     (this._configuration.getForceFullPageScreenshot() || this._stitchContent)
    //   ) {
    //     originalPosition = await positionProvider.getState()
    //     await positionProvider.setPosition(Location.ZERO)
    //   }
    //   return await takeDomCapture(this._logger, this._driver.mainContext)
    // } catch (ignored) {
    //   return ''
    // } finally {
    //   if (originalPosition) {
    //     await positionProvider.setPosition(originalPosition)
    //   }
    // }
    return this._dom
  }

  async getAppEnvironment() {
    const appEnv = await super.getAppEnvironment()

    if (!appEnv._deviceInfo && this._driver.deviceName) {
      appEnv.setDeviceInfo(this._driver.deviceName)
    }

    if (!appEnv._os && this._driver.isNative) {
      let os = this._driver.platformName
      if (this._driver.platformVersion) {
        os += ` ${this._driver.platformVersion}`
      }
      if (os) {
        appEnv.setOs(os)
      }
    }
    return appEnv
  }

  setFailureReport(mode) {
    if (mode === FailureReports.IMMEDIATE) {
      this._failureReportOverridden = true
      mode = FailureReports.ON_CLOSE
    }

    EyesCore.prototype.setFailureReport.call(this, mode)
  }

  getSendDom() {
    return !this._driver.isNative && super.getSendDom()
  }

  getImageLocation() {
    if (this._imageLocation) {
      return new Location(Math.round(this._imageLocation.getX()), Math.round(this._imageLocation.getY()))
    }
    return Location.ZERO
  }

  getMatchSettings() {
    return this._matchSettings
  }

  async getInferredEnvironment() {
    try {
      const userAgent = await this._driver.userAgent
      return userAgent ? 'useragent:' + userAgent : userAgent
    } catch (err) {
      return null
    }
  }

  async getRegionByLocator(locator) {
    const element = await this._driver.element(locator)
    const rect = await element.getElementRect()
    return rect
  }
}

module.exports = EyesClassic
