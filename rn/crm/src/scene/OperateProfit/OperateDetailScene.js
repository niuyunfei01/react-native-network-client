import React, {PureComponent} from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import tool, {toFixed} from "../../common/tool";
import Cts from "../../Cts";
import {hideModal, showModal, ToastLong, ToastShort} from "../../util/ToastUtils";
import {Button, Dialog, Input} from "../../weui/index";
import {fetchProfitDaily, fetchProfitOtherAdd} from "../../reducers/operateProfit/operateProfitActions";
import Header from "./OperateHeader";
import LoadingView from "../../widget/LoadingView";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        fetchProfitDaily,
        fetchProfitOtherAdd,
        ...globalActions
      },
      dispatch
    )
  };
}

class OperateDetailScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      sum: 0,
      editable: false,
      check_detail: false,
      income: null,
      outcome_normal: {
        [Cts.OPERATE_REFUND_OUT]: {num: 0, order_num: 0},
        [Cts.OPERATE_DISTRIBUTION_TIPS]: {num: 0, order_num: 0},
        [Cts.OPERATE_DISTRIBUTION_FEE]: {num: 0, order_num: 0},
        [Cts.OPERATE_OUT_BASIC]: {num: 0},
        [Cts.OPERATE_OUT_BLX]: {num: 0},
        [Cts.OPERATE_OUT_PLAT_FEE]: {num: 0}
      },
      outcome_other: [],
      isLoading: true, //加载
      type: 0,
      remark: "",
      name: "",
      money: "",
      total_balanced: "",
      title: ""
    }

  }

  toOperateDetail(url, params = {}) {
    params.day = this.props.route.params.day;
    if (this.state.check_detail) {
      this.props.navigation.navigate(url, params);
    } else {
      ToastLong("您没有权限!");
    }
  }

  UNSAFE_componentWillMount() {
    this.setState({
      total_balanced: this.props.route.params.total_balanced
    });
    this.getProfitDaily();
  }

  profitOtherAdd() {
    let {accessToken, currStoreId} = this.props.global;
    let {day} = this.props.route.params;
    let {type, remark, name, money} = this.state;
    if (!(type > 0 && money > 0 && tool.length(name) > 0)) {
      this.setState({uploading: false});
      hideModal();
      ToastLong("请检查数据!");
    }
    let data = {
      type: type,
      name: name,
      cents: parseInt(money) * 100,
      remark: remark
    };
    const {dispatch} = this.props;
    dispatch(
      fetchProfitOtherAdd(
        currStoreId,
        day,
        data,
        accessToken,
        async (ok, obj, desc) => {
          await this.setState({uploading: false});
          hideModal()
          if (ok) {
            ToastLong("提交成功");
            this.setState({
              type: 0,
              name: "",
              money: "",
              remark: ""
            });
            this.getProfitDaily();
          } else {
            ToastLong(obj);
          }
        }
      )
    );
  }

  getProfitDaily() {
    let {currStoreId, accessToken} = this.props.global;
    let {day} = this.props.route.params;
    const {dispatch} = this.props;
    dispatch(
      fetchProfitDaily(currStoreId, day, accessToken, async (ok, obj, desc) => {
        let {
          sum,
          editable,
          check_detail,
          income,
          outcome_normal,
          outcome_other
        } = obj;
        if (ok) {
          this.setState({
            sum,
            editable,
            check_detail,
            income,
            outcome_normal,
            outcome_other,
            type: 0,
            isLoading: false
          });
        }
      })
    );
  }

  renderTitle(title, type = 0, add = "") {
    let {editable} = this.state;
    return (
      <View style={content.item}>
        <Text style={content.left}>{title}  </Text>
        <TouchableOpacity
          onPress={() => {
            editable
              ? this.setState({
                type: type,
                dlgShipVisible: true,
                title: add
              })
              : ToastShort("您没有权限");
          }}
        >
          <Text style={content.right}>{add}  </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderOtherOut() {
    return this.state.outcome_other.map((item, index) => {
      if (!(item.valid === false)) {
        return (
          <CellAccess
            key={index}
            title={item.label}
            money={item.num}
            toOperateDetail={() => {
              this.toOperateDetail(Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL, {
                editable: this.state.editable,
                id: item.id,
                refresh: () => {
                  this.getProfitDaily();
                }
              });
            }}
          />
        );
      } else {
        return (
          <CellCancel
            key={index}
            title={item.label}
            money={item.num}
            toOperateDetail={() =>
              this.toOperateDetail(Config.ROUTE_OPERATE_OTHER_EXPEND_DETAIL, {
                editable: this.state.editable,
                id: item.id
              })
            }
          />
        );
      }
    });
  }

  renderOutNormal() {
    let _this = this;
    let {outcome_normal} = this.state;
    return (
      <View style={content.in_box}>
        {this.renderTitle("支出流水")}
        <CellAccess
          title={`用户退款金额(${
            outcome_normal[Cts.OPERATE_REFUND_OUT]["order_num"]
          })单`}
          money={outcome_normal[Cts.OPERATE_REFUND_OUT]["num"]}
          toOperateDetail={() =>
            this.toOperateDetail(Config.ROUTE_OPERATE_EXPEND_DETAIL, {
              type: Cts.OPERATE_REFUND_OUT
            })
          }
        />
        <CellAccess
          title={"保底结算"}
          money={outcome_normal[Cts.OPERATE_OUT_BASIC]["num"]}
          toOperateDetail={() => this.toOperateDetail(Config.ROUTE_SETTLEMENT)}
        />
        <CellAccess
          title={`呼叫配送费(${
            outcome_normal[Cts.OPERATE_DISTRIBUTION_FEE]["order_num"]
          })单`}
          money={outcome_normal[Cts.OPERATE_DISTRIBUTION_FEE]["num"]}
        />
        <CellAccess
          title={"CRM平台服务费"}
          money={outcome_normal[Cts.OPERATE_OUT_BLX]["num"]}
        />
        <CellAccess
          title={"外卖平台服务费(已扣除,支出不含此项)"}
          money={outcome_normal[Cts.OPERATE_OUT_PLAT_FEE]["num"]}
        />
        {this.renderTitle("其他支出流水", Cts.OPERATE_OTHER_OUT, "添加支出项")}
        {_this.renderOtherOut()}
      </View>
    );
  }

  transform = obj => {
    let arr = [];
    for (let item in obj) {
      arr.push(obj[item]);
    }
    return arr;
  };

  render() {
    let {
      sum,
      income,
      editable,
      remark,
      money,
      type,
      name,
      total_balanced,
      balance_money
    } = this.state;
    return this.state.isLoading ? (
      <LoadingView/>
    ) : (
      <View style={{flex: 1}}>
        <Header text={"今日运营收益"} money={toFixed(sum)}/>
        {balance_money > 0 && <Header text={"运营收益结转"} money={toFixed(balance_money)}/>}
        <Header text={"待结算运营收益总额"} money={toFixed(total_balanced)}/>
        <ScrollView style={{paddingBottom: pxToDp(50)}}>
          <View style={content.in_box}>
            {this.renderTitle("收入流水", Cts.OPERATE_OTHER_IN, "添加收入项")}
            <CellAccess
              title={"订单收入"}
              money={this.transform(income)[Cts.OPERATE_ORDER_IN].num}
              toOperateDetail={() =>
                this.toOperateDetail(Config.ROUTE_OPERATE_INCOME_DETAIL, {
                  type: Cts.OPERATE_ORDER_IN,
                  order_money: income[Cts.OPERATE_ORDER_IN].num,
                  other_money: income[Cts.OPERATE_OTHER_IN].num
                })
              }
            />
            <CellAccess
              title={"其他收入"}
              money={
                this.transform(income)[Cts.OPERATE_OTHER_IN]
                  ? this.transform(income)[Cts.OPERATE_OTHER_IN].num
                  : 0
              }
              toOperateDetail={() =>
                this.toOperateDetail(Config.ROUTE_OPERATE_INCOME_DETAIL, {
                  type: Cts.OPERATE_OTHER_IN
                })
              }
              bottom
            />
          </View>
          {this.renderOutNormal()}
          {editable ? (
            <Button
              type={"primary"}
              style={{
                marginTop: pxToDp(80),
                marginHorizontal: pxToDp(30),
                marginBottom: pxToDp(30)
              }}
              onPress={() => {
                if (editable) {
                } else {
                  ToastLong("您没有权限");
                  return false;
                }
              }}
            >
              给用户结款
            </Button>
          ) : null}
        </ScrollView>

        {/*<Toast*/}
        {/*  icon="loading"*/}
        {/*  show={this.state.uploading}*/}
        {/*  onRequestClose={() => {}}*/}
        {/*>*/}
        {/*  提交中*/}
        {/*</Toast>*/}
        <Dialog
          onRequestClose={() => {
          }}
          visible={this.state.dlgShipVisible}
          title={this.state.title}
          titleStyle={{textAlign: "center", color: colors.white}}
          headerStyle={{
            backgroundColor: colors.main_color,
            paddingTop: pxToDp(20),
            justifyContent: "center",
            paddingBottom: pxToDp(20)
          }}
          buttons={[
            {
              type: "default",
              label: "取消",
              onPress: () => {
                this.setState({dlgShipVisible: false});
              }
            },
            {
              type: "primary",
              label: "保存",
              onPress: async () => {
                if (this.state.uploading) {
                  return false;
                }
                await this.setState({
                  dlgShipVisible: false,
                  uploading: true
                });
                showModal('提交中');
                this.profitOtherAdd();
              }
            }
          ]}
        >
          <ScrollView style={{height: pxToDp(500)}}>
            <Text>项目(不超过15个汉字) </Text>
            <Input
              underlineColorAndroid="transparent"
              style={{
                borderWidth: pxToDp(1),
                borderColor: colors.fontGray,
                borderRadius: pxToDp(10)
              }}
              maxLength={15}
              value={name}
              onChangeText={text => {
                this.setState({name: text});
              }}
            />
            <Text>金额(元) </Text>
            <Input
              underlineColorAndroid="transparent"
              style={{
                borderWidth: pxToDp(1),
                borderColor: colors.fontGray,
                borderRadius: pxToDp(10)
              }}
              keyboardType={"numeric"}
              value={money}
              onChangeText={text => {
                this.setState({money: text});
              }}
            />
            <Text>备注说明</Text>
            <Input
              underlineColorAndroid="transparent"
              style={{
                borderWidth: pxToDp(1),
                borderColor: colors.fontGray,
                borderRadius: pxToDp(10),
                height: pxToDp(150),
                marginBottom: pxToDp(150)
              }}
              value={remark}
              onChangeText={text => {
                this.setState({remark: text});
              }}
              multiline={true}
            />
          </ScrollView>
        </Dialog>
      </View>
    );
  }
}

const content = StyleSheet.create({
  in_box: {
    backgroundColor: colors.white,
    marginTop: pxToDp(30),
    paddingHorizontal: pxToDp(30)
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.fontGray,
    alignItems: "center",
    height: pxToDp(90)
  },
  left: {
    fontSize: pxToDp(30),
    fontWeight: "900",
    color: colors.title_color
  },
  right: {
    fontSize: pxToDp(30),
    fontWeight: "900",
    color: colors.main_color
  },
  text: {
    fontSize: pxToDp(30),
    color: colors.title_color
  },
  money: {
    fontSize: pxToDp(36),
    color: colors.title_color
  },
  cancel_item: {
    position: "relative"
  },
  cancel: {
    position: "absolute",
    borderTopWidth: pxToDp(1),
    width: "100%",
    left: pxToDp(30),
    top: "50%"
  },
  img: {
    height: pxToDp(36),
    width: pxToDp(36),
    marginLeft: pxToDp(10)
  },
  item_img: {
    flexDirection: "row",
    alignItems: "center"
  }
});

class CellAccess extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    let {title, money, bottom} = this.props || {};
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.props.toOperateDetail) {
            this.props.toOperateDetail();
          } else {
            return false;
          }
        }}
      >
        <View
          style={
            bottom ? [content.item, {borderBottomWidth: 0}] : [content.item]
          }
        >
          <Text style={content.text}>{title} </Text>
          <View style={content.item_img}>
            <Text style={content.money}>{toFixed(money)} </Text>
            {this.props.toOperateDetail ? (
              <Image
                style={{
                  alignItems: "center",
                  transform: [{scale: 0.6}, {rotate: "-90deg"}]
                }}
                source={require("../../img/Public/xiangxia_.png")}
              />
            ) : (
              <View style={{width: pxToDp(50)}}/>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

class CellCancel extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.props.toOperateDetail) {
            this.props.toOperateDetail();
          } else {
            return false;
          }
        }}
      >
        <View style={[content.item, {position: "relative"}]}>
          <Text>{this.props.title} </Text>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <Text>{toFixed(this.props.money)} </Text>
            {this.props.toOperateDetail ? (
              <Image
                style={{
                  alignItems: "center",
                  transform: [{scale: 0.4}, {rotate: "-90deg"}]
                }}
                source={require("../../img/Public/xiangxia_.png")}
              />
            ) : (
              <View style={{width: pxToDp(50)}}/>
            )}
          </View>
          <View
            style={{
              position: "absolute",
              borderTopWidth: pxToDp(1),
              borderTopColor: "#eee7e8",
              height: pxToDp(2),
              width: "100%"
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OperateDetailScene);
