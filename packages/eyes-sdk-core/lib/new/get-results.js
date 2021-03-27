function makeGetResults({runner}) {
  return async function getResults() {
    const results = await runner.getAllTestResults(false)
    return results.getAllResults().map(results => results.toJSON())
  }
}

module.exports = makeGetResults
