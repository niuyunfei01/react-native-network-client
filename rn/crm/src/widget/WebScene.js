import React, {PureComponent} from 'react'
import {View, Text, StyleSheet, WebView, InteractionManager, Platform, BackHandler} from 'react-native'
import {native, tool} from '../common'
import Config from "../config";
import LoadingView from "./LoadingView";
import {Toast} from "./../weui/index";
import NavigationItem from "./NavigationItem";
import pxToDp from "../util/pxToDp";
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

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerLeft: (
        <NavigationItem
          icon={require('../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            params.backHandler();
          }}
        />),
      headerTitle: params.title,
    }
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      source: {},
      canGoBack: false,
    };

    this._do_go_back = this._do_go_back.bind(this)
  }

  postMessage = (obj) => {
    if (this.webview) {
      this.webview.postMessage(JSON.stringify(obj));
      console.log('post----', obj)
    }
  };

  onMessage = (e) => {
    const msg = e.nativeEvent.data;
    if (typeof msg === 'string') {
      this._do_go_back(msg);
    }
  };

  backHandler = () => {
    if(this.state.canGoBack) {
      this.webview.goBack();
      return true;
    }
  };

  _do_go_back(msg) {
    const data = JSON.parse(msg);
    if (data.name && data.location && data.address) {
      const {goBack, state} = this.props.navigation;
      const params = state.params;
      if (params.actionBeforeBack) {
        params.actionBeforeBack(data)
      }
      console.log('goback', params);
      goBack()
    }
  }

  _onNavigationStateChange = (navState) => {
    // console.log('set nav state', navState);

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

    return this._jumpIfShould(navState.url);
  };

  _jumpIfShould = (url) => {

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

      navigation.navigate(Config.ROUTE_ORDER, {orderId: tool.parameterByName('wm_id', url)});
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
      let {url, action} = this.props.navigation.state.params;

      if (action === Config.LOC_PICKER) {
        let {center,} = this.props.navigation.state.params;
        const key = '608d75903d29ad471362f8c58c550daf';
        url = `https://www.cainiaoshicai.cn/amap.php?key=${key}&center=${center}`;
      }
      this.setState({source: {uri: url}})
    });

    BackHandler.addEventListener('hardwareBackPress', this.backHandler);

    this.props.navigation.setParams({backHandler: this.backHandler});
  };

  componentWillMount() {
    // this._gestureHandlers = {
    //   onStartShouldSetResponder: () => true,
    //   onResponderGrant: () => {
    //     this.setState({scrollEnabled: true});
    //   },
    //   onResponderTerminate: () => {
    //     this.setState({scrollEnabled: false});
    //   }
    // };
  }

  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
  }

  render() {
    return (
      <View style={styles.container}>
        <WebView
          ref={webview => {
            this.webview = webview;
          }}
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
