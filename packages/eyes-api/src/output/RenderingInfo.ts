import * as utils from '@applitools/utils'

export type RenderingInfo = {
  accessToken: string
  serviceUrl: string
  resultsUrl: string
  stitchingServiceUrl: string
}

export class RenderingInfoData {
  private _info: RenderingInfo = {} as any

  /** @internal */
  constructor(info: RenderingInfo) {
    this._info = info instanceof RenderingInfoData ? info.toJSON() : info
  }

  get accessToken(): string {
    return this._info.accessToken
  }
  set accessToken(accessToken: string) {
    this._info.accessToken = accessToken
  }
  getAccessToken(): string {
    return this.accessToken
  }
  setAccessToken(accessToken: string) {
    this.accessToken = accessToken
  }
  getDecodedAccessToken(): {sub: string; exp: number; iss: string} {
    return utils.general.jwtDecode(this._info.accessToken) as {sub: string; exp: number; iss: string}
  }

  get serviceUrl(): string {
    return this._info.serviceUrl
  }
  set serviceUrl(serviceUrl: string) {
    this._info.serviceUrl = serviceUrl
  }
  getServiceUrl(): string {
    return this.serviceUrl
  }
  setServiceUrl(serviceUrl: string) {
    this.serviceUrl = serviceUrl
  }

  get resultsUrl(): string {
    return this._info.resultsUrl
  }
  set resultsUrl(resultsUrl: string) {
    this._info.resultsUrl = resultsUrl
  }
  getResultsUrl(): string {
    return this.resultsUrl
  }
  setResultsUrl(resultsUrl: string) {
    this.resultsUrl = resultsUrl
  }

  get stitchingServiceUrl(): string {
    return this._info.stitchingServiceUrl
  }
  set stitchingServiceUrl(stitchingServiceUrl: string) {
    this._info.stitchingServiceUrl = stitchingServiceUrl
  }
  getStitchingServiceUrl(): string {
    return this.stitchingServiceUrl
  }
  setStitchingServiceUrl(stitchingServiceUrl: string) {
    this.stitchingServiceUrl = stitchingServiceUrl
  }

  /** @internal */
  toObject(): RenderingInfo {
    return this._info
  }

  /** @internal */
  toJSON(): RenderingInfo {
    return utils.general.toJSON(this._info)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
