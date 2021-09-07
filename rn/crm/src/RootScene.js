import React, {PureComponent} from "react";
import {
  Alert,
  DeviceEventEmitter, LogBox,
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  View
} from "react-native";
import JPush from 'jpush-react-native';

import {Provider} from "react-redux";
/**
 * ## Actions
 *  The necessary actions for dispatching our bootstrap values
 */
import {setPlatform} from "./reducers/device/deviceActions";
import {
  getCommonConfig,
  setAccessToken,
  setCheckVersionAt,
  setCurrentStore,
  setUserProfile
} from "./reducers/global/globalActions";

import configureStore from "./common/configureStore";
import AppNavigator from "./common/AppNavigator";
import Config from "./config";
import C from "./config";
import SplashScreen from "react-native-splash-screen";
import Moment from "moment/moment";
import DeviceInfo from "react-native-device-info";
import HttpUtils from "./util/http";
import GlobalUtil from "./util/GlobalUtil";
import {native} from "./common";
import {nrInit, nrRecordMetric} from './NewRelicRN.js';
import * as RootNavigation from './RootNavigation.js';
import BleManager from "react-native-ble-manager";
import {print_order_to_bt} from "./util/ble/OrderPrinter";

LogBox.ignoreLogs([
  'Warning: isMounted(...) is deprecated'
])

function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
}

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

class RootScene extends PureComponent<{}> {
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

    JPush.addConnectEventListener( (connectEnable) => {
      console.log("connectEnable:" + connectEnable)
    })

    JPush.setLoggerEnable(true);
    JPush.getRegistrationID(result =>
        console.log("registerID:" + JSON.stringify(result))
    )

    if (this.ptListener) {
      this.ptListener.remove()
    }

    const {currentUser} = this.store.getState().global;
    this.ptListener = DeviceEventEmitter.addListener(C.Listener.KEY_PRINT_BT_ORDER_ID, (obj) => {
      const {printer_id} =  this.store.getState().global
      if (printer_id) {
        setTimeout(() => {
          const state = this.store.getState();
          const clb = (msg, error) => {
            console.log("auto-print callback:", msg, error)
            // noinspection JSIgnoredPromiseFromCall
            GlobalUtil.sendDeviceStatus(state, {...obj, btConnected: `打印结果:${msg}-${error || ''}`})
          };
          BleManager.retrieveServices(printer_id).then((peripheral) => {
            print_order_to_bt(state, peripheral, clb, obj.wm_id);
          }).catch((error) => {
            //重新连接
            BleManager.connect(printer_id).then(() => {
              BleManager.retrieveServices(printer_id).then((peripheral) => {
                print_order_to_bt(state, peripheral, clb, obj.wm_id);
              }).catch((error) => {
                //忽略第二次的结果
              })
            }).catch((error2) => {
              // noinspection JSIgnoredPromiseFromCall
              GlobalUtil.sendDeviceStatus(state, {...obj, btConnected: `已断开:error1-${error} error2-${error2}`})
              Alert.alert('提示', '无法自动打印: 打印机已断开连接',[{text:'确定', onPress:()=>{
                  RootNavigation.navigate(Config.ROUTE_PRINTERS)
                }}, {'text': '取消'}]);
            });
          });
        }, 300);
      } else {
        // noinspection JSIgnoredPromiseFromCall
        GlobalUtil.sendDeviceStatus(this.store.getState(), {...obj, btConnected: '未连接'})
        Alert.alert('提示', '无法自动打印: 尚未连接到打印机',[{text:'确定', onPress:()=>{
            RootNavigation.navigate(Config.ROUTE_PRINTERS)
          }}, {'text': '取消'}]);
      }
    })

