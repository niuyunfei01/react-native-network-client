'use strict';
import AppConfig from '../../pubilc/common/config.js';
import FetchEx from "../../pubilc/util/fetchEx";
import {ToastLong} from '../../pubilc/util/ToastUtils';

const {
  GET_USER_INFO,
} = require('../../pubilc/common/constants').default;

export function fetchUserInfo(u_id, token, callback) {
  return dispatch => {
    const url = `api/user_info2/${u_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          dispatch(receiveUserInfo(u_id, resp.obj));
        } else {
          dispatch(receiveUserInfo(0));
          ToastLong(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        dispatch(receiveUserInfo(0));
        ToastLong(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

function receiveUserInfo(u_id, user_info = {}) {
  return {
    type: GET_USER_INFO,
    u_id: u_id,
    user_info: user_info,
  }
}





