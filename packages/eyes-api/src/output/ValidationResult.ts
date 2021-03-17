import * as utils from '@applitools/utils'

/** @undocumented */
export type ValidationResult = {
  asExpected: boolean
}

/** @undocumented */
export class ValidationResultData implements Required<ValidationResult> {
  private _asExpected: boolean

  constructor(result: ValidationResult)
  constructor(asExpected: boolean)
  constructor(resultOrAsExpected: ValidationResult | boolean) {
    if (utils.types.isBoolean(resultOrAsExpected)) {
      return new ValidationResultData({asExpected: resultOrAsExpected})
    }
    this._asExpected = resultOrAsExpected.asExpected
  }

  get asExpected(): boolean {
    return this._asExpected
  }
  getAsExpected() {
    return this._asExpected
  }
}
