/**
 * # globalReducer.js
 *
 *
 */
'use strict'

const {
  GET_PROFILE_SUCCESS: LOGIN_PROFILE_SUCCESS,
  SESSION_TOKEN_SUCCESS,

  LOGOUT_SUCCESS,

} = require('../../common/constants').default

import {REHYDRATE} from 'redux-persist/constants'

const initialState = {
    currentUser: null,
    accessToken: '',
    currentUserProfile: null,
}
/**
 * ## globalReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function globalReducer (state = initialState, action) {

  switch (action.type) {

      case LOGIN_PROFILE_SUCCESS:
          if (action.payload.user && action.payload.user.user_id) {
              return state.set('currentUser', action.payload.user.user_id)
                  .set('currentUserProfile', action.payload.user);
          } else return state;

      case SESSION_TOKEN_SUCCESS:
          return {...state, 'accessToken': action.payload};

      case LOGOUT_SUCCESS:
          return state.set('currentUser', '')
              .set('currentUserProfile', null)
              .set('accessToken', '');

  }
  return state
}
