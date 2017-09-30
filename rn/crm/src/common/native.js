import {NativeModules} from 'react-native'

export function updateAfterTokenGot (access_token, expire, callback) {
    if (NativeModules.ActivityStarter) {
        callback = callback || (() => {})
        NativeModules.ActivityStarter.updateAfterTokenGot(access_token, expire, callback)
    }
}

export function toOrders() {
    if (NativeModules.ActivityStarter) {
        NativeModules.ActivityStarter.navigateToOrders();
    }
}

export function toGoods() {
    NativeModules.ActivityStarter &&
        NativeModules.ActivityStarter.navigateToGoods();
}