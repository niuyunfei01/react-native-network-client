'use strict';

const {
  FETCH_UNLOCKED_REQ
} = require('../../common/constants').default;

const initialState = {
  unlockedList : [],
};


export default function invoicing(state = initialState, action) {
  switch (action.type){
    case FETCH_UNLOCKED_REQ:
      return {
        ...state, unlockedList: extractUnlockedList(state, action)
      };
    default:
      return state
  }
}

function extractUnlockedList(state, action) {
  state.unlockedList = action.unlockedList;
  return state.unlockedList;
}