import DeviceInfo from 'react-native-device-info';
import {ToastShort} from './ToastUtils';
import native from '../common/native'
import {NavigationActions} from 'react-navigation'
import AppConfig from "../config.js";
import {tool} from "../common";

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
  static urlFormat (url, params = {}) {
    let paramsArray = [];
    url = url[0] == '/' ? url.substring(1) : url
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
    const options = {
      method: method,
      headers: {
        request_time: new Date().toISOString(),
        version: DeviceInfo.getVersion(),
        build_number: DeviceInfo.getBuildNumber(),
        store_id: 0,
        vendor_id: 0,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
    method === 'POST' || method === 'PUT' ? options.body = JSON.stringify(params) : null
    return options
  }
  
  static apiBase (method, url, params, props) {
    let store = {}, vendor = {}
    let uri = method === 'GET' || method === 'DELETE' ? this.urlFormat(url, params) : this.urlFormat(url, {})
    let options = this.getOptions(method, params)
    
    if (props && props.global) {
      store = tool.store(props.global)
      vendor = tool.vendor(props.global)
  
      if (store && vendor) {
        options.headers.store_id = store.id
        options.headers.vendor_id = vendor.currVendorId
    
        if (uri.substr(uri.length - 1) != '&') {
          uri += '&'
        }
        uri += `store_id=${store.id}&vendor_id=${vendor.currVendorId}`
      }
    }
    
    return new Promise((resolve, reject) => {
      fetch(uri, options)
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
              this.error(response, props.navigation)
              reject && reject(response)
            }
          }
        })
        .catch((error) => {
          ToastShort(`服务器错误:${error.message}`)
          console.log('http error => ', error.message)
          console.log('uri => ', uri)
          reject && reject(error.message)
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
      let text = response.reason.toString()
      native.speakText(text)
      ToastShort(text)
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
    const props = this
    return HttpUtils.apiBase('GET', url, params, props)
  }
  
  static post (url, params) {
    const props = this
    return HttpUtils.apiBase('POST', url, params, props)
  }
  
  static put (url, params) {
    const props = this
    return HttpUtils.apiBase('PUT', url, params, props)
  }
  
  static delete (url, params) {
    const props = this
    return HttpUtils.apiBase('DELETE', url, params, props)
  }
}

export default HttpUtils