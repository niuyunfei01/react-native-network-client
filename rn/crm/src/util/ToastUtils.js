'use strict';

import {WToast} from 'react-native-smart-tip'
//
// const {
//     ToastAndroid
// } = ReactNative;

export function ToastShort(content) {

  WToast.show({data: content, duration: 1000})
  // ToastAndroid.show(content, ToastAndroid.SHORT);
}

export function ToastLong(content) {
  WToast.show({data: content, duration: 2000})
  // ToastAndroid.show(content, ToastAndroid.LONG);
}
