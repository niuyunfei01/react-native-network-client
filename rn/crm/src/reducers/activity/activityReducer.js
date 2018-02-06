'use strict';
const {
  ACTIVITY_STORE_LIST,
  ACTIVITY_VENDOR_TAGS,
} = require('../../common/constants').default;
const initialState = {
  storesList: {},
  vendorTags:{},
};

export default function activity(state = initialState, action) {
  switch (action.type) {
    case ACTIVITY_STORE_LIST :
      return {
        ...state,
        storesList: action.json
      };
    case ACTIVITY_VENDOR_TAGS :
      return {
        ...state,
        vendorTags: action.json
      };
    default:
      return state;
  }
}
