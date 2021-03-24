import * as utils from '@applitools/utils'

export type ImageRotation = -270 | -180 | -90 | 0 | 90 | 180 | 270

export class ImageRotationData {
  private _rotation: ImageRotation

  constructor(rotation: ImageRotation) {
    utils.guard.isOneOf(rotation, [-270, -180, -90, 0, 90, 180, 270], {name: 'rotation'})
    this._rotation = rotation
  }

  get rotation(): ImageRotation {
    return this._rotation
  }
  set rotation(rotation: ImageRotation) {
    this._rotation = rotation
  }
  getRotation(): ImageRotation {
    return this._rotation
  }
  setRotation(rotation: ImageRotation) {
    this.rotation = rotation
  }

  /** @internal */
  [Symbol.toPrimitive]() {
    return this._rotation
  }
}
