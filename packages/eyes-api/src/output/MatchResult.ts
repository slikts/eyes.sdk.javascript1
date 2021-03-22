import * as utils from '@applitools/utils'

export type MatchResult = {
  asExpected?: boolean
  windowId?: number
}

export class MatchResultData implements Required<MatchResult> {
  private _asExpected: boolean
  private _windowId: number

  /** @internal */
  constructor(result?: MatchResult) {
    if (!result) return this
    this.asExpected = result.asExpected
    this.windowId = result.windowId
  }

  get asExpected(): boolean {
    return this._asExpected
  }
  set asExpected(asExpected: boolean) {
    utils.guard.isBoolean(asExpected, {name: 'asExpected', strict: false})
    this._asExpected = asExpected
  }
  getAsExpected(): boolean {
    return this._asExpected
  }
  setAsExpected(asExpected: boolean) {
    this.asExpected = asExpected
  }

  get windowId(): number {
    return this._windowId
  }
  set windowId(windowId: number) {
    utils.guard.isNumber(windowId, {name: 'windowId', strict: false})
    this._windowId = windowId
  }
  getWindowId(): number {
    return this._windowId
  }
  setWindowId(windowId: number) {
    this.windowId = windowId
  }

  /** @internal */
  toJSON(): Required<MatchResult> {
    return utils.general.toJSON(this, ['asExpected', 'windowId'])
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
