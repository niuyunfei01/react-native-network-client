"use strict";
import AppConfig from "../../pubilc/common/config.js";
import FetchEx from "../../util/fetchEx";
import {ToastLong} from "../../pubilc/util/ToastUtils";
import Cts from "../../pubilc/common/Cts";

const {
  GET_USER_COUNT,
  GET_WORKER,
  GET_VENDOR_STORES,
  GET_STORE_TURNOVER,
  GET_WM_STORES,
  GET_USER_WAGE_DATA,
  GET_VENDOR_DUTY_USERS
} = require("../../util/constants").default;

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
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          dispatch(receiveUserCount(0, 0));
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

function receiveUserCount(u_id, sign_count, bad_cases_of) {
  return {
    type: GET_USER_COUNT,
    u_id: u_id,
    sign_count: sign_count,
    bad_cases_of: bad_cases_of
  };
}

export function fetchDutyUsers(storeId, token, callback) {
  return dispatch => {
    const url = `api/get_duty_users/${storeId}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            let users = resp.obj;
            dispatch(receiveUserDutyUsers(users));
          } else {
            dispatch(receiveUserDutyUsers([]));
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          dispatch(receiveUserCount(0, 0));
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

function receiveUserDutyUsers(users) {
  return {
    type: GET_VENDOR_DUTY_USERS,
    users: users
  };
}

export function fetchWorkers(_v_id, token, callback) {
  return dispatch => {
    const url = `api/get_vendor_workers/${_v_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            let user_list = resp.obj;
            let normal = [];
            let forbidden = [];
            for (let worker of Object.values(user_list)) {
              if (parseInt(worker.status) === Cts.WORKER_STATUS_OK) {
                normal.push(worker);
              } else {
                forbidden.push(worker);
              }
            }
            resp.obj = {};
            resp.obj.normal = normal;
            resp.obj.forbidden = forbidden;
            resp.obj.user_list = user_list;
            dispatch(receiveWorker(_v_id, resp.obj));
          } else {
            dispatch(receiveWorker(_v_id, {}));
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          dispatch(receiveWorker(_v_id, {}));
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

function receiveWorker(_v_id, {user_list, normal, forbidden}) {
  return {
    type: GET_WORKER,
    _v_id: _v_id,
    user_list: user_list,
    normal: normal,
    forbidden: forbidden
  };
}

export function getVendorStores(_v_id, token, callback) {
  return dispatch => {
    const url = `api/get_vendor_store_list/${_v_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            dispatch(receiveStores(_v_id, resp.obj));
          } else {
            dispatch(receiveStores(_v_id, {}));
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          dispatch(receiveStores(_v_id, {}));
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

function receiveStores(_v_id, store_list) {
  return {
    type: GET_VENDOR_STORES,
    _v_id: _v_id,
    store_list: store_list
  };
}

export function editWorkerStatus(
    {_v_id, worker_id, user_status},
    token,
    callback
) {
  return dispatch => {
    const url = `api/edit_worker_status/${_v_id}/${worker_id}/${user_status}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
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
    let params = data_arr.join("&&");
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url, params))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

export function saveOfflineStore(data, token, callback) {
  return dispatch => {
    const url = `stores/save_stores.json`;
    let data_arr = [];
    data_arr.push(`access_token=${token}`);
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let val = data[key];
        data_arr.push(`${key}=${val}`);
      }
    }
    let params = data_arr.join("&&");
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url, params))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

export function fetchStoreTurnover(store_id, token, callback) {
  return dispatch => {
    const url = `api/get_store_turnover/${store_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            let {order_num, turnover} = resp.obj;
            dispatch(receiveStoreTurnover(store_id, order_num, turnover));
          } else {
            dispatch(receiveStoreTurnover(store_id));
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          dispatch(receiveStoreTurnover(store_id));
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

function receiveStoreTurnover(store_id, order_num = 0, turnover = 0) {
  return {
    type: GET_STORE_TURNOVER,
    store_id: store_id,
    order_num: order_num,
    turnover: turnover
  };
}

export function copyStoreGoods(store_id, force, token, callback) {
  return dispatch => {
    const url = `stores/store_copy_goods/${store_id}/${force}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

export function fetchWmStore(store_id, cache, token, callback) {
  return dispatch => {
    const url = `api/wm_store_list/${store_id}.json?access_token=${token}&&cache=${cache}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            dispatch(receiveWmStore(store_id, resp.obj));
          } else {
            dispatch(receiveWmStore(store_id));
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          dispatch(receiveWmStore(store_id));
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

function receiveWmStore(store_id, wm_list = {}) {
  return {
    type: GET_WM_STORES,
    store_id: store_id,
    wm_list: wm_list
  };
}

export function setWmStoreStatus(
    vendor_id,
    platform,
    wid,
    status,
    token,
    openTime,
    remark,
    callback
) {
  return dispatch => {
    const url = `api/set_wm_store_status/${vendor_id}/${platform}/${wid}/${status}.json?access_token=${token}&openTime=${openTime}&remark=${remark}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.ok) {
            ToastLong(resp.desc);
          }
          callback(resp);
        })
        .catch(error => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

export function userCanChangeStore(store_id, token, callback) {
  return dispatch => {
    const url = `api/can_change_store/${store_id}.json?access_token=${token}`;

    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp);
        })
        .catch(error => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        });
  };
}

function receiveUserWageData(wageData = {}) {
  return {
    type: GET_USER_WAGE_DATA,
    wageData: wageData
  };
}

export function getUserWageData(token, month, callback) {
  return dispatch => {
    const url = `api/supplement_wage?access_token=${token}`;

    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, {})).then(resp => resp.json()).then(resp => {
      let {ok, obj} = resp;
      if (ok) {
        dispatch(receiveUserWageData(obj))
      }
      callback(ok, obj);
    })
  }
}
