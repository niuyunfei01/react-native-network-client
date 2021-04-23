import React, {PureComponent} from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from "react-native";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {
  get_supply_bill_list,
  get_supply_items
} from "../../reducers/settlement/settlementActions";
import tool from "../../common/tool.js";
import {Icon} from "../../weui/index";
import Config from "../../config";
import Cts from "../../Cts";
import {ToastLong} from "../../util/ToastUtils";
import LoadingView from "../../widget/LoadingView";
import Moment from "moment/moment";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        get_supply_items,
        get_supply_bill_list,
        ...globalActions
      },
      dispatch
    )
  };
}

class SettlementScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "打款记录"
    };
  };
  
  constructor (props) {
    super(props);
    this.state = {
      query: true,
      checked: ["1", "2"],
      authority: false,
      canChecked: false,
      list: {},
      orderNum: 0,
      totalPrice: 0,
      status: 0
    };
    this.renderList = this.renderList.bind(this);
    this.renderBtn = this.renderBtn.bind(this);
  }
  
  UNSAFE_componentWillMount () {
    this.getSupplyList();
  }
  
  componentDidUpdate () {
    let {key, params} = this.props.route;
    let {isRefreshing} = params || {};
    if (isRefreshing) {
      console.log(params);
      this.setState({isRefreshing: isRefreshing});
      const setRefresh = this.props.navigation.setParams({
        isRefreshing: false,
        key: key
      });
      this.props.navigation.dispatch(setRefresh);
      this.setState({query: true});
      this.getSupplyList();
    }
  }
  
  inArray (key) {
    let checked = this.state.checked;
    let index = checked.indexOf(key);
    if (index >= 0) {
      return {have: true, index};
    } else {
      return {have: false, index};
    }
  }
  
  getSupplyList () {
    let store_id = this.props.global.currStoreId;
    let {currVendorId} = tool.vendor(this.props.global);
    let token = this.props.global.accessToken;
    const {dispatch} = this.props;
    this.setState({
      query: true
    });
    dispatch(
      get_supply_bill_list(currVendorId, store_id, token, async resp => {
        console.log("bill list ", resp);
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
          this.setState({list: list, query: false});
        } else {
          ToastLong(resp.desc);
        }
        this.setState({query: false});
      })
    );
  }
  
  toggleCheck (key, date, status, id, profit) {
    let checked = this.state.checked;
    if (this.state.canChecked) {
      let {have, index} = this.inArray(key);
      if (have) {
        checked.splice(index, 1);
      } else {
        checked.push(key);
      }
      this.forceUpdate();
    } else {
      this.toDetail(date, status, id, profit);
    }
  }
  
  toDetail (date, status, id, profit) {
    let {navigation} = this.props;
    navigation.navigate(Config.ROUTE_SETTLEMENT_DETAILS, {
      date: date,
      status: status,
      id: id,
      profit,
      key: navigation.state.key
    });
  }
  
  toMonthGather (date) {
    let {navigation} = this.props;
    let {list} = this.state;
    let dateList = [];
    tool.objectMap(list, (ite, index) => {
      dateList.push({label: index, key: index});
    });
    
    navigation.navigate(Config.ROUTE_SETTLEMENT_GATHER, {
      date: date,
      dateList: dateList
    });
  }
  
  renderStatus (status) {
    if (status == Cts.BILL_STATUS_PAID) {
      return (
        <Text
          style={[
            styles.status,
            {
              borderColor: colors.main_color,
              color: colors.main_color
            }
          ]}
        >
          已打款
        </Text>
      );
    } else {
      return <Text style={[styles.status]}>{tool.billStatus(status)}</Text>;
    }
  }
  
  selectAll () {
    let selectAllList = [];
    let {checked, list} = this.state;
    if (checked.length == list.length) {
    } else {
      list.forEach(item => {
        selectAllList.push(item.key);
      });
    }
    this.state.checked = selectAllList;
    this.forceUpdate();
  }
  
  renderBtn () {
    let {checked, list} = this.state;
    if (this.state.authority) {
      if (!this.state.canChecked) {
        return (
          <View style={styles.btn_box}>
            <TouchableOpacity
              style={{flex: 4.2}}
              onPress={() => {
                this.setState({canChecked: true});
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%"
                }}
              >
                <Text
                  style={{color: colors.main_color, fontSize: pxToDp(30)}}
                >
                  选择
                </Text>
              </View>
            </TouchableOpacity>
            <View
              style={{
                flex: 3,
                backgroundColor: "#dcdcdc",
                height: "100%",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{color: "#fff", fontSize: pxToDp(30)}}>
                确认打款
              </Text>
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.btn_box}>
            <TouchableOpacity
              onPress={() => {
                this.setState({canChecked: false});
              }}
            >
              <Text style={[styles.btn_text, styles.cancel]}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                this.selectAll();
              }}
              style={{
                flexDirection: "row",
                width: pxToDp(290),
                justifyContent: "center"
              }}
            >
              <Icon
                name={checked.length == list.length ? "success" : "circle"}
                style={{marginRight: pxToDp(10)}}
              />
              <Text
                style={[styles.btn_text, styles.all, {width: pxToDp(80)}]}
              >
                全选
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.submit]}>确认打款</Text>
          </View>
        );
      }
    }
  }
  
  renderEmpty () {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          marginTop: pxToDp(200)
        }}
      >
        <Image
          style={{width: pxToDp(100), height: pxToDp(135)}}
          source={require("../../img/Goods/zannwujilu.png")}
        />
        <Text
          style={{
            fontSize: pxToDp(24),
            color: "#bababa",
            marginTop: pxToDp(30)
          }}
        >
          没有相关记录
        </Text>
      </View>
    );
  }
  
  renderList () {
    let _this = this;
    return tool.objectMap(this.state.list, (item, index) => {
      return (
        <View key={index}>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: pxToDp(30),
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: pxToDp(10)
            }}
          >
            <Text numberOfLines={1} style={{fontSize: pxToDp(22)}}>
              {Moment(index).format('YY年MM月')}
            </Text>
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => this.toMonthGather(index)}
            >
              <Text style={[styles.to_month, {fontSize: pxToDp(24)}]} numberOfLines={1}>
                本月销量汇总
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            {tool.objectMap(item, (ite, key) => {
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    this.toggleCheck(
                      ite.key,
                      ite.bill_date,
                      ite.status,
                      ite.id,
                      ite.profit_price
                    );
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingLeft: pxToDp(30),
                      paddingRight: pxToDp(30),
                      borderBottomColor: "#EEEEEE",
                      borderBottomWidth: 1,
                      justifyContent: "space-between",
                      height: pxToDp(100),
                      backgroundColor: "#fff"
                    }}
                  >
                    <Text
                      style={{
                        height: "auto",
                        marginRight: pxToDp(10)
                      }}
                    >
                      {" "}
                      {Moment(ite.bill_date).format('MM-DD')}
                    </Text>
                    {this.renderStatus(ite.status)}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        flex: 1
                      }}
                    >
                      <Text style={{color: colors.fontGray, fontSize: pxToDp(24)}}>
                        {tool.toFixed(ite.bill_price)}元
                      </Text>
                      <Image
                        style={{
                          alignItems: "center",
                          transform: [{scale: 0.6}, {rotate: "-90deg"}]
                        }}
                        source={require("../../img/Public/xiangxia_.png")}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    });
  }
  
  render () {
    return this.state.query ? (
      <LoadingView/>
    ) : (
      <View
        style={
          this.state.authority
            ? {flex: 1, paddingBottom: pxToDp(110)}
            : {flex: 1}
        }
      >
        <TouchableHighlight
          onPress={() => {
            this.toDetail(
              tool.fullDay(new Date()),
              this.state.status,
              this.state.id
            );
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.white,
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <View>
              <View style={styles.header}>
                <Text style={styles.today_data}>
                  今日数据（{tool.fullDay(new Date())})
                </Text>
                
                <View style={{flexDirection: "row", marginTop: pxToDp(20)}}>
                  <Text style={styles.order_text}>
                    已完成订单 : {this.state.orderNum}
                  </Text>
                  <Text style={[styles.order_text, {marginLeft: pxToDp(64)}]}>
                    金额 : {tool.toFixed(this.state.totalPrice)}
                  </Text>
                </View>
              </View>
            </View>
            
            <Image
              style={{
                alignItems: "center",
                transform: [{scale: 0.7}, {rotate: "-90deg"}],
                marginRight: pxToDp(30)
              }}
              source={require("../../img/Public/xiangxia_.png")}
            />
          </View>
        </TouchableHighlight>
        
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.query}
              onRefresh={async () => {
                // await this.setState({ query: true });
                this.getSupplyList();
              }}
              tintColor="gray"
            />
          }
          style={{flex: 1}}
        >
          {this.renderList()}
        </ScrollView>
        {this.renderBtn()}
      </View>
    );
  }
}

