import React, {PureComponent} from 'react';
import {Alert, Image, ScrollView, StyleSheet, Text, View} from 'react-native'
import {bindActionCreators} from "redux";
import {Checkbox} from "@ant-design/react-native";
import pxToDp from '../../util/pxToDp';
import {CountDownText} from "../../widget/CounterText";
import * as globalActions from '../../reducers/global/globalActions'
import {Button, ButtonArea, Cell, CellBody, CellFooter, CellHeader, Cells, Input} from "../../weui/index";
import stringEx from "../../util/stringEx"
import colors from "../../styles/colors";
import {connect} from "react-redux";
import Config from "../../config";
import {hideModal, showError, showModal, showSuccess} from "../../util/ToastUtils";

/**
 * ## Redux boilerplate
 */
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

const mobileInputPlaceHold = "手机号码";
const validCodePlaceHold = "短信验证码";
const requestCodeSuccessMsg = "短信验证码已发送";
const requestCodeErrorMsg = "短信验证码发送失败";
const RegisterSuccessMsg = "注册成功，请填写店铺信息";
const RegisterErrorMsg = "申请失败，请重试!";
const validErrorMobile = "手机号有误";
const validEmptyCode = "请输入短信验证码";
const validEmptyCheckBox = "请阅读并同意「外送帮使用协议」";

class RegisterScene extends PureComponent {

  // navigationOptions = ({navigation}) => (navigation.setOptions({
  //   headerTitle: () => (
  //     <View style={{flexDirection: 'row', alignSelf: 'center'}}>
  //       <Text style={{
  //         textAlignVertical: "center",
  //         textAlign: "center",
  //         color: "#ffffff",
  //         fontWeight: 'bold',
  //         fontSize: 20
  //       }}>我要注册</Text>
  //     </View>
  //   ),
  //   headerStyle: {backgroundColor: '#59b26a'},
  //   headerRight: () => (<View/>),
  //   headerLeft: () => (
  //     <NavigationItem
  //       icon={require('../../img/Register/back_.png')}
  //       iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
  //       onPress={() => {
  //         navigation.navigate('Login')
  //       }}
  //     />),
  // }))

  constructor(props) {
    super(props)
    this.state = {
      mobile: '',
      verifyCode: '',
      canAskReqSmsCode: false,
      reRequestAfterSeconds: 60,
      doingRegister: false,
      checkBox: false,
    }

    this.doRegister = this.doRegister.bind(this)
    this.onRegister = this.onRegister.bind(this)
    this.onRequestSmsCode = this.onRequestSmsCode.bind(this)
    this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this)
    this.doneRegister = this.doneRegister.bind(this)
    this.showSuccessToast = this.showSuccessToast.bind(this)
    this.showErrorToast = this.showErrorToast.bind(this)

