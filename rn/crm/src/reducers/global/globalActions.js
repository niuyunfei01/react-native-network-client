/**
 * # globalActions.js
 *
 * Actions that are global in nature
 */


'use strict';

import Config from '../../pubilc/common/config'
import {Login, sendMobileCode} from '../../pubilc/services/account'
import {getWithTpl} from '../../pubilc/util/common'
import {
  addStores,
  addStoresDelivery,
  checkBindExt,
  checkMessageCode,
  getStoreDelivery,
  updateStoresDelivery
} from "../../pubilc/services/global"
import DeviceInfo from 'react-native-device-info';
import HttpUtils from "../../pubilc/util/http";
import {doJPushDeleteAlias, doJPushStop} from "../../pubilc/component/jpushManage";
import tool from "../../pubilc/util/tool";
import {nrRecordMetric} from "../../pubilc/util/NewRelicRN";

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
  UPDATE_CONFIG,
  UPDATE_CFG_ITEM,
  CHECK_VERSION_AT,
  BLE_STARTED,
  SET_PRINTER_ID,
  SET_PRINTER_NAME,
  SET_USER_CONFIG,
  SET_ORDER_LIST_BY,
  SET_CALL_DELIVERY_OBJ,
  SET_SHOW_FLOAT_SERVICE_ICON,
  SET_NO_LOGIN_INFO,
  SET_GOODS_SG_CATEGORY,
  SET_BLUETOOTH_DEVICE_LIST,
  SET_SCANNING_BLUETOOTH_DEVICE,
  SET_VOLUME,
  SET_AUTO_PRINT,
  SET_NET_INFO_STATUS,
  SET_NOTIFICATION_STATUS,
  SET_BACKGROUND_STATUS,
  SET_JPush_STATUS
} = require('../../pubilc/common/constants').default;

export function getDeviceUUID() {
  return DeviceInfo.getUniqueId();
}

export const setJPushStatus = (value) => {
  return {
    type: SET_JPush_STATUS,
    payload: value
  }
}
export const setBackgroundStatus = (value) => {
  return {
    type: SET_BACKGROUND_STATUS,
    payload: value
  }
}
export const setNotificationStatus = (value) => {
  return {
    type: SET_NOTIFICATION_STATUS,
    payload: value
  }
}

export const setVolume = (value) => {
  return {
    type: SET_VOLUME,
    payload: value
  }
}

export const setNetInfo = (value) => {
  return {
    type: SET_NET_INFO_STATUS,
    payload: value
  }
}

export const setAutoPrint = (autoBluetoothPrint) => {
  return {
    type: SET_AUTO_PRINT,
    payload: autoBluetoothPrint
  }
}
export const setIsScanningBlueTooth = (status) => {
  return {
    type: SET_SCANNING_BLUETOOTH_DEVICE,
    payload: status
  }
}

export const setBlueToothDeviceList = (bluetoothDeviceList) => {
  return {
    type: SET_BLUETOOTH_DEVICE_LIST,
    payload: bluetoothDeviceList
  }
}

export const setSGCategory = (basic_categories) => {
  return {
    type: SET_GOODS_SG_CATEGORY,
    payload: basic_categories
  }
}

export function setAccessToken(obj = {}) {
  if (!obj.access_token)
    nrRecordMetric('app_redux', {...obj, setTokenName: 'setAccessToken'})
  return {
    type: SESSION_TOKEN_SUCCESS,
    payload: obj
  }
}

export function setNoLoginInfo(info = {}) {
  if (!info.accessToken)
    nrRecordMetric('app_redux', {...info, setTokenName: 'setNoLoginInfo'})
  return {
    type: SET_NO_LOGIN_INFO,
    payload: info
  }
}

export function setCheckVersionAt(checkAt) {
  return {
    type: CHECK_VERSION_AT,
    payload: checkAt
  }
}

export function setBleStarted(bleStarted) {
  return {
    type: BLE_STARTED,
    payload: bleStarted
  }
}

export function setUserProfile(profile) {
  return {
    type: LOGIN_PROFILE_SUCCESS,
    payload: profile
  }
}

/**
 *
 * @param store_id
 * @returns {{payload: {id: *}, type: *}}
 */
export function setCurrentStore(store_id) {
  const payload = {id: store_id};
  return {
    type: SET_CURR_STORE,
    payload: payload
  }
}

export function setPrinterId(printerId) {
  return {
    type: SET_PRINTER_ID,
    printer_id: printerId
  }
}

export function setPrinterName(printerInfo) {
  return {
    type: SET_PRINTER_NAME,
    printer_info: printerInfo
  }
}


export function setFloatSerciceIcon(show) {
  return {
    type: SET_SHOW_FLOAT_SERVICE_ICON,
    show: show
  }
}


export function setUserCfg(info) {
  return {
    type: SET_USER_CONFIG,
    info: info
  }
}


export function setOrderListBy(info) {
  return {
    type: SET_ORDER_LIST_BY,
    val: info
  }
}


export function updateConfig(config) {
  return {
    type: UPDATE_CONFIG,
    payload: config,
  }
}


export function setCallDeliveryObj(obj) {
  return {
    type: SET_CALL_DELIVERY_OBJ,
    obj: obj
  }
}

