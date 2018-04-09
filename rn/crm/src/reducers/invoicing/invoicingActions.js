'use strict';

import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';

const {
  FETCH_UNLOCKED_REQ,
  EDIT_UNLOCKED_REQ_ITEMS,
  EDIT_UNLOCKED_REQ,
  LOCK_PROVIDE_REQ,
  FETCH_LOCKED_REQ,
  LIST_ALL_SUPPLIERS,
  AFTER_SET_REQ_SUPPLIER,
  AFTER_CREATE_SUPPLY_ORDER,
  RECEIVE_WAIT_SUPPLY_ORDER
} = require('../../common/constants').default;

export function fetchUnlocked(store_id, token, callback) {
  return dispatch => {
    const url = `InventoryApi/list_unlocked/${store_id}?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if (ok) {
          dispatch(receiveUnlockedReq(obj))
        } else {
          ToastLong(reason);
          dispatch(receiveUnlockedReq([]))
        }
        callback();
      });
  }
}

export function fetchLocked(store_id, token, callback) {
  return dispatch => {
    const url = `InventoryApi/list_locked/${store_id}?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if (ok) {
          dispatch(receiveLockedReq(obj))
        } else {
          ToastLong(reason);
          dispatch(receiveLockedReq([]))
        }
        callback(ok, reason)
      })
  }
}

export function editUnlockedReq(reqId, remark) {
  return dispatch => dispatch(fireEditUnlockedReq(reqId, remark))
}

export function editUnlockedItems(reqId, itemId, itemKey, itemVal) {
  return dispatch => dispatch(fireEditUnlockedItem(reqId, itemId, itemKey, itemVal))
}

export function lockProvideReq(req, token, callBack) {
  return dispatch => {
    const url = `InventoryApi/lock_req?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, req))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        callBack(ok, reason);
        dispatch(fireLockProvideReq(req['id']), ok);
      });
  }
}

export function loadAllSuppliers(token) {
  return dispatch => {
    const url = `InventoryApi/list_supplier?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if (ok) {
          dispatch(receiveSuppliers(obj))
        } else {
          dispatch(receiveSuppliers([]))
        }
      })
  }
}

export function fetchSupplyWaitOrder(storeId, token) {
  return dispatch => {
    const url = `InventoryApi/list_wait_received_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, {storeId: storeId}))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if (ok) {
          dispatch(receiveWaitSupplyOrder(obj))
        } else {
          dispatch(receiveWaitSupplyOrder([]))
        }
      })
  }
}

export function setReqItemSupplier(items, reqId, token, callback) {
  return dispatch => {
    const url = `InventoryApi/set_item_supplier/${reqId}?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, items))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if (ok) {
          dispatch(afterSetItemSupplier(obj))
          callback(ok, reason)
        } else {
          ToastLong('设置供应商失败!');
        }
      })
  }
}

export function createSupplyOrder(reqId, token, callback) {
  return dispatch => {
    const url = `InventoryApi/create_supply_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, {'req_id': reqId}))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        dispatch(afterCreateSupplyOrder(ok, reqId))
        callback(ok, reason)
      })
  }
}


function afterCreateSupplyOrder(ok, reqId) {
  return {
    type: AFTER_CREATE_SUPPLY_ORDER,
    reqId: reqId,
    success: ok
  }
}

function afterSetItemSupplier(data) {
  return {
    type: AFTER_SET_REQ_SUPPLIER,
    reqId: data['req_id']
  }
}

function fireLockProvideReq(reqId, success) {
  return {
    type: LOCK_PROVIDE_REQ,
    reqId: reqId,
    success: success
  }
}

function fireEditUnlockedReq(reqId, remark) {
  return {
    type: EDIT_UNLOCKED_REQ,
    reqId: reqId,
    remark: remark
  }
}

function fireEditUnlockedItem(reqId, itemId, itemKey, itemVal) {
  return {
    type: EDIT_UNLOCKED_REQ_ITEMS,
    reqId: reqId,
    itemId: itemId,
    itemKey: itemKey,
    itemVal: itemVal
  }
}

function receiveWaitSupplyOrder(data) {
  return {
    type: RECEIVE_WAIT_SUPPLY_ORDER,
    waitReceiveSupplyOrder: data
  }
}

function receiveWaitConfirmOrder() {

}

function receiveWaitBalanceOrder() {

}

function receiveUnlockedReq(data) {
  return {
    type: FETCH_UNLOCKED_REQ,
    unlockedList: data
  }
}

function receiveLockedReq(data) {
  return {
    type: FETCH_LOCKED_REQ,
    lockedList: data
  }
}

function receiveSuppliers(suppliers) {
  return {
    type: LIST_ALL_SUPPLIERS,
    suppliers: suppliers
  }
}

