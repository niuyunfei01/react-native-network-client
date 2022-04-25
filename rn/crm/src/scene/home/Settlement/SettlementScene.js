import React, {PureComponent} from "react";
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {get_supply_bill_list} from "../../../reducers/settlement/settlementActions";

import pxToDp from "../../../pubilc/util/pxToDp";
import Config from "../../../pubilc/common/config";
import tool from "../../../pubilc/util/tool.js";
import colors from "../../../pubilc/styles/colors";
import Cts from "../../../pubilc/common/Cts";
import {hideModal, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import dayjs from "dayjs";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        get_supply_bill_list,
        ...globalActions
      },
      dispatch
    )
  };
}

class SettlementScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      list: {},
      orderNum: 0,
      totalPrice: 0,
      status: 0
    };
    this.getSupplyList();
  }

  getSupplyList() {
    let {currStoreId, accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    showModal('加载中...')
    this.props.dispatch(
      get_supply_bill_list(currVendorId, currStoreId, accessToken, async resp => {
        if (resp.ok) {
          let list = resp.obj;
          tool.objectMap(list, (item, index) => {
            tool.objectMap(item, (ite, key) => {
              if (key === tool.fullDay(new Date())) {
                this.setState({
                  status: ite.status,
                  orderNum: ite.order_num,
                  totalPrice: ite.bill_price,
                  id: ite.id
                });
                delete item[key];
              }
            });
          });
          this.setState({list: list})
        } else {
          ToastLong(resp.desc);
        }
        hideModal()
      })
    );
  }

  // this.forceUpdate(); 刷新页面
  toDetail(date, status, id, profit) {
    let {navigation, route} = this.props;
    navigation.navigate(Config.ROUTE_SETTLEMENT_DETAILS, {
      date: date,
      status: status,
      id: id,
      profit,
      key: route.key
    });
  }

  render() {
    return (
      <ScrollView style={{flex: 1, padding: 10, backgroundColor: colors.background}}>
        {this.renderPayList()}
        {this.renderToday()}
        {this.renderList()}
      </ScrollView>
    );
  }

  renderPayList() {
    return (
      <TouchableOpacity onPress={() => {
        this.props.navigation.navigate(Config.ROUTE_BIND_PAY);
      }} style={{backgroundColor: colors.white, padding: 10, borderRadius: 8}}>
        <View style={{flexDirection: 'row', alignItems: 'center', height: 45,}}>
          <Text style={{color: colors.color333, fontWeight: 'bold', fontSize: 15}}>收款账号</Text>
          <View style={{flex: 1}}></View>
          <Text style={{color: colors.color999, fontSize: 10}}>更多信息</Text>
          <Entypo name={"chevron-thin-right"}
                  style={{
                    fontSize: 14,
                    color: colors.color999,
                  }}/>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 45,
          borderTopWidth: pxToDp(1),
          borderColor: colors.colorEEE
        }}>
          <FontAwesome5 name={"weixin"}
                        style={{
                          fontSize: 25,
                          color: colors.main_color,
                        }}/>

          <Text style={{color: colors.color333, marginLeft: 10, fontWeight: "400", fontSize: 14}}>微信</Text>
          <View style={{flex: 1}}></View>
          <Text style={{color: colors.color999, fontSize: 10}}>未绑定</Text>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 45,
          borderTopWidth: pxToDp(1),
          borderColor: colors.colorEEE
        }}>
          <FontAwesome5 name={"alipay"}
                        style={{
                          fontSize: 30,
                          color: colors.fontBlue
                        }}/>
          <Text style={{color: colors.color333, marginLeft: 10, fontWeight: "400", fontSize: 14}}>支付宝</Text>
          <View style={{flex: 1}}></View>
          <Text style={{color: colors.color999, fontSize: 10}}>未绑定</Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderToday() {
    return (
      <TouchableOpacity
        style={{backgroundColor: colors.white, padding: 10, borderRadius: 8, marginTop: 10, paddingBottom: 6}}
        onPress={() => {
          this.toDetail(
            tool.fullDay(new Date()),
            this.state.status,
            this.state.id
          );
        }}
      >
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center', height: 45,}}>
            <Text style={{color: colors.color333, fontWeight: 'bold', fontSize: 15}}>打款记录</Text>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopWidth: pxToDp(1),
            borderColor: colors.colorEEE,
          }}>
            <View style={{
              padding: 10,
              paddingLeft: 0,
              flex: 1
            }}>
              <Text style={{color: colors.color333, fontSize: 15}}>
                今日数据（{tool.fullDay(new Date())})
              </Text>
              <Text style={{color: colors.color999, fontSize: 17, marginTop: 3}}>
                已完成订单 : {this.state.orderNum}  &nbsp;&nbsp;  金额 : {tool.toFixed(this.state.totalPrice)}
              </Text>
            </View>
            <Entypo name={"chevron-thin-right"}
                    style={{
                      marginLeft: 5,
                      fontSize: 18,
                      color: colors.color999,
                    }}/>
          </View>

        </View>
      </TouchableOpacity>
    )
  }

  renderList() {
    let item = [];
    item.push(
      tool.objectMap(this.state.list, (item, index) => {
        return (
          <View key={index} style={{flex: 1}}>
            {tool.objectMap(item, (ite, key) => {
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    this.toDetail(
                      ite.bill_date,
                      ite.status,
                      ite.id,
                      ite.profit_price
                    );
                  }}

                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomColor: colors.colorEEE,
                    borderBottomWidth: 1,
                    height: 45,
                  }}
                >
                  <Text style={{color: colors.color333, fontSize: 16, fontWeight: 'bold', width: 50}}>
                    {dayjs(ite.bill_date).format('MM-DD')}
                  </Text>

                  <View style={{width: 40}}>
                    <If condition={ite.status !== Cts.BILL_STATUS_PAID}>
                      {1 ? <FontAwesome5 name={"weixin"}
                                         style={{
                                           marginLeft: 10,
                                           fontSize: 20,
                                           color: colors.main_color,
                                         }}/>
                        : <FontAwesome5 name={"alipay"}
                                        style={{
                                          fontSize: 30,
                                          color: colors.fontBlue
                                        }}/>}
                    </If>
                  </View>

                  {ite.status !== Cts.BILL_STATUS_PAID ?
                    <Text style={{color: colors.warn_color, fontSize: 14}}>已打款</Text> :
                    <Text style={{color: colors.color999, fontSize: 14}}>待打款</Text>}
                  <View style={{flex: 1}}></View>
                  <Text style={{color: colors.color333, fontSize: 18, fontWeight: 'bold'}}>
                    {tool.toFixed(ite.bill_price)}
                  </Text>
                  <Entypo name={"chevron-thin-right"}
                          style={{
                            marginLeft: pxToDp(10),
                            fontSize: 18,
                            color: colors.color999,
                          }}/>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })
    )
    return (
      <View style={{
        backgroundColor: colors.white, padding: 10, borderRadius: 8, marginTop: 10
      }}>

        <View style={{flexDirection: 'row', alignItems: 'center', height: 45,}}>
          <Text style={{color: colors.color333, fontWeight: 'bold', fontSize: 15}}>
            {dayjs(new Date()).format('YYYY-MM')}
          </Text>
          <Entypo
            name={"triangle-down"}
            style={{
              marginLeft: 5,
              fontSize: 20,
              color: colors.color999,
            }}/>
          <View style={{flex: 1}}></View>
          <Text style={{color: colors.main_color, marginLeft: 10, fontWeight: 'bold', fontSize: 15}}>本月销量汇总 </Text>
        </View>
        {item}
      </View>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene);
