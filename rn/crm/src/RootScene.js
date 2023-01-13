import React, {PureComponent} from "react";
import {Appearance, LogBox, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";

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
import {RootSiblingParent} from 'react-native-root-siblings'

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
        refreshToken: '',
        currentUser: '',
        store_id: 0,
        vendor_id: 0,
        host: Config.defaultHost,
        enabled_good_mgr: false,
        autoBluetoothPrint: false,
        expireTs: 0,
        getTokenTs: 0,
        order_list_by: 'expectTime asc',
        printer_id: '0',
      },
      rehydrated: false,
      status_bar_status: Appearance.getColorScheme() === 'dark' ? 'light-content' : 'dark-content'
    };
  }

  getInfo = () => {
    const startTime = dayjs().valueOf()
    getNoLoginInfo().then(info => {
      this.passed_ms = dayjs().valueOf() - startTime
      const noLoginInfo = JSON.parse(info)
      global.noLoginInfo = noLoginInfo
      GlobalUtil.setHostPort(noLoginInfo.host)
      if (noLoginInfo.accessToken && noLoginInfo.store_id && noLoginInfo.vendor_id) {
        store.dispatch(getConfig(noLoginInfo.accessToken, noLoginInfo.store_id))
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
    this.status_bar_listener = Appearance.addChangeListener(this.getStatusBarStatus)
  }

  getStatusBarStatus = ({colorScheme}) => {
    this.setState({
      status_bar_status: colorScheme === 'dark' ? 'light-content' : 'dark-content'
    })
  }

  componentWillUnmount() {
    this.status_bar_listener && this.status_bar_listener.remove()
  }

  render() {
    return this.state.rehydrated ? this.getRootView() : this.getEmptyView()
  }

  getEmptyView = () => {
    return <View/>
  }

  getRootView = () => {
    global.isLoginToOrderList = false
    let initialRouteName;
    let initialRouteParams = {};
    const {noLoginInfo} = this.state;
    global.noLoginInfo = noLoginInfo

    if (!noLoginInfo.accessToken) {
      initialRouteName = Config.ROUTE_LOGIN;
      initialRouteParams = {next: "", nextParams: {}};
    } else {
      initialRouteName = Config.ROUTE_ALERT;
    }

    nrRecordMetric("restore_redux", {
      time: this.passed_ms,
      store_id: noLoginInfo.store_id ?? '未登录',
      login_user: noLoginInfo.currentUser ?? '未登录'
    })
    return (
      <RootSiblingParent>
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
      </RootSiblingParent>

    )
  }
}

export default RootScene;

