import * as utils from '@applitools/utils'

export type RunnerOptions = {
  testConcurrency: number
}

export class RunnerOptionsFluent {
  private _testConcurrency: number

  testConcurrency(concurrency: number): this {
    utils.guard.isInteger(concurrency, {name: 'concurrency', gte: 1})
    this._testConcurrency = concurrency
    return this
  }

  toJSON(): RunnerOptions {
    return utils.general.toJSON(this, {testConcurrency: '_testConcurrency'})
  }

  toString(): string {
    return utils.general.toString(this)
  }
}

export function RunnerOptionsFluentInit(): RunnerOptionsFluent {
  return new RunnerOptionsFluent()
}
