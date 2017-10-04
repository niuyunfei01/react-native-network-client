'use strict';
import AppConfig from '../config.js';
import FetchEx from '../util/fetchEx';

export function smsCodeRequest(deviceId, mobile, type = 0) {
    let formData = new FormData();
    formData.append('device_uuid', deviceId);
    formData.append('mobile', mobile);
    formData.append('type', type);

    let path = 'check/app_message_code.json';
    return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.post(path, formData));
}

export function serviceSignIn(deviceId, mobile, password) {

    let formData = new FormData();
    formData.append("grant_type", AppConfig.GRANT_TYP_PASSWORD);
    formData.append("username", mobile);
    formData.append("password", password);
    formData.append("client_id", AppConfig.GRANT_CLIENT_ID);
    formData.append("device_uuid", deviceId);

    return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.post('oauth/token', formData))
}

export function customerApplyRequest(applyData) {
    return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON('api/create_apply', applyData))
}