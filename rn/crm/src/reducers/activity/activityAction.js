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
  ACTIVITY_GOODS_LIST,
  ACTIVITY_VENDOR_TAGS,
  ACTIVITY_MANAGER_REFRESH,

} = require('../../common/constants').default;


export function saveStoreList(json) {
  return {
    type: ACTIVITY_STORE_LIST,
    json:json,
  }
}
export function saveGoodsList(goodsJson,store_ids) {
  return {
    type: ACTIVITY_GOODS_LIST,
    json:goodsJson,
    stores:store_ids
  }
}
export function activityRuleList(refresh) {
  return {
    type: ACTIVITY_MANAGER_REFRESH,
    activityRule:refresh,
  }
}
export function fetchWmStores(vendor_id,token,callback,with_price_ratio=0) {
  return dispatch => {
    const url = `api/get_wm_stores/${vendor_id}.json?access_token=${token}&with_price_ratio=${with_price_ratio}`;
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
          dispatch(activityRuleList(false));
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}
export function fetchSavePriceRule(data, token, callback) {
  let url = `api/save_price_rule.json?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {

        dispatch(activityRuleList(true));
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
  )

}

export function fetchStoresProdList(data, token, callback) {
  let url = `api/stores_prod_list.json?access_token=${token}`;
  return dispatch => {
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url,data))
        .then(resp => resp.json())
        .then(resp => {
          dispatch(saveGoodsList(resp.obj,data.store_ids));
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }

}
