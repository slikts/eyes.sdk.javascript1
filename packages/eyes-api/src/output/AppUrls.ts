import * as utils from '@applitools/utils'

export type AppUrls = {
  step?: string
  stepEditor?: string
}

export class AppUrlsData implements Required<AppUrls> {
  private _urls: AppUrls = {} as any

  /** @internal */
  constructor(urls?: AppUrls) {
    if (!urls) return this
    this._urls = urls instanceof AppUrlsData ? urls.toJSON() : urls
  }

  get step(): string {
    return this._urls.step
  }
  set step(step: string) {
    this._urls.step = step
  }
  getStep(): string {
    return this.step
  }
  setStep(step: string) {
    this.step = step
  }

  get stepEditor(): string {
    return this._urls.stepEditor
  }
  set stepEditor(stepEditor: string) {
    this._urls.stepEditor = stepEditor
  }
  getStepEditor(): string {
    return this.stepEditor
  }
  setStepEditor(stepEditor: string) {
    this.stepEditor = stepEditor
  }

  /** @internal */
  toObject(): AppUrls {
    return this._urls
  }

  /** @internal */
  toJSON(): AppUrls {
    return utils.general.toJSON(this._urls)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
