'use strict';

const {
  GET_USER_COUNT,
  GET_WORKER,
} = require('../../common/constants').default;


/**
 * ## Initial State
 */
const initialState = {
  sign_count: {},
  bad_cases_of: {},
  normal: {},
  forbidden: {},
};

export default function mine(state = initialState, action) {
  switch (action.type) {
    case GET_USER_COUNT:
      return {
        ...state,
        sign_count: sign_count(state, action),
        bad_cases_of: bad_cases_of(state, action),
      };
    case GET_WORKER:
      return {
        ...state,
        normal: action.normal,
        forbidden: action.forbidden,
      };
    default:
      return state;
  }
}

function sign_count(state, action) {
  state.sign_count[action.u_id] = action.sign_count;
  return state.sign_count;
}

function bad_cases_of(state, action) {
  state.bad_cases_of[action.u_id] = action.bad_cases_of;
  return state.bad_cases_of;
}



