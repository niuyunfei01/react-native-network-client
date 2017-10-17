'use strict';

const {
  GET_VENDOR_STORES,
} = require('../../common/constants').default;


/**
 * ## Initial State
 */
const initialState = {
  vendor_stores: {},
};

export default function worker(state = initialState, action) {
  switch (action.type) {
    case GET_VENDOR_STORES:
      return {
        vendor_stores: combine(state, action),
      };
    default:
      return state;
  }
}

function combine(state, action) {
  state.vendor_stores[action._v_id] = action.store_list;
  return state.vendor_stores;
}




