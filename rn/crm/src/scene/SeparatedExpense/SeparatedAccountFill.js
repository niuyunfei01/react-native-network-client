import React, {PureComponent} from 'react'
import {ScrollView, StyleSheet, Image, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {InputItem, List, Button, Item, Radio} from 'antd-mobile-rn';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import HttpUtils from "../../util/http";

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

  componentWillMount () {
  }

  fetchExpenses () {
    const self = this
    const {global} = self.props
    const url = `api/store_separated_items/${global.currStoreId}?access_token=${global.accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      self.setState({records: res.records, by_labels: res.by_labels, data_labels: res.data_labels})
    })
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
            <Button onPress={() => { this.inputRef.focus(); }} disabled={!this.state.pay_by} type="primary" >
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
