const {BrowserType} = require('@applitools/eyes-sdk-core');

function splitConfigsByBrowser(config) {
  const browsers = Array.isArray(config.browser) ? config.browser : [config.browser];
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
  return config.browser.some(isIE);
}

function isIE(browser) {
  return browser.name === BrowserType.IE_11;
}

module.exports = {splitConfigsByBrowser, hasIE, shouldRenderIE};
