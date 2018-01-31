'use strict';
const {
  ACTIVITY_COMMON_RULE,
  ACTIVITY_SPECIAL_RULE,
  ACTIVITY_EXT_STORE_ID,
} = require('../../common/constants').default;
const initialState = {
  commonRule: [
    {
      lower: 0,
      upper: 5,
      percentage: 100,
    },
    {
      lower: 5,
      upper: 10,
      percentage: 100,
    },
    {
      lower: 10,
      upper: 20,
      percentage: 100,
    },
    {
      lower: 20,
      upper: 40,
      percentage: 100,
    },
    {
      lower: 40,
      upper: 10000,
      percentage: 100,
    }
  ],
  specialRule: [
    {
      lower: 0,
      upper: 5,
      percentage: 100,
    },
    {
      lower: 5,
      upper: 10,
      percentage: 100,
    },
    {
      lower: 10,
      upper: 20,
      percentage: 100,
    },
    {
      lower: 20,
      upper: 40,
      percentage: 100,
    },
    {
      lower: 40,
      upper: 10000,
      percentage: 100,
    }
  ],
  ext_store_id:[]
};

export default function activity(state = initialState, action) {
  switch (action.type) {
    case ACTIVITY_COMMON_RULE :
      return {
        ...state,
        commonRule: action.arr
      };
    case ACTIVITY_SPECIAL_RULE :
      return {
        ...state,
        specialRule: action.arr
      };
    case ACTIVITY_EXT_STORE_ID :
      return {
        ...state,
        ext_store_id: action.arr
      };
    default:
      return state;
  }
}