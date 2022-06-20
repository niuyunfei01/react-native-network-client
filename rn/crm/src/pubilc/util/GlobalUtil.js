/**
 * 操作全局 global 的方法集合在这里，其他地方只能读取，不能修改
 */
import StorageUtil from "./StorageUtil";
import native from "./native";
import {Alert} from 'react-native'
import HttpUtils from "./http";
import DeviceInfo from "react-native-device-info";
import JPush from "jpush-react-native";

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
    const _this = this
    return new Promise((resolve, reject) => {
      if (global.user && Object.keys(global.user).length) {
        resolve && resolve(global.user)
      } else {
        StorageUtil._get('user').then(user => {
          if (user && Object.keys(user).length) {
            _this.setUser(user)
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

  static byteConvert=(num)=>{
    if(num<0)
      return 'unknown'
    num/=1024
    if(num>1){
      num/=1024
      if(num>1) {
        num/=1024
        return `${parseFloat(num).toFixed(2)}GB`
      }
      return `${parseFloat(num).toFixed(2)}MB`
    }
    return `${parseFloat(num).toFixed(2)}KB`
  }
  static getDeviceInfo =  () => {
    const fontScale = DeviceInfo.getFontScaleSync();
    const freeDiskStorage = DeviceInfo.getFreeDiskStorageSync()
    const totalMemory = DeviceInfo.getTotalMemorySync();
    const maxMemory = DeviceInfo.getMaxMemorySync()
    const apiLevel =  DeviceInfo.getApiLevelSync();
    const brand = DeviceInfo.getBrand();
    const device =  DeviceInfo.getDeviceSync();
    const deviceName =  DeviceInfo.getDeviceNameSync();
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
  /**
   Map<String, Object> deviceStatus = Maps.newHashMap();
   deviceStatus.put("acceptNotifyNew", acceptNotifyNew); //是否接受新订单通知
   deviceStatus.put("disable_new_order_sound_notify", allConfig.get("disable_new_order_sound_notify")); //新订单声音通知

   deviceStatus.put("orderId", orderId); //订单ID
   deviceStatus.put("msgId", msgId); //推送消息ID

   deviceStatus.put("listener_stores", allConfig.get("listener_stores")); //当前所在门店
   deviceStatus.put("auto_print", SettingUtility.getAutoPrintSetting()); //是否开启蓝牙自动打印
   deviceStatus.put("disable_sound_notify", allConfig.get("disable_sound_notify"));  //开启语音播报
   // 以下为新增
   // 设备ID：显示设备ID
   // 设备品牌：显示具体的手机型号信息
   // 系统通知权限是否开启：开启/未开启
   // 设备音量大小：静音/正常
   // 后台运行是否开启：开启/未开启
   // 省电模式：开启/未开启
   // [已重复] 语音播报是否开启：开启/未开启 (disable_sound_notify)
   // [已重复] 新订单通知：开启/未开启
   * @param props
   * @param data
   * @returns {Promise<void>}
   */

  static async sendDeviceStatus(props, data) {
    //品牌 设备id
    let brand = DeviceInfo.getBrand();
    let UniqueID = DeviceInfo.getUniqueId();
    let Appversion = DeviceInfo.getBuildNumber();
    data.brand = brand
    data.UniqueID = UniqueID
    data.Appversion = Appversion
    //系统通知
    JPush.isNotificationEnabled((enabled) => {
      data.notificationEnabled = enabled
      native.getSettings((ok, settings, msg) => {
        data.disable_new_order_sound_notify = settings.disableNewOrderSoundNotify;
        data.disable_sound_notify = settings.disabledSoundNotify;
        data.auto_print = settings.autoPrint;
        let mute = settings.currentSoundVolume > 0 ? true : false;
        data.Volume = mute
        data.isRun = settings.isRunInBg;
        data.isRinger = settings.isRinger;
        const {accessToken} = props.global
        HttpUtils.post.bind(props)(`/api/log_push_status/?access_token=${accessToken}`, data).then(res => {
        }, (res) => {

        })
      })
    })

  }
}

