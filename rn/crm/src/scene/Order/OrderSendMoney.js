import React, {PureComponent} from 'react'
import {StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {Button, InputItem, List, TextareaItem, WhiteSpace} from '@ant-design/react-native';
import FetchEx from "../../util/fetchEx";
import AppConfig from "../../config";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import {tool} from "../../common";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";

function mapStateToProps (state) {
  const {mine, user, global, store} = state;
  return {mine: mine, user: user, global: global, store}
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
    const store_id  = this.props.route.params.storeId;
    const store = tool.store(this.props.global, store_id);
    this.state = {
      storeName: store.name,
      storeCity: store.city,
      storeVendor: store.vendor,
      storeOwnerName: store.owner_name,
      amount: '',
      remark: '',
      submitting: false
    }
  }

  handleSubmit () {
    const self = this
    const {global, navigation} = self.props;
    const {amount, remark, submitting} = self.state
    if (submitting) {
      ToastLong("正在提交，请等待！");
      return false;
    }
    self.setState({submitting: true});
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
          self.setState({submitting: true});
        } else {
          ToastShort('提交失败')
          self.setState({submitting: false});
        }
      })
      .catch(error => {
        ToastLong(error.message);
        self.setState({submitting: false});
      });
  }

  renderInfoItem (label, value) {
    return (
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{label}：</Text>
        <Text>{value}</Text>
      </View>
    )
  }

  renderInfo () {
    const {storeName, storeCity, storeVendor, storeOwnerName} = this.state
    return (
      <View>
        <JbbCellTitle>收款信息</JbbCellTitle>
        <View style={styles.infoContainer}>
          {this.renderInfoItem('收款人', storeOwnerName)}
          {this.renderInfoItem('店铺名称', `${storeVendor}-${storeCity}-${storeName}`)}
        </View>
      </View>
    )
  }

  render () {
    return (
      <View>
        {this.renderInfo()}
        <WhiteSpace/>
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
        <Button type="primary" onPress={() => this.handleSubmit()}>提交</Button>
      </View>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(OrderSendMoney)

const styles = StyleSheet.create({
  infoContainer: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: '#fff'
  },
  infoItem: {
    marginVertical: pxToDp(10)
  },
  infoLabel: {
    fontSize: pxToDp(26),
    fontWeight: 'bold'
  }
})
