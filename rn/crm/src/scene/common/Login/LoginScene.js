import React, {PureComponent} from 'react'
import {Platform, Text, TextInput, TouchableOpacity, View} from 'react-native'

import {
  check_is_bind_ext,
  getConfig,
  logout,
  sendDverifyCode,
  setCurrentStore,
  signIn,
} from '../../../reducers/global/globalActions'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {hideModal, showError, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";
import colors from '../../../pubilc/styles/colors'
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import Config from '../../../pubilc/common/config'
import native from "../../../pubilc/util/native";
import tool from "../../../pubilc/util/tool";
import {mergeMixpanelId, MixpanelInstance} from '../../../pubilc/util/analytics';
import {Button, CheckBox} from "react-native-elements";
import BottomModal from "../../../pubilc/component/BottomModal";
import {setDeviceInfo} from "../../../reducers/device/deviceActions";
import PropTypes from "prop-types";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getConfig,
      logout,
      signIn,
      setCurrentStore,
      sendDverifyCode
    }, dispatch)
  }
}

class LoginScene extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.timeouts = [];
    this.state = {
      mobile: '',
      password: '',
      canAskReqSmsCode: false,
      reRequestAfterSeconds: 60,
      verifyCode: '',
      doingSign: false,
      doingSignKey: '',
      authorization: false,
      show_auth_modal: true,
    };

    const params = (this.props.route.params || {});
    this.next = params.next;
    this.nextParams = params.nextParams;
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track("openApp_page_view", {});
  }

  componentDidMount() {
    global.isLoginToOrderList = true
  }

  componentWillUnmount = () => {
    this.clearTimeouts();
  }

  getCountdown = () => {
    return this.state.reRequestAfterSeconds;
  }

  clearTimeouts = () => {
    this.timeouts.forEach(clearTimeout);
  }

  onRequestSmsCode = () => {
    let {mobile, canAskReqSmsCode} = this.state
    if (canAskReqSmsCode) return null;
    if (tool.length(mobile) > 10) {
      const {dispatch} = this.props;
      dispatch(sendDverifyCode(mobile, 0, 1, (success, msg) => {
        this.mixpanel.track("openApp_SMScode_click", {msg: msg});
        if (success) {
          this.interval = setInterval(() => {
            this.setState({
              reRequestAfterSeconds: this.getCountdown() - 1
            }, () => {
              if (this.state.reRequestAfterSeconds <= 0) {
                this.onCounterReReqEnd()
                clearInterval(this.interval)
              }
            })
          }, 1000)
          this.setState({canAskReqSmsCode: true});
        }
        ToastShort(msg, 0)
      }));
    } else {
      ToastShort("请输入正确的手机号", 0)
    }
  }

  onCounterReReqEnd = () => {
    this.setState({canAskReqSmsCode: false, reRequestAfterSeconds: 60});
  }

  onLogin = () => {
    let {authorization, mobile, verifyCode} = this.state;
    if (!authorization) {
      return this.setState({
        show_auth_modal: true
      })
    }
    if (!mobile) {
      // const msg = loginType === BY_PASSWORD && "请输入登录名" || "请输入您的手机号";
      return ToastShort("请输入您的手机号", 0)
    }
    if (!verifyCode) {
      return ToastShort("请填写验证码", 0)
    }
    this._signIn(mobile, verifyCode);
  }

  _signIn = (mobile, password) => {
    showModal("正在登录...")
    const {dispatch} = this.props;
    dispatch(logout());
    GlobalUtil.getDeviceInfo().then(deviceInfo => {
      dispatch(setDeviceInfo(deviceInfo))
    })
    dispatch(signIn(mobile, password, this.props, (ok, msg, uid) => {
      if (ok && uid) {
        this.queryConfig(uid)
        this.mixpanel.getDistinctId().then(res => {
          if (res !== uid) {
            mergeMixpanelId(res, uid);
            this.mixpanel.identify(uid);
          }
        })
      } else {
        if (msg === 401) { //未注册
          return this.props.navigation.navigate('Apply', {mobile, verifyCode: password})
        }
        ToastShort(msg, 0)
      }
    }));
  }

  queryConfig = (uid) => {
    let {accessToken, currStoreId} = this.props.global;
    const {dispatch} = this.props;
    dispatch(getConfig(accessToken, currStoreId, (ok, err_msg, cfg) => {
      if (ok) {
        let store_id = cfg?.store_id || currStoreId;
        dispatch(check_is_bind_ext({token: accessToken, user_id: uid, storeId: store_id}, (binded) => {
          this.doneSelectStore(store_id, !binded);
        }));
      } else {
        ToastShort(err_msg, 0);
      }
    }));
  }

  doneSelectStore = (storeId, not_bind = false) => {
    const {dispatch, navigation} = this.props;
    const setCurrStoreIdCallback = (set_ok, msg) => {
      if (set_ok) {
        dispatch(setCurrentStore(storeId));
        if (not_bind) {
          navigation.navigate(Config.ROUTE_STORE_STATUS)
          hideModal()
          return;
        }
        navigation.navigate(this.next || Config.ROUTE_ORDER, this.nextParams)
        tool.resetNavStack(navigation, Config.ROUTE_ALERT, {
          initTab: Config.ROUTE_ORDERS,
          initialRouteName: Config.ROUTE_ALERT
        });
        hideModal()
      } else {
        showError(msg);
      }
    };
    if (Platform.OS === 'ios') {
      setCurrStoreIdCallback(true, '');
    } else {
      native.setCurrStoreId(storeId, setCurrStoreIdCallback);
    }
  }

  closeModal = () => {
    this.setState({
      show_auth_modal: false
    })
    ToastShort("请手动勾选隐私政策", 0)
  }

  onReadProtocol = () => {
    this.closeModal()
    this.mixpanel.track("openApp_privacy_click", {});
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }

  setCheckd = () => {
    let {authorization} = this.state;
    if (!authorization) {
      this.mixpanel.track("openApp_readandagree_click", {});
    }
    this.setState({authorization: !authorization})
  }

  render() {
    let {mobile, verifyCode, canAskReqSmsCode, reRequestAfterSeconds, authorization} = this.state;
    return (
      <View style={{flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 30}}>
        <Text style={{fontSize: 28, fontWeight: '500', color: colors.color333}}>登录外送帮 </Text>
        <Text
          style={{fontSize: 12, color: colors.color666, lineHeight: 17, marginVertical: 4}}>未注册手机号验证后自动创建外送帮账号 </Text>
        <View style={{marginVertical: 16}}>
          <View style={{
            backgroundColor: colors.f5,
            borderRadius: 4,
            height: 48,
          }}>
            <TextInput
              underlineColorAndroid='transparent'
              placeholder="请输入手机号"
              onChangeText={(mobile) => {
                this.setState({mobile})
              }}
              value={mobile}
              placeholderTextColor={colors.color999}
              style={{
                fontSize: 16,
                flex: 1,
                padding: 12,
              }}
            />
          </View>
          <View style={{
            backgroundColor: colors.f5,
            borderRadius: 4,
            height: 48,
            marginTop: 16,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <TextInput
              onChangeText={(verifyCode) => this.setState({verifyCode})}
              value={verifyCode}
              placeholderTextColor={colors.color999}
              underlineColorAndroid='transparent'
              placeholder="请输入验证码"
              style={{
                fontSize: 16,
                flex: 1,
                padding: 12,
              }}
            />
            <TouchableOpacity style={{
              padding: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }} onPress={this.onRequestSmsCode}>
              <Text style={{fontSize: 16, color: colors.main_color}}>
                {canAskReqSmsCode ? reRequestAfterSeconds + '秒重新获取' : '获取验证码'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={this.setCheckd}
                          style={{flexDirection: 'row', alignItems: 'center',}}>
          <CheckBox
            checkedColor={colors.main_color}
            uncheckedColor={'#DDDDDD'}
            containerStyle={{margin: 0, padding: 0}}
            checked={authorization}
            onPress={this.setCheckd}
          />
          <Text style={{color: colors.color999, fontSize: 12}}>
            我已阅读并同意
          </Text>
          <Text onPress={this.onReadProtocol} style={{color: colors.main_color, fontSize: 12}}>《外送帮隐私政策》 </Text>
          <If condition={!authorization}>
            <TouchableOpacity onPress={this.setCheckd} style={{position: 'absolute', top: 20, left: 0}}>
              <Entypo name={'triangle-up'}
                      style={{color: "rgba(0,0,0,0.7)", fontSize: 24, marginLeft: 10}}/>

              <View style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 4,
                height: 35,
                width: 108,
                position: 'absolute',
                top: 17.4,
                left: 3,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{fontSize: 12, color: colors.f7, lineHeight: 17}}>请阅读并勾选协议</Text>
              </View>
            </TouchableOpacity>
          </If>
        </TouchableOpacity>

        <View style={{marginTop: authorization ? 30 : 70}}>
          <Button title={'登 录'}
                  onPress={this.onLogin}
                  buttonStyle={[{
                    backgroundColor: colors.main_color,
                    borderRadius: 24,
                    length: 48,
                  }]}
                  titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}
          />
        </View>


        <BottomModal title={'提示'} actionText={'同意'} closeText={'取消'} onPress={this.closeModal}
                     visible={this.state.show_auth_modal} onPressClose={this.closeModal}
                     onClose={this.closeModal} btnStyle={{backgroundColor: colors.main_color}}>

          <View style={{marginVertical: 10, marginHorizontal: 6}}>
            <Text style={{fontSize: 14, color: colors.color333}}>
              1.请先阅读并同意
              <Text style={{fontSize: 16, color: colors.main_color}} onPress={this.onReadProtocol}>
                隐私政策
              </Text>
            </Text>
            <Text style={{fontSize: 14, color: colors.color333, marginVertical: 6}}>
              2.授权app收集外送帮用户信息以提供发单及修改商品等服务
            </Text>
            <Text style={{fontSize: 14, color: colors.color333}}>
              3.请手动勾选隐私协议
            </Text>
          </View>
        </BottomModal>

      </View>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScene)
