'use strict';
import AppConfig from '../common/config.js';
import FetchEx from '../util/fetchEx';

export function serviceSignIn(deviceId, mobile, password) {

  let formData = {
    "grant_type": AppConfig.GRANT_TYP_PASSWORD,
    "username": mobile,
    "password": password,
    "client_id": AppConfig.GRANT_CLIENT_ID,
    "device_uuid": deviceId
  };

  return FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postForm('oauth/token', formData))
}
