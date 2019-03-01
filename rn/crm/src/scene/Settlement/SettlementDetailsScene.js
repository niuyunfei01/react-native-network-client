import React from 'react'
import ScrollableTabView, {DefaultTabBar} from 'react-native-scrollable-tab-view'
import SettlementGoodsScene from './SettlementGoodsScene'
import SettlementOrderScene from './SettlementOrderScene'
import {connect} from "react-redux";
import {Text, View, StyleSheet} from "react-native";
import HttpUtils from "../../util/http";
import Cts from "../../Cts";
import colors from "../../styles/colors";
import tool from "../../common/tool";
import pxToDp from "../../util/pxToDp";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global}
}

class SettlementDetailsScene extends React.Component {
  constructor (props) {
    super(props)
    let {date, status, id, key, profit} = this.props.navigation.state.params || {};
    this.state = {
      date: date,
      status: status,
      id: id,
      key: key,
      profit: profit,
      totalPrice: 0,
      orderNum: 0,
      goodsList: [],
      orderList: []
    }
  }
  
  componentDidMount () {
    this.fetchData()
  }
  
  fetchData () {
    const self = this
    let store_id = this.props.global.currStoreId;
    let date = this.state.date;
    let token = this.props.global.accessToken;
    
    HttpUtils.get(`/api/settlement_detail/${store_id}/${date}?access_token=${token}`).then(res => {
      self.setState({
        totalPrice: res.total_price,
        orderNum: res.order_num,
        goodsList: res.goods_list,
        orderList: res.order_list
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
    return (
      <View style={styles.container}>
        {this.renderHeader()}
    
        <ScrollableTabView
          renderTabBar={() => <DefaultTabBar
            activeTextColor={colors.main_color}
            underlineStyle={{backgroundColor: colors.main_color}}
          />}
          initialPage={0}
          page={0}
          
        >
          <SettlementGoodsScene
            tabLabel='商品详情'
            goodsList={this.state.goodsList}
          />
          <SettlementOrderScene
            tabLabel='订单详情'
            orderList={this.state.orderList}
          />
        </ScrollableTabView>
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