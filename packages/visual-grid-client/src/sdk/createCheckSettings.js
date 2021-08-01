function createCheckSettings({
  ignore,
  floating,
  layout,
  strict,
  content,
  accessibility,
  useDom,
  enablePatterns,
  ignoreDisplacements,
  renderId,
  matchLevel,
  variationGroupId,
}) {
  return {
    ignoreRegions: ignore,
    floatingRegions: floating,
    layoutRegions: layout,
    strictRegions: strict,
    contentRegions: content,
    accessibilityRegions: accessibility,
    useDom,
    enablePatterns,
    ignoreDisplacements,
    renderId,
    matchLevel,
    variationGroupId,
  }
}

module.exports = createCheckSettings
