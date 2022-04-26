import React, {PureComponent} from "react";
import {Image, ScrollView, Text, TextInput, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Button} from "react-native-elements";
import {wechatLogin} from "../../../pubilc/util/WechatUtils";
import HttpUtils from "../../../pubilc/util/http";
import {ToastShort} from "../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class BindPay extends PureComponent {

  constructor(props) {
    super(props);
    let data = this.props.route.params;
    if (!data) {
      ToastShort('操作失败')
      this.props.navigation.goBack();
    }
    let wechat = {};
    let alipay = {};
    if (data[0].icon === 'weixin') {
      wechat = data[0];
      alipay = data[1];
    } else {
      wechat = data[1];
      alipay = data[0];
    }
    this.state = {
      wechat,
      alipay,
      alipayAccount: alipay.account != null ? alipay.account : '',
      alipayName: alipay.name != null ? alipay.name : '',
    }
  }

  bindWechat() {
    let jscode = wechatLogin();
    if (jscode) {
      let {accessToken, currStoreId} = this.props.global;
      let url = `/api/create_wx_bind/${currStoreId}/${jscode}?access_token=${accessToken}`;
      HttpUtils.get.bind(this.props)(url).then((res) => {
        console.log(res, 'res')
      }).catch((res) => {
        console.log(res, 'err')
        ToastShort(res.reason)
      })
    }
  }

  setDefaultPay(type) {
    if (type === 'wx') {
      let wechat = this.state.wechat;
      wechat.default = true;
      this.setState({
        wechat,
      })
    } else {
      let alipay = this.state.alipay;
      alipay.default = true;
      this.setState({
        alipay,
      })
    }
    let {accessToken, currStoreId} = this.props.global;
    let url = `/api/bind_default_account_type/${currStoreId}/${type}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then((res) => {
      ToastShort(res.reason)
    }).catch((res) => {
      console.log(res, 'err')
      ToastShort("操作失败：" + res.reason)
    })
  }

  bindAlipay() {
    if (!this.state.alipayAccount || !this.state.alipayName) {
      ToastShort("请填写支付宝姓名和账号");
      return;
    }
    let {accessToken, currStoreId} = this.props.global;
    let url = `/api/create_wx_bind/${currStoreId}/${1}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then((res) => {
      console.log(res, 'res')
    }).catch((res) => {
      console.log(res, 'err')
      ToastShort(res.reason)
    })
  }


  render() {
    return (
      <ScrollView style={{flex: 1, padding: 10, backgroundColor: colors.background}}>
        {this.renderWechatInfo()}
        {this.renderAlipayInfo()}
      </ScrollView>
    );
  }

  renderWechatInfo() {
    return (
      <View style={{backgroundColor: colors.white, padding: 10, borderRadius: 8}}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 45,
          borderBottomWidth: pxToDp(1),
          borderColor: colors.colorEEE
        }}>
          <Text style={{color: colors.color333, fontWeight: 'bold', fontSize: 15}}>微信</Text>
          <If condition={this.state.wechat.default}>
            <View style={{backgroundColor: colors.red, padding: 4, marginLeft: 4, borderRadius: 6}}>
              <Text style={{fontSize: 10, color: colors.white}}>默认</Text>
            </View>
          </If>
          <View style={{flex: 1}}></View>

          <If condition={this.state.wechat.status_text === '已绑定'}>
            <Text onPress={() => {
              this.bindWechat()
            }} style={{color: colors.main_color, fontSize: 14}}>修改 </Text>
          </If>
        </View>

        <If condition={this.state.wechat.status_text === '已绑定'}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: pxToDp(1),
            borderColor: colors.colorEEE
          }}>
            <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/ebbind2.jpg'}}
                   style={{width: 40, height: 40, margin: 4}}/>
            <View style={{justifyContent: 'center', marginLeft: 10}}>
              <Text style={{color: colors.color333, fontSize: 16}}>{this.state.wechat.name} </Text>
              <Text style={{color: colors.color999, fontSize: 14, marginTop: 5}}>{this.state.wechat.account} </Text>
            </View>
          </View>
        </If>

        {this.state.wechat.status_text === '已绑定' ?
          <View>
            <Text style={{color: colors.warn_red, fontSize: 10, marginTop: 6}}>绑定成功后，结款会直接到当前微信的零钱中。</Text>
            <View style={{padding: 10, paddingBottom: 4}}>
              <Button onPress={() => {
                this.setDefaultPay('wx')
              }} title={'设为默认收款方式'} buttonStyle={{width: "100%", backgroundColor: colors.main_color}}
                      titleStyle={{color: colors.white}}/>
            </View>
          </View> :
          <View style={{padding: 10, paddingBottom: 4}}>
            <Button onPress={() => {
              this.bindWechat();
            }} title={'绑定微信打款'} buttonStyle={{width: "100%", backgroundColor: colors.main_color}}
                    titleStyle={{color: colors.white}}/>
          </View>
        }
      </View>
    )
  }

  renderAlipayInfo() {
    return (
      <View style={{backgroundColor: colors.white, padding: 10, borderRadius: 8, marginTop: 10}}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 45,
          borderBottomWidth: pxToDp(1),
          borderColor: colors.colorEEE
        }}>
          <Text style={{color: colors.color333, fontWeight: 'bold', fontSize: 15}}>支付宝</Text>

          <If condition={this.state.alipay.default}>
            <View style={{backgroundColor: colors.red, padding: 4, marginLeft: 4, borderRadius: 6}}>
              <Text style={{fontSize: 10, color: colors.white}}>默认</Text>
            </View>
          </If>
          <View style={{flex: 1}}></View>
          <If condition={this.state.alipay.status_text === '已绑定'}>
            <Text onPress={() => {

              let alipay = this.state.alipay;
              alipay.status_text = '未绑定'
              this.setState({
                alipay,
              })
            }} style={{color: colors.main_color, fontSize: 14}}>修改 </Text>
          </If>
        </View>
        <View style={{
          justifyContent: 'center',
          padding: 10,
          borderBottomWidth: pxToDp(1),
          borderColor: colors.colorEEE
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10
          }}>
            <Text style={{fontSize: 14, color: colors.color333}}>姓&nbsp;名</Text>
            <TextInput placeholder="支付宝姓名"
                       onChangeText={(alipayName) => {
                         this.setState({alipayName})
                       }}
                       placeholderTextColor={'#ccc'}
                       value={this.state.alipayName}
                       style={{
                         marginLeft: 20,
                         color: colors.color333,
                         borderWidth: 1,
                         borderColor: '#999',
                         fontSize: 14,
                         width: "80%",
                         height: 35,
                         textAlign: 'center',
                       }}
                       underlineColorAndroid="transparent"/>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10
          }}>
            <Text style={{fontSize: 14, color: colors.color333}}>账&nbsp;号</Text>
            <TextInput placeholder="支付宝账号"
                       onChangeText={(alipayAccount) => {
                         this.setState({alipayAccount})
                       }}
                       placeholderTextColor={'#ccc'}
                       value={this.state.alipayAccount}
                       style={{
                         marginLeft: 20,
                         color: colors.color333,
                         borderWidth: 1,
                         borderColor: '#999',
                         fontSize: 14,
                         width: "80%",
                         height: 35,
                         textAlign: 'center',
                       }}
                       underlineColorAndroid="transparent"/>
          </View>
        </View>

        {this.state.alipay.status_text === '已绑定' ?
          <View>
            <Text style={{color: colors.warn_red, fontSize: 10, marginTop: 6}}>绑定成功后，结款会直接到当前支付宝的零钱中。</Text>
            <View style={{padding: 10, paddingBottom: 4}}>
              <Button onPress={() => {
                this.setDefaultPay('zfb')
              }} title={'设为默认收款方式'} buttonStyle={{width: "100%", backgroundColor: colors.main_color}}
                      titleStyle={{color: colors.white}}/>
            </View>
          </View> :
          <View style={{padding: 10, paddingBottom: 4, flexDirection: 'row', justifyContent: 'center'}}>
            <Button onPress={() => {
              this.setState({alipayName: '', alipayAccount: '',})
            }} title={'取消'} buttonStyle={{width: 120, backgroundColor: colors.colorEEE}}
                    titleStyle={{color: colors.white}}/>
            <Button onPress={() => {
              this.bindAlipay()
            }} title={'确定'} buttonStyle={{width: 120, backgroundColor: colors.main_color, marginLeft: 30}}
                    titleStyle={{color: colors.white}}/>
          </View>
        }

      </View>
    )
  }


}

export default connect(mapStateToProps, mapDispatchToProps)(BindPay);
