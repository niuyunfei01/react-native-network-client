/**
 * # profileReducer.js
 *
 * The reducer user profile actions
 */
'use strict'

import dayjs from "dayjs";

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
  SET_RECORD_FLAG

} = require('../../pubilc/common/constants').default

/**
 * ## Initial State
 *
 */
const initialState = {
  contacts: {}, //store_id => contact list
  packWorkers: [],
  recordFlag: false //store_id => record_flag
};


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
        return {
          ...state,
          packWorkers: {
            ...state,
            [action.store_id]: action.packers,
            persistExpiresAt: dayjs().add(300, 'seconds').toDate()
          }
        }
      }
      break;

    case GET_SHIP_WORKERS:
      if (action.store_id && action.shippers) {
        return {...state, shipWorkers: {...state, [action.store_id]: action.shippers}}
      }
      break;

    case SET_RECORD_FLAG:
      return Object.assign({}, state, action)
    default:
      break;
  }

  return state
}
