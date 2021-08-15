const throwOnErr = require('./throw-on-err')

function makeClose({eyes}) {
  return async function close({throwErr = false} = {}) {
    let testResults = await eyes.close()
    if (throwErr) {
      throwOnErr({testResults})
    }
    return testResults
  }
}

module.exports = makeClose
