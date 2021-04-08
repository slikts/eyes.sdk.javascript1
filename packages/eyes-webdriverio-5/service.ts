import {Eyes, VisualGridRunner, ConfigurationPlain, TestResults} from './src/api'

if (!process.env.APPLITOOLS_WDIO_MAJOR_VERSION) {
  try {
    const {version} = require('webdriverio/package.json')
    const [major] = version.split('.', 1)
    process.env.APPLITOOLS_WDIO_MAJOR_VERSION = major
  } catch {
    // NOTE: ignore error
  }
}

interface EyesServiceOptions extends ConfigurationPlain {
  useVisualGrid?: boolean
  concurrency?: number
  eyes?: EyesServiceOptions
}

export = class EyesService {
  private _eyes: Eyes
  private _appName: string
  private _testResults: TestResults

  constructor({useVisualGrid, concurrency, eyes, ...config}: EyesServiceOptions) {
    const wdioMajorVersion = Number(process.env.APPLITOOLS_WDIO_MAJOR_VERSION)
    config = wdioMajorVersion < 6 ? {...eyes} : config

    if (!useVisualGrid) config.hideScrollbars = true

    this._eyes = new Eyes(useVisualGrid ? new VisualGridRunner({testConcurrency: concurrency}) : null, config)
  }
  beforeSession(config: Record<string, unknown>) {
    this._appName = this._eyes.configuration.appName
    if (config.enableEyesLogs) {
      // this._eyes.configuration.LOG_HANDLER(new ConsoleLogHandler(true))
    }
  }
  before() {
    global.browser.addCommand('eyesCheck', async (title, checkSettings = {fully: true}) => {
      await this._eyesOpen()
      return this._eyes.check(title, checkSettings)
    })

    // deprecated, alias of eyesCheck
    global.browser.addCommand('eyesCheckWindow', async (...args) => {
      return (global.browser as any).eyesCheck(...args)
    })

    global.browser.addCommand('eyesSetScrollRootElement', element => {
      this._eyes.getConfiguration().setScrollRootElement(element)
    })

    global.browser.addCommand('eyesAddProperty', (key, value) => {
      this._eyes.getConfiguration().addProperty(key, value)
    })

    global.browser.addCommand('eyesClearProperties', () => {
      this._eyes.getConfiguration().clearProperties()
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
      return this._eyes.getIsOpen()
    })

    global.browser.addCommand('eyesGetConfiguration', () => {
      return this._eyes.getConfiguration()
    })

    global.browser.addCommand('eyesGetAllTestResults', async (throwErr: boolean) => {
      return this._eyes.runner.getAllTestResults(throwErr)
    })
  }
  beforeTest(test: Record<string, string>) {
    const configuration = this._eyes.getConfiguration()
    configuration.setTestName(test.title || test.description) // test.title is for mocha, and test.description is for jasmine

    if (!this._appName) {
      configuration.setAppName(test.parent || test.id) // test.parent is for mocha, and test.id is for jasmine
    }

    if (!configuration.getViewportSize()) {
      configuration.setViewportSize({width: 800, height: 600})
    }
    this._eyes.setConfiguration(configuration)
  }
  afterTest() {
    // the next line is required because if we set an element in one test, then the following test
    // will say that the element is not attached to the page (because different browsers are used)
    this._eyes.getConfiguration().setScrollRootElement(null)
    global.browser.call(() => this._eyesClose())
  }
  after() {
    global.browser.call(() => this._eyes.runner.getAllTestResults(false))
    global.browser.call(() => this._eyes.abort())
  }

  async _eyesOpen() {
    if (!this._eyes.isOpen) {
      this._testResults = null
      await this._eyes.open(global.browser)
    }
  }

  async _eyesClose() {
    if (this._eyes.isOpen) {
      this._testResults = await this._eyes.close(false)
    }
  }
}
