const {BrowserType} = require('@applitools/eyes-sdk-core');

function splitBrowsersByIE({browser = []}) {
  return (
    browser.length &&
    browser.reduce(
      (acc, item) => {
        if (item.name === BrowserType.IE_11) {
          acc[0].push(item);
        } else {
          acc[1].push(item);
        }
        return acc;
      },
      [[], []],
    )
  );
}

function hasIE(config) {
  return config.browser.some(b => b.name === BrowserType.IE_11);
}

module.exports = {splitBrowsersByIE, hasIE};
