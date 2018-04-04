'use strict';

const {
  FETCH_UNLOCKED_REQ,
  EDIT_UNLOCKED_REQ_ITEMS,
  EDIT_UNLOCKED_REQ,
  LOCK_PROVIDE_REQ,
  FETCH_LOCKED_REQ,
  LIST_ALL_SUPPLIERS
} = require('../../common/constants').default;

const initialState = {
  unlockedList: [],
  lockedList: [],
  suppliers:[]
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
    default:
      return state
  }
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