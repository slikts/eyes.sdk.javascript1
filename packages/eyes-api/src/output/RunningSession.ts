import * as utils from '@applitools/utils'
import {RenderingInfo, RenderingInfoData} from './RenderingInfo'

export type RunningSession = {
  id: string
  sessionId: string
  batchId: string
  baselineId: string
  url: string
  isNew: boolean
  renderingInfo: RenderingInfo
}

export class RunningSessionData implements Required<RunningSession> {
  private _id: string
  private _sessionId: string
  private _batchId: string
  private _baselineId: string
  private _url: string
  private _isNew: boolean
  private _renderingInfo: RenderingInfoData

  constructor(runningSession: RunningSession) {
    this._id = runningSession.id
    this._sessionId = runningSession.sessionId
    this._batchId = runningSession.batchId
    this._baselineId = runningSession.baselineId
    this._url = runningSession.url
    this._isNew = runningSession.isNew
    this._renderingInfo = new RenderingInfoData(runningSession.renderingInfo)
  }

  get id(): string {
    return this._id
  }
  set id(id: string) {
    this._id = id
  }
  getId(): string {
    return this._id
  }
  setId(id: string) {
    this.id = id
  }

  get sessionId(): string {
    return this._sessionId
  }
  set sessionId(sessionId: string) {
    this._sessionId = sessionId
  }
  getSessionId(): string {
    return this._sessionId
  }
  setSessionId(sessionId: string) {
    this.sessionId = sessionId
  }

  get batchId(): string {
    return this._batchId
  }
  set batchId(batchId: string) {
    this._batchId = batchId
  }
  getBatchId(): string {
    return this._batchId
  }
  setBatchId(batchId: string) {
    this.batchId = batchId
  }

  get baselineId(): string {
    return this._baselineId
  }
  set baselineId(baselineId: string) {
    this._baselineId = baselineId
  }
  getBaselineId(): string {
    return this._baselineId
  }
  setBaselineId(baselineId: string) {
    this.baselineId = baselineId
  }

  get url(): string {
    return this._url
  }
  set url(url: string) {
    this._url = url
  }
  getUrl(): string {
    return this._url
  }
  setUrl(url: string) {
    this.url = url
  }

  get isNew(): boolean {
    return this._isNew
  }
  set isNew(isNew: boolean) {
    this._isNew = isNew
  }
  getIsNew(): boolean {
    return this._isNew
  }
  setIsNew(isNew: boolean) {
    this.isNew = isNew
  }

  get renderingInfo(): RenderingInfo {
    return this._renderingInfo
  }
  set renderingInfo(renderingInfo: RenderingInfo) {
    this._renderingInfo = new RenderingInfoData(renderingInfo)
  }
  getRenderingInfo(): RenderingInfoData {
    return this._renderingInfo
  }
  setRenderingInfo(renderingInfo: RenderingInfo) {
    this.renderingInfo = renderingInfo
  }

  /** @internal */
  toJSON(): Required<RunningSession> {
    return utils.general.toJSON(this, ['id', 'sessionId', 'batchId', 'baselineId', 'url', 'isNew', 'renderingInfo'])
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
