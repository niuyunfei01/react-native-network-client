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

  GET_STATE,
  SET_STATE,
  SET_STORE

} = require('../../common/constants').default

import InitialState from './globalInitialState'

const initialState = new InitialState()
/**
 * ## globalReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function globalReducer (state = initialState, action) {
  if (!(state instanceof InitialState)) return initialState.merge(state)

  switch (action.type) {

    case LOGIN_PROFILE_SUCCESS:
        if (action.payload.user && action.payload.user.user_id) {
            return state.set('currentUser', action.payload.user.user_id)
                .set('currentUserProfile', action.payload.user);
        } else return state;

    case SESSION_TOKEN_SUCCESS:
      //STORAGE
      return state.set('accessToken', action.payload.access_token);

    case LOGOUT_SUCCESS:
      return state.set('currentUser', '')
          .set('currentUserProfile', null)
          .set('accessToken', '');

    /**
     * ### sets the payload into the store
     *
     * *Note* this is for support of Hot Loading - the payload is the
     * ```store``` itself.
     *
     */
    case SET_STORE:
      return state.set('store', action.payload)

    /**
     * ### Get the current state from the store
     *
     * The Redux ```store``` provides the state object.
     * We convert each key to JSON and set it in the state
     *
     * *Note*: the global state removes the ```store```, otherwise,
     * when trying to convert to JSON, it will be recursive and fail
     */
    case GET_STATE: {
      let _state = state.store.getState()

      if (action.payload) {
        let newState = {}
        newState['auth'] = _state.auth.toJS()
        newState['device'] = _state.device.toJS()
        newState['profile'] = _state.profile.toJS()

      // Make sure global doesn't have the previous currentState
        // let _noCurrentState =  _state.global.set('currentState',null);
        // let _noStore = _noCurrentState.set('store',null);

        newState['global'] = _state.global.set('currentState', null).set('store', null).toJS()

        return state.set('showState', action.payload)
        .set('currentState', newState)
      } else {
        return state.set('showState', action.payload)
      }
    }

    /**
     * ### Set the state
     *
     * This is in support of Hot Loading
     *
     */
    case SET_STATE:
      var global = JSON.parse(action.payload).global
      var next = state.set('currentUser', global.currentUser)
          .set('showState', false)
          .set('currentState', null)
      return next

  }

  return state
}
