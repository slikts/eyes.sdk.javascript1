import * as utils from '@applitools/utils'
import SessionType from './enums/SessionType'
import StitchMode from './enums/StitchMode'
import MatchLevel from './enums/MatchLevel'
import {CheckSettings, CheckSettingsFluent} from './input/CheckSettings'
import {ProxySettings, ProxySettingsData} from './input/ProxySettings'
import {Configuration, OpenConfiguration, ConfigurationData} from './input/Configuration'
import {BatchInfo, BatchInfoData} from './input/BatchInfo'
import {RectangleSize} from './input/RectangleSize'
import {Region} from './input/Region'
import {MatchResult, MatchResultData} from './output/MatchResult'
import {TestResults, TestResultsData} from './output/TestResults'
import {RunnerConfiguration, EyesRunner, ClassicRunner} from './Runners'

type ExtractTextRegion<TElement = unknown, TSelector = unknown> = {
  target: Region | TElement | TSelector
  hint?: string
  minMatch?: number
  language?: string
}

type ExtractTextRegionsSettings<TPattern extends string = string> = {
  patterns: TPattern[]
  ignoreCase?: boolean
  firstOnly?: boolean
  language?: string
}

type LocateSettings<TLocator extends string = string> = {
  locatorNames: TLocator[]
  firstOnly: boolean
}

type EyesCommands<TElement = unknown, TSelector = unknown> = {
  check(settings?: CheckSettings<TElement, TSelector>): Promise<MatchResult>
  extractText(regions: ExtractTextRegion<TElement, TSelector>[]): Promise<string[]>
  extractTextRegions<TPattern extends string>(
    settings: ExtractTextRegionsSettings<TPattern>,
  ): Promise<{[key in TPattern]: string[]}>
  locate<TLocator extends string>(settings: LocateSettings<TLocator>): Promise<{[key in TLocator]: Region[]}>
  close(): Promise<TestResults>
  abort(): Promise<TestResults>
}

type EyesController<TDriver = unknown, TElement = unknown, TSelector = unknown> = {
  open: (driver: TDriver, config: Configuration) => Promise<EyesCommands<TElement, TSelector>>
  getResults: (driver: TDriver, config: Configuration) => Promise<EyesCommands<TElement, TSelector>>
}

type EyesSpec<TDriver = unknown, TElement = unknown, TSelector = unknown> = {
  isDriver(value: any): value is TDriver
  isElement(value: any): value is TElement
  isSelector(value: any): value is TSelector
  makeEyes(config?: RunnerConfiguration): EyesController<TDriver, TElement, TSelector>
  // makeLogger(config: LoggerConfiguration): unknown
  setViewportSize(driver: TDriver, viewportSize: RectangleSize): Promise<void>
  closeBatch(options: {batchId: string; serverUrl?: string; apiKey?: string; proxy?: ProxySettings}): Promise<void>
}

export class Eyes<TDriver = unknown, TElement = unknown, TSelector = unknown> {
  protected readonly _spec: EyesSpec<TDriver, TElement, TSelector>

  private _config: ConfigurationData<TElement, TSelector>
  private _runner: EyesRunner
  private _driver: TDriver
  private _commands: EyesCommands<TElement, TSelector>

  static async setViewportSize<TDriver>(driver: TDriver, viewportSize: RectangleSize) {
    await this.prototype._spec.setViewportSize(driver, viewportSize)
  }

  constructor(runner?: EyesRunner, config?: Configuration<TElement, TSelector>)
  constructor(config?: Configuration<TElement, TSelector>, runner?: EyesRunner)
  constructor(
    runnerOrConfig?: EyesRunner | Configuration<TElement, TSelector>,
    configOrRunner?: Configuration<TElement, TSelector> | EyesRunner,
  ) {
    if (utils.types.instanceOf(runnerOrConfig, EyesRunner)) {
      this._runner = runnerOrConfig
      this._config = new ConfigurationData(configOrRunner as Configuration<TElement, TSelector>)
    } else if (utils.types.instanceOf(configOrRunner, EyesRunner)) {
      this._runner = configOrRunner
      this._config = new ConfigurationData(runnerOrConfig as Configuration<TElement, TSelector>)
    } else {
      this._runner = new ClassicRunner()
      this._config = new ConfigurationData(runnerOrConfig as Configuration<TElement, TSelector>)
    }
    this._runner.attach(this, config => this._spec.makeEyes(config))
  }

  get runner() {
    return this._runner
  }
  getRunner(): EyesRunner {
    return this._runner
  }

