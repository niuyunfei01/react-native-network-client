import React from 'react'
import {ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native'
import colors from "../styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {Button} from "react-native-elements";
import tool from "../util/tool";
import HttpUtils from "../util/http";
import {cross_icon} from "../../svg/svg";
import {SvgXml} from "react-native-svg";
import AgreeRefundModal from "./AgreeRefundModal";
import {ToastShort} from "../util/ToastUtils";
import RefundReasonModal from "./RefundReasonModal";
import Entypo from "react-native-vector-icons/Entypo";

let _this = null;
const {width, height} = Dimensions.get("window")
const styles = StyleSheet.create({
  QrTitle: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  flexC: {
    flexDirection: "column",
  },
  flexR: {
    flexDirection: "row",
    alignContent: "center"
  },
  IconShow: {
    fontSize: 14,
    color: colors.color666
  },
  f16: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.color333
  },
  logItem: {
    backgroundColor: colors.f9,
    borderRadius: 4,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 10
  },
  logBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circle: {
    backgroundColor: colors.color999,
    width: 11,
    height: 11,
    borderRadius: 11,
    position: "relative",
    top: 3,
    left: 0
  },
  line: {
    width: 1,
    height: 105,
    // borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.colorDDD,
    position: "relative",
    top: 8,
    left: 5
  },
  desc: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color666,
  },
  modalBtn: {
    borderRadius: 20,
    height: 40,
    marginHorizontal: 3,
  }
})

class RefundStatusModal extends React.PureComponent {

  constructor(props) {
    super(props);
    _this = this;
    this.state = {
      show: false,
      is_loading: false,
      order_id: 0,
      store_id: 0,
      access_token: '',
      fetchData: undefined,
      refund_btn: 0,
      refund_list: []
    };
  }

  static  getData = (order_id = 0, store_id = 0, access_token = '', fetchData = undefined) => {
    _this.setState({
      is_loading: true,
      order_id,
      store_id,
      fetchData,
      access_token,
      btn_list: {},
      refund_list: []
    })
    const url = '/v4/wsb_refund/refund_info'
    const params = {access_token, order_id: order_id, store_id: store_id}
    HttpUtils.get.bind(_this.props)(url, params).then(res => {
      _this.setState({
        show: true,
        is_loading: false,
        refund_list: res?.list,
        refund_btn: res?.refund_btn,
      })
    }, (res) => {
      ToastShort(res?.reason)
      _this.onClose()
    }).catch((res) => {
      ToastShort(res?.reason)
      _this.onClose()
    })
  }

  onClose = () => {
    _this.setState({show: false})
  }

  downDeliveryInfo = (i) => {
    let refund_list = [...this.state.refund_list]
    refund_list[i].default_show = !refund_list[i].default_show
    this.setState({refund_list: refund_list})
  }

