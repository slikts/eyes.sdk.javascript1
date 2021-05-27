import {Region, RectangleSize, TextRegion, Proxy} from './Options'
import {EyesConfig, EyesMakeConfig, EyesManagerConfig} from './Configs'
import {CheckSettings, LocateSettings, OCRExtractSettings, OCRSearchSettings} from './Settings'
import {MatchResult, TestResult} from './Results'

type DriverInfo = {
  sessionId?: string
  isMobile?: boolean
  isNative?: boolean
  deviceName?: string
  platformName?: string
  platformVersion?: string
  browserName?: string
  browserVersion?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Ref<TValue = unknown> = {'applitools-ref-id': string}

export interface Client<TDriver, TContext, TElement, TSelector> {
  request(name: 'Core.makeManager', options?: EyesManagerConfig): Promise<Ref>

  request(name: 'Core.getViewportSize', options: {driver: TDriver}): Promise<RectangleSize>

  request(name: 'Core.setViewportSize', options: {driver: TDriver; size: RectangleSize}): Promise<void>

  request(
    name: 'Core.closeBatch',
    options: {batchId: string; serverUrl?: string; apiKey?: string; proxy?: Proxy},
  ): Promise<void>

  request(
    name: 'Core.deleteTest',
    options: {testId: string; batchId: string; secretToken: string; serverUrl?: string; apiKey?: string; proxy?: Proxy},
  ): Promise<void>

  request(
    name: 'EyesManager.makeEyes',
    options: {manager: Ref} & EyesMakeConfig<TDriver, TElement, TSelector>,
  ): Promise<Ref>

  request(name: 'EyesManager.closeAllEyes', options: {manager: Ref}): Promise<TestResult[]>

  request(
    name: 'Eyes.check',
    options: {
      eyes: Ref
      settings: CheckSettings<TElement, TSelector>
      config?: EyesConfig<TElement, TSelector>
    },
  ): Promise<MatchResult>

  request<TLocator extends string>(
    name: 'Eyes.locate',
    options: {
      eyes: Ref
      settings: LocateSettings<TLocator>
      config?: EyesConfig<TElement, TSelector>
    },
  ): Promise<Record<TLocator, Region[]>>

  request(
    name: 'Eyes.extractText',
    options: {
      eyes: Ref
      regions: OCRExtractSettings<TElement, TSelector>[]
      config?: EyesConfig<TElement, TSelector>
    },
  ): Promise<string[]>

  request<TPattern extends string>(
    name: 'Eyes.extractTextRegions',
    options: {
      eyes: Ref
      settings: OCRSearchSettings<TPattern>
      config?: EyesConfig<TElement, TSelector>
    },
  ): Promise<Record<TPattern, TextRegion[]>>

  request(name: 'Eyes.close', options: {eyes: Ref}): Promise<TestResult>

  request(name: 'Eyes.abort', options: {eyes: Ref}): Promise<TestResult>

  command(
    name: 'Driver.isEqualElements',
    handler: (options: {context: TContext; element1: TElement; element2: TElement}) => Promise<boolean>,
  ): () => void

  command(name: 'Driver.mainContext', handler: (options: {context: TContext}) => Promise<TContext>): () => void

  command(name: 'Driver.parentContext', handler: (options: {context: TContext}) => Promise<TContext>): () => void

  command(
    name: 'Driver.childContext',
    handler: (options: {context: TContext; element: TElement}) => Promise<TContext>,
  ): () => void

  command(
    name: 'Driver.executeScript',
    handler: (options: {context: TContext; script: string; arg: any}) => Promise<any>,
  ): () => void

  command(
    name: 'Driver.findElement',
    handler: (options: {context: TContext; selector: TSelector}) => Promise<TElement | null>,
  ): () => void

  command(
    name: 'Driver.findElements',
    handler: (options: {context: TContext; selector: TSelector}) => Promise<TElement[]>,
  ): () => void

  command(
    name: 'Driver.getElementRect',
    handler: (options: {driver: TDriver; element: TElement}) => Promise<Region>,
  ): () => void

  command(name: 'Driver.getWindowRect', handler: (options: {driver: TDriver}) => Promise<Region>): () => void

  command(
    name: 'Driver.setWindowRect',
    handler: (options: {driver: TDriver; rect: Partial<Region>}) => Promise<void>,
  ): () => void

  command(name: 'Driver.getViewportSize', handler: (options: {driver: TDriver}) => Promise<RectangleSize>): () => void

  command(
    name: 'Driver.setViewportSize',
    handler: (options: {driver: TDriver; size: RectangleSize}) => Promise<void>,
  ): () => void

  command(name: 'Driver.getDriverInfo', handler: (options: {driver: TDriver}) => Promise<DriverInfo>): () => void

  command(
    name: 'Driver.getOrientation',
    handler: (options: {driver: TDriver}) => Promise<'portrait' | 'landscape'>,
  ): () => void

  command(name: 'Driver.getTitle', handler: (options: {driver: TDriver}) => Promise<string>): () => void

  command(name: 'Driver.getUrl', handler: (options: {driver: TDriver}) => Promise<string>): () => void

  command(name: 'Driver.takeScreenshot', handler: (options: {driver: TDriver}) => Promise<Buffer | string>): () => void
}

export interface Server<TDriver, TContext, TElement, TSelector> {
  request(
    name: 'Driver.isEqualElements',
    options: {context: TContext; element1: TElement; element2: TElement},
  ): Promise<boolean>

  request(name: 'Driver.mainContext', options: {context: TContext}): Promise<TContext>

  request(name: 'Driver.parentContext', options: {context: TContext}): Promise<TContext>

  request(name: 'Driver.childContext', options: {context: TContext; element: TElement}): Promise<TContext>

  request(name: 'Driver.executeScript', options: {context: TContext; script: string; arg: any}): Promise<any>

  request(name: 'Driver.findElement', options: {context: TContext; selector: TSelector}): Promise<TElement | null>

  request(name: 'Driver.findElements', options: {context: TContext; selector: TSelector}): Promise<TElement[]>

  request(name: 'Driver.getElementRect', options: {driver: TDriver; element: TElement}): Promise<Region>

  request(name: 'Driver.getWindowRect', options: {driver: TDriver}): Promise<Region>

  request(name: 'Driver.setWindowRect', options: {driver: TDriver; rect: Partial<Region>}): Promise<void>

  request(name: 'Driver.getViewportSize', options: {driver: TDriver}): Promise<RectangleSize>

  request(name: 'Driver.setViewportSize', options: {driver: TDriver; size: RectangleSize}): Promise<void>

  request(name: 'Driver.getDriverInfo', options: {driver: TDriver}): Promise<DriverInfo>

  request(name: 'Driver.getOrientation', options: {driver: TDriver}): Promise<'portrait' | 'landscape'>

  request(name: 'Driver.getTitle', options: {driver: TDriver}): Promise<string>

  request(name: 'Driver.getUrl', options: {driver: TDriver}): Promise<string>

  request(name: 'Driver.takeScreenshot', options: {driver: TDriver}): Promise<Buffer | string>

  command(name: 'Core.makeManager', options?: EyesManagerConfig): Promise<Ref>

  command(name: 'Core.getViewportSize', options: {driver: TDriver}): Promise<RectangleSize>

  command(name: 'Core.setViewportSize', options: {driver: TDriver; size: RectangleSize}): Promise<void>

  command(
    name: 'Core.closeBatch',
    handler: (options: {batchId: string; serverUrl?: string; apiKey?: string; proxy?: Proxy}) => Promise<void>,
  ): () => void

  command(
    name: 'Core.deleteTest',
    handler: (options: {
      testId: string
      batchId: string
      secretToken: string
      serverUrl?: string
      apiKey?: string
      proxy?: Proxy
    }) => Promise<void>,
  ): () => void

  command(
    name: 'EyesManager.makeEyes',
    handler: (options: {manager: Ref} & EyesMakeConfig<TDriver, TElement, TSelector>) => Promise<Ref>,
  ): () => void

  command(name: 'EyesManager.closeAllEyes', handler: (options: {manager: Ref}) => Promise<TestResult[]>): () => void

  command(
    name: 'Eyes.check',
    handler: (options: {
      eyes: Ref
      settings: CheckSettings<TElement, TSelector>
      config?: EyesConfig<TElement, TSelector>
    }) => Promise<MatchResult>,
  ): () => void

  command<TLocator extends string>(
    name: 'Eyes.locate',
    handler: (options: {
      eyes: Ref
      settings: LocateSettings<TLocator>
      config?: EyesConfig<TElement, TSelector>
    }) => Promise<Record<TLocator, Region[]>>,
  ): () => void

  command(
    name: 'Eyes.extractText',
    handler: (options: {
      eyes: Ref
      regions: OCRExtractSettings<TElement, TSelector>[]
      config?: EyesConfig<TElement, TSelector>
    }) => Promise<string[]>,
  ): () => void

  command<TPattern extends string>(
    name: 'Eyes.extractTextRegions',
    handler: (options: {
      eyes: Ref
      settings: OCRSearchSettings<TPattern>
      config?: EyesConfig<TElement, TSelector>
    }) => Promise<Record<TPattern, TextRegion[]>>,
  ): () => void

  command(name: 'Eyes.close', handler: (options: {eyes: Ref}) => Promise<TestResult>): () => void

  command(name: 'Eyes.abort', handler: (options: {eyes: Ref}) => Promise<TestResult>): () => void
}
