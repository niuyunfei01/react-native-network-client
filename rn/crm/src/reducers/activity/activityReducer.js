'use strict';
const {
  ACTIVITY_COMMON_RULE,
  ACTIVITY_SPECIAL_RULE,
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
    default:
      return state;
  }
}