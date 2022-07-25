/**
 * 操作全局 global 的方法集合在这里，其他地方只能读取，不能修改
 */
import StorageUtil from "./StorageUtil";
import native from "./native";
import {Alert} from 'react-native'
import DeviceInfo from "react-native-device-info";

global.hostPort = '';

// 'cover_image', 'remark', 'sex', 'mobilephone', 'id', 'screen_name', 'name', 'province', 'city'
// 'location', 'description', 'total_trade_num', 'prefer_store'
global.user = null
global.isorderFresh = 1;
global.isGoodsFresh = 1;
global.recommend = true;

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


  static getRecommend() {
    return global.recommend;
  }

  static setRecommend(recommend) {
    global.recommend = recommend;
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
    return global.hostPort;
  }

  /**
   * 启动时调用此方法更新全局host设置
   *
   * TODO: 以后需要将是否使用与发布的设置放在 RN 里，则可直接修改全局 global。
   * @param global global reducer
   * @param native
   * @param callback execute when done getting from native
   */
  static async setHostPortNoDef(global, native, callback) {
    if (global.host) {
      this.setHostPort(global.host);
    }
    /** 暂时先不使用native的host，避免错误
     native.host((host) => {
      if (host) {
        this.setHostPort(host);
        callback();
      }
    });
     */
  }

  static async getUser() {
    return new Promise((resolve, reject) => {
      if (global.user && Object.keys(global.user).length) {
        resolve && resolve(global.user)
      } else {
        StorageUtil._get('user').then(user => {
          if (user && Object.keys(user).length) {
            // this.setUser(user)
            resolve && resolve(user)
          } else {
            if (reject) {
              reject()
            } else {
              Alert('错误', '获取用户信息失败，请重新登录', [{
                text: '确定',
                onPress: () => {
                  native.logout()
                  native.gotoLoginWithNoHistory()
                }
              }])
            }
          }
        }).catch(e => {
          if (reject) {
            reject()
          } else {
            Alert('错误', '获取用户信息失败，请重新登录', [{
              text: '确定',
              onPress: () => {
                native.logout()
                native.gotoLoginWithNoHistory()
              }
            }])
          }
        })
      }
    })
  }

  static async setUser(user) {
    global.user = user
    StorageUtil._set('user', user)
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

