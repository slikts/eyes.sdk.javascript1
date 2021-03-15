const makeCheck = require('./check')
const makeLocate = require('./locate')
const makeClose = require('./close')
const makeAbort = require('./abort')

function makeOpen({sdk, runner}) {
  return async function open(driver, config) {
    const eyes = new sdk.EyesFactory(runner)
    eyes.setConfiguration(config)
    eyes.setScrollRootElement(config.scrollRootElement)
    await eyes.open(driver, config.appName, config.testName)

    return {
      check: makeCheck({eyes}),
      locate: makeLocate({eyes}),
      close: makeClose({eyes}),
      abort: makeAbort({eyes}),
    }
  }
}

module.exports = makeOpen
