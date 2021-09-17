import React, {PureComponent} from 'react'
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  Dimensions,
  View, Alert, NativeModules, DeviceEventEmitter
} from 'react-native'
import colors from '../../styles/colors'
import pxToDp from '../../util/pxToDp'

import {
  getCommonConfig,
  logout,
  requestSmsCode,
  setCurrentStore,
  signIn,
  check_is_bind_ext,
  setUserProfile
} from '../../reducers/global/globalActions'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {CountDownText} from "../../widget/CounterText";
import Config from '../../config'
import {native} from "../../common";
import Toast from "../../weui/Toast/Toast";
import tool from "../../common/tool";
import {Button} from "@ant-design/react-native";
import {ToastLong} from "../../util/ToastUtils";
import HttpUtils from "../../util/http";
import GlobalUtil from "../../util/GlobalUtil";
import JPush from "jpush-react-native";
import Moment from "moment/moment";
import {Checkbox, List, WhiteSpace} from '@ant-design/react-native';

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

  // static navigationOptions = {
  //   headerStyle: {
  //     position: 'absolute',
  //     top: 0,
  //     left: 0
  //   },
  //   headerBackTitleStyle: {
  //     opacity: 0,
  //   },
  //   headerTintColor: '#fff'
  // };

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
      authorization: false,
    };
    this.onLogin = this.onLogin.bind(this);
    this.onRequestSmsCode = this.onRequestSmsCode.bind(this);
    this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this);
    this.doneReqSign = this.doneReqSign.bind(this);
    this.queryCommonConfig = this.queryCommonConfig.bind(this);
    this.doneSelectStore = this.doneSelectStore.bind(this);

    const params = (this.props.route.params || {});
    this.next = params.next;
    this.nextParams = params.nextParams;

    Alert.alert('提示', '请先阅读隐私政策并勾选同意', [
      {text: '拒绝', style: 'cancel'},
      {
        text: '阅读', onPress: () => {
          this.setState({authorization: true})
          this.onReadProtocol();
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
        ToastAndroid.showWithGravity(success ? "短信验证码已发送" : "短信验证码发送失败",
          success ? ToastAndroid.SHORT : ToastAndroid.LONG, ToastAndroid.CENTER)
      }));
    } else {
      ToastAndroid.showWithGravity("请输入您的手机号", ToastAndroid.SHORT, ToastAndroid.CENTER)
    }
  }

  onCounterReReqEnd() {
    this.setState({canAskReqSmsCode: false});
  }

  onLogin() {
    const loginType = this.state.loginType;
    console.log("onLogin, state:", this.state)
    if (!this.state.authorization) {
      Alert.alert('提示', '请先阅读隐私政策并勾选同意', [
        {text: '拒绝', style: 'cancel'},
        {
          text: '阅读', onPress: () => {
            this.setState({authorization: true})
            this.onReadProtocol();
          }
        },
      ])
      return false;
    }
    if (!this.state.mobile) {
      const msg = loginType === BY_PASSWORD && "请输入登录名" || "请输入您的手机号";
      ToastAndroid.show(msg, ToastAndroid.LONG)
      return false;
    }
    switch (loginType) {
      case BY_SMS:
        if (!this.state.verifyCode) {
          ToastAndroid.show('请输入短信验证码', ToastAndroid.LONG);
          return false;
        }
        this._signIn(this.state.mobile, this.state.verifyCode, "短信验证码");
        break;
      case BY_PASSWORD:
        if (!this.state.password) {
          ToastAndroid.show("请输入登录密码", ToastAndroid.LONG)
          return false;
        }
        this._signIn(this.state.mobile, this.state.password, "帐号和密码");
        break;
      default:
        ToastAndroid.show("error to log in!", ToastAndroid.LONG);
    }
  }

  queryCommonConfig(uid) {
    let flag = false;
    let {accessToken, currStoreId} = this.props.global;
    console.log()
    const {dispatch, navigation} = this.props;
    dispatch(getCommonConfig(accessToken, currStoreId, (ok, err_msg, cfg) => {
      if (ok) {
        let only_store_id = currStoreId;
        if (only_store_id > 0) {
          dispatch(check_is_bind_ext({token: accessToken, user_id: uid, storeId: only_store_id}, (binded) => {
            this.doneSelectStore(only_store_id, !binded);
          }));
        } else {
          console.log(cfg.canReadStores)
          let store = cfg.canReadStores[Object.keys(cfg.canReadStores)[0]];
          this.doneSelectStore(store.id, flag);
        }
      } else {
        ToastAndroid.show(err_msg, ToastAndroid.LONG);
      }
    }));
  }

  doneSelectStore(storeId, not_bind = false) {
    const {dispatch, navigation} = this.props;
    native.setCurrStoreId(storeId, (set_ok, msg) => {
      console.log('set_ok -> ', set_ok, msg);
      if (set_ok) {
        dispatch(setCurrentStore(storeId));
        console.log('this.next -> ', this.next);
        if (not_bind) {
          navigation.navigate(Config.ROUTE_PLATFORM_LIST)
          return true;
        }
        if (Config.ROUTE_ORDERS === this.next || !this.next) {
          console.log('this.next -> ', this.next);
          native.toOrders();
        } else {
          console.log('this.next -> ', this.next);
          navigation.navigate(this.next || Config.ROUTE_Mine, this.nextParams)
        }

        tool.resetNavStack(navigation, Config.ROUTE_ALERT);
        return true;
      } else {
        ToastLong(msg);
        return false;
      }
    });
  }

  _signIn(mobile, password, name) {
    this.setState({doingSign: true});
    const {dispatch} = this.props;
    console.log(`_signIn, start login:${mobile}, password:${password}, name: ${name}`)
    dispatch(signIn(mobile, password, (ok, msg, token, uid) => {
      if (ok) {
        this.doSaveUserInfo(token);
        this.queryCommonConfig(uid)
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
        return true;
      } else {
        ToastAndroid.show(msg ? msg : "登录失败，请输入正确的" + name, ToastAndroid.LONG);
        this.doneReqSign();
        return false;
      }
    }));
  }

  doneReqSign() {
    this.setState({doingSign: false})
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
        <Toast icon="loading" show={this.state.doingSign} onRequestClose={() => {
        }}>正在登录...</Toast>
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
                  keyboardType="numeric"
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
          left: '15%',
          bottom: pxToDp(100),
          zIndex: 100
        }} onChange={
          () => {
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
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScene)
