import { RectangleSize, ScreenOrientation } from "./Options";

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

export interface SpecDriver<TDriver, TContext, TElement, TSelector> {
    isDriver(driver: TDriver): boolean
    isElement(element: TElement): boolean
    isSelector(selector: TSelector): boolean
    transformDriver(driver: TDriver): TDriver
    transformElement(element: TElement): TElement
    extractSelector(element: TElement): TSelector
    isStaleElementError(error: Error): boolean
    isEqualElements(driver: TDriver, element1: TElement, element2: TElement): Promise<boolean>
    mainContext(context: TContext): Promise<TContext>
    parentContext(context: TContext): Promise<TContext>
    childContext(context: TContext, element: TElement): Promise<TContext>
    executeScript(context: TContext, script: (...args: any) => any | string, ...args: any[]): Promise<any>
    findElement(driver: TDriver, selector: TSelector): Promise<TElement | null>
    findElements(driver: TDriver, selector: TSelector): Promise<TElement[] | []>
    getDriverInfo(driver: TDriver): Promise<DriverInfo>
    getOrientation(driver: TDriver): Promise<ScreenOrientation>
    getTitle(driver: TDriver): Promise<string>
    getUrl(driver: TDriver): Promise<string>
    takeScreenshot(driver: TDriver): Promise<string>
    getElementRect(driver: TDriver): Promise<RectangleSize>
    setWindowRect(driver: TDriver, rect: RectangleSize | Location): void
    getWindowRect(driver: TDriver): Promise<RectangleSize>
    setViewportSize(driver: TDriver, size: RectangleSize): Promise<void>
    getViewportSize(driver: TDriver): Promise<RectangleSize>
}