import React, { Component } from "react";
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ListView,
  Image,
  InteractionManager,
  RefreshControl,
  Alert,
  Clipboard,
  ToastAndroid,
  PixelRatio,
  TextInput
} from "react-native";
import { NavigationItem } from "../../widget";
import pxToDp from "../../util/pxToDp";
import { Styles, Metrics, Colors } from "../../themes";

//组件
import { Button, Line, Yuan, Button1 } from "../component/All";
import index from "../../stylekit";
const one = 1 / PixelRatio.get(); //屏幕密度
console.log("one:%o", one);
export default class Refund extends Component {
  //导航
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerLeft: (
        <NavigationItem
          title="返回"
          icon={require("../../img/Register/back_.png")}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31)
            // marginTop: pxToDp(20)
          }}
          onPress={() => {
            navigation.goBack();
          }}
        />
      )
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      orderDetail: this.props.navigation.state.params.orderDetail,
      refundReason: [
        { id: 1, text: "商家订单太多，怕您等的太久" },
        { id: 2, text: "没有货了" },
        { id: 3, text: "跟客户协商要求换货" },
        { id: 4, text: "其他原因" }
      ],
      active: false,
      index: 0,
      goodsList: JSON.parse(
        this.props.navigation.state.params.orderDetail.goods_json
      )
    };
    this.goodsList = JSON.parse(
      this.props.navigation.state.params.orderDetail.goods_json
    );
  }
  componentWillMount() {
    let data = this.state.goodsList;
    data.map(element => {
      let active = false;
      element.gNum = 0;
      element.active = active;
    });
    this.setState({
      goodsList: data
    });
  }
  title = text => {
    return (
      <View
        style={{
          height: 40,
          justifyContent: "center",
          paddingHorizontal: pxToDp(31),
          backgroundColor: "#f2f2f2"
        }}
      >
        <Text style={Styles.h303e}>{text}</Text>
      </View>
    );
  };
  select = element => {
    // let reson = this.state.refundReason;
    // element.active = !element.active;
    this.setState({
      active: element.id === this.state.index ? false : true,
      index: element.id
    });
  };
  selectRefund = element => {
    let reson = this.state.goodsList;
    element.active = !element.active;

    this.setState({
      goodsList: reson
    });
  };
  getNum = () => {
    let num = 0;
    this.state.goodsList.map(element => {
      if (element.active) {
        num = num + element.gNum;
      }
    });
    return num;
  };
  render() {
    console.log("this.props:%o", this.props.navigation);
    console.log(
      "商品列表:%o:不应该变化的数组",
      this.state.goodsList,
      this.goodsList
    );
    console.disableYellowBox = true;
    return (
      <View
        style={{
          paddingVertical: 9,
          backgroundColor: "#FFF",
          flex: 1
        }}
      >
        <ScrollView>
          <View style={{ paddingHorizontal: pxToDp(31) }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={Styles.h32bf}>0000</Text>
              <Button fontStyle={Styles.h22theme} mgl={30 * one} />
            </View>
            <Line mgt={15} />
            {/*订单号*/}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 15
              }}
            >
              <Text style={Styles.h22a2}>订单号：589634</Text>
              <Text style={Styles.h22a2}>
                期望送达：{this.state.orderDetail.expectTimeStr}
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
                {this.state.orderDetail.pl_name}：589634
              </Text>
              <Text style={Styles.h22a2}>
                下单时间：{this.state.orderDetail.orderTime}
              </Text>
            </View>
            {/*下单提示*/}
            <Text style={[Styles.h18theme, { marginVertical: 15 }]}>
              提示：提单已完成并且已过完成当天，将从结算记录中扣除相应费用
            </Text>
          </View>
          {this.title("商品明细")}
          {/*商品明细列表*/}
          <View style={{ paddingHorizontal: pxToDp(31) }}>
            {this.state.goodsList.map((element, index) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    this.selectRefund(element);
                  }}
                >
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
                      <Yuan
                        icon={"md-checkmark"}
                        size={10}
                        ic={Colors.white}
                        w={18}
                        bw={Metrics.one}
                        bgc={element.active ? Colors.theme : Colors.white}
                        bc={element.active ? Colors.theme : Colors.greyc}
                        mgr={20}
                        onPress={() => {
                          this.selectRefund(element);
                        }}
                      />
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderWidth: 1,
                          marginRight: 20,
                          borderColor: "#ccc"
                        }}
                      />
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
                          <Text style={[Styles.h223e, { flex: 1 }]}>
                            {element.gPrice}
                          </Text>
                          <Text style={[Styles.h16c4, { flex: 1 }]}>
                            总价 {element.gPrice * this.goodsList[index].gNum}
                          </Text>
                          <Text style={[Styles.h16c4, { flex: 1 }]}>
                            *{this.goodsList[index].gNum}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Yuan
                        icon={"md-remove"}
                        size={10}
                        ic={element.gNum <= 0 ? Colors.greyc : Colors.grey3}
                        w={18}
                        bw={Metrics.one}
                        mgr={5}
                        bgc={Colors.white}
                        bc={Colors.greyc}
                        onPress={() => {
                          if (element.gNum <= 0) return;

                          element.gNum = element.gNum - 1;
                          element.active = true;
                          let data = this.state.goodsList;
                          console.log("element:%o", element.gNum);
                          this.setState({
                            goodsList: data
                          });
                        }}
                      />
                      <Text>{element.gNum}</Text>
                      <Yuan
                        icon={"md-add"}
                        size={10}
                        ic={
                          element.gNum >= this.goodsList[index].gNum
                            ? Colors.greyc
                            : Colors.grey3
                        }
                        w={18}
                        onPress={() => {
                          console.log(
                            "元吃的:%o,现在的:%o",
                            this.goodsList[index].gNum,
                            element.gNum
                          );
                          if (element.gNum >= this.goodsList[index].gNum)
                            return;
                          element.gNum = element.gNum + 1;
                          element.active = true;
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
                </TouchableOpacity>
              );
            })}
          </View>
          <Line h={1.2} />
          <View style={{ paddingVertical: 10, paddingHorizontal: pxToDp(31) }}>
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
          {this.title("退款理由")}
          {this.state.refundReason.map(element => {
            return (
              <TouchableOpacity
                onPress={() => {
                  this.select(element);
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
                      this.select(element);
                    }}
                    bw={Metrics.one}
                    bgc={
                      this.state.index === element.id && this.state.active
                        ? Colors.theme
                        : Colors.white
                    }
                    bc={
                      this.state.index === element.id && this.state.active
                        ? Colors.theme
                        : Colors.greyc
                    }
                  />
                  <Text style={[Styles.h203e, { marginLeft: 20 }]}>
                    {element.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {/*用户自己输入的退款原因*/}
          <View style={{ paddingHorizontal: pxToDp(31), marginTop: 15 }}>
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
              // onChangeText={(text) => {
              // 	this.setState({
              // 		introduceValue: text
              // 	})
              // }}
            />
          </View>
        </ScrollView>
        {/*退款按钮*/}
        <View style={{ paddingHorizontal: pxToDp(31) }}>
          <Button1 t="确认退款" w="100%" />
        </View>
      </View>
    );
  }
}
