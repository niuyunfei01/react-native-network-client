'use strict';

const {
    RECEIVE_ALERT,
    REQUEST_ALERT,
} = require('../../common/constants').default;

import * as AlertServices from '../../services/alert';

function requestAlert() {
    return {
        type: REQUEST_ALERT
    };
}

function receiveAlert(alertType,alertStatus,result) {
    return {
        type: RECEIVE_ALERT,
        alertType,
        alertStatus,
        result
    };
}

export function FetchAlert(token, type, status, page, less_than_id, callback){
    return dispatch => {
        dispatch(requestAlert());
        return  AlertServices.FetchList(token, type, status, page, less_than_id)
            .then(response=>response.json())
            .then(json => {
                let {ok, reason, desc, obj} = json;
                callback(json);
                dispatch(receiveAlert(type,status,{ok, reason, desc, obj}));
            }).catch((error)=>{
            dispatch(receiveAlert(type,status,{ok:false, desc:'系统异常，'+error.message, obj:null}))
        })
    }
}

export function setTaskNoticeStatus(token, task_id , status, callback){
    return dispatch => {
        dispatch(requestAlert());
        return  AlertServices.setStatus(token, task_id, status)
            .then(response=>response.json())
            .then(json => {
                let {ok, reason, desc, obj} = json;
                callback(json);
                dispatch(receiveAlert(status,{ok, reason, desc, obj}));
            }).catch((error)=>{
            dispatch(receiveAlert(status,{ok:false, desc:'系统异常，'+error.message, obj:null}))
        })
    }
}