  render = () => {
    let {show, refund_list, refund_btn, is_loading} = this.state;

    if (!show) {
      return null;
    }
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={this.onClose}
             maskClosable transparent={true}
             animationType="slide"
             visible={show}>
        <View style={[{
          backgroundColor: 'rgba(0,0,0,0.25)',
          flex: 1
        }]}>
          <TouchableOpacity onPress={this.onClose} style={{flexGrow: 1}}/>
          <View style={[{
            backgroundColor: colors.white,
            maxHeight: height * 0.8,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            padding: 20,
          }]}>
            <If condition={is_loading}>
              <View style={{
                height: 200,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ActivityIndicator color={colors.color666} size={60}/>
              </View>
            </If>
            <If condition={!is_loading}>
              <View style={styles.flexC}>
                <View style={styles.QrTitle}>
                  <View style={styles.flexC}>
                    <Text style={styles.f16}>退款跟踪 </Text>
                  </View>
                  <SvgXml onPress={this.onClose} xml={cross_icon()}/>
                </View>
                <ScrollView automaticallyAdjustContentInsets={false}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            style={{maxHeight: 350}}>
                  <If condition={tool.length(refund_list) > 0}>
                    <For index='index' each='info' of={refund_list}>
                      <View key={index}>
                        <TouchableOpacity style={styles.logItem} onPress={() => this.downDeliveryInfo(index)}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: colors.color333,
                          }}>{info?.refund_title} </Text>
                          <Entypo name={info?.default_show ? 'chevron-thin-up' : 'chevron-thin-down'}
                                  style={styles.IconShow}/>
                        </TouchableOpacity>
                        <If condition={info?.default_show}>
                          {this.renderDeliveryStatus(info)}
                          <View style={{height: 15}}/>
                        </If>
                      </View>
                    </For>
                  </If>
                </ScrollView>
                {Number(refund_btn) === 1 ? this.renderButton() : null}
              </View>
            </If>
          </View>
        </View>
      </Modal>
    )
  }


  renderDeliveryStatus = (info) => {
    if (tool.length(info?.refund_list) <= 0) {
      return null;
    }
    return (
      <For each="log" index="index" of={info?.refund_list}>
        <View style={styles.logBox} key={index}>
          <View style={{flexDirection: "row", marginBottom: 10}}>
            <View style={styles.flexC}>
              <View style={[styles.circle, {backgroundColor: log?.icon_color}]}/>
              <If
                condition={tool.length(info?.refund_list) === 1 || index !== (tool.length(info?.refund_list) - 1)}>
                <View style={{
                  width: 1,
                  height: 60 + (tool.length(log?.goods_list) * 22),
                  // borderStyle: 'dashed',
                  borderWidth: 1,
                  borderColor: colors.colorDDD,
                  position: "relative",
                  top: 8,
                  left: 5
                }}/>
              </If>
            </View>
            <View style={[styles.flexC, {marginLeft: 10, width: width * 0.82}]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text
                  style={[{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: colors.color333,
                  },
                    log?.icon_color === '#26B942' ? {color: colors.main_color} : {}]}>{log?.title} </Text>
                <Text style={{fontSize: 12, color: colors.color666, lineHeight: 17}}>{log?.title_time} </Text>
              </View>

              <If condition={tool.length(log?.reason) > 0}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 4}}>
                  <Text style={styles.desc}>理由： </Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: colors.color666,
                    flex: 1
                  }}>{log?.reason}</Text>
                </View>
              </If>

              <If condition={tool.length(log?.price) > 0}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 4}}>
                  <Text style={styles.desc}>金额： </Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: colors.color666,
                    flex: 1
                  }}>{log?.price}</Text>
                </View>
              </If>

              <If condition={tool.length(log?.good_list) > 0}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4}}>
                  <Text style={styles.desc}>商品： </Text>
                  <View style={{flex: 1}}>
                    <For each='goods' index='key' of={log?.good_list}>
                      <View key={key} style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.color666,
                            flex: 1
                          }}>{tool.jbbsubstr(goods?.name, 12)} </Text>
                        <Text style={{
                          fontSize: 12,
                          color: goods?.count > 1 ? '#FF8309' : colors.color666,
                          width: 60,
                          textAlign: 'center'
                        }}> X{goods?.count} </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.color666,
                            width: 60,
                            textAlign: 'right'
                          }}> ¥{goods?.price} </Text>
                      </View>
                    </For>
                  </View>
                </View>
              </If>
            </View>

          </View>
        </View>
      </For>
    )
  }

  renderButton = () => {
    let {order_id, store_id, access_token, fetchData} = this.state;
    let obj_num = 2
    let btn_width = 0.83 / Number(obj_num)
    return (
      <View
        style={{
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Button title={'拒绝'}
                onPress={() => {
                  this.onClose()
                  RefundReasonModal.fetchRefundReasonList(store_id, order_id, access_token, fetchData)
                }}
                buttonStyle={[styles.modalBtn, {
                  backgroundColor: colors.white,
                  borderColor: colors.colorCCC,
                  borderWidth: 0.5,
                  width: width * btn_width,
                }]}
                titleStyle={{color: colors.color666, fontSize: 16}}
        />

        <Button title={'同意'}
                onPress={() => {
                  this.onClose()
                  AgreeRefundModal.getInfo(store_id, order_id, access_token, fetchData)
                }}
                buttonStyle={[styles.modalBtn, {
                  backgroundColor: colors.main_color,
                  width: width * btn_width,
                }]}
                titleStyle={{color: colors.white, fontSize: 16}}
        />
      </View>
    )
  }
}

export default RefundStatusModal
