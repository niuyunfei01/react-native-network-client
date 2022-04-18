'use strict'
import AppConfig from '../../pubilc/common/config.js';
import FetchEx from "../../pubilc/util/fetchEx";
import {getWithTpl2} from "../../pubilc/util/common";

/**
 * ## Imports
 *
 * The actions for profile
 */
const {
  GET_CONTACT_REQUEST,
  GET_CONTACT_SUCCESS,
  GET_CONTACT_FAILURE,
  GET_PACK_WORKERS,
  GET_SHIP_WORKERS,
  SET_RECORD_FLAG
} = require('../../pubilc/common/constants').default


export function getContactSucc(json) {
  return {
    type: GET_CONTACT_SUCCESS,
    payload: json
  }
}

export function getContactFailure(error) {
  return {
    type: GET_CONTACT_FAILURE,
    payload: json
  }
}

export function getContactRequest(data) {
  return {
    type: GET_CONTACT_REQUEST,
    payload: data
  }
}

export function getStorePackers(token, storeId, callback) {
  const url = `api/store_packers/${storeId}.json?access_token=${token}`;
  return getWithTpl2(url, (json, dispatch) => {
      if (json.ok) {
        dispatch({type: GET_PACK_WORKERS, store_id: storeId, packers: json.obj})
      }
      callback(json.ok, json.reason, json.obj)
    }
    , (error) => callback(false, "网络错误, 请稍后重试:" + error)
  )
}

export function getStoreShippers(token, storeId, callback) {
  const url = `api/store_shippers/${storeId}.json?access_token=${token}`;
  return getWithTpl2(url, (json, dispatch) => {
      if (json.ok) {
        dispatch({type: GET_SHIP_WORKERS, store_id: storeId, shippers: json.obj})
      }
      callback(json.ok, json.reason, json.obj)
    }
    , (error) => callback(false, "网络错误, 请稍后重试")
  )
}

/**
 */
export function getContacts(sessionToken, storeId, callback) {
  return dispatch => {
    dispatch(getContactRequest());
    const url = `api/store_contacts/${storeId}.json?access_token=${sessionToken}`
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(res => res.json())
      .then(json => {
        const ok = json.ok && json.obj;
        if (ok) {
          dispatch(getContactSucc(json))
          callback(true, 'successfully', json.obj)
        } else {
          const error = json.reason ? json.reason : "返回数据错误";
          dispatch(getContactFailure(error))
          callback(ok, error)
        }
      }).catch((error) => {
      dispatch(getContactFailure(error))
      callback(false, "网络错误, 请稍后重试")
    });
  }
}

/**
 * 创建运营板块诱导用户点击提示的action SET_RECORD_FLAG
 */
export function setRecordFlag(flag) {
  return {
    type: SET_RECORD_FLAG,
    payload: flag
  }
}

/**
 * 接收到用户点击完的action请求是否显示红点的接口进行修改store里面的值
 */
// export function getRecordFlag(token, userId, callback) {
//   return dispatch => {
//     dispatch(setRecordFlag(true));
//     const url = `/vi/new_api/record/select_record_flag/${userId}?access_token=${token}`
//     FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
//         .then(res => res.json())
//         .then(json => {
//           const ok = json.ok && json.obj;
//           if (ok) {
//             dispatch({type: SET_RECORD_FLAG, store_id: userId, record_flag: ok})
//             callback(true, 'successfully', json.obj)
//           } else {
//             dispatch(setRecordFlag(true))
//             callback(ok)
//           }
//         }).catch((error) => {
//           dispatch(setRecordFlag(false))
//           console.log('setRecordFlag error:', error)
//           callback(false, "网络错误, 请稍后重试")
//         });
//   }
// }

