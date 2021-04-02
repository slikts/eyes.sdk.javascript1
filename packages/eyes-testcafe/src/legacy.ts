import * as api from '@applitools/eyes-api'
import type {Driver, Element, Selector} from './spec-driver'

type TestCafeConfiguration = api.ConfigurationPlain<Element, Selector> & {
  concurrency?: api.ConfigurationPlain['concurrentSessions']
  browser?: api.ConfigurationPlain['browsersInfo']
  envName?: api.ConfigurationPlain['environmentName']
  batchId?: api.ConfigurationPlain['batch']['id']
  batchName?: api.ConfigurationPlain['batch']['name']
  notifyOnCompletion?: api.ConfigurationPlain['batch']['notifyOnCompletion']
  matchLevel?: api.ConfigurationPlain['defaultMatchSettings']['matchLevel']
  ignoreDisplacements?: api.ConfigurationPlain['defaultMatchSettings']['ignoreDisplacements']
  accessibilityValidation?: api.ConfigurationPlain['defaultMatchSettings']['accessibilitySettings']
  failTestcafeOnDiff?: boolean,
  tapDirPath?: boolean
}

type FloatingRegionReference<TElement, TSelector> = {
  left?: number
  top?: number
  width?: number
  height?: number
  maxUpOffset?: number
  maxDownOffset?: number
  maxLeftOffset?: number
  maxRightOffset?: number
}

type TestCafeCheckSettings = api.CheckSettingsPlain<Element, Selector> & {
  tag: api.CheckSettingsPlain['name']
  target: 'window' | 'region'
  selector: Selector
  floating:
}

export interface Eyes<TDriver, TElement, TSelector> {
  open(options?: {t: Driver} & TestCafeConfiguration)
  checkWindow(settings: TestCafeCheckSettings)
}