'use strict'
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";

/**
 * ## Imports
 *
 * The actions for profile
 */
const {
  GET_CONTACT_REQUEST,
  GET_CONTACT_SUCCESS,
  GET_CONTACT_FAILURE,

} = require('../../common/constants').default


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

/**
 */
export function getContacts(sessionToken, storeId, callback) {
  return dispatch => {
    dispatch(getContactRequest())
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
        console.log('getContacts error:', error)
        callback(false, "网络错误, 请稍后重试")
      });
  }
}