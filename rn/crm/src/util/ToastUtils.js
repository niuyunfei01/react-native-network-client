'use strict';

import ReactNative from 'react-native';

const {
    ToastAndroid
} = ReactNative;

export function ToastShort(content) {
    ToastAndroid.show(new String(content), ToastAndroid.SHORT);
}

export function ToastLong(content) {
    ToastAndroid.show(new String(content), ToastAndroid.LONG);
}