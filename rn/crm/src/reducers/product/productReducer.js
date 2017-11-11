'use strict';

/**
 * ## Actions
 *
 */
const {
  GET_NAME_PRICES,
  GET_PRODUCT_DETAIL,
} = require('../../common/constants').default;

const initialState = {
  ext_prod_map: {0:{prods:{}, prices:{}}},   /* 产品名列表, 价格列表*/
  product_detail: {},
};

/**
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function productReducer(state = initialState, action) {

  switch (action.type) {

    case GET_NAME_PRICES:

      const _now_map = state.ext_prod_map;
      if (action.key && typeof (action.prods) !== 'undefined') {
        return {
          ext_prod_map: {[action.key]: action.prods, ..._now_map},
          ...state
        }
      } else {

        return state;
      }
    case GET_PRODUCT_DETAIL:
      return {
        ...state,
        product_detail: product_detail(state, action),
      };
    default:
      return state;
  }
}

function product_detail(state, action) {
  state.product_detail[action.product_id] = action.product_detail;
  return state.product_detail;
}


