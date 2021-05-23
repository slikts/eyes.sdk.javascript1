import {BrowserType, BrowserTypeLiteral} from '../enums/BrowserType'
import {DeviceName, DeviceNameLiteral} from '../enums/DeviceName'
import {IosDeviceName, IosDeviceNameLiteral} from '../enums/IosDeviceName'
import {IosVersion, IosVersionLiteral} from '../enums/IosVersion'
import {ScreenOrientation, ScreenOrientationLiteral} from '../enums/ScreenOrientation'

export type DesktopBrowserInfo = {
  name?: BrowserType | BrowserTypeLiteral
  width: number
  height: number
}

export type ChromeEmulationInfo = {
  chromeEmulationInfo: {
    deviceName: DeviceName | DeviceNameLiteral
    screenOrientation?: ScreenOrientation | ScreenOrientationLiteral
  }
}

/** @deprecated */
export type ChromeEmulationInfoLegacy = {
  deviceName: DeviceName | DeviceNameLiteral
  screenOrientation?: ScreenOrientation | ScreenOrientationLiteral
}

export type IOSDeviceInfo = {
  iosDeviceInfo: {
    deviceName: IosDeviceName | IosDeviceNameLiteral
    iosVersion?: IosVersion | IosVersionLiteral
    screenOrientation?: ScreenOrientation | ScreenOrientationLiteral
  }
}