  get driver(): TDriver {
    return this._driver
  }
  getDriver(): TDriver {
    return this._driver
  }

  get configuration(): Configuration<TElement, TSelector> {
    return this._config
  }
  set configuration(config: Configuration<TElement, TSelector>) {
    this._config = new ConfigurationData(config)
  }
  getConfiguration(): ConfigurationData<TElement, TSelector> {
    return this._config
  }
  setConfiguration(config: Configuration<TElement, TSelector>) {
    this._config = new ConfigurationData(config)
  }

  get isOpen(): boolean {
    return Boolean(this._commands)
  }
  getIsOpen(): boolean {
    return this.isOpen
  }

  async open(driver: TDriver, config?: OpenConfiguration): Promise<TDriver>
  async open(
    driver: TDriver,
    appName?: string,
    testName?: string,
    viewportSize?: RectangleSize,
    sessionType?: SessionType,
  ): Promise<TDriver>
  async open(
    driver: TDriver,
    configOrAppName?: OpenConfiguration | string,
    testName?: string,
    viewportSize?: RectangleSize,
    sessionType?: SessionType,
  ): Promise<TDriver> {
    const config = {...this._config.general, ...this._config.open}
    if (utils.types.instanceOf(configOrAppName, ConfigurationData)) {
      Object.assign(config, configOrAppName.open)
    } else if (utils.types.isObject(configOrAppName)) {
      Object.assign(config, configOrAppName)
    } else if (utils.types.isString(configOrAppName)) {
      config.appName = configOrAppName
    }
    if (utils.types.isString(testName)) config.testName = testName
    if (utils.types.isString(viewportSize)) config.viewportSize = viewportSize
    if (utils.types.isString(sessionType)) config.sessionType = sessionType

    this._driver = driver
    this._commands = (await this._runner.open(driver, config)) as EyesCommands<TElement, TSelector>

    return this._driver
  }

  /** @deprecated */
  async checkWindow(name?: string, timeout?: number, isFully = true) {
    return this.check({name, timeout, isFully})
  }
  /** @deprecated */
  async checkFrame(element: TElement | TSelector | string | number, timeout?: number, name?: string) {
    return this.check({name, frames: [element], timeout, isFully: true})
  }
  /** @deprecated */
  async checkElement(element: TElement, timeout?: number, name?: string) {
    return this.check({name, region: element, timeout, isFully: true})
  }
  /** @deprecated */
  async checkElementBy(selector: TSelector, timeout?: number, name?: string) {
    return this.check({name, region: selector, timeout, isFully: true})
  }
  /** @deprecated */
  async checkRegion(region?: Region, name?: string, timeout?: number) {
    return this.check({name, region, timeout})
  }
  /** @deprecated */
  async checkRegionByElement(element: TElement, name?: string, timeout?: number) {
    return this.check({name, region: element, timeout})
  }
  /** @deprecated */
  async checkRegionBy(selector: TSelector, name?: string, timeout?: number, isFully = false) {
    return this.check({name, region: selector, timeout, isFully})
  }
  /** @deprecated */
  async checkRegionInFrame(
    frame: TElement | TSelector | string | number,
    selector: TSelector,
    timeout?: number,
    name?: string,
    isFully = false,
  ) {
    return this.check({name, region: selector, frames: [frame], timeout, isFully})
  }
  async check(name: string, checkSettings: CheckSettingsFluent<TElement, TSelector>): Promise<MatchResultData>
  async check(checkSettings?: CheckSettings<TElement, TSelector>): Promise<MatchResultData>
  async check(
    checkSettingsOrName?: CheckSettings<TElement, TSelector> | CheckSettingsFluent<TElement, TSelector> | string,
    checkSettings?: CheckSettings<TElement, TSelector> | CheckSettingsFluent<TElement, TSelector>,
  ): Promise<MatchResultData> {
    let settings
    if (utils.types.isString(checkSettingsOrName)) {
      utils.guard.notNull(checkSettings, {name: 'checkSettings'})
      settings = utils.types.instanceOf(checkSettings, CheckSettingsFluent)
        ? checkSettings.name(checkSettingsOrName).toJSON()
        : {...checkSettings, name: checkSettingsOrName}
    } else {
      settings = utils.types.instanceOf(checkSettingsOrName, CheckSettingsFluent)
        ? checkSettingsOrName.toJSON()
        : {...checkSettingsOrName}
    }

    const result = await this._commands.check(settings)

    return new MatchResultData(result)
  }

  async extractText(regions: ExtractTextRegion<TElement, TSelector>[]): Promise<string[]> {
    return this._commands.extractText(regions)
  }

