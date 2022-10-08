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
import {hideModal, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";
import dayjs from "dayjs";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import HttpUtils from "../../../pubilc/util/http";
import styles from 'rmc-picker/lib/PopupStyles';
import zh_CN from 'rmc-date-picker/lib/locale/zh_CN';
import DatePicker from 'rmc-date-picker/lib/DatePicker';
import PopPicker from 'rmc-date-picker/lib/Popup';

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

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class SettlementScene extends PureComponent {

  constructor(props) {
    super(props);
    let date = new Date();
    this.state = {
      list: {},
      orderNum: 0,
      totalPrice: 0,
      status: 0,
      date: date,
      dates: this.format(date),
      store_pay_info: [],
      show_pay_info: false,
    };
    this.getSupplyList();
  }

  getSupplyList() {
    let {currStoreId, accessToken} = this.props.global;
    let {currVendorId} = tool.vendor(this.props.global);
    showModal('加载中...')

    let url = `/api/get_supply_bill_list_v2/${currVendorId}/${currStoreId}/${this.state.dates}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then((res) => {
      hideModal()
      let list = res.bills;
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
      this.setState({
        list: list,
        store_pay_info: res.store_pay_info,
        show_pay_info: res.support_payment !== undefined && Number(res.support_payment) === 1
      })
    }).catch((res) => {
      hideModal()
      ToastShort(res.reason)
    })
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

  onChange = (date) => {
    this.setState({date: date, dates: this.format(date)}, () => {
      this.getSupplyList()
    })
  }

  format = (date) => {
    let month = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    return `${date.getFullYear()}-${month}`;
  }


  render() {
    return (
      <ScrollView style={{flex: 1, padding: 10, backgroundColor: colors.f3}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.getSupplyList.bind(this)}/>
        <If condition={this.state.show_pay_info}>
          {this.renderPayList()}
        </If>
        {this.renderToday()}
        {this.renderList()}
      </ScrollView>
    );
  }

  renderPayList() {
    return (
      <TouchableOpacity onPress={() => {
        this.props.navigation.navigate(Config.ROUTE_BIND_PAY, this.state.store_pay_info);
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

        <For each='item' index="idx" of={this.state.store_pay_info}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 45,
            borderTopWidth: pxToDp(1),
            borderColor: colors.colorEEE
          }} key={idx}>
            <FontAwesome5 name={item.icon}
                          style={{
                            fontSize: item.icon === 'weixin' ? 25 : 30,
                            color: item.icon === 'weixin' ? colors.main_color : colors.fontBlue,
                          }}/>

            <Text style={{color: colors.color333, marginLeft: 10, fontWeight: "400", fontSize: 14}}>{item.label} </Text>
            <If condition={item.default}>
              <Text style={{fontSize: 10, backgroundColor: 'red', color: colors.white}}>默认</Text>
            </If>
            <View style={{flex: 1}}></View>
            <Text style={{
              color: item.status_text === '已绑定' ? colors.main_color : colors.color999,
              fontSize: 10
            }}>{item.status_text} </Text>
          </View>
        </For>
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

  toMonthGather() {
    let {navigation} = this.props;
    let {list} = this.state;
    let dateList = [];
    tool.objectMap(list, (ite, index) => {
      dateList.push({label: index, key: index});
    });

    navigation.navigate(Config.ROUTE_SETTLEMENT_GATHER, {
      date: this.state.dates,
      dateList: dateList
    });
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
                    <If condition={ite.icon}>
                      <FontAwesome5 name={ite.icon}
                                    style={{
                                      marginLeft: 10,
                                      fontSize: ite.icon === 'weixin' ? 20 : 25,
                                      color: ite.icon === 'weixin' ? colors.main_color : colors.fontBlue,
                                    }}/>
                    </If>
                  </View>

                  <Text style={{
                    color: ite.status_label === "待打款" ? colors.warn_color : colors.color999,
                    fontSize: 14
                  }}>{ite.status_label}</Text>
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

    const datePicker = (
      <DatePicker
        rootNativeProps={{'data-xx': 'yy'}}
        minDate={new Date(2015, 8, 15, 10, 30, 0)}
        maxDate={new Date()}
        defaultDate={this.state.date}
        mode="month"
        locale={zh_CN}
      />
    );
    return (
      <View style={{
        backgroundColor: colors.white, padding: 10, borderRadius: 8, marginTop: 10
      }}>
        <View style={{flexDirection: 'row', alignItems: 'center', height: 45,}}>
          <PopPicker
            datePicker={datePicker}
            transitionName="rmc-picker-popup-slide-fade"
            maskTransitionName="rmc-picker-popup-fade"
            styles={styles}
            title={'选择日期'}
            okText={'确认'}
            dismissText={'取消'}
            date={this.state.date}
            onChange={this.onChange}
          >
            <Text style={{
              color: colors.color333,
              fontWeight: 'bold',
              fontSize: 15,
              padding: 5,
              width: 200,
            }}>
              {this.state.dates} &nbsp;
              <Entypo
                name={"triangle-down"}
                style={{
                  marginLeft: 5,
                  fontSize: 20,
                  color: colors.color999,
                }}/>
            </Text>
          </PopPicker>
          <View style={{flex: 1}}></View>
          <Text onPress={() => {
            this.toMonthGather()
          }} style={{color: colors.main_color, marginLeft: 10, fontWeight: 'bold', fontSize: 15}}>本月销量汇总 </Text>
        </View>
        {item}
      </View>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene);
