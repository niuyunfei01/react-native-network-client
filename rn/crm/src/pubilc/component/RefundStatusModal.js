import React from 'react'
import PropTypes from 'prop-types'
import {ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native'
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {Button} from "react-native-elements";
import tool from "../util/tool";
import HttpUtils from "../util/http";
import {cross_icon} from "../../svg/svg";
import {SvgXml} from "react-native-svg";
import AgreeRefundModal from "./AgreeRefundModal";

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

class RefundStatusModal extends React.Component {
  static propTypes = {
    order_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    store_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    accessToken: PropTypes.string,
    order_status: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    show_modal: PropTypes.bool,
    onClose: PropTypes.func,
    onPress: PropTypes.func,
    fetchData: PropTypes.func,
    openAddTipModal: PropTypes.func,
    openCancelDeliveryModal: PropTypes.func,
    openFinishDeliveryModal: PropTypes.func,
  }
  state = {
    show_modal: false,
    is_loading: false,
    order_platform_desc: '',
    btn_list: {},
    delivery_list: []
  }

  constructor(props) {
    super(props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {accessToken, order_id, show_modal, order_status} = nextProps;
    if (tool.length(order_id) <= 0 || Number(order_id) <= 0 || !show_modal || this.state.show_modal) {
      return null;
    }
    this.state.show_modal = true
    this.getInfo(accessToken, order_id, order_status)

  }

  getInfo = (accessToken, order_id, order_status) => {
    const url = '/v4/wsb_delivery/deliveryRecord'
    this.setState({
      is_loading: true
    })
    const params = {access_token: accessToken, order_id: order_id, order_status: order_status}
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      this.setState({
        is_loading: false,
        delivery_list: res?.do_list,
        btn_list: res?.btn_list,
      })
    }, () => {
      this.closeModal()
    }).catch(() => {
      this.closeModal()
    })
  }

  closeModal = () => {
    this.setState({
      show_modal: false,
      is_loading: false,
      delivery_list: [],
      btn_list: {},
    }, () => {
      this.props.onClose();
    })
  }

  downDeliveryInfo = (i) => {
    let delivery_list = [...this.state.delivery_list]
    delivery_list[i].default_show = !delivery_list[i].default_show
    this.setState({delivery_list: delivery_list})
  }

  render = () => {
    let {show_modal, delivery_list, is_loading} = this.state;
    if (!show_modal) {
      return null;
    }
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={this.closeModal}
             maskClosable transparent={true}
             animationType="slide"
             visible={show_modal}>
        <View style={[{
          backgroundColor: 'rgba(0,0,0,0.25)',
          flex: 1
        }]}>
          <TouchableOpacity onPress={this.closeModal} style={{flexGrow: 1}}/>
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
                  <SvgXml onPress={this.closeModal} xml={cross_icon()}/>
                </View>
                <ScrollView automaticallyAdjustContentInsets={false}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            style={{maxHeight: 350}}>
                  <For index='index' each='info' of={delivery_list}>
                    <TouchableOpacity style={styles.logItem} key={index} onPress={() => this.downDeliveryInfo(index)}>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: colors.color333,
                      }}>{info?.platform_desc} </Text>
                      <Entypo name={info?.default_show ? 'chevron-thin-up' : 'chevron-thin-down'}
                              style={styles.IconShow}/>
                    </TouchableOpacity>
                    <If condition={info?.default_show}>
                      {this.renderDeliveryStatus(info)}
                      <View style={{height: 15}}/>
                    </If>
                  </For>
                </ScrollView>
                {this.renderButton()}
              </View>
            </If>
          </View>
        </View>
      </Modal>
    )
  }


  renderDeliveryStatus = (info) => {
    if (tool.length(info?.log_list) <= 0) {
      return null;
    }
    return (
      <For each="log" index="index" of={info?.log_list}>
        <View style={styles.logBox} key={index}>
          <View style={{flexDirection: "row", marginBottom: 10}}>
            <View style={styles.flexC}>
              <View style={[styles.circle, {backgroundColor: log?.icon_color}]}/>
              <If condition={index !== (tool.length(info?.log_list) - 1) || info?.do_btn_list?.add_tip}>
                <View style={styles.line}/>
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
                    log?.icon_color === '#26B942' ? {color: colors.main_color} : {}]}>{log?.log_state_desc} </Text>
                <Text style={{fontSize: 12, color: colors.color666, lineHeight: 17}}>{log?.log_call_time} </Text>
              </View>

              <If condition={tool.length(log?.log_desc) > 0}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 4}}>
                  <Text style={styles.desc}>理由： </Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: colors.color666,
                    flex: 1
                  }}>{log?.log_desc}</Text>
                </View>
              </If>

              <If condition={tool.length(log?.log_desc) > 0}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 4}}>
                  <Text style={styles.desc}>金额： </Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: colors.color666,
                    flex: 1
                  }}>{log?.log_desc}</Text>
                </View>
              </If>

              <If condition={tool.length(log?.log_desc) > 0}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4}}>
                  <Text style={styles.desc}>商品： </Text>
                  <View style={{flex: 1}}>
                    <For each='goods' index='key' of={[1, 2, 3]}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.color666,
                            flex: 1
                          }}>{tool.jbbsubstr('五花肉芒果榴莲蛋糕毛毛最爱…', 12)} </Text>
                        <Text style={{fontSize: 12, color: colors.color666, width: 60, textAlign: 'center'}}> X1 </Text>
                        <Text
                          style={{fontSize: 12, color: colors.color666, width: 60, textAlign: 'right'}}> ¥1.35 </Text>
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
    let {btn_list} = this.state;
    let {order_id} = this.props;
    let obj_num = 0
    tool.objectMap(btn_list, (item, idx) => {
      obj_num += Number(item)
    })
    let btn_width = 0.83 / Number(obj_num)
    return (
      <View
        style={{
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <If condition={!btn_list?.agree}>
          <Button title={'拒绝'}
                  onPress={() => {
                    this.setState({
                      show_modal: false,
                      delivery_list: [],
                      order_platform_desc: '',
                      platform_dayId: '',
                      expect_time_desc: '',
                      driver_phone: '',
                    }, () => {
                      this.props.openCancelDeliveryModal(order_id)
                    })
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.white,
                    borderColor: colors.colorCCC,
                    borderWidth: 0.5,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.color666, fontSize: 16}}
          />
        </If>

        <If condition={!btn_list?.agree}>
          <Button title={'同意'}
                  onPress={() => {
                    AgreeRefundModal.getInfo(order_id, this.props.accessToken, this.props.fetchData)
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>
      </View>
    )
  }
}

export default RefundStatusModal
