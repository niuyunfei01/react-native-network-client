import React, {PureComponent} from 'react'
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import {
  check_is_bind_ext,
  getCommonConfig,
  logout,
  requestSmsCode,
  setCurrentStore,
  signIn,
} from '../../../reducers/global/globalActions'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {hideModal, showError, showModal, showSuccess, ToastShort} from "../../../pubilc/util/ToastUtils";
import HttpUtils from "../../../pubilc/util/http";
import colors from '../../../pubilc/styles/colors'
import pxToDp from '../../../util/pxToDp'
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import Config from '../../../pubilc/common/config'
import {native} from "../../../util";
import tool from "../../../pubilc/common/tool";
import {MixpanelInstance} from '../../../util/analytics';
import dayjs from "dayjs";
import {CheckBox} from "react-native-elements";
import JPush from "jpush-react-native";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";

const {BY_PASSWORD, BY_SMS} = {BY_PASSWORD: 'password', BY_SMS: 'sms'}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
  },
  container: {
    flex: 1,
    marginTop: 10
  },
  header: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  mark: {
    height: 100,
    width: 100
  },
  forgotContainer: {},
  counter: {
    fontSize: pxToDp(22),
    color: '#999999',
    alignSelf: 'center',
    padding: 5,
    borderRadius: pxToDp(40),
    borderWidth: 1,
    borderColor: '#999999',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: pxToDp(45),
    height: pxToDp(90),
    width: pxToDp(230),
    textAlignVertical: 'center',
    textAlign: 'center',
  }
})

let {height, width} = Dimensions.get('window')


function mapStateToProps(state) {
  return {
    global: state.global,
    userProfile: state.global.currentUserPfile
  }
}

function mapDispatchToProps(dispatch) {
  return {dispatch, ...bindActionCreators({getCommonConfig, logout, signIn, requestSmsCode}, dispatch)}
}

