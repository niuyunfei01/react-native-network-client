/**
 * # deviceReducer.js
 *
 * The reducer for all the actions from the various log states
 */
'use strict'
/**
 * ## Imports
 *
 * InitialState
 */
/**
 * Device actions to test
 */
const {
  SET_PLATFORM,
  SET_VERSION
} = require('../../pubilc/common/constants').default

const initialState = {
  isMobile: false,
  platform: '',
  version: null
}

/**
 * ## deviceReducer function
 * @param {Object} state - initialState
 * @param {Object} action - type and payload
 */
export default function deviceReducer(state = initialState, action) {

  switch (action.type) {

      /**
       * ### set the platform in the state
       *
       */
    case SET_PLATFORM: {
      const platform = action.payload
      return {...state, 'platform': platform}
    }

      /**
       * ### set the version in the state
       *
       */
    case SET_VERSION: {
      const version = action.payload
      return {...state, 'version': version}
    }
  }

  return state
}
