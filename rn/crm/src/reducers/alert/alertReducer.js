
'use strict';
const {
    RECEIVE_ALERT,
    REQUEST_ALERT,
} = require('../../common/constants').default

const initialState = {
    alertType: '',
    alertStatus: '',
    result: {}
};

export default function alert(state=initialState, action={}) {
    switch (action.type) {
        case REQUEST_ALERT:
            return Object.assign({}, state, {
                alertType: '',
                alertStatus: '',
                result: {}
            });
        case RECEIVE_ALERT:
            return Object.assign({}, state, {
                alertType: action.alertType,
                alertStatus: action.alertStatus,
                result: action.result
            });
        default:
            return state;
    }
}