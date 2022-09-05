import React, {PureComponent} from 'react'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
  Alert,
  BackHandler,
  Image,
  InteractionManager,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {WebView} from "react-native-webview"
import 'react-native-get-random-values';
import Config from "./config";
import {showError, showSuccess, ToastShort} from "../util/ToastUtils";
import Icon from "react-native-vector-icons/Entypo";
import native from "../util/native";
import tool from "../util/tool";
import colors from "../styles/colors";
import * as wechat from "react-native-wechat-lib";
import {shareWechatImage} from "../util/WechatUtils";
import ViewShot, {captureRef} from "../component/react-native-view-shot";
import {MixpanelInstance} from "../util/analytics";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({}, dispatch)}
}

const options = {fileName: 'shareWechat', format: 'png', quality: 1}
const wechatShareImage = 'https://cnsc-pics.cainiaoshicai.cn/wechatShare/wechatShareImage.png'
const wechatLogo = 'https://cnsc-pics.cainiaoshicai.cn/wechatShare/icon64_wx_logo.png'
const wechatFriendImage = 'https://cnsc-pics.cainiaoshicai.cn/wechatShare/icon_res_download_moments.png'
const descriptionLeft = '扫描二维码下载外送帮，注\n册时填写您推荐人的ID：'
const descriptionRight = '，完成绑店、充值、\n发单，即可参与活动。'

class WebScene extends PureComponent {

  constructor(props: Object) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.state = {
      source: {},
      canGoBack: false,
      title: '',
      uri: '',
      shareWechatModal: false
    };

