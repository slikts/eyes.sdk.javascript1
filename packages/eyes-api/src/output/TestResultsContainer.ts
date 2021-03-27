import * as utils from '@applitools/utils'
import {TestResults, TestResultsData} from './TestResults'

export type TestResultsContainer = {
  exception: Error
  testResults: TestResults
}

export class TestResultsContainerData implements Required<TestResultsContainer> {
  private _container: TestResultsContainer = {} as any

  /** @internal */
  constructor(container: TestResultsContainer) {
    this._container = container instanceof TestResultsContainerData ? container.toJSON() : container
  }

  get testResults(): TestResults {
    return this._container.testResults
  }
  getTestResults(): TestResultsData {
    return new TestResultsData(this.testResults)
  }

  get exception(): Error {
    return this._container.exception
  }
  getException(): Error {
    return this.exception
  }

  /** @internal */
  toObject(): TestResultsContainer {
    return this._container
  }

  /** @internal */
  toJSON(): TestResultsContainer {
    return utils.general.toJSON(this._container)
  }

  /** @internal */
  toString() {
    return `${this.testResults ? this.testResults : ''} - ${this.exception ? this.exception : ''}`
  }
}
