import * as utils from '@applitools/utils'
import {Eyes} from './Eyes'
import {RunnerOptions, RunnerOptionsFluent} from './input/RunnerOptions'

export type RunnerConfiguration<TType extends 'vg' | 'classic' = 'vg' | 'classic'> = {
  type: TType
  concurrency?: TType extends 'vg' ? number : never
  legacy?: TType extends 'vg' ? boolean : never
}

export abstract class EyesRunner {
  private _make: (config: RunnerConfiguration) => (...args: any[]) => unknown
  private _open: (...args: any[]) => unknown
  private _eyes: Eyes[] = []

  /** @internal */
  abstract get config(): RunnerConfiguration

  /** @internal */
  attach(eyes: Eyes, init: (...args: any) => any) {
    this._eyes.push(eyes)
    this._make = this._make || init
  }

  /** @internal */
  open(...args: any[]): unknown {
    if (!this._open) this._open = this._make(this.config)

    return this._open(...args)
  }

  async getAllTestResults(throwErr = false): Promise<any> {
    if (this._eyes.length > 0) {
      const results = await Promise.all(
        this._eyes.map(eyes => {
          return eyes.closeBatch().then(() => eyes.close())
        }),
      )

      return results
    }
  }
}

export class VisualGridRunner extends EyesRunner {
  private _testConcurrency: number
  private _legacyConcurrency: number

  constructor(options: RunnerOptions)
  /** @deprecated */
  constructor(options: RunnerOptionsFluent)
  /** @deprecated */
  constructor(legacyConcurrency: number)
  constructor(optionsOrLegacyConcurrency: RunnerOptions | RunnerOptionsFluent | number) {
    super()
    if (utils.types.isNumber(optionsOrLegacyConcurrency)) {
      this._legacyConcurrency = optionsOrLegacyConcurrency
    } else {
      const options =
        optionsOrLegacyConcurrency instanceof RunnerOptionsFluent
          ? optionsOrLegacyConcurrency.toJSON()
          : optionsOrLegacyConcurrency
      this._testConcurrency = options.testConcurrency
    }
  }

  /** @internal */
  get config(): RunnerConfiguration<'vg'> {
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
  get config(): RunnerConfiguration<'classic'> {
    return {type: 'classic'}
  }
}
