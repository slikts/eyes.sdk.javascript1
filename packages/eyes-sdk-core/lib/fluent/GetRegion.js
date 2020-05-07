'use strict'

const {GetSelector} = require('./GetSelector')

/* eslint-disable no-unused-vars */

/**
 * @ignore
 * @abstract
 */
class GetRegion extends GetSelector {
  constructor() {
    super(undefined)
  }

  /**
   * @param {EyesWrappedDriver} driver
   * @param {EyesScreenshot} screenshot
   * @return {Promise<Region[]>}
   */
  async getRegion(eyesBase, screenshot) {
    throw new TypeError('The method is not implemented!')
  }
}

exports.GetRegion = GetRegion
