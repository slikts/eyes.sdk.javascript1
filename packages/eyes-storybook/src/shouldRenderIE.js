const {BrowserType} = require('@applitools/eyes-sdk-core');

function splitConfigsByBrowser(config) {
  const browsers = validateBrowsers(config);
  const result = browsers.reduce(
    (acc, browser) => {
      if (isIE(browser)) {
        acc[1].push(browser);
      } else {
        acc[0].push(browser);
      }
      return acc;
    },
    [[], []],
  );

  return result.map(browser => ({...config, browser})).filter(c => c.browser.length > 0);
}

function shouldRenderIE(config) {
  return hasIE(config) && config.fakeIE;
}

function hasIE(config) {
  return validateBrowsers(config).some(isIE);
}

function isIE(browser) {
  return browser.name === BrowserType.IE_11;
}

function validateBrowsers(config) {
  if (config.browser) {
    return Array.isArray(config.browser) ? config.browser : [config.browser];
  } else {
    return [];
  }
}

module.exports = {splitConfigsByBrowser, hasIE, shouldRenderIE};
