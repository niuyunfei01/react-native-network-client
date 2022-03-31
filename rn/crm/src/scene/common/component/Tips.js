import ReactNative from "react-native";
import colors from "../../../pubilc/styles/colors";
import React, {Component} from "react";
import PropTypes from "prop-types";
import pxToDp from "../../../util/pxToDp";
import Config from "../../../pubilc/common/config";
import {ToastShort} from "../../../pubilc/util/ToastUtils";


const {
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
  Alert,

} = ReactNative;


class Tips extends Component {
  static propTypes = {
    onItemClick: PropTypes.func,
  }
  state = {
    addTipDialog: true,
    addTipMoney: true,
    modalTip: this.props.modalTip,
    storeId: "",
    orderId: ""

  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      modalTip: nextProps.modalTip,
      storeId: nextProps.storeId ? nextProps.storeId : this.state.storeId,
      orderId: nextProps.orderId ? nextProps.orderId : this.state.orderId
    });

  }


  onCallThirdShips() {

    this.props.onItemClick();

    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: this.props.orderId,
      storeId: this.props.storeId,
      selectedWay: [],
      onBack: (res) => {
        if (res && res.count > 0) {
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }

  onCallSelf() {
    const self = this;
    Alert.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定自己配送吗？', [
      {
        text: '确定',
        onPress: () => self.onTransferSelf(),
      }, {
        text: '取消'
      }
    ])
  }

  onTransferSelf() {
    const self = this;
    const api = `/api/order_transfer_self?access_token=${this.state.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api, {
      orderId: this.props.order.id
    }).then(res => {
      Toast.success('操作成功');
      self.props.fetchData()
    }).catch(e => {
      self.props.fetchData()
    })
  }

  render() {
    return (

        <View>
          <Modal visible={this.state.modalTip} onRequestClose={() => this.setState({modalTip: false})}
                 transparent={true} animationType="slide">
            <TouchableOpacity style={{backgroundColor: 'rgba(0,0,0,0.25)', flex: 1, minHeight: pxToDp(200)}}
                              onPress={() => {
                                this.props.onItemClick();
                                this.setState({modalTip: false})
                              }}>
            </TouchableOpacity>
            <View style={styles.cell_row}>
              <View style={styles.cell_body}>
                <Text>长时间没有骑手接单怎么办? </Text>
                <View style={styles.Item}>
                  <View style={styles.circle}></View>
                  <Text style={styles.txt}>追加同等价位的配送（蜂鸟众包；闪送）</Text>
                </View>
                <View style={styles.Item}>
                  <View style={styles.circle}></View>
                  <Text style={styles.txt}>使用接单率高的配送方式（美团快速达）</Text>
                </View>
                <View style={styles.Item}>
                  <View style={styles.circle}></View>
                  <Text style={styles.txt}>加小费 </Text>
                </View>
                <View style={styles.Item2}>
                  <View style={styles.circle}></View>
                  <Text style={styles.txt2}>您开通的配送较少
                    请开通美团飞速达；顺丰（不需审核。立即开通) </Text>
                </View>
                <View style={styles.Item}>
                  <View style={styles.circle}></View>
                  <Text style={styles.txt}>我自己送 </Text>
                </View>

                <View style={styles.footBtn}>

                  <TouchableOpacity
                      onPress={() => {
                        this.onCallThirdShips()
                        this.setState({modalTip: false})
                      }}
                  >
                    <Text style={styles.btn1}>追加配送 </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
            <TouchableOpacity style={{backgroundColor: 'rgba(0,0,0,0.25)', flex: 1, minHeight: pxToDp(200)}}
                              onPress={() => this.setState({modalTip: false})}>
            </TouchableOpacity>
          </Modal>
        </View>

    )
  }
}

const styles = StyleSheet.create({
  cell_row: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cell_body: {
    margin: pxToDp(40),
    padding: pxToDp(20),
    borderRadius: pxToDp(8),
    backgroundColor: 'white'

  },
  footBtn: {
    marginTop: pxToDp(20),
    width: '100%',
    height: pxToDp(80),

    borderTopWidth: pxToDp(1),
    borderTopColor: '#999999',
    position: "relative",

  },

  btn1: {
    lineHeight: pxToDp(80),
    width: '100%',
    textAlign: 'center',
    color: colors.main_color,

  },
  Item: {
    position: "relative",
  },
  txt: {
    marginLeft: pxToDp(40),
    lineHeight: pxToDp(80)

  },
  txt2: {
    marginLeft: pxToDp(40),

  },
  circle: {
    position: "absolute",
    top: pxToDp(26),
    width: pxToDp(26),
    height: pxToDp(26),
    borderRadius: pxToDp(50),
    backgroundColor: 'black',


  },
  right_btn: {
    position: "absolute",
    top: pxToDp(20),
    right: pxToDp(-100),

    fontSize: pxToDp(50),
    textAlign: 'center',
    width: pxToDp(90),
    height: pxToDp(70),
    color: colors.color999,

  },
  right_btn2: {
    position: "absolute",
    top: pxToDp(40),
    right: pxToDp(-100),

    fontSize: pxToDp(50),
    textAlign: 'center',
    width: pxToDp(90),
    height: pxToDp(70),
    color: colors.color999,

  },
  cell_title: {
    marginLeft: pxToDp(40)
  }
})
export default Tips;
