import React, {PureComponent} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native'
import {bindActionCreators} from "redux";
import {CheckBox} from 'react-native-elements'
import pxToDp from '../../../util/pxToDp';
import * as globalActions from '../../../reducers/global/globalActions'
import {Button, ButtonArea, Cell, CellBody, CellFooter, CellHeader, Cells, Input} from "../../../weui";
import stringEx from "../../../util/stringEx"
import colors from "../../../pubilc/styles/colors";
import {connect} from "react-redux";
import Config from "../../../pubilc/common/config";
import {hideModal, showError, showModal, showSuccess} from "../../../pubilc/util/ToastUtils";
import {MixpanelInstance} from "../../../util/analytics";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

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
  //       icon={<FontAwesome5 name={'arrow-left'} style={{fontSize:25}}/>}
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
    this.mixpanel = MixpanelInstance;

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

  getCountdown() {
    return this.state.reRequestAfterSeconds;
  }

  onRequestSmsCode() {
    if (this.state.mobile && stringEx.isMobile(this.state.mobile)) {
      this.setState({canAskReqSmsCode: true});
      this.interval = setInterval(() => {
        this.setState({
          reRequestAfterSeconds: this.getCountdown() - 1
        })
        if (this.state.reRequestAfterSeconds === 0) {
          this.onCounterReReqEnd()
          clearInterval(this.interval)
        }
      }, 1000)
      this.props.actions.requestSmsCode(this.state.mobile, 0, (success) => {
        if (success) {
          this.showSuccessToast(requestCodeSuccessMsg)
        } else {
          this.setState({canAskReqSmsCode: false});
          this.showErrorToast(requestCodeErrorMsg)
        }
        const msg = success ? requestCodeSuccessMsg : requestCodeErrorMsg;
        if (this.state.checkBox) {
          this.mixpanel.track("Phoneinput_SMScode_click", {msg: msg});
        }

      });
    } else {
      this.setState({canAskReqSmsCode: false});
      this.showErrorToast(validErrorMobile)
    }
  }

  onCounterReReqEnd() {
    this.setState({canAskReqSmsCode: false, reRequestAfterSeconds: 60});
  }


  render() {
    return (
        <ScrollView style={styles.container}>
          <View style={styles.register_panel}>
            <Cells style={{borderTopWidth: 0, borderBottomWidth: 0,}}>
              <Cell first>
                <CellHeader>
                  <FontAwesome5 name={'mobile'} style={{
                    fontSize: pxToDp(33),
                    color: colors.main_color,
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
                  <FontAwesome5 name={'envelope'} style={{
                    fontSize: pxToDp(39),
                    color: colors.main_color,
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
                      <Button type="default" plain size="small">{this.state.reRequestAfterSeconds} 秒重新获取</Button>
                      : <Button type="primary" plain size="small"
                                onPress={this.onRequestSmsCode}>获取验证码</Button>
                  }
                </CellFooter>
              </Cell>
              <Cell first>

                <CellBody>
                  <View style={{
                    flexDirection: 'row',
                  }}>
                    <View style={{flex: 1,}}>
                      <CheckBox
                          checked={this.state.checkBox}
                          onPress={(event) => {
                            if (event.target.checked) {
                              this.mixpanel.track("Phoneinput_read&agree_click", {});
                            }
                            let checkBox = !this.state.checkBox;
                            this.setState({checkBox})
                          }}
                      />
                    </View>
                    <View style={{flex: 2.6, marginTop: pxToDp(34)}}>
                      <Text>我已阅读并同意</Text>
                    </View>
                  </View>

                </CellBody>
                <CellFooter>
                  <Text onPress={() => {
                    this.onReadProtocol()
                  }} style={{color: colors.main_color}}>外送帮隐私政策 </Text>
                </CellFooter>
              </Cell>
            </Cells>
            <ButtonArea style={{marginBottom: pxToDp(20), marginTop: pxToDp(50)}}>
              <Button type="primary" onPress={() => {

                if (this.state.checkBox) {
                  this.mixpanel.track("Phoneinput_next_click", {});
                }
                this.onRegister()
              }}>下一步</Button>
            </ButtonArea>

          </View>
        </ScrollView>
    )
  }

  onReadProtocol = () => {
    const {navigation} = this.props;

    if (this.state.checkBox) {
      this.mixpanel.track("Phoneinput_privacy_click", {});
    }
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
