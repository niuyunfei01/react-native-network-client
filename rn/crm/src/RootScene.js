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
  TextInput,
  View
} from "react-native";

import {setDeviceInfo} from "./reducers/device/deviceActions";
import {setBleStarted, setCheckVersionAt} from "./reducers/global/globalActions";
import Config from "./pubilc/common/config";
import SplashScreen from "react-native-splash-screen";
import DeviceInfo from "react-native-device-info";
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
import {doJPushSetAlias, sendDeviceStatus} from "./pubilc/component/jpushManage";
import ErrorBoundary from "./pubilc/component/ErrorBoundary";

LogBox.ignoreAllLogs(true)
global.currentRouteName = ''
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
Text.defaultProps = {...(Text.defaultProps || {}), fontFamily: '', color: '#333', allowFontScaling: true};
TextInput.defaultProps = {...(TextInput.defaultProps || {}), allowFontScaling: false};

class RootScene extends PureComponent {
  constructor() {
    super();
    StatusBar.setBarStyle("light-content");

    this.state = {
      rehydrated: false,
      onGettingCommonCfg: false,
      bleStarted: false
    };
    this.store = null;
  }

  componentDidMount() {

    if (this.ptListener) {
      this.ptListener.remove()
    }

    native.getAutoBluePrint((auto, isAutoBlePtMsg) => {
      if (!this.state.bleStarted) {
        BleManager.start({showAlert: false}).then();
        this.setState({bleStarted: true})
        this.store.dispatch(setBleStarted(true));
      }
    }).then()

    let {currentUser, lastCheckVersion = 0} = this.store.getState().global;
    const state = this.store.getState();
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
            sendDeviceStatus(state, {...obj, btConnected: `打印结果:${msg}-${error || ''}`})
          };

          BleManager.retrieveServices(printer_id).then((peripheral) => {
            print_order_to_bt(state, peripheral, clb, obj.wm_id, false, 1);
          }).catch((error) => {
            //蓝牙尚未启动时，会导致App崩溃
            if (!bleStarted) {
              sendDeviceStatus(state, {...obj, btConnected: '蓝牙尚未启动'})
              return;
            }

            //重新连接
            BleManager.connect(printer_id).then(() => {
              BleManager.retrieveServices(printer_id).then((peripheral) => {
                print_order_to_bt(state, peripheral, clb, obj.wm_id, false, 1);
              })
            }).catch((error2) => {
              // noinspection JSIgnoredPromiseFromCall
              sendDeviceStatus(state, {...obj, btConnected: `已断开:error1-${error} error2-${error2}`})
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

        sendDeviceStatus(state, {...obj, btConnected: '未连接'})
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
      sendDeviceStatus(state, obj)
    })
    doJPushSetAlias(currentUser, "RootScene-componentDidMount");
    const currentTs = dayjs(new Date()).unix();
    if (currentTs - lastCheckVersion > 8 * 3600 && Platform.OS !== 'ios') {
      this.store.dispatch(setCheckVersionAt(currentTs))
      this.checkVersion({global: this.store.getState().global});
    }

    GlobalUtil.getDeviceInfo().then(deviceInfo => {
      this.store.dispatch(setDeviceInfo(deviceInfo))
    })
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

        SplashScreen.hide();

        this.setState({rehydrated: true});
        this.passed_ms = dayjs().valueOf() - current_ms;


      }.bind(this)
    );
  }

  render() {

    return this.state.rehydrated ? this.getRootView() : this.getEmptyView()
  }

  getEmptyView = () => {
    return <View/>
  }

  getRootView = () => {
    global.isLoginToOrderList = false
    const {launchProps} = this.props;
    const {orderId, backPage, currStoreId} = launchProps;
    let initialRouteName = launchProps["_action"];
    if (!!backPage) {
      launchProps["_action_params"]["backPage"] = backPage;
    }
    let initialRouteParams = launchProps["_action_params"] || {};

    let {accessToken, currentUser, host} = this.store.getState().global;

    if (!accessToken) {
      // showError("请您先登录")

      initialRouteName = Config.ROUTE_LOGIN;
      initialRouteParams = {next: "", nextParams: {}};
    } else {
      GlobalUtil.setHostPort(host)
      if (!initialRouteName) {
        if (orderId) {
          initialRouteName = Config.ROUTE_ORDER;
          initialRouteParams = {orderId};
        } else {
          initialRouteName = "Tab";
        }
      }
    }
    nrRecordMetric("restore_redux", {
      time: this.passed_ms,
      store_id: currStoreId ?? '未登录',
      login_user: currentUser ?? '未登录'
    })
    // on Android, the URI prefix typically contains a host in addition to scheme
    //const prefix = Platform.OS === "android" ? "blx-crm://blx/" : "blx-crm://";
    let rootView = (
      <Provider store={this.store}>
        <ErrorBoundary>
          <View style={styles.container}>
            <View style={Platform.OS === 'ios' ? [] : [styles.statusBar]}>
              <StatusBar backgroundColor={"transparent"} translucent/>
            </View>
            <AppNavigator initialRouteName={initialRouteName} initialRouteParams={initialRouteParams}/>
          </View>
        </ErrorBoundary>

      </Provider>
    )
    if (Platform.OS === 'ios') {
      rootView = (
        <SafeAreaView style={{flex: 1, backgroundColor: '#4a4a4a'}}>
          {rootView}
        </SafeAreaView>
      )
    }
    return rootView
  }

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
