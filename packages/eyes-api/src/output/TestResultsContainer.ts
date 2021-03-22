import {TestResults, TestResultsData} from './TestResults'

export type TestResultsContainer = {
  exception: Error
  testResults: TestResults
}

export class TestResultsContainerData implements Required<TestResultsContainer> {
  private _exception: Error
  private _testResults: TestResultsData

  /** @internal */
  constructor(container: TestResultsContainer) {
    this._testResults = new TestResultsData(container.testResults)
    this._exception = container.exception
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
