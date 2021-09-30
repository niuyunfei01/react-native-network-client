import {Alert, InteractionManager, Linking, NativeModules, Platform} from 'react-native'
import Config from "../config";
import tool, {simpleStore} from "./tool";

let _orderSearch = async function (term) {
  if (NativeModules.ActivityStarter) {
    await NativeModules.ActivityStarter.searchOrders(term);
  }
};
export default {

  updateAfterTokenGot: async function (access_token, expire, callback = function(){}) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.updateAfterTokenGot(access_token, expire, callback)
    }
  },

  //打开通知设置
  toOpenNotifySettings: async function (callback = function(){}) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.toOpenNotifySettings(callback)
    }
  },

  //设置后台运行
  toRunInBg: async function (callback = function(){}) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.toRunInBg(callback)
    }
  },

  /**
   *  volume: int 音量
   */
  setSoundVolume: async function (volume, callback = function (ok, msg) {
  }) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.setSoundVolume(volume, callback)
    }
  },

  /**
   *  currentVolume: int 音量; -1 未知
   *  isRinger: -1 未知, 1 响铃, 0, 静音
   *  maxVolume: 取不到为 -1
   *  minVolume: Android 28以后才有，取不到则返回 -1
   */
  getSoundVolume: async function (callback = function (ok, currentVolume, isRinger, maxVolume, minVolume, msg) {}) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.getSoundVolume(callback)
    }
  },

  /**
   * @param callback (0 未知； 1 开启； -1 未开启) 是否后台运行
   * @returns {Promise<void>}
   */
  isRunInBg: async function (callback = function(){}) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.isRunInBg(callback)
    }
  },

  currentVersion: async function(callback) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.currentVersion(callback);
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
    _navigation.navigate(Config.ROUTE_STORE_GOODS_LIST, {})
  },

  toNativeOrder: async function (id) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.toOrder(id));
  },

  gotoPage: async function(page) {
    if (NativeModules.ActivityStarter && page) {
      await NativeModules.ActivityStarter.gotoPage(page);
    }
  },

  gotoNativeActivity: async function (activityName, putStack, json = '{}') {
    if (NativeModules.ActivityStarter && activityName) {
      await NativeModules.ActivityStarter.navigateToNativeActivity(activityName, putStack, json);
    }
  },

  gotoRNActivity: async function (action, json = '{}') {
    if (NativeModules.ActivityStarter && action) {
      await NativeModules.ActivityStarter.navigateToRnView(action, json);
    }
  },

  nativeBack: async function(){
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.nativeBack();
    }
  },

  host :
    /**
     * @param callback （host) => {}
     * @returns {Promise.<void>}
     */
    async function(callback) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.getHost(callback);
    }
  },

  toUserComments: async function() {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.toUserComments();
    }
  },

  /**
   *
   * @param storeId
   * @param callback (ok, msg) => {}
   * @returns {Promise.<void>}
   */
  setCurrStoreId: async function (storeId, callback = function (){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.setCurrStoreId(storeId, callback));
  },

  gotoLoginWithNoHistory: async function (mobile = '') {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.gotoLoginWithNoHistory(mobile));
  },

  gotoActByUrl: async function (url) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.gotoActByUrl(url));
  },

  logout: async function () {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.logout());
  },

  printBtPrinter: async function (order, callback = function (){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.printBtPrinter(JSON.stringify(order), callback));
  },

  printSmPrinter: async function (order, callback = function (){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.printSmPrinter(JSON.stringify(order), callback));
  },

  printInventoryOrder: async function (supplierOrder, callback = function () {}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.printInventoryOrder(JSON.stringify(supplierOrder), callback));
  },

  printSupplierSummaryOrder: async function (callback = function () {}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.printSupplierSummaryOrder(callback));
  },

  ordersByMobileTimes: async function(phone, times) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.ordersByMobileTimes(''+phone, parseInt(times)))
  },

  dialNumber: async function(number) {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }
    Linking.openURL(phoneNumber).then(r => {console.log(`call ${phoneNumber} done:`, r)});
  },

  clearScan: async function(code, callback = function (){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.clearScan(code, callback))
  },

  updatePidApplyPrice: async function (pid, applyPrice, cb = function () {
  }) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.updatePidApplyPrice(pid, applyPrice, cb))
  },

  updatePidStorage: async function(pid, storage, clb = function(){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.updatePidStorage(pid, storage, clb))
  },

  listenScan: async function(callback = function (scan_items){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.listenScan(callback))
  },

  speakText: async function(text, callback = function (ok, msg){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.speakText(text, callback))
  },

  setDisableSoundNotify: async function(disabled, callback = function (ok, msg){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.setDisableSoundNotify(disabled, callback))
  },

  getDisableSoundNotify: async function(callback = function (disabled, msg){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.getDisableSoundNotify(callback))
  },

  setDisabledNewOrderNotify: async function(disabled, callback = function (ok, msg){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.setDisabledNewOrderNotify(disabled, callback))
  },

  getNewOrderNotifyDisabled: async function(callback = function (disabled, msg){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.getNewOrderNotifyDisabled(callback))
  },

  setAutoBluePrint: async function(auto, callback = function (ok, msg){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.setAutoBluePrint(auto, callback))
  },

  getAutoBluePrint: async function(callback = function (auto, msg){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.getAutoBluePrint(callback))
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
  getSettings: async function(callback = function (ok, settings, msg){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.getSettings(callback))
  },

  playWarningSound: async function () {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.playWarningSound())
  },

  showInputKeyboard: async function () {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.showInputMethod())
  },

  reportRoute: async function (routeName) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.reportRoute(routeName))
  },

  reportException: async function (msg) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.reportException(msg))
  }
}
