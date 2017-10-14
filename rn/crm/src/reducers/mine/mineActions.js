'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastShort, ToastLong} from '../../util/ToastUtils';
const {
    GET_USER_COUNT
} = require('../../common/constants').default;

export function fetchUserCount(u_id, token, callback) {
    return dispatch => {
        dispatch(getUserCount());
        const url = `api/get_user_count/${u_id}.json?access_token=${token}`;
        FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
            .then(resp => resp.json())
            .then(resp => {
                if (resp.ok) {
                    dispatch(receiveUserCount(resp.obj));
                } else {
                    dispatch(receiveUserCount(0, 0));
                    ToastLong(resp.desc);
                }
                callback(resp);
            }).catch((error) => {
                dispatch(receiveUserCount(0, 0));
                ToastLong(error.message);
            }
        );
    }
}

function getUserCount() {
    return {
        type: GET_USER_COUNT,
    }
}

function receiveUserCount({sign_count, bad_cases_of}) {
    return {
        type: GET_USER_COUNT,
        sign_count : sign_count,
        bad_cases_of : bad_cases_of,
    }
}