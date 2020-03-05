/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

import React, {PureComponent} from "react";
import {Platform, StatusBar, StyleSheet, ToastAndroid, View, YellowBox} from "react-native";

import {Provider} from "react-redux";
/**
 * ## Actions
 *  The necessary actions for dispatching our bootstrap values
 */
import {setPlatform} from "./reducers/device/deviceActions";
import {
  getCommonConfig,
  setAccessToken,
  setCurrentStore,
  setUserProfile,
  updateCfg
} from "./reducers/global/globalActions";

import configureStore from "./common/configureStore";
import AppNavigator from "./common/AppNavigator";
import Caught from "./common/Caught";

import Config from "./config";

import SplashScreen from "react-native-splash-screen";
import native from "./common/native";
import Moment from "moment/moment";
import _ from "lodash"
import GlobalUtil from "./util/GlobalUtil";

import {default as newRelic} from 'react-native-newrelic';
import DeviceInfo from "react-native-device-info";

const lightContentScenes = ["Home", "Mine", "Operation"];

//global exception handlers
const caught = new Caught();
YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated'
])
function getCurrentRouteName (navigationState) {
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

// create a component
class RootScene extends PureComponent {
  constructor () {
    super();
    StatusBar.setBarStyle("light-content");

    this.state = {
      rehydrated: false
    };

    this.store = null;
  }

  componentDidMount () {
  }

  componentWillMount () {
    const launchProps = this.props.launchProps;

    this.store = configureStore(
      function (store) {
        const {
          access_token,
          currStoreId,
          userProfile,
          canReadStores,
          canReadVendors,
          configStr
        } = launchProps;

        let config = configStr ? JSON.parse(configStr) : {};
        if (access_token) {
          store.dispatch(setAccessToken({access_token}));
          store.dispatch(setPlatform("android"));
          store.dispatch(setUserProfile(userProfile));
          store.dispatch(setCurrentStore(currStoreId));
          if (_.isEmpty(config) || _.isEmpty(canReadStores) || _.isEmpty(canReadVendors)) {
            console.log("get common config");
            store.dispatch(getCommonConfig(access_token, currStoreId, (ok, msg) => {
            }));
          } else {
            store.dispatch(updateCfg({
              "canReadStores": canReadStores,
              "canReadVendors": canReadVendors,
              "config": config
            }))
          }
        }
        GlobalUtil.setHostPortNoDef(store.getState().global, native, () => {
          this.setState({rehydrated: true});
        });
      }.bind(this)
    );

    newRelic.init({
      overrideConsole: true,
      reportUncaughtExceptions: true,
      globalAttributes: {
        'wsb-app': DeviceInfo.getBuildNumber()
      }
    });
  }

  render () {
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
      if (!this.store.getState().global.accessToken) {
        ToastAndroid.showWithGravity(
          "请您先登录",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
        initialRouteName = Config.ROUTE_LOGIN;
        initialRouteParams = {next: "", nextParams: {}};
      } else {
        if (!initialRouteName && orderId) {
          initialRouteName = Config.ROUTE_ORDER;
          initialRouteParams = {orderId};
        }
      }

      let {accessToken, currStoreId} = this.store.getState().global;
      const {last_get_cfg_ts} = this.store.getState().global;
      let current_time = Moment(new Date()).unix();
      let diff_time = current_time - last_get_cfg_ts;

      if (diff_time > 300) {
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
            ref={nav => {
              this.navigator = nav;
            }}
            initialRouteName={initialRouteName}
            initialRouteParams={initialRouteParams}
            onNavigationStateChange={(prevState, currentState) => {
              const currentScene = getCurrentRouteName(currentState);
              const previousScene = getCurrentRouteName(prevState);
              if (previousScene !== currentScene) {
                if (lightContentScenes.indexOf(currentScene) >= 0) {
                  StatusBar.setBarStyle("light-content");
                } else {
                  StatusBar.setBarStyle("dark-content");
                }
              }
            }}
          />
        </View>
      </Provider>
    );
  }
}

export default RootScene;
