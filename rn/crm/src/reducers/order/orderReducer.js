/**
 * # profileReducer.js
 *
 * The reducer user profile actions
 */
'use strict'

/**
 * ## Actions
 *
 */
const {

    GET_ORDER_REQUEST,
    GET_ORDER_SUCCESS,
    GET_ORDER_FAILURE,

    ORDER_UPDATE_REQUEST,
    ORDER_UPDATE_SUCCESS,
    ORDER_UPDATE_FAILURE,

    LOGOUT_SUCCESS,

    SET_STATE
} = require('../../common/constants').default

import {REHYDRATE} from 'redux-persist/constants'

/**
 * ## Initial State
 *
 */
const initialState = {
    isFetching: false,
    error:'',
    order: {},
    order_id: 0,
    currentUser: null,
    showState: false,
    currentState: null,
    store: null
}

/**
 * ## profileReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function orderReducer (state = initialState, action) {
    let nextProfileState = null

    switch (action.type) {
        /**
         * ### Request starts
         * set the form to fetching and clear any errors
         */
        case GET_ORDER_REQUEST:
        case ORDER_UPDATE_REQUEST:
            return state;

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
            console.log('get_order_success: order_id', action.payload.id)
            return {...state,
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
        //     return state

    }// switch
    /**
     * # Default
     */
    return state
}