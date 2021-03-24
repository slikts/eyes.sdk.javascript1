const MatchResult = require('../match/MatchResult')

function makeCheck({eyes}) {
  return async function check(settings) {
    const result = await eyes.check(settings)
    return result ? result.toJSON() : new MatchResult().toJSON()
  }
}

module.exports = makeCheck