export const resetRedux = () => {
  nrRecordMetric('app_redux', {setTokenName: 'resetRedux'})
  return dispatch => dispatch({type: LOGOUT_SUCCESS});
}

export function logout(callback) {
  nrRecordMetric('app_redux', {setTokenName: 'logout'})
  return async (dispatch) => {
    dispatch({type: LOGOUT_SUCCESS});
    await doJPushDeleteAlias()
    await doJPushStop()
    if (typeof callback === 'function') {
      callback();
    }
  }
}

export function getConfigItem(token, configKey, callback) {
  return dispatch => {
    const url = `api/config_item?access_token=${token}&key=${configKey}`;
    return getWithTpl(url, (json) => {
      if (json.ok) {
        dispatch({type: UPDATE_CFG_ITEM, key: configKey, value: json.obj});
      }
      callback(json.ok, json.reason, json.obj);
    }, (error) => {
      callback(false)
    });
  }
}

export function check_is_bind_ext(params, callback) {
  return dispatch => {
    return checkBindExt(params)
      .then(response => {
        callback(true, tool.length(response) > 0)
      })
      .catch((error) => {
        callback(false, '网络错误，请检查您的网络连接')
      })

  }
}

export function getConfig(token, storeId, callback) {
  return dispatch => {
    const url = `api/get_app_config?access_token=${token}&_sid=${storeId}`;
    return getWithTpl(url, (json) => {
      if (json.ok) {
        dispatch(updateConfig(json.obj));
        callback && callback(true, '获取配置成功', json.obj)
      } else {
        callback && callback(false, json.reason)
      }
    }, (error) => {
      let msg = "获取服务器端配置错误: " + error;
      callback && callback(false, msg)
    })
  }
}

export function sendDverifyCode(mobile, type, is_agree, callback) {
  return dispatch => {
    return sendMobileCode({
      mobile,
      type,
      is_agree,
      device_uuid: getDeviceUUID(),
    })
      .then(() => {
        callback(true, '发送成功')
      }).catch((error) => {
        callback(false, '发送失败' + error?.desc)
      })
  }
}


export function signIn(mobile, password, props, callback) {
  return dispatch => {
    return Login({mobile, password, device_uuid: getDeviceUUID()})
      .then(json => {
        const {access_token, refresh_token, expires_in: expires_in_ts} = json;
        if (access_token) {
          dispatch(setAccessToken({access_token, refresh_token, expires_in_ts}))
          const expire = expires_in_ts || Config.ACCESS_TOKEN_EXPIRE_DEF_SECONDS;

          const authCallback = (ok, msg, profile) => {
            if (ok) {
              dispatch(setUserProfile(profile));
              callback(true, 'ok', access_token, profile.id)
            } else {
              callback(false, msg, access_token)
            }
          };
          doAuthLogin(access_token, expire, props, authCallback)

        } else {
          if (Number(json.desc) === 401)
            return callback(false, Number(json.desc))
          //fixme: 需要给出明确提示
          callback(false, "验证码错误")
        }
      }).catch(() => callback(false, '网络错误，请检查您的网络连接'))
  }
}

export function doAuthLogin(access_token, expire, props, callback) {
  HttpUtils.get.bind(props)(`/api/user_info2?access_token=${access_token}`).then(user => {
    if (user.id) {
      callback(true, "ok", user)
    } else {
      callback(false, "账号不存在")
    }
  }, (res) => {
    if (Number(res.desc) === 10001) {
      callback(false, "账号错误，请检查账号是否正确")
    } else {
      callback(false, "获取不到账户相关信息");
    }
  })
}

export function customerApply(params, callback, props) {
  return dispatch => {
    return addStores({device_uuid: getDeviceUUID(), ...params})
      .then((response) => {
        callback(true, '成功', response)
        const {access_token, refresh_token, expires_in: expires_in_ts} = response.user.token;
        dispatch({type: SESSION_TOKEN_SUCCESS, payload: {access_token, refresh_token, expires_in_ts}});
        if (!access_token)
          nrRecordMetric('app_redux', {...response.user.token, setTokenName: 'SESSION_TOKEN_SUCCESS'})
        const expire = expires_in_ts || Config.ACCESS_TOKEN_EXPIRE_DEF_SECONDS;
        const authCallback = (ok, msg, profile) => {
          if (ok) {
            dispatch(setUserProfile(profile));
          }
        };
        doAuthLogin(access_token, expire, props, authCallback)
      }).catch((error) => {
        callback(false, error.reason, [])
      })
  }
}


export function showStoreDelivery(ext_store_id, callback) {
  return dispatch => {
    return getStoreDelivery(ext_store_id)
      .then(response => {
        callback(true, response)
      })
      .catch((error) => {
        callback(false, '网络错误，请检查您的网络连接')
      })
  }
}

export function addDelivery(params, callback) {
  return dispatch => {
    return addStoresDelivery(params)
      .then(response => {
        callback(true, response)
      })
      .catch((error) => {
        callback(false, '网络错误，请检查您的网络连接')
      })
  }
}

export function updateStoresAutoDelivery(token, ext_store_id, params, callback) {
  return dispatch => {
    return updateStoresDelivery(token, ext_store_id, params)
      .then(response => {
        callback(true, response)
      })
      .catch((error) => {
        callback(false, '网络错误，请检查您的网络连接')
      })
  }
}


