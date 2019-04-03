import DeviceInfo from 'react-native-device-info';
import {Toast} from 'antd-mobile-rn'
import {ToastShort} from './ToastUtils';
import native from '../common/native'
import {NavigationActions} from 'react-navigation'
/**
 * React-Native Fatch网络请求工具类
 * Fengtianhe create
 * params:请求参数
 * ES6 Promise 使用
 * resolve 成功时候返回
 * reject 失败时候返回
 */

import AppConfig from "../config.js";
// url 免反参校验名单
const authUrl = ['/oauth/token', '/check/send_blx_message_verify_code']

class HttpUtils {
  static urlFormat (url, params = {}) {
    let paramsArray = [];
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
  
  static getOptions (method, params) {
    return method === 'POST' || method === 'PUT' ? {
      method: method,
      headers: {
        requestTime: new Date().toISOString(),
        version: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    } : {
      method: method,
      headers: {
        requestTime: new Date().toISOString(),
        version: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  }
  
  static apiBase (method, url, params, navigation) {
    // Toast.loading('请求中', 0)
    return new Promise((resolve, reject) => {
      fetch(method === 'GET' || method === 'DELETE' ? this.urlFormat(url, params) : this.urlFormat(url, {}), this.getOptions(method, params))
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            console.log(response.statusText)
            // reject({status: response.status})
          }
        })
        .then((response) => {
          // Toast.hide()
          if (authUrl.includes(url)) {
            resolve(response)
          } else {
            if (response.ok) {
              resolve(response.obj)
            } else {
              this.error(response)
              reject && reject(response)
            }
          }
        })
        .catch((error) => {
          // Toast.hide()
          ToastShort('服务器错误')
          console.log('http error => ', error.message)
          reject(error.message)
        })
    })
  }
  
  static error (response, navigation) {
    if (response.error_code === 10001) {
      ToastShort('权限错误')
    } else if (response.error_code === 21327) {
      ToastShort('登录信息过期,请退出重新登录')
      this.logout(navigation)
    } else if (response.error_code === 30001) {
      ToastShort('客户端版本过低')
    } else {
      ToastShort(response.reason.toString())
    }
  }
  
  static logout (navigation) {
    native.logout()
    if (navigation !== HttpUtils) {
      const resetAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName: AppConfig.ROUTE_LOGIN})],
      });
      navigation.dispatch(resetAction);
    }
  }
  
  static get (url, params) {
    const navigation = this
    return HttpUtils.apiBase('GET', url, params, navigation)
  }
  
  static post (url, params) {
    const navigation = this
    return HttpUtils.apiBase('POST', url, params, navigation)
  }
  
  static put (url, params) {
    const navigation = this
    return HttpUtils.apiBase('PUT', url, params, navigation)
  }
  
  static delete (url, params) {
    const navigation = this
    return HttpUtils.apiBase('DELETE', url, params, navigation)
  }
}

export default HttpUtils