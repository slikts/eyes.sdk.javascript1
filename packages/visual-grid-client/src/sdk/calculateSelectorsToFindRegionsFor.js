'use strict'

const {Region} = require('@applitools/eyes-sdk-core/shared')

function selectorObject(region) {
  region = region.region || region
  return region.type === 'xpath' || region.type === 'css'
    ? {type: region.type, selector: region.selector}
    : region.selector
}

function calculateSelectorsToFindRegionsFor({
  ignore,
  layout,
  strict,
  content,
  accessibility,
  floating,
}) {
  const userRegions = Object.entries({
    ignore,
    layout,
    strict,
    content,
    accessibility,
    floating,
  }).reduce((entries, [name, regions]) => {
    if (regions) {
      entries.set(name, Array.isArray(regions) ? regions : [regions])
    }
    return entries
  }, new Map())

  if (userRegions.size === 0) {
    return {getMatchRegions}
  }

  const selectorsToFindRegionsFor = Array.from(userRegions.values()).reduce((prev, regions) => {
    prev.push(...regions.filter(region => (region.region || region).selector).map(selectorObject))
    return prev
  }, [])

  // NOTE: in rare cases there might be duplicates here. Intentionally not removing them because later we map `selectorsToFindRegionsFor` to `selectorRegions`.
  return {selectorsToFindRegionsFor, getMatchRegions}

  function getMatchRegions({selectorRegions, imageLocation}) {
    let selectorRegionIndex = 0
    return Array.from(userRegions.entries()).reduce((allRegions, [regionName, userInput]) => {
      const regionValues = userInput.reduce((regions, userRegion) => {
        const region = userRegion.region || userRegion
        const codedRegions = region.selector ? selectorRegions[selectorRegionIndex++] : [region]

        if (codedRegions && codedRegions.length > 0) {
          codedRegions.forEach(region => {
            const regionObject = regionify({region})
            if (imageLocation && region.selector) {
              regionObject.left = Math.max(0, regionObject.left - imageLocation.x)
              regionObject.top = Math.max(0, regionObject.top - imageLocation.y)
            }
            regions.push(regionWithUserInput({regionObject, userRegion, regionName}))
          })
        }

        return regions
      }, [])
      allRegions[regionName] = regionValues
      return allRegions
    }, {})
  }
}

function regionify({region}) {
  const regionInst = new Region(region)
  return {
    width: regionInst.getWidth(),
    height: regionInst.getHeight(),
    left: regionInst.getLeft(),
    top: regionInst.getTop(),
  }
}

function regionWithUserInput({regionObject, userRegion, regionName}) {
  // accesibility regions
  if (regionName === 'accessibility') {
    Object.assign(regionObject, {
      type: userRegion.type,
    })
  }
  // floating region
  if (regionName === 'floating') {
    Object.assign(regionObject, {
      maxUpOffset: userRegion.maxUpOffset,
      maxDownOffset: userRegion.maxDownOffset,
      maxLeftOffset: userRegion.maxLeftOffset,
      maxRightOffset: userRegion.maxRightOffset,
    })
  }

  return regionObject
}

module.exports = calculateSelectorsToFindRegionsFor
