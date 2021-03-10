import {makeSDK} from '@applitools/eyes-sdk-core'
import * as spec from './spec-driver'
import {version} from '../package.json'
import type {Driver, Element, Selector} from './spec-driver'

if (!process.env.APPLITOOLS_WDIO_MAJOR_VERSION) {
  const {version} = require('webdriverio/package.json')
  const [major] = version.split('.', 1)
  process.env.APPLITOOLS_WDIO_MAJOR_VERSION = major
}

const sdk = makeSDK({
  name: 'eyes-webdriverio-service',
  version,
  spec,
  VisualGridClient: require('@applitools/visual-grid-client'),
})

const DEFAULT_VIEWPORT = {width: 800, height: 600}

export class EyesService {
  private _open: (driver: Driver, configurations: null) => Driver
  private _commands: any
  private _config: ConfigurationPlain
  private _appName: string
  private _scrollRootElement: Element
  private _testResults: TestResults

  constructor({useVisualGrid, concurrency, ...config}: {useVisualGrid?: boolean; concurrency?: number, eyes?: {}}) {
    const wdioVersion = Number(process.env.APPLITOOLS_WDIO_MAJOR_VERSION)
    this._config = Number.isNaN(wdioVersion) || wdioVersion >= 6 ? {...config} : {...config.eyes}
    if (!useVisualGrid) this._config.hideScrollbars(true)

    this._open = sdk.makeEyes({type: useVisualGrid ? 'vg' : 'classic', concurrency})
  }
  beforeSession(config: Record<string, unknown>) {
    this._eyes.setConfiguration(this._config)
    this._appName = this._eyes.getConfiguration().getAppName()
    if (config.enableEyesLogs) {
      this._eyes.setLogHandler(new ConsoleLogHandler(true))
    }
  }
  before() {
    global.browser.addCommand(
      'eyesCheck',
      async (title, checkSettings = {fully: true}) => {
        await this._eyesOpen()
        return this._eyes.check(title, checkSettings)
      },
    )

    // deprecated, alias of eyesCheck
    global.browser.addCommand('eyesCheckWindow', async (title, checkSettings) => {
      return global.browser.eyesCheck(title, checkSettings)
    })

    global.browser.addCommand('eyesSetScrollRootElement', element => {
      this._scrollRootElement = element
    })

    global.browser.addCommand('eyesAddProperty', (key, value) => {
      return this._eyes.addProperty(key, value)
    })

    global.browser.addCommand('eyesClearProperties', () => {
      return this._eyes.clearProperties()
    })

    global.browser.addCommand('eyesGetTestResults', async () => {
      // because `afterTest` executes after `afterEach`, this is the way to get results in `afterEach` or `it`
      await this._eyesClose()
      return this._testResults
    })

    global.browser.addCommand('eyesSetConfiguration', configuration => {
      return this._eyes.setConfiguration(configuration)
    })

    global.browser.addCommand('eyesGetIsOpen', () => {
      return this._eyes.isOpen
    })

    global.browser.addCommand('eyesGetConfiguration', () => {
      return this._eyes.getConfiguration()
    })

    global.browser.addCommand('eyesGetAllTestResults', async () => {
      return this._eyes.runner.getAllTestResults()
    })
  }
  beforeTest(test: Record<string, string>) {
    const configuration = this._eyes.getConfiguration()
    configuration.setTestName(test.title || test.description) // test.title is for mocha, and test.description is for jasmine

    if (!this._appName) {
      configuration.setAppName(test.parent || test.id) // test.parent is for mocha, and test.id is for jasmine
    }

    if (!configuration.getViewportSize()) {
      configuration.setViewportSize(DEFAULT_VIEWPORT)
    }
    this._eyes.setConfiguration(configuration)
  }
  afterTest() {
    // the next line is required because if we set an element in one test, then the following test
    // will say that the element is not attached to the page (because different browsers are used)
    this._eyes._scrollRootElement = undefined
    global.browser.call(() => this._eyesClose())
  }
  after() {
    global.browser.call(() => this._eyes.runner.getAllTestResults(false))
    global.browser.call(() => this._commands.abort())
  }

  async _eyesOpen() {
    if (!this._commands) {
      this._testResults = null
      this._commands = await this._open(global.browser, this._config)
    }

    if (this._scrollRootElement) {
      await this._eyes.setScrollRootElement(this._scrollRootElement)
      this._scrollRootElement = undefined
    }
  }

  async _eyesClose() {
    if (this._commands) {
      this._testResults = await this._commands.close(false)
      this._commands = null
    }
  }
}

function getServiceConfig(config: any): ConfigurationPlain {
  let major = 6
  try {
    const {version} = require('webdriverio/package.json')
    major = Number(version.split('.', 1)[0])
    if (Number.isNaN(major)) major = 6
  } catch (err) {}

  return major >= 6 ? config : config.eyes
}
