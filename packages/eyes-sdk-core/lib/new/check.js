function makeCheck({eyes}) {
  return async function check(settings) {
    const result = await eyes.check(settings)
    return result.toJSON()
  }
}

module.exports = makeCheck
