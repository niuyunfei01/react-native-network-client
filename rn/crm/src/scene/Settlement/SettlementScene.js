import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  TouchableHighlight,

} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {get_supply_items, get_supply_bill_list} from '../../reducers/settlement/settlementActions'
import {NavigationActions} from "react-navigation";
import {color, NavigationItem} from '../../widget';
import tool from '../../common/tool.js'
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Icon
} from "../../weui/index";
import Config from "../../config";
import {Toast} from "../../weui/index";
import Cts from "../../Cts"
import { ToastLong } from '../../util/ToastUtils';

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators({
      get_supply_items,
      get_supply_bill_list,
      ...globalActions
    }, dispatch)
  }
}

class SettlementScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '打款记录',
    }
  };

  constructor(props) {
    super(props)
    this.state = {
      query: true,
      checked: ['1', '2'],
      authority: false,
      canChecked: false,
      list: [],
      orderNum: 0,
      totalPrice: 0,
      status: 0,
    };
    this.renderList = this.renderList.bind(this);
    this.renderBtn = this.renderBtn.bind(this)
  }

  componentWillMount() {
    this.getSupplyList()
  }
 
    componentDidUpdate(){
      let {key, params} = this.props.navigation.state;
      let {isRefreshing} = (params || {});
      if(isRefreshing){
        console.log(params)
        this.setState({isRefreshing:isRefreshing})
        const setRefresh =  this.props.navigation.setParams({
          isRefreshing:  false,
          key:key
        });
        this.props.navigation.dispatch(setRefresh);
        this.setState({query:true})
        this.getSupplyList()
        
      }
    }
  

  inArray(key) {
    let checked = this.state.checked;
    let index = checked.indexOf(key)
    if (index >= 0) {
      return {have: true, index};
    } else {
      return {have: false, index};
    }
  }

  getSupplyList() {
    let store_id = this.props.global.currStoreId;
    let {currVendorId} = tool.vendor(this.props.global);
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    dispatch(get_supply_bill_list(currVendorId, store_id, token, async (resp) => {
      if (resp.ok) {
        let list = resp.obj;
        tool.objectMap(list, (item, index) => {
          tool.objectMap(item, (ite, key) => {
            if (key === tool.fullDay(new Date())) {
              this.setState({status: ite.status, orderNum: ite.order_num, totalPrice: ite.bill_price, id: ite.id})
              delete item[key]
            }
          })
        });
        this.setState({list: list, query: false})
      } else {
            ToastLong(resp.desc)
      }
      this.setState({query: false})
    }));
  }

  toggleCheck(key, date, status, id) {
    let checked = this.state.checked
    if (this.state.canChecked) {
      let {have, index} = this.inArray(key)
      if (have) {
        checked.splice(index, 1)
      } else {
        checked.push(key)
      }
      this.forceUpdate()
    } else {
      this.toDetail(date, status, id)
    }
  }

  toDetail(date, status, id) {
    let {navigation} = this.props
    navigation.navigate(Config.ROUTE_SETTLEMENT_DETAILS, {
      date: date,
      status: status,
      id: id,
      key:navigation.state.key
    });
  }

  renderStatus(status) {
    if (status == Cts.BILL_STATUS_PAID) {
      return (
          <Text style={[styles.status, {
            borderColor: colors.main_color,
            color: colors.main_color
          }]}>已打款</Text>
      )
    } else {
      return (
          <Text style={[styles.status]}>{tool.billStatus(status)}</Text>
      )
    }
  }

  selectAll() {
    let selectAllList = [];
    let {checked, list} = this.state;
    if (checked.length == list.length) {
    } else {
      list.forEach((item) => {
        console.log(item.key)
        selectAllList.push(item.key)
      });
    }
    this.state.checked = selectAllList;
    this.forceUpdate()
  }

  renderBtn() {
    let {checked, list} = this.state;
    if (this.state.authority) {
      if (!this.state.canChecked) {
        return (
            <View style={styles.btn_box}>
              <TouchableOpacity
                  style={{flex: 4.2}}
                  onPress={() => {
                    this.setState({canChecked: true})
                  }}
              >
                <View style={{justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                  <Text style={{color: colors.main_color, fontSize: pxToDp(30)}}>选择</Text>
                </View>
              </TouchableOpacity>
              <View style={{
                flex: 3,
                backgroundColor: '#dcdcdc',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{color: '#fff', fontSize: pxToDp(30)}}>确认打款</Text>
              </View>
            </View>
        )
      } else {
        return (
            <View style={styles.btn_box}>
              <TouchableOpacity
                  onPress={() => {
                    this.setState({canChecked: false})
                  }}>
                <Text style={[styles.btn_text, styles.cancel]}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  onPress={() => {
                    this.selectAll()
                  }}
                  style={{flexDirection: 'row', width: pxToDp(290), justifyContent: 'center'}}
              >
                <Icon name={checked.length == list.length ? 'success' : 'circle'}
                      style={{marginRight: pxToDp(10)}}/>
                <Text style={[styles.btn_text, styles.all, {width: pxToDp(80)}]}>全选</Text>
              </TouchableOpacity>

              <Text style={[styles.submit]}>
                确认打款
              </Text>
            </View>
        )
      }
    }
  }

  renderEmpty() {
    return (
        <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
          <Image style={{width: pxToDp(100), height: pxToDp(135)}} source={require('../../img/Goods/zannwujilu.png')}/>
          <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>没有相关记录</Text>
        </View>
    )
  }

  renderList() {
    let _this = this;
    return tool.objectMap(this.state.list, (item, index) => {
      return (
          <View key={index}>
            <View style={{flexDirection: 'row', paddingHorizontal: pxToDp(30),}}>
              <Text style={{paddingVertical: pxToDp(5), marginTop: pxToDp(15)}}>{index}</Text>
            </View>
            <Cells style={{margin: 0, borderBottomColor: '#fff'}}>
              {
                tool.objectMap(item, (ite, key) => {
                  return (
                      <Cell key={key}
                            customStyle={{
                              marginLeft: 0,
                              paddingHorizontal: pxToDp(30),
                              borderColor: "#EEEEEE",
                              paddingRight:pxToDp(12)
                            }}
                            onPress={() => {
                              this.toggleCheck(ite.key, ite.bill_date, ite.status, ite.id)
                            }}
                      >
                        <CellHeader style={{
                          minWidth: pxToDp(180),
                          flexDirection: 'row',
                          height: pxToDp(100),
                          alignItems: 'center'
                        }}>
                          <Text style={{height: 'auto'}}> {ite.bill_date}</Text>
                        </CellHeader>
                        <CellBody style={{marginLeft: pxToDp(10)}}>
                          {
                            this.renderStatus(ite.status)
                          }
                        </CellBody>
                        <CellFooter style={{color: colors.fontGray}}>{tool.toFixed(ite.bill_price)}元
                          <Image
                              style ={{alignItems:'center',transform:[{scale:0.6},{rotate:'-90deg'}]}}
                              source = {require('../../img/Public/xiangxia_.png')}
                          />
                        </CellFooter>
                      </Cell>
                  )
                })
              }
            </Cells>
          </View>
      )
    })
  }

  render() {
    return (
        <View style={this.state.authority ? {flex: 1, paddingBottom: pxToDp(110)} : {flex: 1}}>
          <TouchableHighlight
              onPress={() => {
                console.log(tool.fullDay(new Date()), this.state.status);
                this.toDetail(tool.fullDay(new Date()), this.state.status, this.state.id)
              }
              }
          >
            <View style={{flexDirection:'row',backgroundColor:colors.white,alignItems:'center',justifyContent:'space-between'}}>
              <View>
                <View style={styles.header}>
                  <Text style={styles.today_data}>
                    今日数据（{tool.fullDay(new Date())})
                  </Text>

                  <View style={{flexDirection: 'row', marginTop: pxToDp(20)}}>
                    <Text style={styles.order_text}>已完成订单 : {this.state.orderNum}</Text>
                    <Text style={[styles.order_text, {marginLeft: pxToDp(64)}]}>金额
                      : {tool.toFixed(this.state.totalPrice)}</Text>
                  </View>
                </View>
              </View>

              <Image
                  style={{alignItems: 'center', transform: [{scale: 0.7}, {rotate: '-90deg'}],marginRight:pxToDp(30)}}
                  source={require('../../img/Public/xiangxia_.png')}
              />
            </View>

          </TouchableHighlight>

          <ScrollView
              refreshControl={
                <RefreshControl
                    refreshing={this.state.query}
                    onRefresh={async () => {
                      await  this.setState({query: true})
                      this.getSupplyList()
                    }
                    }
                    tintColor='gray'
                />
              }
              style={{flex: 1}}>
            {
              this.renderList()
            }
          </ScrollView>
          {
            this.renderBtn()
          }
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

//make this component available to the app
const styles = StyleSheet.create({
  header: {
    height: pxToDp(140),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: pxToDp(30),
    justifyContent: 'center',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: "#eeeeee",
  },
  today_data: {
    fontSize: pxToDp(24),
    color: colors.fontGray,
  },
  order_text: {
    fontSize: pxToDp(28),
    color: colors.fontBlack,

  },
  status: {
    borderWidth: pxToDp(1),
    height: pxToDp(40),
    borderRadius: pxToDp(20),
    width: pxToDp(100),
    fontSize: pxToDp(24),
    textAlign: 'center',
    justifyContent: 'center',
    color: colors.fontGray,
    borderColor: colors.fontGray,
    lineHeight: pxToDp(36)
  },
  btn_box: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: pxToDp(112),
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: "center",
    borderTopWidth: pxToDp(1),
    borderTopColor: '#CCCCCC'

  },
  btn_text: {
    fontSize: pxToDp(32),
    color: colors.main_color,
    width: pxToDp(209),
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancel: {
    borderRightColor: '#eeeeee',
    borderRightWidth: pxToDp(1),
    width: pxToDp(160)
  },
  submit: {
    height: '100%',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: colors.main_color,
    flex: 1,
    alignItems: 'center',
    fontSize: pxToDp(32),
    lineHeight: pxToDp(80)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene)
