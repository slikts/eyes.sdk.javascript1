const throwOnErr = require('./throw-on-err')

function makeCheckAndClose({eyes}) {
  return async function checkAndClose({settings, config, throwErr = false} = {}) {
    if (config) eyes._configuration.mergeConfig(config)
    debugger
    const testResults = await eyes.checkAndClose(settings, throwErr)
    if (throwErr) {
      throwOnErr({testResults})
    }
    return testResults
  }
}

module.exports = makeCheckAndClose
