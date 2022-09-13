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
import {ToastShort} from "../../pubilc/util/ToastUtils";

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
  '已和用户沟通一致不退货',
  '商品发出时完好',
  '商品没问题，买家未举证',
  '商品没问题，买家举证无效',
  '商品已经影响二次销售',
  '申请时间已经超过售后服务时限',
  '不支持买家主观原因的退换货',
  '其他原因',
]

class AuditRefundScene extends Component {
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
      refused_msg: '',
      refused_msg_content: '',
      delivery_type: 1,
    };
  }

  onHeaderRefresh = () => {
    console.log('fetch')
  }

  closeModal = () => {
    this.setState({
      show_comfirm_refund_modal: false,
      show_comfirm_agree_refund_modals: false,
      show_refused_refund_modal: false,
      show_zs_refused_refund_modal: false,
    })
  }

  comfirmRefund = () => {
  }

  comfirmAgreeRefund = () => {
  }

  refusedRefund = () => {
    let {delivery_type} = this.state;
    if (delivery_type === 1) {
      this.setState({
        show_zs_refused_refund_modal: true,
      })
      return
    }
    this.zsRefusedRefund();
  }

  zsRefusedRefund = () => {
    console.log('拒绝')
  }


  render() {
    let {isRefreshing} = this.state
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
          {/*<Text style={{fontSize: 12, color: colors.red,fontWeight:'bold', marginLeft: 14}}>超过(24小时)未初审，系统自动通过 </Text>*/}
          {/*<Text style={{fontSize: 12, color: colors.color333,fontWeight:'bold', marginLeft: 14}}>商家驳回退货申请 </Text>*/}
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
    } = this.state.order;
    return (
      <View style={styles.item_body}>
        <View style={[styles.item_head, {
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingVertical: 10,
          paddingBottom: 8
        }]}>
          <Image source={{uri: ''}}
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
          <Text style={styles.row_label}>期望送达时间：{tool.orderExpectTime(expectTime)} </Text>
        </View>
      </View>
    )
  }

  renderShip = () => {
    let {
      ship_worker_mobile,
      ship_worker_name,
    } = this.state.order;
    return (
      <TouchableOpacity onPress={() => {
        native.dialNumber(ship_worker_mobile)
      }} style={styles.item_body}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginHorizontal: 14,
          marginTop: 16
        }}>
          <View style={{flex: 1}}>
            <Text style={{fontSize: 14, color: colors.color333}}>骑手姓名：{ship_worker_name} </Text>
            <Text style={{fontSize: 14, color: colors.color333, marginTop: 11}}>骑手电话：{ship_worker_mobile} </Text>
          </View>
          <FontAwesome5 solid={false} onPress={() => {
          }} name={'phone-alt'}
                        style={{fontSize: 30, color: colors.main_color}}/>
        </View>

      </TouchableOpacity>
    )
  }

  renderGoods = () => {
    let {show_good_list} = this.state
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
            <Text>退款方式：用户申请部分退款</Text>
            <FontAwesome5 solid={false} onPress={() => {
            }} name={show_good_list ? 'chevron-down' : 'chevron-up'}
                          style={{fontSize: 14, color: colors.color666}}/>
          </TouchableOpacity>
          <If condition={show_good_list}>
            <View>
              <View style={{marginVertical: 8}}>
                <Text style={{fontSize: 14, color: colors.color333}}>退款商品： </Text>
                <View
                  style={{
                    marginVertical: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: "space-between"
                  }}>
                  <Text style={{flex: 1, fontSize: 14, color: colors.color333}}>白心红薯月500g </Text>
                  <Text style={{width: 30, fontSize: 14, color: colors.color333}}>x1 </Text>
                  <Text style={{width: 60, textAlign: 'right', fontSize: 14, color: colors.color333}}>¥ 1.56 </Text>
                </View>
                <View
                  style={{
                    marginVertical: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: "space-between"
                  }}>
                  <Text style={{flex: 1, fontSize: 14, color: colors.color333}}>白心红薯月500g </Text>
                  <Text style={{width: 30, fontSize: 14, color: colors.color333}}>x1 </Text>
                  <Text style={{width: 60, textAlign: 'right', fontSize: 14, color: colors.color333}}>¥ 1.56 </Text>
                </View>
                <View
                  style={{
                    marginVertical: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: "space-between"
                  }}>
                  <Text style={{flex: 1, fontSize: 14, color: colors.color333}}>白心红薯月500g </Text>
                  <Text style={{width: 30, fontSize: 14, color: colors.color333}}>x1 </Text>
                  <Text style={{width: 60, textAlign: 'right', fontSize: 14, color: colors.color333}}>¥ 1.56 </Text>
                </View>

              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: "space-between"}}>
                <Text style={{fontSize: 14, color: colors.color333}}>退货金额： </Text>
                <Text style={{fontSize: 14, color: colors.color333}}>¥ 61.56</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
                <Text style={{fontSize: 14, color: colors.color333}}>退款原因： </Text>
                <Text style={{fontSize: 14, color: colors.red}}>地址无法配送 </Text>
              </View>
            </View>
          </If>
        </View>
        <View style={{
          marginTop: 10,
          borderTopWidth: 1,
          borderColor: colors.colorCCC,
          paddingHorizontal: 14,
        }}>
          <TouchableOpacity onPress={() => {
            Clipboard.setString('222222')
            ToastShort('已复制到剪切板')
          }} style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 8}}>
            <Text style={{fontSize: 14, color: colors.color333}}>物流单号： 222222</Text>
            <Text style={{fontSize: 14, color: colors.main_color}}>复制 </Text>
          </TouchableOpacity>

          <View style={{marginTop: 10}}>
            <Text style={{fontSize: 14, color: colors.color333}}>退货方式：跑腿送货/自行送货/商家取货 </Text>
          </View>

        </View>
      </View>
    )
  }

  renderDelivery = () => {
    return (
      <View style={styles.item_body}>
        <View style={[styles.item_head, {
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingVertical: 10,
          paddingBottom: 8,
        }]}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.color333,
            marginLeft: 14,
          }}>配送状态 </Text>
        </View>
        <View style={{paddingHorizontal: 14}}>
          {this.renderDeliveryStatus()}
        </View>
      </View>
    )
  }

  renderDeliveryStatus = () => {
    let list = [
      {status_color: 'green', status_desc: '商家通过退货申请', status_desc_color: 'black'},
      {status_color: 'green', status_desc: '商家通过退货申请', status_desc_color: 'black'},
      {status_color: 'green', status_desc: '商家通过退货申请', status_desc_color: 'black'},
      {status_color: 'green', status_desc: '商家通过退货申请', status_desc_color: 'black'},
    ]
    return (
      <View>
        <For each="log" index="i" of={list}>
          <View key={i} style={styles.deliveryStatusContent}>
            <View style={{width: 30}}>
              <View style={[styles.deliveryStatusHeader, {backgroundColor: log.status_color,}]}>
                <If condition={i !== 0}>
                  <View style={[styles.deliveryStatusTitleBottom, {backgroundColor: log.status_color}]}/>
                </If>
                <If condition={i !== tool.length(list) - 1}>
                  <View style={[styles.deliveryStatusTitleTop, {backgroundColor: log.status_color}]}/>
                </If>
              </View>
            </View>
            <View style={{flex: 1}}>
              <Text style={{color: log.status_desc_color, fontSize: 14}}>{log.status_desc}  </Text>
            </View>
          </View>
        </For>
      </View>
    )
  }

  renderBtn = () => {
    return (
      <View style={{backgroundColor: colors.white, padding: 20, flexDirection: 'row', justifyContent: 'space-between'}}>

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

        {/*<Button title={'拒绝收货'}*/}
        {/*        onPress={() => {*/}
        {/*          console.log(111)*/}
        {/*        }}*/}
        {/*        buttonStyle={{*/}
        {/*          width: 150,*/}
        {/*          borderRadius: 4,*/}
        {/*          backgroundColor: colors.fontGray,*/}
        {/*        }}*/}
        {/*        titleStyle={{*/}
        {/*          color: colors.white,*/}
        {/*          fontSize: 16*/}
        {/*        }}*/}
        {/*/>*/}

        {/*<Button title={'确认收货'}*/}
        {/*        onPress={() => {*/}
        {/*          this.setState({*/}
        {/*            show_comfirm_agree_refund_modals: true*/}
        {/*          })*/}
        {/*        }}*/}
        {/*        buttonStyle={{*/}
        {/*          width: 150,*/}
        {/*          borderRadius: 4,*/}
        {/*          backgroundColor: colors.main_color,*/}
        {/*        }}*/}
        {/*        titleStyle={{*/}
        {/*          color: colors.white,*/}
        {/*          fontSize: 16*/}
        {/*        }}*/}
        {/*/>*/}

      </View>
    )
  }

  renderModal = () => {
    let {
      show_comfirm_refund_modal,
      show_comfirm_agree_refund_modals,
      show_refused_refund_modal,
      show_zs_refused_refund_modal,
      refused_msg,
      refused_msg_content,
    } = this.state
    return (
      <View>
        <BottomModal title={'提示'} actionText={'退款'} closeText={'取消'} onPress={() => this.comfirmRefund()}
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

        <BottomModal title={'提示'} actionText={'退款'} closeText={'取消'} onPress={() => this.comfirmAgreeRefund()}
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
            <For each='msg' index='idx' of={refused_msgs}>
              <TouchableOpacity onPress={() => {
                this.setState({
                  refused_msg: msg
                })
              }} style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  checked={refused_msg === msg}
                  checkedColor={colors.main_color}
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  uncheckedColor='#979797'
                  size={14}/>
                <Text style={{fontSize: 14, color: colors.color333}}>{msg} </Text>
              </TouchableOpacity>
            </For>
            <If condition={refused_msg === '其他原因'}>
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

        <BottomModal title={'提示'} actionText={'取消'} closeText={'取消'} onPress={() => this.zsRefusedRefund()}
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
            }}>当前退货方式为自行送货，确定驳回顾客退款申请吗？ </Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(AuditRefundScene)
