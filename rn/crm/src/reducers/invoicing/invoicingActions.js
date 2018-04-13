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
  RECEIVE_WAIT_SUPPLY_ORDER,
  RECEIVE_RECEIVED_SUPPLY_ORDER,
  RECEIVE_WAIT_BALANCE_SUPPLY_ORDER,
  RECEIVE_BALANCED_SUPPLY_ORDER,
  AFTER_UPDATE_SUPPLY_ORDER,
  AFTER_UPDATE_SUPPLY_ORDER_ITEM,
  AFTER_DELETE_SUPPLY_ORDER_ITEM,
  AFTER_TRANSFER_ORDER_ITEM,
  AFTER_APPEND_SUPPLY_ORDER,
  REMOVE_SUPPLY_ORDER,
  LIST_ALL_STORES
} = require('./ActionTypes.js').default;

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

export function loadAllStores(token) {
  return dispatch => {
    const url = `InventoryApi/list_stores?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if (ok) {
          dispatch(receiveStores(obj))
        } else {
          dispatch(receiveStores([]))
        }
      })
  }
}

export function fetchSupplyWaitOrder(storeId, token, callback) {
  const url = `InventoryApi/list_wait_received_order?access_token=${token}`;
  return doFetchSupplyOrder(url, storeId, receiveWaitSupplyOrder, callback)
}

export function fetchSupplyArrivedOrder(storeId, token, callback) {
  const url = `InventoryApi/list_received_order?access_token=${token}`;
  return doFetchSupplyOrder(url, storeId, receiveWaitConfirmOrder, callback)
}

export function fetchSupplyWaitBalanceOrder(storeId, token, callback) {
  const url = `InventoryApi/list_wait_balance_order?access_token=${token}`;
  return doFetchSupplyOrder(url, storeId, receiveWaitBalanceOrder, callback)
}

export function fetchSupplyBalancedOrder(storeId, token, callback) {
  const url = `InventoryApi/list_balance_order?access_token=${token}`;
  return doFetchSupplyOrder(url, storeId, receiveBalancedOrder, callback)
}

function doFetchSupplyOrder(url, storeId, respHandle, callback) {
  return dispatch => {
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, {storeId: storeId}))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if (ok) {
          dispatch(respHandle(obj))
        } else {
          dispatch(respHandle([]))
        }
        callback()
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

export function createSupplyOrder(reqId, remark, token, callback) {
  return dispatch => {
    const url = `InventoryApi/create_supply_order?access_token=${token}`;
    let data = {req_id: reqId, remark: remark};
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        dispatch(afterCreateSupplyOrder(ok, reqId))
        callback(ok, reason)
      }).catch(e => {
    }).finally(() => {

    });
  }
}

export function updateSupplyOrder(token, status, storeId, data, callback, errHandle) {
  return dispatch => {
    const url = `InventoryApi/update_supply_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        dispatch(afterUpdateSupplyOrder(ok, obj, status, storeId))
        callback(ok, reason)
      })
      .catch(e => {
        errHandle()
      })
      .finally(() => {
      })
  }
}

export function updateSupplyOrderItem(token, status, storeId, data, callback) {
  return dispatch => {
    const url = `InventoryApi/update_req_item?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        dispatch(afterUpdateSupplyOrderItem(ok, obj, status, storeId))
        callback(ok, reason)
      });
  }
}

export function deleteSupplyOrderItem(token, status, storeId, data, callback) {
  return dispatch => {
    const url = `InventoryApi/update_req_item?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if (ok) {
          dispatch(afterDeleteSupplyOrderItem(ok, obj, status, storeId))
        }
        callback(ok, reason)
      });
  }
}

export function transferSupplier(token, status, storeId, data, callback) {
  return dispatch => {
    const url = `InventoryApi/transfer_supply_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        dispatch(afterTransferSupplier(ok, obj, status, storeId))
        callback(ok, reason)
      })
  }
}

export function appendSupplyOrder(token, status, storeId, data, callback) {
  return dispatch => {
    const url = `InventoryApi/append_supply_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        dispatch(afterAppendSupplyOrder(ok, obj, status, storeId))
        callback(ok, reason)
      })
  }
}

export function trashSupplyOrder(token, status, storeId, data, callback) {
  return dispatch => {
    const url = `InventoryApi/trash_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        commonRespHandle(dispatch, resp, storeId, status, callback)
      })
  }
}


export function receivedSupplyOrder(token, status, storeId, data, callback) {
  return dispatch => {
    const url = `InventoryApi/confirm_receive_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        commonRespHandle(dispatch, resp, storeId, status, callback)
      })
  }
}

export function reviewSupplyOrder(token, status, storeId, data, callback) {
  return dispatch => {
    const url = `InventoryApi/auditing_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        commonRespHandle(dispatch, resp, storeId, status, callback)
      })
  }
}

export function balanceSupplyOrder(token, status, storeId, data, callback) {
  return dispatch => {
    const url = `InventoryApi/confirm_balance_order?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
      .then(resp => resp.json())
      .then(resp => {
        commonRespHandle(dispatch, resp, storeId, status, callback)
      })
  }
}

function commonRespHandle(dispatch, resp, storeId, status, callback) {
  let {ok, reason, obj} = resp;
  dispatch({type: REMOVE_SUPPLY_ORDER, ok: ok, data: obj, status: status, storeId: storeId})
  callback(ok, reason)
}

function afterTransferSupplier(ok, obj, status, storeId) {
  return {
    type: AFTER_TRANSFER_ORDER_ITEM,
    data: obj,
    ok: ok,
    status: status,
    storeId: storeId
  }
}

function afterAppendSupplyOrder(ok, obj, status, storeId) {
  return {
    type: AFTER_APPEND_SUPPLY_ORDER,
    data: obj,
    ok: ok,
    status: status,
    storeId: storeId
  }
}

function afterDeleteSupplyOrderItem(ok, obj, status, storeId) {
  return {
    type: AFTER_DELETE_SUPPLY_ORDER_ITEM,
    data: obj,
    ok: ok,
    status: status,
    storeId: storeId
  }
}

function afterUpdateSupplyOrder(ok, obj, status, storeId) {
  return {
    type: AFTER_UPDATE_SUPPLY_ORDER,
    data: obj,
    ok: ok,
    status: status,
    storeId: storeId
  }
}

function afterUpdateSupplyOrderItem(ok, obj, status, storeId) {
  return {
    type: AFTER_UPDATE_SUPPLY_ORDER_ITEM,
    data: obj,
    ok: ok,
    status: status,
    storeId: storeId
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

function receiveWaitConfirmOrder(data) {
  return {
    type: RECEIVE_RECEIVED_SUPPLY_ORDER,
    receivedSupplyOrder: data
  }
}

function receiveWaitBalanceOrder(data) {
  return {
    type: RECEIVE_WAIT_BALANCE_SUPPLY_ORDER,
    waitBalanceSupplyOrder: data
  }
}

function receiveBalancedOrder(data) {
  return {
    type: RECEIVE_BALANCED_SUPPLY_ORDER,
    balancedOrder: data
  }
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

function receiveStores(stores) {
  return {
    type: LIST_ALL_STORES,
    stores: stores
  }
}

