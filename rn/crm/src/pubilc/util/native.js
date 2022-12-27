import {Linking, NativeModules, Platform} from 'react-native'
import JPush from "jpush-react-native";

const {ActivityStarter} = NativeModules


export default {


  //打开通知设置
  toOpenNotifySettings: async function (callback = function () {
  }) {
    if (ActivityStarter) {
      await ActivityStarter.toOpenNotifySettings(callback)
    }
  },

  //设置后台运行
  toRunInBg: async function (callback = function () {
  }) {
    if (ActivityStarter) {
      await ActivityStarter.toRunInBg(callback)
    }
  },

  /**
   *  volume: int 音量
   */
  setSoundVolume: async function (volume, callback = function (ok, msg) {
  }) {
    if (ActivityStarter) {
      await ActivityStarter.setSoundVolume(volume, callback)
    }
  },

  /**
   *  currentVolume: int 音量; -1 未知
   *  isRinger: -1 未知, 1 响铃, 0, 静音
   *  maxVolume: 取不到为 -1
   *  minVolume: Android 28以后才有，取不到则返回 -1
   */
  getSoundVolume: async function (callback = function (ok, currentVolume, isRinger, maxVolume, minVolume, msg) {
  }) {
    if (ActivityStarter) {
      await ActivityStarter.getSoundVolume(callback)
    }
  },

  /**
   * @param callback (0 未知； 1 开启； -1 未开启) 是否后台运行
   * @returns {Promise<void>}
   */
  isRunInBg: async function (callback = function () {
  }) {
    if (ActivityStarter) {
      await ActivityStarter.isRunInBg(callback)
    }
  },


  /**
   * @param callback (0 未知； 1 开启； -1 未开启) 是否后台运行
   * @returns {Promise<void>}
   */
  xunfeiIdentily: async function (callback = function () {
  }) {
    if (ActivityStarter) {
      await ActivityStarter.xunfeiIdentily(callback)
    }
  },
  getStartAppTime: async function (callback = function () {
  }) {
    if (ActivityStarter)
      await ActivityStarter.getStartAppTime(callback)
  },

  toGoods: async function (global = null, dispatch = null, navigation = null) {
    const _navigation = navigation || (this.props || {}).navigation
    _navigation.navigate("goods", {})
  },

  /**
   *
   * @param storeId
   * @param callback (ok, msg) => {}
   * @returns {Promise.<void>}
   */
  setCurrStoreId: async function (storeId, callback = function () {
  }) {
    if (ActivityStarter)
      await
        ActivityStarter.setCurrStoreId(storeId, callback);
  },

  gotoLoginWithNoHistory: async function (mobile = '') {
    if (ActivityStarter)
      await
        ActivityStarter.gotoLoginWithNoHistory(mobile);
  },

  gotoActByUrl: async function (url) {
    if (ActivityStarter)
      await
        ActivityStarter.gotoActByUrl(url);
  },

  logout: async function () {
    if (ActivityStarter)
      await
        ActivityStarter.logout();
  },


  printSmPrinter: async function (order, callback = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.printSmPrinter(JSON.stringify(order), callback));
  },

  printInventoryOrder: async function (supplierOrder, callback = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.printInventoryOrder(JSON.stringify(supplierOrder), callback));
  },

  printSupplierSummaryOrder: async function (callback = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.printSupplierSummaryOrder(callback));
  },


  dialNumber: async function (number) {
    let phoneNumber;
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }
    Linking.openURL(phoneNumber).then();
  },


  updatePidApplyPrice: async function (pid, applyPrice, cb = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.updatePidApplyPrice(pid, applyPrice, cb))
  },

  setDisableSoundNotify: async function (disabled, callback = function (ok, msg) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.setDisableSoundNotify(disabled, callback))
  },

  getDisableSoundNotify: async function (callback = function (disabled, msg) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.getDisableSoundNotify(callback))
  },

  setDisabledNewOrderNotify: async function (disabled, callback = function (ok, msg) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.setDisabledNewOrderNotify(disabled, callback))
  },

  getNewOrderNotifyDisabled: async function (callback = function (disabled, msg) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.getNewOrderNotifyDisabled(callback))
  },

  /**
   acceptNotifyNew
   host
   disabledSoundNotify
   disableNewOrderSoundNotify
   autoPrint
   currentSoundVolume
   isRinger //1 响铃 0 静音
   maxSoundVolume
   minSoundVolume // -1 未知
   isRunInBg // 0 未知, 1 后台运行； -1 不后台运行
   * @param callback
   * @returns {Promise<void>}
   */
  getSettings: async function (callback = function (ok, settings, msg) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.getSettings(callback))
  },

  playWarningSound: async function () {
    await (ActivityStarter &&
      ActivityStarter.playWarningSound())
  },

  showInputKeyboard: async function () {
    await (ActivityStarter &&
      ActivityStarter.showInputMethod())
  },

  reportRoute: async function (routeName) {
    await (ActivityStarter &&
      ActivityStarter.reportRoute(routeName))
  },
  checkCanRunInBg: async (callback = function (ok, msg) {
  }) => {
    await (ActivityStarter &&
      ActivityStarter.checkCanRunInBg(callback))
  },
  getNotificationStatus: async function () {

    switch (Platform.OS) {
      case "ios":
        return await ActivityStarter.getNotificationStatus()
      case "android":
        JPush.isNotificationEnabled((enabled) => {
          return enabled
        })
        break
    }

  },
  isSunmiDevice: async (callback = function () {
  }) => {
    if (ActivityStarter)
      await ActivityStarter.isSunmiDevice(callback)
  }
}
