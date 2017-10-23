/**
 * # globalActions.js
 *
 * Actions that are global in nature
 */

'use strict'

import Config from '../../config'
import {serviceSignIn, smsCodeRequest, customerApplyRequest} from '../../services/account'
import {native} from "../../common";
import {getWithTpl, postWithTpl} from '../../util/common'

import DeviceInfo from 'react-native-device-info';

/**
 * ## Imports
 *
 * The actions supported
 */
const {
  LOGIN_PROFILE_SUCCESS,
  SESSION_TOKEN_SUCCESS,
  LOGOUT_SUCCESS,
  SET_CURR_STORE,
  UPDATE_CFG
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

export function setUserProfile(profile) {
  return {
    type: LOGIN_PROFILE_SUCCESS,
    payload: profile
  }
}

export function setCurrentStore(currStoreId) {
  return {
    type: SET_CURR_STORE,
    payload: currStoreId
  }
}

export function updateCfg(cfg) {
  return {
    type: UPDATE_CFG,
    payload: cfg
  }
}

export function logout() {
  return dispatch => {
    dispatch({type: LOGOUT_SUCCESS});
    native.logout()
  }
}

export function getCommonConfig(token, formData = [], callback) {
  return dispatch => {
    const url = `api/common_config2?access_token=${token}`
    return postWithTpl(url, formData, (json) => {
      if (json.ok) {
        dispatch({type: UPDATE_CFG, payload: {config: json.obj}})
        callback(true)
      } else {
        console.log('获取服务器端参数失败：', json)
        callback(false)
      }
    }, (error) => {
      console.log('获取服务器端配置错误：', error)
      callback(false)
    })
  }
}


export function signIn(mobile, password, callback) {
  return dispatch => {
    return serviceSignIn(getDeviceUUID(), mobile, password)
      .then(response => response.json())
      .then(json => {

        console.log('login response:', json)

        const {access_token, refresh_token, expires_in: expires_in_ts} = json;

        if (access_token) {
          dispatch({type: SESSION_TOKEN_SUCCESS, payload: {access_token, refresh_token, expires_in_ts}})
          const expire = expires_in_ts || Config.ACCESS_TOKEN_EXPIRE_DEF_SECONDS;
          native.updateAfterTokenGot(access_token, expire, (ok, msg, profile) => {
            if (ok) {
              dispatch({type: LOGIN_PROFILE_SUCCESS, payload: profile})
            } else {
              console.log('updateAfterTokenGot error:', msg)
            }
          });

          callback(true, 'ok', access_token)
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

