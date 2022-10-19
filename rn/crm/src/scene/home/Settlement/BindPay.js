import React, {PureComponent} from "react";
import {Alert, Image, ScrollView, Text, TextInput, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Button} from "react-native-elements";
import {wechatLogin} from "../../../pubilc/util/WechatUtils";
import HttpUtils from "../../../pubilc/util/http";
import {hideModal, showModal, ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import tool from "../../../pubilc/util/tool";

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
      headImg: wechat.headImg !== '' ? wechat.headImg : 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
    }
  }

  bindWechat() {
    ToastLong("正在唤醒微信...")
    wechatLogin().then((jscode) => {
      let {accessToken, currStoreId} = this.props.global;
      let url = `/api/create_wx_bind/${currStoreId}/${jscode}?access_token=${accessToken}`;
      HttpUtils.get.bind(this.props)(url).then((res) => {
        ToastShort(res.reason)
        this.getSupplyList()
      }).catch((res) => {
        Alert.alert("操作失败", res.reason, [{'text': "确认"}])
        // ToastShort("操作失败：" + res.reason)
      })
    });
  }

  getSupplyList() {
    let {currStoreId, accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    showModal('加载中...')

    let url = `/api/get_supply_bill_list_v2/${currVendorId}/${currStoreId}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then((res) => {
      hideModal()
      let wechat = {};
      let alipay = {};
      if (res.store_pay_info[0].icon === 'weixin') {
        wechat = res.store_pay_info[0];
        alipay = res.store_pay_info[1];
      } else {
        wechat = res.store_pay_info[1];
        alipay = res.store_pay_info[0];
      }
      this.setState({
        wechat,
        alipay,
        alipayAccount: alipay.account !== null ? alipay.account : '',
        alipayName: alipay.name !== null ? alipay.name : '',
        headImg: wechat.headImg && wechat.headImg !== '' ? wechat.headImg : 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
      })
    }).catch((res) => {
      hideModal()
      ToastShort(res.reason)
    })
  }


  setDefaultPay(type) {
    tool.debounces(() => {
      let {accessToken, currStoreId} = this.props.global;
      let url = `/api/bind_default_account_type/${currStoreId}/${type}?access_token=${accessToken}`;
      HttpUtils.get.bind(this.props)(url).then((res) => {
        let wechat = {...this.state.wechat};
        let alipay = {...this.state.alipay};
        if (type === 'wx') {
          wechat.default = true;
          alipay.default = false;
          this.setState({
            wechat,
            alipay,
          })
        } else {
          wechat.default = false;
          alipay.default = true;
          this.setState({
            wechat,
            alipay,
          })
        }
        ToastShort("操作成功")
      }).catch((res) => {
        ToastShort("操作失败：" + res.reason)
      })
    }, 700)

  }

  bindAlipay() {
    if (!this.state.alipayAccount) {
      ToastShort("请填写支付宝账号");
      return;
    }
    let {accessToken, currStoreId} = this.props.global;
    let url = `/api/bind_alipay_account_info/${currStoreId}/${this.state.alipayAccount}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(() => {
      ToastShort("操作成功")
      this.getSupplyList()
    }).catch((res) => {
      Alert.alert("操作失败", res.reason, [{'text': "确认"}])
    })
  }


  render() {
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{flex: 1, padding: 10, backgroundColor: colors.f3}}>
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
            <Image source={{uri: this.state.headImg}}
                   style={{width: 40, height: 40, margin: 4}}/>
            <View style={{marginLeft: 10, flexDirection: 'row'}}>
              <Text style={{color: colors.color333, fontSize: 16, flex: 1}}>{this.state.wechat.name} </Text>
              <Text
                style={{
                  color: colors.color999,
                  fontSize: 14,
                  marginRight: 50
                }}>真实姓名:{this.state.wechat.account} </Text>
            </View>
          </View>
        </If>

        {this.state.wechat.status_text === '已绑定' ?
          <If condition={!this.state.wechat.default}>
            <Text style={{color: colors.warn_red, fontSize: 10, marginTop: 6}}>绑定成功后，结款会直接到当前微信的零钱中。</Text>
            <View style={{padding: 10, paddingBottom: 4}}>
              <Button onPress={() => {
                this.setDefaultPay('wx')
              }} title={'设为默认收款方式'} buttonStyle={{width: "100%", backgroundColor: colors.main_color}}
                      titleStyle={{color: colors.white}}/>
            </View>
          </If> :
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
              let alipay = {...this.state.alipay};
              alipay.status_text = '未绑定'
              this.setState({
                alipay,
                alipayAccount: '',
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
            <Text style={{
              marginLeft: 20,
              color: colors.color333,
              fontSize: 14,
              width: "80%",
              textAlign: 'center',
            }}>{this.state.alipayName} </Text>
          </View>


          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10
          }}>
            <Text style={{fontSize: 14, color: colors.color333}}>账&nbsp;号</Text>
            {this.state.alipay.status_text === '已绑定' ?
              <Text style={{
                marginLeft: 20,
                color: colors.color333,
                fontSize: 14,
                width: "80%",
                textAlign: 'center',
              }}>{this.state.alipayAccount} </Text> : <TextInput placeholder="支付宝账号"
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
                                                                 underlineColorAndroid="transparent"/>}
          </View>
        </View>

        {this.state.alipay.status_text === '已绑定' ?

          <If condition={!this.state.alipay.default}>
            <View>
              <Text style={{color: colors.warn_red, fontSize: 10, marginTop: 6}}>绑定成功后，结款会直接到当前支付宝的零钱中。</Text>
              <View style={{padding: 10, paddingBottom: 4}}>
                <Button onPress={() => {
                  this.setDefaultPay('zfb')
                }} title={'设为默认收款方式'} buttonStyle={{width: "100%", backgroundColor: colors.main_color}}
                        titleStyle={{color: colors.white}}/>
              </View>
            </View></If> :
          <View style={{padding: 10, paddingBottom: 4, flexDirection: 'row', justifyContent: 'center'}}>
            <Button onPress={() => {
              if (this.state.alipay.account) {
                let alipay = {...this.state.alipay}
                alipay.status_text = '已绑定';
                this.setState({alipay, alipayAccount: this.state.alipay.account,})
              } else {
                this.setState({alipayAccount: ''})
              }
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
