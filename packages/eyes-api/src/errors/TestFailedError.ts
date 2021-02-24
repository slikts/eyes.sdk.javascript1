import EyesError from './EyesError'
import {TestResults, TestResultsData} from '../output/TestResults'

export default class TestFailedError extends EyesError {
  private _testResults: TestResultsData
  constructor(message: string, testResults: TestResults) {
    super(message)
    this._testResults = new TestResultsData(testResults)
  }

  get testResults(): TestResults {
    return this._testResults
  }
  getTestResults(): TestResultsData {
    return this._testResults
  }
}
