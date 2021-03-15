function makeLocate({eyes}) {
  return async function locate(settings) {
    return eyes.locate(settings)
  }
}

module.exports = makeLocate
