'use strict';
import * as types from '../actionTypes';
import * as AlertServices from '../../services/alert';

function requestAlert() {
    return {
        type: types.REQUEST_ALERT
    };
}

function receiveAlert(alertType,alertStatus,result) {
    return {
        type: types.RECEIVE_ALERT,
        alertType,
        alertStatus,
        result
    };
}

export function FetchAlert(token, type, status, page){
    return dispatch => {
        dispatch(requestAlert());
        return  AlertServices.FetchAlert(token, type, status, page)
            .then(response=>response.json())
            .then(json => {
                dispatch(receiveAlert(type,status,{ok:json.ok,reason:json.reason,desc: json.desc,obj:json.obj}));
            }).catch((error)=>{dispatch(receiveAlert(type,status,{ok:0,msg:'系统异常，'+error.message,obj:null}))})
    }
}


