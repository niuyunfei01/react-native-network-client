import JPush from 'jpush-react-native';
import dayjs from "dayjs";
import DeviceInfo from "react-native-device-info";
import HttpUtils from "../../util/http";
import {Platform} from "react-native";

export const initJPush = async () => {

  await JPush.setLoggerEnable(__DEV__)
  await JPush.init(Platform.select({
    ios: {appKey: '30073ab80a50534d39c84d3c', channel: 'app_store', production: true},
    android: {appKey: '30073ab80a50534d39c84d3c', channel: 'developer-default', production: true}
  }))
 }

export const reLogin = async () => {
  await JPush.isPushStopped(async (isStopped) => {
    if (isStopped) {
      await JPush.resumePush();
    }
  })
}

export const checkPushStatus = async (callback = () => {
}) => {
  switch (Platform.OS) {
    case "ios":
      callback()
      break
    case "android":
      await JPush.isPushStopped(async (isStopped) => {
        if (isStopped) {
          await JPush.resumePush();
        }
        callback()
      })
      break
  }
}

export const doJPushSetAlias = async (currentUser) => {
    if (currentUser) {
    global.pushType = 'set'
    const sequence = dayjs().valueOf()
    const params = {alias: `uid_${currentUser}`, sequence: sequence}
    await JPush.setAlias(params)

  }
}

export const doJPushStop = async () => {
  await JPush.stopPush()
}

export const doJPushDeleteAlias = async () => {
  global.pushType = 'delete'
  const sequence = dayjs().valueOf()
  await JPush.deleteAlias({sequence: sequence})
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
 * @param global
 * @param data
 */

export const sendDeviceStatus = (global, data) => {
  const {accessToken, notification_status, volume, is_background_run} = global
  const url = `/api/log_push_status/?access_token=${accessToken}`

  const params = {
    ...data,
    notificationEnabled: notification_status === 1,
    brand: DeviceInfo.getBrand(),
    UniqueID: DeviceInfo.getUniqueId(),
    Appversion: DeviceInfo.getBuildNumber(),
    disable_new_order_sound_notify: '未知',
    disable_sound_notify: '未知',
    Volume: volume > 0,
    isRun: is_background_run,
    btConnected: data.btConnected,
    auto_print: data.auto_print
  }
  //系统通知
  HttpUtils.post(url, params).then()

}
