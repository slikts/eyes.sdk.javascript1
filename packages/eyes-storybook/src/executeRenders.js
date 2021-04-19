const {refineErrorMessage} = require('./errMessages');
const {presult} = require('@applitools/functional-commons');
const {shouldRenderIE} = require('./shouldRenderIE');

function makeExecuteRenders({
  timeItAsync,
  closeBatch,
  renderStories,
  stories,
  logger,
  setRenderIE,
}) {
  return async function executeRendersByBrowser(renderConfigs) {
    const results = await renderConfigs.reduce(async (promise, renderConfig) => {
      const acc = await promise;
      logger.verbose(
        `executing render story for browsers ${renderConfig.browser
          .map(b => b.name)
          .join(' ')} with ${JSON.stringify(renderConfig)}`,
      );
      acc.push(...(await executeRenders(renderConfig)));
      return acc;
    }, Promise.resolve([]));

    const [closeBatchErr] = await presult(closeBatch());
    if (closeBatchErr) {
      logger.log('failed to close batch', closeBatchErr);
    }

    return results;
  };

  async function executeRenders(config) {
    if (shouldRenderIE(config)) setRenderIE(true);
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
