/**
 */
'use strict'

/**
 * ## Actions
 *
 */
const {

  ORDER_PRINTED_CLOUD,
  GET_ORDER_SUCCESS,
  GET_ORDER_FAILURE,

  ORDER_UPDATE_REQUEST,
  ORDER_UPDATE_SUCCESS,
  ORDER_UPDATE_FAILURE,

  ORDER_EDIT_ITEM,
  ORDER_INVALIDATED,
  ORDER_WAY_ROCED,

  LOGOUT_SUCCESS,

  SET_STATE
} = require('../../common/constants').default

/**
 * ## Initial State
 *
 */
const initialState = {
  isFetching: false,
  error: '',
  order: {},
  order_id: 0,
  currentUser: null,
}

/**
 * ## profileReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function orderReducer(state = initialState, action) {
  let nextProfileState = null;

  switch (action.type) {

    case ORDER_PRINTED_CLOUD:
      if (action.payload.orderId === state.order.id) {
        state.order.print_times = action.payload.printTimes;
        return {
          ...state,
          order: state.order
        }
      } else {
        return state;
      }

    case ORDER_INVALIDATED:
      if (state.order && action.id === state.order.id) {
        return {
          ...state, order: {}
        }
      } else {
        return state;
      }

    case ORDER_EDIT_ITEM:
      const {order} = state;
      if (!order.edits) {
        order.edits = {
          edit: {},
          add: {}
        };
      }

      const item = action.item;
      if (item.id) {
        order.edits.edit[item.id] = item;
      } else {
        order.edits.add[item.product_id] = item;
      }

      return {...state, order};

    /**
     运单记录
     **/

    case ORDER_WAY_ROCED:
      return {...state, order};

    /**
     * ### Request end successfully
     * set the form to fetching as done
     */
    case ORDER_UPDATE_SUCCESS:
      return state;

    /**
     * ### Request ends successfully
     *
     * the fetching is done, set the UI fields and the originalProfile
     *
     * Validate the data to make sure it's all good and someone didn't
     * mung it up through some other mechanism
     */
    case GET_ORDER_SUCCESS:
      return {
        ...state,
        order: action.payload,
        order_id: action.payload.id,
      };

    /**
     * User logged out, so reset form fields and original profile.
     *
     */
    case LOGOUT_SUCCESS:
      return {...state, order: null, order_id: 0};

    /**
     * ### Request fails
     * we're done fetching and the error needs to be displayed to the user
     */
    case GET_ORDER_FAILURE:
    case ORDER_UPDATE_FAILURE:
      return {...state, error: action.payload};

    // case REHYDRATE:
    //     return  { ...state, ...action.payload }

  }// switch
  /**
   * # Default
   */
  return state
}
