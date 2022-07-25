import React, {PureComponent} from "react";
import {
  Alert,
  DeviceEventEmitter,
  LogBox,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

import {setDeviceInfo} from "./reducers/device/deviceActions";
import {setBleStarted, setCheckVersionAt} from "./reducers/global/globalActions";
import Config from "./pubilc/common/config";
import SplashScreen from "react-native-splash-screen";
import DeviceInfo from "react-native-device-info";
import JPush from 'jpush-react-native';
import {Provider} from "react-redux";
import HttpUtils from "./pubilc/util/http";
import GlobalUtil from "./pubilc/util/GlobalUtil";
import native from "./pubilc/util/native";
import configureStore from "./pubilc/util/configureStore";
import AppNavigator from "./pubilc/common/AppNavigator";
import {nrInit, nrRecordMetric} from './pubilc/util/NewRelicRN.js';
import * as RootNavigation from './RootNavigation.js';
import BleManager from "react-native-ble-manager";
import {print_order_to_bt} from "./pubilc/util/ble/OrderPrinter";
import {downloadApk} from "rn-app-upgrade";
import dayjs from "dayjs";

console.disableYellowBox = true // 关闭全部黄色警告

LogBox.ignoreLogs([
  'Warning: isMounted(...) is deprecated'
])

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statusBar: {
    height: Platform.OS === "ios" ? 20 : StatusBar.currentHeight,
    backgroundColor: "rgba(0, 0, 0, 0.20)"
  }
});

nrInit('Root');
Text.defaultProps = Object.assign({}, Text.defaultProps, {fontFamily: '', color: '#333'});


class RootScene extends PureComponent {
  constructor() {
    super();
    StatusBar.setBarStyle("light-content");

    this.state = {
      rehydrated: false,
      onGettingCommonCfg: false,
    };
    this.store = null;
  }

  componentDidMount() {
    JPush.init();
    //连接状态
    this.connectListener = result => {
      console.log("connectListener:" + JSON.stringify(result))
    };
    JPush.addConnectEventListener(this.connectListener);
    //通知回调
    this.notificationListener = result => {
      console.log("notificationListener:" + JSON.stringify(result))
    };
    JPush.addNotificationListener(this.notificationListener);
    //本地通知回调
    this.localNotificationListener = result => {
      console.log("localNotificationListener:" + JSON.stringify(result))
    };
    JPush.addLocalNotificationListener(this.localNotificationListener);
    //自定义消息回调
    this.customMessageListener = result => {
      console.log("customMessageListener:" + JSON.stringify(result))
    };
    // JPush.addCustomMessagegListener(this.customMessageListener);
    //tag alias事件回调
    this.tagAliasListener = result => {
      console.log("tagAliasListener:" + JSON.stringify(result))
    };
    JPush.addTagAliasListener(this.tagAliasListener);
    //手机号码事件回调
    this.mobileNumberListener = result => {
      console.log("mobileNumberListener:" + JSON.stringify(result))
    };
    JPush.addMobileNumberListener(this.mobileNumberListener);

    JPush.addConnectEventListener((connectEnable) => {
      console.log("connectEnable:" + connectEnable)
    })

    JPush.setLoggerEnable(true);
    JPush.getRegistrationID(result =>
      console.log("registerID:" + JSON.stringify(result))
    )

    if (this.ptListener) {
      this.ptListener.remove()
    }

    native.getAutoBluePrint((auto, isAutoBlePtMsg) => {
      this.setState({auto_blue_print: auto})
      if (!this.state.bleStarted) {
        BleManager.start({showAlert: false}).then();
        this.setState({bleStarted: true})
        this.store.dispatch(setBleStarted(true));
      }
    }).then()

    let {currentUser, lastCheckVersion = 0} = this.store.getState().global;
    //KEY_NEW_ORDER_NOT_PRINT_BT
    this.ptListener = DeviceEventEmitter.addListener(Config.Listener.KEY_PRINT_BT_ORDER_ID, (obj) => {
      const {printer_id, bleStarted} = this.store.getState().global
      if (printer_id) {

        if (!bleStarted) {
          BleManager.start({showAlert: false}).then();
          this.store.dispatch(setBleStarted(true));
        }

        setTimeout(() => {
          const state = this.store.getState();
          const clb = (msg, error) => {
            // noinspection JSIgnoredPromiseFromCall
            this.sendDeviceStatus(state, {...obj, btConnected: `打印结果:${msg}-${error || ''}`})
          };

          BleManager.retrieveServices(printer_id).then((peripheral) => {
            print_order_to_bt(state, peripheral, clb, obj.wm_id, false, 1);
          }).catch((error) => {

            //蓝牙尚未启动时，会导致App崩溃
            if (!bleStarted) {
              this.sendDeviceStatus(this.store.getState(), {...obj, btConnected: '蓝牙尚未启动'}).then()
              return;
            }

            //重新连接
            BleManager.connect(printer_id).then(() => {
              BleManager.retrieveServices(printer_id).then((peripheral) => {
                print_order_to_bt(state, peripheral, clb, obj.wm_id, false, 1);
              }).catch((error) => {
                //忽略第二次的结果
              })
            }).catch((error2) => {
              // noinspection JSIgnoredPromiseFromCall
              this.sendDeviceStatus(state, {...obj, btConnected: `已断开:error1-${error} error2-${error2}`})
              Alert.alert('提示', '无法自动打印: 打印机已断开连接', [{
                text: '确定', onPress: () => {
                  if (RootNavigation) {
                    RootNavigation.navigate(Config.ROUTE_PRINTERS)
                  }
                }
              }, {'text': '取消'}]);
            });
          });
        }, 300);
      } else {
        // noinspection JSIgnoredPromiseFromCall

        this.sendDeviceStatus(this.store.getState(), {...obj, btConnected: '未连接'})
        Alert.alert('提示', '无法自动打印: 尚未连接到打印机', [{
          text: '确定', onPress: () => {
            if (RootNavigation) {
              RootNavigation.navigate(Config.ROUTE_PRINTERS)
            }
          }
        }, {'text': '取消'}]);
      }
    })

    //KEY_NEW_ORDER_NOT_PRINT_BT
    this.ptListener = DeviceEventEmitter.addListener(Config.Listener.KEY_NEW_ORDER_NOT_PRINT_BT, (obj) => {
      const state = this.store.getState();
      this.sendDeviceStatus(state, obj).then()
    })


    this.doJPushSetAlias(currentUser, "RootScene-componentDidMount");
    const currentTs = dayjs(new Date()).unix();
    if (currentTs - lastCheckVersion > 8 * 3600 && Platform.OS !== 'ios') {
      this.store.dispatch(setCheckVersionAt(currentTs))
      this.checkVersion({global: this.store.getState().global});
    }
  }