  async extractTextRegions<TPattern extends string>(
    settings: ExtractTextRegionsSettings<TPattern>,
  ): Promise<{[key in TPattern]: string[]}> {
    return this._commands.extractTextRegions(settings)
  }

  async locate<TLocator extends string>(settings: LocateSettings<TLocator>): Promise<{[key in TLocator]: Region[]}> {
    return this._commands.locate(settings)
  }

  async close(throwErr = true): Promise<TestResultsData> {
    if (!this.isOpen) return null
    const result = await this._commands.close()
    this._commands = null
    // TODO throw error `throwErr` is true and `results` include error response
    return new TestResultsData(result)
  }

  async abort(): Promise<TestResultsData> {
    if (!this.isOpen) return null
    const result = await this._commands.abort()
    this._commands = null
    return new TestResultsData(result)
  }

  async closeBatch() {
    // await this._spec.closeBatch()
  }

  // async getViewportSize() : Promise<RectangleSizeData> {
  //   return this._commands
  // }
  // async setViewportSize(viewportSize: RectangleSize|RectangleSizeData) : Promise<void> {
  //   await this._commands
  // }

  // getRotation() : number {
  //   return this._rotation
  // }
  // setRotation(rotation: number) {
  //   this._rotation = rotation
  // }

  // getDebugScreenshotsPrefix() {
  //   // return this._debugScreenshotsProvider.getPrefix()
  // }
  // setDebugScreenshotsPrefix(debugScreenshotsPrefix: boolean) {
  //   // this._debugScreenshotsProvider.setPrefix(prefix)
  // }

  // setDebugScreenshotsPath(debugScreenshotsPath: string) {
  //   // this._debugScreenshotsProvider.setPath(pathToSave)
  // }
  // getDebugScreenshotsPath() {
  //   // return this._debugScreenshotsProvider.getPath()
  // }

  // getSaveDebugScreenshots() : boolean {
  //   return this._saveDebugScreenshots
  // }
  // setSaveDebugScreenshots(saveDebugScreenshots: boolean) {
  //   this._saveDebugScreenshots = saveDebugScreenshots
  // }

  // getScaleRatio() : number {
  //   return this._scaleRatio
  // }
  // setScaleRatio(scaleRatio: number) {
  //   this._scaleRatio = scaleRatio
  // }

  // #region CONFIG

  getScrollRootElement(): TElement | TSelector {
    return this._config.getScrollRootElement()
  }
  setScrollRootElement(scrollRootElement: TElement | TSelector) {
    this._config.setScrollRootElement(scrollRootElement)
  }

  addProperty(name: string, value: string) {
    return this._config.addProperty(name, value)
  }
  clearProperties() {
    return this._config.setProperties([])
  }

  getBatch(): BatchInfoData {
    return this._config.getBatch()
  }
  setBatch(batch: BatchInfo): void
  setBatch(name: string, id?: string, startedAt?: Date | string): void
  setBatch(batchOrName: BatchInfo | string, id?: string, startedAt?: Date | string) {
    if (utils.types.isString(batchOrName)) {
      this._config.setBatch({name: batchOrName, id, startedAt: new Date(startedAt)})
    } else {
      this._config.setBatch(batchOrName)
    }
  }

  getApiKey(): string {
    return this._config.getApiKey()
  }
  setApiKey(apiKey: string) {
    this._config.setApiKey(apiKey)
  }

  getTestName(): string {
    return this._config.getTestName()
  }
  setTestName(testName: string) {
    this._config.setTestName(testName)
  }

  getAppName(): string {
    return this._config.getAppName()
  }
  setAppName(appName: string) {
    this._config.setAppName(appName)
  }

  getBaselineBranchName(): string {
    return this._config.getBaselineBranchName()
  }
  setBaselineBranchName(baselineBranchName: string) {
    this._config.setBaselineBranchName(baselineBranchName)
  }

  /** @deprecated */
  getBaselineName(): string {
    return this.getBaselineEnvName()
  }
  /** @deprecated */
  setBaselineName(baselineName: string) {
    this.setBaselineEnvName(baselineName)
  }

  getBaselineEnvName(): string {
    return this._config.getBaselineEnvName()
  }
  setBaselineEnvName(baselineEnvName: string) {
    this._config.setBaselineEnvName(baselineEnvName)
  }

  getBranchName(): string {
    return this._config.getBranchName()
  }
  setBranchName(branchName: string) {
    this._config.setBranchName(branchName)
  }