//make this component available to the app
const styles = StyleSheet.create({
  header: {
    height: pxToDp(140),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: pxToDp(30),
    justifyContent: "center",
    borderBottomWidth: pxToDp(1),
    borderBottomColor: "#eeeeee"
  },
  today_data: {
    fontSize: pxToDp(24),
    color: colors.fontGray
  },
  order_text: {
    fontSize: pxToDp(28),
    color: colors.fontBlack
  },
  status: {
    borderWidth: pxToDp(1),
    height: pxToDp(30),
    borderRadius: pxToDp(20),
    width: pxToDp(68),
    fontSize: pxToDp(16),
    textAlign: "center",
    justifyContent: "center",
    color: colors.fontGray,
    borderColor: colors.fontGray,
    lineHeight: pxToDp(28),
  },
  btn_box: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: pxToDp(112),
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: pxToDp(1),
    borderTopColor: "#CCCCCC"
  },
  btn_text: {
    fontSize: pxToDp(32),
    color: colors.main_color,
    width: pxToDp(209),
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  cancel: {
    borderRightColor: "#eeeeee",
    borderRightWidth: pxToDp(1),
    width: pxToDp(160)
  },
  submit: {
    height: "100%",
    textAlign: "center",
    color: "#fff",
    backgroundColor: colors.main_color,
    flex: 1,
    alignItems: "center",
    fontSize: pxToDp(32),
    lineHeight: pxToDp(80)
  },
  to_month: {
    color: colors.main_color,
    fontSize: pxToDp(30),
    textAlign: "right",
    flex: 1
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene);
