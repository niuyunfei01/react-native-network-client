'use strict';
import {jsonWithTpl} from "../../util/common";
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';


export function get_supply_items(store_id, date, token,callback) {
  return dispatch => {
    const url = `api/get_supply_items/${store_id}/${date}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        }).catch((error) => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        }
    );
  }
}

export function get_supply_orders(store_id, date,token,callback) {
  return dispatch => {
    const url = `api/get_supply_orders/${store_id}/${date}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        }).catch((error) => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        }
    );
  }
}


export function get_supply_bill_list(vendor_id,store_id,token,callback) {
  return dispatch => {
    const url = `api/get_supply_bill_list/${vendor_id}/${store_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        }).catch((error) => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        }
    );
  }
}

export function to_settlement(id,token,callback) {
  return dispatch => {
    const url = `api/audit_supply_bills/${id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        }).catch((error) => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        }
    );
  }
}











