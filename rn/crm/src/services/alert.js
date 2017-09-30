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

export function FetchList(token, type, status, page) {
    // let formData = new FormData();
    // formData.append('access_token',token);
    let path = 'test/list_notice/' + type+'/'+status+'/'+page+'.json';
    let params = 'access_token='+token;
    return FetchEx.timeout(AppConfig.FetchTimeout,FetchEx.get(path, params));
}

// export function FetchList(token, type, status, page) {
//     // let formData = new FormData();
//     // formData.append('access_token',token);
//     let path = 'test/list_notice/' + type+'/'+status+'/'+page+'.json';
//     let params = 'access_token='+token;
//     return FetchEx.timeout(AppConfig.FetchTimeout,FetchEx.get(path, params));
// }