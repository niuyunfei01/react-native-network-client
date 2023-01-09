'use strict';
import AppConfig from '../../pubilc/common/config.js';
import FetchEx from "../../pubilc/util/fetchEx";
import {getWithTpl} from "../../pubilc/util/common";

/**
 * ## Imports
 *
 * The actions supported
 */
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
export function getImRemindCount(access_token, storeId, host, callback) {
  return dispatch => {
    const url = `/im/im_message_count?access_token=${access_token}&store_id=${storeId}`
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.getWithIm(url, {}, host))
      .then(res => res.json())
      .then(({ok , obj, reason}) => {
        if (ok) {
          callback(true, 'successfully', obj)
        } else {
          const error = reason ? reason : "返回数据错误";
          callback(ok, error)
        }
      }).catch((error) => {
      callback(false, "网络错误, 请稍后重试")
    });
  }
}

/**
 * 轮询请求聊天室是否有新消息
 */
export function im_message_refresh(access_token, storeId, last_msg_id, group_id, host, callback) {
  return dispatch => {
    const api = `/im/im_message_detail_refresh?access_token=${access_token}&store_id=${storeId}&last_msg_id=${last_msg_id}&group_id=${group_id}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.getWithIm(api, {}, host))
      .then(res => res.json())
      .then(({ok, obj, reason}) => {
        if (ok && obj?.length > 0) {
          callback && callback(true, '获取新消息成功', obj)
        } else {
          const error = reason ? reason : "返回数据错误";
          callback && callback(ok, error)
        }
      }).catch((error) => {
      let msg = "暂无新消息: " + error;
      callback && callback(false, msg)
    });
  }
}

/**
 * 获取IM配置
 */
export function getStoreImConfig(token, storeId, callback) {
  return dispatch => {
    const url = `api/im_store_config?access_token=${token}&store_id=${storeId}`;
    return getWithTpl(url, (json) => {
      if (json?.ok) {
        dispatch(setImConfig(json.obj));
        callback && callback(true, '获取IM配置成功', json.obj)
      } else {
        callback && callback(false, json?.reason)
      }
    }, (error) => {
      let msg = "获取IM配置错误: " + error;
      callback && callback(false, msg)
    })
  }
}