  doJPushSetAlias = (currentUser, logDesc) => {
    if (currentUser) {
      const alias = `uid_${currentUser}`;
      JPush.setAlias({alias: alias, sequence: dayjs().unix()})
      JPush.isPushStopped((isStopped) => {

        if (isStopped) {
          JPush.resumePush();
        }
      })

    }
  }

  componentWillUnmount() {
    if (this.ptListener != null) {
      this.ptListener.remove();
    }
    this.ptListener = null;
  }

  UNSAFE_componentWillMount() {
    //const launchProps = this.props.launchProps;

    const current_ms = dayjs().valueOf();

    this.store = configureStore(
      function (store) {
        // const {access_token, currStoreId, userProfile} = launchProps;
        //
        // const {last_get_cfg_ts, currentUser} = this.store.getState().global;
        // if (access_token) {
        //   store.dispatch(setAccessToken({access_token}));
        //   store.dispatch(setPlatform("android"));
        //   store.dispatch(setUserProfile(userProfile));
        //   store.dispatch(setCurrentStore(currStoreId));
        //
        //   if (this.common_state_expired(last_get_cfg_ts) && !this.state.onGettingCommonCfg) {
        //     console.log("get common config");
        //     this.setState({onGettingCommonCfg: true})
        //     store.dispatch(getCommonConfig(access_token, currStoreId, (ok, msg) => {
        //       this.setState({onGettingCommonCfg: false})
        //     }));
        //   }
        // }
        //
        // this.doJPushSetAlias(currentUser, "afterConfigureStore")
        GlobalUtil.setHostPortNoDef(this.store.getState().global, native).then()

        this.setState({rehydrated: true});
        this.passed_ms = dayjs().valueOf() - current_ms;
        console.log('耗时：', this.passed_ms)
        // nrRecordMetric("restore_redux", {time: passed_ms, currStoreId, currentUser})
        GlobalUtil.getDeviceInfo().then(deviceInfo => {
          store.dispatch(setDeviceInfo(deviceInfo))
        })

      }.bind(this)
    );
  }

