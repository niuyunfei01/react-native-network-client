'use strict';

import * as types from './ActionTypes';
import {ToastShort, ToastLong} from '../../util/ToastUtils';
import * as RemindServices from '../../services/remind';

export function fetchRemind(isRefreshing, loading, typeId, isLoadMore, page, token, status) {
  return dispatch => {
    dispatch(fetchRemindList(isRefreshing, loading, isLoadMore, typeId));
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
    dispatch(doFetchRemindCount());
    return RemindServices.FetchRemindCount(token)
      .then(response => response.json())
      .then((response) => {
        let boday = response.obj;
        if (response.ok) {
          let result = boday.result;
          let groupNum = boday.group_type_num;
          let quickNum = boday.quick_type_num;
          dispatch(receiveRemindCount(result, groupNum, quickNum))
        } else {
          ToastShort(response.reason);
          dispatch(receiveRemindCount({}, {}, {}))
        }
      }).catch((error) => {
        ToastShort(error.message);
        dispatch(receiveRemindCount({}, {}, {}))
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
        dispatch(updateSuccessRemindStatus(id, typeId, false, 'error'));
        ToastLong('更新任务失败，请重试');
      })
  }
}

export function delayRemind(id, typeId, minutes, token) {
  return dispatch => {
    dispatch(doDelayRemind(id, typeId, minutes))
    return RemindServices.DelayRemind(id, minutes, token)
      .then(response => response.json())
      .then(json => {
        let {ok, desc} = json;
        dispatch(delayRemindSuccess(id, typeId, ok, desc));
      })
      .catch((error) => {
        dispatch(delayRemindSuccess(id, typeId, false, 'error'));
        ToastLong('更新任务失败，请重试');
      })
  }
}

function doDelayRemind(id, typeId, minutes) {
  return {
    type: types.DELAY_REMIND,
    id: id,
    typeId: typeId,
    minutes: minutes
  }
}

function delayRemindSuccess(id, typeId, ok, desc) {
  return {
    type: types.DELAY_REMIND_SUCCESS,
    id: id,
    typeId: typeId,
    ok: ok,
    desc: desc
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

function fetchRemindList(isRefreshing, loading, isLoadMore, typeId) {
  if (isLoadMore == undefined) {
    isLoadMore = false;
  }
  return {
    type: types.FETCH_REMIND_LIST,
    isRefreshing: isRefreshing,
    loading: loading,
    isLoadMore: isLoadMore,
    typeId: typeId
  }
}

function doFetchRemindCount() {
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

function receiveRemindCount(remindCount, groupNum, quickNum) {
  return {
    type: types.RECEIVE_REMIND_COUNT,
    result: remindCount,
    groupNum: groupNum,
    quickNum: quickNum
  }
}