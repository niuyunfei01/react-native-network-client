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
  remindCount: {},
  groupNum: {},
  quickNum: {}
};

export default function remind(state = initialState, action) {
  let diff = {};
  switch (action.type) {
    case types.FETCH_REMIND_LIST:
      diff = {
        loading: state.loading,
        isLoadMore: state.isLoadMore,
        isRefreshing: state.isRefreshing
      };

      _setWithPreventCheck(diff, 'loading', action.typeId, action.loading);
      _setWithPreventCheck(diff, 'isLoadMore', action.typeId, action.isLoadMore);
      _setWithPreventCheck(diff, 'isRefreshing', action.typeId, action.isRefreshing);

      return Object.assign({}, state, diff);
    case types.RECEIVE_REMIND_LIST:
      let typeId = action.typeId;
      let loadMoreFlag = state.isLoadMore[typeId];
      let change = loadMoreFlag ? loadMore(state, action) : combine(state, action);
      let {remindList, currPage, totalPage, loading, isLoadMore, noMore, isRefreshing} = change;
      return Object.assign({}, state, {
        isRefreshing: isRefreshing,
        isLoadMore: isLoadMore,
        noMore: noMore,
        remindList: remindList,
        loading: loading,
        currPage: currPage,
        totalPage: totalPage,
        processing: false
      });
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
      return Object.assign({}, state, {
        remindCount: action.result,
        groupNum: action.groupNum,
        quickNum: action.quickNum
      });
    default:
      return state;
  }
}

function _setWithPreventCheck(diff, key, typeId, value) {

  console.log('_setWithPreventCheck', key, typeId, value)

  if (diff[key] === false) {
    diff[key] = {};
  }
  diff[key][typeId] = value;
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
  state.remindList[action.typeId] = action.remindList;
  state.currPage[action.typeId] = parseInt(action.currPage);
  state.totalPage[action.typeId] = parseInt(action.totalPage);

  _setWithPreventCheck(state, 'loading', action.typeId, false);
  _setWithPreventCheck(state, 'isLoadMore', action.typeId, false);
  _setWithPreventCheck(state, 'noMore', action.typeId, false);
  _setWithPreventCheck(state, 'isRefreshing', action.typeId, false);

  return {
    remindList: state.remindList,
    currPage: state.currPage,
    totalPage: state.totalPage,
    loading: state.loading,
    isLoadMore: state.isLoadMore,
    noMore: state.noMore,
    isRefreshing: state.isRefreshing
  }
}

function loadMore(state, action) {
  state.remindList[action.typeId] = lodash.uniqBy(state.remindList[action.typeId].concat(action.remindList), 'id');
  state.currPage[action.typeId] = parseInt(action.currPage);
  state.totalPage[action.typeId] = parseInt(action.totalPage);

  _setWithPreventCheck(state, 'loading', action.typeId, false);
  _setWithPreventCheck(state, 'isLoadMore', action.typeId, false);
  _setWithPreventCheck(state, 'noMore', action.typeId, action.remindList.length == 0);
  _setWithPreventCheck(state, 'isRefreshing', action.typeId, false);

  return {
    remindList: state.remindList,
    currPage: state.currPage,
    totalPage: state.totalPage,
    loading: state.loading,
    isLoadMore: state.isLoadMore,
    noMore: state.noMore,
    isRefreshing: state.isRefreshing
  }
}