import * as api from '@applitools/eyes-api'
import * as spec from './spec-driver'
import sdk from './sdk'
import type {Driver, Element, Selector} from './spec-driver'

export {Driver, Element, Selector}

export {LegacySelector as By} from './legacy-api'
export * from '@applitools/eyes-api'

export type CheckSettingsPlain = api.CheckSettingsPlain<Element, Selector>
export class CheckSettings extends api.CheckSettings<Element, Selector> {
  protected readonly _spec = spec
}
export const Target: api.Target<Element, Selector> = CheckSettings as any

export const closeBatch = api.closeBatch(sdk)

export class BatchClose extends api.BatchClose {
  protected readonly _spec = sdk
}

export class Eyes extends api.Eyes<Driver, Element, Selector> {
  protected readonly _spec = {...sdk, ...spec}
}
