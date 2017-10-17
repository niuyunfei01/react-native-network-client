'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastShort, ToastLong} from '../../util/ToastUtils';

const {
  GET_VENDOR_STORES,
} = require('../../common/constants').default;

export function getVendorStores(_v_id, token, callback) {
  return dispatch => {
    const url = `api/get_vendor_stores/${_v_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          dispatch(receiveStores(_v_id, resp.obj));
        } else {
          dispatch(receiveStores(_v_id, {}));
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        dispatch(receiveStores(_v_id, {}));
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function saveVendorUser({_v_id, user_name, mobile, limit_store, user_id}, token, callback) {
  return dispatch => {
    const url = `api/save_vendor_user/${_v_id}/${user_name}/${mobile}/${limit_store}/${user_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (!resp.ok) {
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

function receiveStores(_v_id, store_list) {
  return {
    type: GET_VENDOR_STORES,
    _v_id: _v_id,
    store_list: store_list,
  }
}





