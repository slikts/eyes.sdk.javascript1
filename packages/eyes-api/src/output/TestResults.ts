import * as utils from '@applitools/utils'
import TestResultsStatus from '../enums/TestResultsStatus'
import AccessibilityLevel from '../enums/AccessibilityLevel'
import AccessibilityGuidelinesVersion from '../enums/AccessibilityGuidelinesVersion'
import AccessibilityStatus from '../enums/AccessibilityStatus'
import {RectangleSize, RectangleSizeData} from '../input/RectangleSize'
import {SessionUrls, SessionUrlsData} from './SessionUrls'
import {StepInfo, StepInfoData} from './StepInfo'

export type TestAccessibilityStatus = {
  level: AccessibilityLevel
  version: AccessibilityGuidelinesVersion
  status: AccessibilityStatus
}

export type TestResults = {
  id?: string
  name?: string
  secretToken?: string
  status?: TestResultsStatus
  appName?: string
  batchId?: string
  batchName?: string
  branchName?: string
  hostOS?: string
  hostApp?: string
  hostDisplaySize?: RectangleSize
  accessibilityStatus?: TestAccessibilityStatus
  startedAt?: Date | string
  duration?: number
  isNew?: boolean
  isDifferent?: boolean
  isAborted?: boolean
  appUrls?: SessionUrls
  apiUrls?: SessionUrls
  stepsInfo?: StepInfo[]
  steps?: number
  matches?: number
  mismatches?: number
  missing?: number
  exactMatches?: number
  strictMatches?: number
  contentMatches?: number
  layoutMatches?: number
  noneMatches?: number
  url?: string
}

export class TestResultsData implements Required<TestResults> {
  private _results: TestResults = {} as any
  private readonly _deleteTestResults: (result: TestResults) => Promise<void>

  /** @internal */
  constructor(results?: TestResults, deleteTestResults?: (result: TestResults) => Promise<void>) {
    this._deleteTestResults = deleteTestResults
    if (!results) return this
    this._results = results instanceof TestResultsData ? results.toJSON() : results
  }

  get id(): string {
    return this._results.id
  }
  set id(id: string) {
    this._results.id = id
  }
  getId(): string {
    return this.id
  }
  setId(id: string) {
    this.id = id
  }

  get name(): string {
    return this._results.name
  }
  set name(name: string) {
    this._results.name = name
  }
  getName(): string {
    return this.name
  }
  setName(name: string) {
    this.name = name
  }

  get secretToken(): string {
    return this._results.secretToken
  }
  set secretToken(secretToken: string) {
    this._results.secretToken = secretToken
  }
  getSecretToken(): string {
    return this.secretToken
  }
  setSecretToken(secretToken: string) {
    this.secretToken = secretToken
  }

  get status(): TestResultsStatus {
    return this._results.status
  }
  set status(status: TestResultsStatus) {
    this._results.status = status
  }
  getStatus(): TestResultsStatus {
    return this.status
  }
  setStatus(status: TestResultsStatus) {
    this.status = status
  }

  get appName(): string {
    return this._results.appName
  }
  set appName(appName: string) {
    this._results.appName = appName
  }
  getAppName(): string {
    return this.appName
  }
  setAppName(appName: string) {
    this.appName = appName
  }

  get batchName(): string {
    return this._results.batchName
  }
  set batchName(batchName: string) {
    this._results.batchName = batchName
  }
  getBatchName(): string {
    return this.batchName
  }
  setBatchName(batchName: string) {
    this.batchName = batchName
  }

  get batchId(): string {
    return this._results.batchId
  }
  set batchId(batchId: string) {
    this._results.batchId = batchId
  }
  getBatchId(): string {
    return this.batchId
  }
  setBatchId(batchId: string) {
    this.batchId = batchId
  }

