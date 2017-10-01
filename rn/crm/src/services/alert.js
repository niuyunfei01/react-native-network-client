/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

'use strict';
import AppConfig from '../config.js';
import FetchEx from '../util/fetchEx';

export function FetchList(token, type, status, page, less_than_id) {
    // let formData = new FormData();
    // formData.append('access_token',token);
    let path = 'api/list_notice/' + type+'/'+status+'/'+page+'/'+less_than_id+'.json';
    let params = 'access_token='+token;
    return FetchEx.timeout(AppConfig.FetchTimeout,FetchEx.get(path, params));
}

export function setStatus(token, task_id, status) {
    let path = 'api/set_task_status/' + task_id + '/' + status + '.json';
    let params = 'access_token='+token;
    return FetchEx.timeout(AppConfig.FetchTimeout,FetchEx.get(path, params));
}