'use strict';

import * as types from './ActionTypes';
import {ToastShort, ToastLong} from '../../util/ToastUtils';
import * as RemindServices from '../../services/remind';

export function fetchRemind(isRefreshing, loading, typeId, isLoadMore, page, token, status) {
  return dispatch => {
    dispatch(fetchRemindList(isRefreshing, loading, isLoadMore));
    return RemindServices.FetchRemindList(token, typeId, status, page)
      .then(response => response.json())
      .then((response) => {
        let result = response.obj;
        if (response.ok) {
          dispatch(receiveRemindList(result.list, typeId, result.curr_page, result.total_page));
        } else {
          dispatch(receiveRemindList([], typeId, 1, 1));
          ToastShort(response.reason);
        }
      }).catch((error) => {
        dispatch(receiveRemindList([], typeId, 1, 1));
        ToastShort(error.message);
      })
  }
}

export function fetchRemindCount(token) {
  return dispatch => {
    dispatch(fetchRemindCount());
    return RemindServices.FetchRemindCount(token)
      .then(response => response.json())
      .then((response) => {
        console.log("get remind count " + JSON.stringify(response));
        let result = response.obj;
        if (response.ok) {
          dispatch(receiveRemindCount(result))
        } else {
          ToastShort(response.reason);
          dispatch(receiveRemindCount({}))
        }
      }).catch((error) => {
        ToastShort(error.message);
        dispatch(receiveRemindCount({}))
      })
  }
}

export function updateRemind(id, typeId, status, token) {
  return dispatch => {
    dispatch(updateRemindStatus(id, typeId, status));
    return RemindServices.SetRemindStatus(token, id, status)
      .then(response => response.json())
      .then(json => {
        let {ok, desc} = json;
        dispatch(updateSuccessRemindStatus(id, typeId, ok, desc));
      }).catch((error) => {
        //TODO
        ToastLong('更新任务失败，请重试');
      })
  }
}


function updateSuccessRemindStatus(id, typeId, ok, desc) {
  return {
    type: types.UPDATE_REMIND_STATUS_SUCCESS,
    id: id,
    typeId: typeId,
    ok: ok,
    desc: desc
  }
}

function updateRemindStatus(id, typeId, status) {
  return {
    type: types.UPDATE_REMIND_STATUS,
    id: id,
    typeId: typeId,
    status: status
  }
}

function fetchRemindList(isRefreshing, loading, isLoadMore) {
  if (isLoadMore == undefined) {
    isLoadMore = false;
  }
  return {
    type: types.FETCH_REMIND_LIST,
    isRefreshing: isRefreshing,
    loading: loading,
    isLoadMore: isLoadMore
  }
}

function fetchRemindCount() {
  return {
    type: types.FETCH_REMIND_COUNT
  }
}

function receiveRemindList(remindList, typeId, currPage, totalPage) {
  return {
    type: types.RECEIVE_REMIND_LIST,
    remindList: remindList,
    typeId: typeId,
    currPage: currPage,
    totalPage: totalPage
  }
}

function receiveRemindCount(remindCount) {
  return {
    type: types.RECEIVE_REMIND_COUNT,
    result: remindCount
  }
}