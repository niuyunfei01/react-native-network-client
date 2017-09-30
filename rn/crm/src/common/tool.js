/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan  
 * @flow
 */

import Moment from 'moment';

export function urlByAppendingParams(url: string, params: Object) {
    let result = url
    if (result.substr(result.length - 1) != '?') {
        result = result + `?`
    }
    
    for (let key in params) {
        let value = params[key]
        result += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`
    }

    result = result.substring(0, result.length - 1);
    return result;
}

export function shortOrderDay(dt) {
    return Moment(dt).format('MMDD')
}

export function orderOrderTimeShort(dt) {
    return Moment(dt).format('MMDD')
}

export function orderExpectTime(dt) {
    return Moment(dt).format('MMDD')
}