import React, {PureComponent} from 'react'
import {View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {List, InputItem, WhiteSpace, TextareaItem, Button} from 'antd-mobile-rn';
import FetchEx from "../../util/fetchEx";
import AppConfig from "../../config";
import {ToastLong, ToastShort} from "../../util/ToastUtils";

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

class OrderSendMoney extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '发红包'
    }
  }
  
  constructor (props: Object) {
    super(props);
    this.state = {
      amount: '',
      remark: '',
    }
  }
  
  handleSubmit () {
    const self = this
    const {global, navigation} = self.props;
    const {amount, remark} = self.state
    const url = `api/save_store_surcharge?access_token=${global.accessToken}`;
    const formData = JSON.stringify({
      fee: amount * 100,
      remark: remark,
      order_id: navigation.state.params.orderId,
      store_id: navigation.state.params.storeId
    })
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.post(url, formData))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          ToastShort('提交成功')
          navigation.goBack()
        } else {
          ToastShort('提交失败')
        }
      })
      .catch(error => {
        ToastLong(error.message);
      });
  }
  
  render () {
    return (
      <View>
        <List renderHeader={() => '红包金额'}>
          <InputItem
            type='number'
            placeholder="请输入红包金额"
            ref={el => this.inputRef = el}
            onVirtualKeyboardConfirm={v => console.log('onVirtualKeyboardConfirm:', v)}
            clear
            extra={'元'}
            onChange={(amount) => this.setState({amount})}
          >金额</InputItem>
        </List>
        <WhiteSpace/>
        <List renderHeader={() => '备注'}>
          <TextareaItem
            rows={5}
            count={100}
            onChange={(remark) => this.setState({remark})}
          />
        </List>
        <WhiteSpace/>
        <Button type="primary" onClick={() => this.handleSubmit()}>提交</Button>
      </View>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(OrderSendMoney)
