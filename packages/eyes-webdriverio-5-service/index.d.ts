import type {
  Element,
  Selector,
  CheckSettingsPlain,
  CheckSettings,
  ConfigurationPlain,
  Configuration,
  TestResults,
  TestResultsSummary,
} from '@applitools/eyes-webdriverio'

declare module WebdriverIO {
  interface ServiceOption extends ConfigurationPlain {
    useVisualGrid: boolean,
    concurrency: number
  }
  interface Browser {
    eyesCheck(title: string, checkSettings: CheckSettings | CheckSettingsPlain): Promise<void>;
    eyesSetScrollRootElement(element: Element | Selector): void;
    eyesAddProperty(key: string, value: string): void;
    eyesClearProperties(): void;
    eyesGetTestResults(): Promise<TestResults>;
    eyesSetConfiguration(configuration: ConfigurationPlain): void;
    eyesGetConfiguration(): Configuration;
    eyesGetIsOpen(): boolean;
    eyesGetAllTestResults(): Promise<TestResultsSummary>;
  }
}
