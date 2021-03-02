import {RectangleSizeData} from './RectangleSize'
import {TestResultsData} from '../output/TestResults'
import {ValidationInfo, ValidationInfoData} from '../output/ValidationInfo'
import {ValidationResult, ValidationResultData} from '../output/ValidationResult'

export type SessionEventHandler = {
  initStarted: () => Promise<void>
  initEnded: () => Promise<void>
  setSizeWillStart: (size: RectangleSizeData) => Promise<void>
  setSizeEnded: () => Promise<void>
  testStarted: (autSessionId: string) => Promise<void>
  testEnded: (autSessionId: string, testResults: TestResultsData) => Promise<void>
  validationWillStart: (autSessionId: string, validationInfo: ValidationInfoData) => Promise<void>
  validationEnded: (autSessionId: string, validationId: number, validationResult: ValidationResultData) => Promise<void>
}

export abstract class SessionEventHandlerData implements Required<SessionEventHandler> {
  abstract initStarted(): Promise<void>
  abstract initEnded(): Promise<void>
  abstract setSizeWillStart(size: RectangleSizeData): Promise<void>
  abstract setSizeEnded(): Promise<void>
  abstract testStarted(autSessionId: string): Promise<void>
  abstract testEnded(autSessionId: string, testResults: TestResultsData): Promise<void>
  abstract validationWillStart(autSessionId: string, validationInfo: ValidationInfo): Promise<void>
  abstract validationEnded(
    autSessionId: string,
    validationId: number,
    validationResult: ValidationResult,
  ): Promise<void>
}

export class RemoteSessionEventHandlerData extends SessionEventHandlerData {
  initStarted(): Promise<void> {
    return undefined
  }
  initEnded(): Promise<void> {
    return undefined
  }
  setSizeWillStart(): Promise<void> {
    return undefined
  }
  setSizeEnded(): Promise<void> {
    return undefined
  }
  testStarted(): Promise<void> {
    return undefined
  }
  testEnded(): Promise<void> {
    return undefined
  }
  validationWillStart(): Promise<void> {
    return undefined
  }
  validationEnded(): Promise<void> {
    return undefined
  }
}
