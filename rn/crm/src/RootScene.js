import React, {PureComponent} from "react";
import {LogBox, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";

import {getConfig, setNoLoginInfo, setUserProfile} from "./reducers/global/globalActions";
import Config from "./pubilc/common/config";
import SplashScreen from "react-native-splash-screen";
import {Provider} from "react-redux";
import GlobalUtil from "./pubilc/util/GlobalUtil";
import AppNavigator from "./pubilc/common/AppNavigator";
import {nrInit, nrRecordMetric} from './pubilc/util/NewRelicRN.js';
import ErrorBoundary from "./pubilc/component/ErrorBoundary";
import {getNoLoginInfo} from "./pubilc/common/noLoginInfo";
import store from "./pubilc/util/configureStore";
import PropTypes from "prop-types";
import HttpUtils from "./pubilc/util/http";
import dayjs from "dayjs";

LogBox.ignoreAllLogs(true)
global.currentRouteName = ''
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statusBar: {
    height: StatusBar.currentHeight,
    backgroundColor: "rgba(0, 0, 0, 0.20)"
  }
});

nrInit('Root');
Text.defaultProps = {...(Text.defaultProps || {}), color: '#333', fontSize: 12, allowFontScaling: true};
TextInput.defaultProps = {...(TextInput.defaultProps || {}), allowFontScaling: false};

class RootScene extends PureComponent {

  static propTypes = {
    launchProps: PropTypes.object,
  }

  constructor() {
    super();
    StatusBar.setBarStyle("light-content");

    this.state = {
      noLoginInfo: {
        accessToken: '',
        currentUser: '',
        currStoreId: -1,
        host: Config.defaultHost,
        co_type: '',
        storeVendorId: -1,
        enabledGoodMgr: 0
      },
      rehydrated: false,
      onGettingCommonCfg: false,
      bleStarted: false
    };
  }

  getInfo = () => {
    const startTime = dayjs().valueOf()
    getNoLoginInfo().then(info => {
      this.passed_ms = dayjs().valueOf() - startTime
      const noLoginInfo = JSON.parse(info)
      GlobalUtil.setHostPort(noLoginInfo.host)
      if (noLoginInfo.accessToken) {
        store.dispatch(getConfig(noLoginInfo.accessToken, noLoginInfo.currStoreId))
        store.dispatch(setNoLoginInfo(noLoginInfo))
        HttpUtils.get(`/api/user_info2?access_token=${noLoginInfo.accessToken}`).then(res => {
          store.dispatch(setUserProfile(res));
        })
        this.setState({
          rehydrated: true,
          noLoginInfo: noLoginInfo
        });
      } else {
        this.setState({
          rehydrated: true,
        });
      }
      SplashScreen.hide();
    }).catch(() => {
      SplashScreen.hide();
      this.setState({
        rehydrated: true,
      });
      this.passed_ms = dayjs().valueOf() - startTime
    })
  }

  componentDidMount() {
    this.getInfo()
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
    const {orderId, backPage} = launchProps;
    let initialRouteName = launchProps["_action"];
    if (backPage) {
      launchProps["_action_params"]["backPage"] = backPage;
    }
    let initialRouteParams = launchProps["_action_params"] || {};
    const {noLoginInfo} = this.state;
    global.noLoginInfo = noLoginInfo
    if (!noLoginInfo.accessToken) {
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

    nrRecordMetric("restore_redux", {
      time: this.passed_ms,
      store_id: noLoginInfo.currStoreId ?? '未登录',
      login_user: noLoginInfo.currentUser ?? '未登录'
    })

    let rootView = (
      <Provider store={store}>
        <ErrorBoundary>
          <View style={styles.container}>
            <View style={styles.statusBar}>
              <StatusBar backgroundColor={"transparent"} translucent/>
            </View>
            <AppNavigator initialRouteName={initialRouteName}
                          initialRouteParams={initialRouteParams}/>
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
}

export default RootScene;

