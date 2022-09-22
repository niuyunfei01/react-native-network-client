import React, {PureComponent} from 'react'
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import {
  check_is_bind_ext,
  getConfig,
  logout,
  requestSmsCode,
  setCurrentStore,
  signIn,
} from '../../../reducers/global/globalActions'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {hideModal, showError, showModal, showSuccess, ToastShort} from "../../../pubilc/util/ToastUtils";
import colors from '../../../pubilc/styles/colors'
import pxToDp from '../../../pubilc/util/pxToDp'
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import Config from '../../../pubilc/common/config'
import native from "../../../pubilc/util/native";
import tool from "../../../pubilc/util/tool";
import {mergeMixpanelId, MixpanelInstance} from '../../../pubilc/util/analytics';
import {CheckBox} from "react-native-elements";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import BottomModal from "../../../pubilc/component/BottomModal";
import {setDeviceInfo} from "../../../reducers/device/deviceActions";
import PropTypes from "prop-types";

const {BY_PASSWORD, BY_SMS} = {BY_PASSWORD: 'password', BY_SMS: 'sms'}
let {height, width} = Dimensions.get('window')

function mapStateToProps(state) {
  return {
    global: state.global,
    userProfile: state.global.currentUserPfile
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getConfig,
      logout,
      signIn,
      setCurrentStore,
      requestSmsCode
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
      loginType: BY_SMS,
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
    let {mobile} = this.state
    if (tool.length(mobile) > 10) {
      const {dispatch} = this.props;
      dispatch(requestSmsCode(mobile, 0, (success) => {
        const msg = success ? "短信验证码已发送" : "短信验证码发送失败";
        this.mixpanel.track("openApp_SMScode_click", {msg: msg});
        if (success) {
          this.interval = setInterval(() => {
            this.setState({
              reRequestAfterSeconds: this.getCountdown() - 1
            },()=>{
              if (this.state.reRequestAfterSeconds <= 0) {
                this.onCounterReReqEnd()
                clearInterval(this.interval)
              }
            })
          }, 1000)
          this.setState({canAskReqSmsCode: true});
          showSuccess(msg)
        } else {
          showError(msg)
        }
      }));
    } else {
      showError("请输入正确的手机号")
    }
  }

  onCounterReReqEnd = () => {
    this.setState({canAskReqSmsCode: false, reRequestAfterSeconds: 60});
  }

  onLogin = () => {
    let {loginType, authorization, mobile, verifyCode, password} = this.state;
    if (!authorization) {
      return this.setState({
        show_auth_modal: true
      })
    }
    if (!mobile) {
      const msg = loginType === BY_PASSWORD && "请输入登录名" || "请输入您的手机号";
      ToastShort(msg)
      return false;
    }
    showModal('登录中');
    switch (loginType) {
      case BY_SMS:
        if (!verifyCode) {
          showError('请输入短信验证码')
          return false;
        }
        this._signIn(mobile, verifyCode, "短信验证码");
        break;
      case BY_PASSWORD:
        if (!password) {
          showError('请输入登录密码')
          return false;
        }
        this._signIn(mobile, password, "帐号和密码");
        break;
      default:
        showError('登录类型错误')
    }
  }

  _signIn = (mobile, password, name) => {
    const {dispatch} = this.props;
    dispatch(logout());
    GlobalUtil.getDeviceInfo().then(deviceInfo => {
      dispatch(setDeviceInfo(deviceInfo))
    })
    dispatch(signIn(mobile, password, this.props, (ok, msg, token, uid) => {
      if (ok) {
        this.queryConfig(uid)
        if (uid) {
          this.mixpanel.getDistinctId().then(res => {
            if (res !== uid) {
              mergeMixpanelId(res, uid);
              this.mixpanel.identify(uid);
            }
          })
        }
      } else {
        if (msg.indexOf("注册") !== -1) {
          this.props.navigation.navigate('Apply', {mobile, verifyCode: password})
        }
        ToastShort(msg ? msg : "登录失败，请输入正确的" + name)
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
        ToastShort(err_msg);
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
    ToastShort("请手动勾选隐私政策")
  }

  onReadProtocol = () => {
    this.closeModal()
    this.mixpanel.track("openApp_privacy_click", {});
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }

  render() {
    return (
      <View style={{backgroundColor: '#e4ecf7', width: width, height: height}}>
        <ScrollView style={{zIndex: 999, flex: 1}}>
          <View style={{alignItems: "center"}}>
            <Image
              style={{
                height: pxToDp(134),
                width: pxToDp(134),
                borderRadius: pxToDp(20),
                marginVertical: pxToDp(50),
                marginHorizontal: 'auto'
              }}
              source={require('../../../img/Login/ic_launcher.png')}/>
          </View>
          <View>
            <TextInput
              underlineColorAndroid='transparent'
              placeholder="请输入手机号"
              onChangeText={(mobile) => {
                this.setState({mobile})
              }}
              value={this.state.mobile}
              placeholderTextColor={'#cad0d9'}
              style={{
                borderWidth: pxToDp(1),
                borderColor: colors.main_color,
                borderRadius: pxToDp(52),
                marginHorizontal: pxToDp(50),
                paddingLeft: pxToDp(45),
                height: pxToDp(90)
              }}
            />
          </View>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row'}}>
              <TextInput
                onChangeText={(verifyCode) => this.setState({verifyCode})}
                value={this.state.verifyCode}
                placeholderTextColor={'#cad0d9'}
                underlineColorAndroid='transparent'
                placeholder="请输入验证码"
                style={{
                  borderWidth: pxToDp(1),
                  borderColor: colors.main_color,
                  borderRadius: pxToDp(52),
                  marginHorizontal: pxToDp(50),
                  paddingLeft: pxToDp(40),
                  width: pxToDp(370),
                  marginTop: pxToDp(45),
                  height: pxToDp(90),
                  marginRight: pxToDp(20),
                }}
              />
              {this.state.canAskReqSmsCode ?
                <TouchableOpacity style={{
                  alignSelf: 'center',
                  height: pxToDp(90),
                  width: pxToDp(230),
                  borderWidth: pxToDp(1),
                  borderRadius: pxToDp(45),
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: pxToDp(40),
                  borderColor: colors.fontBlack
                }}>
                  <Text style={{
                    fontSize: pxToDp(colors.actionSecondSize),
                    color: colors.fontBlack
                  }}>{this.state.reRequestAfterSeconds}秒重新获取 </Text>
                </TouchableOpacity>
                : <TouchableOpacity style={{
                  alignSelf: 'center',
                  height: pxToDp(90),
                  width: pxToDp(230),
                  borderWidth: pxToDp(1),
                  borderRadius: pxToDp(45),
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: pxToDp(40),
                  borderColor: colors.main_color
                }} onPress={this.onRequestSmsCode}>
                  <Text
                    style={{
                      fontSize: pxToDp(colors.actionSecondSize),
                      color: colors.main_vice_color
                    }}>获取验证码 </Text>
                </TouchableOpacity>
              }
            </View>
          </View>

          <View style={{marginLeft: 15, marginRight: 15}}>
            <TouchableOpacity style={{
              height: pxToDp(90),
              borderRadius: pxToDp(45),
              marginTop: pxToDp(50),
              marginHorizontal: pxToDp(20),
              backgroundColor: "#59b26a",
              justifyContent: 'center',
              alignItems: 'center',
              overflow: "hidden",
              borderWidth: pxToDp(0)
            }}
                              activeStyle={{backgroundColor: '#039702'}} type={'primary'} onClick={this.onPress}
                              onPress={this.onLogin}>
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: pxToDp(96),
                  fontSize: pxToDp(30)
                }}>登录</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              height: pxToDp(90),
              borderRadius: pxToDp(45),
              marginTop: pxToDp(50),
              marginHorizontal: pxToDp(20),
              backgroundColor: '#E2ECF8',
              borderColor: "#979797",
              borderWidth: pxToDp(1),
              overflow: "hidden",
              justifyContent: 'center',
              alignItems: 'center',
              color: colors.main_color
            }}
                              activeStyle={{backgroundColor: '#E2ECF8'}} type={'primary'} onClick={this.onPress}
                              onPress={() => {
                                this.mixpanel.track("openApp_signupstore_click", {});
                                this.props.navigation.navigate('Register')
                              }}>
              <Text style={{
                color: colors.main_color,
                textAlign: 'center',
                lineHeight: pxToDp(96),
                fontSize: pxToDp(30)
              }}>注册</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <ImageBackground source={require('../../../img/Login/login_bird.jpg')} style={{
          resizeMode: "cover",
          justifyContent: "center",
          height: height * 0.40,
          zIndex: 100,
        }}>
          <TouchableOpacity onPress={() => {
            if (!this.state.authorization) {
              this.mixpanel.track("openApp_readandagree_click", {});
            }
            this.setState({authorization: !this.state.authorization})
          }} style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
            <CheckBox
              checkedColor={colors.main_color}
              style={{margin: 0, padding: 0}}
              checked={this.state.authorization}
              onPress={() => {
                if (!this.state.authorization) {
                  this.mixpanel.track("openApp_readandagree_click", {});
                }
                this.setState({authorization: !this.state.authorization})
              }}
            />
            <Text style={{color: colors.color333, marginRight: 3, fontSize: 16}}>我已阅读并同意
            </Text>
            <Text onPress={this.onReadProtocol} style={{color: colors.main_color, fontSize: 16}}>外送帮隐私政策 </Text>
          </TouchableOpacity>

          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
            <Text style={{fontSize: 16}}>遇到问题，请</Text>
            <Text style={{
              fontSize: 16,
              color: '#59b26a',
              textDecorationColor: '#59b26a',
              textDecorationLine: 'underline',
              marginLeft: pxToDp(10)
            }} onPress={() => {

              if (!this.state.authorization) {
                return this.setState({
                  show_auth_modal: true
                })
              }

              this.mixpanel.track("info_customerservice_click", {});
              JumpMiniProgram("/pages/service/index", {place: 'login'});
              // native.dialNumber('18910275329');
            }}>联系客服</Text>
          </View>
        </ImageBackground>
        <BottomModal title={'提示'} actionText={'同意'} closeText={'取消'} onPress={this.closeModal}
                     visible={this.state.show_auth_modal} onPressClose={this.closeModal}
                     onClose={this.closeModal} btnStyle={{backgroundColor: colors.main_color}}>

          <View style={{marginVertical: 10, marginHorizontal: 6}}>
            <Text style={{fontSize: 14, color: colors.color333}}> 1.请先阅读并同意 <Text
              style={{fontSize: 16, color: colors.main_color}} onPress={this.onReadProtocol}> 隐私政策 </Text> </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.color333,
                marginVertical: 6
              }}> 2.授权app收集外送帮用户信息以提供发单及修改商品等服务 </Text>
            <Text style={{fontSize: 14, color: colors.color333}}> 3.请手动勾选隐私协议 </Text>
          </View>
        </BottomModal>
      </View>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScene)
