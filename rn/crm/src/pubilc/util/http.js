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
import {nrRecordMetric} from "./NewRelicRN";
import JbbAlert from "../component/JbbAlert";

const {SESSION_TOKEN_SUCCESS, LOGOUT_SUCCESS} = require('../../pubilc/common/constants').default;
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
let isRefrshToken = false, isLogout = false, handleList = []

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

  static upLoadData = (error, uri = '', url = '', options = {}, params = {}, method = '') => {
    const noLoginInfo = global.noLoginInfo
    if (noLoginInfo.accessToken)
      noLoginInfo.accessToken = '存在token'
    if (noLoginInfo.refreshToken)
      noLoginInfo.refreshToken = '存在refreshToken'
    const report_params = {
      app_version: DeviceInfo.getVersion(),
      brand: DeviceInfo.getBrand(),
      phone_mode: DeviceInfo.getModel(),
      error: error,
      options: options,
      url: url,
      params: params,
      method: method,
      noLoginInfo: noLoginInfo,
      currentRouteName: global.currentRouteName
    };
    nrRecordMetric('app_url_request', report_params)
  }

  static apiBase(method, url, params, props = this, getNetworkDelay = false, getMoreInfo = false, showReason = true) {
    let uri = method === 'GET' || method === 'DELETE' ? this.urlFormat(url, params) : this.urlFormat(url, {})
    let options = this.getOptions(method, params)
    if (props && props.global) {
      const {vendor_id = 0, store_id = 0} = props.global
      const storeId = Number(store_id) || global.noLoginInfo.store_id
      const vendorId = Number(vendor_id) || global.noLoginInfo.vendor_id
      options.headers.store_id = storeId
      options.headers.vendor_id = vendorId
      options.headers.vendorId = vendorId
      if (uri.substr(tool.length(uri) - 1) !== '&') {
        uri += '&'
      }
      uri += `store_id=${storeId}&vendor_id=${vendorId}`
    }

    const index_not_defined = uri.indexOf('access_token=undefined')
    if (index_not_defined !== -1) {
      uri = uri.substring(0, index_not_defined) + `access_token=${global.noLoginInfo.accessToken}` + uri.substring(index_not_defined + 22)
    }
    const index_empty = uri.indexOf(`access_token=&`)
    if (index_empty !== -1) {
      uri = uri.substring(0, index_empty) + `access_token=${global.noLoginInfo.accessToken}&` + uri.substring(index_empty + 14)
    }

    if ((dayjs().valueOf() - global.noLoginInfo.getTokenTs < 24 * 60 * 60 * 1000) && !isRefrshToken) {
      isRefrshToken = true
      this.refreshAccessToken()
    }
    const sameHandle = handleList.find(
      (item) => {
        return item.uri === uri && JSON.stringify(item.body) === JSON.stringify(options?.body)
      }
    )
    if (sameHandle) {
      // 遇到相同请求直接返回之前请求的promise
      return sameHandle.handle
    }

    const handle = new Promise((resolve, reject) => {
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

          this.upLoadData(response, uri, url, options, params, method)
          if (showReason)
            this.error(response, props.navigation);
          if (getNetworkDelay) {
            const endTime = getTime();
            reject && reject({...response, startTime: startTime, endTime: endTime, executeStatus: 'error'})
            return;
          }
          reject && reject(response)
        })
        .catch((error) => {
          this.upLoadData(error.message, uri, url, options, params, method)
          hideModal()
          ToastShort(`服务器错误:${stringEx.formatException(error.message)}`);
          if (getNetworkDelay) {
            const endTime = getTime();
            reject && reject({message: error.message, startTime: startTime, endTime: endTime, executeStatus: 'error'})
            return
          }
          reject && reject(error.message)
        }).finally(() => {
        // 无论请求结果如果，都需要把对应的请求移除掉
        handleList = handleList.filter(
          (item) =>
            item.url !== url && JSON.stringify(item.body) !== JSON.stringify(options?.body)
        )
      })
    })
    handleList.push({uri, body: options?.body, handle})
    return handle
  }

  static refreshAccessToken = () => {

    if (global.noLoginInfo.refreshToken) {
      const url = `/v4/WsbUser/refreshToken`
      const params = {refresh_token: global.noLoginInfo.refreshToken}
      isRefrshToken = true
      this.post(url, params).then(res => {
        const {access_token, refresh_token, expires_in} = res;
        const getTokenTs = dayjs().valueOf()
        store.dispatch({
          type: SESSION_TOKEN_SUCCESS,
          payload: {
            access_token: access_token,
            refresh_token: refresh_token,
            expires_in_ts: expires_in,
            getTokenTs: getTokenTs
          }
        })
        global.noLoginInfo.getTokenTs = getTokenTs
        isRefrshToken = false
      })
    }
  }

  static error({error_code, reason = ''}, navigation) {

    switch (parseInt(error_code)) {
      case 10001:
      case 21327:
        this.logout(navigation)
        break
      case 30001:
        ToastShort('客户端版本过低')
        break
      default:

        ToastLong(reason)
        break
    }
  }

  static resetLogin = (navigation) => {
    if (isLogout)
      return
    isLogout = true
    JbbAlert.show({
      title: '提醒',
      desc: '登录信息过期，请重新登录',
      actionText: '确定',
      onPress: () => {
        const resetAction = CommonActions.reset({
          index: 0,
          routes: [
            {name: AppConfig.ROUTE_LOGIN}
          ]
        });
        navigation.dispatch(resetAction);
        store.dispatch({type: LOGOUT_SUCCESS})
        isLogout = false
      },
    })

  }

  static logout(navigation) {
    native.logout().then()

    if (navigation !== HttpUtils) {
      if (navigation) {
        this.resetLogin(navigation)
        return
      }
      if (global.navigation) {
        this.resetLogin(global.navigation)
        return;
      }
      ToastShort("导航目标未知")
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
