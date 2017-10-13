'use strict';

/**
 * ## Actions
 */
const {

    // GET_ORDER_REQUEST,
    // GET_ORDER_SUCCESS,
    // GET_ORDER_FAILURE,
    //
    // ORDER_UPDATE_REQUEST,
    // ORDER_UPDATE_SUCCESS,
    // ORDER_UPDATE_FAILURE,
    //
    // LOGOUT_SUCCESS,

} = require('../../common/constants').default;


/**
 * ## Initial State
 */
const initialState = {
};

export default function mineReducer (state = initialState, action) {
    switch (action.type) {
        // case GET_ORDER_REQUEST:
        // case ORDER_UPDATE_REQUEST:
        //     return state;
        // case ORDER_UPDATE_SUCCESS:
        //     return state;
        // case GET_ORDER_SUCCESS:
        //     console.log('get_order_success: order_id', action.payload.id);
        //     return {...state,
        //         order: action.payload,
        //         order_id: action.payload.id,
        //     };
        // case LOGOUT_SUCCESS:
        //     return {...state, order: null, order_id: 0};
        // case GET_ORDER_FAILURE:
        // case ORDER_UPDATE_FAILURE:
        //     return {...state, error: action.payload};
        default:
            return state;
    }
}