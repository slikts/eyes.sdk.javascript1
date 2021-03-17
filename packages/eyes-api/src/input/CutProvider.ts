import * as utils from '@applitools/utils'

type CutProviderRect = {
  top: number
  right: number
  bottom: number
  left: number
}

type CutProviderRegion = {
  width: number
  height: number
  x: number
  y: number
}

export type CutProvider = CutProviderRect | CutProviderRegion

export class CutProviderData implements Required<CutProviderRegion & CutProviderRect> {
  private _top: number
  private _right: number
  private _bottom: number
  private _left: number

  private _width: number
  private _height: number
  private _x: number
  private _y: number

  constructor(settings: CutProvider)
  constructor(top: number, bottom: number, left: number, right: number)
  constructor(settingsOrTop: CutProvider | number, bottom?: number, left?: number, right?: number) {
    if (utils.types.isNumber(settingsOrTop)) {
      return new CutProviderData({top: settingsOrTop, bottom, left, right})
    }

    const settings = settingsOrTop
    if (utils.types.has(settings, ['top', 'right', 'bottom', 'left'])) {
      this._top = settings.top
      this._right = settings.right
      this._bottom = settings.bottom
      this._left = settings.left
    } else if (utils.types.has(settings, ['width', 'height', 'x', 'y'])) {
      this._width = settings.width
      this._height = settings.height
      this._x = settings.x
      this._y = settings.y
    }
  }

  get top() {
    return this._top
  }
  get right() {
    return this._right
  }
  get bottom() {
    return this._bottom
  }
  get left() {
    return this._left
  }

  get width() {
    return this._width
  }
  get height() {
    return this._height
  }
  get x() {
    return this._x
  }
  get y() {
    return this._y
  }

  scale(scaleRatio: number): CutProviderData {
    if (!utils.types.isNull(this._top)) {
      return new CutProviderData({
        top: this._top * scaleRatio,
        right: this._right * scaleRatio,
        bottom: this._bottom * scaleRatio,
        left: this._left * scaleRatio,
      })
    } else if (!utils.types.isNull(this._width)) {
      return new CutProviderData({
        width: this._width * scaleRatio,
        height: this._height * scaleRatio,
        x: this._x * scaleRatio,
        y: this._y * scaleRatio,
      })
    } else {
      return new CutProviderData({top: 0, right: 0, bottom: 0, left: 0})
    }
  }

  /** @internal */
  toJSON(): CutProvider {
    if (!utils.types.isNull(this._width)) {
      return utils.general.toJSON(this, ['width', 'height', 'x', 'y'])
    } else {
      return utils.general.toJSON(this, ['top', 'right', 'bottom', 'left'])
    }
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}

export class FixedCutProviderData extends CutProviderData {}

/** @undocumented */
export class UnscaledFixedCutProviderData extends CutProviderData {
  scale() {
    return new UnscaledFixedCutProviderData(this)
  }
}

export class NullCropSettingsData extends CutProviderData {
  constructor() {
    super({top: 0, right: 0, bottom: 0, left: 0})
  }
}
