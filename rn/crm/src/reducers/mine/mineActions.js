'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastShort, ToastLong} from '../../util/ToastUtils';

export function list_store(u_id, token) {
    return dispatch => {
        dispatch(getStoreList(u_id));
        const url = `api/order_by_id/${u_id}.json?access_token=${token}&op_ship_call=1`;
        FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
            .then(resp => resp.json())
            .then(resp => {
                dispatch(receiveStoreList(resp));
                if (response.ok) {
                    dispatch(receiveStoreList(resp));
                } else {
                    dispatch(receiveStoreList([]));
                    ToastShort(error.message);
                }
            }).catch((error) => {
                dispatch(receiveStoreList([]));
                ToastShort(error.message);
            }
        );
    }
}

function getStoreList(u_id) {
    return {
        store_list : [],
    }
}

function receiveStoreList(storeList) {
    return {
        storeList: storeList,
    }
}