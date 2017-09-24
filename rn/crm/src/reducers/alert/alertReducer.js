
'use strict';
import * as types from '../actionTypes';

const initialState = {
    alertType: '',
    alertStatus: '',
    result: {}
};

export default function alert(state=initialState, action={}) {
    switch (action.type) {
        case types.REQUEST_ALERT:
            return Object.assign({}, state, {
                alertType: '',
                alertStatus: '',
                result: {}
            });
        case types.RECEIVE_ALERT:
            return Object.assign({}, state, {
                alertType: action.alertType,
                alertStatus: action.alertStatus,
                result: action.result
            });
        default:
            return state;
    }
}