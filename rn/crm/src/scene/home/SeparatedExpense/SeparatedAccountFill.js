import React, {PureComponent} from 'react'
import {Alert, Dimensions, InteractionManager, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import {hideModal, showModal, ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import Config from "../../../pubilc/common/config";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import * as wechat from 'react-native-wechat-lib'
import Alipay from '@uiw/react-native-alipay';
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import {Button, CheckBox} from "react-native-elements";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}//记录耗时的对象

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const PAY_WECHAT_APP = 'wechat_app';
const PAY_ALI_APP = 'alipay';
const width = Dimensions.get("window").width;

class SeparatedAccountFill extends PureComponent {

  constructor(props: Object) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track('三方支付')
    this.state = {
      to_fill_yuan: '',
      pay_by: PAY_ALI_APP,
      balance: 0,
      authorization: false,
      recharge_amount: [
        {label: '100元', value: '100'},
        {label: '300元', value: '300'},
        {label: '500元', value: '500'},
        {label: '1000元', value: '1000'},
        {label: '5000元', value: '5000'},
      ]
    }
  }


  componentDidMount(): void {
    this.navigationOptions()
    this.fetchBalance();
    Alipay.setAlipayScheme("wsbpaycncainiaoshicaicrm");
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {
      headerRight: () => {
        return (
          <TouchableOpacity
            style={{width: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}
            onPress={() => {
              // this.onPress(Config.ROUTE_TRIPARTITE_RECHARGE)
              this.onPress(Config.ROUTE_SEP_EXPENSE)
            }}
          >
            <Text style={{color: colors.color333, fontSize: 15, marginRight: 12}}>账单</Text>
          </TouchableOpacity>
        )
      }
    }
    navigation.setOptions(option);
  }

  //获取余额
  fetchBalance() {
    const {global} = this.props;
    const url = `new_api/stores/store_remaining_fee/${global.currStoreId}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url, {}, true).then(res => {
      timeObj.method.push({
        interfaceName: url,
        executeStatus: res.executeStatus,
        startTime: res.startTime,
        endTime: res.endTime,
        methodName: 'fetchBalance',
        executeTime: res.endTime - res.startTime
      })
      this.setState({
        balance: res.obj
      })
    }).catch((res) => {
      timeObj.method.push({
        interfaceName: url,
        executeStatus: res.executeStatus,
        startTime: res.startTime,
        endTime: res.endTime,
        methodName: 'fetchBalance',
        executeTime: res.endTime - res.startTime
      })
    })
  }

  onPay = () => {
    let {to_fill_yuan, pay_by, authorization} = this.state;
    if (!authorization) {
      ToastLong('请先勾选隐私政策', 0)
      return
    }
    if (to_fill_yuan < 1) {
      ToastLong("充值金额不应少于1元");
      return
    }
    if (pay_by === PAY_WECHAT_APP) {
      this.wechatPay()
    } else {
      this.aliPay()
    }
  }

  aliPay = () => {
    const {accessToken, currStoreId, vendor_id} = this.props.global;
    let {to_fill_yuan} = this.state;
    showModal("支付跳转中...")
    const url = `/api/gen_pay_app_order/${to_fill_yuan}/alipay-app.json?access_token=${accessToken}&vendor_id=${vendor_id}&store_id=${currStoreId}`;
    HttpUtils.post.bind(this.props)(url).then(async res => {
      hideModal();
      const resule = await Alipay.alipay(res.result);
      if (resule.resultStatus === '4000') {
        ToastLong("请先安装支付宝应用")
      } else if (resule.resultStatus === "9000") {
        ToastShort("支付成功")
        this.PayCallback()
      } else {
        ToastLong(`支付失败`);
        this.PayCallback()
      }
    }, () => {
      hideModal();
    })
  }

  PayCallback = () => {
    if (this.props.route.params.onBack) {
      this.props.route.params.onBack(true)
      this.props.navigation.goBack()
    }
  }

  wechatPay = () => {
    wechat.isWXAppInstalled()
      .then((isInstalled) => {
        if (isInstalled) {
          const {accessToken} = this.props.global;
          const url = `api/gen_pay_app_order/${this.state.to_fill_yuan}?access_token=${accessToken}`;
          HttpUtils.post.bind(this.props)(url).then(res => {
            res = res.result;
            const params = {
              partnerId: res.partnerid,
              prepayId: res.prepayid,
              nonceStr: res.noncestr,
              timeStamp: res.timestamp,
              package: res.package,
              sign: res.sign,
            };
            wechat.pay(params).then((requestJson) => {
              if (requestJson.errCode === 0) {
                ToastLong('支付成功');
                this.PayCallback()
              }
            }).catch((err) => {
              ToastLong(`支付失败:${err}`);
              this.PayCallback()

            });
          });
        } else {
          Alert.alert('没有安装微信软件，请您安装微信之后再试');
        }
      });
  }

  selectPay = (type) => {
    if (type === PAY_WECHAT_APP) {
      this.mixpanel.track('使用微信充值')
    } else {
      this.mixpanel.track('使用支付宝充值')
    }
    this.setState({
      pay_by: type
    })
  }

  setCheckd = () => {
    let {authorization} = this.state;
    this.setState({authorization: !authorization})
  }

  onReadProtocol = () => {
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderWechat()}
      </View>
    );
  }


  renderBtn = () => {
    let {authorization} = this.state;
    return (
      <View style={{backgroundColor: colors.white, padding: 12}}>
        <TouchableOpacity onPress={this.setCheckd}
                          style={{flexDirection: 'row', alignItems: 'center'}}>
          <CheckBox
            checkedColor={colors.main_color}
            uncheckedColor={'#DDDDDD'}
            containerStyle={{margin: 0, padding: 0}}
            checked={authorization}
            onPress={this.setCheckd}
          />
          <Text style={{color: colors.color999, fontSize: 12}}>
            我已阅读并同意
          </Text>
          <Text onPress={this.onReadProtocol} style={{color: colors.main_color, fontSize: 12}}>《外送帮隐私政策》 </Text>
        </TouchableOpacity>

        <View style={{marginTop: 10}}>
          <Button title={'立即充值'}
                  onPress={this.onPay}
                  buttonStyle={[{
                    marginHorizontal: 8,
                    backgroundColor: colors.main_color,
                    borderRadius: 24,
                    length: 48
                  }]}
                  titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 16, lineHeight: 28}}
          />
        </View>
      </View>
    )
  }


  renderWechat() {
    let {to_fill_yuan, recharge_amount, balance, pay_by} = this.state
    return (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <KeyboardAwareScrollView
          enableOnAndroid={false}
          style={{flex: 1, paddingHorizontal: 12, paddingVertical: 10}}
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <View style={[style.item_body, {flexDirection: 'row', alignItems: 'center'}]}>
            <Text style={{fontSize: 14, color: colors.color666}}>外送帮余额： </Text>
            <Text style={{fontSize: 18, color: colors.color333, fontWeight: '500'}}>{balance}元 </Text>
          </View>

          <View style={style.item_body}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                justifyContent: "space-around",
                flexWrap: "wrap"
              }}>
              <For index='index' each='info' of={recharge_amount}>
                <Text key={index} style={{
                  borderWidth: 0.5,
                  borderColor: Number(info.value) === to_fill_yuan ? colors.main_color : colors.colorDDD,
                  fontSize: 14,
                  color: Number(info.value) === to_fill_yuan ? colors.main_color : colors.color333,
                  backgroundColor: Number(info.value) === to_fill_yuan ? '#DFFAE2' : colors.white,
                  width: width * 0.26,
                  textAlign: 'center',
                  paddingVertical: 14,
                  borderRadius: 4,
                  marginVertical: 5
                }} onPress={() => {
                  this.setState({to_fill_yuan: Number(info.value)})
                }}>{info.label} </Text>
              </For>

              <TextInput
                onChangeText={(input_add_money) => {
                  this.setState({to_fill_yuan: Number(input_add_money)})
                }}
                defaultValue={to_fill_yuan}
                value={to_fill_yuan}
                placeholderTextColor={colors.color999}
                underlineColorAndroid='transparent'
                placeholder="自定义"
                keyboardType={'numeric'}
                style={{
                  fontSize: 14,
                  width: width * 0.25,
                  borderWidth: 0.5,
                  color: colors.color333,
                  borderColor: colors.colorDDD,
                  textAlign: 'center',
                  borderRadius: 4,
                  paddingVertical: 14,
                  marginVertical: 5
                }}
              />
            </View>
            <Text style={style.item_title}> 支付方式 </Text>

            <TouchableOpacity onPress={() => this.selectPay(PAY_WECHAT_APP)} style={{
              borderWidth: 0.5,
              borderColor: colors.colorDDD,
              borderRadius: 4,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10
            }}>
              <FontAwesome5 size={24} name={'weixin'} style={style.wechatIcon}/>
              <Text style={{flex: 1, fontSize: 12, fontWeight: '500', color: colors.color333}}>微信 </Text>
              {pay_by === PAY_WECHAT_APP ?
                <FontAwesome5 size={20} name={'check-circle'} style={style.circle}/> :
                <FontAwesome5 size={20} name={'circle'} style={style.circle}/>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.selectPay(PAY_ALI_APP)} style={{
              borderWidth: 0.5,
              borderColor: colors.colorDDD,
              borderRadius: 4,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10
            }}>
              <FontAwesome5 size={24} name={'alipay'} style={style.alipayIcon}/>
              <Text style={{flex: 1, fontSize: 12, fontWeight: '500', color: colors.color333}}>支付宝 </Text>
              {pay_by === PAY_ALI_APP ?
                <FontAwesome5 size={20} name={'check-circle'} style={style.circle}/> :
                <FontAwesome5 size={20} name={'circle'} style={style.circle}/>
              }
            </TouchableOpacity>
          </View>

        </KeyboardAwareScrollView>
        {this.renderBtn()}
      </View>
    )
  }

}

const style = StyleSheet.create({
  item_body: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  item_title: {
    color: colors.color333,
    padding: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  alipayIcon: {color: '#1777ff', margin: pxToDp(10)},
  wechatIcon: {color: '#00c250', margin: pxToDp(10)},
  circle: {
    color: colors.main_color,
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedAccountFill)
