import React, {PureComponent} from "react";
import {LogBox, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";

import {getConfig, setNoLoginInfo, setOrderListBy, setUserProfile} from "./reducers/global/globalActions";
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
    flex: 1,
  },
  statusBar: {
    height: StatusBar.currentHeight,
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

    this.state = {
      noLoginInfo: {
        accessToken: '',
        currentUser: '',
        currStoreId: 0,
        currVendorId: 0,
        host: Config.defaultHost,
        co_type: '',
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
      if (noLoginInfo.accessToken && noLoginInfo.currStoreId && noLoginInfo.currVendorId) {
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
      store.dispatch(setOrderListBy(noLoginInfo?.order_list_by));
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
          initialRouteName = Config.ROUTE_ORDER_NEW;
          initialRouteParams = {orderId};
        } else {
          initialRouteName = noLoginInfo.show_bottom_tab ? Config.ROUTE_ALERT : Config.ROUTE_ORDERS;
        }
      }
    }

    nrRecordMetric("restore_redux", {
      time: this.passed_ms,
      store_id: noLoginInfo.currStoreId ?? '未登录',
      login_user: noLoginInfo.currentUser ?? '未登录'
    })
    return (
      <Provider store={store}>
        <ErrorBoundary>
          <SafeAreaView style={styles.container}>
            <View style={styles.statusBar}>
              <StatusBar backgroundColor={"transparent"} translucent={true} barStyle={'dark-content'}/>
            </View>
            <AppNavigator initialRouteName={initialRouteName} initialRouteParams={initialRouteParams}/>
          </SafeAreaView>
        </ErrorBoundary>
      </Provider>
    )
  }
}

export default RootScene;

