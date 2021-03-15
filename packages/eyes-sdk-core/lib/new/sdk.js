const EyesSDK = require('../sdk/EyesSDK')

const makeMakeEyes = require('./make-eyes')
const makeSetViewportSize = require('./set-viewport-size')
const makeCloseBatches = require('./close-batches')

function makeSdk(options) {
  const sdk = EyesSDK(options)

  return {
    makeEyes: makeMakeEyes(sdk),
    setViewportSize: makeSetViewportSize(sdk),
    closeBatches: makeCloseBatches(sdk),
  }
}

module.exports = makeSdk
