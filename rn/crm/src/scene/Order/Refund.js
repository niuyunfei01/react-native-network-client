import React, {Component} from "react";
import {
  Image,
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import pxToDp from "../../util/pxToDp";
import {Colors, Metrics, Styles} from "../../themes";
import {connect} from "react-redux";
import Config from '../../config'
import color from '../../widget/color'
//组件
import {Button1, Line, Yuan} from "../component/All";
import LoadingView from "../../widget/LoadingView";
//请求
import {getWithTpl, jsonWithTpl} from "../../util/common";
import {showError, ToastLong} from "../../util/ToastUtils";
import colors from "../../styles/colors";
import {Dialog} from "../../weui";
import {Input} from "../../weui/index";
import HttpUtils from "../../util/http";

const one = 1 / PixelRatio.get(); //屏幕密度

const mapStateToProps = state => {
  return {
    global: state.global //全局token,
  };
};

const A_refund = 'a_refund';
const Refund_the_difference = 0;

class Refund extends Component {

  constructor(props) {
    super(props);
    this.state = {
      orderDetail: this.props.route.params.orderDetail,
      refundReason: [],
      active: false,
      index: 0,
      goodsList: this.props.route.params.orderDetail.items,
      isLoading: true,
      headerType: 1,
      refund_a: A_refund,
      refund_t_d: Refund_the_difference,
      refundReasonVisible: false,
      refundReasonRuleVisible: false,
      allRefundAccount: 0,
      totalRefundTheDifference: 0,
      totalRefundTheDifference1: 0,
      heavy: 0,
      isShowHeaderType: this.props.route.params.orderDetail.platform == 7
    };
    this.refundReason = null;
  }

  UNSAFE_componentWillMount() {
    this.fetchResources();
  }

  fetchRefundGoodsList  = () => {
    console.log(this.props, 'this.props')
    let {accessToken} = this.props.global
    let es_id = this.props.route.params.orderDetail['ext_store_id']
    let plat_order_id = this.props.route.params.orderDetail['platform_oid']
    HttpUtils.get(`/new_api/orders/get_unit_part_refund_foods/${es_id}/${plat_order_id}?access_token=${accessToken}`).then(res => {
      console.log('res', res)
    }).catch((e) => {
      showError(`${e.obj}`)
    })
  }

  fetchRefundTheDifference = () => {

  }

  fetchResources = () => {
    let url = `/api/refund_reason?access_token=${
      this.props.global.accessToken
    }`;
    getWithTpl(
      url,
      json => {
        if (json.ok) {
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
          justifyContent: "space-between"
        }}
      >
        <Text style={[Styles.h303e, {fontSize: pxToDp(30), fontWeight: "normal"}]}>{text}</Text>
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
    this.soldOut = [];
    this.state.goodsList.map(element => {
      if (element.active && element.num !== 0) {
        this.refundgoodsList.push({id: element.id, count: element.num});
        this.soldOut.push(element);
      }
    });

    let payload = {
      order_id: this.state.orderDetail.id,
      items: this.refundgoodsList,
      reason: this.refundReason || this.state.refundReason[this.state.index]
    };
    jsonWithTpl(
      `api/manual_refund?access_token=${this.props.global.accessToken}`,
      payload,
      ok => {
        if (ok.ok) {
          ToastLong("退款成功！");
          if (this.state.index === 0) {
            this.props.navigation.navigate(Config.ROUTE_GOODS_SOLDOUT, {
              goodsList:
              this.soldOut, onSuccess: () => this.props.navigation.goBack()
            })
          } else {
            this.props.navigation.goBack();
          }
        } else {
          ToastLong(ok.reason);
          // this.props.navigation.goBack();
        }
      },
      error => {
        ToastLong("网络错误");
      },
      action => {
      }
    );
  };

  renderHeaderTab() {
    return (
        <View style={{
          width: '100%',
          flexDirection: 'row',
          backgroundColor: colors.main_color
        }}>
          <Text
              onPress={() => {
                this.setState({
                  headerType: 1,
                })
              }}
              style={this.state.headerType === 1 ? [styles.header_text] : [styles.header_text, styles.check_staus]}>退款</Text>
          <Text
              onPress={() => {
                this.setState({
                  headerType: 2,
                })
                this.fetchRefundGoodsList()
              }}
              style={this.state.headerType !== 1 ? [styles.header_text] : [styles.header_text, styles.check_staus]}>退差价</Text>
        </View>
    )
  }

  render() {
    console.disableYellowBox = true;
    const self = this
    const navigation = self.props.navigation
    const order = self.state.orderDetail
    let {allRefundAccount, totalRefundTheDifference, heavy, isShowHeaderType, totalRefundTheDifference1} = this.state
    console.log('this.state.goodsList', this.state.goodsList)

    return this.state.isLoading ? (
      <LoadingView/>
    ) : (
      <View
        style={{
          marginVertical: 9,
          backgroundColor: "#FFF",
          flex: 1,
          height: '100%'
        }}>
        {isShowHeaderType && this.renderHeaderTab()}
        <ScrollView  style={{backgroundColor: '#EEEEEE', height: '100%'}}>
          {this.state.refund_a === A_refund && this.state.headerType === 1 ?
            <View>
              <View style={{backgroundColor: "#EEEEEE", flexDirection: "row", justifyContent: "space-around"}}>
                <View style={{backgroundColor: '#FFE6E6', width: '96%', borderRadius: pxToDp(8), height: '70%', marginVertical: pxToDp(10)}}>
                  <Text style={{color: color.red, fontSize: 13, margin: pxToDp(10)}}>
                    提示：订单已完成并且已过完成当天，将从结算记录中扣除相应费用
                  </Text>
                </View>
              </View>
              <View style={{backgroundColor: "#EEEEEE", flexDirection: "row", justifyContent: "space-around"}}>
                <View style={{paddingHorizontal: pxToDp(31), borderRadius: pxToDp(20), width: '96%', backgroundColor: '#FFFFFF'}}>
                  {this.state.goodsList.map((element, index) => {
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
                                  borderRadius: pxToDp(10),
                                  marginRight: 10,
                                  borderColor: "#ccc"
                                }}
                            >
                              <Image
                                  source={{uri: element.product_img}}
                                  style={{width: 40, height: 40, borderRadius: pxToDp(10)}}
                              />
                            </View>
                            <View
                                style={{
                                  height: 42,
                                  justifyContent: "space-between",
                                  flex: 1
                                }}
                            >
                              <Text style={[Styles.h203e, {}]} numberOfLines={1}>
                                {element.name}
                              </Text>
                              <View
                                  style={{
                                    flexDirection: "row", justifyContent: "space-between", marginLeft: pxToDp(10)
                                  }}
                              >
                                {/*<Text style={[Styles.h223e]}>*/}
                                {/*  {element.gPrice}*/}
                                {/*</Text>*/}
                                <Text style={[Styles.h16c4, {color: 'black'}]}>
                                  总价{" "}
                                  {(element.price * element.origin_num).toFixed(2)}
                                </Text>
                                <Text style={[Styles.h16c4, {color: 'black'}]}>
                                  X {element.origin_num}
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
                                  if (element.num == 0) {
                                    element.active = false;
                                  } else {
                                    element.active = true;
                                  }
                                  let money = parseFloat(element['price']).toFixed(2)
                                  allRefundAccount = Number(allRefundAccount - money).toFixed(2)
                                  this.setState({
                                    allRefundAccount: parseFloat(allRefundAccount)
                                  })
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
                                  let money = parseFloat(element['price'])
                                  allRefundAccount = Number(allRefundAccount + money).toFixed(2)
                                  this.setState({
                                    allRefundAccount: parseFloat(allRefundAccount)
                                  })
                                  let data = this.state.goodsList;
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
              </View>
            <Line h={1.2}/>
          {/*<View style={{paddingVertical: 10, paddingHorizontal: pxToDp(31)}}>*/}
          {/*  <View*/}
          {/*    style={{*/}
          {/*      flexDirection: "row",*/}
          {/*      justifyContent: "space-between",*/}
          {/*      marginBottom: 5*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Text style={Styles.h203e}>需退款</Text>*/}
          {/*    <Text style={Styles.h203e}>共{this.getNum()}件</Text>*/}
          {/*  </View>*/}
          {/*  <View*/}
          {/*    style={{*/}
          {/*      flexDirection: "row",*/}
          {/*      justifyContent: "space-between"*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Text style={Styles.h16c4}>需扣除金额</Text>*/}
          {/*    <Text style={Styles.h16c4}>以平台为准</Text>*/}
          {/*  </View>*/}
          {/*</View>*/}
            <Dialog
              style={{borderRadius: pxToDp(20)}}
              onRequestClose={() => {
            }}
              visible={this.state.refundReasonVisible}
              title={'退款金额'}
              titleRight={`¥${allRefundAccount}`}
              titleRightStyle={{fontSize: pxToDp(32), marginHorizontal: pxToDp(48), color: 'red'}}
              headerRightStyle={{paddingTop: pxToDp(40), position: 'absolute', top: 0, right: 0}}
              titleStyle={{fontWeight: 'bold'}}
              buttons={[{
              type: 'default',
              label: '取消',
              onPress: () => {
              this.setState({refundReasonVisible: false});
            }
            },
            {
              type: 'default',
              label: '确定',
              onPress: async () => {
              await this.setState({refundReasonVisible: false}, () => this.refund());
            }
            }
              ]}
              >
            {this.title("退款原因")}
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
              alignItems: "center",
              marginTop: 15
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
            {/*<View style={{paddingHorizontal: pxToDp(31), marginTop: 15}}>*/}
            {/*  <TextInput*/}
            {/*    style={[*/}
            {/*      {*/}
            {/*        height: 90,*/}
            {/*        borderWidth: 1,*/}
            {/*        borderColor: "#f2f2f2",*/}
            {/*        padding: 5,*/}
            {/*        textAlignVertical: "top"*/}
            {/*      },*/}
            {/*      Styles.n1grey9*/}
            {/*    ]}*/}
            {/*    placeholder="请输入内容..."*/}
            {/*    selectTextOnFocus={true}*/}
            {/*    autoCapitalize="none"*/}
            {/*    underlineColorAndroid="transparent"*/}
            {/*    placeholderTextColor={Colors.grey9}*/}
            {/*    multiline={true}*/}
            {/*    onChangeText={text => {*/}
            {/*      this.refundReason = text;*/}
            {/*    }}*/}
            {/*  />*/}
            {/*</View>*/}
          </Dialog></View> :
            <View style={{flexDirection: "column"}}>
              <View style={{backgroundColor: "#EEEEEE", flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(10)}}>
                <View style={{paddingHorizontal: pxToDp(31), borderRadius: pxToDp(20), width: '96%', backgroundColor: '#FFFFFF'}}>
                  {this.state.goodsList.map((element, index) => {
                    return (<View key={index}>
                      <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15, marginBottom: index === this.state.goodsList.length - 1 ? 15 : 0}}>
                        <View style={{flexDirection: "row", alignItems: "center", width: "75%"}}>
                          <View style={{width: 42, height: 42, borderWidth: 1, borderRadius: pxToDp(10), marginRight: 10, borderColor: "#ccc"}}>
                            <Image source={{uri: element.product_img}} style={{width: 40, height: 40, borderRadius: pxToDp(10)}}/>
                          </View>
                          <View style={{height: 42, justifyContent: "space-between", flex: 1}}>
                            <Text style={[Styles.h203e, {}]} numberOfLines={1}>
                              {element.name}
                            </Text>
                            <View style={{flexDirection: "row", justifyContent: "space-between", marginLeft: pxToDp(10)}}>
                              <Text style={[Styles.h16c4, {color: 'black'}]}>
                                总价{" "}
                                {(element.price * element.origin_num).toFixed(2)}
                              </Text>
                              <Text style={[Styles.h16c4, {color: 'black'}]}>
                                X {element.origin_num}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={{borderTopWidth: pxToDp(1), borderTopColor: '#000000', flexDirection: "row", justifyContent: "space-between", marginTop: pxToDp(20)}}>
                        <View style={{flexDirection: 'row', alignItems: "center"}}>
                          <Text style={{fontSize: pxToDp(22), color: colors.title_color}}>请输入实际拣重：</Text>
                          <Input
                              onChangeText={heavy => () => {
                                totalRefundTheDifference1 = parseFloat(element.price)
                              }}
                              value={heavy}
                              placeholder="0"
                              underlineColorAndroid="transparent"
                              keyboardType='numeric'
                              style={{borderWidth: pxToDp(1), borderColor: '#000000', height: pxToDp(40), width: pxToDp(80), textAlign: 'center'}}
                          />
                          <Text style={{fontSize: pxToDp(22), color: colors.title_color, marginLeft: pxToDp(10)}}>g</Text>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: "center"}}>
                          <Text style={{fontSize: pxToDp(28), color: 'red'}}>{` ¥ ${this.state.totalRefundTheDifference1}`}</Text>
                        </View>
                      </View>
                    </View>
                    );
                  })}
                </View>
              </View>
              <Line h={1.2}/>
              <View style={{margin: pxToDp(10), flexDirection: "row", justifyContent: "space-between", width: '92%', marginTop: pxToDp(20)}}>
                <TouchableOpacity onPress={() => {
                  this.setState({
                    refundReasonRuleVisible: true
                  })
                }
                } style={{flexDirection: "row", justifyContent: "space-between"}}>
                  <Image
                      source={require("../../img/My/help.png")}
                      style={{width: pxToDp(30), height: pxToDp(30), marginHorizontal: pxToDp(10)}}
                  />
                  <Text style={{fontSize: pxToDp(24), color: '#AAAAAA'}}>退差价规则</Text>
                </TouchableOpacity>
                <Text style={{fontSize: pxToDp(22), color: colors.title_color}}>共退差价<Text style={{fontSize: pxToDp(28), color: 'red'}}>{` ¥ ${totalRefundTheDifference}`}</Text></Text>
              </View>
              <Dialog
                  style={{borderRadius: pxToDp(20)}}
                  onRequestClose={() => {
                  }}
                  visible={this.state.refundReasonRuleVisible}
                  title={'退款计算规则:'}
                  titleStyle={{fontWeight: 'bold'}}
                  buttons={[{
                    type: 'default',
                    label: '取消',
                    onPress: () => {
                      this.setState({refundReasonRuleVisible: false});
                    }
                  },
                    {
                      type: 'default',
                      label: '确定',
                      onPress: async () => {
                        await this.setState({refundReasonRuleVisible: false})
                      }
                    }
                  ]}
              >
                <View>
                  <Text style={{fontSize: pxToDp(24), lineHeight: pxToDp(36)}}>&emsp;&emsp;按照商品各类营销活动计算后的实付金额，计算需退重量占整体重量的金额比例。(举例：商品原价10元，设置单品折扣后实付价8元，应拣重量500g，实拣重量400g，则最终退差价(500-400)/500*8=1.6元)。</Text>
                </View>
              </Dialog>
            </View>}
          {/*<View style={{paddingHorizontal: pxToDp(31)}}>*/}
          {/*  <View style={{flexDirection: "row", alignItems: "center"}}>*/}
          {/*    <Text style={Styles.h32bf}>*/}
          {/*      {tool.shortOrderDay(this.state.orderDetail.orderTime)}#{*/}
          {/*      this.state.orderDetail.dayId*/}
          {/*    }*/}
          {/*    </Text>*/}
          {/*    <Button*/}
          {/*      fontStyle={Styles.h22theme}*/}
          {/*      mgl={30 * one}*/}
          {/*      t={*/}
          {/*        this.state.orderDetail.orderStatus == 1*/}
          {/*          ? "已收单"*/}
          {/*          : this.state.orderDetail.orderStatus == 2*/}
          {/*            ? "已分拣"*/}
          {/*            : this.state.orderDetail.orderStatus == 3*/}
          {/*              ? "已出发"*/}
          {/*              : "已送达"*/}
          {/*      }*/}
          {/*    />*/}
          {/*  </View>*/}
          {/*  <Line mgt={15}/>*/}
          {/*  /!*订单号*!/*/}
          {/*  <View*/}
          {/*    style={{*/}
          {/*      flexDirection: "row",*/}
          {/*      justifyContent: "space-between",*/}
          {/*      marginTop: 15*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Text style={Styles.h22a2}>*/}
          {/*      订单号：{this.state.orderDetail.id}*/}
          {/*    </Text>*/}
          {/*    <Text style={Styles.h22a2}>*/}
          {/*      期望送达：{tool.orderExpectTime(*/}
          {/*      this.state.orderDetail.expectTime*/}
          {/*    )}*/}
          {/*    </Text>*/}
          {/*  </View>*/}
          {/*  <View*/}
          {/*    style={{*/}
          {/*      flexDirection: "row",*/}
          {/*      justifyContent: "space-between",*/}
          {/*      marginTop: 15*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Text style={Styles.h22a2}>*/}
          {/*      <Text>{this.state.orderDetail.pl_name}：</Text>*/}
          {/*      {this.state.orderDetail.platform_oid}*/}
          {/*    </Text>*/}
          {/*    <Text style={Styles.h22a2}>*/}
          {/*      下单时间：{tool.orderOrderTimeShort(*/}
          {/*      this.state.orderDetail.orderTime*/}
          {/*    )}*/}
          {/*    </Text>*/}
          {/*  </View>*/}
          {/*  /!*下单提示*!/*/}
          {/*  <Text style={[Styles.h18theme, {marginVertical: 15}]}>*/}
          {/*    提示：订单已完成并且已过完成当天，将从结算记录中扣除相应费用*/}
          {/*  </Text>*/}
          {/*</View>*/}

          {/*<JbbCellTitle*/}
          {/*  right={(<TouchableOpacity*/}
          {/*      onPress={() => navigation.navigate(Config.ROUTE_ORDER_REFUND_BY_WEIGHT, {*/}
          {/*        order, onSuccess: () => navigation.goBack()*/}
          {/*      })}>*/}
          {/*      <Text style={{color: color.theme, fontSize: 13}}>*/}
          {/*        按重退款>>*/}
          {/*      </Text>*/}
          {/*    </TouchableOpacity>*/}
          {/*  )}*/}
          {/*  children={'选择要退的商品'}*/}
          {/*/>*/}
          {/*商品明细列表*/}

        </ScrollView>
        {/*退款按钮*/}
        <View style={{paddingHorizontal: pxToDp(31)}}>
          {this.state.refund_a === A_refund && this.state.headerType === 1 ?
            <Button1 t="退款" w="100%" onPress={() => this.setState({refundReasonVisible: true})}/> :
            <Button1 t="退差价" w="100%" onPress={() => {this.setState({refundReasonVisible: true})}}/>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header_text: {
    height: 50,
    width: "50%",
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    color: colors.white,
    ...Platform.select({
      ios: {
        lineHeight: 50,
      },
      android: {}
    }),
  },
  check_staus: {
    backgroundColor: colors.white,
    color: colors.title_color
  }
});

export default connect(mapStateToProps)(Refund);

