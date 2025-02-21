import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'
import {NewTestError} from './errors/NewTestError'
import {DiffsFoundError} from './errors/DiffsFoundError'
import {TestFailedError} from './errors/TestFailedError'
import {RunnerOptions, RunnerOptionsFluent} from './input/RunnerOptions'
import {TestResultsData} from './output/TestResults'
import {TestResultsSummaryData} from './output/TestResultsSummary'
import {Eyes} from './Eyes'

type EyesRunnerSpec<TDriver = unknown, TElement = unknown, TSelector = unknown> = types.Core<
  TDriver,
  TElement,
  TSelector
>

export abstract class EyesRunner {
  protected _spec: EyesRunnerSpec<unknown, unknown, unknown>

  private _manager: types.EyesManager<unknown, unknown, unknown>
  private _eyes: Eyes<unknown, unknown, unknown>[] = []

  /** @internal */
  abstract get config(): types.EyesManagerConfig

  /** @internal */
  attach<TDriver, TElement, TSelector>(
    eyes: Eyes<TDriver, TElement, TSelector>,
    spec: EyesRunnerSpec<TDriver, TElement, TSelector>,
  ) {
    if (!this._spec) this._spec = spec
    this._eyes.push(eyes)
  }

  /** @internal */
  async openEyes<TDriver, TElement, TSelector>(options: {
    driver: TDriver
    config?: types.EyesConfig<TElement, TSelector>
    on?: (name: string, data?: Record<string, any>) => void
  }): Promise<types.Eyes<TElement, TSelector>> {
    if (!this._manager) this._manager = await this._spec.makeManager(this.config)

    return await this._manager.openEyes(options)
  }

  async getAllTestResults(throwErr = true): Promise<TestResultsSummaryData> {
    if (!this._manager) return new TestResultsSummaryData([])
    const [eyes] = this._eyes
    const deleteTest = (options: any) =>
      this._spec.deleteTest({
        ...options,
        serverUrl: eyes.configuration.serverUrl,
        apiKey: eyes.configuration.apiKey,
        proxy: eyes.configuration.proxy,
      })
    try {
      const results = await this._manager.closeAllEyes({throwErr})
      return new TestResultsSummaryData(results.map(result => new TestResultsData(result, deleteTest)))
    } catch (err) {
      if (!err.info?.testResult) throw err
      const testResult = new TestResultsData(err.info.testResult, deleteTest)
      if (err.reason === 'test failed') {
        throw new TestFailedError(err.message, testResult)
      } else if (err.reason === 'test different') {
        throw new DiffsFoundError(err.message, testResult)
      } else if (err.reason === 'test new') {
        throw new NewTestError(err.message, testResult)
      }
    }
  }
}

export class VisualGridRunner extends EyesRunner {
  private _testConcurrency: number
  private _legacyConcurrency: number

  constructor(options?: RunnerOptions)
  /** @deprecated */
  constructor(options?: RunnerOptionsFluent)
  /** @deprecated */
  constructor(legacyConcurrency?: number)
  constructor(optionsOrLegacyConcurrency?: RunnerOptions | RunnerOptionsFluent | number) {
    super()
    if (utils.types.isNumber(optionsOrLegacyConcurrency)) {
      this._legacyConcurrency = optionsOrLegacyConcurrency
    } else if (optionsOrLegacyConcurrency) {
      const options =
        optionsOrLegacyConcurrency instanceof RunnerOptionsFluent
          ? optionsOrLegacyConcurrency.toJSON()
          : optionsOrLegacyConcurrency
      this._testConcurrency = options.testConcurrency
    }
  }

  /** @internal */
  get config(): types.EyesManagerConfig<'vg'> {
    return {
      type: 'vg',
      concurrency: this._testConcurrency || this._legacyConcurrency,
      legacy: Boolean(this._legacyConcurrency),
    }
  }

  get testConcurrency() {
    return this._testConcurrency
  }

  /** @deprecated */
  get legacyConcurrency() {
    return this._legacyConcurrency
  }

  /** @deprecated */
  getConcurrentSessions() {
    return this._legacyConcurrency
  }
}

export class ClassicRunner extends EyesRunner {
  /** @internal */
  get config(): types.EyesManagerConfig<'classic'> {
    return {type: 'classic'}
  }
}
