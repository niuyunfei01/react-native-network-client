'use strict';

import Constant from "../../Constat"

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

const initialState = {
  unlockedList: [],
  lockedList: [],
  suppliers: [],
  stores: [],
  waitReceiveSupplyOrder: [],
  receivedSupplyOrder: [],
  confirmedSupplyOrder: [],
  balancedSupplyOrder: [],
};

export default function invoicing(state = initialState, action) {
  switch (action.type) {
    case FETCH_UNLOCKED_REQ:
      return {
        ...state, unlockedList: extractUnlockedList(state, action)
      };
    case EDIT_UNLOCKED_REQ_ITEMS:
      return {
        ...state, unlockedList: editUnlockedItem(state, action)
      };
    case EDIT_UNLOCKED_REQ:
      return {
        ...state, unlockedList: editUnlockedReq(state, action)
      };
    case LOCK_PROVIDE_REQ:
      return {...state, unlockedList: lockProvideReq(state, action)};
    case FETCH_LOCKED_REQ:
      return {
        ...state, lockedList: extractLockedList(state, action)
      };
    case LIST_ALL_SUPPLIERS:
      return {
        ...state, suppliers: extractSuppliers(state, action)
      };
    case LIST_ALL_STORES:
      return {
        ...state, stores: extractStores(state, action)
      }
    case AFTER_CREATE_SUPPLY_ORDER:
      return state;
    case AFTER_SET_REQ_SUPPLIER:
      return state;
    case RECEIVE_WAIT_SUPPLY_ORDER:
      return {...state, waitReceiveSupplyOrder: extractWaitReceiveOrder(state, action)};
    case RECEIVE_RECEIVED_SUPPLY_ORDER:
      return {...state, receivedSupplyOrder: extractReceivedOrder(state, action)};
    case RECEIVE_WAIT_BALANCE_SUPPLY_ORDER:
      return {...state, confirmedSupplyOrder: extractConfirmOrder(state, action)};
    case RECEIVE_BALANCED_SUPPLY_ORDER:
      return {...state, balancedSupplyOrder: extractBalancedOrder(state, action)};
    case AFTER_UPDATE_SUPPLY_ORDER:
      return {...state, ...afterUpdateSupplyOrder(state, action)};
    case AFTER_UPDATE_SUPPLY_ORDER_ITEM:
      return {...state, ...afterUpdateOrderItem(state, action)};
    case AFTER_DELETE_SUPPLY_ORDER_ITEM:
      return {...state, ...afterDeleteOrderItem(state, action)};
    case AFTER_APPEND_SUPPLY_ORDER:
      return state;
    case AFTER_TRANSFER_ORDER_ITEM:
      return state;
    case REMOVE_SUPPLY_ORDER:
      return {...state, ...removeSupplyOrder(state, action)};
    default:
      return state
  }
}

function afterUpdateSupplyOrder(state, action) {
  return updateListData(state, action, doMergeSupplyOrderList);
}


function afterUpdateOrderItem(state, action) {
  return updateListData(state, action, doMergeSupplyOrderItem);
}

function afterDeleteOrderItem(state, action) {
  return updateListData(state, action, doDeleteSupplyOrderItem);
}

function removeSupplyOrder(state, action) {
  return updateListData(state, action, doRemoveSupplyOrder);
}

function updateListData(state, action, handler) {
  let {data, ok, status, storeId} = action;
  if (!ok) {
    return {};
  }
  switch (status) {
    case Constant.INVOICING.STATUS_CREATED:
      return {waitReceiveSupplyOrder: handler(state.waitReceiveSupplyOrder, data, storeId)};
      break;
    case Constant.INVOICING.STATUS_CONFIRMED:
      return {receivedSupplyOrder: handler(state.confirmedSupplyOrder, data, storeId)};
      break;
    case Constant.INVOICING.STATUS_ARRIVED:
      return {confirmedSupplyOrder: handler(state.receivedSupplyOrder, data, storeId)};
      break;
  }
  return {};
}

function doRemoveSupplyOrder(list, data, storeId) {
  let copy = [];
  list.forEach(function (item) {
    if (item['store_id'] == storeId) {
      let dataList = item['data'];
      let dataListCopy = [];
      dataList.forEach(function (orderItem) {
        if (orderItem['id'] != data['id']) {
          dataListCopy.push(orderItem);
        }
      });
      item['data'] = dataListCopy;
    }
    if (item['data'].length > 0) {
      copy.push(item);
    }
  });
  return copy;
}

