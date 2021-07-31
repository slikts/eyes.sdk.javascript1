'use strict'
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
 * @template TElement, TSelector
 * @typedef {import('../wrappers/EyesWrappedElement')<any, TElement, TSelector>} EyesWrappedElement
 */

/**
 * @typedef {EyesSelector} TargetPersistedRegion
 */

/**
 * @internal
 * @template TElement
 * @template TSelector
 */
class TargetRegionByElement extends GetRegion {
  /**
   * @param {EyesWrappedElement<TElement, TSelector>} element
   */
  constructor(element) {
    super()
    this._element = element
  }
}

module.exports = TargetRegionByElement
