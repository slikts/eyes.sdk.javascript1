const VisualGridRunner = require('../runner/VisualGridRunner')
const ClassicRunner = require('../runner/ClassicRunner')

const makeOpenEyes = require('./open-eyes')
const makeCloseAllEyes = require('./close-all-eyes')

function makeMakeManager(sdk) {
  return function makeManager({type, concurrency, legacy} = {}) {
    const runner =
      type === 'vg' ? new VisualGridRunner(legacy ? concurrency : {testConcurrency: concurrency}) : new ClassicRunner()

    return {
      openEyes: makeOpenEyes({sdk, runner}),
      closeAllEyes: makeCloseAllEyes({sdk, runner}),
    }
  }
}

module.exports = makeMakeManager
