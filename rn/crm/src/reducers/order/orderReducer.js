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

/**
 * ## Initial State
 *
 */
const InitialState = require('./orderInitialState').default
const initialState = new InitialState()

/**
 * ## profileReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function orderReducer (state = initialState, action) {
    let nextProfileState = null

    if (!(state instanceof InitialState)) return initialState.mergeDeep(state)

    switch (action.type) {
        /**
         * ### Request starts
         * set the form to fetching and clear any errors
         */
        case GET_ORDER_REQUEST:
        case ORDER_UPDATE_REQUEST:
            return state.setIn(['isFetching'], true);

        /**
         * ### Request end successfully
         * set the form to fetching as done
         */
        case ORDER_UPDATE_SUCCESS:
            return state.setIn(['isFetching'], false);

        /**
         * ### Request ends successfully
         *
         * the fetching is done, set the UI fields and the originalProfile
         *
         * Validate the data to make sure it's all good and someone didn't
         * mung it up through some other mechanism
         */
        case GET_ORDER_SUCCESS:

            return state.setIn(['order'], action.payload)
                .setIn(['isFetching'], false);

        /**
         * User logged out, so reset form fields and original profile.
         *
         */
        case LOGOUT_SUCCESS:
            return state.setIn(['order'], {});

        /**
         * ### Request fails
         * we're done fetching and the error needs to be displayed to the user
         */
        case GET_ORDER_FAILURE:
        case ORDER_UPDATE_FAILURE:
            return state.setIn(['isFetching'], false)
                .setIn(['error'], action.payload);


    }// switch
    /**
     * # Default
     */
    return state
}