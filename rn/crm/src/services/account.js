'use strict';
import AppConfig from '../config.js';
import FetchEx from '../util/fetchEx';

export function smsCodeRequest(deviceId, mobile) {
    let formData = new FormData();
    formData.append('device_uuid', deviceId);
    formData.append('mobile', mobile);

    let path = 'check/app_message_code.json';
    return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.post(path, formData));
}