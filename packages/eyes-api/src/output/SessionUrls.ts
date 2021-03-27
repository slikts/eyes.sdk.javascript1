import * as utils from '@applitools/utils'

export type SessionUrls = {
  batch?: string
  session?: string
}

export class SessionUrlsData implements Required<SessionUrls> {
  private _urls: SessionUrls = {} as any

  /** @internal */
  constructor(urls?: SessionUrls) {
    if (!urls) return this
    this._urls = urls instanceof SessionUrlsData ? urls.toJSON() : urls
  }

  get batch(): string {
    return this._urls.batch
  }
  set batch(batch: string) {
    this._urls.batch = batch
  }
  getBatch(): string {
    return this.batch
  }
  setBatch(batch: string) {
    this.batch = batch
  }

  get session(): string {
    return this._urls.session
  }
  set session(session: string) {
    this._urls.session = session
  }
  getSession(): string {
    return this.session
  }
  setSession(session: string) {
    this.session = session
  }

  /** @internal */
  toObject(): SessionUrls {
    return this._urls
  }

  /** @internal */
  toJSON(): SessionUrls {
    return utils.general.toJSON(this._urls)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
