import React from 'react'
import PropTypes from 'prop-types'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native'
import pxToDp from "../util/pxToDp";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import JbbModal from "./JbbModal";
import native from "../util/native";
import {Button} from "react-native-elements";

const {width} = Dimensions.get("window")
const styles = StyleSheet.create({
  copyText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.main_color
  },
  QrTitle: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  QrClose: {
    backgroundColor: "#fff",
    fontSize: pxToDp(45),
    color: colors.fontGray
  },
  flexC: {
    flexDirection: "column"
  },
  flexR: {
    flexDirection: "row",
    alignItems: "center"
  },
  f12: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color666
  },
  IconShow: {
    fontSize: 14,
    color: colors.color666
  },
  f16: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.color333
  },
  f14: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color666
  },
  platform: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.color333
  },
  expectTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF8309'
  },
  logItem: {
    backgroundColor: colors.f9,
    borderRadius: 4,
    height: 65,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12
  },
  orderNum: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF8309'
  },
  logBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10
  },
  circle: {
    width: 11,
    height: 11,
    borderRadius: 11,
    position: "relative",
    top: 3,
    left: 0
  },
  line: {
    width: 1,
    height: 65,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: colors.colorDDD,
    position: "relative",
    top: 5,
    left: 5
  },
  descInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width * 0.8
  },
  desc: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color666,
    marginVertical: 10
  },
  deliveryStatusBtnWhite: {
    height: 42,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.colorCCC
  },
  deliveryStatusBtnWhiteTitle: {
    fontWeight: '500',
    fontSize: 16,
    color: colors.color666
  },
  deliveryStatusBtnGreen: {
    height: 42,
    borderRadius: 20,
    backgroundColor: colors.main_color
  },
  deliveryStatusBtnGreenTitle: {
    fontWeight: '500',
    fontSize: 16,
    color: colors.white
  }
})

class deliveryStatusModal extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    pl_name: PropTypes.string,
    platform_dayId: PropTypes.string,
    expectTimeStr: PropTypes.string,
    visible: PropTypes.bool,
    delivery_list: PropTypes.array,
    onClose: PropTypes.func
  }
  static defaultProps = {
    visible: true,
    delivery_list: []
  }

  downDeliveryInfo = (i) => {
    let delivery_list = [...this.props.delivery_list]
    delivery_list[i].default_show = !delivery_list[i].default_show
    this.setState({delivery_list: delivery_list})
  }

  dialNumber = (val) => {
    native.dialNumber(val)
  }

  renderDelivery = () => {
    let {delivery_list, pl_name, platform_dayId, expectTimeStr} = this.props
    return (
      <View style={styles.flexC}>
        <View style={styles.QrTitle}>
          <View style={styles.flexC}>
            <View style={styles.flexR}>
              <Text style={styles.f16}>{pl_name} </Text>
              <Text style={styles.f14}>#{platform_dayId} </Text>
            </View>
            <View style={[styles.flexR, {marginTop: pxToDp(10)}]}>
              <Text style={styles.f12}>预计送达时间 </Text>
              <Text style={styles.expectTime}>#{expectTimeStr} </Text>
            </View>
          </View>
          <Entypo onPress={this.props.onClose} name="cross" style={styles.QrClose}/>
        </View>
        <For index='index' each='info' of={delivery_list}>
          <ScrollView style={{}}>
            <TouchableOpacity style={styles.logItem} key={index} onPress={() => this.downDeliveryInfo(index)}>
              <View style={styles.flexC}>
                <View style={styles.flexR}>
                  <Text style={[styles.platform, {marginRight: 10}]}>美团跑腿 </Text>
                  <Text style={styles.f14}>第<Text style={styles.orderNum}>1 </Text>次下单 </Text>
                </View>
                <View style={[styles.flexR, {marginTop: 10}]}>
                  <Text style={[styles.f12, {marginRight: 10}]}>状态： </Text>
                  <Text style={[styles.f12, {marginRight: 10}]}>下单成功 </Text>
                  <Text style={[styles.f12, {marginRight: 10}]}>12:23 </Text>
                  <Text style={styles.f12}>8.2元 </Text>
                </View>
              </View>
              {info?.default_show ?
                <Entypo name='chevron-thin-up' style={styles.IconShow}/> :
                <Entypo name='chevron-thin-down' style={styles.IconShow}/>
              }
            </TouchableOpacity>
            <If condition={info?.default_show}>
              {this.renderDeliveryStatus(info?.log_lists)}
            </If>
          </ScrollView>
        </For>
        {this.renderBottomBtn()}
      </View>
    )
  }

  renderDeliveryStatus = (list) => {
    return (
      <For each="log" index="index" of={list}>
        <View style={styles.logBox} key={index}>
          <View style={{flexDirection: "row"}}>
            <View style={styles.flexC}>
              <View style={[styles.circle, {backgroundColor: log?.status_color}]}/>
              <View style={styles.line}/>
            </View>
            <View style={[styles.flexC, {marginLeft: 10}]}>
              <Text style={styles.platform}>{log?.status_desc} </Text>
              <TouchableOpacity style={styles.descInfo} onPress={() => this.dialNumber(log?.lists[0]?.driver_phone)}>
                <Text style={styles.desc}>{log?.lists[0]?.desc} </Text>
                <If condition={log?.lists[0]?.driver_phone !== ''}>
                  <Text style={styles.copyText}>拨打 </Text>
                </If>
              </TouchableOpacity>
              <Text style={styles.platform}>{log?.lists[0]?.content} </Text>
            </View>
          </View>
        </View>
      </For>
    )
  }

  renderBottomBtn = () => {
    return (
      <View style={styles.logBox}>
        <Button title={'一键加小费'}
                onPress={() => {}}
                buttonStyle={[styles.deliveryStatusBtnWhite, {width: width * 0.4}]}
                titleStyle={styles.deliveryStatusBtnWhiteTitle}
        />
        <Button title={'追加配送'}
                onPress={() => {}}
                buttonStyle={[styles.deliveryStatusBtnGreen, {width: width * 0.4}]}
                titleStyle={styles.deliveryStatusBtnGreenTitle}
        />
      </View>
    )

  }
  render = () => {
    let {visible} = this.props;
    return (
      <JbbModal visible={visible} onClose={this.props.onClose}>
        {this.renderDelivery()}
      </JbbModal>
    )
  }
}

export default deliveryStatusModal
