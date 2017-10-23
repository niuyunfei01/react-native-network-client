import {NativeModules} from 'react-native'

export default {

  updateAfterTokenGot: async function (access_token, expire, callback = function(){}) {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.updateAfterTokenGot(access_token, expire, callback)
    }
  },

  toOrders: async function () {
    if (NativeModules.ActivityStarter) {
      await NativeModules.ActivityStarter.navigateToOrders();
    }
  },

  toGoods: async function () {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.navigateToGoods());
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

  logout: async function () {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.logout());
  },

  printBtPrinter: async function (order, callback = function (){}) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.printBtPrinter(JSON.stringify(order), callback));
  },

  ordersByMobileTimes: async function(phone, times) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.ordersByMobileTimes(''+phone, parseInt(times)))
  },

  dialNumber: async function(phone) {
    await (NativeModules.ActivityStarter &&
      NativeModules.ActivityStarter.dialNumber(phone))
  },

  reportException: async function (msg, stack, currentExceptionID, isFatal) {
    console.log("error:", msg)
    console.log("stack:", stack)
    console.log("exceptionId:", currentExceptionID)
    console.log("isFatal:", isFatal)
  }
}