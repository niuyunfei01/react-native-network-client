'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';
import Cts from "../../Cts";

const {
  ACTIVITY_COMMON_RULE,
  ACTIVITY_SPECIAL_RULE,
  ACTIVITY_EXT_STORE_ID
} = require('../../common/constants').default;

export function updateCommonRule(arr) {
  return {
    type: ACTIVITY_COMMON_RULE,
    arr:arr
  }
}

export function updateSpecialRule(arr) {
  return {
    type: ACTIVITY_SPECIAL_RULE,
    arr:arr,
  }
}
export function saveExtStoreId(arr) {
  return {
    type: ACTIVITY_EXT_STORE_ID,
    arr:arr,
  }
}
export function fetchWmStores(vendor_id,token,callback) {
  return dispatch => {
    const url = `api/get_wm_stores/${vendor_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}

export function fetchRuleList(is_active='',token,callback) {
  return dispatch => {
    const url = `api/get_rule_list/${is_active}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}