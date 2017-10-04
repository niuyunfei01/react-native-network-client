/**
 * # globalActions.js
 *
 * Actions that are global in nature
 */
'use strict'

import Config from '../../config'
import {serviceSignIn, smsCodeRequest, customerApplyRequest} from '../../services/account'
import * as native from "../../common/native";

import DeviceInfo from 'react-native-device-info';

/**
 * ## Imports
 *
 * The actions supported
 */
const {
    LOGIN_PROFILE_SUCCESS,
    SESSION_TOKEN_SUCCESS,
    LOGOUT_SUCCESS
} = require('../../common/constants').default

function getDeviceUUID() {
    DeviceInfo.isPinOrFingerprintSet()(isPinOrFingerprintSet => {
        if (!isPinOrFingerprintSet) {

        }
    })
    return DeviceInfo.getUniqueID();
}

export function setAccessToken(oauthToken) {
    return {
        type: SESSION_TOKEN_SUCCESS,
        payload: oauthToken
    }
}

export function logout() {
    return dispatch => {
        dispatch({type: LOGOUT_SUCCESS})
        native.logout()
    }
}

export function signIn(mobile, password, callback) {
    return dispatch => {
        return serviceSignIn(getDeviceUUID(), mobile, password)
            .then(response => response.json())
            .then(json => {
                const {access_token, refresh_token, expires_in_ts} = json;

                if (access_token) {
                    dispatch({type: SESSION_TOKEN_SUCCESS, payload: {access_token, refresh_token, expires_in_ts}})
                    const expire = expires_in_ts || Config.ACCESS_TOKEN_EXPIRE_DEF_SECONDS;
                    native.updateAfterTokenGot(access_token, expire, (ok, msg, user) => {
                        if (ok) {
                            dispatch({type: LOGIN_PROFILE_SUCCESS, payload: user})
                        } else {
                            console.log('updateAfterTokenGot error:', msg)
                        }
                    });

                    callback(true)
                } else {
                    //fixme: 需要给出明确提示
                    callback(false, "登录失败，请检查验证码是否正确")
                }
            }).catch((error) => {
                console.log('request error', error);
                callback(false, '网络错误，请检查您的网络连接')
            })
    }
}

export function requestSmsCode(mobile, type, callback) {
    return dispatch => {
        return smsCodeRequest(getDeviceUUID(), mobile, type)
            .then(response => response.json())
            .then(json => {
                console.log("requestSmsCode res", json)
                callback(json.success, json.reason)
            }).catch((error) => {
                console.log('request error', error);
                callback(false, '网络错误，请检查您的网络连接')
            })
    }
}

export function customerApply(applyData, callback) {
    return dispatch => {
        return customerApplyRequest(applyData)
            .then(response => response.json())
            .then(json => {
                console.log("customerApply res", json)
                callback(true)
            })
            .catch((error) => {
                callback(false, '网络错误，请检查您的网络连接')
            })
    }
}