    // this.navigationOptions(this.props)
    // Alert.alert('提示', '请先阅读隐私政策并勾选同意', [
    //   {text: '拒绝', style: 'cancel'},
    //   {
    //     text: '同意', onPress: () => {
    //       // this.setState({checkBox: true})
    //     }
    //   },
    // ])

  }

  onRegister() {
    if (!this.state.checkBox) {
      Alert.alert('提示', '1.请先阅读并同意隐私政策,\n2.授权app收集外送帮用户信息以提供发单及修改商品等服务,\n3.请手动勾选隐私协议', [
        {text: '拒绝', style: 'cancel'},
        {
          text: '同意', onPress: () => {
            // this.setState({checkBox: true})
          }
        },
      ])
      return false;
    }
    if (!this.state.mobile || !stringEx.isMobile(this.state.mobile)) {
      this.showErrorToast(validErrorMobile)
      return false
    }
    if (!this.state.verifyCode) {
      this.showErrorToast(validEmptyCode)
      return false
    }
    if (!this.state.checkBox) {
      this.showErrorToast(validEmptyCheckBox)
      return false
    }

    if (this.state.doingRegister) {
      return false;
    }
    this.doRegister();
  }

  doRegister() {
    showModal('加载中')
    this.setState({doingRegister: true});
    let data = {
      mobile: this.state.mobile,
      verifyCode: this.state.verifyCode,
    };
    this.props.actions.checkPhone(data, (success, msg) => {
      this.doneRegister();
      if (success) {
        this.showSuccessToast(RegisterSuccessMsg);
        setTimeout(() => this.props.navigation.navigate('Apply', data), 500)
      } else {
        this.showErrorToast(msg)
      }
    })
  }

  doneRegister() {
    hideModal()
    this.setState({doingRegister: false})
  }


  showSuccessToast(msg) {
    showSuccess(msg)

  }

  showErrorToast(msg) {
    showError(msg)
  }

  onRequestSmsCode() {
    if (this.state.mobile && stringEx.isMobile(this.state.mobile)) {
      this.setState({canAskReqSmsCode: true});
      this.props.actions.requestSmsCode(this.state.mobile, 0, (success) => {
        if (success) {
          this.showSuccessToast(requestCodeSuccessMsg)
        } else {
          this.setState({canAskReqSmsCode: false});
          this.showErrorToast(requestCodeErrorMsg)
        }
      });
    } else {
      this.setState({canAskReqSmsCode: false});
      this.showErrorToast(validErrorMobile)
    }
  }

  onCounterReReqEnd() {
    this.setState({canAskReqSmsCode: false});
  }


  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.register_panel}>
          <Cells style={{borderTopWidth: 0, borderBottomWidth: 0,}}>
            <Cell first>
              <CellHeader>
                <Image source={require('../../img/Register/login_phone_.png')} style={{
                  width: pxToDp(33),
                  height: pxToDp(47),
                }}/>
              </CellHeader>
              <CellBody>
                <Input onChangeText={(mobile) => {
                  mobile = mobile.replace(/[^\d]+/, '');
                  this.setState({mobile})
                }}
                       type={"number"}
                       maxLength={11}
                       value={this.state.mobile}
                       style={styles.input}
                       keyboardType="numeric"
                       placeholder={mobileInputPlaceHold}
                       placeholderTextColor={'#ccc'}
                       underlineColorAndroid="transparent"/>
              </CellBody>
            </Cell>

            <Cell first>
              <CellHeader>
                <Image source={require('../../img/Register/login_message_.png')} style={{
                  width: pxToDp(39),
                  height: pxToDp(29),
                }}/>
              </CellHeader>
              <CellBody>
                <Input onChangeText={(verifyCode) => {
                  verifyCode = verifyCode.replace(/[^\d]+/, '');
                  this.setState({verifyCode})
                }}
                       type={"number"}
                       keyboardType="numeric"
                       value={this.state.verifyCode}
                       style={styles.input}
                       placeholder={validCodePlaceHold}
                       placeholderTextColor={'#ccc'}
                       underlineColorAndroid="transparent"/>
              </CellBody>
              <CellFooter>
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
                  : <Button type="primary" plain size="small"
                            onPress={this.onRequestSmsCode}>获取验证码</Button>
                }
              </CellFooter>
            </Cell>
            <Cell first>

              <CellBody>
                <Checkbox
                  checked={this.state.checkBox}
                  onChange={event => {
                    this.setState({checkBox: event.target.checked});
                  }}
                >我已阅读并同意</Checkbox>
              </CellBody>
              <CellFooter>
                <Text onPress={() => {
                  this.onReadProtocol()
                }} style={{color: colors.main_color}}>外送帮隐私政策</Text>
              </CellFooter>
            </Cell>
          </Cells>
          <ButtonArea style={{marginBottom: pxToDp(20), marginTop: pxToDp(50)}}>
            <Button type="primary" onPress={() => this.onRegister()}>下一步</Button>
          </ButtonArea>

        </View>
      </ScrollView>
    )
  }

  onReadProtocol = () => {
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  register_panel: {
    flex: 1,
    backgroundColor: 'white',
    marginLeft: pxToDp(72),
    marginRight: pxToDp(72)
  },
  counter: {
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#5A5A5A',
    backgroundColor: 'transparent',
    paddingLeft: 14 * 0.75,
    paddingRight: 14 * 0.75,
    paddingTop: 6 * 0.75,
    paddingBottom: 6 * 0.75,
  },
  input: {
    color: "#999",
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#999'
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScene);
