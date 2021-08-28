/**
 * 操作全局 global 的方法集合在这里，其他地方只能读取，不能修改
 */
import StorageUtil from "./StorageUtil";
import native from "../common/native";
import {Alert} from 'react-native'
import {getDeviceUUID} from "../reducers/global/globalActions";
import HttpUtils from "./http";

global.hostPort = '';

// 'cover_image', 'remark', 'sex', 'mobilephone', 'id', 'screen_name', 'name', 'province', 'city'
// 'location', 'description', 'total_trade_num', 'prefer_store'
global.user = null

export default class GlobalUtil {
  /**
   *
   * @param hostPort  Host[:Port] without tail '/' and head '//'
   */
  static setHostPort (hostPort) {
    if (!hostPort) {
      return;
    }
    global.hostPort = hostPort;
  }

  static getHostPort() {
    return global.hostPort;
  }

  /**
   * 启动时调用此方法更新全局host设置
   *
   * TODO: 以后需要将是否使用与发布的设置放在 RN 里，则可直接修改全局 global。
   * @param global global reducer
   * @param native
   * @param callback execute when done getting from native
   */
  static async setHostPortNoDef (global, native, callback) {
    if (global.host) {
      this.setHostPort(global.host);
    }
    native.host((host) => {
      if (host) {
        this.setHostPort(host);
        callback();
      }
    });
  }

  static async getUser () {
    const _this = this
    return new Promise((resolve, reject) => {
      if (global.user && Object.keys(global.user).length) {
        console.log('user info from global => ', global.user)
        resolve && resolve(global.user)
      } else {
        StorageUtil._get('user').then(user => {
          if (user && Object.keys(user).length) {
            console.log('user info from storage => ', user)
            _this.setUser(user)
            resolve && resolve(user)
          } else {
            if (reject) {
              reject()
            } else {
              Alert('错误', '获取用户信息失败，请重新登录', [{
                text: '确定',
                onPress: () => {
                  native.logout()
                  native.gotoLoginWithNoHistory()
                }
              }])
            }
          }
        }).catch(e => {
          if (reject) {
            reject()
          } else {
            Alert('错误', '获取用户信息失败，请重新登录', [{
              text: '确定',
              onPress: () => {
                native.logout()
                native.gotoLoginWithNoHistory()
              }
            }])
          }
        })
      }
    })
  }

  static async setUser (user) {
    global.user = user
    StorageUtil._set('user', user)
  }

  static async sendDeviceStatus(props, data) {
    const {accessToken} = props.global
    HttpUtils.post.bind(props)(`/api/log_push_status/?access_token=${accessToken}`, data).then(res => {
    }, (res) => {
    })
  }
}

