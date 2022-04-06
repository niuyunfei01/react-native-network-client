import React, {Component} from "react";
import {Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {Line, Yuan} from "../common/component/All";
import {ToastLong} from "../../pubilc/util/ToastUtils";
import colors from "../../pubilc/styles/colors";
import {Dialog, Input} from "../../weui";
import HttpUtils from "../../pubilc/util/http";
import {Button} from "react-native-elements";
import tool from "../../pubilc/common/tool";
import PixelRatio from "react-native/Libraries/Utilities/PixelRatio";
import BottomModal from "../../pubilc/component/BottomModal";
import Entypo from "react-native-vector-icons/Entypo";


const mapStateToProps = state => {
  return {
    global: state.global //全局token,
  };
};

class Refund extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderDetail: this.props.route.params.orderDetail,
      refundReason: [],
      active: false,
      index: 0,
      goodsList: this.props.route.params.orderDetail.items,
      headerType: 1,
      refundReasonVisible: false,
      refundReasonRuleVisible: false,
      allRefundAccount: 0,
      spreadPriceAll: 0,
      totalRefundTheDifference: 0,
      totalRefundTheDifference1: 0,
      heavy: 0,
      isShowHeaderType: Number(this.props.route.params.orderDetail.platform) === 7,
      spreadList: [],
    };
  }

  UNSAFE_componentWillMount() {
    this.fetchResources();
  }


  fetchResources = () => {
    let url = `/api/refund_reason?access_token=${this.props.global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then((res) => {
      let data = this.state.goodsList;
      data.map(element => {
        element.num = 0;
        element.active = false;
      });
      this.setState({
        goodsList: data,
        refundReason: res.concat(["其他原因"])
      });
    })
  };


  fetchRefundGoodsList = () => {
    if (this.state.spreadList.length > 0) {
      return null;
    }
    let {accessToken} = this.props.global
    let es_id = this.state.orderDetail['ext_store_id']
    let plat_order_id = this.state.orderDetail['platform_oid']
    let url = `/new_api/orders/get_unit_part_refund_foods/${es_id}/${plat_order_id}?access_token=${accessToken}`;
    HttpUtils.get(url).then(res => {
      if (res && res.length > 0) {
        let list = [];
        for (let value of res) {
          for (let val of this.state.goodsList) {
            if (!tool.length(val.weight) > 0) {
              this.setState({
                headerType: 1
              }, () => {
                ToastLong('暂不支持按重量退差价')
              })
              return;
            }
            if (value.sku_id === val.sku && Number(value.is_refund_difference) === 1) {
              val.refund_price = value.refund_price;
              val.weight = Number(val.weight) * Number(val.origin_num);
              val.refund_weight = 0;
              val.refund_prices = 0;
              list.push(val)
            }
          }
        }
        this.setState({
          spreadList: list
        })
      }
    }).catch((e) => {
      ToastLong('操作失败' + e.desc);
      this.setState({
        headType: 2,
      })
    })
  }

  getNum = () => {
    let num = 0;
    this.state.goodsList.map(element => {
      if (element.active) {
        num = num + element.num;
      }
    });
    return num;
  };

  getSpreadPriceSum() {
    if (this.state.spreadList.length <= 0) {
      return 0;
    }
    let sum = 0;
    for (let val of this.state.spreadList) {
      sum += val.refund_prices;
    }
    return sum.toFixed(2);
  }

  //退款
  refund = () => {
    if (
      this.state.index === this.state.refundReason.length - 1 &&
      !this.refundReason
    )
      return ToastLong("请输入退款原因！");
    let refundgoodsList = [];
    if (this.state.headerType === 1) {
      if (this.getNum() === 0) return ToastLong("请选择退款商品！");
      this.state.goodsList.map(element => {
        if (element.active && element.num !== 0) {
          refundgoodsList.push({id: element.id, count: element.num});
        }
      });
    } else {
      this.state.spreadList.map(val => {
        if (val.refund_weight > 0 && val.refund_prices > 0) {
          refundgoodsList.push({id: val.id, refund_weight: val.refund_weight});
        }
      })
    }
    let payload = {
      order_id: this.state.orderDetail.id,
      items: refundgoodsList,
      reason: this.refundReason || this.state.refundReason[this.state.index]
    };
    if (this.state.headerType !== 1) {
      payload.refund_type = 'weight';
    }
    let url = `api/manual_refund?access_token=${this.props.global.accessToken}`
    HttpUtils.post.bind(this.props)(url, payload).then((res) => {
      ToastLong("退款成功！");
      this.props.navigation.goBack()
    }, (res) => {
      ToastLong('操作失败：' + res.reason);
    })
  };


  render() {
    let {showReasonText} = this.state
    let allRefundAccount = this.state.headerType === 1 ? this.state.allRefundAccount : this.getSpreadPriceSum();
    return (
      <View
        style={{
          backgroundColor: "#FFF",
          flex: 1,
        }}>

        <BottomModal
          title={'退款金额' + `(¥${allRefundAccount})`}
          actionText={'退 款'}
          onPress={() => {
            this.setState({refundReasonVisible: false}, () => this.refund());
          }}
          visible={this.state.refundReasonVisible}
          onClose={() => this.setState({
            refundReasonVisible: false,
          })}
        >
          <For index="index" each='element' of={this.state.refundReason}>
            <TouchableOpacity
              onPress={() => {

                this.setState({
                  index: index,
                  showReasonText: index === 3
                });
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
                <View style={{
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  backgroundColor: this.state.index === index ? colors.main_color : colors.white,
                  justifyContent: "center",
                  alignItems: 'center',
                }}>
                  <Entypo name={this.state.index === index ? 'check' : 'circle'} style={{
                    fontSize: pxToDp(32),
                    color: this.state.index === index ? 'white' : colors.main_color,
                  }}/>
                </View>

                <Text style={[{
                  color: colors.fontBlack,
                  fontSize: 13,
                  marginLeft: 10
                }]}>
                  {element}
                </Text>
              </View>
            </TouchableOpacity>
          </For>
          <View style={{paddingHorizontal: pxToDp(31), marginTop: 15}}>
            <If condition={showReasonText}>
              <TextInput
                style={[
                  {
                    height: 90,
                    borderWidth: 1,
                    borderColor: "#f2f2f2",
                    padding: 5,
                    textAlignVertical: "top"
                  },
                  styles.n1grey9
                ]}
                placeholder="请输入内容..."
                selectTextOnFocus={true}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
                placeholderTextColor={colors.color999}
                multiline={true}
                onChangeText={text => {
                  this.refundReason = text;
                }}
              /></If>
          </View>
        </BottomModal>

        {this.state.isShowHeaderType && this.renderHeaderTab()}
        <ScrollView style={{backgroundColor: '#EEEEEE', height: '100%'}}>
          {this.state.headerType === 1 ? this.renderRefund() : this.renderSpread()}
        </ScrollView>
        {this.rendenBtn()}
      </View>
    );
  }

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

  renderRefund() {
    let {allRefundAccount} = this.state
    return (
      <View>
        <View style={{backgroundColor: "#EEEEEE", flexDirection: "row", justifyContent: "space-around"}}>
          <View style={{
            backgroundColor: '#FFE6E6',
            width: '96%',
            borderRadius: pxToDp(8),
            height: '70%',
            marginVertical: pxToDp(10)
          }}>
            <Text style={{color: colors.warn_red, fontSize: 13, margin: pxToDp(10)}}>
              提示：订单已完成并且已过完成当天，将从结算记录中扣除相应费用
            </Text>
          </View>
        </View>
        <View style={{backgroundColor: "#EEEEEE", flexDirection: "row", justifyContent: "space-around"}}>
          <View style={{
            paddingHorizontal: pxToDp(31),
            borderRadius: pxToDp(20),
            width: '96%',
            backgroundColor: '#FFFFFF'
          }}>
            <For index="index" each='element' of={this.state.goodsList}>
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
                    <Text style={[styles.h203e, {}]} numberOfLines={1}>
                      {element.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row", justifyContent: "space-between", marginLeft: pxToDp(10)
                      }}
                    >
                      <Text style={[styles.h16c4, {color: 'black'}]}>
                        总价{" "}
                        {(element.supply_price / 100 * element.origin_num).toFixed(2)}
                      </Text>
                      <Text style={[styles.h16c4, {color: 'black'}]}>
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
                    ic={element.num <= 0 ? colors.gray : colors.color333}
                    w={25}
                    bw={1 / PixelRatio.get()}
                    mgr={5}
                    bgc={colors.white}
                    bc={colors.gray}
                    onPress={() => {
                      if (element.num <= 0) return;
                      element.num = element.num - 1;
                      if (element.num == 0) {
                        element.active = false;
                      } else {
                        element.active = true;
                      }
                      let money = parseFloat(element['supply_price'] / 100).toFixed(2)
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
                  <Text>{element.num} </Text>
                  <Yuan
                    icon={"md-add"}
                    size={25}
                    ic={
                      element.num >= element.origin_num
                        ? colors.gray
                        : colors.color333
                    }
                    w={25}
                    onPress={() => {
                      if (element.num >= element.origin_num) return;
                      element.num = element.num + 1;
                      element.active = true;
                      let money = parseFloat(element['supply_price'] / 100)
                      allRefundAccount = Number(allRefundAccount + money).toFixed(2)
                      this.setState({
                        allRefundAccount: parseFloat(allRefundAccount)
                      })
                      let data = this.state.goodsList;
                      this.setState({
                        goodsList: data
                      });
                    }}
                    bw={1 / PixelRatio.get()}
                    mgl={5}
                    bgc={colors.white}
                    bc={colors.gray}
                  />
                </View>
              </View>
            </For>
          </View>
        </View>
        <Line h={1.2}/>

      </View>
    )
  }

  renderSpread() {
    return (
      <View style={{flexDirection: "column"}}>
        <View style={{
          backgroundColor: "#EEEEEE",
          marginTop: pxToDp(10),
        }}>
          <For index="index" each='element' of={this.state.spreadList}>
            <View key={index} style={{
              margin: pxToDp(10),
              padding: pxToDp(10),
              backgroundColor: '#FFFFFF',
              borderRadius: pxToDp(20),
            }}>
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                margin: pxToDp(10)
              }}>
                <View style={{flexDirection: "row", alignItems: "center", width: "75%"}}>
                  <View style={{
                    width: 42,
                    height: 42,
                    borderWidth: 1,
                    borderRadius: pxToDp(10),
                    marginRight: 10,
                    borderColor: "#ccc"
                  }}>
                    <Image source={{uri: element.product_img}}
                           style={{width: 40, height: 40, borderRadius: pxToDp(10)}}/>
                  </View>
                  <View style={{height: 42, justifyContent: "space-between", flex: 1}}>
                    <Text style={[styles.h203e, {}]} numberOfLines={1}>
                      {element.name}
                    </Text>
                    <View
                      style={{flexDirection: "row", justifyContent: "space-between", marginLeft: pxToDp(10)}}>
                      <Text style={[styles.h16c4, {color: 'black'}]}>
                        总价{" "}
                        {(element.supply_price / 100 * element.origin_num).toFixed(2)}
                      </Text>
                      <Text style={[styles.h16c4, {color: 'black'}]}>
                        X {element.origin_num}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{
                borderTopWidth: pxToDp(1),
                borderTopColor: '#000000',
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: pxToDp(10)
              }}>
                <View style={{flexDirection: 'row', alignItems: "center"}}>
                  <Text style={{fontSize: pxToDp(22), color: colors.title_color}}>请输入实际拣重：</Text>
                  <Input
                    onChangeText={(weight) => {
                      if (weight > element.weight) {
                        ToastLong("超出可退重量");
                        return;
                      }
                      let spread_list = this.state.spreadList;
                      spread_list[index].refund_weight = weight;
                      let refund_price = parseFloat(parseFloat((Number(element.weight) - weight) / Number(element.weight)) * element.refund_price).toFixed(2)
                      spread_list[index].refund_prices = parseFloat(refund_price);
                      this.setState({
                        spreadList: spread_list,
                      })
                    }}
                    value={element.refund_weight}
                    placeholder="0"
                    underlineColorAndroid="transparent"
                    keyboardType='numeric'
                    style={{
                      borderWidth: pxToDp(1),
                      borderColor: '#000000',
                      height: pxToDp(40),
                      width: pxToDp(80),
                      textAlign: 'center'
                    }}
                  />
                  <Text
                    style={{fontSize: pxToDp(22), color: colors.title_color, marginLeft: pxToDp(10)}}>g</Text>
                </View>
                <If condition={element.refund_prices > 0}>
                  <View style={{flexDirection: 'row', alignItems: "center"}}>
                    <Text style={{
                      fontSize: pxToDp(28),
                      color: 'red'
                    }}>{` ¥ ${element.refund_prices}`} </Text>
                  </View>
                </If>
              </View>
            </View>
          </For>
        </View>

        <View style={{
          margin: pxToDp(10),
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: pxToDp(20)
        }}>
          <TouchableOpacity onPress={() => {
            this.setState({
              refundReasonRuleVisible: true
            })
          }
          } style={{flexDirection: "row", justifyContent: "space-between", marginBottom: pxToDp(100)}}>
            <Image
              source={require("../../pubilc/img/My/help.png")}
              style={{width: pxToDp(30), height: pxToDp(30), marginHorizontal: pxToDp(10)}}
            />
            <Text style={{fontSize: pxToDp(24), color: '#AAAAAA'}}>退差价规则</Text>
          </TouchableOpacity>
          <If condition={this.getSpreadPriceSum() > 0}>
            <Text style={{fontSize: pxToDp(22), color: colors.title_color, marginRight: pxToDp(10)}}>共退差价<Text
              style={{fontSize: pxToDp(28), color: 'red'}}> ¥ {this.getSpreadPriceSum()} </Text></Text>
          </If>
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
            <Text style={{
              fontSize: pxToDp(24),
              lineHeight: pxToDp(36)
            }}>&emsp;&emsp;按照商品各类营销活动计算后的实付金额，计算需退重量占整体重量的金额比例。(举例：商品原价10元，设置单品折扣后实付价8元，应拣重量500g，实拣重量400g，则最终退差价(500-400)/500*8=1.6元)。</Text>
          </View>
        </Dialog>

      </View>
    )
  }

  rendenBtn() {
    return (
      <View style={{padding: pxToDp(31)}}>
        {this.state.headerType === 1 ?
          <Button title={'退款'}
                  onPress={() => {
                    this.setState({refundReasonVisible: true})
                  }}
                  buttonStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.main_color,
                  }}

                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          /> :
          <Button title={'退差价'}
                  disabled={this.getSpreadPriceSum() <= 0}
                  onPress={() => {
                    this.setState({refundReasonVisible: true})
                  }}
                  buttonStyle={{
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.main_color,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />
        }
      </View>
    )
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
  },
  h203e: {
    color: colors.fontBlack,
    fontSize: 13
  },
  h16c4: {
    color: colors.c4,
    fontSize: 10
  },
  n1grey9: {
    color: colors.color999,
    fontSize: 14
  },
});

export default connect(mapStateToProps)(Refund);

