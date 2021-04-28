const {presult} = require('@applitools/functional-commons');
const {shouldRenderIE} = require('./shouldRenderIE');
const {refineErrorMessage} = require('./errMessages');

async function executeRenders({
  timeItAsync,
  setTransitioningIntoIE,
  renderStories,
  configs,
  pagePool,
  stories,
  logger,
  setRenderIE,
}) {
  const results = [];
  for (const config of configs) {
    logger.verbose(`executing render story with ${JSON.stringify(config)}`);
    if (shouldRenderIE(config)) {
      setRenderIE(true);
      setTransitioningIntoIE(true);
      await pagePool.drain();
      setTransitioningIntoIE(false);
    }
    const [error, result] = await presult(
      timeItAsync('renderStories', () => renderStories(stories, config)),
    );

    if (error) {
      const msg = refineErrorMessage({prefix: 'Error in renderStories:', error});
      logger.log(error);
      throw new Error(msg);
    }

    results.push(...result);
  }

  return results;
}

module.exports = executeRenders;
