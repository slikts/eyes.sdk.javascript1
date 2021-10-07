const {Builder} = require('selenium-webdriver')
const {makeSDK} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
const spec = require('@applitools/selenium-spec')
const {describe} = require('mocha')
var assert = require('assert');

describe('waitBeforeCapture', () => {  
    let driver, manager, sdk, eyes

    beforeEach(async () => {
        driver = await new Builder().withCapabilities({browserName: 'chrome', 'goog:chromeOptions': {args: []}}).build()
        sdk = makeSDK({
            name: 'core-e2e',
            version: '1.0.0',
            spec,
            VisualGridClient 
        })
        manager = await sdk.makeManager({type: 'vg', concurrency: 5})
       
    })

    afterEach(async () => { 
        if (driver) await driver.close()
        if (eyes) await eyes.abort()
        manager.closeAllEyes()
    })

    it('test waitBeforeCapture with layoutBreakpoints - config', async () => {       
        const config = {
            appName: 'core app',
            testName: 'waitBeforeCapture with layoutbreakpoints - config',
            layoutBreakpoints: true,
            matchTimeout: 0,
            saveNewTests: false,
            viewportSize: {width: 800, height: 600},
            waitBeforeCapture: 1500,
            browsersInfo: [
                {name: 'chrome', width: 1000, height: 600},
            ]
        }
        eyes = await manager.openEyes({driver, config})
        await driver.get('https://applitools.github.io/demo/TestPages/waitBeforeCapture/')
        await eyes.check({})
        await eyes.close({throwErr: true})
        
    })

    it('test waitBeforeCapture with layoutBreakpoints - checkSettings', async () => {
        const config = {
            appName: 'core app',
            testName: 'waitBeforeCapture with layoutbreakpoints - checkSettings',
            layoutBreakpoints: true,
            matchTimeout: 0,
            saveNewTests: false,
            viewportSize: {width: 800, height: 600},
            browsersInfo: [
                {name: 'chrome', width: 1000, height: 600}
            ]
        }
        const settings = {waitBeforeCapture: 1500}
        eyes = await manager.openEyes({driver, config})
        await driver.get('https://applitools.github.io/demo/TestPages/waitBeforeCapture/')
        await eyes.check({settings})
        await eyes.close({throwErr: true})
    })
})