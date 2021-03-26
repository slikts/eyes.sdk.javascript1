function makeAbort({eyes}) {
  return async function abort() {
    const result = await eyes.abort()
    return result ? result.toJSON() : null
  }
}

module.exports = makeAbort
