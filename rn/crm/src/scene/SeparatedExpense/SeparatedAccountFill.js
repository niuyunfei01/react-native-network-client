import React, {PureComponent} from 'react'
import {ScrollView, StyleSheet, Image, Alert, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {InputItem, List, Button, Item, Radio} from 'antd-mobile-rn';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import HttpUtils from "../../util/http";
import * as wechat from 'react-native-wechat'
import {ToastLong} from "../../util/ToastUtils";
import Config from "../../config";

const APP_ID = 'wx0ffb81c6dc194253';

const Brief = List.Item.Brief;
const RadioItem = Radio.RadioItem;

function mapStateToProps (state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const PAY_WECHAT_APP = 'wechat_app';
const PAID_OK = 1;
const PAID_FAIL = 2;
const PAID_WAIT = 0;

class SeparatedAccountFill extends PureComponent {

  static navigationOptions = {
    headerTitle: '帐户充值',
  };

  constructor (props: Object) {
    super(props);
    this.state = {
      to_fill_yuan: '100',
      pay_by: PAY_WECHAT_APP,
      paid_done: PAID_WAIT,
    }
  }

  componentDidMount(): void {
    console.log("to register ", APP_ID);
    wechat.registerApp(APP_ID).then(r => console.log("register done:", r));
    console.log("after register");
  }

  onToExpense() {
    this.props.navigation.navigate(Config.ROUTE_SEP_EXPENSE);
  }

  onPay() {
    console.log("start to :", this.state);
    if (this.state.to_fill_yuan < 1) {
      Alert.alert("充值金额不应少于1元");
      return;
    }
    const self = this;
    wechat.isWXAppInstalled()
      .then((isInstalled) => {
        console.log('isInstalled:', isInstalled);
        if (isInstalled) {
          const {accessToken} = self.props.global;
          const url = `api/gen_pay_app_order/${self.state.to_fill_yuan}?access_token=${accessToken}`;
          HttpUtils.post.bind(self.props)(url).then(res => {
            console.log("res", res);
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
              console.log("----微信支付成功----", requestJson, params);
              if (requestJson.errCode === 0){
                ToastLong('支付成功');
                self.setState({paid_done: PAID_OK})
              }
            }).catch((err)=>{
              console.log(err, "params", params);
              self.setState({paid_done: PAID_FAIL});
              //FIXME: 用户取消支付时，需要显示一个错误
              ToastLong(`支付失败:${err}`);
            });
          });
        } else {
          Alert.alert('没有安装微信软件，请您安装微信之后再试');
        }
      });
  }

  pay_by_text() {
    return this.state.pay_by === PAY_WECHAT_APP ? '微信支付' : '';
  }

  render () {
    return  (<View style={{flex: 1}}>
        {this.state.paid_done === PAID_WAIT && <View style={{flex: 1, justifyContent: 'space-between'}}>
          <ScrollView style={{ flex: 1 }} automaticallyAdjustContentInsets={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} >
            <List renderHeader={'充值金额'}>
              <InputItem clear error={this.state.to_fill_yuan<=0} type="number" value={this.state.to_fill_yuan} onChange={to_fill_yuan => { this.setState({ to_fill_yuan, }); }}
                         extra="元"
                         placeholder="帐户充值金额" >
              </InputItem>
            </List>
            <List renderHeader={'支付方式'}>
              <RadioItem checked={this.state.pay_by === PAY_WECHAT_APP}
                         thumb={'https://wsb-images-backup.waisongbang.com/wechat_pay_logo_in_wsb_app.png'}
                         onChange={event => { if (event.target.checked) { this.setState({ pay_by: PAY_WECHAT_APP }); } }}
                         extra={<Image style={style.wechat_thumb} source={require('../../img/wechat_pay_logo.png')}/>} >微信支付</RadioItem>
            </List>
          </ScrollView>
          <View>
            <Button onClick={() => this.onPay()} disabled={!this.state.pay_by} type="primary">
              {this.pay_by_text()}{this.state.to_fill_yuan || 0}元
            </Button>
          </View>
          </View>
          }

        {this.state.paid_done === PAID_OK && <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>支付完成!</Text>
          </View>
          <Button onClick={() => this.onToExpense()} type="ghost">查看余额</Button>
        </View>}

        {this.state.paid_done === PAID_FAIL && <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>支付失败!</Text>
          </View>
          <Button onClick={() => this.onToExpense()} type="warning">返回账单</Button>
        </View>}
      </View>
    );
  }
}

const style = StyleSheet.create({
    wechat_thumb: {
      width: pxToDp(60), height: pxToDp(60)
    },
  payBtn: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row'
  },
  status: {
    borderWidth: pxToDp(1),
    height: pxToDp(30),
    borderRadius: pxToDp(20),
    width: pxToDp(68),
    fontSize: pxToDp(16),
    textAlign: "center",
    justifyContent: "center",
    color: colors.fontGray,
    borderColor: colors.fontGray,
    lineHeight: pxToDp(28)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedAccountFill)
