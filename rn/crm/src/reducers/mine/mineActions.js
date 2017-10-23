'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastShort, ToastLong} from '../../util/ToastUtils';
import Cts from "../../Cts";

const {
  GET_USER_COUNT,
  GET_WORKER,
  RESET_WORKER,
  GET_VENDOR_STORES,
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

function receiveUserCount(u_id, sign_count, bad_cases_of) {
  return {
    type: GET_USER_COUNT,
    u_id: u_id,
    sign_count: sign_count,
    bad_cases_of: bad_cases_of,
  }
}

export function fetchWorkers(_v_id, token, callback) {
  return dispatch => {
    const url = `api/get_vendor_workers/${_v_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          let list = resp.obj;
          dispatch(receiveWorker(_v_id, list));

          let normal = [];
          let forbidden = [];
          for (let idx in list) {
            if (list.hasOwnProperty(idx)) {
              let worker = list[idx];
              if (parseInt(worker.status) === Cts.WORKER_STATUS_OK) {
                normal.push(worker);
              } else {
                forbidden.push(worker);
              }
            }
          }
          resp.obj.normal = normal;
          resp.obj.forbidden = forbidden;
        } else {
          dispatch(receiveWorker(_v_id, {}));
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        dispatch(receiveWorker(_v_id, {}));
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

function receiveWorker(_v_id, workers) {
  return {
    type: GET_WORKER,
    _v_id: _v_id,
    workers: workers,
  }
}

export function getVendorStores(_v_id, token, callback) {
  return dispatch => {
    const url = `api/get_vendor_stores/${_v_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          dispatch(receiveStores(_v_id, resp.obj));
        } else {
          dispatch(receiveStores(_v_id, {}));
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        dispatch(receiveStores(_v_id, {}));
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}


function receiveStores(_v_id, store_list) {
  return {
    type: GET_VENDOR_STORES,
    _v_id: _v_id,
    store_list: store_list,
  }
}

export function editWorkerStatus({_v_id, worker_id, user_status}, token, callback) {
  return dispatch => {
    const url = `api/edit_worker_status/${_v_id}/${worker_id}/${user_status}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (!resp.ok) {
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}


export function saveVendorUser(data, token, callback) {
  return dispatch => {
    const url = `api/save_vendor_user.json`;
    // let {_v_id, user_name, mobile, limit_store, user_id, user_status, worker_id} = data;
    // let params = `access_token=${token}&&_v_id=${_v_id}&&user_name=${user_name}&&mobile=${mobile}&&limit_store=${limit_store}&&user_id=${user_id}&&user_status=${user_status}&&worker_id=${worker_id}`;
    let data_arr = [];
    data_arr.push(`access_token=${token}`);
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let val = data[key];
        data_arr.push(`${key}=${val}`);
      }
    }
    let params = data_arr.join('&&');
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url, params))
      .then(resp => resp.json())
      .then(resp => {
        if (!resp.ok) {
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

// export function ResetWorker(_v_id, user_id, user_status) {
//   return {
//     type: RESET_WORKER,
//     _v_id: _v_id,
//     user_id: user_id,
//     user_status: user_status
//   }
// }



