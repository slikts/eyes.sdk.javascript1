"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapDriver = exports.build = exports.waitUntilDisplayed = exports.scrollIntoView = exports.hover = exports.type = exports.click = exports.takeScreenshot = exports.visit = exports.getUrl = exports.getTitle = exports.getDriverInfo = exports.getOrientation = exports.setWindowSize = exports.getWindowSize = exports.getElementRect = exports.findElements = exports.findElement = exports.childContext = exports.parentContext = exports.mainContext = exports.executeScript = exports.isEqualElements = exports.isStaleElementError = exports.extractSelector = exports.transformElement = exports.isSelector = exports.isElement = exports.isDriver = void 0;
const utils = require("@applitools/utils");
const LEGACY_ELEMENT_ID = 'ELEMENT';
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf';
function extractElementId(element) {
    if (utils.types.has(element, 'elementId'))
        return element.elementId;
    else if (utils.types.has(element, ELEMENT_ID))
        return element[ELEMENT_ID];
    else if (utils.types.has(element, LEGACY_ELEMENT_ID))
        return element[LEGACY_ELEMENT_ID];
}
function transformSelector(selector) {
    if (selector instanceof legacy.By) {
        return selector.toString();
    }
    else if (utils.types.has(selector, ['type', 'selector'])) {
        if (selector.type === 'css')
            return `css selector:${selector.selector}`;
        else if (selector.type === 'xpath')
            return `xpath:${selector.selector}`;
        else
            return `${selector.type}:${selector.selector}`;
    }
    return selector;
}
function transformArgument(arg) {
    if (!arg)
        return [];
    const elements = [];
    const argWithElementMarkers = transform(arg);
    return [argWithElementMarkers, ...elements];
    function transform(arg) {
        if (isElement(arg)) {
            elements.push(arg);
            return { isElement: true };
        }
        else if (utils.types.isArray(arg)) {
            return arg.map(transform);
        }
        else if (utils.types.isObject(arg)) {
            return Object.entries(arg).reduce((object, [key, value]) => {
                return Object.assign(object, { [key]: transform(value) });
            }, {});
        }
        else {
            return arg;
        }
    }
}
function scriptRunner(script, arg, ...elements) {
    const func = new Function(script.startsWith('function') ? `return (${script}).apply(null, arguments)` : script);
    return func(transform(arg));
    function transform(arg) {
        if (!arg) {
            return arg;
        }
        else if (arg.isElement) {
            return elements.shift();
        }
        else if (Array.isArray(arg)) {
            return arg.map(transform);
        }
        else if (typeof arg === 'object') {
            return Object.entries(arg).reduce((object, [key, value]) => {
                return Object.assign(object, { [key]: transform(value) });
            }, {});
        }
        else {
            return arg;
        }
    }
}
function isDriver(browser) {
    return browser.constructor.name === 'Browser';
}
exports.isDriver = isDriver;
function isElement(element) {
    if (!element)
        return false;
    return Boolean(element.elementId || element[ELEMENT_ID] || element[LEGACY_ELEMENT_ID]);
}
exports.isElement = isElement;
function isSelector(selector) {
    return (utils.types.isString(selector) ||
        utils.types.isFunction(selector) ||
        utils.types.has(selector, ['type', 'selector']) ||
        selector instanceof legacy.By);
}
exports.isSelector = isSelector;
function transformElement(element) {
    const elementId = extractElementId(element);
    return { [ELEMENT_ID]: elementId, [LEGACY_ELEMENT_ID]: elementId };
}
exports.transformElement = transformElement;
function extractSelector(element) {
    return element.selector;
}
exports.extractSelector = extractSelector;
function isStaleElementError(error) {
    if (!error)
        return false;
    const errOrResult = error.originalError || error;
    return errOrResult instanceof Error && errOrResult.name === 'stale element reference';
}
exports.isStaleElementError = isStaleElementError;
async function isEqualElements(browser, element1, element2) {
    if (browser.isDevTools || browser.isIOS) {
        try {
            return await browser.execute((element1, element2) => element1 === element2, element1, element2);
        }
        catch (err) {
            return false;
        }
    }
    if (!element1 || !element2)
        return false;
    const elementId1 = extractElementId(element1);
    const elementId2 = extractElementId(element2);
    return elementId1 === elementId2;
}
exports.isEqualElements = isEqualElements;
async function executeScript(browser, script, arg) {
    if (browser.isDevTools) {
        script = utils.types.isString(script) ? script : script.toString();
        return browser.execute(scriptRunner, script, ...transformArgument(arg));
    }
    else {
        return browser.execute(script, arg);
    }
}
exports.executeScript = executeScript;
async function mainContext(browser) {
    await browser.switchToFrame(null);
    return browser;
}
exports.mainContext = mainContext;
async function parentContext(browser) {
    await browser.switchToParentFrame();
    return browser;
}
exports.parentContext = parentContext;
async function childContext(browser, element) {
    await browser.switchToFrame(element);
    return browser;
}
exports.childContext = childContext;
async function findElement(browser, selector) {
    const element = await browser.$(transformSelector(selector));
    return !utils.types.has(element, 'error') ? element : null;
}
exports.findElement = findElement;
async function findElements(browser, selector) {
    const elements = await browser.$$(transformSelector(selector));
    return Array.from(elements);
}
exports.findElements = findElements;
async function getElementRect(browser, element) {
    const extendedElement = await browser.$(element);
    if (utils.types.isFunction(extendedElement, 'getRect')) {
        return extendedElement.getRect();
    }
    else {
        const rect = { x: 0, y: 0, width: 0, height: 0 };
        if (utils.types.isFunction(extendedElement.getLocation)) {
            const location = await extendedElement.getLocation();
            rect.x = location.x;
            rect.y = location.y;
        }
        if (utils.types.isFunction(extendedElement.getSize)) {
            const size = await extendedElement.getSize();
            rect.width = size.width;
            rect.height = size.height;
        }
        return rect;
    }
}
exports.getElementRect = getElementRect;
async function getWindowSize(browser) {
    if (utils.types.isFunction(browser.getWindowRect)) {
        const rect = await browser.getWindowRect();
        return { width: rect.width, height: rect.height };
    }
    else {
        return browser.getWindowSize();
    }
}
exports.getWindowSize = getWindowSize;
async function setWindowSize(browser, size) {
    if (utils.types.isFunction(browser.setWindowRect)) {
        await browser.setWindowRect(0, 0, size.width, size.height);
    }
    else {
        await browser.setWindowPosition(0, 0);
        await browser.setWindowSize(size.width, size.height);
    }
}
exports.setWindowSize = setWindowSize;
async function getOrientation(browser) {
    const orientation = await browser.getOrientation();
    return orientation.toLowerCase();
}
exports.getOrientation = getOrientation;
async function getDriverInfo(browser) {
    var _a, _b, _c;
    const capabilities = browser.capabilities;
    return {
        sessionId: browser.sessionId,
        isMobile: browser.isMobile,
        isNative: browser.isMobile && !capabilities.browserName,
        deviceName: capabilities.desired ? capabilities.desired.deviceName : capabilities.deviceName,
        platformName: (_a = capabilities.platformName) !== null && _a !== void 0 ? _a : capabilities.platform,
        platformVersion: capabilities.platformVersion,
        browserName: (_b = capabilities.browserName) !== null && _b !== void 0 ? _b : capabilities.desired.browserName,
        browserVersion: (_c = capabilities.browserVersion) !== null && _c !== void 0 ? _c : capabilities.version,
    };
}
exports.getDriverInfo = getDriverInfo;
async function getTitle(browser) {
    return browser.getTitle();
}
exports.getTitle = getTitle;
async function getUrl(browser) {
    return browser.getUrl();
}
exports.getUrl = getUrl;
async function visit(browser, url) {
    await browser.url(url);
}
exports.visit = visit;
async function takeScreenshot(browser) {
    if (browser.isDevTools) {
        const puppeteer = await browser.getPuppeteer();
        const [page] = await puppeteer.pages();
        const scr = await page._client.send('Page.captureScreenshot');
        return scr.data;
    }
    return browser.takeScreenshot();
}
exports.takeScreenshot = takeScreenshot;
async function click(browser, element) {
    if (isSelector(element))
        element = await findElement(browser, element);
    const extendedElement = await browser.$(element);
    await extendedElement.click();
}
exports.click = click;
async function type(browser, element, keys) {
    if (isSelector(element))
        element = await findElement(browser, element);
    const extendedElement = await browser.$(element);
    await extendedElement.setValue(keys);
}
exports.type = type;
async function hover(browser, element) {
    if (isSelector(element))
        element = await findElement(browser, element);
    if (browser.isDevTools) {
        const { x, y, width, height } = await browser.execute((element) => {
            const rect = element.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        }, element);
        const puppeteer = await browser.getPuppeteer();
        const [page] = await puppeteer.pages();
        await page.mouse.move(x + width / 2, y + height / 2);
    }
    else {
        const extendedElement = await browser.$(element);
        await extendedElement.moveTo();
    }
}
exports.hover = hover;
async function scrollIntoView(browser, element, align = false) {
    if (isSelector(element))
        element = await findElement(browser, element);
    const extendedElement = await browser.$(element);
    await extendedElement.scrollIntoView(align);
}
exports.scrollIntoView = scrollIntoView;
async function waitUntilDisplayed(browser, selector, timeout) {
    const element = await findElement(browser, selector);
    if (process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION === '5') {
        await element.waitForDisplayed(timeout);
    }
    else {
        await element.waitForDisplayed({ timeout });
    }
}
exports.waitUntilDisplayed = waitUntilDisplayed;
const browserOptionsNames = {
    chrome: 'goog:chromeOptions',
    firefox: 'moz:firefoxOptions',
};
async function build(env) {
    const webdriverio = require('webdriverio');
    const chromedriver = require('chromedriver');
    const parseEnv = require('@applitools/test-utils/src/parse-env');
    const { protocol, browser = '', capabilities, url, attach, proxy, configurable = true, args = [], headless, logLevel = 'silent', } = parseEnv(env, process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL);
    const options = {
        capabilities: Object.assign({ browserName: browser }, capabilities),
        logLevel,
    };
    if (browser === 'chrome' && protocol === 'cdp') {
        options.automationProtocol = 'devtools';
        options.capabilities[browserOptionsNames.chrome] = { args };
        options.capabilities['wdio:devtoolsOptions'] = {
            headless,
            ignoreDefaultArgs: ['--hide-scrollbars'],
        };
    }
    else if (protocol === 'wd') {
        options.automationProtocol = 'webdriver';
        options.protocol = url.protocol ? url.protocol.replace(/:$/, '') : undefined;
        options.hostname = url.hostname;
        if (url.port)
            options.port = Number(url.port);
        else if (options.protocol === 'http')
            options.port = 80;
        else if (options.protocol === 'https')
            options.port = 443;
        options.path = url.pathname;
        if (configurable) {
            if (browser === 'chrome' && attach) {
                await chromedriver.start(['--port=9515'], true);
                options.protocol = 'http';
                options.hostname = 'localhost';
                options.port = 9515;
                options.path = '/';
            }
            const browserOptionsName = browserOptionsNames[browser || options.capabilities.browserName];
            if (browserOptionsName) {
                const browserOptions = options.capabilities[browserOptionsName] || {};
                browserOptions.args = [...(browserOptions.args || []), ...args];
                if (headless)
                    browserOptions.args.push('headless');
                if (attach) {
                    browserOptions.debuggerAddress = attach === true ? 'localhost:9222' : attach;
                    if (browser !== 'firefox')
                        browserOptions.w3c = false;
                }
                options.capabilities[browserOptionsName] = browserOptions;
            }
        }
    }
    if (proxy) {
        options.capabilities.proxy = {
            proxyType: 'manual',
            httpProxy: proxy.http || proxy.server,
            sslProxy: proxy.https || proxy.server,
            ftpProxy: proxy.ftp,
            noProxy: proxy.bypass.join(','),
        };
    }
    const driver = await webdriverio.remote(options);
    return [driver, () => driver.deleteSession().then(() => chromedriver.stop())];
}
exports.build = build;
//# sourceMappingURL=spec-driver.js.map