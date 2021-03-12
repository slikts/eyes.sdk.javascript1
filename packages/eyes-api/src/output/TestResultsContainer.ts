import * as utils from '@applitools/utils'
import {TestResults, TestResultsData} from './TestResults'

export type TestResultsContainer = {
  exception: Error
  testResults: TestResults
}

export class TestResultsContainerData implements Required<TestResultsContainer> {
  private _exception: Error
  private _testResults: TestResultsData

  constructor(testResultsContainer: TestResultsContainer)
  constructor(testResults: TestResults, exception: Error)
  constructor(containerOrResults?: TestResultsContainer | TestResults, exception?: Error) {
    if (!utils.types.has(containerOrResults, ['testResults', 'exception'])) {
      return new TestResultsContainerData({testResults: containerOrResults, exception})
    }
    this._testResults = new TestResultsData(containerOrResults.testResults)
    this._exception = containerOrResults.exception
  }

  get testResults(): TestResults {
    return this._testResults
  }
  getTestResults(): TestResultsData {
    return this._testResults
  }

  get exception(): Error {
    return this._exception
  }
  getException(): Error {
    return this._exception
  }

  /** @internal */
  toString() {
    return `${this._testResults ? this._testResults : ''} - ${this._exception ? this._exception : ''}`
  }
}
