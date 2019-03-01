//import liraries
import React, {PureComponent} from 'react';
import {FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import tool from '../../common/tool.js'
import {Toast} from "../../weui/index";
import Config from '../../config'
import colors from "../../styles/colors";
import TabButton from "../component/TabButton";
import EmptyData from "../component/EmptyData";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global}
}

class SettlementOrderScene extends PureComponent {
  constructor (props) {
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
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({order_list: nextProps.orderList})
  }
  
  toggleDropdown (key, listKey, item) {
    this.state[listKey][key].down = !item.down
    for (let i = 0; i < this.state[listKey].length; i++) {
      if (i !== key) {
        this.state[listKey][i].down = false
      }
    }
    this.forceUpdate()
  }
  
  renderHeader () {
    return (
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>订单:{this.props.orderNum}笔</Text>
          <Text>￥{tool.toFixed(this.props.orderAmount)}</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>退款:{this.props.refundNum}笔</Text>
          <Text>-￥{tool.toFixed(this.props.refundAmount)}</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>其他:{this.props.otherNum}笔</Text>
          <Text>￥{tool.toFixed(this.props.otherAmount)}</Text>
        </View>
      </View>
    )
  }
  
  renderDropdownImage (item) {
    return (
      <Image
        style={[{width: pxToDp(80), height: pxToDp(80)}]}
        source={item.down ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')}
      />
    )
  }
  
  renderDropdownRow (products, productName = 'name') {
    return (
      <View>
        <View style={styles.dropdown}/>
        {
          products.map((ite, index) => {
            return (
              <View key={index} style={styles.dropdownRow}>
                <View style={styles.dropdownRowItem}>
                  <Text style={styles.goodsName} numberOfLines={1}>{ite[productName]}</Text>
                  <Text style={styles.goodsNum}>X{ite.num}</Text>
                  <Text style={styles.goodsPrice}>￥{tool.toFixed(ite.num * ite.supply_price)}</Text>
                </View>
              </View>
            )
          })
        }
      </View>
    
    )
  }
  
  renderOrderList () {
    const self = this
    if (this.state.order_list.length > 0) {
      return (this.state.order_list.map((item, key) => {
        let {orderTime, dayId, total_goods_num, total_supply_price, id} = item
        if (this.state.dayId && this.state.dayId === item.dayId && !this.state.pageMounted) {
          this.state.order_list[key].down = true
          this.setState({pageMounted: true})
        }
        return (
          <View key={key} style={styles.itemRow}>
            <View style={styles.item_title}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate(Config.ROUTE_ORDER, {orderId: id})}>
                <Text style={styles.name}>{`${tool.shortOrderDay(orderTime)}#${dayId}`}</Text>
              </TouchableOpacity>
              <Text style={styles.num}>商品数量:{total_goods_num}</Text>
              <Text style={styles.price}>金额:{tool.toFixed(total_supply_price)}</Text>
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
  
  renderRefundList () {
    const self = this
    return (
      <FlatList
        data={this.state.refund_list}
        renderItem={({item, key}) => {
          let {orderTime, dayId, id} = item
          if (this.state.dayId && this.state.dayId === item.dayId && !this.state.pageMounted) {
            this.state.order_list[key].down = true
            this.setState({pageMounted: true})
          }
          return (
            <View key={key} style={styles.listRow}>
              <View style={styles.item_title}>
                <TouchableOpacity onPress={() => self.props.navigation.navigate(Config.ROUTE_ORDER, {orderId: id})}>
                  <Text style={styles.name}>{`${tool.shortOrderDay(orderTime)}#${dayId}`}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.toggleDropdown(key, 'refund_list', item)}>
                  {self.renderDropdownImage(item)}
                </TouchableOpacity>
              </View>
              <If condition={item.down}>
                {self.renderDropdownRow(item.items, 'product_name')}
              </If>
            </View>
          )
        }}
        ItemSeparatorComponent={() => {
          return (<View style={{borderColor: '#E2E2E2', borderBottomWidth: pxToDp(1)}}/>)
        }}
        ListEmptyComponent={<EmptyData/>}
      />
    )
  }
  
  renderOtherList () {
    return (
      <FlatList
        data={this.state.other_list}
        renderItem={({item, key}) => {
          return (<View/>)
        }}
        ItemSeparatorComponent={() => {
          return (<View style={{borderColor: '#E2E2E2', borderBottomWidth: pxToDp(1)}}/>)
        }}
        ListEmptyComponent={<EmptyData/>}
      />
    )
  }
  render () {
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        <TabButton
          data={this.state.tab}
          onClick={(value) => this.setState({activeTab: value})}
          containerStyle={{marginTop: pxToDp(10)}}
        />
        <ScrollView>
          <If condition={this.state.activeTab === 'order'}>
            {this.renderOrderList()}
          </If>
          <If condition={this.state.activeTab === 'refund'}>
            {this.renderRefundList()}
          </If>
          <If condition={this.state.activeTab === 'other'}>
            {this.renderOtherList()}
          </If>
        </ScrollView>
        
        <Toast
          icon="loading"
          show={this.state.query}
          onRequestClose={() => {
          }}
        >加载中</Toast>
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
    fontWeight: '900',
    
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
  }
});


export default connect(mapStateToProps)(SettlementOrderScene)
