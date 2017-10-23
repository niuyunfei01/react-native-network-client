'use strict';

import * as types from './ActionTypes';
import * as lodash from 'lodash'


const DATA_TYPE_IDS = [100, 101, 102, 3, 0];

const initialState = {
  isRefreshing: {100: false, 101: false, 102: false, 3: false, 0: false},
  loading: {100: false, 101: false, 102: false, 3: false, 0: false},
  isLoadMore: {100: false, 101: false, 102: false, 3: false, 0: false},
  noMore: {100: false, 101: false, 102: false, 3: false, 0: false},
  remindList: {},
  currPage: {},
  totalPage: {},
  doingUpdate: false,
  processing: false,
  updateId: '',
  updateTypeId: '',
  remindCount: {}
};

export default function remind(state = initialState, action) {
  switch (action.type) {
    case types.FETCH_REMIND_LIST:
      let diff = {
        loading: state.loading,
        isLoadMore: state.isLoadMore,
        isRefreshing: state.isRefreshing
      };
      diff.loading[action.typeId] = action.loading;
      diff.isLoadMore[action.typeId] = action.isLoadMore;
      diff.isRefreshing[action.typeId] = action.isRefreshing;
      return Object.assign({}, state, diff);
    case types.RECEIVE_REMIND_LIST:
      let typeId = action.typeId;
      let isLoadMore = state.isLoadMore[typeId];
      return isLoadMore ? Object.assign({}, state, loadMore(state, action)) : Object.assign({}, state, combine(state, action));
    case types.DELAY_REMIND:
    case types.UPDATE_REMIND_STATUS:
      return Object.assign({}, state, {
        doingUpdate: true,
        updateId: action.id,
        updateTypeId: action.typeId,
        processing: true
      });
    case types.UPDATE_REMIND_STATUS_SUCCESS:
      return Object.assign({}, state, {
        doingUpdate: false,
        updateId: action.id,
        updateTypeId: action.typeId,
        processing: false,
        remindList: removeRemind(state, action)
      });
    case types.DELAY_REMIND_SUCCESS:
      return Object.assign({}, state, {
        doingUpdate: false,
        updateId: action.id,
        updateTypeId: action.typeId,
        processing: false
      });
    case types.FETCH_REMIND_COUNT:
      return state;
    case types.RECEIVE_REMIND_COUNT:
      return Object.assign({}, state, {remindCount: action.result});
    default:
      return state;
  }
}

function removeRemind(state, action) {
  let typeId = action.typeId;
  let id = action.id;
  let list = state.remindList[typeId];
  state.remindList[typeId] = lodash.filter(list, function (o) {
    return o.id != id;
  });
  return state.remindList;
}

function combine(state, action) {
  let diff = {
    isRefreshing: state.isRefreshing,
    loading: state.isLoading,
    isLoadMore: state.isLoadMore,
    noMore: state.no_data,
    remindList: state.remindList,
    currPage: state.currPage,
    totalPage: state.totalPage,
  };
  diff.remindList[action.typeId] = action.remindList;
  diff.currPage[action.typeId] = parseInt(action.currPage);
  diff.totalPage[action.typeId] = parseInt(action.totalPage);
  diff.loading[action.typeId] = false;
  diff.isLoadMore[action.typeId] = false;
  diff.noMore[action.typeId] = action.currPage + 1 > action.totalPage;
  diff.isRefreshing[action.typeId] = false;
  return diff;
}

function loadMore(state, action) {
  let diff = {
    isRefreshing: state.isRefreshing,
    loading: state.isLoading,
    isLoadMore: state.isLoadMore,
    noMore: state.no_data,
    remindList: state.remindList,
    currPage: state.currPage,
    totalPage: state.totalPage,
  };
  diff.remindList[action.typeId] = lodash.uniqBy(state.remindList[action.typeId].concat(action.remindList), 'id');
  diff.currPage[action.typeId] = parseInt(action.currPage);
  diff.totalPage[action.typeId] = parseInt(action.totalPage);
  diff.noMore[action.typeId] = action.currPage + 1 > action.totalPage;
  diff.isLoadMore[action.typeId] = false;
  diff.loading[action.typeId] = false;
  diff.isRefreshing[action.typeId] = false;
  return diff;
}