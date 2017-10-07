'use strict';

import * as types from './ActionTypes';

import * as lodash from 'lodash'

const initialState = {
    isRefreshing: false,
    loading: false,
    isLoadMore: false,
    noMore: false,
    remindList: {},
    currPage: {5: 1, 4: 1, 1: 1, 3: 1},
    totalPage: {5: 0, 4: 0, 1: 0, 3: 0},
    doingUpdate: false,
    processing: false,
    updateId: '',
    updateTypeId: '',
};

export default function remind(state = initialState, action) {
    switch (action.type) {
        case types.FETCH_REMIND_LIST:
            return Object.assign({}, state, {
                isRefreshing: action.isRefreshing,
                loading: action.loading,
                isLoadMore: action.isLoadMore,
                processing: true
            });
        case types.RECEIVE_REMIND_LIST:
            return Object.assign({}, state, {
                isRefreshing: false,
                isLoadMore: false,
                noMore: action.remindList.length == 0,
                remindList: state.isLoadMore ? loadMore(state, action) : combine(state, action),
                loading: state.remindList[action.typeId] == undefined || state.remindList[action.typeId].length == 0,
                processing: false
            });
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
    state.remindList[action.typeId] = action.remindList;
    state.currPage[action.typeId] = parseInt(action.currPage);
    state.totalPage[action.typeId] = parseInt(action.totalPage);
    return state.remindList;
}

function loadMore(state, action) {
    state.remindList[action.typeId] = state.remindList[action.typeId].concat(action.remindList);
    state.currPage[action.typeId] = parseInt(action.currPage);
    state.totalPage[action.typeId] = parseInt(action.totalPage);
    return state.remindList;
}