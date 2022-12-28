'use strict';
import AppConfig from '../../pubilc/common/config.js';
import FetchEx from "../../pubilc/util/fetchEx";
import {getWithTpl} from "../../pubilc/util/common";

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

/*
 * 轮询请求聊天室是否有新消息
 */
export function im_message_refresh(access_token, storeId, last_msg_id, group_id, callback) {
  return dispatch => {
    const api = `api/im_message_detail_refresh?access_token=${access_token}&store_id=${storeId}&last_msg_id=${last_msg_id}&group_id=${group_id}`;
    return getWithTpl(api, (response) => {
      if (response.ok && response.obj?.length > 0) {
        callback && callback(true, '获取新消息成功', response.obj)
      } else {
        callback && callback(false)
      }
    }, (error) => {
      let msg = "暂无新消息: " + error;
      callback && callback(false, msg)
    })
  }
}





