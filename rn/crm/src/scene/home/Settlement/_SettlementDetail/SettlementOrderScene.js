//import liraries
import React, {PureComponent} from 'react';
import {FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import pxToDp from "../../../../pubilc/util/pxToDp";

import {connect} from "react-redux";
import tool from '../../../../pubilc/util/tool.js'
import colors from "../../../../pubilc/styles/colors";
import TabButton from "../../../../pubilc/component/TabButton";
import EmptyData from "../../../common/component/EmptyData";
import Entypo from "react-native-vector-icons/Entypo";
import PropTypes from "prop-types";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class SettlementOrderScene extends PureComponent {

  static propTypes = {
    orderList: PropTypes.any,
    refundList: PropTypes.any,
    otherList: PropTypes.any,
    orderNum: PropTypes.number,
    orderAmount: PropTypes.string,
    func_to_order: PropTypes.func,
    refundNum: PropTypes.string,
    refundAmount: PropTypes.string,
    otherNum: PropTypes.string,
    otherAmount: PropTypes.string,
    merchant_reship_tip: PropTypes.any,
    merchant_add_tip_amount: PropTypes.string,
    merchant_add_tip_num: PropTypes.string,
    merchant_reship_amount: PropTypes.string,
    merchant_reship_num: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      tab: [
        {label: '订单', value: 'order'},
        {label: '退款', value: 'refund'},
        {label: '其他', value: 'other'},
        {label: '加小费/补送', value: 'free_tip'},
      ],
      activeTab: 'order',
      pageMounted: true,
      order_list: this.props.orderList ? this.props.orderList : [],
      refund_list: this.props.refundList ? this.props.refundList : [],
      other_list: this.props.otherList ? this.props.otherList : [],
      merchant_reship_tip: this.props.merchant_reship_tip
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({merchant_reship_tip: nextProps.merchant_reship_tip});
  }

  toggleDropdown(key, listKey, item) {
    this.props[listKey][key].down = !item.down
    for (let i = 0; i < tool.length(this.props[listKey]); i++) {
      if (i !== key) {
        this.props[listKey][i].down = false
      }
    }
    this.forceUpdate()
  }

  renderHeader() {
    const {
      orderNum,
      orderAmount,
      refundNum,
      refundAmount,
      otherNum,
      otherAmount,
      merchant_add_tip_amount,
      merchant_add_tip_num,
      merchant_reship_amount,
      merchant_reship_num
    } = this.props
    return (
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>订单:{orderNum}笔</Text>
          <Text style={{color: colors.color333}}>￥{tool.toFixed(orderAmount)} </Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>退款:{refundNum}笔</Text>
          <Text style={{color: colors.color333}}>
            {refundAmount < 0 ? '-' : ''}￥{tool.toFixed(refundAmount, '', true)}
          </Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>其他:{otherNum}笔</Text>
          <Text style={{color: colors.color333}}>
            {otherAmount < 0 ? '-' : ''}￥{tool.toFixed(otherAmount, '', true)}
          </Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>补送:{merchant_reship_num}笔</Text>
          <Text style={{color: colors.color333}}>
            {merchant_reship_amount < 0 ? '-' : ''}￥{tool.toFixed(merchant_reship_amount, '', true)}
          </Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>小费:{merchant_add_tip_num}笔</Text>
          <Text style={{color: colors.color333}}>
            {merchant_add_tip_amount < 0 ? '-' : ''}￥{tool.toFixed(merchant_add_tip_amount, '', true)}
          </Text>
        </View>
      </View>
    )
  }

  renderDropdownImage(item) {
    return (
      <View>
        {item.down ?
          <Entypo name={"chevron-thin-up"}
                  style={{fontSize: pxToDp(40), color: colors.main_color, marginRight: pxToDp(10)}}/> :
          <Entypo name={"chevron-thin-down"}
                  style={{fontSize: pxToDp(40), color: colors.main_color, marginRight: pxToDp(10)}}/>
        }
      </View>)
  }

  renderDropdownRow(products, productName = 'name') {
    return (
      <View>
        <View style={styles.dropdown}/>
        {products && tool.objectMap(products, (ite, index) => {
          const money = tool.toFixed(ite.num * ite.supply_price)
          return (
            <View key={index} style={styles.dropdownRow}>
              <View style={styles.dropdownRowItem}>
                <Text style={styles.goodsName} numberOfLines={1}>{ite[productName]} </Text>
                <Text style={styles.goodsNum}>X{ite.num} </Text>
                <If condition={money > 0}>
                  <Text style={styles.goodsPrice}>￥{money} </Text>
                </If>
              </View>
            </View>
          )
        })
        }
      </View>

    )
  }

  renderReshipDropdownRow(items) {
    return (
      <View>
        <View style={styles.dropdown}/>
        {items && tool.objectMap(items, (ite, index) => {
          return (
            <View key={index} style={styles.dropdownRow}>
              <View style={styles.dropdownRowItem}>
                <Text style={{color: colors.color333}}>{ite.title}</Text>
                <Text style={{color: colors.color333}}>承担{ite.bearFee}元</Text>
              </View>
            </View>
          )
        })
        }
      </View>

    )
  }

  renderOrderList() {
    const self = this
    if (this.props.orderList) {
      return (this.props.orderList.map((item, key) => {
        let {orderTime, dayId, total_goods_num, total_supply_price, id} = item
        if (!this.state.pageMounted) {
          this.props.orderList[key].down = true
          this.setState({pageMounted: true})
        }
        return (
          <View key={key} style={styles.itemRow}>
            <View style={styles.item_title}>
              <TouchableOpacity onPress={() => this.props.func_to_order(id)}>
                <Text style={[styles.name, {color: item?.show_gray ? '#808080' : colors.main_color}]}>{`${tool.shortOrderDay(orderTime)}#${dayId}`} </Text>
              </TouchableOpacity>
              <Text style={{color: item?.show_gray ? '#808080' : colors.color333}}>商品数量:{total_goods_num} </Text>
              <Text style={{color: item?.show_gray ? '#808080' : colors.color333}}>金额:{tool.toFixed(total_supply_price)} </Text>
              <TouchableOpacity onPress={() => this.toggleDropdown(key, 'orderList', item)}>
                {self.renderDropdownImage(item)}
              </TouchableOpacity>
            </View>
            <If condition={item.down}>
              {self.renderDropdownRow(item.items)}
            </If>
          </View>
        )
      }))
    }
  }

  renderRefundList() {
    const self = this
    return (
      <FlatList
        data={this.props.refundList}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<EmptyData/>}
        renderItem={({item, index}) => {
          let {orderTime, dayId, refundNum, refundAmount, id} = item
          if (!this.state.pageMounted) {
            this.props.orderList[index].down = true
            this.setState({pageMounted: true})
          }
          return (
            <View key={index} style={styles.itemRow}>
              <View style={styles.item_title}>
                <TouchableOpacity onPress={() => this.props.func_to_order(id)}>
                  <Text style={styles.name}>{`${tool.shortOrderDay(orderTime)}#${dayId}`} </Text>
                </TouchableOpacity>
                <Text style={{color: colors.color333}}>商品数量:{refundNum} </Text>
                <Text style={{color: colors.color333}}>金额:{tool.toFixed(refundAmount)} </Text>
                <TouchableOpacity onPress={() => this.toggleDropdown(index, 'refundList', item)}>
                  {self.renderDropdownImage(item)}
                </TouchableOpacity>
              </View>
              <If condition={item.down}>
                {self.renderDropdownRow(item.items, 'product_name')}
              </If>
            </View>
          )
        }}
      />
    )
  }

  renderOtherList() {
    return (
      <FlatList
        data={this.props.otherList}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<EmptyData/>}
        renderItem={({item, index}) => {
          return (
            <View key={index} style={styles.otherRow}>
              <View style={styles.otherRowItem}>
                <Text style={styles.goodsName}>{item.remark} </Text>
                <Text
                  style={styles.goodsPrice}>{item.fee < 0 ? '-' : ''}￥{tool.toFixed(item.fee, '', true)} </Text>
              </View>
            </View>
          )
        }}
      />
    )
  }

  renderFreeTipList() {
    const self = this
    return (
      <FlatList
        data={this.state.merchant_reship_tip}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={<EmptyData/>}
        renderItem={({item, index}) => {
          let {orderTime, dayId, id, items} = item
          if (!this.state.pageMounted) {
            this.state.merchant_reship_tip[index].down = true
            this.setState({pageMounted: true})
          }
          return (
            <View key={index} style={styles.itemRow}>
              <View style={styles.item_title}>
                <TouchableOpacity onPress={() => this.props.func_to_order(id)}>
                  <Text style={styles.name}>{`${tool.shortOrderDay(orderTime)}#${dayId}`} </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.toggleDropdown(index, 'merchant_reship_tip', item)}>
                  {self.renderDropdownImage(item)}
                </TouchableOpacity>
              </View>
              <If condition={item.down}>
                {self.renderReshipDropdownRow(items)}
              </If>
            </View>
          )
        }}
      />
    )
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <TabButton
          data={this.state.tab}
          onClick={(value) => this.setState({activeTab: value})}
          containerStyle={{
            marginVertical: 6,
          }}
        />
        <ScrollView>
          {this.state.activeTab === 'order' && this.renderOrderList()}
          {this.state.activeTab === 'refund' && this.renderRefundList()}
          {this.state.activeTab === 'other' && this.renderOtherList()}
          {this.state.activeTab === 'free_tip' && this.renderFreeTipList()}
        </ScrollView>

      </View>

    )
  }

}

