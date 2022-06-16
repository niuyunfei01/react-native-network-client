import React, {PureComponent} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Platform, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {Button, CheckBox} from 'react-native-elements'
import * as globalActions from '../../../reducers/global/globalActions'
import pxToDp from '../../../pubilc/util/pxToDp';
import stringEx from "../../../pubilc/util/stringEx"
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";
import {hideModal, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import BottomModal from "../../../pubilc/component/BottomModal";

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

class RegisterScene extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      mobile: '',
      verifyCode: '',
      canAskReqSmsCode: false,
      reRequestAfterSeconds: 60,
      doingRegister: false,
      checkBox: false,
      show_auth_modal: false,
    }
    this.mixpanel = MixpanelInstance;
  }

  onRegister() {
    if (!this.state.checkBox) {
      return this.setState({
        show_auth_modal: true
      })
    }
    if (!this.state.mobile || !stringEx.isMobile(this.state.mobile)) {
      ToastShort("手机号有误")
      return false
    }
    if (!this.state.verifyCode) {
      ToastShort("请输入短信验证码")
      return false
    }
    if (!this.state.checkBox) {
      ToastShort("请阅读并同意「外送帮使用协议」")
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
      hideModal()
      this.setState({doingRegister: false})
      if (success) {
        ToastShort('注册成功，请填写店铺信息')
        setTimeout(() => this.props.navigation.navigate('Apply', data), 500)
      } else {
        ToastShort(msg)
      }
    })
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
        }, () => {
          if (this.getCountdown() === 0) {
            this.setState({canAskReqSmsCode: false, reRequestAfterSeconds: 60});
            clearInterval(this.interval)
          }
        })
      }, Platform.OS === "ios" ? 1000 : 2000)
      this.props.actions.requestSmsCode(this.state.mobile, 0, (success) => {
        if (success) {
          ToastShort('短信验证码已发送')
        } else {
          this.setState({canAskReqSmsCode: false});
          ToastShort('短信验证码发送失败')
        }
        if (this.state.checkBox) {
          this.mixpanel.track("Phoneinput_SMScode_click", {msg: success ? '短信验证码已发送' : '短信验证码发送失败'});
        }
      });
    } else {
      this.setState({canAskReqSmsCode: false});
      ToastShort('手机号有误')
    }
  }

  render() {
    return (
      <ScrollView style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}>
        <View style={{
          paddingTop: 30,
          flex: 1,
          backgroundColor: colors.white,
          borderRadius: 8,
          paddingBottom: 40,
        }}>

          <View style={{
            flexDirection: 'row',
            marginLeft: 10,
          }}>
            <View style={{
              width: 40,
              height: pxToDp(90),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <FontAwesome5 name={'mobile'} style={{
                fontSize: 25,
                color: colors.main_color,
              }}/>
            </View>
            <View style={{
              width: "80%"
            }}>
              <TextInput onChangeText={(mobile) => {
                mobile = mobile.replace(/[^\d]+/, '');
                this.setState({mobile})
              }}
                         type={"number"}
                         maxLength={11}
                         value={this.state.mobile}
                         style={{
                           color: colors.color333,
                           borderBottomWidth: pxToDp(1),
                           borderBottomColor: '#999',
                           fontSize: 16,
                           // marginHorizontal: pxToDp(50),
                           height: pxToDp(90),
                         }}
                         keyboardType="numeric"
                         placeholder={"手机号码"}
                         placeholderTextColor={'#ccc'}
                         underlineColorAndroid="transparent"/>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            marginTop: 20,
            marginLeft: 10,
          }}>

            <View style={{
              width: 40,
              height: pxToDp(90),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <FontAwesome5 name={'envelope'} style={{
                fontSize: 18,
                color: colors.main_color,
              }}/>
            </View>

            <View style={{
              width: "48%"
            }}>
              <TextInput onChangeText={(verifyCode) => {
                verifyCode = verifyCode.replace(/[^\d]+/, '');
                this.setState({verifyCode})
              }}
                         type={"number"}
                         keyboardType="numeric"
                         value={this.state.verifyCode}
                         style={{
                           color: colors.color333,
                           borderBottomWidth: pxToDp(1),
                           borderBottomColor: '#999',
                           fontSize: 16,
                           height: pxToDp(90),
                         }}
                         placeholder={"手机验证码"}
                         placeholderTextColor={'#ccc'}
                         underlineColorAndroid="transparent"/>
            </View>
            {this.state.canAskReqSmsCode ?
              <Button buttonStyle={{backgroundColor: colors.fontColor, marginLeft: 6}}
                      titleStyle={{fontSize: 14, color: colors.white}}
                      title={this.state.reRequestAfterSeconds + "秒重新获取"}/>
              : <Button buttonStyle={{backgroundColor: colors.main_color, marginLeft: 6}}
                        titleStyle={{fontSize: 14, color: colors.white}} title={'获取验证码'}
                        onPress={() => this.onRequestSmsCode()}/>
            }

          </View>
          <TouchableOpacity onPress={() => {
            if (!this.state.checkBox) {
              this.mixpanel.track("Phoneinput_read&agree_click", {});
            }
            let checkBox = !this.state.checkBox;
            this.setState({checkBox})
          }} style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
            <CheckBox
              checkedColor={colors.main_color}
              style={{margin: 0, padding: 0}}
              checked={this.state.checkBox}
              onPress={() => {
                if (!this.state.checkBox) {
                  this.mixpanel.track("Phoneinput_read&agree_click", {});
                }
                let checkBox = !this.state.checkBox;
                this.setState({checkBox})
              }}
            />
            <Text style={{color: colors.color333, marginRight: 3, fontSize: 14}}>我已阅读并同意
            </Text>
            <Text onPress={this.onReadProtocol} style={{color: colors.main_color, fontSize: 14}}>外送帮隐私政策 </Text>
          </TouchableOpacity>

          <Button
            title={'下一步'}
            buttonStyle={{
              backgroundColor: colors.main_color,
              width: "88%",
              marginLeft: '6%'
            }}
            onPress={() => {
              if (this.state.checkBox) {
                this.mixpanel.track("Phoneinput_next_click", {});
              }
              this.onRegister()
            }}/>

        </View>

        <BottomModal title={'提示'} actionText={'同意'} closeText={'取消'} onPress={this.closeModal}
                     visible={this.state.show_auth_modal} onPressClose={this.closeModal}
                     onClose={this.closeModal} btnStyle={{backgroundColor: colors.main_color}}>
          <View style={{marginVertical: 10, marginHorizontal: 6}}>
            <Text style={{fontSize: 14, color: colors.color333}}> 1.请先阅读并同意 <Text
              style={{fontSize: 16, color: colors.main_color}} onPress={this.onReadProtocol}> 隐私政策 </Text> </Text>
            <Text
              style={{fontSize: 14, color: colors.color333, marginVertical: 6}}> 2.授权app收集外送帮用户信息以提供发单及修改商品等服务 </Text>
            <Text style={{fontSize: 14, color: colors.color333}}> 3.请手动勾选隐私协议 </Text>
          </View>
        </BottomModal>

      </ScrollView>
    )
  }

  closeModal = () => {
    this.setState({
      show_auth_modal: false
    })
  }

  onReadProtocol = () => {
    const {navigation} = this.props;
    if (this.state.checkBox) {
      this.mixpanel.track("Phoneinput_privacy_click", {});
    }
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScene);
