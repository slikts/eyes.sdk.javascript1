import {AccessibilityStatus, AccessibilityStatusLiteral} from '../enums/AccessibilityStatus'
import {AccessibilityLevel, AccessibilityLevelLiteral} from '../enums/AccessibilityLevel'
import {
  AccessibilityGuidelinesVersion,
  AccessibilityGuidelinesVersionLiteral,
} from '../enums/AccessibilityGuidelinesVersion'

export type TestAccessibilityStatus = {
  readonly status: AccessibilityStatus | AccessibilityStatusLiteral
  readonly level: AccessibilityLevel | AccessibilityLevelLiteral
  readonly version: AccessibilityGuidelinesVersion | AccessibilityGuidelinesVersionLiteral
}
