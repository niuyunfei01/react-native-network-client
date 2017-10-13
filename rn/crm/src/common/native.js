import {NativeModules} from 'react-native'

export async function updateAfterTokenGot(access_token, expire, callback) {
  if (NativeModules.ActivityStarter) {
    callback = callback || (() => {
    })
    await NativeModules.ActivityStarter.updateAfterTokenGot(access_token, expire, callback)
  }
}

export async function toOrders() {
  if (NativeModules.ActivityStarter) {
    await NativeModules.ActivityStarter.navigateToOrders();
  }
}

export async function toGoods() {
  await (NativeModules.ActivityStarter &&
    NativeModules.ActivityStarter.navigateToGoods());
}

/**
 *
 * @param storeId
 * @param callback (ok, msg) => {}
 * @returns {Promise.<void>}
 */
export async function setCurrStoreId(storeId, callback = function(){}) {
  await (NativeModules.ActivityStarter &&
    NativeModules.ActivityStarter.setCurrStoreId(storeId, callback));
}

export async function logout() {
  await (NativeModules.ActivityStarter &&
    NativeModules.ActivityStarter.logout());
}

export async function reportException(msg, stack, currentExceptionID, isFatal) {
  console.log("error:", msg)
  console.log("stack:", stack)
  console.log("exceptionId:", currentExceptionID)
  console.log("isFatal:", isFatal)
}