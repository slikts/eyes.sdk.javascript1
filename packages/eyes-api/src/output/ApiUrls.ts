import * as utils from '@applitools/utils'

export type ApiUrls = {
  baselineImage?: string
  currentImage?: string
  checkpointImage?: string
  checkpointImageThumbnail?: string
  diffImage?: string
}

export class ApiUrlsData implements Required<ApiUrls> {
  private _urls: ApiUrls = {} as any

  /** @internal */
  constructor(urls?: ApiUrls) {
    if (!urls) return this
    this._urls = urls instanceof ApiUrlsData ? urls.toJSON() : urls
  }

  get baselineImage(): string {
    return this._urls.baselineImage
  }
  set baselineImage(setBaselineImage: string) {
    this._urls.baselineImage = setBaselineImage
  }
  getBaselineImage(): string {
    return this.baselineImage
  }
  setBaselineImage(setBaselineImage: string) {
    this.baselineImage = setBaselineImage
  }

  get currentImage(): string {
    return this._urls.currentImage
  }
  set currentImage(currentImage: string) {
    this._urls.currentImage = currentImage
  }
  getCurrentImage(): string {
    return this.currentImage
  }
  setCurrentImage(currentImage: string) {
    this.currentImage = currentImage
  }

  get checkpointImage(): string {
    return this._urls.checkpointImage
  }
  set checkpointImage(checkpointImage: string) {
    this._urls.checkpointImage = checkpointImage
  }
  getCheckpointImage(): string {
    return this.checkpointImage
  }
  setCheckpointImage(checkpointImage: string) {
    this.checkpointImage = checkpointImage
  }

  get checkpointImageThumbnail(): string {
    return this._urls.checkpointImageThumbnail
  }
  set checkpointImageThumbnail(checkpointImageThumbnail: string) {
    this._urls.checkpointImageThumbnail = checkpointImageThumbnail
  }
  getCheckpointImageThumbnail(): string {
    return this.checkpointImageThumbnail
  }
  setCheckpointImageThumbnail(checkpointImageThumbnail: string) {
    this.checkpointImageThumbnail = checkpointImageThumbnail
  }

  get diffImage(): string {
    return this._urls.diffImage
  }
  set diffImage(diffImage: string) {
    this._urls.diffImage = diffImage
  }
  getDiffImage(): string {
    return this.diffImage
  }
  setDiffImage(diffImage: string) {
    this.diffImage = diffImage
  }

  /** @internal */
  toObject(): ApiUrls {
    return this._urls
  }

  /** @internal */
  toJSON(): ApiUrls {
    return utils.general.toJSON(this._urls)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
