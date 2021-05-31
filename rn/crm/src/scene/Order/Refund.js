import React, {Component} from "react";
import {Image, PixelRatio, ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {NavigationItem} from "../../widget";
import pxToDp from "../../util/pxToDp";
import {Colors, Metrics, Styles} from "../../themes";
import {connect} from "react-redux";
import Config from '../../config'
import color from '../../widget/color'
//组件
import {Button, Button1, Line, Yuan} from "../component/All";
import LoadingView from "../../widget/LoadingView";
//请求
import {getWithTpl, jsonWithTpl} from "../../util/common";
import {tool} from "../../common";
import {ToastLong} from "../../util/ToastUtils";
import JbbCellTitle from "../component/JbbCellTitle";

const one = 1 / PixelRatio.get(); //屏幕密度

const mapStateToProps = state => {
  return {
    global: state.global //全局token,
  };
};

class Refund extends Component {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '退单详情'
    })
  };

  constructor (props) {
    super(props);
    this.state = {
      orderDetail: this.props.route.params.orderDetail,
      refundReason: [],
      active: false,
      index: 0,
      goodsList: this.props.route.params.orderDetail.items,
      isLoading: true
    };
    this.refundReason = null;
    this.navigationOptions(this.props)
  }

  UNSAFE_componentWillMount () {
    console.log(
      "this.props.route.params.orderDetail:%o",
      this.props.route.params.orderDetail
    );
    this.fetchResources();
  }

  fetchResources = () => {
    let url = `/api/refund_reason?access_token=${
      this.props.global.accessToken
      }`;
    http: getWithTpl(
      url,
      json => {
        if (json.ok) {
          console.log("退款原因:%o", json.obj);
          let data = this.state.goodsList;
          data.map(element => {
            let active = false;
            element.num = 0;
            element.active = active;
          });
          this.setState({
            goodsList: data,
            isLoading: false,
            refundReason: json.obj.concat(["其他原因"])
          });
        } else {
          this.setState({
            isLoading: false
          });
        }
      },
      error => {
        this.setState({
          isLoading: false
        });
      }
    );
  };
  title = text => {
    return (
      <View
        style={{
          height: 40,
          flexDirection: 'row',
          justifyContent: "space-between",
          alignItems: 'center',
          paddingHorizontal: pxToDp(31),
          backgroundColor: "#f2f2f2"
        }}
      >
        <Text style={Styles.h303e}>{text}</Text>
      </View>
    );
  };
  select = (element, index) => {
    this.setState({
      index: index
    });
  };

  getNum = () => {
    let num = 0;
    this.state.goodsList.map(element => {
      if (element.active) {
        num = num + element.num;
      }
    });
    return num;
  };
  //退款
  refund = () => {
    if (
      this.state.index === this.state.refundReason.length - 1 &&
      !this.refundReason
    )
      return ToastLong("请输入退款原因！");
    if (this.getNum() === 0) return ToastLong("请选择退款商品！");
    this.refundgoodsList = [];
    this.state.goodsList.map(element => {
      if (element.active && element.num !== 0) {
        this.refundgoodsList.push({id: element.id, count: element.num});
      }
    });

    let payload = {
      order_id: this.state.orderDetail.id,
      items: this.refundgoodsList,
      reason: this.refundReason || this.state.refundReason[this.state.index]
    };
    console.log("payload:%o", JSON.stringify(payload));
    jsonWithTpl(
      `api/manual_refund?access_token=${this.props.global.accessToken}`,
      payload,
      ok => {
        if (ok.ok) {
          ToastLong("退款成功！");
          this.props.navigation.goBack();
        } else {
          ToastLong(ok.reason);
          // this.props.navigation.goBack();
        }
      },
      error => {
        console.log("error:%o", error);
        ToastLong("网络错误");
      },
      action => {
      }
    );
  };

  render () {
    console.disableYellowBox = true;
    const self = this
    const navigation = self.props.navigation
    const order = self.state.orderDetail

    return this.state.isLoading ? (
      <LoadingView/>
    ) : (
      <View
        style={{
          paddingVertical: 9,
          backgroundColor: "#FFF",
          flex: 1
        }}
      >
        <ScrollView>
          <View style={{paddingHorizontal: pxToDp(31)}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Text style={Styles.h32bf}>
                {tool.shortOrderDay(this.state.orderDetail.orderTime)}#{
                this.state.orderDetail.dayId
              }
              </Text>
              <Button
                fontStyle={Styles.h22theme}
                mgl={30 * one}
                t={
                  this.state.orderDetail.orderStatus == 1
                    ? "已收单"
                    : this.state.orderDetail.orderStatus == 2
                    ? "已分拣"
                    : this.state.orderDetail.orderStatus == 3
                      ? "已出发"
                      : "已送达"
                }
              />
            </View>
            <Line mgt={15}/>
            {/*订单号*/}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 15
              }}
            >
              <Text style={Styles.h22a2}>
                订单号：{this.state.orderDetail.id}
              </Text>
              <Text style={Styles.h22a2}>
                期望送达：{tool.orderExpectTime(
                this.state.orderDetail.expectTime
              )}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 15
              }}
            >
              <Text style={Styles.h22a2}>
                <Text>{this.state.orderDetail.pl_name}：</Text>
                {this.state.orderDetail.platform_oid}
              </Text>
              <Text style={Styles.h22a2}>
                下单时间：{tool.orderOrderTimeShort(
                this.state.orderDetail.orderTime
              )}
              </Text>
            </View>
            {/*下单提示*/}
            <Text style={[Styles.h18theme, {marginVertical: 15}]}>
              提示：订单已完成并且已过完成当天，将从结算记录中扣除相应费用
            </Text>
          </View>

          <JbbCellTitle
            right={(<TouchableOpacity
                onPress={() => navigation.navigate(Config.ROUTE_ORDER_REFUND_BY_WEIGHT, {
                  order, onSuccess: () => navigation.goBack()
                })}>
                <Text style={{color: color.theme, fontSize: 13}}>
                  按重退款>>
                </Text>
              </TouchableOpacity>
            )}
            children={'选择要退的商品'}
          />
          {/*商品明细列表*/}
          <View style={{paddingHorizontal: pxToDp(31)}}>
            {this.state.goodsList.map((element, index) => {
              console.log("element", element);
              return (
                // <TouchableOpacity
                //   onPress={() => {
                //     this.selectRefund(element);
                //   }}
                // >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 15,

                      marginBottom:
                        index === this.state.goodsList.length - 1 ? 15 : 0
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "75%"
                      }}
                    >
                      {/*<Yuan*/}
                      {/*  icon={"md-checkmark"}*/}
                      {/*  size={10}*/}
                      {/*  ic={Colors.white}*/}
                      {/*  w={18}*/}
                      {/*  bw={Metrics.one}*/}
                      {/*  bgc={element.active ? Colors.theme : Colors.white}*/}
                      {/*  bc={element.active ? Colors.theme : Colors.greyc}*/}
                      {/*  mgr={20}*/}
                      {/*  onPress={() => {*/}
                      {/*    this.selectRefund(element);*/}
                      {/*  }}*/}
                      {/*/>*/}
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderWidth: 1,
                          marginRight: 20,
                          borderColor: "#ccc"
                        }}
                      >
                        <Image
                          source={{uri: element.product_img}}
                          style={{width: 40, height: 40}}
                        />
                      </View>
                      <View
                        style={{
                          height: 42,
                          justifyContent: "space-between",
                          flex: 1
                        }}
                      >
                        <Text style={Styles.h203e} numberOfLines={1}>
                          {element.name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center"
                          }}
                        >
                          <Text style={[Styles.h223e, {flex: 1}]}>
                            {element.gPrice}
                          </Text>
                          <Text style={[Styles.h16c4, {flex: 1}]}>
                            总价{" "}
                            {(element.price * element.origin_num).toFixed(2)}
                          </Text>
                          <Text style={[Styles.h16c4, {flex: 1, color: 'black'}]}>
                            *{element.origin_num}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{flexDirection: "row", alignItems: "center"}}
                    >
                      <Yuan
                        icon={"md-remove"}
                        size={25}
                        ic={element.num <= 0 ? Colors.greyc : Colors.grey3}
                        w={25}
                        bw={Metrics.one}
                        mgr={5}
                        bgc={Colors.white}
                        bc={Colors.greyc}
                        onPress={() => {
                          if (element.num <= 0) return;

                          element.num = element.num - 1;
                          if ( element.num == 0 ){
                            element.active = false;
                          }else{
                            element.active = true;
                          }
                          let data = this.state.goodsList;
                          this.setState({
                            goodsList: data
                          });
                        }}
                      />
                      <Text>{element.num}</Text>
                      <Yuan
                        icon={"md-add"}
                        size={25}
                        ic={
                          element.num >= element.origin_num
                            ? Colors.greyc
                            : Colors.grey3
                        }
                        w={25}
                        onPress={() => {
                          if (element.num >= element.origin_num) return;
                          element.num = element.num + 1;
                          element.active = true;
                          let data = this.state.goodsList;
                          console.log(this.state.goodsList)
                          this.setState({
                            goodsList: data
                          });
                        }}
                        bw={Metrics.one}
                        mgl={5}
                        bgc={Colors.white}
                        bc={Colors.greyc}
                      />
                    </View>
                  </View>
                // </TouchableOpacity>
              );
            })}
          </View>
          <Line h={1.2}/>
          <View style={{paddingVertical: 10, paddingHorizontal: pxToDp(31)}}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5
              }}
            >
              <Text style={Styles.h203e}>需退款</Text>
              <Text style={Styles.h203e}>共{this.getNum()}件</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <Text style={Styles.h16c4}>需扣除金额</Text>
              <Text style={Styles.h16c4}>以平台为准</Text>
            </View>
          </View>
          {this.title("部分退单理由")}
          {this.state.refundReason.map((element, index) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  this.select(element, index);
                }}
              >
                <View
                  style={[
                    {
                      flexDirection: "row",
                      // justifyContent: "center",
                      alignItems: "center",
                      marginTop: 15,
                      paddingHorizontal: pxToDp(31)
                      //   padding: 12
                    }
                  ]}
                >
                  <Yuan
                    icon={"md-checkmark"}
                    size={15}
                    ic={Colors.white}
                    w={22}
                    onPress={() => {
                      this.select(element, index);
                    }}
                    bw={Metrics.one}
                    bgc={
                      this.state.index === index ? Colors.theme : Colors.white
                    }
                    bc={
                      this.state.index === index ? Colors.theme : Colors.greyc
                    }
                  />
                  <Text style={[Styles.h203e, {marginLeft: 20}]}>
                    {element}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {/*用户自己输入的退款原因*/}
          <View style={{paddingHorizontal: pxToDp(31), marginTop: 15}}>
            <TextInput
              style={[
                {
                  height: 90,
                  borderWidth: 1,
                  borderColor: "#f2f2f2",
                  padding: 5,
                  textAlignVertical: "top"
                },
                Styles.n1grey9
              ]}
              placeholder="请输入内容..."
              selectTextOnFocus={true}
              // value={}
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              placeholderTextColor={Colors.grey9}
              multiline={true}
              onChangeText={text => {
                this.refundReason = text;
              }}
            />
          </View>
        </ScrollView>
        {/*退款按钮*/}
        <View style={{paddingHorizontal: pxToDp(31)}}>
          <Button1 t="确认退款所选商品" w="100%" onPress={() => this.refund()}/>
        </View>
      </View>
    );
  }
}

export default connect(mapStateToProps)(Refund);

