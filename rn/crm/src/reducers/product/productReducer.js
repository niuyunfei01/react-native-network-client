'use strict'

/**
 * ## Actions
 *
 */
const {

  GET_NAME_PRICES,

  SET_STATE
} = require('../../common/constants').default;

const initialState = {
  ext_prod_map: {0:{prods:{}, prices:{}}},   /* 产品名列表, 价格列表*/
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

    // case REHYDRATE:
    //     return  { ...state, ...action.payload }

  }

  return state
}