const styles = StyleSheet.create({
  item_title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: pxToDp(100),
    paddingLeft: pxToDp(30)
  },
  name: {
    minWidth: pxToDp(200),
    fontSize: pxToDp(32),
    fontWeight: '900'
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: pxToDp(30),
  },
  headerItem: {
    flexDirection: 'row',
    marginTop: pxToDp(20),
    justifyContent: "space-between",
    alignItems: 'center'
  },
  headerItemLabel: {
    fontSize: pxToDp(30),
    color: '#3e3e3e'
  },
  itemRow: {
    backgroundColor: '#fff',
    borderBottomWidth: pxToDp(1),
    borderColor: '#f2f2f2'
  },
  dropdown: {
    height: pxToDp(1),
    backgroundColor: colors.f2
  },
  dropdownRow: {
    paddingVertical: pxToDp(20),
    paddingHorizontal: pxToDp(30),
    borderBottomWidth: pxToDp(1),
    borderColor: "#F2F2F2"
  },
  dropdownRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: pxToDp(10)
  },
  goodsName: {
    width: pxToDp(370),
    color: '#a9a9a9',
    fontSize: pxToDp(24)
  },
  goodsNum: {
    width: pxToDp(100),
    textAlign: 'center',
    color: '#a9a9a9',
    fontSize: pxToDp(24)
  },
  goodsPrice: {
    width: pxToDp(130),
    color: '#ff0101',
    fontSize: pxToDp(24)
  },
  otherRow: {
    backgroundColor: '#fff',
    borderBottomWidth: pxToDp(1),
    borderColor: '#f2f2f2',
    flexDirection: 'row',
    flex: 1,
    height: pxToDp(100),
    alignItems: 'center',
    paddingHorizontal: pxToDp(30)
  },
  otherRowItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});


export default connect(mapStateToProps)(SettlementOrderScene)