    this.doJPushSetAlias(currentUser, "RootScene-componentDidMount");
  }

  doJPushSetAlias = (currentUser, logDesc) => {
    if (currentUser) {
      const alias = `uid_${currentUser}`;
      JPush.setAlias({alias: alias, sequence: Moment().unix()})
      JPush.isPushStopped((isStopped) => {
        console.log(`JPush is stopped: ${isStopped}`)
        if (isStopped) {
          JPush.resumePush();
        }
      })
      console.log(`${logDesc} setAlias ${alias}`)
    }
  }

  componentWillUnmount() {
    if (this.ptListener != null) {
      this.ptListener.remove();
    }
    this.ptListener = null;
  }

  UNSAFE_componentWillMount() {
    const launchProps = this.props.launchProps;

    const current_ms = Moment().valueOf();

    this.store = configureStore(
      function (store) {
        const {
          access_token,
          currStoreId,
          userProfile,
        } = launchProps;

        const {last_get_cfg_ts, currentUser} = this.store.getState().global;
        if (access_token) {
          store.dispatch(setAccessToken({access_token}));
          store.dispatch(setPlatform("android"));
          store.dispatch(setUserProfile(userProfile));
          store.dispatch(setCurrentStore(currStoreId));

          if (this.common_state_expired(last_get_cfg_ts)
            && !this.state.onGettingCommonCfg) {
            console.log("get common config");
            this.setState({onGettingCommonCfg: true})
            store.dispatch(getCommonConfig(access_token, currStoreId, (ok, msg) => {
              this.setState({onGettingCommonCfg: false})
            }));
          }
        }

        this.doJPushSetAlias(currentUser, "afterConfigureStore")
        GlobalUtil.setHostPortNoDef(this.store.getState().global, native, () => {
        }).then(r => {
        })

        this.setState({rehydrated: true});
        const passed_ms = Moment().valueOf()-current_ms;
        nrRecordMetric("restore_redux", {time: passed_ms, currStoreId, currentUser})
      }.bind(this)
    );
  }

  render() {
    const launchProps = this.props.launchProps;
    const orderId = launchProps["order_id"];
    let backPage = launchProps["backPage"];
    let initialRouteName = launchProps["_action"];
    if (!!backPage) {
      launchProps["_action_params"]["backPage"] = backPage;
    }
    let initialRouteParams = launchProps["_action_params"] || {};

    if (this.state.rehydrated) {
      SplashScreen.hide();

      let {accessToken, currStoreId, lastCheckVersion = 0} = this.store.getState().global;

      const currentTs = Moment(new Date()).unix();
      console.log('currentTs', currentTs, 'lastCheck', lastCheckVersion);

      if (currentTs - lastCheckVersion > 8 * 3600) {
        this.store.dispatch(setCheckVersionAt(currentTs))
        this.checkVersion({global: this.store.getState().global});
      }

      if (!this.store.getState().global.accessToken) {
        ToastAndroid.showWithGravity(
          "请您先登录",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
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

      console.log("initialRouteName: " + initialRouteName + ", initialRouteParams: ", initialRouteParams);

      const {last_get_cfg_ts} = this.store.getState().global;
      if (this.common_state_expired(last_get_cfg_ts)) {
        this.store.dispatch(
          getCommonConfig(accessToken, currStoreId, (ok, msg) => {
          })
        );
      }
    }

    JPush.isNotificationEnabled((enabled) => {
      console.log("JPush-is-notification enabled:", enabled)
    })

    // on Android, the URI prefix typically contains a host in addition to scheme
    const prefix = Platform.OS === "android" ? "blx-crm://blx/" : "blx-crm://";
    return !this.state.rehydrated ? (
      <View/>
    ) : (
      <Provider store={this.store}>
        <View style={styles.container}>
          <View style={styles.statusBar}>
            <StatusBar backgroundColor={"transparent"} translucent/>
          </View>
          <AppNavigator
            uriPrefix={prefix}
            store_={this.store}
            initialRouteName={initialRouteName}
            initialRouteParams={initialRouteParams}
            onNavigationStateChange={(prevState, currentState) => {
              const currentScene = getCurrentRouteName(currentState);
              const previousScene = getCurrentRouteName(prevState);
              if (previousScene !== currentScene) {
                // if (lightContentScenes.indexOf(currentScene) >= 0) {
                //   StatusBar.setBarStyle("light-content");
                // } else {
                //   StatusBar.setBarStyle("dark-content");
                // }
              }
            }}
          />
        </View>
      </Provider>
    );
  }

  common_state_expired(last_get_cfg_ts) {
    let current_time = Moment(new Date()).unix();
    return current_time - last_get_cfg_ts > Config.STORE_VENDOR_CACHE_TS;
  }

  checkVersion(props) {
    HttpUtils.get.bind(props)('/api/check_version', {r: DeviceInfo.getBuildNumber()}).then(res => {
      if (res.yes) {
        Alert.alert('新版本提示', res.desc, [
          {text: '稍等再说', style: 'cancel'},
          {text: '现在更新', onPress: () => {
              console.log("start to download_url:", res.download_url)
              NativeModules.upgrade.upgrade(res.download_url)
              DeviceEventEmitter.addListener('LOAD_PROGRESS', (pro) => {
                console.log("progress", pro)
              })
            }
          },
        ])
      }
    })
  }
}

export default RootScene;
