import React, {PureComponent} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {InputItem, TextareaItem, WhiteSpace} from '@ant-design/react-native';
import FetchEx from "../../pubilc/util/fetchEx";
import {Button} from 'react-native-elements';
import AppConfig from "../../pubilc/common/config";
import {ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import tool from "../../pubilc/util/tool";
import pxToDp from "../../pubilc/util/pxToDp";
import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";

function mapStateToProps(state) {
  const {mine, user, global, store} = state;
  return {mine: mine, user: user, global: global, store}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class OrderSendMoney extends PureComponent {
  constructor(props: Object) {
    super(props);
    const store_id = this.props.route.params.storeId;
    const store = tool.store(this.props.global, store_id);
    this.state = {
      storeName: store.name,
      storeCity: store.city,
      storeVendor: store.vendor,
      storeOwnerName: store.owner_name,
      amount: '',
      remark: '',
      submitting: false,
      logList: [],
      logListLength: 0,
      latelyTime: ''
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchQuerySurchargeLog()
  }

  handleSubmit() {
    const self = this
    const {global, navigation, route} = self.props;
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
      order_id: route.params.orderId,
      store_id: route.params.storeId
    })
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.post(url, formData))
        .then(resp => resp.json())
        .then(resp => {
          if (resp.ok) {
            ToastShort('提交成功')
            navigation.goBack()
            self.setState({submitting: true});
          } else {
            ToastShort(resp.reason ? resp.reason : '提交失败')
            self.setState({submitting: false});
          }
        })
        .catch(error => {
          ToastLong(error.message);
          self.setState({submitting: false});
        });
  }

  fetchQuerySurchargeLog () {
    const self = this
    const {global, route} = self.props;
    const orderId = route.params.orderId;
    const api = `api/query_surcharge_log`;
    HttpUtils.get.bind(this.props)(api, {
      order_id: orderId,
      access_token: global.accessToken
    }).then(res => {
      this.setState({
        logList: res.list,
        logListLength: res.total,
        latelyTime: res.lately_time
      })
    })
  }

  render() {
    const {storeName, storeCity, storeVendor, storeOwnerName, logListLength, logList, latelyTime} = this.state
    return (
        <View style={{flex: 1}}>
          <ScrollView>
            <View style={styles.infoContainer}>
              <Text style={[{padding: 10}, styles.fontN1]}>收款信息</Text>
              <View style={styles.infoContent}>
                <Text style={styles.fontN1}>收款人 </Text>
                <Text style={{color: colors.color999, fontSize: 13}}>{storeOwnerName ? storeOwnerName : `未设置`}</Text>
              </View>
              <View style={{flexDirection: "row", justifyContent: "space-between", padding: 10}}>
                <Text style={styles.fontN1}>店铺名称 </Text>
                <Text style={{color: colors.color999, fontSize: 13}}>{storeVendor}-{storeCity}-{storeName}</Text>
              </View>
            </View>
            <WhiteSpace/>
            <View style={[styles.infoContainer, {flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10}]}>
              <View style={{flex: 1}}>
                <Text style={styles.fontN1}>红包金额</Text>
              </View>
              <View style={{flex: 2}}>
                <InputItem
                    type='number'
                    placeholder=" 请输入红包金额"
                    placeholderTextColor={'#ccc'}
                    ref={el => this.inputRef = el}
                    onVirtualKeyboardConfirm={v => console.log('onVirtualKeyboardConfirm:', v)}
                    clear
                    extra={'元'}
                    onChange={(amount) => this.setState({amount})}
                />
              </View>
            </View>
            <WhiteSpace/>
            <View style={styles.infoContainer}>
              <View style={{flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.colorEEE}}>
                <Text style={{color: colors.color333, fontWeight: "bold", fontSize: 16, padding: 10}}>备注</Text>
              </View>
              <TextareaItem
                  placeholder="请最少输入5个字符..."
                  rows={5}
                  count={100}
                  onChange={(remark) => this.setState({remark})}
              />
            </View>
            <WhiteSpace/>
            <If condition={logListLength > 0}>
              <View style={styles.infoContainer}>
                <View style={{flexDirection: "column", borderBottomWidth: 1, borderBottomColor: colors.colorEEE}}>
                  <Text style={[{padding: 10}, styles.fontN1]}>历史记录</Text>
                  <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: '96%', paddingLeft: 10}}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Text style={{color: colors.color999, fontSize: 12}}>共</Text>
                      <Text style={{color: colors.main_color, fontSize: 18, marginHorizontal: 2}}>{logListLength}</Text>
                      <Text style={{color: colors.color999, fontSize: 12}}>笔补偿</Text>
                    </View>
                    <Text style={{color: colors.color999, fontSize: 12}}>最近一次补偿在{latelyTime}</Text>
                  </View>
                </View>
                <For index="index" each="element" of={logList}>
                  <View style={{flexDirection: "column", borderBottomWidth: 1, borderBottomColor: colors.colorEEE}} key={index}>
                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: '98%'}}>
                      <Text style={{color: colors.color333, fontSize: 16, padding: 10}}>{(element.created).trim().split(" ")[0]}</Text>
                      <Text style={{color: colors.color333, fontSize: 16, padding: 10}}>补偿金额{parseFloat(element.total_fee / 100).toFixed(2)}元</Text>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: '98%', paddingBottom: 5}}>
                      <Text style={{color: colors.color999, fontSize: 13, paddingHorizontal: 10}}>{element.nickname}</Text>
                      <Text style={{color: colors.color999, fontSize: 13, paddingHorizontal: 10}}>{element.remark}</Text>
                    </View>
                  </View>
                </For>
              </View>
            </If>
          </ScrollView>
          <View style={{backgroundColor: colors.white, padding: pxToDp(20)}}>
            <Button title={'提交'}
                    onPress={() => this.handleSubmit()}
                    buttonStyle={{
                      width: '98%',
                      backgroundColor: colors.main_color,
                      borderRadius: pxToDp(10),
                      marginLeft: '1%'
                    }}
                    titleStyle={{
                      color: colors.white,
                      fontSize: 16
                    }}
            />
          </View>
        </View>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(OrderSendMoney)

const styles = StyleSheet.create({
  infoContainer: {
    backgroundColor: colors.white, width: "96%", borderRadius: 10, margin: '2%'
  },
  font: {color: colors.color333, fontSize: 12},
  fontN1: {color: colors.color333, fontWeight: "bold", fontSize: 16},
  infoContent: {flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.colorEEE, padding: 10}
})
