import JPush from 'jpush-react-native';
import dayjs from "dayjs";
import native from "../../util/native";
import DeviceInfo from "react-native-device-info";
import HttpUtils from "../../util/http";

export const initJPush = () => {
  JPush.setLoggerEnable(__DEV__)
  JPush.init()
//连接状态
  this.connectListener = result => {
    console.log("connectListener:" + JSON.stringify(result))
  };
  JPush.addConnectEventListener(this.connectListener);
  //通知回调
  this.notificationListener = result => {
    console.log("notificationListener:" + JSON.stringify(result))
  };
  JPush.addNotificationListener(this.notificationListener);
  //本地通知回调
  this.localNotificationListener = result => {
    console.log("localNotificationListener:" + JSON.stringify(result))
  };
  JPush.addLocalNotificationListener(this.localNotificationListener);

  //tag alias事件回调
  this.tagAliasListener = result => {
    console.log("tagAliasListener:" + JSON.stringify(result))
  };
  JPush.addTagAliasListener(this.tagAliasListener);
  //手机号码事件回调
  this.mobileNumberListener = result => {
    console.log("mobileNumberListener:" + JSON.stringify(result))
  };
  JPush.addMobileNumberListener(this.mobileNumberListener);

  JPush.addConnectEventListener((connectEnable) => {
    console.log("connectEnable:" + connectEnable)
  })

  JPush.getRegistrationID(result =>
    console.log("registerID:" + JSON.stringify(result))
  )
}

export const doJPushSetAlias = (currentUser) => {
  if (currentUser) {
    const alias = `uid_${currentUser}`;
    JPush.setAlias({alias: alias, sequence: dayjs().unix()})
    JPush.isPushStopped((isStopped) => {

      if (isStopped) {
        JPush.resumePush();
      }
    })

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
 */

export const sendDeviceStatus = (props, data) => {

  //系统通知
  JPush.isNotificationEnabled((enabled) => {
    native.getSettings((ok, settings, msg) => {
      //品牌 设备id
      data.notificationEnabled = enabled
      data.brand = DeviceInfo.getBrand();
      data.UniqueID = DeviceInfo.getUniqueId()
      data.Appversion = DeviceInfo.getBuildNumber()
      data.disable_new_order_sound_notify = settings.disableNewOrderSoundNotify;
      data.disable_sound_notify = settings.disabledSoundNotify;
      data.auto_print = settings.autoPrint;
      data.Volume = settings.currentSoundVolume > 0
      data.isRun = settings.isRunInBg;
      data.isRinger = settings.isRinger;
      const {accessToken} = props.global
      console.log('data', data)
      HttpUtils.post.bind(props)(`/api/log_push_status/?access_token=${accessToken}`, data).then(res => {
        console.log('res', res)
      })
    }).then()
  })

}
