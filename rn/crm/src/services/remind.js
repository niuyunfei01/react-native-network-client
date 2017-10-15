'use strict';

import AppConfig from '../config.js';
import FetchEx from '../util/fetchEx';

export function FetchRemindList(token, type, status, page) {
  let path = 'api/list_notice/' + type + '/' + status + '/' + page + '.json';
  let params = 'access_token=' + token;
  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(path, params));
}

export function SetRemindStatus(token, task_id, status) {
  let path = 'api/set_task_status/' + task_id + '/' + status + '.json';
  let params = 'access_token=' + token;
  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(path, params));
}

export function FetchRemindCount(token) {
  let path = 'api/list_notice_count.json';
  let params = 'access_token=' + token;
  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(path, params));
}

export function DelayRemind(id, minutes, token) {
  let path = 'api/set_task_delay/' + id + '/' + minutes + '.json';
  let params = 'access_token=' + token;
  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(path, params));
}