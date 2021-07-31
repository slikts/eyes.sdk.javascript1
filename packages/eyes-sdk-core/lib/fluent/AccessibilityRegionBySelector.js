'use strict'
const AccessibilityMatchSettings = require('../config/AccessibilityMatchSettings')
const CoordinatesTypes = require('../geometry/CoordinatesType')
const GetAccessibilityRegion = require('./GetAccessibilityRegion')

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
 * @typedef {EyesSelector & {accessibilityType: AccessibilityRegionType}} AccessibilityPersistedRegion
 */

/**
 * @internal
 * @template TSelector
 */
class AccessibilityRegionBySelector extends GetAccessibilityRegion {
  /**
   * @param {TSelector} selector
   * @param {AccessibilityRegionType} [type]
   */
  constructor(selector, type) {
    super()
    this._selector = selector
    this._type = type
  }
  /**
   * @param {EyesClassic} eyes
   * @param {EyesScreenshot} screenshot
   * @return {Promise<AccessibilityMatchSettings[]>}
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
      const accessibilityRegion = new AccessibilityMatchSettings({
        left: lTag.getX(),
        top: lTag.getY(),
        width: rect.getWidth(),
        height: rect.getHeight(),
        type: this._type,
      })
      regions.push(accessibilityRegion)
    }

    return regions
  }
}

module.exports = AccessibilityRegionBySelector
