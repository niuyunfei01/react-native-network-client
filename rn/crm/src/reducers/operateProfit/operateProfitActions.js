'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';
import Cts from "../../Cts";
import {jsonWithTpl2} from "../../util/common";
export function fetchProfitHome(store_id,token,callback) {
  return dispatch => {
    const url = `api/profit_home/${store_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.obj,resp.desc);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}
export function fetchProfitDaily(store_id,day,token,callback) {
  return dispatch => {
    const url = `api/profit_daily/${store_id}/${day}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.obj,resp.desc);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}
export function fetchProfitIncomeOrderList(type,store_id,day,token,callback) {
  return dispatch => {
    const url = `api/profit_income_order_list/${type}/${store_id}/${day}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.obj,resp.desc);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}
export function fetchProfitOutcomeNormalList(type,store_id,day,token,callback) {
  return dispatch => {
    const url = `api/profit_outcome_normal_list/${type}/${store_id}/${day}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.obj,resp.desc);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}
export function changeProfitInvalidate(id,token,callback) {
  return dispatch => {
    const url = `api/profit_outcome_other_invalidate/${id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.obj,resp.desc);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}
export function fetchProfitOutcomeOtherItem(id,token,callback) {
  return dispatch => {
    const url = `api/profit_outcome_other/${id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.obj,resp.desc);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}

export function fetchProfitOtherAdd(store_id,day,data, token, callback) {
  let url = `api/profit_other_add/${store_id}/${day}.json?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
  )

}