'use strict';
const {
  ACTIVITY_STORE_LIST,
  ACTIVITY_GOODS_LIST,
  ACTIVITY_VENDOR_TAGS,
} = require('../../common/constants').default;
const initialState = {
  storesList: {},
  vendorTags:{},
  stores:[],
  goodsList:{},

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
    default:
      return state;
  }
}