  get branchName(): string {
    return this._results.batchName
  }
  set branchName(branchName: string) {
    this._results.batchName = branchName
  }
  getBranchName(): string {
    return this.branchName
  }
  setBranchName(branchName: string) {
    this.branchName = branchName
  }

  get hostOS(): string {
    return this._results.hostOS
  }
  set hostOS(hostOS: string) {
    this._results.hostOS = hostOS
  }
  getHostOS(): string {
    return this.hostOS
  }
  setHostOS(hostOS: string) {
    this.hostOS = hostOS
  }

  get hostApp(): string {
    return this._results.hostApp
  }
  set hostApp(hostApp: string) {
    this._results.hostApp = hostApp
  }
  getHostApp(): string {
    return this.hostApp
  }
  setHostApp(hostApp: string) {
    this.hostApp = hostApp
  }

  get hostDisplaySize(): RectangleSize {
    return this._results.hostDisplaySize
  }
  set hostDisplaySize(hostDisplaySize: RectangleSize) {
    this._results.hostDisplaySize = hostDisplaySize
  }
  getHostDisplaySize(): RectangleSizeData {
    return new RectangleSizeData(this.hostDisplaySize)
  }
  setHostDisplaySize(hostDisplaySize: RectangleSize) {
    this.hostDisplaySize = hostDisplaySize
  }

  get accessibilityStatus(): TestAccessibilityStatus {
    return this._results.accessibilityStatus
  }
  set accessibilityStatus(accessibilityStatus: TestAccessibilityStatus) {
    this._results.accessibilityStatus = accessibilityStatus
  }
  getAccessibilityStatus(): TestAccessibilityStatus {
    return this.accessibilityStatus
  }
  setAccessibilityStatus(accessibilityStatus: TestAccessibilityStatus) {
    this.accessibilityStatus = accessibilityStatus
  }

  get startedAt(): Date | string {
    return this._results.startedAt
  }
  set startedAt(startedAt: Date | string) {
    this._results.startedAt = startedAt
  }
  getStartedAt(): Date {
    return new Date(this.startedAt)
  }
  setStartedAt(startedAt: Date | string) {
    this.startedAt = startedAt
  }

  get duration(): number {
    return this._results.duration
  }
  set duration(duration: number) {
    this._results.duration = duration
  }
  getDuration(): number {
    return this.duration
  }
  setDuration(duration: number) {
    this.duration = duration
  }

  get isNew(): boolean {
    return this._results.isNew
  }
  set isNew(isNew: boolean) {
    this._results.isNew = isNew
  }
  getIsNew(): boolean {
    return this.isNew
  }
  setIsNew(isNew: boolean) {
    this.isNew = isNew
  }

  get isDifferent(): boolean {
    return this._results.isDifferent
  }
  set isDifferent(isDifferent: boolean) {
    this._results.isDifferent = isDifferent
  }
  getIsDifferent(): boolean {
    return this.isDifferent
  }
  setIsDifferent(isDifferent: boolean) {
    this.isDifferent = isDifferent
  }

  get isAborted(): boolean {
    return this._results.isAborted
  }
  set isAborted(isAborted: boolean) {
    this._results.isAborted = isAborted
  }
  getIsAborted(): boolean {
    return this.isAborted
  }
  setIsAborted(isAborted: boolean) {
    this.isAborted = isAborted
  }

  get appUrls(): SessionUrls {
    return this._results.appUrls
  }
  set appUrls(appUrls: SessionUrls) {
    this._results.appUrls = appUrls
  }
  getAppUrls(): SessionUrlsData {
    return new SessionUrlsData(this.appUrls)
  }
  setAppUrls(appUrls: SessionUrls) {
    this.appUrls = appUrls
  }

  get apiUrls(): SessionUrls {
    return this._results.apiUrls
  }
  set apiUrls(apiUrls: SessionUrls) {
    this._results.apiUrls = apiUrls
  }
  getApiUrls(): SessionUrlsData {
    return new SessionUrlsData(this.apiUrls)
  }
  setApiUrls(apiUrls: SessionUrls) {
    this.apiUrls = apiUrls
  }

