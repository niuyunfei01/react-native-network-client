'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastShort, ToastLong} from '../../util/ToastUtils';

const {
  GET_USER_COUNT,
  GET_WORKER,
} = require('../../common/constants').default;

export function fetchUserCount(u_id, token, callback) {
  return dispatch => {
    const url = `api/get_user_count/${u_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          let {sign_count, bad_cases_of} = resp.obj;
          dispatch(receiveUserCount(u_id, sign_count, bad_cases_of));
        } else {
          dispatch(receiveUserCount(0, 0));
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        dispatch(receiveUserCount(0, 0));
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function fetchWorkers(_v_id, token, callback) {
  return dispatch => {
    const url = `api/get_vendor_workers/${_v_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          let {normal, forbidden} = resp.obj;
          dispatch(receiveWorker(normal, forbidden));
        } else {
          dispatch(receiveWorker({}, {}));
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        dispatch(receiveWorker({}, {}));
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

function receiveUserCount(u_id, sign_count, bad_cases_of) {
  return {
    type: GET_USER_COUNT,
    u_id: u_id,
    sign_count: sign_count,
    bad_cases_of: bad_cases_of,
  }
}

function receiveWorker(normal, forbidden) {
  return {
    type: GET_WORKER,
    normal: normal,
    forbidden: forbidden,
  }
}





