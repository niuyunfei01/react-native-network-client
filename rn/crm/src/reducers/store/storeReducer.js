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
  GET_PACK_WORKERS,
  GET_SHIP_WORKERS,

} = require('../../common/constants').default

import {REHYDRATE} from 'redux-persist/constants'

/**
 * ## Initial State
 *
 */
const initialState = {
  contacts: {}, //store_id => contact list
  packWorkers: [],
}

var moment = require('moment');

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
      break;

    case GET_PACK_WORKERS:
      if (action.store_id && action.packers) {
        return {...state, packWorkers: {...state, [action.store_id]: action.packers, persistExpiresAt: moment().add(300, 'seconds').toDate()}}
      }
      break;

    case GET_SHIP_WORKERS:
      if (action.store_id && action.shippers) {
        return {...state, shipWorkers: {...state, [action.store_id]: action.shippers}}
      }
      break;
  }

  return state
}