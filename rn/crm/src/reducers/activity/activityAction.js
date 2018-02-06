'use strict';
import {
  jsonWithTpl,
  jsonWithTpl2
} from "../../util/common";
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';
import Cts from "../../Cts";

const {
  ACTIVITY_STORE_LIST,
  ACTIVITY_VENDOR_TAGS
} = require('../../common/constants').default;


export function saveStoreList(json) {
  return {
    type: ACTIVITY_STORE_LIST,
    json:json,
  }
}

export function fetchWmStores(vendor_id,token,callback) {
  return dispatch => {
    const url = `api/get_wm_stores/${vendor_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          dispatch(saveStoreList({[vendor_id]:resp.obj}));
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
export function fetchStoresProdList(data, token, callback) {
  let url = `api/stores_prod_list.json?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
  )

}
export function fetchSavePriceRule(data, token, callback) {
  let url = `api/save_price_rule.json?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
  )

}
