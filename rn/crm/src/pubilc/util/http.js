import DeviceInfo from 'react-native-device-info';
import {hideModal, ToastLong, ToastShort} from './ToastUtils';
import native from './native'
import {CommonActions} from '@react-navigation/native';
import AppConfig from "../common/config.js";
import tool from "./tool";
import stringEx from "./stringEx";
import {getTime} from "./TimeUtil";
import store from "./configureStore";
import dayjs from "dayjs";

const {SESSION_TOKEN_SUCCESS} = require('../../pubilc/common/constants').default;
/**
 * React-Native Fatch网络请求工具类
 * Fengtianhe create
 * params:请求参数
 * ES6 Promise 使用
 * resolve 成功时候返回
 * reject 失败时候返回
 */
// url 免反参校验名单
const authUrl = ['/oauth/token', '/check/send_blx_message_verify_code']

class HttpUtils {
  static urlFormat(url, params = {}) {
    let paramsArray = [];
    url = url[0] === '/' ? url.substring(1) : url
    url = AppConfig.apiUrl(url)
    //拼接参数
    Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))
    if (url.search(/\?/) === -1) {
      url += '?' + paramsArray.join('&')
    } else {
      url += '&' + paramsArray.join('&')
    }
    return url
  }

  static getOptions(method, params) {
    const options = {
      credential: "include", //带上cookie发送请求请求
      method: method,
      headers: {
        request_time: new Date().toISOString(),
        version: DeviceInfo.getVersion(),
        build_number: DeviceInfo.getBuildNumber(),
        device_id: DeviceInfo.getUniqueId(),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
    method === 'POST' || method === 'PUT' ? options.body = JSON.stringify(params) : null
    return options
  }

  static upLoadData = (error) => {
    const url = '/util/crm_error_report/1'
    const params = {
      APP_VERSION_CODE: DeviceInfo.getVersion(),
      CUSTOM_DATA: {
        'CURR-STORE': global.noLoginInfo.store_id,
        'UID': global.noLoginInfo.currentUser
      },
      BRAND: DeviceInfo.getBrand(),
      PHONE_MODEL: DeviceInfo.getModel(),
      STACK_TRACE: {
        error: error,
        noLoginInfo: global.noLoginInfo,
        currentRouteName: global.currentRouteName
      }
    };
    HttpUtils.post(url, params).then()
  }

  static apiBase(method, url, params, props = this, getNetworkDelay = false, getMoreInfo = false, showReason = true) {
    let uri = method === 'GET' || method === 'DELETE' ? this.urlFormat(url, params) : this.urlFormat(url, {})
    let options = this.getOptions(method, params)

    if (props && props.global) {
      const {vendor_id = 0, store_id = 0} = props.global
      if (store_id && vendor_id) {
        options.headers.store_id = store_id || global.noLoginInfo.store_id
        options.headers.vendor_id = vendor_id || global.noLoginInfo.currVendorId
        options.headers.vendorId = vendor_id || global.noLoginInfo.currVendorId
        if (uri.substr(tool.length(uri) - 1) !== '&') {
          uri += '&'
        }
        uri += `store_id=${store_id}&vendor_id=${vendor_id}`
      }
    }
    return new Promise((resolve, reject) => {
      const startTime = getTime()
      fetch(uri, options)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            hideModal()
            // reject({status: response.status})
          }
        })
        .then((response) => {
          if (authUrl.includes(url)) {
            resolve(response)
            return
          }
          if (response.ok) {
            if (getNetworkDelay) {
              const endTime = getTime();
              resolve({obj: response.obj, startTime: startTime, endTime: endTime, executeStatus: 'success'})
              return;
            }
            if (getMoreInfo) {
              resolve(response)
              return;
            }
            resolve(response.obj)
            return;
          }
          hideModal()
          this.upLoadData(response)
          if (showReason)
            this.error(response, method, url, params);
          if (getNetworkDelay) {
            const endTime = getTime();
            reject && reject({...response, startTime: startTime, endTime: endTime, executeStatus: 'error'})
            return;
          }
          reject && reject(response)
        })
        .catch((error) => {
          this.upLoadData(error.message)
          hideModal()
          ToastShort(`服务器错误:${stringEx.formatException(error.message)}`);
          if (getNetworkDelay) {
            const endTime = getTime();
            reject && reject({message: error.message, startTime: startTime, endTime: endTime, executeStatus: 'error'})
            return
          }
          reject && reject(error.message)
        })
    })
  }

  static requestUrl = (method, request_url, request_params, accessToken) => {
    const tokenIndex = request_url.indexOf('access_token=')
    if (tokenIndex !== -1) {
      request_url = request_url.substring(0, tokenIndex + 14) + accessToken
    }
    if (request_params && request_params.accessToken) {
      request_params.accessToken = accessToken
    }
    if (request_params && request_params.access_token) {
      request_params.access_token = accessToken
    }
    if (method === 'GET') {
      this.get(request_url, request_params)
        .then(res => {
        })
        .catch(error => {
        })
      return
    }
    if (method === 'POST') {
      this.post(request_url, request_params)
        .then(res => {
        })
        .catch(error => {
        })
    }
  }

  static refreshAccessToken = (method, request_url, request_params) => {
    const url = `/v4/WsbUser/refreshToken`
    if (global.noLoginInfo.refreshToken) {
      const params = {refresh_token: global.noLoginInfo.refreshToken}
      this.post(url, params).then(res => {
        const {access_token, refresh_token, expires_in: expires_in_ts} = res;
        store.dispatch({
          type: SESSION_TOKEN_SUCCESS,
          payload: {
            access_token: access_token,
            refresh_token: refresh_token,
            expires_in_ts: expires_in_ts,
            getTokenTs: dayjs().valueOf()
          }
        })
        this.requestUrl(method, request_url, request_params, access_token)
      })
    }
  }

  static error(response, method, url, params) {
    switch (response.error_code) {
      case 10001:
      case 21327:
        ToastLong('请确认信息是否正确，若不正确请重新操作')
        // this.logout(navigation)
        this.refreshAccessToken(method, url, params)
        break
      case 30001:
        ToastShort('客户端版本过低')
        break
      default:

        ToastLong(response.reason.toString())
        break
    }
  }

  static logout(navigation) {
    native.logout().then()
    if (navigation !== HttpUtils) {
      if (navigation != null) {
        const resetAction = CommonActions.reset({
          index: 0,
          routes: [
            {name: AppConfig.ROUTE_LOGIN}
          ]
        });
        navigation.dispatch(resetAction);
      } else {
        ToastShort("导航目标未知")
      }
    }
  }

  static get(url, params, getNetworkDelay = false, getMoreInfo = false, showReason = true) {
    const props = this
    return HttpUtils.apiBase('GET', url, params, props, getNetworkDelay, getMoreInfo, showReason)
  }

  static post(url, params, getNetworkDelay = false, getMoreInfo = false, showReason = true) {
    const props = this
    return HttpUtils.apiBase('POST', url, params, props, getNetworkDelay, getMoreInfo, showReason)
  }

  static put(url, params) {
    const props = this
    return HttpUtils.apiBase('PUT', url, params, props)
  }

  static delete(url, params) {
    const props = this
    return HttpUtils.apiBase('DELETE', url, params, props)
  }
}

export default HttpUtils
