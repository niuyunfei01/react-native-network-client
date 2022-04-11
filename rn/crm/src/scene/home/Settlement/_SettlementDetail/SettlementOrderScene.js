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

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class SettlementOrderScene extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tab: [
        {label: '订单', value: 'order'},
        {label: '退款', value: 'refund'},
        {label: '其他', value: 'other'}
      ],
      activeTab: 'order',
      pageMounted: true,
      order_list: this.props.orderList ? this.props.orderList : [],
      refund_list: this.props.refundList ? this.props.refundList : [],
      other_list: this.props.otherList ? this.props.otherList : []
    }
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    this.setState({order_list: nextProps.orderList})
  }

  toggleDropdown(key, listKey, item) {
    this.state[listKey][key].down = !item.down
    for (let i = 0; i < this.state[listKey].length; i++) {
      if (i !== key) {
        this.state[listKey][i].down = false
      }
    }
    this.forceUpdate()
  }

  renderHeader() {
    const {orderNum, orderAmount, refundNum, refundAmount, otherNum, otherAmount} = this.props
    return (
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>订单:{orderNum}笔</Text>
          <Text>￥{tool.toFixed(orderAmount)} </Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>退款:{refundNum}笔</Text>
          <Text>{refundAmount < 0 ? '-' : ''}￥{tool.toFixed(refundAmount, '', true)} </Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>其他:{otherNum}笔</Text>
          <Text>{otherAmount < 0 ? '-' : ''}￥{tool.toFixed(otherAmount, '', true)} </Text>
        </View>
      </View>
    )
  }

  renderDropdownImage(item) {
    return (
      <View>
        {item.down ?
          <Entypo name={"chevron-thin-up"}
                  style={{fontSize: pxToDp(40), color: colors.main_color, marginRight: pxToDp(10)}}></Entypo> :
          <Entypo name={"chevron-thin-down"}
                  style={{fontSize: pxToDp(40), color: colors.main_color, marginRight: pxToDp(10)}}></Entypo>
        }
      </View>)
  }

  renderDropdownRow(products, productName = 'name') {
    return (
      <View>
        <View style={styles.dropdown}/>
        {products && tool.objectMap(products, (ite, index) => {
            return (
              <View key={index} style={styles.dropdownRow}>
                <View style={styles.dropdownRowItem}>
                  <Text style={styles.goodsName} numberOfLines={1}>{ite[productName]} </Text>
                  <Text style={styles.goodsNum}>X{ite.num} </Text>
                  <Text style={styles.goodsPrice}>￥{tool.toFixed(ite.num * ite.supply_price)} </Text>
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
    if (this.state.order_list.length > 0) {
      return (this.state.order_list.map((item, key) => {
        let {orderTime, dayId, total_goods_num, total_supply_price, id} = item
        if (!this.state.pageMounted) {
          this.state.order_list[key].down = true
          this.setState({pageMounted: true})
        }
        return (
          <View key={key} style={styles.itemRow}>
            <View style={styles.item_title}>
              <TouchableOpacity onPress={() => this.props.func_to_order(id)}>
                <Text style={styles.name}>{`${tool.shortOrderDay(orderTime)}#${dayId}`} </Text>
              </TouchableOpacity>
              <Text>商品数量:{total_goods_num} </Text>
              <Text>金额:{tool.toFixed(total_supply_price)} </Text>
              <TouchableOpacity onPress={() => this.toggleDropdown(key, 'order_list', item)}>
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
        data={this.state.refund_list}
        ListEmptyComponent={<EmptyData/>}
        renderItem={({item, index}) => {
          let {orderTime, dayId, id} = item
          if (!this.state.pageMounted) {
            this.state.order_list[index].down = true
            this.setState({pageMounted: true})
          }
          return (
            <View key={index} style={styles.itemRow}>
              <View style={styles.item_title}>
                <TouchableOpacity onPress={() => this.props.func_to_order(id)}>
                  <Text style={styles.name}>{`${tool.shortOrderDay(orderTime)}#${dayId}`} </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.toggleDropdown(index, 'refund_list', item)}>
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
        data={this.state.other_list}
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

  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <TabButton
          data={this.state.tab}
          onClick={(value) => this.setState({activeTab: value})}
          containerStyle={{marginTop: pxToDp(10)}}
        />
        <ScrollView>
          {this.state.activeTab === 'order' && this.renderOrderList()}
          {this.state.activeTab === 'refund' && this.renderRefundList()}
          {this.state.activeTab === 'other' && this.renderOtherList()}
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
    color: colors.main_color,
    fontWeight: '900'
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: pxToDp(30)
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
    backgroundColor: colors.main_back
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
