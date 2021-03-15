function makeExtractTextRegions({eyes}) {
  return async function extractTextRegions(settings) {
    return eyes.extractTextRegions(settings)
  }
}

module.exports = makeExtractTextRegions
