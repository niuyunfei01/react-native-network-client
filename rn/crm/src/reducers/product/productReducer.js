'use strict';

/**
 * ## Actions
 *
 */
const {
  GET_NAME_PRICES,
  GET_PRODUCT_DETAIL,
  GET_VENDOR_TAGS,
  ACTIVITY_VENDOR_TAGS
} = require('../../common/constants').default;

const initialState = {
  ext_prod_map: {0:{prods:{}, prices:{}}},   /* 产品名列表, 价格列表*/
  product_detail: {},
  store_tags: {},
  basic_category: {},
  vendorTags:{}
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
    case GET_VENDOR_TAGS:
      return {
        ...state,
        store_tags: store_tags(state, action),
        basic_category: basic_category(state, action),
      };
      case ACTIVITY_VENDOR_TAGS:
      return {
        ...state,
        vendorTags:action.json
      };
    default:
      return state;
  }
}

function product_detail(state, action) {
  state.product_detail[action.product_id] = action.product_detail;
  return state.product_detail;
}

function store_tags(state, action) {
  state.store_tags[action._v_id] = action.store_tags;
  return state.store_tags;
}

function basic_category(state, action) {
  state.basic_category[action._v_id] = action.basic_category;
  return state.basic_category;
}


