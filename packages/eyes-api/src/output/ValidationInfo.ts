import * as utils from '@applitools/utils'

export type ValidationInfo = {
  validationId: number
  tag: string
}

export class ValidationInfoData implements Required<ValidationInfo> {
  private _validationId: number
  private _tag: string

  constructor(info: ValidationInfo)
  constructor(validationId: number, tag: string)
  constructor(infoOrValidationId: ValidationInfo | number, tag?: string) {
    if (utils.types.isNumber(infoOrValidationId)) {
      return new ValidationInfoData({validationId: infoOrValidationId, tag})
    }
    this._validationId = infoOrValidationId.validationId
    this._tag = infoOrValidationId.tag
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
