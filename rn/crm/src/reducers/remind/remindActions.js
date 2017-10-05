'use strict';

import * as types from './ActionTypes';
import {ToastShort} from '../../utils/ToastUtils';

export function fetchRemind(isRefreshing, loading, typeId, isLoadMore, count, after) {
    if (count == undefined) {
        count = 10;
    }
    return dispatch => {
        dispatch(fetchRemindList(isRefreshing, loading, isLoadMore));
        //TODO add url
        return request(host.BASE_URL + host.DOMAINS[typeId] + '?count=' + count + '&after=' + after)
            .then((remindList) => {
                dispatch(receiveRemindList(remindList.data, typeId, remindList.data.after));
            })
            .catch((error) => {
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

function receiveRemindList(remindData, typeId, after) {
    return {
        type: types.RECEIVE_REMIND_LIST,
        remindData: remindData,
        typeId: typeId,
        after: after
    }
}