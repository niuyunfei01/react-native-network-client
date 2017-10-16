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

  GET_CONTACT_REQUEST,
  GET_CONTACT_SUCCESS,
  GET_CONTACT_FAILURE,

} = require('../../common/constants').default

import {REHYDRATE} from 'redux-persist/constants'

/**
 * ## Initial State
 *
 */
const initialState = {
  contacts: {}, //store_id => contact list
}

export default function storeReducer(state = initialState, action) {

  switch (action.type) {

    case GET_CONTACT_SUCCESS:

      if (action.store_id && action.contacts) {
        let contacts = state.contacts || {};
        contacts[action.store_id] = action.contacts;
        return {
          ...state,
          contacts
        };
      }
  }

  return state
}