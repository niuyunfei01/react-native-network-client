'use strict';

import * as types from './ActionTypes';
import {ToastShort} from '../../util/ToastUtils';
import * as RemindServices from '../../services/remind';

export function fetchRemind(isRefreshing, loading, typeId, isLoadMore, page, token, status) {
    return dispatch => {
        dispatch(fetchRemindList(isRefreshing, loading, isLoadMore));
        return RemindServices.FetchRemindList(token, typeId, status, page)
            .then(response => response.json())
            .then((response) => {
                if (response.ok) {
                    let result = response.obj;
                    dispatch(receiveRemindList(result.list, typeId, result.curr_page, result.total_page));
                } else {
                    dispatch(receiveRemindList([], typeId));
                    ToastShort(error.message);
                }
            }).catch((error) => {
                dispatch(receiveRemindList([], typeId));
                ToastShort(error.message);
            })
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

function receiveRemindList(remindList, typeId, currPage, totalPage) {
    return {
        type: types.RECEIVE_REMIND_LIST,
        remindList: remindList,
        typeId: typeId,
        currPage: currPage,
        totalPage: totalPage
    }
}