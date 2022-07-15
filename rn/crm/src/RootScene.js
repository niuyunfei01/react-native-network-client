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

import {setPlatform} from "./reducers/device/deviceActions";
import {
  getCommonConfig,
  setAccessToken,
  setBleStarted,
  setCheckVersionAt,
  setCurrentStore,
  setUserProfile
} from "./reducers/global/globalActions";
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

    if (this.ptListener) {
      this.ptListener.remove()
    }

    native.getAutoBluePrint((auto, isAutoBlePtMsg) => {
      this.setState({auto_blue_print: auto})
      if (!this.state.bleStarted) {
        BleManager.start({showAlert: false}).then(() => {
          console.log("done ble start")
        });
        this.setState({bleStarted: true})
        this.store.dispatch(setBleStarted(true));
      }
      console.log("got ble auto print:" + auto + " msg:" + isAutoBlePtMsg)
    })


    //KEY_NEW_ORDER_NOT_PRINT_BT
    this.ptListener = DeviceEventEmitter.addListener(Config.Listener.KEY_PRINT_BT_ORDER_ID, (obj) => {
      const {printer_id, bleStarted} = this.store.getState().global
      if (printer_id) {

        if (!bleStarted) {
          BleManager.start({showAlert: false}).then(() => {
            console.log("done ble start")
          });
          this.store.dispatch(setBleStarted(true));
        }

        setTimeout(() => {
          const state = this.store.getState();
          const clb = (msg, error) => {
            console.log("auto-print callback:", msg, error)
            // noinspection JSIgnoredPromiseFromCall
            GlobalUtil.sendDeviceStatus(state, {...obj, btConnected: `打印结果:${msg}-${error || ''}`})
          };

          BleManager.retrieveServices(printer_id).then((peripheral) => {
            print_order_to_bt(state, peripheral, clb, obj.wm_id, false, 1);
          }).catch((error) => {
            //蓝牙尚未启动时，会导致App崩溃
            if (!bleStarted) {
              GlobalUtil.sendDeviceStatus(this.store.getState(), {...obj, btConnected: '蓝牙尚未启动'})
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
              GlobalUtil.sendDeviceStatus(state, {...obj, btConnected: `已断开:error1-${error} error2-${error2}`})
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
        GlobalUtil.sendDeviceStatus(this.store.getState(), {...obj, btConnected: '未连接'})
        Alert.alert('提示', '无法自动打印: 尚未连接到打印机', [{
          text: '确定', onPress: () => {
            if (RootNavigation) {
              RootNavigation.navigate(Config.ROUTE_PRINTERS)
            }
          }
        }, {'text': '取消'}]);
      }
    })

    const {currentUser} = this.store.getState().global;
    //KEY_NEW_ORDER_NOT_PRINT_BT
    this.ptListener = DeviceEventEmitter.addListener(Config.Listener.KEY_NEW_ORDER_NOT_PRINT_BT, (obj) => {
      const state = this.store.getState();
      GlobalUtil.sendDeviceStatus(state, obj)
    })
    this.doJPushSetAlias(currentUser, "RootScene-componentDidMount");
  }

  doJPushSetAlias = (currentUser, logDesc) => {
    if (currentUser) {
      const alias = `uid_${currentUser}`;
      JPush.setAlias({alias: alias, sequence: dayjs().unix()})
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

    const current_ms = dayjs().valueOf();

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
        const passed_ms = dayjs().valueOf() - current_ms;
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

      if (!this.store.getState().global.accessToken) {
        // showError("请您先登录")

        initialRouteName = Config.ROUTE_LOGIN;
        initialRouteParams = {next: "", nextParams: {}};
      } else {

        const currentTs = dayjs(new Date()).unix();
        console.log('currentTs', currentTs, 'lastCheck', lastCheckVersion);
        if (currentTs - lastCheckVersion > 8 * 3600 && Platform.OS !== 'ios') {
          this.store.dispatch(setCheckVersionAt(currentTs))
          this.checkVersion({global: this.store.getState().global});
        }

        if (!initialRouteName) {
          if (orderId) {
            initialRouteName = Config.ROUTE_ORDER;
            initialRouteParams = {orderId};
          } else {
            initialRouteName = "Tab";
          }
        }
      }

      console.log(`initialRouteName: ${initialRouteName}, initialRouteParams: `, initialRouteParams);

      const {last_get_cfg_ts} = this.store.getState().global;
      if (this.common_state_expired(last_get_cfg_ts) && accessToken) {
        this.store.dispatch(
          getCommonConfig(accessToken, currStoreId, (ok, msg) => {
          })
        );
      }
    }

    // on Android, the URI prefix typically contains a host in addition to scheme
    const prefix = Platform.OS === "android" ? "blx-crm://blx/" : "blx-crm://";
    let rootView = (
      <Provider store={this.store}>
        <View style={styles.container}>
          <View style={Platform.OS === 'ios' ? [] : [styles.statusBar]}>
            <StatusBar backgroundColor={"transparent"} translucent/>
          </View>
          <AppNavigator
            uriPrefix={prefix}
            store_={this.store}
            initialRouteName={initialRouteName}
            initialRouteParams={initialRouteParams}
          />
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
    return !this.state.rehydrated ? (
      <View/>
    ) : rootView;
  }

  common_state_expired(last_get_cfg_ts) {
    let current_time = dayjs(new Date()).unix();
    return current_time - last_get_cfg_ts > Config.STORE_VENDOR_CACHE_TS;
  }

  checkVersion(props) {
    HttpUtils.get.bind(props)('/api/check_version', {r: DeviceInfo.getBuildNumber()}).then(res => {
      if (res.yes) {
        Alert.alert('新版本提示', res.desc, [
          {text: '稍等再说', style: 'cancel'},
          {
            text: '现在更新', onPress: () => {
              console.log("start to download_url:", res.download_url)
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
              });
            }
          },
        ])
      }
    })
  }
}

export default RootScene;
