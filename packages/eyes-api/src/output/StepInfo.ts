import * as utils from '@applitools/utils'
import {AppUrls, AppUrlsData} from './AppUrls'
import {ApiUrls, ApiUrlsData} from './ApiUrls'

export type StepInfo = {
  name?: string
  isDifferent?: boolean
  hasBaselineImage?: boolean
  hasCurrentImage?: boolean
  appUrls?: AppUrls
  apiUrls?: ApiUrls
  renderId?: string[]
}

export class StepInfoData implements Required<StepInfo> {
  private _info: StepInfo = {} as any

  /** @internal */
  constructor(info?: StepInfo) {
    if (!info) return this
    this._info = info instanceof StepInfoData ? info.toJSON() : info
  }

  get name(): string {
    return this._info.name
  }
  set name(value: string) {
    this._info.name = value
  }
  getName(): string {
    return this.name
  }
  setName(value: string) {
    this.name = value
  }

  get isDifferent(): boolean {
    return this._info.isDifferent
  }
  set isDifferent(value: boolean) {
    this._info.isDifferent = value
  }
  getIsDifferent(): boolean {
    return this.isDifferent
  }
  setIsDifferent(value: boolean) {
    this.isDifferent = value
  }

  get hasBaselineImage(): boolean {
    return this._info.hasBaselineImage
  }
  set hasBaselineImage(value: boolean) {
    this._info.hasBaselineImage = value
  }
  getHasBaselineImage(): boolean {
    return this.hasBaselineImage
  }
  setHasBaselineImage(value: boolean) {
    this.hasBaselineImage = value
  }

  get hasCurrentImage(): boolean {
    return this._info.hasCurrentImage
  }
  set hasCurrentImage(hasCurrentImage: boolean) {
    this._info.hasCurrentImage = hasCurrentImage
  }
  getHasCurrentImage(): boolean {
    return this.hasCurrentImage
  }
  setHasCurrentImage(hasCurrentImage: boolean) {
    this.hasCurrentImage = hasCurrentImage
  }

  get appUrls(): AppUrls {
    return this._info.appUrls
  }
  set appUrls(appUrls: AppUrls) {
    this._info.appUrls = appUrls
  }
  getAppUrls(): AppUrlsData {
    return new AppUrlsData(this.appUrls)
  }
  setAppUrls(appUrls: AppUrls) {
    this.appUrls = appUrls
  }

  get apiUrls(): ApiUrls {
    return this._info.apiUrls
  }
  set apiUrls(apiUrls: ApiUrls) {
    this._info.apiUrls = apiUrls
  }
  getApiUrls(): ApiUrlsData {
    return new ApiUrlsData(this.apiUrls)
  }
  setApiUrls(apiUrls: ApiUrls) {
    this.apiUrls = apiUrls
  }

  get renderId(): string[] {
    return this._info.renderId
  }
  set renderId(renderId: string[]) {
    this._info.renderId = renderId
  }
  getRenderId(): string[] {
    return this.renderId
  }
  setRenderId(renderId: string[]) {
    this.renderId = renderId
  }

  /** @internal */
  toObject(): StepInfo {
    return this._info
  }

  /** @internal */
  toJSON(): StepInfo {
    return utils.general.toJSON(this._info)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
