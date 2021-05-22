import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'
import {TestResultsStatusEnum} from './enums/TestResultsStatus'
import {NewTestError} from './errors/NewTestError'
import {DiffsFoundError} from './errors/DiffsFoundError'
import {TestFailedError} from './errors/TestFailedError'
import {Configuration} from './input/Configuration'
import {RunnerOptions, RunnerOptionsFluent} from './input/RunnerOptions'
import {TestResultsData} from './output/TestResults'
import {TestResultsSummaryData} from './output/TestResultsSummary'
import {Eyes} from './Eyes'

export abstract class EyesRunner {
  protected _spec: types.Core<unknown, unknown, unknown>

  private _manager: types.EyesManager<unknown, unknown, unknown>
  private _eyes: Eyes<unknown, unknown, unknown>[] = []
  private _configs: Map<string, Configuration<unknown, unknown>> = new Map()

  /** @internal */
  abstract get config(): types.Configs.EyesManagerConfig

  /** @internal */
  attach<TDriver, TElement, TSelector>(
    eyes: Eyes<TDriver, TElement, TSelector>,
    spec: types.Core<TDriver, TElement, TSelector>,
  ) {
    this._eyes.push(eyes)
    if (!this._spec) this._spec = spec
  }

  /** @internal */
  async makeEyes<TDriver, TElement, TSelector>(
    config: types.Configs.EyesCreateConfig<TDriver, TElement, TSelector>,
  ): Promise<types.Eyes<TElement, TSelector>> {
    if (!this._manager) this._manager = this._spec.makeManager(this.config)

    const eyes = await this._manager.makeEyes(config)
    this._configs.set(eyes.testId, config.config)
    return eyes
  }

  async getAllTestResults(throwErr = false): Promise<TestResultsSummaryData> {
    const results = await this._manager.closeAllEyes()

    const summary = new TestResultsSummaryData(
      results.map(result => {
        const config = this._configs.get(result.testId)
        const results = new TestResultsData(result, options =>
          this._spec.deleteTest({...options, serverUrl: config.serverUrl, apiKey: config.apiKey, proxy: config.proxy}),
        )

        if (results.status === TestResultsStatusEnum.Unresolved) {
          if (results.isNew) return new NewTestError(results)
          else return new DiffsFoundError(results)
        } else if (results.status === TestResultsStatusEnum.Failed) {
          return new TestFailedError(results)
        } else {
          return results
        }
      }),
    )

    if (throwErr) {
      for (const result of summary) {
        if (result.exception) throw result.exception
      }
    }

    return summary
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
  get config(): types.Configs.EyesManagerConfig<'vg'> {
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
  get config(): types.Configs.EyesManagerConfig<'classic'> {
    return {type: 'classic'}
  }
}
