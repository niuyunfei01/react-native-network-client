import React, {PureComponent} from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  Text,
  ImageBackground,
  Image,
  Button,
  ToastAndroid,
  NativeModules,
  ActivityIndicator
} from 'react-native'
import {FormInput} from 'react-native-elements'
import Dimensions from 'Dimensions'
import colors from '../../styles/colors'
import pxToDp from '../../util/pxToDp'

import * as globalActions from '../../reducers/global/globalActions'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {CountDownText} from "../../widget/CounterText";

const {BY_PASSWORD, BY_SMS} = {BY_PASSWORD: 'password', BY_SMS: 'sms'}

import Config from '../../config'
import * as native from "../../common/native";

var styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
  },
  container: {
    flexDirection: 'column',
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
    borderColor: '#999999'
  }
})

let {height, width} = Dimensions.get('window')

function mapStateToProps(state) {
  return {
    userProfile: state.global.currentUserPfile
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class LoginScene extends PureComponent {

  static navigationOptions = {
    headerStyle: {
      position: 'absolute',
      top: 0,
      left: 0
    },
    headerBackTitleStyle: {
      opacity: 0,
    },
    headerTintColor: '#fff'
  };

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
    };
    this.onMobileChanged = this.onMobileChanged.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onRequestSmsCode = this.onRequestSmsCode.bind(this);
    this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this)
    this.doneReqSign = this.doneReqSign.bind(this)

    const params = (this.props.navigation.state.params || {});
    this.next = params.next;
    this.nextParams = params.nextParams;
  }

  clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
  }

  componentWillMount() {
    this.props.actions.logout();
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  onRequestSmsCode() {
    if (this.state.mobile) {
      this.setState({canAskReqSmsCode: true});
      //this.counterText.start();
      this.props.actions.requestSmsCode(this.state.mobile, 0, (success) => {
        ToastAndroid.showWithGravity(success ? "短信验证码已发送" : "短信验证码发送失败",
          success ? ToastAndroid.SHORT : ToastAndroid.LONG, ToastAndroid.CENTER)
      });
    } else {
      ToastAndroid.showWithGravity("请输入您的手机号", ToastAndroid.SHORT, ToastAndroid.CENTER)
    }
  }

  onCounterReReqEnd() {
    this.setState({canAskReqSmsCode: false});
  }

  onMobileChanged() {

  }

  onLogin() {

    const loginType = this.state.loginType;

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
        this.signIn(this.state.mobile, this.state.verifyCode, "短信验证码");
        break;
      case BY_PASSWORD:
        if (!this.state.password) {
          ToastAndroid.show("请输入登录密码", ToastAndroid.LONG)
          return false;
        }
        this.signIn(this.state.mobile, this.state.password, "帐号和密码");
        break;
      default:
        ToastAndroid.show("error to log in!", ToastAndroid.LONG);
    }
  }

  signIn(mobile, password, name) {

    this.setState({doingSign: true});

    const self = this;
    this.props.actions.signIn(mobile, password, (ok, msg) => {
      self.doneReqSign()
      if (ok) {
        console.log('login done with ok, next:', this.next, "params", this.nextParams)
        if (Config.ROUTE_ORDERS === this.next || !this.next) {
          native.toOrders();
        } else {
          this.props.navigation.navigate(this.next || Config.ROUTE_ALERT, this.nextParams)
        }
      } else {
        ToastAndroid.show("登录失败，请输入正确的" + name, ToastAndroid.LONG)
        return false;
      }
    })
  }

  doneReqSign() {
    this.setState({doingSign: false})
  }

  render() {
    return ( <Image style={styles.backgroundImage} source={require('../../img/Login/login_bg.png')}>
      <View style={styles.container}>
        <ScrollView horizontal={false} width={width} height={height}>
          <View style={{marginTop: 100}}>
            <ActivityIndicator animating={this.state.doingSign}/>
            <View>
              <FormInput onChangeText={(mobile) => {
                this.setState({mobile})
              }}
                         value={this.state.mobile}
                         keyboardType="numeric"
                         placeholder="请输入手机号"/>
            </View>
            <View style={styles.inputs}>
              <View style={{flexDirection: 'row'}}>
                <FormInput placeholder="请输入验证码"
                           onChangeText={(verifyCode) => this.setState({verifyCode})}
                           value={this.state.verifyCode}
                           keyboardType="numeric"
                           containerStyle={{width: width - 180}}
                           placeholderColor={colors.default_container_bg}
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
                  : <TouchableOpacity style={{alignSelf: 'center'}} onPress={this.onRequestSmsCode}>
                    <Text
                      style={{fontSize: pxToDp(colors.actionSecondSize), color: colors.main_vice_color}}>获取验证码</Text>
                  </TouchableOpacity>
                }
              </View>
            </View>

            <View style={{marginLeft: 15, marginRight: 15}}>
              <TouchableOpacity>
                <Text>比邻鲜使用协议</Text>
              </TouchableOpacity>
              <Button style={{marginTop: pxToDp(110)}} color={colors.main_color} title="登录"
                      onPress={this.onLogin}/>

              <View style={{alignItems: 'center'}}>
                <TouchableOpacity>
                  <Text onPress={() => {
                    this.props.navigation.navigate('Apply')
                  }}
                        style={{
                          color: colors.main_color,
                          fontSize: pxToDp(colors.actionSecondSize),
                          marginTop: pxToDp(50)
                        }}>我要开店</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </View>
    </Image>)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScene)