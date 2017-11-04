'use strict';

const {
  GET_USER_INFO,
} = require('../../common/constants').default;

/**
 * ## Initial State
 */
const initialState = {
  user_info: {},
};

export default function user(state = initialState, action) {
  switch (action.type) {
    case GET_USER_INFO:
      return {
        ...state,
        user_info: user_info(state, action),
      };
    default:
      return state;
  }
}

function user_info(state, action) {
  state.user_info[action.u_id] = action.user_info;
  return state.user_info;
}




