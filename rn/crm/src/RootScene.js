import React, {PureComponent, useRef} from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  ToastAndroid,
  View,
  LogBox,
  NativeModules,
  DeviceEventEmitter,
  Alert, InteractionManager
} from "react-native";

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
import Caught from "./common/Caught";
import Config from "./config";
import SplashScreen from "react-native-splash-screen";
import native from "./common/native";
import Moment from "moment/moment";
import GlobalUtil from "./util/GlobalUtil";
import {default as newRelic} from 'react-native-newrelic';
import DeviceInfo from "react-native-device-info";
import HttpUtils from "./util/http";

const lightContentScenes = ["Home", "Mine", "Operation"];
//global exception handlers
const caught = new Caught();
LogBox.ignoreLogs([
  'Warning: isMounted(...) is deprecated'
])

newRelic.init({
  overrideConsole: true,
  reportUncaughtExceptions: true,
  globalAttributes: {
    'wsb-app': DeviceInfo.getBuildNumber()
  }
});

function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
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

        if (access_token) {
          store.dispatch(setAccessToken({access_token}));
          store.dispatch(setPlatform("android"));
          store.dispatch(setUserProfile(userProfile));
          store.dispatch(setCurrentStore(currStoreId));

          const {last_get_cfg_ts} = this.store.getState().global;
          if (this.common_state_expired(last_get_cfg_ts)
            && !this.state.onGettingCommonCfg) {
            console.log("get common config");
            this.setState({onGettingCommonCfg: true})
            store.dispatch(getCommonConfig(access_token, currStoreId, (ok, msg) => {
              this.setState({onGettingCommonCfg: false})
            }));
          }
        }

        this.setState({rehydrated: true});
        console.log("passed at done 2:", Moment().valueOf()-current_ms);
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
      //hiding after state recovered
      SplashScreen.hide();

      let {accessToken, currStoreId, lastCheckVersion = 0} = this.store.getState().global;

      const currentTs = Moment(new Date()).unix();
      console.log('currentTs', currentTs, 'lastCheck', lastCheckVersion)
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
