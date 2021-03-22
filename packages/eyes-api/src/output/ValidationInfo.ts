/** @undocumented */
export type ValidationInfo = {
  validationId: number
  tag: string
}

/** @undocumented */
export class ValidationInfoData implements Required<ValidationInfo> {
  private _validationId: number
  private _tag: string

  /** @internal */
  constructor(info: ValidationInfo) {
    this._validationId = info.validationId
    this._tag = info.tag
  }

  get validationId(): number {
    return this._validationId
  }
  getValidationId() {
    return this._validationId
  }

  get tag(): string {
    return this._tag
  }
  getTag() {
    return this._tag
  }
}
