import * as utils from '@applitools/utils'
import AccessibilityRegionType from '../enums/AccessibilityRegionType'
import {Region, RegionData} from './Region'

export type AccessibilityMatchSettings = {
  region: Region
  type?: AccessibilityRegionType
}

export class AccessibilityMatchSettingsData implements Required<AccessibilityMatchSettings> {
  private _region: RegionData
  private _type: AccessibilityRegionType

  constructor(accessibilityRegion: AccessibilityMatchSettings)
  constructor(x: number, y: number, width: number, height: number, type?: AccessibilityRegionType)
  constructor(
    accessibilityRegionOrX: AccessibilityMatchSettings | number,
    y?: number,
    width?: number,
    height?: number,
    type?: AccessibilityRegionType,
  ) {
    if (utils.types.isNumber(accessibilityRegionOrX)) {
      return new AccessibilityMatchSettingsData({region: {x: accessibilityRegionOrX, y, width, height}, type})
    }
    this.region = accessibilityRegionOrX.region
    this.type = accessibilityRegionOrX.type
  }

  get region(): Region {
    return this._region
  }
  set region(region: Region) {
    utils.guard.isObject(region, {name: 'region'})
    this._region = new RegionData(region)
  }
  getRegion(): RegionData {
    return this._region
  }
  setRegion(region: Region) {
    this.region = region
  }
  getLeft(): number {
    return this._region.getLeft()
  }
  setLeft(left: number) {
    this._region.setLeft(left)
  }
  getTop(): number {
    return this._region.getTop()
  }
  setTop(top: number) {
    this._region.setTop(top)
  }
  getWidth(): number {
    return this._region.getWidth()
  }
  setWidth(width: number) {
    this._region.setWidth(width)
  }
  getHeight(): number {
    return this._region.getHeight()
  }
  setHeight(height: number) {
    this._region.setHeight(height)
  }

  get type(): AccessibilityRegionType {
    return this._type
  }
  set type(type: AccessibilityRegionType) {
    utils.guard.isEnumValue(type, AccessibilityRegionType, {name: 'type', strict: false})
    this._type = type
  }
  getType(): AccessibilityRegionType {
    return this._type
  }
  setType(type: AccessibilityRegionType) {
    this.type = type
  }
}
