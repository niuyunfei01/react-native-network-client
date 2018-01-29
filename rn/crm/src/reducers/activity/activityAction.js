'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';
import Cts from "../../Cts";

const {
  ACTIVITY_COMMON_RULE,
  ACTIVITY_SPECIAL_RULE,
} = require('../../common/constants').default;

export function updateCommonRule(arr) {
  return {
    type: ACTIVITY_COMMON_RULE,
    arr:arr
  }
}

// export function updateCommonRule(arr) {
//   return {
//     type: ACTIVITY_COMMON_RULE,
//     arr:arr
//   }
// }
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