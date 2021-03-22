/** @undocumented */
export type ValidationResult = {
  asExpected: boolean
}

/** @undocumented */
export class ValidationResultData implements Required<ValidationResult> {
  private _asExpected: boolean

  /** @internal */
  constructor(result: ValidationResult) {
    this._asExpected = result.asExpected
  }

  get asExpected(): boolean {
    return this._asExpected
  }
  getAsExpected() {
    return this._asExpected
  }
}
