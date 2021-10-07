"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = exports.getCookies = exports.waitUntilDisplayed = exports.scrollIntoView = exports.type = exports.hover = exports.click = exports.takeScreenshot = exports.visit = exports.getUrl = exports.getTitle = exports.getDriverInfo = exports.getOrientation = exports.setWindowSize = exports.getWindowSize = exports.getElementRect = exports.findElements = exports.findElement = exports.childContext = exports.parentContext = exports.mainContext = exports.executeScript = exports.isEqualElements = exports.isStaleElementError = exports.transformDriver = exports.isSelector = exports.isElement = exports.isDriver = void 0;
const utils = require("@applitools/utils");
const byHash = ['className', 'css', 'id', 'js', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath'];
function extractElementId(element) {
    return element.getId();
}
function transformSelector(selector) {
    if (utils.types.isString(selector)) {
        return { css: selector };
    }
    else if (utils.types.has(selector, ['type', 'selector'])) {
        if (selector.type === 'css')
            return { css: selector.selector };
        else if (selector.type === 'xpath')
            return { xpath: selector.selector };
        else
            return { using: selector.type, value: selector.selector };
    }
    return selector;
}
function isDriver(driver) {
    return utils.types.instanceOf(driver, 'WebDriver');
}
exports.isDriver = isDriver;
function isElement(element) {
    return utils.types.instanceOf(element, 'WebElement');
}
exports.isElement = isElement;
function isSelector(selector) {
    if (!selector)
        return false;
    return (utils.types.has(selector, ['type', 'selector']) ||
        utils.types.has(selector, ['using', 'value']) ||
        Object.keys(selector).some(key => byHash.includes(key)) ||
        utils.types.isString(selector));
}
exports.isSelector = isSelector;
function transformDriver(driver) {
    if (process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
        const cmd = require('selenium-webdriver/lib/command');
        cmd.Name.SWITCH_TO_PARENT_FRAME = 'switchToParentFrame';
        driver.getExecutor().defineCommand(cmd.Name.SWITCH_TO_PARENT_FRAME, 'POST', '/session/:sessionId/frame/parent');
        cmd.Name.EXECUTE_CDP = 'executeCdp';
        driver
            .getExecutor()
            .defineCommand(cmd.Name.EXECUTE_CDP, 'POST', 'session/:sessionId/chromium/send_command_and_get_result');
    }
    return driver;
}
exports.transformDriver = transformDriver;
function isStaleElementError(error) {
    if (!error)
        return false;
    error = error.originalError || error;
    return error instanceof Error && error.name === 'StaleElementReferenceError';
}
exports.isStaleElementError = isStaleElementError;
async function isEqualElements(_driver, element1, element2) {
    if (!element1 || !element2)
        return false;
    const elementId1 = await extractElementId(element1);
    const elementId2 = await extractElementId(element2);
    return elementId1 === elementId2;
}
exports.isEqualElements = isEqualElements;
async function executeScript(driver, script, arg) {
    return driver.executeScript(script, arg);
}
exports.executeScript = executeScript;
async function mainContext(driver) {
    await driver.switchTo().defaultContent();
    return driver;
}
exports.mainContext = mainContext;
async function parentContext(driver) {
    if (process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
        const cmd = require('selenium-webdriver/lib/command');
        await driver.schedule(new cmd.Command(cmd.Name.SWITCH_TO_PARENT_FRAME));
        return driver;
    }
    await driver.switchTo().parentFrame();
    return driver;
}
exports.parentContext = parentContext;
async function childContext(driver, element) {
    await driver.switchTo().frame(element);
    return driver;
}
exports.childContext = childContext;
async function findElement(driver, selector) {
    try {
        return await driver.findElement(transformSelector(selector));
    }
    catch (err) {
        if (err.name === 'NoSuchElementError')
            return null;
        else
            throw err;
    }
}
exports.findElement = findElement;
async function findElements(driver, selector) {
    return driver.findElements(transformSelector(selector));
}
exports.findElements = findElements;
async function getElementRect(_driver, element) {
    return element.getRect();
}
exports.getElementRect = getElementRect;
async function getWindowSize(driver) {
    try {
        const window = driver.manage().window();
        if (utils.types.isFunction(window.getRect)) {
            const rect = await window.getRect();
            return { width: rect.width, height: rect.height };
        }
        else if (utils.types.isFunction(window.getSize)) {
            return await window.getSize();
        }
    }
    catch (err) {
        const cmd = require('selenium-webdriver/lib/command');
        return driver.execute(new cmd.Command(cmd.Name.GET_WINDOW_SIZE).setParameter('windowHandle', 'current'));
    }
}
exports.getWindowSize = getWindowSize;
async function setWindowSize(driver, size) {
    const window = driver.manage().window();
    if (utils.types.isFunction(window.setRect)) {
        await window.setRect({ x: 0, y: 0, width: size.width, height: size.height });
    }
    else {
        await window.setPosition(0, 0);
        await window.setSize(size.width, size.height);
    }
}
exports.setWindowSize = setWindowSize;
async function getOrientation(driver) {
    const capabilities = await driver.getCapabilities();
    const orientation = capabilities.get('orientation') || capabilities.get('deviceOrientation');
    return orientation.toLowerCase();
}
exports.getOrientation = getOrientation;
async function getDriverInfo(driver) {
    var _a, _b, _c, _d, _e, _f;
    const capabilities = await driver.getCapabilities();
    const desiredCapabilities = (_a = capabilities.get('desired')) !== null && _a !== void 0 ? _a : {};
    const session = await driver.getSession();
    const sessionId = session.getId();
    const deviceName = (_b = desiredCapabilities.deviceName) !== null && _b !== void 0 ? _b : capabilities.get('deviceName');
    const platformName = (_d = (_c = capabilities.get('platformName')) !== null && _c !== void 0 ? _c : capabilities.get('platform')) !== null && _d !== void 0 ? _d : desiredCapabilities.platformName;
    const platformVersion = capabilities.get('platformVersion');
    const browserName = (_e = capabilities.get('browserName')) !== null && _e !== void 0 ? _e : desiredCapabilities.browserName;
    const browserVersion = (_f = capabilities.get('browserVersion')) !== null && _f !== void 0 ? _f : capabilities.get('version');
    const isMobile = ['android', 'ios'].includes(platformName === null || platformName === void 0 ? void 0 : platformName.toLowerCase());
    return {
        sessionId,
        isMobile,
        isNative: isMobile && !browserName,
        deviceName,
        platformName,
        platformVersion,
        browserName,
        browserVersion,
    };
}
exports.getDriverInfo = getDriverInfo;
async function getTitle(driver) {
    return driver.getTitle();
}
exports.getTitle = getTitle;
async function getUrl(driver) {
    return driver.getCurrentUrl();
}
exports.getUrl = getUrl;
async function visit(driver, url) {
    await driver.get(url);
}
exports.visit = visit;
async function takeScreenshot(driver) {
    return driver.takeScreenshot();
}
exports.takeScreenshot = takeScreenshot;
async function click(driver, element) {
    if (isSelector(element))
        element = await findElement(driver, element);
    await element.click();
}
exports.click = click;
async function hover(driver, element) {
    if (isSelector(element))
        element = await findElement(driver, element);
    if (process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3') {
        const { ActionSequence } = require('selenium-webdriver');
        const action = new ActionSequence(driver);
        await action.mouseMove(element).perform();
    }
    else {
        await driver.actions().move({ origin: element }).perform();
    }
}
exports.hover = hover;
async function type(driver, element, keys) {
    if (isSelector(element))
        element = await findElement(driver, element);
    await element.sendKeys(keys);
}
exports.type = type;
async function scrollIntoView(driver, element, align = false) {
    if (isSelector(element))
        element = await findElement(driver, element);
    await driver.executeScript('arguments[0].scrollIntoView(arguments[1])', element, align);
}
exports.scrollIntoView = scrollIntoView;
async function waitUntilDisplayed(driver, selector, timeout) {
    const { until } = require('selenium-webdriver');
    const element = await findElement(driver, selector);
    await driver.wait(until.elementIsVisible(element), timeout);
}
exports.waitUntilDisplayed = waitUntilDisplayed;
async function getCookies(driver) {
    const { browserName, isMobile } = await getDriverInfo(driver);
    const seleniumVersion3 = process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3';
    console.log(seleniumVersion3);
    let allCookies;
    if (!isMobile && browserName.search(/chrome/i) !== -1) {
        const cmd = require('selenium-webdriver/lib/command');
        const command = new cmd.Command(seleniumVersion3 ? cmd.Name.EXECUTE_CDP : 'sendAndGetDevToolsCommand')
            .setParameter('cmd', 'Network.getAllCookies')
            .setParameter('params', {});
        if (seleniumVersion3) {
            console.log('@@@')
            const { cookies } = await driver.schedule(command);
            allCookies = { cookies, all: true };
        }
        else {
            const { cookies } = await driver.execute(command);
            allCookies = { cookies, all: true };
        }
    }
    else {
        const cookies = await driver.manage().getCookies();
        allCookies = { cookies, all: false };
    }
    return {
        cookies: allCookies.cookies.map((cookie) => {
            var _a;
            return ({
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path,
                expiry: (_a = cookie.expires) !== null && _a !== void 0 ? _a : cookie.expiry,
                sameSite: cookie.sameSite,
                httpOnly: cookie.httpOnly,
                secure: cookie.secure,
            });
        }),
        all: allCookies.all,
    };
}
exports.getCookies = getCookies;
const browserOptionsNames = {
    chrome: 'goog:chromeOptions',
    firefox: 'moz:firefoxOptions',
};
async function build(env) {
    var _a;
    const { Builder } = require('selenium-webdriver');
    const parseEnv = require('@applitools/test-utils/src/parse-env');
    const { browser = '', capabilities, url, attach, proxy, configurable = true, appium = false, args = [], headless, } = parseEnv(Object.assign(Object.assign({}, env), { legacy: (_a = env.legacy) !== null && _a !== void 0 ? _a : process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION === '3' }));
    const desiredCapabilities = Object.assign({ browserName: browser }, capabilities);
    if (configurable) {
        const browserOptionsName = browserOptionsNames[browser || desiredCapabilities.browserName];
        if (browserOptionsName) {
            const browserOptions = desiredCapabilities[browserOptionsName] || {};
            browserOptions.args = [...(browserOptions.args || []), ...args];
            if (headless)
                browserOptions.args.push('headless');
            if (attach) {
                browserOptions.debuggerAddress = attach === true ? 'localhost:9222' : attach;
                if (browser !== 'firefox')
                    browserOptions.w3c = false;
            }
            desiredCapabilities[browserOptionsName] = browserOptions;
        }
    }
    if (appium && browser === 'chrome') {
        desiredCapabilities['appium:chromeOptions'] = { w3c: false };
    }
    const builder = new Builder().withCapabilities(desiredCapabilities);
    if (url && !attach)
        builder.usingServer(url.href);
    if (proxy) {
        builder.setProxy({
            proxyType: 'manual',
            httpProxy: proxy.http || proxy.server,
            sslProxy: proxy.https || proxy.server,
            ftpProxy: proxy.ftp,
            noProxy: proxy.bypass,
        });
    }
    const driver = await builder.build();
    return [driver, () => driver.quit()];
}
exports.build = build;
// exports.wrapDriver = legacy.wrapDriver;
//# sourceMappingURL=spec-driver.js.map