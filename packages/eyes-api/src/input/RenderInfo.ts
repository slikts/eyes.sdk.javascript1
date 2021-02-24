import BrowserName from '../enums/BrowserName'
import DeviceName from '../enums/DeviceName'
import IOSDeviceName from '../enums/IOSDeviceName'
import IOSVersion from '../enums/IOSVersion'
import ScreenOrientation from '../enums/ScreenOrientation'

type DesktopBrowserInfo = {
  name?: BrowserName
  width: number
  height: number
}

type ChromeEmulationInfo = {
  deviceName: DeviceName
  screenOrientation?: ScreenOrientation
}

type IOSSimulationInfo = {
  deviceName: IOSDeviceName
  iosVersion?: IOSVersion
  screenOrientation?: ScreenOrientation
}

export type RenderInfo =
  | DesktopBrowserInfo
  | ChromeEmulationInfo
  | {chromeEmulationInfo: ChromeEmulationInfo}
  | {iosDeviceInfo: IOSSimulationInfo}
