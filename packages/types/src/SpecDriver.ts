import { RectangleSize, Region } from "./Options";

type DriverInfo = {
    sessionId?: string,
    isMobile?: boolean,
    isNative?: boolean,
    deviceName?: string,
    platformName?: string,
    platformVersion?: string,
    browserName?: string,
    browserVersion?: string
}

export type SpecSelector<TSelector> = TSelector | string | {type: string; selector: string}
export interface SpecDriver<TDriver, TContext, TElement, TSelector> {
    isDriver(driver: any): driver is TDriver
    isElement(element: any): element is TElement
    isSelector(selector: any): selector is SpecSelector<TSelector>
    transformDriver?(driver: TDriver): TDriver
    transformElement?(element: TElement): TElement
    extractSelector?(element: TElement): SpecSelector<TSelector>
    isStaleElementError(error: Error): boolean
    isEqualElements(context: TContext, element1: TElement, element2: TElement): Promise<boolean>
    mainContext(context: TContext): Promise<TContext>
    parentContext(context: TContext): Promise<TContext>
    childContext(context: TContext, element: TElement): Promise<TContext>
    executeScript(context: TContext, script: (arg?: any) => any | string, arg?: any): Promise<any>
    findElement(contenxt: TContext, selector: SpecSelector<TSelector>): Promise<TElement | null>
    findElements(context: TContext, selector: SpecSelector<TSelector>): Promise<TElement[]>
    getDriverInfo?(driver: TDriver): Promise<DriverInfo>
    getOrientation?(driver: TDriver): Promise<'portrait' | 'landscape'>
    getTitle(driver: TDriver): Promise<string>
    getUrl(driver: TDriver): Promise<string>
    takeScreenshot(driver: TDriver): Promise<string | Buffer>
    getElementRect?(driver: TDriver, element: TElement): Promise<RectangleSize>
    setWindowRect?(driver: TDriver, rect: Partial<Region>): Promise<void>
    getWindowRect?(driver: TDriver): Promise<Region>
    setViewportSize?(driver: TDriver, size: RectangleSize): Promise<void>
    getViewportSize?(driver: TDriver): Promise<RectangleSize>
}