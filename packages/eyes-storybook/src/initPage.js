const {presult} = require('@applitools/functional-commons');
const browserLog = require('./browserLog');
const fakeIE = require('./fakeIE');

function makeInitPage({iframeUrl, config, browser, logger, getRenderIE}) {
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
        const {pageId: newPageId} = await pagePool.createPage();
        pagePool.addToPool(newPageId);
      }
    });

    const [err] = await presult(page.goto(iframeUrl, {timeout: config.readStoriesTimeout}));
    if (err) {
      logger.log(`error navigating to iframe.html`, err);
      if (pagePool.isInPool(pageId)) {
        throw err;
      }
    }

    if (getRenderIE()) {
      await fakeIE({logger, page});
    }

    return page;
  };
}

module.exports = makeInitPage;
