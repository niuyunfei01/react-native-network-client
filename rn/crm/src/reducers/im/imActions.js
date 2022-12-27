'use strict';
import AppConfig from '../../pubilc/common/config.js';
import FetchEx from "../../pubilc/util/fetchEx";

const {
  SET_IM_CONFIG,
  SET_IM_REMIND_COUNT
} = require('../../pubilc/common/constants').default;

export const setImConfig = (im_config = {}) => {
  return {
    type: SET_IM_CONFIG,
    payload: im_config
  }
}

export const setImRemindCount = (im_remind_count = 0) => {
  return {
    type: SET_IM_REMIND_COUNT,
    payload: im_remind_count
  }
}

/**
 * 获取新版IM消息数角标
 */
export function getImRemindCount(access_token, storeId, callback) {
  return dispatch => {
    const url = `api/im_message_count?access_token=${access_token}&store_id=${storeId}`
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(res => res.json())
      .then(json => {
        const ok = json.ok && json.obj;
        if (ok) {
          callback(true, 'successfully', json.obj)
        } else {
          const error = json.reason ? json.reason : "返回数据错误";
          callback(ok, error)
        }
      }).catch((error) => {
      callback(false, "网络错误, 请稍后重试")
    });
  }
}





