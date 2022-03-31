import React, {PureComponent} from 'react'
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import colors from '../../../pubilc/styles/colors'
import pxToDp from '../../../util/pxToDp'

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
import {CountDownText} from "../../../widget/CounterText";
import Config from '../../../pubilc/common/config'
import {native} from "../../../util";
import tool from "../../../pubilc/common/tool";
import {CheckBox} from 'react-native-elements'
import {hideModal, showError, showModal, showSuccess} from "../../../pubilc/util/ToastUtils";
import HttpUtils from "../../../pubilc/util/http";
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import JPush from "jpush-react-native";

import {MixpanelInstance} from '../../../util/analytics';
import JbbText from "../../common/component/JbbText";
import dayjs from "dayjs";
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

  onRequestSmsCode() {

    if (this.state.mobile && tool.length(this.state.mobile) > 10) {

      const {dispatch} = this.props;
      dispatch(requestSmsCode(this.state.mobile, 0, (success) => {
        const msg = success ? "短信验证码已发送" : "短信验证码发送失败";
        if (this.state.authorization) {
          this.mixpanel.track("openApp_SMScode_click", {msg: msg});
        }
        if (success) {
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
    this.setState({canAskReqSmsCode: false});
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
      showError(msg)
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
        showError(msg ? msg : "登录失败，请输入正确的" + name)
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
        <ScrollView style={{zIndex: 10, flex: 1}}>
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
                source={require('../../../pubilc/img/Login/ic_launcher.png')}/>
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
                  underlineColorAndroid='transparent'
                  placeholder="请输入验证码"
                  onChangeText={(verifyCode) => this.setState({verifyCode})}
                  value={this.state.verifyCode}

                  placeholderTextColor={'#cad0d9'}
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
                  <CountDownText
                    ref={counter => this.counterText = counter}
                    style={styles.counter}
                    countType='seconds' // 计时类型：seconds / date
                    auto={false}
                    afterEnd={this.onCounterReReqEnd}
                    timeLeft={this.state.reRequestAfterSeconds}
                    step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                    startText='获取验证码'
                    endText='获取验证码'
                    intervalText={(sec) => {
                      this.setState({reRequestAfterSeconds: sec});
                      return sec + '秒重新获取';
                    }
                    }
                  />
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
                overflow: "hidden",
                borderWidth: pxToDp(0)
              }}
                                activeStyle={{backgroundColor: '#039702'}} type={'primary'} onClick={this.onPress}
                                onPress={this.onLogin}>
                <Text
                  style={{color: 'white', textAlign: 'center', lineHeight: pxToDp(96), fontSize: pxToDp(30)}}>登录</Text>
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

        <View style={{
          textAlign: 'center',
          position: 'absolute',
          width: '100%',
          left: '17%',
          bottom: pxToDp(350),
          flexDirection: 'row',
          zIndex: 101
        }}>
          <View style={{flex: 1,}}>
            <CheckBox
              checked={this.state.authorization}
              onPress={()=>{
                if (!this.state.authorization) {
                  this.mixpanel.track("openApp_readandagree_click", {});
                } else {
                  this.mixpanel.optOutTracking();
                }
                let authorization = !this.state.authorization;
                this.setState({authorization: authorization})
              }}
            />
          </View>
          <View style={{flex: 7,marginTop:pxToDp(34)}}>
            <Text>我已阅读并同意
              <Text onPress={this.onReadProtocol} style={{color: colors.main_color}}>外送帮隐私政策 </Text>
            </Text>
          </View>
        </View>
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          marginBottom: pxToDp(270),
          zIndex: 100
        }}>
          <JbbText style={{fontSize: 16}}>遇到问题，请</JbbText>
          <JbbText style={{
            fontSize: 16,
            color: '#59b26a',
            textDecorationColor: '#59b26a',
            textDecorationLine: 'underline',
            marginLeft: pxToDp(10)
          }} onPress={() => {
            this.mixpanel.track("info_customerservice_click", {});
            JumpMiniProgram("/pages/service/index", {place: 'login'});
            // native.dialNumber('18910275329');
          }}>联系客服</JbbText>
        </View>

        <Image style={{
          bottom: pxToDp(40),
          width: pxToDp(684),
          height: pxToDp(612),
          zIndex: 1,
          position: 'absolute',
          marginLeft: pxToDp(18)
        }}
               source={require('../../../pubilc/img/Login/login_bird.jpg')}/>
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
