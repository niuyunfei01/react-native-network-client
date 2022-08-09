import {Linking, NativeModules, Platform} from 'react-native'

const {ActivityStarter} = NativeModules
let _orderSearch = async function (term) {
  if (ActivityStarter) {
    await ActivityStarter.searchOrders(term);
  }
};
export default {

  updateAfterTokenGot: async function (access_token, expire, callback = function () {
  }) {
    if (ActivityStarter) {
      await ActivityStarter.updateAfterTokenGot(access_token, expire, callback)
    }
  },

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

  currentVersion: async function (callback) {
    if (ActivityStarter) {
      await ActivityStarter.currentVersion(callback);
    }
  },

  ordersSeriousDelay: async function () {
    await _orderSearch('to_ship_late_serious:');
  },

  ordersInvalid: async function () {
    await _orderSearch('invalid:');
  },

  ordersSearch: async function (term) {
    await _orderSearch(term);
  },

  toGoods: async function (global = null, dispatch = null, navigation = null) {
    const _navigation = navigation || (this.props || {}).navigation
    _navigation.navigate("goods", {})
  },

  toNativeOrder: async function (id) {
    await (ActivityStarter &&
      ActivityStarter.toOrder(id));
  },

  gotoPage: async function (page) {
    if (ActivityStarter && page) {
      await ActivityStarter.gotoPage(page);
    }
  },

  gotoNativeActivity: async function (activityName, putStack, json = '{}') {
    if (ActivityStarter && activityName) {
      await ActivityStarter.navigateToNativeActivity(activityName, putStack, json);
    }
  },

  gotoRNActivity: async function (action, json = '{}') {
    if (ActivityStarter && action) {
      await ActivityStarter.navigateToRnView(action, json);
    }
  },

  nativeBack: async function () {
    if (ActivityStarter) {
      await ActivityStarter.nativeBack();
    }
  },

  host:
    /**
     * @param callback （host) => {}
     * @returns {Promise.<void>}
     */
    async function (callback) {
      if (ActivityStarter) {
        await ActivityStarter.getHost(callback);
      }
    },

  toUserComments: async function () {
    if (ActivityStarter) {
      await ActivityStarter.toUserComments();
    }
  },

  /**
   *
   * @param storeId
   * @param callback (ok, msg) => {}
   * @returns {Promise.<void>}
   */
  setCurrStoreId: async function (storeId, callback = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.setCurrStoreId(storeId, callback));
  },

  gotoLoginWithNoHistory: async function (mobile = '') {
    await (ActivityStarter &&
      ActivityStarter.gotoLoginWithNoHistory(mobile));
  },

  gotoActByUrl: async function (url) {
    await (ActivityStarter &&
      ActivityStarter.gotoActByUrl(url));
  },

  logout: async function () {
    await (ActivityStarter &&
      ActivityStarter.logout());
  },

  printBtPrinter: async function (order, callback = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.printBtPrinter(JSON.stringify(order), callback));
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

  ordersByMobileTimes: async function (phone, times) {
    await (ActivityStarter &&
      ActivityStarter.ordersByMobileTimes('' + phone, parseInt(times)))
  },

  dialNumber: async function (number) {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }
    Linking.openURL(phoneNumber).then(r => {
    });
  },

  clearScan: async function (code, callback = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.clearScan(code, callback))
  },

  updatePidApplyPrice: async function (pid, applyPrice, cb = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.updatePidApplyPrice(pid, applyPrice, cb))
  },

  updatePidStorage: async function (pid, storage, clb = function () {
  }) {
    await (ActivityStarter &&
      ActivityStarter.updatePidStorage(pid, storage, clb))
  },

  listenScan: async function (callback = function (scan_items) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.listenScan(callback))
  },

  speakText: async function (text, callback = function (ok, msg) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.speakText(text, callback))
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

  setAutoBluePrint: async function (auto, callback = function (ok, msg) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.setAutoBluePrint(auto, callback))
  },

  getAutoBluePrint: async function (callback = function (auto, msg) {
  }) {
    await (ActivityStarter &&
      ActivityStarter.getAutoBluePrint(callback))
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

  reportException: async function (msg) {
    await (ActivityStarter &&
      ActivityStarter.reportException(msg))
  }
}
