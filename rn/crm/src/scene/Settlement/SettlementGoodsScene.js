//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {get_supply_items, to_settlement} from '../../reducers/settlement/settlementActions'
import tool from '../../common/tool.js'
import {Toast, Dialog} from "../../weui/index";
import DateTimePicker from 'react-native-modal-datetime-picker';
import Config from "../../config";
import {Button} from "../../weui/index";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Cts from '../../Cts'
import {NavigationActions} from 'react-navigation';

class SettlementGoodsScene extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      goods_list: this.props.goodsList ? this.props.goodsList : []
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({goods_list: nextProps.goodsList})
  }
  
  renderEmpty () {
    if (!this.state.goods_list.length) {
      return (
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
          <Image style={{width: pxToDp(100), height: pxToDp(135)}}
                 source={require('../../img/Goods/zannwujilu.png')}/>
          <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>没有相关记录</Text>
        </View>
      )
    }
  }
  
  renderRefund (item) {
    if (item.refund_count > 0) {
      return (
        <Text style={{fontSize: pxToDp(24), color: "#ff0018"}}>
          (退：{tool.toFixed(item.refund_count * item.supply_price)})
        </Text>
      )
    }
  }
  
  renderList () {
    this.state.goods_list.forEach((item) => {
      item.key = item.product_id + '-' + item.supply_price
    });
    return (
      <FlatList
        data={this.state.goods_list}
        renderItem={({item, key}) => {
          return (
            <View style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              justifyContent: 'space-between',
              height: pxToDp(120),
              alignItems: 'center',
              paddingHorizontal: pxToDp(30)
            }}>
              <Text numberOfLines={2} style={title.name}>{item.goods_name}</Text>
              <Text numberOfLines={2} style={title.comm}>{item.goods_num}</Text>
              <Text numberOfLines={2} style={title.comm}>{tool.toFixed(item.supply_price)}</Text>
              <View style={title.totalPrice}>
                <Text numberOfLines={2} style={[title.comm]}>
                  {tool.toFixed(item.total_price)}
                </Text>
                {this.renderRefund(item)}
              </View>
            </View>
          )
        }}
        ItemSeparatorComponent={() => {
          return (<View style={{borderColor: '#E2E2E2', borderBottomWidth: pxToDp(1)}}/>)
        }}
        ListEmptyComponent={this.renderEmpty()}
      />
    )
  }
  
  render () {
    return (
      <View style={{flex: 1}}>
        <View>
          <View style={title.box}>
            <Text style={title.name}>商品名称</Text>
            <Text style={title.comm}>数量</Text>
            <Text style={title.comm}>单价</Text>
            <Text style={title.comm}>总价</Text>
          </View>
        </View>
        <ScrollView style={{flex: 1}}>
          {this.renderList()}
        </ScrollView>
      </View>
    
    )
  }
}

const title = StyleSheet.create({
  box: {
    height: pxToDp(55),
    flexDirection: 'row',
    paddingHorizontal: pxToDp(30),
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    width: pxToDp(216),
    textAlign: 'center'
  },
  comm: {
    width: pxToDp(110),
    textAlign: "center"
  },
  totalPrice: {}
});

export default (SettlementGoodsScene)
