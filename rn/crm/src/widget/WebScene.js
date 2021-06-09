import React, {PureComponent} from 'react'
import {BackHandler, InteractionManager, StyleSheet, ToastAndroid, View, Text} from 'react-native'
import 'react-native-get-random-values';
import { WebView } from "react-native-webview"
import {native, tool} from '../common'
import Config from "../config";
import NavigationItem from "./NavigationItem";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({}, dispatch)}
}

class WebScene extends PureComponent {

  navigationOptions = ({navigation, route}) => {
    navigation.setOptions({
      headerTitle: () => <Text>{this.state.title || (route.params || {}).title}</Text>,
      headerRight: () => {
        return <NavigationItem
          icon={require('../img/refresh.png')}
          position={'right'}
          onPress={() => this.onRefresh()}
        />
      }
    })
  };
  onRefresh = () => {
    this.webview.reload()
  }
  constructor(props: Object) {
    super(props);
    this.state = {
      source: {},
      canGoBack: false,
      title: ''
    };

    this.navigationOptions(this.props)
    this._do_go_back = this._do_go_back.bind(this)
  }

  postMessage = (obj) => {
    if (this.webview) {
      this.webview.postMessage(JSON.stringify(obj));
    }
  };

  onMessage = (e) => {
    console.log('web e =>', e);
    const msg = e.nativeEvent.data;
    console.log( e);
    console.log('web view msg =>', msg);
    if (typeof msg === 'string') {
      if (msg.indexOf('http') === 0) {
        this._do_go_back(msg);
      }else if(msg.indexOf('value') !== -1){
        InteractionManager.runAfterInteractions(() => {
          ToastAndroid.showWithGravity('绑定成功，请核对信息。',ToastAndroid.SHORT, ToastAndroid.CENTER)
     const {currentUser,} = this.props.global;
          let { currVendorName, currVendorId} = tool.vendor(this.props.global);
          this.props.navigation.navigate(Config.ROUTE_STORE,{
            currentUser: currentUser,
            currVendorId: currVendorId,
            currVendorName: currVendorName
          });
        });
      }else if(msg.indexOf('canGoBack') == true){
        InteractionManager.runAfterInteractions(() => {
          ToastAndroid.showWithGravity('绑定新闪送成功，请核对信息。',ToastAndroid.SHORT, ToastAndroid.CENTER)
          const {currentUser,} = this.props.global;
          let { currVendorName, currVendorId} = tool.vendor(this.props.global);
          this.props.navigation.navigate(Config.ROUTE_STORE,{
            currentUser: currentUser,
            currVendorId: currVendorId,
            currVendorName: currVendorName
          });
        });
      }
      else {
        try {
          let data = JSON.parse(msg);
          if (data && data['action'] && data['params']) {
            let action = data['action'];
            let params = data['params'];
            console.log('webview to native => action', action, ' params ', params)
            if (action == 'nativeToGoods') {
              native.toGoods.bind(this)()
            } else {
              InteractionManager.runAfterInteractions(() => {
                this.props.navigation.navigate(action, params);
              });
            }
          } else {
            this._do_go_back(msg);
          }
        } catch (e) {
          console.log('webview to native => action')
          this._do_go_back(msg);
        }
      }
    }

  };

  backHandler = () => {
    if(this.state.canGoBack) {
      this.webview.goBack();
      return true;
    } else {
      // native.nativeBack()
      this.props.navigation.goBack()
    }
  };

  onRefresh = () => {
    console.log(this)
    this.webview.reload()
  }

  _do_go_back(msg) {
    const data = JSON.parse(msg);
    if (data.name && data.location && data.address) {
      const {goBack} = this.props.navigation;
      const params = this.props.route.params;
      if (params.actionBeforeBack) {
        params.actionBeforeBack(data)
      }
      console.log("goback", params, "data", data);
      goBack()
    }
  }


