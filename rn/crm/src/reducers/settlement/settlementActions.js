'use strict';
import AppConfig from '../../pubilc/common/config.js';
import FetchEx from "../../util/fetchEx";


export function get_supply_items(store_id, date, type = '', token, callback) {
  return dispatch => {
    const url = `api/get_supply_items/${store_id}/${date}/${type}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function get_supply_orders(store_id, date, token, callback) {
  return dispatch => {
    const url = `api/get_supply_orders/${store_id}/${date}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}


export function get_supply_bill_list(vendor_id, store_id, token, callback) {
  return dispatch => {
    const url = `api/get_supply_bill_list/${vendor_id}/${store_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function to_settlement(id, token, callback) {
  return dispatch => {
    const url = `api/audit_supply_bills/${id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}
