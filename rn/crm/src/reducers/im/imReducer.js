'use strict';

const {
  SET_IM_CONFIG,
  SET_IM_REMIND_COUNT,
  SET_OLD_REMIND_INFO
} = require('../../pubilc/common/constants').default;

/**
 * ## Initial State
 */
const initialState = {
  im_config: {
    im_auto_content: '',
    im_auto_reply_status: 0,
    im_store_status: 0,
    im_count_second: 0,
    im_detail_second: 0,
    im_list_second: 0
  },
  im_remind_count: 0,
  old_remind_count: {}
}

export default function imReducer(state = initialState, action) {
  switch (action.type) {
    case SET_IM_CONFIG:
      return {
        ...state,
        im_config: action.payload
      }
    case SET_IM_REMIND_COUNT:
      return {
        ...state,
        im_remind_count: action.payload
      }
    case SET_OLD_REMIND_INFO:
      return {
        ...state,
        old_remind_count: action.payload
      }
    default:
      return state;
  }
}




