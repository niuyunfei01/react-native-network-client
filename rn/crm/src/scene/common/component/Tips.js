import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import React, {Component} from "react";
import PropTypes from "prop-types";
import pxToDp from "../../../pubilc/util/pxToDp";
import Config from "../../../pubilc/common/config";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import JbbModal from "../../../pubilc/component/JbbModal";
import Entypo from "react-native-vector-icons/Entypo";
import {Button} from "react-native-elements";


class Tips extends Component {
  static propTypes = {
    onItemClick: PropTypes.func,
  }
  state = {
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
        if (res && res.count >= 0) {
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }

  render() {
    return (

      <View>
        <JbbModal visible={this.state.modalTip} onClose={() => this.props.onItemClick()} modal_type={'bottom'}
                  modalStyle={{padding: 0}}
        >
          <View style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center"
          }}>
            <TouchableOpacity
              style={{width: '15%'}}
              onPress={() => this.props.onItemClick()}>
            </TouchableOpacity>

            <Text style={[{
              textAlign: 'center',
              color: colors.title_color,
              fontWeight: "bold",
              flex: 1,
              fontSize: 14
            }]}>长时间没有骑手接单怎么办 </Text>
            <TouchableOpacity
              style={[{
                flexDirection: "row",
                justifyContent: "flex-end",
                width: '15%'
              }]}
              onPress={() => this.props.onItemClick()}>
              <Entypo name="circle-with-cross"
                      style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
            </TouchableOpacity>
          </View>
          <View style={styles.cell_body}>
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

            <View style={styles.Item}>
              <View style={styles.circle}></View>
              <Text style={styles.txt}>您开通的配送较少、 </Text>
            </View>

            <View style={styles.Item}>
              <View style={styles.circle}></View>
              <Text style={styles.txt}>请开通美团飞速达；顺丰（不需审核。立即开通) </Text>
            </View>
            <View style={styles.Item}>
              <View style={styles.circle}></View>
              <Text style={styles.txt}>我自己送 </Text>
            </View>
          </View>
          {this.renderBtn()}
        </JbbModal>
      </View>

    )
  }

  renderBtn() {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'追加配送'}
                onPress={() => {
                  this.onCallThirdShips()
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell_body: {
    margin: 22,
  },
  Item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9
  },
  txt: {
    fontSize: 12,
    color: colors.color333,
    marginLeft: 9,
  },
  circle: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.color999,
  },
})
export default Tips;