  get stepsInfo(): StepInfo[] {
    return this._results.stepsInfo
  }
  set stepsInfo(stepInfo: StepInfo[]) {
    this._results.stepsInfo = stepInfo
  }
  getStepsInfo(): StepInfoData[] {
    return this.stepsInfo.map(info => new StepInfoData(info))
  }
  setStepsInfo(stepInfo: StepInfo[]) {
    this.stepsInfo = stepInfo
  }

  get steps(): number {
    return this._results.steps
  }
  set steps(steps: number) {
    this._results.steps = steps
  }
  getSteps(): number {
    return this.steps
  }
  setSteps(steps: number) {
    this.steps = steps
  }

  get matches(): number {
    return this._results.matches
  }
  set matches(matches: number) {
    this._results.matches = matches
  }
  getMatches(): number {
    return this.matches
  }
  setMatches(matches: number) {
    this.matches = matches
  }

  get mismatches(): number {
    return this._results.mismatches
  }
  set mismatches(mismatches: number) {
    this._results.mismatches = mismatches
  }
  getMismatches(): number {
    return this.mismatches
  }
  setMismatches(mismatches: number) {
    this.mismatches = mismatches
  }

  get missing(): number {
    return this._results.missing
  }
  set missing(missing: number) {
    this._results.missing = missing
  }
  getMissing(): number {
    return this.missing
  }
  setMissing(missing: number) {
    this.missing = missing
  }

  get exactMatches(): number {
    return this._results.exactMatches
  }
  set exactMatches(exactMatches: number) {
    this._results.exactMatches = exactMatches
  }
  getExactMatches(): number {
    return this.exactMatches
  }
  setExactMatches(exactMatches: number) {
    this.exactMatches = exactMatches
  }

  get strictMatches(): number {
    return this._results.strictMatches
  }
  set strictMatches(strictMatches: number) {
    this._results.strictMatches = strictMatches
  }
  getStrictMatches(): number {
    return this.strictMatches
  }
  setStrictMatches(strictMatches: number) {
    this.strictMatches = strictMatches
  }

  get contentMatches(): number {
    return this._results.contentMatches
  }
  set contentMatches(contentMatches: number) {
    this._results.contentMatches = contentMatches
  }
  getContentMatches(): number {
    return this.contentMatches
  }
  setContentMatches(contentMatches: number) {
    this.contentMatches = contentMatches
  }

  get layoutMatches(): number {
    return this._results.layoutMatches
  }
  set layoutMatches(layoutMatches: number) {
    this._results.layoutMatches = layoutMatches
  }
  getLayoutMatches(): number {
    return this.layoutMatches
  }
  setLayoutMatches(layoutMatches: number) {
    this.layoutMatches = layoutMatches
  }

  get noneMatches(): number {
    return this._results.noneMatches
  }
  set noneMatches(noneMatches: number) {
    this._results.noneMatches = noneMatches
  }
  getNoneMatches(): number {
    return this.noneMatches
  }
  setNoneMatches(noneMatches: number) {
    this.noneMatches = noneMatches
  }

  get url(): string {
    return this._results.url
  }
  set url(url: string) {
    this._results.url = url
  }
  getUrl(): string {
    return this.url
  }
  setUrl(url: string) {
    this.url = url
  }

  isPassed(): boolean {
    return this._results.status === TestResultsStatus.Passed
  }

  async delete(): Promise<void> {
    if (!this._deleteTestResults) return
    return this._deleteTestResults(this._results)
  }
  /** @deprecated */
  async deleteSession(): Promise<void> {
    await this.delete()
  }

  /** @internal */
  toObject(): TestResults {
    return this._results
  }

  /** @internal */
  toJSON(): TestResults {
    return utils.general.toJSON(this._results)
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
