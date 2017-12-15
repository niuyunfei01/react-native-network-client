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
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import { get_supply_orders} from '../../reducers/settlement/settlementActions'
import {ToastLong, ToastShort} from '../../util/ToastUtils';
import {NavigationActions} from "react-navigation";
import {NavigationItem} from '../../widget';
import tool from '../../common/tool.js'
import {Toast} from "../../weui/index";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
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
      headerLeft: (<NavigationItem
          icon={require('../../img/Register/back_.png')}
          iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
          onPress={() => {
            navigation.goBack();
          }}
      />),
      headerRight: (
          <View style={
            {
              flexDirection: 'row',
              paddingRight: pxToDp(30)
            }
          }>
            <TouchableOpacity
                onPress={() => {
                  params.upLoad();
                }}
            >
              {/* <Text style={{
                  fontSize: pxToDp(32),
                  color: '#59b26a'
                }}>保存</Text> */}
            </TouchableOpacity>
          </View>),
    }
  };
  constructor(props) {
    super(props);
    let {date, status} = this.props.navigation.state.params || {};
    this.state = {
      total_price: 0,
      order_num: 0,
      date: date,
      status:status,
      order_list: [],
      query:true,

    }
    this.renderList = this.renderList.bind(this)
  }

  componentWillMount(){
    this.getSettleOrders()
  }
  getSettleOrders(){
    let store_id = this.props.global.currStoreId;
    let date= this.state.date
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(get_supply_orders(store_id,date , token, async (resp) => {
      console.log(resp);
      if (resp.ok ) {
       this.setState({
         order_list:resp.obj.order_list,
         total_price:resp.obj.total_price,
         order_num:resp.obj.order_num,
         query:false,

       })
      } else {
        console.log(resp.desc)
      }
    }));
  }
  renderList() {
    if (this.state.order_list.length > 0) {
      return (this.state.order_list.map((item, key) => {
        return (
            <View key={key} style={{backgroundColor: '#fff',borderBottomWidth:pxToDp(1),borderColor:'#f2f2f2'}}>
              <View style={styles.item_title}>
                <Text style={styles.name}>
                  {`#${tool.get_platform_name(item.platform) + item.dayId}`}
                </Text>
                <Text style={styles.num}>商品数量:{item.total_goods_num}</Text>
                <Text style={styles.price}>金额:{tool.toFixed(item.total_supply_price)}</Text>
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
                  <View style={{height: pxToDp(20), backgroundColor: colors.main_back}}/>
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
                              <Text style={{width: pxToDp(370),color:'#a9a9a9',fontSize:pxToDp(24)}} numberOfLines={1}>
                                {ite.name}
                              </Text>
                              <Text style={{width: pxToDp(100), textAlign: 'center',color:'#a9a9a9',fontSize:pxToDp(24)}}>X{ite.num}</Text>
                              <Text style={{width: pxToDp(130), color: '#ff0101',fontSize:pxToDp(24)}}>
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

  render() {
    return (
        <View>
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
              <Text style={{color:colors.main_color,
                fontSize:pxToDp(24),
                borderWidth:pxToDp(1),
                paddingHorizontal:pxToDp(20),
                borderColor:colors.main_color,
                borderRadius:pxToDp(20),
                lineHeight:pxToDp(34),
                height:pxToDp(36),
                textAlign:'center'

              }}>{tool.billStatus(this.state.status)}</Text>
            </View>
          </View>
          <ScrollView style={{marginTop: pxToDp(20)}}>

            {
              this.renderList()
            }

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
    width: pxToDp(200),
    fontSize:pxToDp(30),
    color:'#3e3e3e'

  }
})


export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
