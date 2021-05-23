import {AccessibilityLevel, AccessibilityLevelLiteral} from '../enums/AccessibilityLevel'
import {
  AccessibilityGuidelinesVersion,
  AccessibilityGuidelinesVersionLiteral,
} from '../enums/AccessibilityGuidelinesVersion'

export type AccessibilitySettings = {
  level?: AccessibilityLevel | AccessibilityLevelLiteral
  guidelinesVersion?: AccessibilityGuidelinesVersion | AccessibilityGuidelinesVersionLiteral
}
