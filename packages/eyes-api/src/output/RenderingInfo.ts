import * as utils from '@applitools/utils'

export type RenderingInfo = {
  accessToken: string
  serviceUrl: string
  resultsUrl: string
  stitchingServiceUrl: string
}

export class RenderingInfoData {
  private _accessToken: string
  private _serviceUrl: string
  private _resultsUrl: string
  private _stitchingServiceUrl: string

  constructor(renderingInfo: RenderingInfo) {
    this._serviceUrl = renderingInfo.serviceUrl
    this._accessToken = renderingInfo.accessToken
    this._resultsUrl = renderingInfo.resultsUrl
    this._stitchingServiceUrl = renderingInfo.stitchingServiceUrl
  }

  get accessToken(): string {
    return this._accessToken
  }
  set accessToken(accessToken: string) {
    this._accessToken = accessToken
  }
  getAccessToken(): string {
    return this._accessToken
  }
  setAccessToken(accessToken: string) {
    this.accessToken = accessToken
  }

  get serviceUrl(): string {
    return this._serviceUrl
  }
  set serviceUrl(serviceUrl: string) {
    this._serviceUrl = serviceUrl
  }
  getServiceUrl(): string {
    return this._serviceUrl
  }
  setServiceUrl(serviceUrl: string) {
    this.serviceUrl = serviceUrl
  }

  get resultsUrl(): string {
    return this._resultsUrl
  }
  set resultsUrl(resultsUrl: string) {
    this._resultsUrl = resultsUrl
  }
  getResultsUrl(): string {
    return this._resultsUrl
  }
  setResultsUrl(resultsUrl: string) {
    this.resultsUrl = resultsUrl
  }

  get stitchingServiceUrl(): string {
    return this._stitchingServiceUrl
  }
  set stitchingServiceUrl(stitchingServiceUrl: string) {
    this._stitchingServiceUrl = stitchingServiceUrl
  }
  getStitchingServiceUrl(): string {
    return this._stitchingServiceUrl
  }
  setStitchingServiceUrl(stitchingServiceUrl: string) {
    this.stitchingServiceUrl = stitchingServiceUrl
  }

  getDecodedAccessToken(): {sub: string; exp: number; iss: string} {
    return utils.general.jwtDecode(this._accessToken) as {sub: string; exp: number; iss: string}
  }

  /** @internal */
  toJSON(): RenderingInfo {
    return utils.general.toJSON(this, ['accessToken', 'serviceUrl', 'resultsUrl', 'stitchingServiceUrl'])
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