    this._do_go_back = this._do_go_back.bind(this)
  }

  headerTitle = (route) => {
    return (
      <Text style={{color: colors.color333}}>{this.state.title || (route.params || {}).title} </Text>
    )
  }

  headerRight = (url) => {
    return (
      <View style={styles.iconBtnWrap}>
        <If condition={url.indexOf('platform_activity/show/1') !== -1}>
          <TouchableOpacity onPress={this.wechatShare}>
            <Icon name={'share'} style={styles.iconBtn}/>
          </TouchableOpacity>
        </If>
        <TouchableOpacity onPress={this.onRefresh} style={{marginRight: 10}}>
          <Icon name={'cycle'} style={styles.iconBtn}/>
        </TouchableOpacity>
      </View>
    )
  }

  wechatShare = () => {
    this.mixpanel.track('act_user_ref_ad_page_share')
    wechat.isWXAppInstalled().then(isInstalled => {
      if (isInstalled) {
        this.setState({shareWechatModal: true})
      } else {
        Alert.alert('没有安装微信软件，请您安装微信之后再试');
      }
    })
  }

  navigationOptions = ({navigation, route}) => {
    const {url} = route.params;
    navigation.setOptions({
      headerTitle: () => this.headerTitle(route),
      headerRight: () => this.headerRight(url)
    })
  };

  postMessage = (obj) => {
    if (this.webview) {
      this.webview.postMessage(JSON.stringify(obj));
    }
  };

  onMessage = (e) => {
    const msg = e.nativeEvent.data;
    if (typeof msg === 'string') {
      if (msg.indexOf('http') === 0) {
        this._do_go_back(msg);
      } else if (msg.indexOf('value') !== -1) {
        InteractionManager.runAfterInteractions(() => {
          showSuccess('绑定成功，请核对信息。')
          const {currentUser,} = this.props.global;
          let {currVendorName, currVendorId} = tool.vendor(this.props.global);
          this.props.navigation.navigate(Config.ROUTE_STORE, {
            currentUser: currentUser,
            currVendorId: currVendorId,
            currVendorName: currVendorName
          });
        });
      } else if (msg.indexOf('canGoBack') == true) {
        InteractionManager.runAfterInteractions(() => {
          showSuccess('绑定新闪送成功，请核对信息。')
          const {currentUser,} = this.props.global;
          let {currVendorName, currVendorId} = tool.vendor(this.props.global);
          this.props.navigation.navigate(Config.ROUTE_STORE, {
            currentUser: currentUser,
            currVendorId: currVendorId,
            currVendorName: currVendorName
          });
        });
      } else {
        try {
          let data = JSON.parse(msg);
          if (data && data['action'] && data['params']) {
            let action = data['action'];
            let params = data['params'];
            if (action == 'nativeToGoods') {
              return
            }
            InteractionManager.runAfterInteractions(() => {
              this.props.navigation.navigate(action, params);
            });

          } else {
            this._do_go_back(msg);
          }
        } catch (e) {
          this._do_go_back(msg);
        }
      }
    }

  };

  backHandler = () => {
    if (this.state.canGoBack) {
      this.webview.goBack();
      return true;
    } else {
      this.props.navigation.goBack()
    }
  };

  onRefresh = () => {
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
      goBack()
    }
  }


  _onNavigationStateChange = (navState) => {
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
      native.gotoActByUrl(url).then();
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
      native.gotoLoginWithNoHistory(mobile).then();
      stop = true;
    }

    if (stop) {
      this.webview.stopLoading();
      return false;
    }

    return true;
  };

  _onShouldStartLoadWithRequest = (e) => {
    return this._jumpIfShould(e.url);
  };

  componentDidMount() {
    this.navigationOptions(this.props)
    InteractionManager.runAfterInteractions(() => {
      ToastShort('加载中')
      let {url, action} = this.props.route.params;
      if (action === Config.LOC_PICKER) {
        let {center,} = this.props.route.params;
        const key = '608d75903d29ad471362f8c58c550daf';
        url = Config.serverUrl(`/amap.php?key=${key}&center=${center}`);
      }
      let state = {source: {uri: url, headers: {'Cache-Control': 'no-cache'}}};
      this.setState(state)
    });
    //BackHandler.addEventListener('hardwareBackPress', this.backHandler);
    this.props.navigation.setParams({backHandler: this.backHandler, refresh: this.onRefresh});

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
  }

  onLoadEnd(e: any) {
    if (e.nativeEvent.title.length > 0 && e.nativeEvent.title.length < 10) {
      this.props.navigation.setOptions({
        headerTitle: <Text style={{color: colors.color333}}>{e.nativeEvent.title} </Text>
      })
      this.setState({title: e.nativeEvent.title})
    }
  }

  render() {
    const {shareWechatModal} = this.state
    const {global} = this.props
    return (
      <View style={styles.container}>
        <WebView
          ref={(webview) => (this.webview = webview)}
          onMessage={this.onMessage}
          onNavigationStateChange={this._onNavigationStateChange.bind(this)}
          onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest}
          automaticallyAdjustContentInsets={true}
          style={styles.webView}
          source={this.state.source}
          onLoadEnd={(e) => this.onLoadEnd(e)}
          scalesPageToFit
        />
        <Modal visible={shareWechatModal} transparent={true} hardwareAccelerated={true}>
          <SafeAreaView style={styles.modalWrap}>

            <View style={styles.center}>

              <ViewShot ref={ref => this.viewRef = ref} options={options}>
                <Image source={{uri: wechatShareImage}} style={styles.imgBackground}/>
                <View style={styles.descriptionContent}>
                  <Text style={styles.descriptionText}>
                    {descriptionLeft}
                  </Text>
                  <Text>
                    <Text style={styles.currentUserIdDescriptionText}>
                      {global.currentUser}
                    </Text>
                    <Text style={styles.descriptionText}>
                      {descriptionRight}
                    </Text>
                  </Text>
                </View>
              </ViewShot>

            </View>
            <View style={styles.modalContentWrap}>
              <Text style={styles.modalText}>
                分享
              </Text>
              <View style={styles.selectItemIconZone}>
                <TouchableOpacity style={styles.selectItemIconWrap} onPress={() => this.shareWechat(0)}>
                  <Image source={{uri: wechatLogo}} style={styles.selectItemIcon}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectItemIconWrap} onPress={() => this.shareWechat(1)}>
                  <Image source={{uri: wechatFriendImage}} style={styles.selectItemIcon}/>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.cancelTextWrap} onPress={this.hideShareWechatModal}>
                <Text style={styles.cancelText}>
                  取消
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    );
  }

  hideShareWechatModal = () => {
    this.setState({shareWechatModal: false})
  }
  shareWechat = async (scene) => {
    const uri = await captureRef(this.viewRef, options)
    if (uri.length <= 0) {
      showError('获取图片失败')
      return
    }
    try {
      const {errCode, errStr} = await shareWechatImage(uri, scene)
      if (0 === errCode) {
        this.hideShareWechatModal()
        return
      }
      showError('分享失败，原因：' + errStr)
    } catch (error) {
      showError('分享失败，原因：' + error.errStr)
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  webView: {
    flex: 1,
    backgroundColor: 'white',
  },
  center: {alignItems: 'center', justifyContent: 'center', flex: 1},
  iconBtnWrap: {flexDirection: 'row', alignItems: 'center'},
  iconBtn: {paddingLeft: 12, paddingRight: 12, fontSize: 20},
  modalWrap: {flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.50)', justifyContent: 'flex-end'},
  modalContentWrap: {height: 150, backgroundColor: colors.colorEEE},
  modalText: {fontSize: 14, paddingTop: 12, paddingLeft: 12, color: colors.color333},
  cancelTextWrap: {borderTopWidth: 1, borderTopColor: colors.colorDDD},
  cancelText: {fontSize: 14, padding: 12, color: colors.color333, textAlign: 'center'},
  imgBackground: {width: 250, height: 410.66},
  selectItemIconZone: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectItemIconWrap: {paddingLeft: 20, paddingRight: 20},
  selectItemIcon: {height: 64, width: 64},
  descriptionContent: {paddingLeft: 25.33, paddingTop: 316, position: 'absolute'},
  currentUserIdDescriptionText: {
    color: colors.color333,
    fontSize: 8,
    fontWeight: '400',
    lineHeight: 13.33,
    textDecorationLine: 'underline'
  },
  descriptionText: {
    color: colors.color333,
    fontSize: 8,
    fontWeight: '400',
    lineHeight: 13.33,
    textDecorationLine: 'none',
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(WebScene)
