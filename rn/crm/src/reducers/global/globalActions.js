/**
 * # globalActions.js
 *
 * Actions that are global in nature
 */
'use strict'

import {NativeModules} from 'react-native'
import Config from '../../config'
import {serviceSignIn, smsCodeRequest} from '../../services/account'

/**
 * ## Imports
 *
 * The actions supported
 */
const {
    SET_STORE,
    SET_STATE,
    GET_STATE,
    LOGIN_PROFILE_SUCCESS,
    SESSION_TOKEN_SUCCESS
} = require('../../common/constants').default

export function setAccessToken(token) {
    return {
        type: SESSION_TOKEN_SUCCESS,
        payload: token
    }
}

/**
 * ## set the store
 *
 * this is the Redux store
 *
 * this is here to support Hot Loading
 *
 */
export function setStore(store) {
    return {
        type: SET_STORE,
        payload: store
    }
}

/**
 * ## set state
 *
 */
export function setState(newState) {
    return {
        type: SET_STATE,
        payload: newState
    }
}

/**
 * ## getState
 *
 */
export function getState(toggle) {
    return {
        type: GET_STATE,
        payload: toggle
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
                    NativeModules.ActivityStarter.updateAfterTokenGot(access_token, expire, (ok, msg, user) => {
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

