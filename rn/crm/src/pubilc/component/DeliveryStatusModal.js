import React from 'react'
import PropTypes from 'prop-types'
import {ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native'
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {Button} from "react-native-elements";
import tool from "../util/tool";
import {ToastLong, ToastShort} from "../util/ToastUtils";
import HttpUtils from "../util/http";
import Config from "../common/config";
import Clipboard from "@react-native-community/clipboard";
import native from "../util/native";
import {MixpanelInstance} from "../util/analytics";
import {cross_icon} from "../../svg/svg";
import {SvgXml} from "react-native-svg";

const {width, height} = Dimensions.get("window")
const styles = StyleSheet.create({
  copyText: {
    fontSize: 12,
    color: colors.main_color,
  },
  QrTitle: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  QrClose: {
    backgroundColor: "#fff",
    fontSize: 28,
    color: colors.fontGray
  },
  flexC: {
    flexDirection: "column",
  },
  flexR: {
    flexDirection: "row",
    alignContent: "center"
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
    fontWeight: 'bold',
    color: colors.color333
  },
  f14: {
    fontSize: 14,
    color: colors.color666
  },
  platform: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.color333,
  },
  expectTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF8309'
  },
  logItem: {
    backgroundColor: colors.f9,
    borderRadius: 4,
    height: 65,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 10
  },
  orderNum: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF8309'
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
    marginTop: 4
  },
  deliveryStatusBtnWhite: {
    height: 42,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.colorCCC
  },
  deliveryStatusBtnWhiteTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.color666
  },
  deliveryStatusBtnGreen: {
    height: 42,
    borderRadius: 20,
    backgroundColor: colors.main_color
  },
  deliveryStatusBtnGreenTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.white
  },
  modalBtn: {
    borderRadius: 20,
    height: 40,
    marginHorizontal: 3,
  }
})

