import React, {PureComponent} from 'react'
import {BackHandler, InteractionManager, StyleSheet, ToastAndroid, View, WebView} from 'react-native'
import {native, tool} from '../common'
import Config from "../config";
import NavigationItem from "./NavigationItem";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import GlobalUtil from "../util/GlobalUtil";
import {getVendorStores} from "../reducers/mine/mineActions";

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
          onPress={() => params.backHandler()}
        />),
      headerTitle: params.title,
      headerRight: (
        <NavigationItem
          icon={require('../img/refresh.png')}
          position={'right'}
          onPress={() => params.refresh()}
        />
      )
    }
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      source: {},
      canGoBack: false,
    };
   var  data = {"event":"msg-token","value":{"token":{"ePoiId":"mt9408","poiName":"比邻鲜（龙锦市场店）","appAuthToken":"57c2c2c897c4a61a4ea4c6a236b44493347af111761fa53712c1a5ff1dae492255aaf76df48d1fcf96f8fcd885b191ea","businessId":"2","poiId":"4221421","timestamp":"1591701732346"},"poiName":"比邻鲜（龙锦市场店）","poiId":4221421}}
if(data.value){
  console.log(111)
}else {
  console.log(222)
}
   this._do_go_back = this._do_go_back.bind(this)
  }

  postMessage = (obj) => {
    if (this.webview) {
      this.webview.postMessage(JSON.stringify(obj));
      console.log('post----', obj)
    }
  };

  onMessage = (e) => {
    console.log('web e =>', e);
    const msg = e.nativeEvent.data;
    console.log('web view msg =>', msg);
    if (typeof msg === 'string') {
      console.log(111)
      if (msg.indexOf('http') === 0) {
        this._do_go_back(msg);
      }else if(msg.indexOf('value') !== -1){
        InteractionManager.runAfterInteractions(() => {
          let {
            currVendorId,
          } = tool.vendor(this.props.global);
          ToastAndroid.showWithGravity('绑定成功，请核对信息。',ToastAndroid.SHORT, ToastAndroid.CENTER)
     const {
          currStoreId,
          canReadStores,
        } = this.props.global;
          this.props.navigation.navigate(Config.ROUTE_STORE_ADD,{
            btn_type: "edit",
            resetNavStack:true,
            store_info: canReadStores[currStoreId],
            currVendorId:currVendorId,
          });
        });
      }
      else {
        console.log(3333)
        try {
          let data = JSON.parse(msg);
          if (data && data['action'] && data['params']) {
            let action = data['action'];
            let params = data['params'];
            console.log('webview to native => action', action, ' params ', params)
            if (action == 'nativeToGoods') {
              native.toGoods()
            } else {
              InteractionManager.runAfterInteractions(() => {
                _this.props.navigation.navigate(action, params);
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
      let {url, action} = this.props.navigation.state.params;

      if (action === Config.LOC_PICKER) {
        let {center,} = this.props.navigation.state.params;
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
