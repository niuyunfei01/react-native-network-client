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

function mapDispatchToProps (dispatch) {
  return {
    dispatch, ...bindActionCreators({
      get_supply_orders,
      ...globalActions
    }, dispatch)
  }
}

class SettlementScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '订单详情',
    }
  };
  
  constructor (props) {
    super(props);
    let {date, status, store_id, order_id, dayId} = this.props.navigation.state.params || {};
    this.state = {
      total_price: 0,
      order_num: 0,
      date: date,
      status: status,
      order_list: [],
      query: true,
      store_id: store_id ? store_id : this.props.global.currStoreId,
      order_id: order_id,
      dayId: dayId
    }
    this.renderList = this.renderList.bind(this)
  }
  
  componentWillMount () {
    this.getSettleOrders()
  }
  
  getSettleOrders () {
    let store_id = this.state.store_id;
    let date = this.state.date
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(get_supply_orders(store_id, date, token, async (resp) => {
      console.log(resp);
      if (resp.ok) {
        this.setState({
          order_list: resp.obj.order_list,
          total_price: resp.obj.total_price,
          order_num: resp.obj.order_num,
        })
      } else {
        ToastLong(resp.desc)
      }
      this.setState({query: false})
    }));
  }
  
  renderStatus (status) {
    
    if (status == Cts.BILL_STATUS_PAID) {
      return (
        <Text style={[styles.status, {
          borderColor: colors.main_color,
          color: colors.main_color
        }]}>已打款</Text>
      )
      
    } else {
      return (
        <Text style={[styles.status, {}]}>{tool.billStatus(status)}</Text>
      )
    }
    
  }
  
  renderList () {
    if (this.state.order_list.length > 0) {
      return (this.state.order_list.map((item, key) => {
        let {orderTime, platform, dayId, total_goods_num, total_supply_price, id} = item
        item.down = this.state.dayId && this.state.dayId === item.dayId
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
  
  render () {
    return (
      <View style={{flex: 1}}>
        <View style={{
          height: pxToDp(140),
          backgroundColor: '#fff',
          paddingHorizontal: pxToDp(30)
        }}>
          <Text style={{fontSize: pxToDp(24), color: '#bfbfbf', marginTop: pxToDp(20)}}>{this.state.date}</Text>
          <View style={{flexDirection: 'row', marginTop: pxToDp(20), justifyContent: "space-between"}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: pxToDp(30), color: '#3e3e3e'}}>订单:{this.state.order_num}</Text>
              <Text style={{
                fontSize: pxToDp(30),
                color: '#3e3e3e',
                marginLeft: pxToDp(80)
              }}>金额:{tool.toFixed(this.state.total_price)}</Text>
            </View>
            {this.state.status ? this.renderStatus(this.state.status) : null}
          </View>
        </View>
        <Toast
          icon="loading"
          show={this.state.query}
          onRequestClose={() => {
          }}
        >加载中</Toast>
        <Toast
          icon="loading"
          show={this.state.query}
          onRequestClose={() => {
          }}
        >提交中</Toast>
        
        
        <ScrollView style={{marginTop: pxToDp(20)}}>
          
          {
            this.renderList()
          }
        
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
    fontWeight: '900',
    
  },
  status: {
    fontSize: pxToDp(24),
    borderWidth: pxToDp(1),
    paddingHorizontal: pxToDp(20),
    borderRadius: pxToDp(20),
    lineHeight: pxToDp(34),
    height: pxToDp(36),
    textAlign: 'center',
    marginTop: pxToDp(5),
  }
  
});


export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
