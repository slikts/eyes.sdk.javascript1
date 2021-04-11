const {presult} = require('@applitools/functional-commons');
const {hasIE} = require('./validateBrowsers');
const browserLog = require('./browserLog');

function makeInitPage({iframeUrl, config, browser, logger}) {
  return async function initPage({pageId, pagePool}) {
    logger.log('initializing puppeteer page number ', pageId);
    const page = await browser.newPage();

    if (config.viewportSize) {
      await page.setViewport(config.viewportSize);
    }

    if (config.showLogs) {
      browserLog({
        page,
        onLog: text => {
          if (text.match(/\[dom-snapshot\]/)) {
            logger.log(`tab ${pageId}: ${text}`);
          }
        },
      });
    }

    page.on('error', async err => {
      logger.log(`Puppeteer error for page ${pageId}:`, err);
      pagePool.removePage(pageId);
      const {pageId: newPageId} = await pagePool.createPage();
      pagePool.addToPool(newPageId);
    });

    page.on('close', async () => {
      if (pagePool.isInPool(pageId)) {
        logger.log(
          `Puppeteer page closed [page ${pageId}] while still in page pool, creating a new one instead`,
        );
        pagePool.removePage(pageId);
        const {pageId} = await pagePool.createPage();
        pagePool.addToPool(pageId);
      }
    });

    const [err] = await presult(page.goto(iframeUrl, {timeout: config.readStoriesTimeout}));
    if (err) {
      logger.log(`error navigating to iframe.html`, err);
      if (pagePool.isInPool(pageId)) {
        throw err;
      }
    }

    if (config.fakeIE && hasIE(config)) {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko',
      );
      await page.evaluate('document.documentMode = 11');
    }

    return page;
  };
}

module.exports = makeInitPage;
