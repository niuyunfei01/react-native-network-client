'use strict';

import * as types from './ActionTypes';

const initialState = {
    isRefreshing: false,
    loading: false,
    isLoadMore: false,
    noMore: false,
    remindList: {},
    currPage: {5: '', 4: '', 1: '', 3: ''},
    totalPage: {5: '', 4: '', 1: '', 3: ''}
};

export default function remind(state = initialState, action) {
    switch (action.type) {
        case types.FETCH_REMIND_LIST:
            return Object.assign({}, state, {
                isRefreshing: action.isRefreshing,
                loading: action.loading,
                isLoadMore: action.isLoadMore
            });
        case types.RECEIVE_REMIND_LIST:
            return Object.assign({}, state, {
                isRefreshing: false,
                isLoadMore: false,
                noMore: action.remindList.length == 0,
                remindList: state.isLoadMore ? loadMore(state, action) : combine(state, action),
                loading: state.remindList[action.typeId] == undefined
            });
        default:
            return state;
    }
}

function combine(state, action) {
    state.remindList[action.typeId] = action.remindList;
    state.currPage[action.typeId] = action.currPage;
    state.totalPage[action.typeId] = action.totalPage;
    console.info('currPage=', state.currPage);
    console.info('totalPage=', action.totalPage);
    console.info('remindList=', action.remindList);
    return state.remindList;
}

function loadMore(state, action) {
    state.remindList[action.typeId] = state.remindList[action.typeId].concat(action.remindList);
    state.currPage[action.typeId] = action.totalPage;
    state.totalPage[action.typeId] = action.totalPage;
    state.after = action.after;
    console.info('currPage=', action.currPage);
    console.info('totalPage=', action.totalPage);
    console.info('remindList=', action.remindList);
    return state.remindList;
}