  _onNavigationStateChange = (navState) => {
    console.log('set nav state', navState);

    if (navState.canGoBack !== this.state.canGoBack || navState.loading !== this.state.showLoading) {
      this.setState({
        canGoBack: navState.canGoBack,
        showLoading: navState.loading
      });
    }

    if (!navState.loading && 'about:blank' === navState.url && !navState.canGoBack && navState.canGoForward) {
      const {navigation} = this.props;
      navigation.goBack();
    }

    return this._jumpIfShould(navState.url, navState);
  };

  _jumpIfShould = (url, navState) => {

    const {navigation} = this.props;
    let stop = false;
    if (url.indexOf("/stores/provide_list.html") >= 0
      || url.indexOf("/market_tools/user_talk") > 0
      || url.indexOf("/stores/search_wm_orders") > 0
      || url.indexOf("/stores/storage_common/") >= 0
      || url.indexOf("/stores/provide_prepare") >= 0) {
      native.gotoActByUrl(url);
      stop = true;
    } else if (url.indexOf("/stores/crm_add_token") > 0) {
      let path = tool.parameterByName("path", url);
      let vmPath = tool.parameterByName("vm_path", url);

      const {global, dispatch} = this.props;

      const nu = Config.serverUrl(`${path}&access_token=${global.accessToken}&${vmPath}`);
      navigation.navigate(Config.ROUTE_WEB, {url: nu});
      stop = true;
    } else if (url.indexOf("/stores/view_order") >= 0) {
      if (navState && !navState.loading) {
        navigation.navigate(Config.ROUTE_ORDER, {orderId: tool.parameterByName('wm_id', url)});
      }
      stop = true;
    } else if (url.indexOf("/users/login/crm/") >= 0
      || url.indexOf("/users/login?") >= 0
      || url.indexOf("/users/login/") >= 0) {

      const mobile = tool.parameterByName("m", url);
      native.gotoLoginWithNoHistory(mobile);
      stop = true;
    }

    if (stop) {
      this.webview.stopLoading();
      return false;
    }

    return true;
  };

  _onShouldStartLoadWithRequest = (e) => {
    console.log(e);
    return this._jumpIfShould(e.url);
  };

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.setParams({title: '加载中'});
      let {url, action} = this.props.route.params;

      if (action === Config.LOC_PICKER) {
        let {center,} = this.props.route.params;
        const key = '608d75903d29ad471362f8c58c550daf';
        url = Config.serverUrl(`/amap.php?key=${key}&center=${center}`);
        console.log("log_picker url: ", url)
      }
      let state = {source: {uri: url, headers: {'Cache-Control': 'no-cache'}}};
      this.setState(state)
      console.log('url', state)
    });

    BackHandler.addEventListener('hardwareBackPress', this.backHandler);
    this.props.navigation.setParams({backHandler: this.backHandler, refresh: () => this.onRefresh()});
    console.log("Did mount refresh, back-handler, this.webview:", this.webview)
  };

  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
  }

  render() {
    return (
      <View style={styles.container}>
        <WebView
          ref={(webview) => (this.webview = webview)}
          onMessage={this.onMessage}
          onNavigationStateChange= {this._onNavigationStateChange.bind(this)}
          onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest}
          automaticallyAdjustContentInsets={true}
          style={styles.webView}
          source={this.state.source}
          onLoadEnd={(e) => this.onLoadEnd(e)}

          // renderLoading={() => {
          //   return <Toast>加载中</Toast>
          // }}
          // {{...this._gestureHandlers}}
          // scrollEnabled={this.state.scrollEnabled}
          scalesPageToFit
        />
      </View>
    );
  }

  onLoadEnd(e: any) {
    if (e.nativeEvent.title.length > 0) {
      this.props.navigation.setParams({title: e.nativeEvent.title})
      this.setState({title: e.nativeEvent.title})
    }
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  webView: {
    flex: 1,
    backgroundColor: 'white',
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(WebScene)
