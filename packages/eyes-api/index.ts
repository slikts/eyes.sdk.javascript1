// #region ENUM

export {default as AccessibilityGuidelinesVersion} from './src/enums/AccessibilityGuidelinesVersion'
export {default as AccessibilityLevel} from './src/enums/AccessibilityLevel'
export {default as AccessibilityRegionType} from './src/enums/AccessibilityRegionType'
export {default as AccessibilityStatus} from './src/enums/AccessibilityStatus'
export {default as BrowserType} from './src/enums/BrowserName'
export {default as DeviceName} from './src/enums/DeviceName'
export {default as IosDeviceName} from './src/enums/IOSDeviceName'
export {default as IosVersion} from './src/enums/IOSVersion'
export {default as MatchLevel} from './src/enums/MatchLevel'
export {default as ScreenOrientation} from './src/enums/ScreenOrientation'
export {default as StitchMode} from './src/enums/StitchMode'
export {default as SessionType} from './src/enums/SessionType'
export {default as TestResultsStatus} from './src/enums/TestResultsStatus'

// #endregion

// #region INPUT

export {
  CheckSettings as CheckSettingsPlain,
  CheckSettingsFluent as CheckSettings,
  Target,
} from './src/input/CheckSettings'
export {
  GeneralConfiguration as GeneralConfigurationPlain,
  OpenConfiguration as OpenConfigurationPlain,
  CheckConfiguration as CheckConfigurationPlain,
  ClassicConfiguration as ClassicConfigurationPlain,
  VGConfiguration as VGConfigurationPlain,
  Configuration as ConfigurationPlain,
  ConfigurationData as Configuration,
} from './src/input/Configuration'
export {ProxySettings as ProxySettingsPlain, ProxySettingsData as ProxySettings} from './src/input/ProxySettings'
export {
  ImageMatchSettings as ImageMatchSettingsPlain,
  ImageMatchSettingsData as ImageMatchSettings,
} from './src/input/ImageMatchSettings'
export {
  ExactMatchSettings as ExactMatchSettingsPlain,
  ExactMatchSettingsData as ExactMatchSettings,
} from './src/input/ExactMatchSettings'
export {
  AccessibilityMatchSettings as AccessibilityMatchSettingsPlain,
  AccessibilityMatchSettingsData as AccessibilityMatchSettings,
} from './src/input/AccessibilityMatchSettings'
export {AccessibilitySettings} from './src/input/AccessibilitySettings'
export {
  FloatingMatchSettings as FloatingMatchSettingsPlain,
  FloatingMatchSettingsData as FloatingMatchSettings,
} from './src/input/FloatingMatchSettings'
export {BatchInfo as BatchInfoPlain, BatchInfoData as BatchInfo} from './src/input/BatchInfo'
export {PropertyData as PropertyDataPlain, PropertyDataData as PropertyData} from './src/input/PropertyData'
export {DesktopBrowserInfo, ChromeEmulationInfo, IOSDeviceInfo} from './src/input/RenderInfo'
export {Location as LocationPlain, LocationData as Location} from './src/input/Location'
export {RectangleSize as RectangleSizePlain, RectangleSizeData as RectangleSize} from './src/input/RectangleSize'
export {Region as RegionPlain, RegionData as Region} from './src/input/Region'
export {
  RunnerOptions as RunnerOptionsPlain,
  RunnerOptionsFluent,
  RunnerOptionsFluentInit as RunnerOptions,
} from './src/input/RunnerOptions'

// #endregion

// #region OUTPUT

export {ApiUrls as ApiUrlsPlain, ApiUrlsData as ApiUrls} from './src/output/ApiUrls'
export {AppUrls as AppUrlsPlain, AppUrlsData as AppUrls} from './src/output/AppUrls'
export {SessionUrls as SessionUrlsPlain, SessionUrlsData as SessionUrls} from './src/output/SessionUrls'
export {StepInfo as StepInfoPlain, StepInfoData as StepInfo} from './src/output/StepInfo'
export {TestResults as TestResultsPlain, TestResultsData as TestResults} from './src/output/TestResults'
export {MatchResult as MatchResultPlain, MatchResultData as MatchResult} from './src/output/MatchResult'

// #endregion

export {EyesRunner, ClassicRunner, VisualGridRunner} from './src/Runners'
export {Eyes} from './src/Eyes'
