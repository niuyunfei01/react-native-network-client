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

export function FetchAlert(token, type, status, page) {
    let formData = new FormData();
    let path = 'test/list_notice/' + type+'/'+status+'/'+page+'.json';
    formData.append('access_token',token);
    return FetchEx.timeout(AppConfig.FetchTimeout,FetchEx.get(path));
}