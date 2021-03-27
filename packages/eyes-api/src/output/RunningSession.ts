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
  private _session: RunningSession = {} as any

  /** @internal */
  constructor(session: RunningSession) {
    this._session = session instanceof RunningSessionData ? session.toJSON() : session
  }

  get id(): string {
    return this._session.id
  }
  set id(id: string) {
    this._session.id = id
  }
  getId(): string {
    return this.id
  }
  setId(id: string) {
    this.id = id
  }

  get sessionId(): string {
    return this._session.sessionId
  }
  set sessionId(sessionId: string) {
    this._session.sessionId = sessionId
  }
  getSessionId(): string {
    return this.sessionId
  }
  setSessionId(sessionId: string) {
    this.sessionId = sessionId
  }

  get batchId(): string {
    return this._session.batchId
  }
  set batchId(batchId: string) {
    this._session.batchId = batchId
  }
  getBatchId(): string {
    return this.batchId
  }
  setBatchId(batchId: string) {
    this.batchId = batchId
  }

  get baselineId(): string {
    return this._session.baselineId
  }
  set baselineId(baselineId: string) {
    this._session.baselineId = baselineId
  }
  getBaselineId(): string {
    return this.baselineId
  }
  setBaselineId(baselineId: string) {
    this.baselineId = baselineId
  }

  get url(): string {
    return this._session.url
  }
  set url(url: string) {
    this._session.url = url
  }
  getUrl(): string {
    return this.url
  }
  setUrl(url: string) {
    this.url = url
  }

  get isNew(): boolean {
    return this._session.isNew
  }
  set isNew(isNew: boolean) {
    this._session.isNew = isNew
  }
  getIsNew(): boolean {
    return this.isNew
  }
  setIsNew(isNew: boolean) {
    this.isNew = isNew
  }

  get renderingInfo(): RenderingInfo {
    return this._session.renderingInfo
  }
  set renderingInfo(renderingInfo: RenderingInfo) {
    this._session.renderingInfo = renderingInfo
  }
  getRenderingInfo(): RenderingInfoData {
    return new RenderingInfoData(this.renderingInfo)
  }
  setRenderingInfo(renderingInfo: RenderingInfo) {
    this.renderingInfo = renderingInfo
  }

  /** @internal */
  toObject(): RunningSession {
    return this._session
  }

  /** @internal */
  toJSON(): RunningSession {
    return utils.general.toJSON(this._session)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
