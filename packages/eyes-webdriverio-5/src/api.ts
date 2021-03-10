import {makeSDK} from '@applitools/eyes-sdk-core'
import * as api from '@applitools/eyes-api'
import * as spec from './spec-driver'
import {version} from '../package.json'
import type {Driver, Element, Selector} from './spec-driver'

const sdk = makeSDK({
  name: 'eyes.webdriverio',
  version,
  spec,
  VisualGridClient: require('@applitools/visual-grid-client'),
})

export * from '@applitools/eyes-api'

export {LegacySelector as By} from './legacy-api'

export {Driver, Element, Selector}

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
