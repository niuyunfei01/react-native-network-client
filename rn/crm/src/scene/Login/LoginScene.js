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
import colors from '../../styles/colors'
import pxToDp from '../../util/pxToDp'

import {
  check_is_bind_ext,
  getCommonConfig,
  logout,
  requestSmsCode,
  set_mixpanel_id,
  setCurrentStore,
  signIn,
} from '../../reducers/global/globalActions'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {CountDownText} from "../../widget/CounterText";
import Config from '../../config'
import {native} from "../../common";
import tool from "../../common/tool";
import {Button, Checkbox} from "@ant-design/react-native";
import {hideModal, showError, showModal, showSuccess} from "../../util/ToastUtils";
import HttpUtils from "../../util/http";
import GlobalUtil from "../../util/GlobalUtil";
import JPush from "jpush-react-native";
import Moment from "moment/moment";

import {MixpanelInstance} from '../../common/analytics';

const AgreeItem = Checkbox.AgreeItem;
const CheckboxItem = Checkbox.CheckboxItem;
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

    if(this.state.authorization) {
      this.mixpanel.track("openApp_page_view", {});
    }

    Alert.alert('提示', '请先阅读并同意隐私政策,授权app收集外送帮用户信息以提供发单及修改商品等服务,并手动勾选隐私协议', [
      {text: '拒绝', style: 'cancel'},
      {
        text: '同意', onPress: () => {
          // this.setState({authorization: true})
          // this.onReadProtocol();
        }
      },
    ])
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

    if (this.state.mobile) {

      this.setState({canAskReqSmsCode: true});
      const {dispatch} = this.props;
      dispatch(requestSmsCode(this.state.mobile, 0, (success) => {
        const msg = success ? "短信验证码已发送" : "短信验证码发送失败";

        if(this.state.authorization) {
          this.mixpanel.track("openApp_SMScode_click", {msg: msg});
        }
        if (success) {
          showSuccess(msg)
        } else {
          showError(msg)
        }
      }));
    } else {
      showError("请输入您的手机号")
    }
  }

  onCounterReReqEnd() {
    this.setState({canAskReqSmsCode: false});
  }

  onLogin() {
    const loginType = this.state.loginType;
    console.log("onLogin, state:", this.state)
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
    const setCurrStoreIdCallback = (set_ok, msg) => {
      console.log('set_ok -> ', set_ok, msg);
      if (set_ok) {

        dispatch(setCurrentStore(storeId));
        console.log('this.next -> ', this.next);
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

        if(this.state.authorization) {
          this.mixpanel.alias("newer ID", uid)
        }
        if (uid) {
          const alias = `uid_${uid}`;
          JPush.setAlias({alias: alias, sequence: Moment().unix()})
          JPush.isPushStopped((isStopped) => {
            console.log(`JPush is stopped:${isStopped}`)
            if (isStopped) {
              JPush.resumePush();
            }
          })
          console.log(`Login setAlias ${alias}`)
        }
        hideModal()
        return true;
      } else {
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
                source={require('../../img/Login/ic_launcher.png')}/>
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
                      style={{fontSize: pxToDp(colors.actionSecondSize), color: colors.main_vice_color}}>获取验证码</Text>
                  </TouchableOpacity>
                }
              </View>
            </View>

            <View style={{marginLeft: 15, marginRight: 15}}>
              <Button style={{
                height: pxToDp(90),
                borderRadius: pxToDp(45),
                marginTop: pxToDp(50),
                marginHorizontal: pxToDp(20),
                backgroundColor: "#59b26a",
                borderColor: "rgba(0,0,0,0.2)",
                overflow: "hidden"
              }}
                      activeStyle={{backgroundColor: '#039702'}} type={'primary'} onClick={this.onPress}
                      onPress={this.onLogin}>登录</Button>
              <View style={{alignItems: 'center'}}>
                <TouchableOpacity onPress={() => {

                  if(this.state.authorization) {
                    this.mixpanel.track("openApp_signupstore_click", {});
                  }
                  this.props.navigation.navigate('Register')
                }}>
                  <Text style={{
                    color: colors.main_color,
                    fontSize: pxToDp(colors.actionSecondSize),
                    marginTop: pxToDp(50)
                  }}>注册门店</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <AgreeItem checked={this.state.authorization} style={{
          textAlign: 'center',
          position: 'absolute',
          width: '100%',
          left: '20%',
          bottom: pxToDp(300),
          zIndex: 100
        }} onChange={
          () => {
            if(!this.state.authorization){
              this.mixpanel.reset();
              this.mixpanel.getDistinctId().then(res => {
                if (tool.length(res) > 0) {
                  const {dispatch} = this.props;
                  dispatch(set_mixpanel_id(res));
                  this.mixpanel.alias("new ID", res)
                }
              })
              this.mixpanel.track("openApp_readandagree_click", {});
            }else{
              this.mixpanel.optOutTracking();
            }
            let authorization = !this.state.authorization;
            this.setState({authorization: authorization})
          }
        }>
          <Text>我已阅读并同意
            <Text onPress={this.onReadProtocol} style={{color: colors.main_color}}>外送帮隐私政策</Text>
          </Text>
        </AgreeItem>

        <Image style={{
          bottom: pxToDp(40),
          width: pxToDp(684),
          height: pxToDp(612),
          zIndex: 1,
          position: 'absolute',
          marginLeft: pxToDp(18)
        }}
               source={require('../../img/Login/login_bird.jpg')}/>
      </View>
    )
  }

  onReadProtocol = () => {
    if(this.state.authorization){
      this.mixpanel.track("openApp_privacy_click", {});
    }

    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScene)