function doMergeSupplyOrderList(list, data, storeId) {
  let copy = [];
  list.forEach(function (item) {
    if (item['store_id'] == storeId) {
      let dataList = item['data'];
      let dataListCopy = [];
      dataList.forEach(function (orderItem) {
        if (orderItem['id'] == data['id']) {
          orderItem = Object.assign({}, orderItem, data);
        }
        dataListCopy.push(orderItem);
      });
      item['data'] = dataListCopy;
    }
    copy.push(item);
  });
  return copy;
}

function doDeleteSupplyOrderItem(list, data, storeId) {
  let copy = [];
  list.forEach(function (item) {
    if (item['store_id'] == storeId) {
      let dataList = item['data'];
      let dataListCopy = [];
      dataList.forEach(function (orderItem) {
        if (orderItem['id'] == data['supply_order_id']) {
          let copyItems = [];
          let itemsData = orderItem['req_items'];
          itemsData.forEach(function (d) {
            if (d['id'] != data['id']) {
              copyItems.push(d);
            }
          });
          orderItem['req_items'] = copyItems;
        }
        dataListCopy.push(orderItem);
      });
      item['data'] = dataListCopy;
    }
    copy.push(item);
  });
  return copy;
}

function doMergeSupplyOrderItem(list, data, storeId) {
  let copy = [];
  list.forEach(function (item) {
    if (item['store_id'] == storeId) {
      let dataList = item['data'];
      let dataListCopy = [];
      dataList.forEach(function (orderItem) {
        //更新后的数据
        if (orderItem['id'] == data['supply_order_id']) {
          let copyItems = [];
          let itemsData = orderItem['req_items'];
          itemsData.forEach(function (d) {
            if (d['id'] == data['id']) {
              d = Object.assign({}, d, data);
            }
            copyItems.push(d);
          });
          orderItem['req_items'] = copyItems;
        }
        dataListCopy.push(orderItem);
      });
      item['data'] = dataListCopy;
    }
    copy.push(item);
  });
  return copy;
}

function extractWaitReceiveOrder(state, action) {
  state.waitReceiveSupplyOrder = action.waitReceiveSupplyOrder;
  return state.waitReceiveSupplyOrder;
}

function extractReceivedOrder(state, action) {
  state.receivedSupplyOrder = action.receivedSupplyOrder;
  return state.receivedSupplyOrder;
}

function extractConfirmOrder(state, action) {
  state.confirmedSupplyOrder = action.waitBalanceSupplyOrder;
  return state.confirmedSupplyOrder;
}

function extractBalancedOrder(state, action) {
  state.balancedSupplyOrder = action.balancedOrder;
  return state.balancedSupplyOrder;
}

function extractSuppliers(state, action) {
  state.suppliers = action.suppliers;
  return state.suppliers;
}

function extractStores(state, action) {
  state.stores = action.stores;
  return state.stores;
}

function extractUnlockedList(state, action) {
  state.unlockedList = action.unlockedList;
  return state.unlockedList;
}

function extractLockedList(state, action) {
  state.lockedList = action.lockedList;
  return state.lockedList;
}

function editUnlockedReq(state, action) {
  let unlockedList = state.unlockedList;
  let reqId = action.reqId;
  let remark = action.remark;
  let copy = [];
  unlockedList.forEach(function (req) {
    if (req['id'] == reqId) {
      req['remark'] = remark;
    }
    copy.push(req);
  });
  state.unlockedList = copy;
  return state.unlockedList;
}

function editUnlockedItem(state, action) {
  let unlockedList = state.unlockedList;
  let reqId = action.reqId;
  let itemId = action.itemId;
  let itemKey = action.itemKey;
  let itemVal = action.itemVal;
  let copy = [];
  unlockedList.forEach(function (req) {
    if (req['id'] == reqId) {
      let copyItems = [];
      let items = req['req_items'];
      items.forEach(function (item) {
        if (item.id == itemId) {
          item[itemKey] = itemVal;
        }
        copyItems.push(item);
      })
    }
    copy.push(req);
  });
  state.unlockedList = copy;
  return state.unlockedList;
}

function lockProvideReq(state, action) {
  let unlockedList = state.unlockedList;
  let reqId = action.reqId;
  let success = action.success;
  let copy = [];
  if (success) {
    unlockedList.forEach(function (req) {
      if (req['id'] != reqId) {
        copy.push(req);
      }
    });
  }
  state.unlockedList = copy;
  return state.unlockedList;
}