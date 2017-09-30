/**
 * # globalActions.js
 *
 * Actions that are global in nature
 */
'use strict'

import Config from '../../config'
import {serviceSignIn, smsCodeRequest} from '../../services/account'
import * as native from "../../common/native";

/**
 * ## Imports
 *
 * The actions supported
 */
const {
    LOGIN_PROFILE_SUCCESS,
    SESSION_TOKEN_SUCCESS
} = require('../../common/constants').default

export function setAccessToken(token) {
    return {
        type: SESSION_TOKEN_SUCCESS,
        payload: token
    }
}

export function signIn(mobile, password, callback) {
    return dispatch => {
        return serviceSignIn(1000001, mobile, password)
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

export function requestSmsCode(mobile, callback) {
    return dispatch => {
        return smsCodeRequest(1000001, mobile)
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

