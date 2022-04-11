'use strict';

import AppConfig from '../common/config.js';
import FetchEx from '../util/fetchEx';

export function FetchRemindList(token, vendor_id, store_id, type, status, page) {
  let path = 'api/list_notice/' + vendor_id + '/' + store_id + '/' + type + '/' + status + '/' + page + '.json';
  let params = 'access_token=' + token;
  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(path, params));
}

export function SetRemindStatus(token, task_id, status) {
  let path = 'api/set_task_status/' + task_id + '/' + status + '.json';
  let params = 'access_token=' + token;
  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(path, params));
}

export function FetchRemindCount(vendor_id, store_id, token) {
  let path = 'api/list_notice_count/' + vendor_id + '/' + store_id + '.json';
  let params = 'access_token=' + token;
  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(path, params));
}

export function DelayRemind(id, minutes, token) {
  let path = 'api/set_task_delay/' + id + '/' + minutes + '.json';
  let params = 'access_token=' + token;
  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(path, params));
}
