import * as utils from '@applitools/utils'

export type MatchResult = {
  asExpected?: boolean
  windowId?: number
}

export class MatchResultData implements Required<MatchResult> {
  private _result: MatchResult = {} as any

  /** @internal */
  constructor(result?: MatchResult) {
    if (!result) return this
    this._result = result instanceof MatchResultData ? result.toJSON() : result
  }

  get asExpected(): boolean {
    return this._result.asExpected
  }
  set asExpected(asExpected: boolean) {
    utils.guard.isBoolean(asExpected, {name: 'asExpected', strict: false})
    this._result.asExpected = asExpected
  }
  getAsExpected(): boolean {
    return this.asExpected
  }
  setAsExpected(asExpected: boolean) {
    this.asExpected = asExpected
  }

  get windowId(): number {
    return this._result.windowId
  }
  set windowId(windowId: number) {
    utils.guard.isNumber(windowId, {name: 'windowId', strict: false})
    this._result.windowId = windowId
  }
  getWindowId(): number {
    return this.windowId
  }
  setWindowId(windowId: number) {
    this.windowId = windowId
  }

  /** @internal */
  toObject(): MatchResult {
    return this._result
  }

  /** @internal */
  toJSON(): MatchResult {
    return utils.general.toJSON(this._result)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