  /**
   Map<String, Object> deviceStatus = Maps.newHashMap();
   deviceStatus.put("acceptNotifyNew", acceptNotifyNew); //是否接受新订单通知
   deviceStatus.put("disable_new_order_sound_notify", allConfig.get("disable_new_order_sound_notify")); //新订单声音通知

   deviceStatus.put("orderId", orderId); //订单ID
   deviceStatus.put("msgId", msgId); //推送消息ID

   deviceStatus.put("listener_stores", allConfig.get("listener_stores")); //当前所在门店
   deviceStatus.put("auto_print", SettingUtility.getAutoPrintSetting()); //是否开启蓝牙自动打印
   deviceStatus.put("disable_sound_notify", allConfig.get("disable_sound_notify"));  //开启语音播报
   // 以下为新增
   // 设备ID：显示设备ID
   // 设备品牌：显示具体的手机型号信息
   // 系统通知权限是否开启：开启/未开启
   // 设备音量大小：静音/正常
   // 后台运行是否开启：开启/未开启
   // 省电模式：开启/未开启
   // [已重复] 语音播报是否开启：开启/未开启 (disable_sound_notify)
   // [已重复] 新订单通知：开启/未开启
   * @param props
   * @param data
   * @returns {Promise<void>}
   */

   sendDeviceStatus(props, data) {

    //系统通知
    JPush.isNotificationEnabled((enabled) => {
      native.getSettings((ok, settings, msg) => {
        //品牌 设备id
        data.notificationEnabled = enabled
        data.brand = DeviceInfo.getBrand();
        data.UniqueID = DeviceInfo.getUniqueId()
        data.Appversion = DeviceInfo.getBuildNumber()
        data.disable_new_order_sound_notify = settings.disableNewOrderSoundNotify;
        data.disable_sound_notify = settings.disabledSoundNotify;
        data.auto_print = settings.autoPrint;
        data.Volume = settings.currentSoundVolume > 0
        data.isRun = settings.isRunInBg;
        data.isRinger = settings.isRinger;
        const {accessToken} = props.global
        HttpUtils.post.bind(props)(`/api/log_push_status/?access_token=${accessToken}`, data).then(res => {
        }, (res) => {

        })
      }).then()
    })

  }

  render() {
    const {launchProps} = this.props;
    const {orderId, backPage, currStoreId} = launchProps;
    let initialRouteName = launchProps["_action"];
    if (!!backPage) {
      launchProps["_action_params"]["backPage"] = backPage;
    }
    let initialRouteParams = launchProps["_action_params"] || {};

    let {accessToken, currentUser} = this.store.getState().global;
    SplashScreen.hide();
    if (!accessToken) {
      // showError("请您先登录")

      initialRouteName = Config.ROUTE_LOGIN;
      initialRouteParams = {next: "", nextParams: {}};
    } else {
      if (!initialRouteName) {
        if (orderId) {
          initialRouteName = Config.ROUTE_ORDER;
          initialRouteParams = {orderId};
        } else {
          initialRouteName = "Tab";
        }
      }
    }
    nrRecordMetric("restore_redux", {time: this.passed_ms, currStoreId, currentUser})
    // on Android, the URI prefix typically contains a host in addition to scheme
    //const prefix = Platform.OS === "android" ? "blx-crm://blx/" : "blx-crm://";
    let rootView = (
      <Provider store={this.store}>

        <View style={styles.container}>
          <View style={Platform.OS === 'ios' ? [] : [styles.statusBar]}>
            <StatusBar backgroundColor={"transparent"} translucent/>
          </View>
          <AppNavigator initialRouteName={initialRouteName} initialRouteParams={initialRouteParams}/>
        </View>

      </Provider>
    )
    if (Platform.OS === 'ios') {
      rootView = (
        <SafeAreaView style={{flex: 1, backgroundColor: '#4a4a4a'}}>
          {rootView}
        </SafeAreaView>
      )
    }
    return this.state.rehydrated ? rootView : <View/>
  }

  // common_state_expired(last_get_cfg_ts) {
  //   let current_time = dayjs(new Date()).unix();
  //   return current_time - last_get_cfg_ts > Config.STORE_VENDOR_CACHE_TS;
  // }

  checkVersion(props) {
    HttpUtils.get.bind(props)('/api/check_version', {r: DeviceInfo.getBuildNumber()}).then(res => {
      if (res.yes) {
        Alert.alert('新版本提示', res.desc, [
          {text: '稍等再说', style: 'cancel'},
          {
            text: '现在更新', onPress: () => {
              //console.log("start to download_url:", res.download_url)
              downloadApk({
                interval: 250, // listen to upload progress event, emit every 666ms
                apkUrl: res.download_url,
                downloadInstall: true,
                callback: {
                  onProgress: (received, total, percent) => {
                    console.log(received, percent, 'success')
                  },
                  onFailure: (errorMessage, statusCode) => {
                    console.log(errorMessage, statusCode, 'error')
                  },
                  onComplete() {
                  }
                }
              }).then();
            }
          },
        ])
      }
    })
  }
}

export default RootScene;
