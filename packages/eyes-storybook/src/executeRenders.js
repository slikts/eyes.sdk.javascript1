const {refineErrorMessage} = require('./errMessages');
const {presult} = require('@applitools/functional-commons');
const {shouldRenderIE} = require('./shouldRenderIE');

function makeExecuteRenders({timeItAsync, renderStories, pagePool, stories, logger, setRenderIE}) {
  return async function executeRendersByBrowser(renderConfigs) {
    const results = [];
    for (const renderConfig of renderConfigs) {
      logger.verbose(`executing render story with ${JSON.stringify(renderConfig)}`);
      results.push(...(await executeRenders(renderConfig)));
    }

    return results;
  };

  async function executeRenders(config) {
    if (shouldRenderIE(config)) {
      pagePool.drain();
      setRenderIE(true);
    }
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
