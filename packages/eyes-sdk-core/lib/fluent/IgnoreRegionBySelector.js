'use strict'
const Region = require('../geometry/Region')
const CoordinatesTypes = require('../geometry/CoordinatesType')
const GetRegion = require('./GetRegion')

/**
 * @typedef {import('../config/AccessibilityRegionType').AccessibilityRegionType} AccessibilityRegionType
 * @typedef {import('../wrappers/EyesWrappedElement').EyesSelector} EyesSelector
 * @typedef {import('../EyesClassic')} EyesClassic
 */

/**
 * @template TDriver, TElement, TSelector
 * @typedef {import('../wrappers/EyesWrappedDriver')<TDriver, TElement, TSelector>} EyesWrappedDriver
 */

/**
 * @typedef {EyesSelector} IgnorePersistedRegion
 */

/**
 * @internal
 * @template TSelector
 */
class IgnoreRegionBySelector extends GetRegion {
  /**
   * @param {TSelector} selector
   */
  constructor(selector) {
    super()
    this._selector = selector
  }
  /**
   * @param {EyesClassic} eyes
   * @param {EyesScreenshot} screenshot
   * @return {Promise<Region[]>}
   */
  async getRegion(eyes, screenshot) {
    // TODO eyes should be replaced with driver once all SDKs will use this implementation
    const elements = await eyes.getDriver().elements(this._selector)

    const regions = []
    for (const element of elements) {
      const rect = await element.getRect()
      const lTag = screenshot.convertLocation(
        rect.getLocation(),
        CoordinatesTypes.CONTEXT_RELATIVE,
        CoordinatesTypes.SCREENSHOT_AS_IS,
      )
      regions.push(new Region(lTag.getX(), lTag.getY(), rect.getWidth(), rect.getHeight()))
    }
    return regions
  }
}

module.exports = IgnoreRegionBySelector
