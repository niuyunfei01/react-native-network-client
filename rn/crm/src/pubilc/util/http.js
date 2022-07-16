import DeviceInfo from 'react-native-device-info';
import {ToastLong, ToastShort} from './ToastUtils';
import native from './native'
import {CommonActions} from '@react-navigation/native';
import AppConfig from "../common/config.js";
import tool from "./tool";
import stringEx from "./stringEx";
import {getTime} from "./TimeUtil";

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

  static getOptions(method, params) {
    const options = {
      method: method,
      headers: {
        request_time: new Date().toISOString(),
        version: DeviceInfo.getVersion(),
        build_number: DeviceInfo.getBuildNumber(),
        device_id: DeviceInfo.getUniqueId(),
        store_id: 0,
        vendor_id: 0,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
    method === 'POST' || method === 'PUT' ? options.body = JSON.stringify(params) : null
    return options
  }

  static apiBase(method, url, params, props = this, getNetworkDelay = false) {
    let store = {};
    let uri = method === 'GET' || method === 'DELETE' ? this.urlFormat(url, params) : this.urlFormat(url, {})
    let options = this.getOptions(method, params)

    if (props && props.global) {
      store = tool.store(props.global)
      const {currVendorId = 0} = tool.vendor(props.global)

      if (store && currVendorId) {
        options.headers.store_id = store.id
        options.headers.vendor_id = currVendorId

        if (uri.substr(uri.length - 1) !== '&') {
          uri += '&'
        }
        uri += `store_id=${store.id}&vendor_id=${currVendorId}`
      }
    }
    return new Promise((resolve, reject) => {
      const startTime = getTime()
      fetch(uri, options)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            // reject({status: response.status})
          }
        })
        .then((response) => {
          if (authUrl.includes(url)) {
            resolve(response)
          } else {
            if (response.ok) {
              if (getNetworkDelay) {
                const endTime = getTime();
                resolve({obj: response.obj, startTime: startTime, endTime: endTime, executeStatus: 'success'})
              } else resolve(response.obj)
            } else {
              this.error(response, props.navigation);
              if (getNetworkDelay) {
                const endTime = getTime();
                reject && reject({...response, startTime: startTime, endTime: endTime, executeStatus: 'error'})
              } else reject && reject(response)
            }
          }
        })
        .catch((error) => {

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

  static error(response, navigation) {
    if (response.error_code === 10001) {
      ToastShort('登录信息过期,请重新登录')
      this.logout(navigation)
    } else if (response.error_code === 21327) {
      ToastShort('登录信息过期,请退出重新登录')
      this.logout(navigation)
    } else if (response.error_code === 30001) {
      ToastShort('客户端版本过低')
    } else {
      let text = response.reason.toString()
      // native.speakText(text)

      ToastLong(text)
    }
  }

  static logout(navigation) {
    native.logout().then(r => {})
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

  static get(url, params, getNetworkDelay = false) {
    const props = this
    return HttpUtils.apiBase('GET', url, params, props, getNetworkDelay)
  }

  static post(url, params, getNetworkDelay = false) {
    const props = this
    return HttpUtils.apiBase('POST', url, params, props, getNetworkDelay)
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
