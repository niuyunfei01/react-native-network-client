'use strict';
const {
  ACTIVITY_STORE_LIST,
  ACTIVITY_GOODS_LIST,
  ACTIVITY_VENDOR_TAGS,
  ACTIVITY_MANAGER_REFRESH
} = require('../../common/constants').default;
const initialState = {
  storesList: {},
  vendorTags:{},
  stores:[],
  goodsList:{},
  activityRule:false,

};

export default function activity(state = initialState, action) {
  switch (action.type) {
    case ACTIVITY_STORE_LIST :
      return {
        ...state,
        storesList: action.json
      };
    case ACTIVITY_GOODS_LIST :
      return {
        ...state,
        stores: action.stores,
        goodsList:action.json,
      };
    case ACTIVITY_MANAGER_REFRESH :
      return {
        ...state,
        activityRule:action.activityRule
      };
    default:
      return state;
  }
}
