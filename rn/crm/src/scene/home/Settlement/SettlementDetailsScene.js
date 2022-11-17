import React from 'react'
import SettlementGoodsScene from './_SettlementDetail/SettlementGoodsScene'
import SettlementOrderScene from './_SettlementDetail/SettlementOrderScene'
import {connect} from "react-redux";
import {ScrollView, StyleSheet, Text, View} from "react-native";
import HttpUtils from "../../../pubilc/util/http";
import Cts from "../../../pubilc/common/Cts";
import tool from "../../../pubilc/util/tool";
import pxToDp from "../../../pubilc/util/pxToDp";
import TabButton from "../../../pubilc/component/TabButton";
import Config from "../../../pubilc/common/config";
import {hideModal, showModal} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class SettlementDetailsScene extends React.Component {
  constructor(props) {
    super(props)
    let {date, status, id, key, profit} = this.props.route.params || {};
    this.state = {
      date: date,
      status: status,
      id: id,
      key: key,
      profit: profit,
      goodsList: [],
      orderList: [],
      refundList: [],
      otherList: [],
      merchant_reship_tip: [],
      totalPrice: 0,
      orderNum: 0,
      orderAmount: 0,
      refundNum: 0,
      refundAmount: 0,
      otherNum: 0,
      merchant_add_tip_amount: 0,
      merchant_add_tip_num: 0,
      merchant_reship_amount: 0,
      merchant_reship_num: 0,
      otherAmount: 0,
      tab: [
        {label: '订单详情', value: 'order'},
        {label: '商品详情', value: 'goods'}
      ],
      activeTab: 'order',
      icon: '',
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    let {date, id} = this.state;
    let {accessToken, currStoreId} = this.props.global;
    showModal("加载中");
    HttpUtils.get.bind(this.props)(`/api/settlement_detail/${id}/${currStoreId}/${date}?access_token=${accessToken}`).then((res) => {
      hideModal();
      this.setState({
        goodsList: res.goods_list,
        orderList: res.order_list,
        refundList: res.refund_list,
        otherList: res.other_list,
        merchant_reship_tip: res.merchant_reship_tip,
        totalPrice: res.total_price,
        orderNum: res.order_num,
        orderAmount: res.order_amount,
        refundNum: res.refund_order_num,
        refundAmount: res.refund_amount,
        otherNum: res.other_num,
        otherAmount: res.other_amount,
        merchant_add_tip_amount: res.merchant_add_tip_amount,
        merchant_add_tip_num: res.merchant_add_tip_num,
        merchant_reship_amount: res.merchant_reship_amount,
        merchant_reship_num: res.merchant_reship_num,
        icon: res.icon
      })
    })
  }

  to_order = (id) => {
    this.props.navigation.navigate(Config.ROUTE_ORDER_NEW, {orderId: id})
  };

  renderHeader() {
    const {date, totalPrice, icon, status} = this.state
    return (
      <View style={styles.header}>
        <Text style={styles.headerDate}>时间：{date} </Text>
        <View style={styles.amountRow}>
          <Text style={styles.headerDate}>结算金额：￥{tool.toFixed(totalPrice)}</Text>
          <FontAwesome5 name={icon}
                        style={{fontSize: icon === 'weixin' ? 22 : 25, color: colors.main_color}}/>
          <View style={{
            flexDirection: 'row',
            padding: 4,
            marginLeft: 5,
            backgroundColor: status === Cts.BILL_STATUS_PAID ? colors.white : colors.warn_red
          }}>
            <Text style={{
              fontSize: 10,
              textAlign: 'center',
              color: status === Cts.BILL_STATUS_PAID ? colors.color333 : colors.white
            }}>{status === Cts.BILL_STATUS_PAID ? '已打款' : tool.billStatus(this.state.status)} </Text>
          </View>
        </View>
      </View>
    )
  }

  render() {
    const {date, totalPrice, icon, status} = this.state
    return (
      <View style={styles.container}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}} style={{height: 500}}>
          <View style={styles.header}>
            <Text style={styles.headerDate}>时间：{date} </Text>
            <View style={styles.amountRow}>
              <Text style={styles.headerDate}>结算金额：￥{tool.toFixed(totalPrice)}</Text>
              <If condition={icon}>
                <FontAwesome5 name={icon}
                              style={{
                                fontSize: icon === 'weixin' ? 22 : 25,
                                color: icon === 'weixin' ? colors.main_color : colors.fontBlue,
                              }}/>
              </If>
              <View style={{
                flexDirection: 'row',
                padding: 4,
                marginLeft: 5,
                backgroundColor: status === Cts.BILL_STATUS_PAID ? colors.white : colors.warn_red
              }}>
                <Text style={{
                  fontSize: 10,
                  textAlign: 'center',
                  color: status === Cts.BILL_STATUS_PAID ? colors.color333 : colors.white
                }}>{status === Cts.BILL_STATUS_PAID ? '已打款' : tool.billStatus(this.state.status)} </Text>
              </View>
            </View>
          </View>
          <TabButton
            data={this.state.tab}
            onClick={(value) => this.setState({activeTab: value})}
            containerStyle={{marginVertical: 6}}
          />

          <If condition={this.state.activeTab === 'goods'}>
            <SettlementGoodsScene
              tabLabel='商品详情'
              goodsList={this.state.goodsList}
              orderAmount={this.state.orderAmount}
            />
          </If>

          <If condition={this.state.activeTab === 'order'}>
            <SettlementOrderScene
              func_to_order={this.to_order}
              tabLabel='订单详情'
              orderList={this.state.orderList}
              orderNum={this.state.orderNum}
              orderAmount={this.state.orderAmount}
              refundList={this.state.refundList}
              refundNum={this.state.refundNum}
              refundAmount={this.state.refundAmount}
              otherList={this.state.otherList}
              otherNum={this.state.otherNum}
              otherAmount={this.state.otherAmount}
              merchant_reship_tip={this.state.merchant_reship_tip}
              merchant_add_tip_num={this.state.merchant_add_tip_num}
              merchant_add_tip_amount={this.state.merchant_add_tip_amount}
              merchant_reship_num={this.state.merchant_reship_num}
              merchant_reship_amount={this.state.merchant_reship_amount}
            />
          </If>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    backgroundColor: '#fff',
    padding: pxToDp(30),
    paddingBottom: 0
  },
  headerDate: {
    fontWeight: '900',
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    marginTop: pxToDp(10)
  },
  status: {
    fontSize: pxToDp(24),
    borderWidth: pxToDp(1),
    paddingHorizontal: pxToDp(20),
    borderRadius: pxToDp(20),
    lineHeight: pxToDp(34),
    height: pxToDp(36),
    textAlign: 'center'
  }
})
export default connect(mapStateToProps)(SettlementDetailsScene)

