'use strict';

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
  RECEIVE_BALANCED_SUPPLY_ORDER
} = require('../../common/constants').default;

const initialState = {
  unlockedList: [],
  lockedList: [],
  suppliers: [],
  waitReceiveSupplyOrder: [],
  receivedSupplyOrder: [],
  confirmedSupplyOrder: [],
  balancedSupplyOrder: []
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
    default:
      return state
  }
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