import React, {Component} from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {Button, CheckBox, Image} from "react-native-elements";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import BottomModal from "../../pubilc/component/BottomModal";
import tool from '../../pubilc/util/tool'
import native from '../../pubilc/util/native'
import colors from "../../pubilc/styles/colors";
import {TextArea} from "../../weui/index";
import * as globalActions from "../../reducers/global/globalActions";
import Clipboard from "@react-native-community/clipboard";
import {showModal, ToastShort} from "../../pubilc/util/ToastUtils";
import HttpUtils from "../../pubilc/util/http";

function mapStateToProps(state) {
  return {
    global: state.global,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

const refused_msgs = [
  {'label': '已和用户沟通一致不退货', 'key': 1},
  {'label': '商品发出时完好', 'key': 2},
  {'label': '商品没问题，买家未举证', 'key': 3},
  {'label': '商品没问题，买家举证无效', 'key': 4},
  {'label': '商品已经影响二次销售', 'key': 5},
  {'label': '申请时间已经超过售后服务时限', 'key': 6},
  {'label': '不支持买家主观原因的退换货', 'key': 7},
  {'label': '其他原因', 'key': -1},
]

const refused_msgss = [
  {'label': '已和用户沟通一致不退款', 'key': 8},
  {'label': '收到货物有破损', 'key': 9},
  {'label': '未收到货物', 'key': 10},
  {'label': '买家末按要求寄出货物', 'key': 11},
  {'label': '其他原因', 'key': -1},
]
const refused_msgsss = [
  {'label': '己和用户电话沟通', 'key': 12},
  {'label': '商品己开始制作', 'key': 13},
  {'label': '商品已经打包完成', 'key': 14},
  {'label': '商品正在配送中', 'key': 15},
  {'label': '商品无质量问题', 'key': 16},
  {'label': '商品没有缺货少货问题', 'key': 17},
  {'label': '商品打包完好', 'key': 18},
  {'label': '其他原因', 'key': -1},
]

class newRefundScene extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
  }

  constructor(props) {
    super(props);
    let {remind, order} = this.props.route.params;
    this.state = {
      order: order,
      remind: remind,
      isRefreshing: false,
      show_good_list: true,
      show_comfirm_refund_modal: false,
      show_comfirm_agree_refund_modals: false,
      show_refused_refund_modal: false,
      show_zs_refused_refund_modal: false,
      refused_code: '',
      refused_msg_content: '',
      delivery_type: 0,
      show_red_tips: false,
      store_name: '',
      dayId: '',
      expectTime: '',
      jd_ship_worker_mobile: '',
      jd_ship_worker_name: '',
      platformIcon: 'https://goods-image.qiniu.cainiaoshicai.cn/platform_icon/mt.png',
      refund_desc: '',
      status_list: [],
      goods_list: [],
      total_refund_price: '',
      refund_reason: '',
      refund_delivery_desc: '',
      refund_delivery_code: '',
      refund_type: 0,
      reject_status: 1,
    };
  }

  fetchData = () => {
    let {order} = this.state;
    const {accessToken} = this.props.global
    const api = `/api/return_refund_detail/${order?.id}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api).then((res) => {
      this.setState({
        refund_desc: res?.refund_desc,
        store_name: res?.order_info?.store_name,
        dayId: res?.order_info?.dayId,
        platformIcon: res?.order_info?.platformIcon,
        expectTime: res?.order_info?.expectTime,
        jd_ship_worker_mobile: res?.order_info?.jd_ship_worker_mobile,
        jd_ship_worker_name: res?.order_info?.jd_ship_worker_name,
        show_red_tips: res?.show_red_tips,
        refund_type: res?.refund_type,
        status_list: res?.status_list,
        reject_status: res?.reject_status,
        goods_list: res?.refund_info?.good_list,
        total_refund_price: res?.refund_info?.total_refund_price,
        refund_reason: res?.refund_info?.reason,
        refund_delivery_desc: res?.logistics_info?.desc,
        refund_delivery_code: res?.logistics_info?.info?.expressNumber,
      })
    }, (e) => {
      ToastShort("操作失败" + e.desc)
      this.props.navigation.goBack()
    })
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  onHeaderRefresh = () => {
    this.fetchData()
  }

  closeModal = () => {
    this.setState({
      show_comfirm_refund_modal: false,
      show_comfirm_agree_refund_modals: false,
      show_refused_refund_modal: false,
      show_zs_refused_refund_modal: false,
    })
  }

  comfirmRefund = (type) => {
    this.closeModal()
    let {order, refused_code, refused_msg_content, refund_type} = this.state;
    if (type === 3 && Number(refund_type) !== 0) {
      type = 1;
    }
    const {accessToken} = this.props.global
    const api = `/api/sg_order_return_refund/${order?.id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {
      review_type: type,
      reject_reason_code: Number(refused_code),
      reject_other_reason: refused_msg_content
    }).then(() => {
      ToastShort("操作成功");
      if (Number(refund_type) === 0 && type === 3) return this.fetchData();
      this.props.navigation.goBack()
    }, (e) => {
      ToastShort("操作失败" + e.desc)
    })
  }

  refusedRefund = () => {
    let {refused_msg_content, refused_code} = this.state;
    if (Number(refused_code) === 0) {
      return showModal("请选择原因", 'warn', 1000)
    }

    if (refused_code === -1 && tool.length(refused_msg_content) <= 0) {
      return showModal("请填写原因", 'warn', 1000)
    }

    this.setState({
      show_zs_refused_refund_modal: true,
      show_refused_refund_modal: false,
    })
  }

  render() {
    let {isRefreshing, show_red_tips} = this.state
    return (
      <View style={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor='gray'
            />}
          style={styles.Content}>
          {this.renderheader()}
          {this.renderShip()}
          {this.renderGoods()}
          {this.renderDelivery()}
          <If condition={show_red_tips}>
            <Text
              style={{fontSize: 12, color: colors.red, fontWeight: 'bold', marginLeft: 14}}>超过(24小时)未初审，系统自动通过 </Text>
          </If>
          <View style={{height: 100}}/>
        </ScrollView>
        {this.renderBtn()}
        {this.renderModal()}
      </View>
    )
  }


  renderheader = () => {
    let {
      dayId,
      store_name,
      expectTime,
      platformIcon
    } = this.state;
    return (
      <View style={styles.item_body}>
        <View style={[styles.item_head, {
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingVertical: 10,
          paddingBottom: 8
        }]}>
          <Image source={{uri: platformIcon}}
                 style={styles.platformIcon}/>
          <Text style={{
            color: colors.color333,
            fontSize: 14,
            fontWeight: 'bold',
          }}># </Text>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.color333}}>{dayId} </Text>
        </View>

        <View style={styles.item_row}>
          <Text style={styles.row_label}>店铺名称：{store_name} </Text>
        </View>

        <View style={styles.item_row}>
          <Text style={styles.row_label}>期望送达时间：{expectTime} </Text>
        </View>
      </View>
    )
  }

  renderShip = () => {
    let {
      jd_ship_worker_mobile,
      jd_ship_worker_name,
    } = this.state;
    if (tool.length(jd_ship_worker_mobile) <= 0) {
      return null;
    }
    return (
      <TouchableOpacity onPress={() => {
        native.dialNumber(jd_ship_worker_mobile)
      }} style={styles.item_body}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginHorizontal: 14,
          marginTop: 16
        }}>
          <View style={{flex: 1}}>
            <Text style={{fontSize: 14, color: colors.color333}}>骑手姓名：{jd_ship_worker_name} </Text>
            <Text style={{fontSize: 14, color: colors.color333, marginTop: 11}}>骑手电话：{jd_ship_worker_mobile} </Text>
          </View>
          <FontAwesome5 solid={false} onPress={() => {
          }} name={'phone-alt'}
                        style={{fontSize: 30, color: colors.main_color}}/>
        </View>

      </TouchableOpacity>
    )
  }

  renderGoods = () => {
    let {
      show_good_list,
      refund_desc,
      total_refund_price,
      refund_reason,
      goods_list,
      refund_delivery_desc,
      refund_delivery_code
    } = this.state
    return (
      <View style={styles.item_body}>
        <View style={{
          justifyContent: 'center',
          marginHorizontal: 14,
          marginTop: 16
        }}>
          <TouchableOpacity onPress={() => {
            this.setState({
              show_good_list: !show_good_list
            })
          }} style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <Text>退款方式：{refund_desc}</Text>
            <FontAwesome5 solid={false} onPress={() => {
            }} name={!show_good_list ? 'chevron-down' : 'chevron-up'}
                          style={{fontSize: 14, color: colors.color666}}/>
          </TouchableOpacity>
          <If condition={show_good_list}>
            <View>
              <If condition={tool.length(goods_list) > 0}>
                <View style={{marginTop: 8}}>
                  <Text style={{fontSize: 14, color: colors.color333}}>退款商品： </Text>
                  <For each='item' index='idx' of={goods_list}>
                    <View
                      style={{
                        marginVertical: 4,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: "space-between"
                      }}>
                      <Text style={{flex: 1, fontSize: 14, color: colors.color333}}>{item?.name} </Text>
                      <Text style={{width: 30, fontSize: 14, color: colors.color333}}>x{item?.count} </Text>
                      <Text style={{
                        width: 60,
                        textAlign: 'right',
                        fontSize: 14,
                        color: colors.color333
                      }}>¥ {item?.price} </Text>
                    </View>
                  </For>
                </View>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: "space-between"}}>
                  <Text style={{fontSize: 14, color: colors.color333}}>退货金额： </Text>
                  <Text style={{fontSize: 14, color: colors.color333}}>¥ {total_refund_price}</Text>
                </View>
              </If>
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
                <Text style={{fontSize: 14, color: colors.color333}}>退款原因： </Text>
                <Text style={{fontSize: 14, color: colors.red}}>{refund_reason} </Text>
              </View>
            </View>
          </If>
        </View>
        <If condition={refund_delivery_code || refund_delivery_desc}>
          <View style={{
            marginTop: 10,
            borderTopWidth: 1,
            borderColor: colors.colorCCC,
            paddingHorizontal: 14,
          }}>
            <If condition={refund_delivery_code}>
              <TouchableOpacity onPress={() => {
                Clipboard.setString(refund_delivery_code)
                ToastShort('已复制到剪切板')
              }} style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 8}}>
                <Text style={{fontSize: 14, color: colors.color333}}>物流单号： {refund_delivery_code}</Text>
                <Text style={{fontSize: 14, color: colors.main_color}}>复制 </Text>
              </TouchableOpacity>
            </If>
            <If condition={refund_delivery_desc}>
              <View style={{marginTop: 10}}>
                <Text style={{fontSize: 14, color: colors.color333}}>退货方式：{refund_delivery_desc} </Text>
              </View>
            </If>
          </View>
        </If>
      </View>
    )
  }

  renderDelivery = () => {
    if (tool.length(this.state.status_list) <= 0) {
      return null;
    }
    return (
      <View style={[styles.item_body, {paddingBottom: 2}]}>
        <View style={[styles.item_head, {
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingVertical: 10,
          paddingBottom: 8,
        }]}>
          <Text style={{
            fontSize: 15,
            fontWeight: 'bold',
            color: colors.color333,
            marginLeft: 14,
          }}>退款状态 </Text>
        </View>
        <View style={{paddingHorizontal: 14}}>
          {this.renderDeliveryStatus()}
        </View>
      </View>
    )
  }

  renderDeliveryStatus = () => {
    return (
      <View>
        <For each="log" index="i" of={this.state.status_list}>
          <View key={i} style={styles.deliveryStatusContent}>
            <View style={{width: 30}}>
              <View style={[styles.deliveryStatusHeader, {backgroundColor: log.status_color,}]}>
                <If condition={i !== 0}>
                  <View style={[styles.deliveryStatusTitleBottom, {backgroundColor: log.status_color}]}/>
                </If>
                <If condition={i !== tool.length(this.state.status_list) - 1}>
                  <View style={[styles.deliveryStatusTitleTop, {backgroundColor: log.status_color}]}/>
                </If>
              </View>
            </View>
            <View style={{flex: 1}}>
              <Text style={{color: log.status_desc_color, fontSize: 14}}>{log.status_desc_new}  </Text>
            </View>
          </View>
        </For>
      </View>
    )
  }

  renderBtn = () => {
    let {show_red_tips} = this.state;
    return (
      <View style={{backgroundColor: colors.white, padding: 20, flexDirection: 'row', justifyContent: 'space-between'}}>

        <If condition={show_red_tips}>
          <Button title={'拒绝'}
                  onPress={() => {
                    this.setState({
                      show_refused_refund_modal: true
                    })
                  }}
                  buttonStyle={{
                    width: 150,
                    borderRadius: 5,
                    backgroundColor: colors.fontGray,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />

          <Button title={'同意'}
                  onPress={() => {
                    this.setState({
                      show_comfirm_refund_modal: true
                    })
                  }}
                  buttonStyle={{
                    width: 150,
                    borderRadius: 4,
                    backgroundColor: colors.main_color,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />
        </If>
        <If condition={!show_red_tips}>
          <Button title={'拒绝收货'}
                  onPress={() => {
                    this.setState({
                      show_refused_refund_modal: true
                    })
                  }}
                  buttonStyle={{
                    width: 150,
                    borderRadius: 4,
                    backgroundColor: colors.fontGray,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />

          <Button title={'确认收货'}
                  onPress={() => {
                    this.setState({
                      show_comfirm_agree_refund_modals: true
                    })
                  }}
                  buttonStyle={{
                    width: 150,
                    borderRadius: 4,
                    backgroundColor: colors.main_color,
                  }}
                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
                  }}
          />
        </If>

      </View>
    )
  }

  renderModal = () => {
    let {
      show_comfirm_refund_modal,
      show_comfirm_agree_refund_modals,
      show_refused_refund_modal,
      show_zs_refused_refund_modal,
      refused_code,
      refused_msg_content,
      reject_status,
    } = this.state
    let list = Number(reject_status) === 1 ? refused_msgs : Number(reject_status) === 2 ? refused_msgss : refused_msgsss;
    return (
      <View>
        <BottomModal title={'提示'} actionText={'退款'} closeText={'取消'} onPress={() => this.comfirmRefund(3)}
                     onPressClose={() => this.closeModal()}
                     visible={show_comfirm_refund_modal}
                     btnBottomStyle={{
                       borderTopWidth: 1,
                       borderTopColor: "#E5E5E5",
                       paddingBottom: 0,
                     }}
                     closeBtnStyle={{
                       borderWidth: 0,
                       borderRadius: 0,
                       borderRightWidth: 1,
                       borderColor: "#E5E5E5",
                     }}
                     btnStyle={{borderWidth: 0, backgroundColor: colors.white}}
                     closeBtnTitleStyle={{color: colors.color333}}
                     btnTitleStyle={{color: colors.main_color}} onClose={() => this.closeModal()}>
          <View style={{
            margin: 20,
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.color333,
            }}>确认同意顾客退款吗？ </Text>
          </View>
        </BottomModal>

        <BottomModal title={'提示'} actionText={'退款'} closeText={'取消'} onPress={() => this.comfirmRefund(1)}
                     onPressClose={() => this.closeModal()}
                     visible={show_comfirm_agree_refund_modals}
                     btnBottomStyle={{
                       borderTopWidth: 1,
                       borderTopColor: "#E5E5E5",
                       paddingBottom: 0,
                     }}
                     closeBtnStyle={{
                       borderWidth: 0,
                       borderRadius: 0,
                       borderRightWidth: 1,
                       borderColor: "#E5E5E5",
                     }}
                     btnStyle={{borderWidth: 0, backgroundColor: colors.white}}
                     closeBtnTitleStyle={{color: colors.color333}}
                     btnTitleStyle={{color: colors.main_color}} onClose={() => this.closeModal()}>
          <View style={{
            margin: 20,
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.color333,
            }}>确认同意退款吗？ </Text>
          </View>
        </BottomModal>

        <BottomModal title={'请选择原因'} actionText={'保存'} onPress={() => this.refusedRefund()}
                     visible={show_refused_refund_modal}
                     btnStyle={{backgroundColor: colors.main_color}}
                     onClose={() => this.closeModal()}>
          <View style={{
            marginVertical: 8
          }}>
            <For each='msg' index='idx' of={list}>
              <TouchableOpacity onPress={() => {
                this.setState({
                  refused_code: msg?.key
                })
              }} style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  checked={refused_code === msg?.key}
                  checkedColor={colors.main_color}
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  uncheckedColor='#979797'
                  size={14}/>
                <Text style={{fontSize: 14, color: colors.color333}}>{msg?.label} </Text>
              </TouchableOpacity>
            </For>
            <If condition={refused_code === -1}>
              <TextArea
                value={refused_msg_content}
                onChange={(refused_msg_content) => {
                  this.setState({refused_msg_content})
                }}
                showCounter={false}
                underlineColorAndroid="transparent" //取消安卓下划线
                style={{
                  borderWidth: 1,
                  borderColor: colors.color666,
                  height: 60,
                  marginHorizontal: 20,
                }}
              >
              </TextArea>
            </If>
          </View>
        </BottomModal>

        <BottomModal title={'提示'} actionText={'确定'} closeText={'取消'} onPress={() => this.comfirmRefund(2)}
                     onPressClose={() => this.closeModal()}
                     visible={show_zs_refused_refund_modal}
                     btnBottomStyle={{
                       borderTopWidth: 1,
                       borderTopColor: "#E5E5E5",
                       paddingBottom: 0,
                     }}
                     closeBtnStyle={{
                       borderWidth: 0,
                       borderRadius: 0,
                       borderRightWidth: 1,
                       borderColor: "#E5E5E5",
                     }}
                     btnStyle={{borderWidth: 0, backgroundColor: colors.white}}
                     closeBtnTitleStyle={{color: colors.color333}}
                     btnTitleStyle={{color: colors.main_color}} onClose={() => this.closeModal()}>
          <View style={{
            margin: 20,
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.color333,
            }}>确定驳回顾客退款申请吗？ </Text>
          </View>
        </BottomModal>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  Content: {
    backgroundColor: colors.main_back,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexGrow: 1,
  },
  item_body: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 10,
    paddingBottom: 12,
  },
  platformIcon: {width: 24, height: 24, borderRadius: 12, marginLeft: 12, marginRight: 8},
  item_head: {
    borderBottomWidth: 1,
    paddingBottom: 2,
    borderColor: colors.colorCCC
  },
  item_title: {
    color: colors.color333,
    padding: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  item_row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  row_label: {
    fontSize: 14,
    color: colors.color333,
  },

  deliveryStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14
  },
  deliveryStatusHeader: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  deliveryStatusTitleTop: {
    width: 2,
    height: 24,
    position: 'absolute',
    top: 10,
    left: 4
  },
  deliveryStatusTitleBottom: {
    width: 2,
    height: 24,
    position: 'absolute',
    bottom: 10,
    left: 4
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(newRefundScene)
