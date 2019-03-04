import React from 'react'
import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view'
import SettlementGoodsScene from './_SettlementDetail/SettlementGoodsScene'
import SettlementOrderScene from './_SettlementDetail/SettlementOrderScene'
import {connect} from "react-redux";
import {Text, View, StyleSheet, ScrollView} from "react-native";
import HttpUtils from "../../util/http";
import Cts from "../../Cts";
import colors from "../../styles/colors";
import tool from "../../common/tool";
import pxToDp from "../../util/pxToDp";
import TabButton from "../component/TabButton";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global}
}

class SettlementDetailsScene extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '结算详情',
    }
  }
  
  constructor (props) {
    super(props)
    let {date, status, id, key, profit} = this.props.navigation.state.params || {};
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
      totalPrice: 0,
      orderNum: 0,
      orderAmount: 0,
      refundNum: 0,
      refundAmount: 0,
      otherNum: 0,
      otherAmount: 0,
      tab: [
        {label: '商品详情', value: 'goods'},
        {label: '订单详情', value: 'order'}
      ],
      activeTab: 'goods',
    }
  }
  
  componentDidMount () {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    let store_id = this.props.global.currStoreId;
    let date = this.state.date;
    let id = this.state.id;
    let token = this.props.global.accessToken;
  
    HttpUtils.get(`/api/settlement_detail/${id}/${store_id}/${date}?access_token=${token}`).then(res => {
      self.setState({
        goodsList: res.goods_list,
        orderList: res.order_list,
        refundList: res.refund_list,
        otherList: res.other_list,
        totalPrice: res.total_price,
        orderNum: res.order_num,
        orderAmount: res.order_amount,
        refundNum: res.refund_order_num,
        refundAmount: res.refund_amount,
        otherNum: res.other_num,
        otherAmount: res.other_amount
      })
    })
  }
  
  renderStatus () {
    const {status} = this.state
    if (status == Cts.BILL_STATUS_PAID) {
      return (
        <Text style={[styles.status, {borderColor: colors.main_color, color: colors.main_color}]}>已打款</Text>
      )
    } else {
      return (
        <Text style={[styles.status, {}]}>{tool.billStatus(status)}</Text>
      )
    }
  }
  
  renderHeader () {
    const {date, totalPrice} = this.state
    return (
      <View style={styles.header}>
        <Text style={styles.headerDate}>{date}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.headerDate}>结算金额：</Text>
          <View style={{flexDirection: 'row'}}>
            {this.renderStatus()}
            <Text>￥{tool.toFixed(totalPrice)}</Text>
          </View>
        </View>
      </View>
    )
  }
  
  render () {
    console.log('order list =>', this.state.orderList)
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{flexGrow: 1}} style={{height: 500}}>
          {this.renderHeader()}
          <TabButton
            data={this.state.tab}
            onClick={(value) => this.setState({activeTab: value})}
            containerStyle={{marginTop: pxToDp(10)}}
          />
          {/*<ScrollableTabView*/}
          {/*renderTabBar={() => <DefaultTabBar*/}
          {/*activeTextColor={colors.main_color}*/}
          {/*underlineStyle={{backgroundColor: colors.main_color}}*/}
          {/*/>}*/}
          {/*initialPage={0}*/}
          {/*page={0}*/}
          {/*style={{backgroundColor: 'red'}}*/}
          {/*>*/}
          <If condition={this.state.activeTab === 'goods'}>
            <SettlementGoodsScene
              tabLabel='商品详情'
              goodsList={this.state.goodsList}
              orderAmount={this.state.orderAmount}
            />
          </If>
          <If condition={this.state.activeTab === 'order'}>
            <SettlementOrderScene
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
            />
          </If>
          {/*</ScrollableTabView>*/}
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
    padding: pxToDp(30)
  },
  headerDate: {
    fontWeight: '900'
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: pxToDp(36),
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