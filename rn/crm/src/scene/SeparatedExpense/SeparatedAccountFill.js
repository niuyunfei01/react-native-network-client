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

class SeparatedAccountFill extends PureComponent {

  static navigationOptions = {
    headerTitle: '帐户充值',
  };

  constructor (props: Object) {
    super(props);
    this.state = {
      to_fill_yuan: '100',
      pay_by: PAY_WECHAT_APP,
    }
  }

  componentDidMount(): void {
      console.log("to register ", APP_ID);
    wechat.registerApp(APP_ID);
    this.onPay();
  }

  fetchExpenses () {
    const self = this
    const {global} = self.props
    const url = `api/store_separated_items/${global.currStoreId}?access_token=${global.accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      self.setState({records: res.records, by_labels: res.by_labels, data_labels: res.data_labels})
    })
  }

  onPay() {
      console.log("start to :", this.state);
      if (this.state.to_fill_yuan <= 1) {
          Alert.alert("充值金额不应少于1元");
          return;
      }
      const navigation = this.props.navigation;
      wechat.isWXAppInstalled()
          .then((isInstalled) => {
              console.log('isInstalled:', isInstalled);
              if (isInstalled) {
                  const url = `api/gen_pay_app_order/${this.state.to_fill_yuan}`;
                  HttpUtils.get.bind(this.props)(url).then(res => {
                      console.log("res", res);
                      wechat.pay(res.result).then((requestJson) => {
                          console.log("----微信支付成功----", requestJson);
                          if (requestJson.errCode === "0"){
                              ToastLong('支付成功');
                              navigation.navigate(Config.ROUTE_SEP_EXPENSE, );
                          }
                      }).catch((err)=>{
                    ToastLong(`支付失败:${err}`)
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
      const self = this
    return  ( <View style={{flex: 1, justifyContent: 'space-between'}}>
          <ScrollView style={{ flex: 1 }} automaticallyAdjustContentInsets={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} >
            <List renderHeader={'充值金额'}>
              <InputItem clear error={self.state.to_fill_yuan<=0} type="number" value={self.state.to_fill_yuan} onChange={to_fill_yuan => { self.setState({ to_fill_yuan, }); }}
                         extra="元"
                         placeholder="帐户充值金额" >
              </InputItem>
            </List>
            <List renderHeader={'支付方式'}>
              <RadioItem checked={self.state.pay_by === PAY_WECHAT_APP}
                         thumb={'http://wsb-images-backup.waisongbang.com/wechat_pay_logo_in_wsb_app.png'}
                         onChange={event => { if (event.target.checked) { self.setState({ pay_by: 'wechat_app' }); } }}
                         extra={<Image style={style.wechat_thumb} source={require('../../img/wechat_pay_logo.png')}/>} >微信支付</RadioItem>
            </List>
          </ScrollView>
          <View>
            <Button onPress={this.onPay} disabled={!this.state.pay_by} type="primary">
              {this.pay_by_text()}{this.state.to_fill_yuan || 0}元
            </Button>
          </View>
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
