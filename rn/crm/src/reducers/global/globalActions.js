/**
 * # globalActions.js
 *
 * Actions that are global in nature
 */


'use strict';

import Config from '../../config'
import {serviceSignIn, customerApplyRequest} from '../../services/account'
import {native} from "../../common";
import {getWithTpl, postWithTpl} from '../../util/common'

import DeviceInfo from 'react-native-device-info';
import tool from "../../common/tool";

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
  SET_CURR_PROFILE,
  UPDATE_CFG,
  UPDATE_CFG_ITEM
} = require('../../common/constants').default;

function getDeviceUUID() {
  DeviceInfo.isPinOrFingerprintSet()(isPinOrFingerprintSet => {
    if (!isPinOrFingerprintSet) {

    }
  });
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
    native.logout();
  }
}

export function getConfigItem(token, configKey, callback) {
  return dispatch => {
    const url = `api/config_item?access_token=${token}&key=${configKey}`;
    return getWithTpl(url, (json) => {
      console.log(json);
      if (json.ok) {
        dispatch({type: UPDATE_CFG_ITEM, key: configKey, value: json.obj});
      }
      callback(json.ok, json.reason, json.obj);
    }, (error) => {
      console.log('获取服务器端配置错误：', error);
      callback(false)
    });
  }
}

export function getCommonConfig(token, storeId, callback) {
  return dispatch => {
    const url = `api/common_config2?access_token=${token}&_sid=${storeId}`;
    return getWithTpl(url, (json) => {
      if (json.ok) {
        let resp_data = trans_data_to_java(json.obj);
        let {can_read_vendors, can_read_stores} = resp_data;
        let cfg = {
          canReadStores: can_read_stores,
          canReadVendors: can_read_vendors,
          config: json.obj,
        };
        dispatch(updateCfg(cfg));
        callback(true, '获取配置成功', cfg)
      } else {
        let msg = '获取服务器端参数失败, 请联系服务经理';
        console.log("msg：", json);
        callback(false, msg)
      }
    }, (error) => {
      let msg = "获取服务器端配置错误: " + error;
      console.log(msg);
      callback(false, msg)
    })
  }
}

export function trans_data_to_java(obj) {
  let {can_read_vendors} = obj;
  let vendor_list = {};
  for (let vendor of can_read_vendors){
    let vendor_id = vendor['id'];
    vendor_list[vendor_id] = vendor;
  }
  obj.can_read_vendors = vendor_list;

  tool.objectMap(obj.can_read_stores, function (stores) {
    let vendor_id = stores['type'];
    stores['vendor_id'] = vendor_id;
    let vendor_info = vendor_list[vendor_id];
    if(vendor_info !== undefined){
      stores['vendor'] = vendor_info['brand_name'];
    }
    return stores;
  });

  return obj;
}

/**
 *
 * @param token
 * @param storeId  current store id
 * @param callback  (ok, msg, profile) => {}
 */
export function upCurrentProfile(token, storeId, callback) {
  return dispatch => {
    const url = `api/user_info2.json?access_token=${token}&_sid=${storeId}`;
    getWithTpl(url, (json) => {
        if (json.ok && json.obj) {
          dispatch({type: SET_CURR_PROFILE, profile: json.obj});
        }
        callback(json.ok, json.reason, json.obj)
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

export function signIn(mobile, password, callback) {
  return dispatch => {
    return serviceSignIn(getDeviceUUID(), mobile, password)
      .then(response => response.json())
      .then(json => {

        console.log('login response:', json);

        const {access_token, refresh_token, expires_in: expires_in_ts} = json;

        if (access_token) {
          dispatch({type: SESSION_TOKEN_SUCCESS, payload: {access_token, refresh_token, expires_in_ts}});
          const expire = expires_in_ts || Config.ACCESS_TOKEN_EXPIRE_DEF_SECONDS;
          native.updateAfterTokenGot(access_token, expire, (ok, msg, profile) => {
            if (ok) {
              profile = JSON.parse(profile);
              dispatch(setUserProfile(profile));
              callback(true, 'ok', access_token)
            } else {
              console.log('updateAfterTokenGot error:', msg);
              callback(false, msg, access_token)
            }
          });

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
    const url = `check/blx_app_message_code.json?device_uuid=${getDeviceUUID()}&mobile=${mobile}&type=${type}`;
    return getWithTpl(url, (json => {
        console.log("requestSmsCode res", json);
        callback(json.success, json.reason)
      }), (error) => {
        console.log('request error', error);
        callback(false, '网络错误，请检查您的网络连接')
      });
  }
}

export function customerApply(applyData, callback) {
  return dispatch => {
    return customerApplyRequest(applyData)
      .then(response => response.json())
      .then(json => {
        console.log("customerApply res", json);
        callback(true)
      })
      .catch((error) => {
        callback(false, '网络错误，请检查您的网络连接')
      })
  }
}

