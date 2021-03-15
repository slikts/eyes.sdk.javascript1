function makeExtractText({eyes}) {
  return async function extractText(regions) {
    return eyes.extractText(regions)
  }
}

module.exports = makeExtractText