class LoginScene extends PureComponent {

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
    };
    this.onLogin = this.onLogin.bind(this);
    this.onRequestSmsCode = this.onRequestSmsCode.bind(this);
    this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this);
    this.queryCommonConfig = this.queryCommonConfig.bind(this);
    this.doneSelectStore = this.doneSelectStore.bind(this);

    const params = (this.props.route.params || {});
    this.next = params.next;
    this.nextParams = params.nextParams;
    this.mixpanel = MixpanelInstance;

    if (this.state.authorization) {
      this.mixpanel.track("openApp_page_view", {});
    }

    // Alert.alert('提示', '请先阅读并同意隐私政策,授权app收集外送帮用户信息以提供发单及修改商品等服务,并手动勾选隐私协议', [
    //   {text: '拒绝', style: 'cancel'},
    //   {
    //     text: '同意', onPress: () => {
    //       // this.setState({authorization: true})
    //       // this.onReadProtocol();
    //     }
    //   },
    // ])
  }

  clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
  }

  UNSAFE_componentWillMount() {

    const {dispatch} = this.props;
    dispatch(logout());

    const params = (this.props.route.params || {});
    this.next = params.next;
    this.nextParams = params.nextParams;
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  getCountdown() {
    return this.state.reRequestAfterSeconds;
  }

  onRequestSmsCode() {
    if (this.state.mobile && tool.length(this.state.mobile) > 10) {

      const {dispatch} = this.props;
      dispatch(requestSmsCode(this.state.mobile, 0, (success) => {
        const msg = success ? "短信验证码已发送" : "短信验证码发送失败";
        if (this.state.authorization) {
          this.mixpanel.track("openApp_SMScode_click", {msg: msg});
        }
        if (success) {
          this.interval = setInterval(() => {
            this.setState({
              reRequestAfterSeconds: this.getCountdown() - 1
            })
            if (this.state.reRequestAfterSeconds === 0) {
              this.onCounterReReqEnd()
              clearInterval(this.interval)
            }
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

  onCounterReReqEnd() {
    this.setState({canAskReqSmsCode: false, reRequestAfterSeconds: 60});
  }

  onLogin() {
    const loginType = this.state.loginType;
    if (!this.state.authorization) {
      Alert.alert('提示', '请先阅读并同意隐私政策,授权app收集外送帮用户信息以提供发单及修改商品等服务,并手动勾选隐私协议', [
        {text: '拒绝', style: 'cancel'},
        {
          text: '同意', onPress: () => {
            // this.setState({authorization: true})
            // this.onReadProtocol();
          }
        },
      ])
      return false;
    }
    if (!this.state.mobile) {
      const msg = loginType === BY_PASSWORD && "请输入登录名" || "请输入您的手机号";
      ToastShort(msg)
      return false;
    }
    showModal('登录中');
    switch (loginType) {
      case BY_SMS:
        if (!this.state.verifyCode) {
          showError('请输入短信验证码')
          return false;
        }
        this._signIn(this.state.mobile, this.state.verifyCode, "短信验证码");
        break;
      case BY_PASSWORD:
        if (!this.state.password) {
          showError('请输入登录密码')
          return false;
        }
        this._signIn(this.state.mobile, this.state.password, "帐号和密码");
        break;
      default:
        showError('登录类型错误')
    }
  }

  queryCommonConfig(uid) {
    let flag = false;
    showModal()
    let {accessToken, currStoreId} = this.props.global;
    const {dispatch, navigation} = this.props;
    dispatch(getCommonConfig(accessToken, currStoreId, (ok, err_msg, cfg) => {
      if (ok) {
        let only_store_id = currStoreId;
        if (only_store_id > 0) {
          dispatch(check_is_bind_ext({token: accessToken, user_id: uid, storeId: only_store_id}, (binded) => {
            this.doneSelectStore(only_store_id, !binded);
          }));
        } else {
          let store = cfg.canReadStores[Object.keys(cfg.canReadStores)[0]];
          this.doneSelectStore(store.id, flag);
        }
      } else {
        showError(err_msg);
      }
    }));
  }

  doneSelectStore(storeId, not_bind = false) {
    const {dispatch, navigation} = this.props;
    let {accessToken} = this.props.global;
    dispatch(getCommonConfig(accessToken, storeId, () => {
    }));
    const setCurrStoreIdCallback = (set_ok, msg) => {
      if (set_ok) {

        dispatch(setCurrentStore(storeId));
        if (not_bind) {
          hideModal()
          navigation.navigate(Config.ROUTE_PLATFORM_LIST)
          return true;
        }
        navigation.navigate(this.next || Config.ROUTE_ORDER, this.nextParams)
        tool.resetNavStack(navigation, Config.ROUTE_ALERT);
        hideModal()
        return true;
      } else {
        showError(msg);
        return false;
      }
    };
    if (Platform.OS === 'ios') {
      setCurrStoreIdCallback(true, '');
    } else {
      native.setCurrStoreId(storeId, setCurrStoreIdCallback);
    }
  }

  _signIn(mobile, password, name) {
    const {dispatch} = this.props;
    dispatch(signIn(mobile, password, this.props, (ok, msg, token, uid) => {
      if (ok) {
        this.doSaveUserInfo(token);
        this.queryCommonConfig(uid)
        if (uid) {
          this.mixpanel.identify(uid);
          const alias = `uid_${uid}`;
          JPush.setAlias({alias: alias, sequence: dayjs().unix()})
          JPush.isPushStopped((isStopped) => {
            if (isStopped) {
              JPush.resumePush();
            }
          })
        }
        hideModal()
        return true;
      } else {
        if (msg.indexOf("注册") != -1) {

          this.props.navigation.navigate('Apply', {mobile, verifyCode: password})
        }
        ToastShort(msg ? msg : "登录失败，请输入正确的" + name)
        return false;
      }
    }));
  }


  doSaveUserInfo(token) {
    HttpUtils.get.bind(this.props)(`/api/user_info2?access_token=${token}`).then(res => {
      GlobalUtil.setUser(res)
    })
    return true;
  }

  render() {
    return (
      <View style={{backgroundColor: '#e4ecf7', width: width, height: height}}>
        <ScrollView style={{zIndex: 101, flex: 1}}>
          <View>
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
            <View style={styles.inputs}>
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
          </View>
        </ScrollView>

        <ImageBackground source={require('../../../img/Login/login_bird.jpg')} style={{
          resizeMode: "cover",
          justifyContent: "center",
          height: pxToDp(612),
        }}>
          <TouchableOpacity onPress={() => {
            if (!this.state.authorization) {
              this.mixpanel.track("openApp_readandagree_click", {});
            } else {
              this.mixpanel.optOutTracking();
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
                } else {
                  this.mixpanel.optOutTracking();
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
              this.mixpanel.track("info_customerservice_click", {});
              JumpMiniProgram("/pages/service/index", {place: 'login'});
              // native.dialNumber('18910275329');
            }}>联系客服</Text>
          </View>
        </ImageBackground>
      </View>
    )
  }

  onReadProtocol = () => {
    if (this.state.authorization) {
      this.mixpanel.track("openApp_privacy_click", {});
    }
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScene)
