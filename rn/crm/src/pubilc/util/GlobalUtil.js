/**
 * 操作全局 global 的方法集合在这里，其他地方只能读取，不能修改
 */
import DeviceInfo from "react-native-device-info";

global.hostPort = '';
global.isorderFresh = 1;
global.isGoodsFresh = 1;

export default class GlobalUtil {
  /**
   *
   * 判断订单列表是否强制刷新 1为是 2为非
   * 在设置 和切换门店使用
   */
  static setOrderFresh(isfresh) {
    global.isorderFresh = isfresh;
  }


  static getOrderFresh() {
    return global.isorderFresh;
  }


  static getGoodsFresh() {
    return global.isGoodsFresh;
  }

  static setGoodsFresh(isGoodsFresh) {
    global.isGoodsFresh = isGoodsFresh;
  }


  /**
   *
   * @param hostPort  Host[:Port] without tail '/' and head '//'
   */
  static setHostPort(hostPort) {
    if (!hostPort) {
      return;
    }
    global.hostPort = hostPort;
  }

  static getHostPort() {
    return 'fire11.waisongbang.com';
    return global.hostPort;
  }


  static byteConvert = (num) => {
    if (num < 0)
      return 'unknown'
    num /= 1024
    if (num > 1) {
      num /= 1024
      if (num > 1) {
        num /= 1024
        return `${parseFloat(num).toFixed(2)}GB`
      }
      return `${parseFloat(num).toFixed(2)}MB`
    }
    return `${parseFloat(num).toFixed(2)}KB`
  }

  static getDeviceInfo = async () => {
    const fontScale = await DeviceInfo.getFontScale();
    const freeDiskStorage = await DeviceInfo.getFreeDiskStorage()
    const totalMemory = await DeviceInfo.getTotalMemory();
    const maxMemory = await DeviceInfo.getMaxMemory()
    const apiLevel = await DeviceInfo.getApiLevel();
    const brand = DeviceInfo.getBrand();
    const device = await DeviceInfo.getDevice();
    const deviceName = await DeviceInfo.getDeviceName();
    const systemName = DeviceInfo.getSystemName();
    const systemVersion = DeviceInfo.getSystemVersion();
    const version = DeviceInfo.getVersion();
    return {
      fontScale: fontScale,
      freeDiskStorage: this.byteConvert(freeDiskStorage),
      totalMemory: this.byteConvert(totalMemory),
      useMaxMemory: this.byteConvert(maxMemory),
      apiLevel: apiLevel,
      brand: brand,
      device: device,
      deviceName: deviceName,
      systemName: systemName,
      systemVersion: systemVersion,
      appVersion: version
    }
  }

}

