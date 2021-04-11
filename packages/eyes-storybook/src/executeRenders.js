const {refineErrorMessage} = require('./errMessages');
const {presult} = require('@applitools/functional-commons');

function makeExecuteRenders({timeItAsync, closeBatch, renderStories, stories, config, logger}) {
  return async function executeRendersByBrowser(browsers) {
    const results = await browsers.reduce(async (promise, browser) => {
      const acc = await promise;
      if (browser.length) {
        logger.verbose(`executing render story for browsers ${browser.map(b => b.name).join(' ')}`);
        acc.push(...(await executeRenders({...config, browser})));
      }
      return acc;
    }, Promise.resolve([]));

    const [closeBatchErr] = await presult(closeBatch());
    if (closeBatchErr) {
      logger.log('failed to close batch', closeBatchErr);
    }

    return results;
  };

  async function executeRenders(config) {
    const [error, results] = await presult(
      timeItAsync('renderStories', () => renderStories(stories, config)),
    );

    if (error) {
      const msg = refineErrorMessage({prefix: 'Error in renderStories:', error});
      logger.log(error);
      throw new Error(msg);
    } else {
      return results;
    }
  }
}

module.exports = makeExecuteRenders;
