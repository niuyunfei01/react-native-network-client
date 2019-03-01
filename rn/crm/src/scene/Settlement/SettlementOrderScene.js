//import liraries
import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {get_supply_orders} from '../../reducers/settlement/settlementActions'
import {ToastLong, ToastShort} from '../../util/ToastUtils';
import tool from '../../common/tool.js'
import {Toast} from "../../weui/index";
import Cts from "../../Cts"
import Config from '../../config'
import colors from "../../styles/colors";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global}
}

class SettlementOrderScene extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      order_list: []
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    this.setState({order_list: nextProps.orderList})
  }
  
  renderList () {
    if (this.state.order_list.length > 0) {
      return (this.state.order_list.map((item, key) => {
        let {orderTime, platform, dayId, total_goods_num, total_supply_price, id} = item
        if (this.state.dayId && this.state.dayId === item.dayId && !this.state.pageMounted) {
          this.state.order_list[key].down = true
          this.setState({pageMounted: true})
        }
        return (
          <View key={key} style={{backgroundColor: '#fff', borderBottomWidth: pxToDp(1), borderColor: '#f2f2f2'}}>
            <View style={styles.item_title}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate(Config.ROUTE_ORDER, {orderId: id})
                }}
              >
                <Text style={styles.name}>
                  {`${tool.shortOrderDay(orderTime)}#${dayId}`}
                </Text>
              </TouchableOpacity>
              <Text style={styles.num}>商品数量:{total_goods_num}</Text>
              <Text style={styles.price}>金额:{tool.toFixed(total_supply_price)}</Text>
              <TouchableOpacity
                onPress={() => {
                  this.state.order_list[key].down = !item.down
                  for (let i = 0; i < this.state.order_list.length; i++) {
                    if (i !== key) {
                      this.state.order_list[i].down = false
                    }
                  }
                  this.forceUpdate()
                }}
              >
                <Image style={[{width: pxToDp(80), height: pxToDp(80)}]}
                       source={item.down ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')}
                />
              </TouchableOpacity>
            </View>
            {
              item.down ? <View>
                <View style={{height: pxToDp(1), backgroundColor: colors.main_back}}/>
                {
                  item.items.map((ite, index) => {
                    return (
                      <View key={index} style={{
                        paddingVertical: pxToDp(20),
                        paddingHorizontal: pxToDp(30),
                        borderBottomWidth: pxToDp(1),
                        borderColor: "#F2F2F2"
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingVertical: pxToDp(10)
                        }}>
                          <Text style={{width: pxToDp(370), color: '#a9a9a9', fontSize: pxToDp(24)}} numberOfLines={1}>
                            {ite.name}
                          </Text>
                          <Text style={{
                            width: pxToDp(100),
                            textAlign: 'center',
                            color: '#a9a9a9',
                            fontSize: pxToDp(24)
                          }}>X{ite.num}</Text>
                          <Text style={{width: pxToDp(130), color: '#ff0101', fontSize: pxToDp(24)}}>
                            ￥{tool.toFixed(ite.total_price)}
                          </Text>
                        </View>
                      </View>
                    )
                  })
                }
              </View> : <View/>
            }
          
          </View>
        )
      }))
    }
  }
  
  renderHeader () {
    return (
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>订单:{this.state.order_num}笔</Text>
          <Text>￥100.00</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>退款:{this.state.order_num}笔</Text>
          <Text>￥100.00</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerItemLabel}>其他:{this.state.order_num}笔</Text>
          <Text>￥100.00</Text>
        </View>
      </View>
    )
  }
  
  render () {
    return (
      <View style={{flex: 1}}>
        {this.renderHeader()}
        
        <ScrollView style={{marginTop: pxToDp(20)}}>
          {this.renderList()}
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
  }
});


export default connect(mapStateToProps)(SettlementOrderScene)