class deliveryStatusModal extends React.Component {
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
    platform_dayId: '',
    expect_time_desc: '',
    driver_phone: '',
    complaint_rider_delivery_id: 0,
    btn_list: {},
    delivery_list: []
  }

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track('配送调度页')
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
        order_platform_desc: res?.order_platform_desc,
        platform_dayId: res?.platform_dayId,
        expect_time_desc: res?.expect_time_desc,
        btn_list: res?.btn_list,
        driver_phone: res?.driver_phone,
        complaint_rider_delivery_id: res?.complaint_rider_delivery_id,
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
      order_platform_desc: '',
      platform_dayId: '',
      expect_time_desc: '',
      driver_phone: '',
    }, () => {
      this.props.onClose();
    })
  }

  downDeliveryInfo = (i) => {
    let delivery_list = [...this.state.delivery_list]
    delivery_list[i].default_show = !delivery_list[i].default_show
    this.setState({delivery_list: delivery_list})
  }

  right_btn = (str, info) => {
    let {order_id} = this.props;
    if (str === '拨打') {
      native.dialNumber(info?.driver_phone)
    } else if (str === '骑手位置') {
      this.closeModal()
      this.props.onPress(Config.RIDER_TRSJECTORY, {delivery_id: info?.id, order_id: order_id})
    } else {
      Clipboard.setString(info?.delivery_id)
      ToastLong('已复制到剪切板', 0)
    }
  }

  onCallThirdShips = () => {
    let {order_id, store_id, onPress} = this.props;
    this.closeModal();
    onPress(Config.ROUTE_ORDER_CALL_DELIVERY, {
      order_id: order_id,
      store_id: store_id,
      onBack: (res) => {
        if (res && res?.count >= 0) {
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }

  dialNumber = () => {
    native.dialNumber(this.state.driver_phone)
  }

  complain = () => {
    this.closeModal()
    this.props.onPress(Config.ROUTE_COMPLAIN, {id: this.state.complaint_rider_delivery_id})
  }

  render = () => {
    let {show_modal, delivery_list, expect_time_desc, platform_dayId, order_platform_desc, is_loading} = this.state;
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
                    <View style={styles.flexR}>
                      <Text style={styles.f16}>{order_platform_desc} </Text>
                      <Text style={styles.f14}>#{platform_dayId} </Text>
                    </View>
                    <View style={[styles.flexR, {marginTop: 5}]}>
                      <Text style={styles.expectTime}>{expect_time_desc} </Text>
                    </View>
                  </View>
                  <SvgXml onPress={this.closeModal} xml={cross_icon()}/>
                </View>
                <ScrollView automaticallyAdjustContentInsets={false}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            style={{maxHeight: 350}}>
                  <For index='index' each='info' of={delivery_list}>
                    <TouchableOpacity style={styles.logItem} key={index} onPress={() => this.downDeliveryInfo(index)}>
                      <View style={styles.flexC}>
                        <View style={styles.flexR}>
                          <Text style={[styles.platform, {marginRight: 10}]}>{info?.platform_desc} </Text>
                          <Text style={styles.f14}>第<Text style={styles.orderNum}> {info?.call_rank} </Text>次下单 </Text>
                        </View>
                        <View style={[styles.flexR, {marginTop: 10}]}>
                          <Text style={[styles.f12, {marginRight: 4}]}>状态： </Text>
                          <Text style={[styles.f12, {marginRight: 6}]}>{info?.call_status} </Text>
                          <Text style={[styles.f12, {marginRight: 6}]}>{info?.call_time} </Text>
                          <Text style={[styles.f12, {marginRight: 6}]}>{info?.fee}元 </Text>
                          <If condition={info?.tip > 0}>
                            <Text style={styles.f12}>小费：{info?.tip}元 </Text>
                          </If>
                        </View>
                      </View>
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
          <View style={{flexDirection: "row"}}>
            <View style={styles.flexC}>
              <View style={[styles.circle, {backgroundColor: log?.icon_color}]}/>
              <If condition={index !== (tool.length(info?.log_list) - 1) || info?.do_btn_list?.add_tip}>
                <View style={styles.line}/>
              </If>
            </View>
            <View style={[styles.flexC, {marginLeft: 10}]}>
              <Text
                style={[styles.platform, log?.icon_color === '#26B942' ? {color: colors.main_color} : {}]}>{log?.log_state_desc} </Text>
              <View style={styles.descInfo}>
                <If condition={tool.length(log?.log_desc) > 0}>
                  <Text style={styles.desc}>{tool.jbbsubstr(log?.log_desc, 24)} </Text>
                </If>
                <If condition={tool.length(log?.log_right_btn) > 0}>
                  <Text onPress={() => {
                    this.right_btn(log?.log_right_btn, info);
                  }} style={styles.copyText}>{log?.log_right_btn} </Text>
                </If>
              </View>
              <Text style={[styles.platform, {marginTop: 4}]}>{log?.log_call_time} </Text>
              <If condition={index === (tool.length(info?.log_list) - 1) && info?.do_btn_list?.add_tip}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>
                  <Button title={'加小费'}
                          onPress={() => {
                            this.mixpanel.track('V4配送调度页_加小费')
                            this.setState({
                              show_modal: false,
                              delivery_list: [],
                              order_platform_desc: '',
                              platform_dayId: '',
                              expect_time_desc: '',
                              driver_phone: '',
                            }, () => {
                              this.props.openAddTipModal(info?.id, false)
                            })
                          }}
                          buttonStyle={{
                            borderRadius: 20,
                            height: 32,
                            width: 80,
                            backgroundColor: colors.white,
                            borderColor: colors.colorCCC,
                            borderWidth: 0.5,
                          }}
                          titleStyle={{color: colors.color666, fontSize: 14}}
                  />
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
    let {openAddTipModal, order_id} = this.props;
    let obj_num = 0
    tool.objectMap(btn_list, (item, idx) => {
      if (idx !== 'add_tip') {
        obj_num += Number(item)
      }
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
        <If condition={btn_list?.btn_cancel_delivery}>
          <Button title={'取消配送'}
                  onPress={() => {
                    this.mixpanel.track('V4配送调度页_取消配送')
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

        <If condition={btn_list?.btn_contact_rider}>
          <Button title={'联系骑手'}
                  onPress={() => {

                    this.mixpanel.track('V4配送调度页_联系骑手')
                    this.dialNumber()
                  }}

                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>


        <If condition={btn_list?.btn_call_third_delivery}>
          <Button title={'下配送单'}
                  onPress={() => {

                    this.mixpanel.track('V4配送调度页_下配送单')
                    this.onCallThirdShips()
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>

        <If condition={btn_list?.batch_add_tip}>
          <Button title={'一键加小费'}
                  onPress={() => {

                    this.mixpanel.track('V4配送调度页_加小费')
                    this.setState({show_modal: false}, () => {
                      openAddTipModal && openAddTipModal(order_id)
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


        <If condition={btn_list?.btn_append_call_third_delivery}>
          <Button title={'追加配送'}
                  onPress={() => {
                    this.mixpanel.track('V4配送调度页_追加配送')
                    this.onCallThirdShips()
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>

        <If condition={btn_list?.complaint_rider}>
          <Button title={'投诉骑手'}
                  onPress={() => {
                    this.mixpanel.track('V4配送调度页_投诉骑手')
                    this.complain()
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>

        <If condition={btn_list?.btn_confirm_arrived}>
          <Button title={'完成配送'}
                  onPress={() => {
                    this.mixpanel.track('V4配送调度页_完成配送')
                    this.setState({
                      show_modal: false,
                      delivery_list: [],
                      order_platform_desc: '',
                      platform_dayId: '',
                      expect_time_desc: '',
                      driver_phone: '',
                    }, () => {
                      this.props.openFinishDeliveryModal(order_id)
                    })
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

export default deliveryStatusModal