  getHostApp(): string {
    return this._config.getHostApp()
  }
  setHostApp(hostApp: string) {
    this._config.setHostApp(hostApp)
  }

  getHostOS(): string {
    return this._config.getHostOS()
  }
  setHostOS(hostOS: string) {
    this._config.setHostOS(hostOS)
  }

  getHostAppInfo(): string {
    return this._config.getHostAppInfo()
  }
  setHostAppInfo(hostAppInfo: string) {
    this._config.setHostAppInfo(hostAppInfo)
  }

  getHostOSInfo(): string {
    return this._config.getHostOSInfo()
  }
  setHostOSInfo(hostOSInfo: string) {
    this._config.setHostOSInfo(hostOSInfo)
  }

  getDeviceInfo(): string {
    return this._config.getDeviceInfo()
  }
  setDeviceInfo(deviceInfo: string) {
    this._config.setDeviceInfo(deviceInfo)
  }

  setIgnoreCaret(ignoreCaret: boolean) {
    this._config.setIgnoreCaret(ignoreCaret)
  }
  getIgnoreCaret(): boolean {
    return this._config.getIgnoreCaret()
  }

  getIsDisabled(): boolean {
    return this._config.getIsDisabled()
  }
  setIsDisabled(isDisabled: boolean) {
    this._config.setIsDisabled(isDisabled)
  }

  getMatchLevel(): MatchLevel {
    return this._config.getMatchLevel()
  }
  setMatchLevel(matchLevel: MatchLevel) {
    this._config.setMatchLevel(matchLevel)
  }

  getMatchTimeout(): number {
    return this._config.getMatchTimeout()
  }
  setMatchTimeout(matchTimeout: number) {
    this._config.setMatchTimeout(matchTimeout)
  }

  getParentBranchName(): string {
    return this._config.getParentBranchName()
  }
  setParentBranchName(parentBranchName: string) {
    this._config.setParentBranchName(parentBranchName)
  }

  setProxy(proxy: ProxySettings): void
  setProxy(isDisabled: true): void
  setProxy(url: string, username?: string, password?: string, isHttpOnly?: boolean): void
  setProxy(
    proxyOrUrlOrIsDisabled: ProxySettings | string | true,
    username?: string,
    password?: string,
    isHttpOnly?: boolean,
  ) {
    this._config.setProxy(proxyOrUrlOrIsDisabled as string, username, password, isHttpOnly)
    return this
  }
  getProxy(): ProxySettingsData {
    return this._config.getProxy()
  }

  getSaveDiffs(): boolean {
    return this._config.saveDiffs
  }
  setSaveDiffs(saveDiffs: boolean) {
    this._config.saveDiffs = saveDiffs
  }

  getSaveNewTests(): boolean {
    return this._config.saveNewTests
  }
  setSaveNewTests(saveNewTests: boolean) {
    this._config.saveNewTests = saveNewTests
  }

  getServerUrl(): string {
    return this._config.getServerUrl()
  }
  setServerUrl(serverUrl: string) {
    this._config.setServerUrl(serverUrl)
  }

  getSendDom(): boolean {
    return this._config.getSendDom()
  }
  setSendDom(sendDom: boolean) {
    this._config.setSendDom(sendDom)
  }

  getHideCaret(): boolean {
    return this._config.getHideCaret()
  }
  setHideCaret(hideCaret: boolean) {
    this._config.setHideCaret(hideCaret)
  }

  getHideScrollbars(): boolean {
    return this._config.getHideScrollbars()
  }
  setHideScrollbars(hideScrollbars: boolean) {
    this._config.setHideScrollbars(hideScrollbars)
  }

  getForceFullPageScreenshot(): boolean {
    return this._config.getForceFullPageScreenshot()
  }
  setForceFullPageScreenshot(forceFullPageScreenshot: boolean) {
    this._config.setForceFullPageScreenshot(forceFullPageScreenshot)
  }

  getWaitBeforeScreenshots(): number {
    return this._config.getWaitBeforeScreenshots()
  }
  setWaitBeforeScreenshots(waitBeforeScreenshots: number) {
    this._config.setWaitBeforeScreenshots(waitBeforeScreenshots)
  }

  getStitchMode(): StitchMode {
    return this._config.getStitchMode()
  }
  setStitchMode(stitchMode: StitchMode) {
    this._config.setStitchMode(stitchMode)
  }

  getStitchOverlap(): number {
    return this._config.getStitchOverlap()
  }
  setStitchOverlap(stitchOverlap: number) {
    this._config.setStitchOverlap(stitchOverlap)
  }

  // #endregion
}
