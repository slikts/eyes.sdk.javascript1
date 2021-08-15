const DiffsFoundError = require('../errors/DiffsFoundError')
const NewTestError = require('../errors/NewTestError')
const TestFailedError = require('../errors/TestFailedError')

function throwOnErr({testResults}) {
  for (const result of testResults) {
    if (result.status === 'Unresolved') {
      if (result.isNew) throw new NewTestError(result)
      else throw new DiffsFoundError(result)
    } else if (result.status === 'Failed') {
      throw new TestFailedError(result)
    }
  }
}

module.exports = throwOnErr
