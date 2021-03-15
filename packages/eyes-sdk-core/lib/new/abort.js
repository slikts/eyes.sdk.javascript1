function makeAbort({eyes}) {
  return async function abort() {
    const result = await eyes.abort()
    return result.toJSON()
  }
}

module.exports = makeAbort
