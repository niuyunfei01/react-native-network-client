import React from "react";
import PropTypes from "prop-types";
import PropType from "prop-types";
import Config from "../common/config";
import {bindActionCreators} from "redux";
import {
  Alert,
  Dimensions,
  InteractionManager,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import {connect} from "react-redux";
import Clipboard from '@react-native-community/clipboard'
import {
  addTipMoney,
  addTipMoneyNew,
  cancelReasonsList,
  cancelShip,
  orderCallShip
} from "../../reducers/order/orderActions";

import {showModal, showSuccess, ToastLong, ToastShort} from "../util/ToastUtils";
import HttpUtils from "../util/http";
import native from "../../pubilc/util/native";
import tool from "../util/tool";
import colors from "../styles/colors";
import GlobalUtil from "../util/GlobalUtil";
import Entypo from "react-native-vector-icons/Entypo"
import {Button} from "react-native-elements";
import {MixpanelInstance} from "../util/analytics";
import {SvgXml} from "react-native-svg";
import {call, cross_icon, locationIcon} from "../../svg/svg";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import AlertModal from "./AlertModal";
import JbbModal from "./JbbModal";

let width = Dimensions.get("window").width;

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      addTipMoney, orderCallShip, cancelShip, cancelReasonsList, addTipMoneyNew
    }, dispatch)
  }
}

class OrderItem extends React.PureComponent {
  static propTypes = {
    item: PropTypes.object,
    accessToken: PropTypes.string,
    showBtn: PropTypes.bool,
    fetchData: PropType.func,
    setState: PropType.func,
    openCancelDeliveryModal: PropType.func,
    openFinishDeliveryModal: PropType.func,
    comesBackBtn: PropType.bool,
  };
  state = {
    verification_modal: false,
    show_close_delivery_modal: false,
    show_call_user_modal: false,
    pickupCode: '',
    err_msg: '',
  }

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  onOverlookDelivery = (order_id) => {
    this.mixpanel.track('V4订单列表_忽略配送')
    const self = this;
    showModal("请求中")
    tool.debounces(() => {
      const api = `/api/transfer_arrived/${order_id}?access_token=${this.props.accessToken}`
      HttpUtils.get.bind(self.props.navigation)(api, {
        orderId: this.props.item.id
      }).then(() => {
        showSuccess('配送已完成')
        this.props.fetchData();
      }).catch(e => {
        ToastShort('忽略配送失败' + e?.desc)
      })
    }, 600)
  }

  onCallThirdShips = (order_id, store_id, if_reship = 0) => {
    this.onPress(Config.ROUTE_ORDER_CALL_DELIVERY, {
      order_id: order_id,
      store_id: store_id,
      if_reship: if_reship,
      onBack: (res) => {
        if (res && res?.count >= 0) {
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }

  onAinSend = (order_id, store_id, sync_order = 0) => {
    this.onPress(Config.ROUTE_ORDER_AIN_SEND, {
      orderId: order_id,
      storeId: store_id,
      sync_order: sync_order,
      onBack: (res) => {
        if (res) {
          this.props.fetchData()
          GlobalUtil.setOrderFresh(1)
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }


  cancelDeliverys = () => {
    let order = this.props.item
    let token = this.props.accessToken
    Alert.alert('提示', `确定取消此订单全部配送吗?`, [{
      text: '确定', onPress: () => {
        const api = `/api/batch_cancel_third_ship/${order?.id}?access_token=${token}`;
        HttpUtils.get.bind(this.props)(api, {}).then(res => {
          ToastShort(res.desc);
          this.props.fetchData();
        }).catch(() => {
          ToastShort("此订单已有骑手接单，取消失败")
        })
      }
    }, {'text': '取消'}]);
  }


  dialNumber = (val) => {
    native.dialNumber(val)
  }

  clipBoard = (val) => {
    Clipboard.setString(val)
    ToastLong('已复制到剪切板')
  }

  closeModal = () => {
    this.setState({
      verification_modal: false,
      show_close_delivery_modal: false,
      show_call_user_modal: false,
    })
  }

  goVeriFicationToShop = () => {
    let {item} = this.props;
    let {pickupCode} = this.state
    const api = `/v1/new_api/orders/order_checkout/${item?.id}?access_token=${this.props.accessToken}&pick_up_code=${pickupCode}`;
    HttpUtils.get(api).then(() => {
      this.closeModal();
      ToastShort(`核销成功，订单已完成`)
    }, (res) => {
      this.setState({
        err_msg: res?.desc
      })
    }).catch((res) => {
      this.setState({
        err_msg: res?.desc
      })
    })
  }

  touchMobile = () => {
    let {item} = this.props;
    this.mixpanel.track('订单列表页_点击手机号')
    if (tool.length(item?.phone_backup) > 0) {
      return this.setState({
        show_call_user_modal: true
      })
    }
    this.dialNumber(item.mobile)
  }

  touchLocation = () => {
    let {item} = this.props;
    this.onPress(Config.RIDER_TRSJECTORY, {delivery_id: 0, order_id: item?.id})

    // this.mixpanel.track('订单列表页_点击位置')
    // const path = '/AmapTrack.html?orderId=' + item.id + "&access_token=" + this.props.accessToken;
    // this.onPress(Config.ROUTE_WEB, {url: Config.serverUrl(path)});
  }

  routeOrder = () => {
    let {item} = this.props;
    this.onPress(Config.ROUTE_ORDER_NEW, {orderId: item.id})
    this.mixpanel.track('V4订单详情页')
  }

  render() {
    let {item, showBtn} = this.props;
    return (
      <TouchableWithoutFeedback onPress={() => this.routeOrder()}>
        <View style={styles.ItemContent}>
          {this.renderItemHeader()}
          <View style={{padding: 12}}>
            {this.renderUser()}
            {this.renderRemark()}
            {this.renderGoods()}
            {this.renderDeliveryDesc()}
            {this.renderDelivery()}
            <If condition={item?.btn_list && item?.btn_list?.write_off}>
              {this.renderVerificationBtn()}
            </If>
            <If condition={Number(item.pickType) !== 1 && showBtn}>
              {this.renderButton()}
            </If>
          </View>
          {this.renderPickModal()}
          {this.renderCallUser()}
          {this.renderCloseDeliveryModal()}
        </View>

      </TouchableWithoutFeedback>
    )
  }

  renderCallUser = () => {
    let {show_call_user_modal} = this.state;
    let {item} = this.props;
    return (
      <JbbModal visible={show_call_user_modal} HighlightStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={'bottom'}>
        <View style={{
          backgroundColor: colors.f5,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        }}>
          <View style={{
            height: 153,
            backgroundColor: colors.white,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            paddingHorizontal: 20,
            paddingTop: 6
          }}>
            <TouchableOpacity onPress={() => {
              this.dialNumber(item.mobile)
              this.closeModal()
            }} style={{
              paddingVertical: 14,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.colorDDD,
              flexDirection: "row",
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View>
                <Text style={{fontSize: 16, color: colors.color666}}> 虚拟号码 </Text>
                <Text style={{
                  fontSize: 16,
                  color: colors.color333,
                  fontWeight: 'bold',
                  marginTop: 3,
                  lineHeight: 22
                }}> {item?.mobile_readable} </Text>
              </View>
              <SvgXml xml={call()}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              this.dialNumber(item?.phone_backup)
              this.closeModal()
            }} style={{
              paddingVertical: 14,
              flexDirection: "row",
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View>
                <Text style={{fontSize: 16, color: colors.color666}}> 备用号码 </Text>
                <Text style={{
                  fontSize: 16,
                  color: colors.color333,
                  fontWeight: 'bold',
                  marginTop: 3,
                  lineHeight: 22
                }}> {item?.phone_backup_readable} </Text>
              </View>
              <SvgXml xml={call()}/>
            </TouchableOpacity>

          </View>
          <TouchableOpacity onPress={this.closeModal} style={{
            backgroundColor: colors.white,
            height: 53,
            marginTop: 6,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              color: colors.color666,
              lineHeight: 22
            }}> 取消 </Text>
          </TouchableOpacity>
        </View>
      </JbbModal>
    )
  }
  renderPickModal = () => {
    let {verification_modal, pickupCode, err_msg} = this.state;
    return (
      <JbbModal visible={verification_modal} HighlightStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={'center'}>
        <View style={{paddingHorizontal: 12, paddingVertical: 15}}>
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 8,
            justifyContent: 'space-between',
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 16, color: colors.color333, lineHeight: 30}}>
              自提订单核销
            </Text>
            <SvgXml onPress={this.closeModal} xml={cross_icon()}/>
          </View>
          <View style={{paddingHorizontal: 8, paddingBottom: 5}}>
            <View style={{
              backgroundColor: colors.f5,
              borderRadius: 4,
              height: 48,
              marginTop: 20,
              marginBottom: tool.length(err_msg) > 0 ? 0 : 30
            }}>
              <TextInput placeholder={"请输入核销码"}
                         onChangeText={(pickupCode) => {
                           this.setState({
                             pickupCode: pickupCode.replace(/[^\a-\z\A-\Z0-9]/g, ""),
                             err_msg: /[^\a-\z\A-\Z0-9]+?$/g.test(pickupCode) ? '请输入正确的英文字符' : ''
                           })
                         }}
                         maxLength={7}
                         value={pickupCode}
                         placeholderTextColor={colors.color999}
                         style={{
                           paddingHorizontal: 4,
                           color: colors.color333,
                           fontSize: 16,
                           height: 48,
                           borderRadius: 5,
                         }}
                         underlineColorAndroid="transparent"/>
            </View>
            <If condition={tool.length(err_msg) > 0}>
              <View style={{
                flexDirection: "row", alignItems: "center", height: 30
              }}>
                <Text style={{
                  color: colors.warn_red,
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>{err_msg} </Text>
              </View>
            </If>
            <Button title={'确 定'}
                    onPress={this.goVeriFicationToShop}
                    buttonStyle={[{
                      backgroundColor: colors.main_color,
                      borderRadius: 21,
                      length: 42,
                    }]}
                    titleStyle={{color: colors.f7, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
          </View>

        </View>
      </JbbModal>
    )
  }


  renderItemHeader = () => {
    let {item} = this.props;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 65,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        backgroundColor: colors.f9
      }}>

        <If condition={!item.is_right_once}>
          <View style={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}>
            <LinearGradient style={{width: 28, height: 26, borderTopLeftRadius: 6}}
                            start={{x: 0, y: 0.5}}
                            end={{x: 0.5, y: 1}}
                            locations={[0.5, 0.5]}
                            colors={['#FF8309', 'transparent']}/>
            <Text style={styles.ItemHeaderTitle}>预 </Text>
          </View>
        </If>

        <FastImage source={{uri: item.platformIcon}}
                   resizeMode={FastImage.resizeMode.contain}
                   style={styles.platformIcon}/>
        <View style={{flex: 1, marginLeft: 10}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.color333,
              marginRight: 10
            }}>#{item.platform_dayId} </Text>
            <If condition={Number(item?.pickType) === 1}>
              <Text style={{
                borderWidth: 0.2,
                borderColor: colors.main_color,
                borderRadius: 2,
                color: colors.main_color,
                marginRight: 10,
                height: 16,
                lineHeight: 16,
                width: 48,
                fontSize: 10,
                textAlign: 'center'
              }}>
                到店自提
              </Text>
            </If>
            <Text style={{
              fontSize: 12,
              color: '#FF8309'
            }}>{item.friendly_time_info} </Text>
          </View>
          <Text style={{
            color: colors.color666,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 2
          }}> {item?.ext_store_name}&nbsp; #{item.dayId} </Text>
        </View>
        <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>

      </View>
    )
  }


  renderVerificationBtn = () => {
    return (
      <View style={{
        paddingVertical: 10,
        marginHorizontal: 4,
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderColor: colors.colorEEE
      }}>
        <Button title={'门店核销'}
                onPress={() => {
                  this.mixpanel.track('V4订单列表_到店核销')
                  this.setState({
                    verification_modal: true,
                  })
                }}
                buttonStyle={[styles.modalBtn, {
                  backgroundColor: colors.main_color,
                  width: width * 0.8,
                }]}
                titleStyle={{color: colors.white, fontSize: 16}}
        />
      </View>
    )
  }

  renderUser = () => {
    let {item} = this.props;
    return (
      <View style={{
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <View style={{flex: 1}}>
          <Text style={styles.userNameText}> {item.userName} &nbsp;&nbsp;{item.mobile_readable} </Text>
          <Text style={{
            color: colors.color333,
            fontSize: 14,
            fontWeight: 'bold'
          }}> {tool.jbbsubstr(item.address, 16)} </Text>
        </View>

        <TouchableOpacity style={{paddingHorizontal: 10}}
                          onPress={() => this.touchLocation()}>
          <SvgXml xml={locationIcon()}/>
        </TouchableOpacity>

        <TouchableOpacity style={{paddingHorizontal: 10}} onPress={() => this.touchMobile()}>
          <SvgXml xml={call()}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderRemark = () => {
    let {item} = this.props;
    if (tool.length(item?.remark) <= 0) {
      return null;
    }
    return (
      <View style={[styles.contentHeader, {paddingTop: 12}]}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'flex-start'}}>
          <Text
            style={{fontWeight: 'bold', fontSize: 14, color: '#FF8309'}}>备注：</Text>
          <Text style={{
            fontSize: 14,
            color: colors.color666,
            lineHeight: 20,
            flex: 1
          }}>{item?.remark} </Text>
        </View>
      </View>
    )
  }

  renderGoods = () => {
    let {item} = this.props;
    if (tool.length(item?.goods_info) <= 0 || item?.goods_info?.count <= 0) {
      return null;
    }
    return (
      <TouchableOpacity onPress={() => {
        this.props.setState({
          order_id: item?.id,
          show_goods_list: true
        })
      }} style={[styles.contentHeader, {paddingTop: 12}]}>
        <View style={{flex: 1}}>
          <Text
            style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>商品 {item?.goods_info?.count} 件 </Text>
          <Text style={{
            fontSize: 12,
            color: colors.color666,
            marginTop: 4,
          }}>{item?.goods_info?.short_names} </Text>
        </View>
        <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>
      </TouchableOpacity>
    )
  }

  setDeliveryModal = () => {
    let {item, setState} = this.props;
    setState({
      show_delivery_modal: true,
      order_id: item?.id
    })
  }
  renderDeliveryDesc = () => {
    let {item} = this.props;
    if (!item?.is_show_ship_status_desc) {
      return null;
    }
    return (
      <TouchableOpacity onPress={this.setDeliveryModal} style={[styles.contentHeader, {paddingTop: 12}]}>
        <View style={{flex: 1,}}>
          <If condition={item?.is_show_ship_status}>
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.color333,
                fontWeight: 'bold',
                lineHeight: 20,
                marginBottom: 4
              }}>{item?.ship_status} </Text>
          </If>
          <Text style={{flex: 1, fontSize: 14, color: colors.color666, lineHeight: 20}}>{item?.ship_status_desc} </Text>
        </View>
        <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>
      </TouchableOpacity>
    )
  }

  renderDelivery = () => {
    let {item} = this.props;
    if (!item?.is_show_ship_worker) {
      return null
    }
    return (
      <TouchableOpacity onPress={this.setDeliveryModal} style={[styles.contentHeader, {paddingTop: 12}]}>
        <View style={{flex: 1}}>
          <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>{item?.ship_status} </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
            <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333}}>{item?.ship_platform_name} </Text>
            <Text style={{
              fontSize: 14,
              color: colors.color666
            }}>{item?.ship_worker_name} &nbsp; {item?.ship_worker_mobile} </Text>
          </View>
        </View>
        <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color999}}/>
      </TouchableOpacity>
    )
  }


  renderCloseDeliveryModal = () => {
    let {item} = this.props;
    let {show_close_delivery_modal} = this.state;
    return (
      <View>
        <AlertModal
          visible={show_close_delivery_modal}
          onClose={this.closeModal}
          onPressClose={this.closeModal}
          onPress={() => this.onOverlookDelivery(item?.id)}
          title={'订单送达后无法撤回，请确认顾客已收到货物'}
          actionText={'忽略'}
          closeText={'暂不'}/>
      </View>
    )
  }


  renderButton = () => {
    let {item, comesBackBtn, orderStatus} = this.props;
    let obj_num = 0
    if (comesBackBtn) {
      obj_num = 1
    } else {
      tool.objectMap(item?.btn_list, (item, idx) => {
        obj_num += item
      })
    }
    let btn_width = 0.83 / Number(obj_num)
    return (
      <View
        style={{
          paddingTop: 12,
          borderTopWidth: 0.2,
          borderColor: colors.e5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

        <If condition={item?.btn_list && item?.btn_list?.btn_ignore_delivery}>
          <Button title={'忽略配送'}
                  onPress={() => {
                    this.mixpanel.track('订单列表页_忽略配送')
                    this.setState({
                      show_close_delivery_modal: true
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

        <If condition={item?.btn_list && item?.btn_list?.batch_cancel_delivery}>
          <Button title={'取消配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单列表_一键取消')
                    this.cancelDeliverys(item.id)
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

        <If condition={item?.btn_list && item?.btn_list?.btn_cancel_delivery}>
          <Button title={'取消配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单列表_取消配送')
                    this.props.openCancelDeliveryModal(item?.id)
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

        <If condition={item?.btn_list && item?.btn_list?.batch_add_delivery_tips}>
          <Button title={Number(item?.have_add_tips) > 0 ? '加小费' + item?.have_add_tips + '元' : '加小费'}
                  onPress={() => {
                    this.props.setState && this.props.setState({
                      add_tip_id: item?.id,
                      show_add_tip_modal: true
                    })
                    this.mixpanel.track('V4订单列表_一键加小费')
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

        <If condition={item?.btn_list && item?.btn_list?.btn_call_third_delivery}>
          <Button title={orderStatus === 8 ? '重新下单' : '下配送单'}
                  onPress={() => {
                    this.onCallThirdShips(item.id, item.store_id)
                    this.mixpanel.track('V4订单列表_下配送单')
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>

        <If condition={item?.btn_list && item?.btn_list?.btn_call_third_delivery_again}>
          <Button title={'追加配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单列表_追加配送')
                    this.onCallThirdShips(item.id, item.store_id)
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>

        <If condition={item?.btn_list && item?.btn_list?.btn_contact_rider}>
          <Button title={'联系骑手'}
                  onPress={() => {
                    this.mixpanel.track('V4订单列表_联系骑手')
                    this.dialNumber(item?.ship_worker_mobile)
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>

        <If condition={item?.btn_list && item?.btn_list?.btn_confirm_arrived}>
          <Button title={'完成配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单列表_完成配送')
                    this.props.openFinishDeliveryModal(item?.id);
                  }}
                  buttonStyle={[styles.modalBtn, {
                    backgroundColor: colors.main_color,
                    width: width * btn_width,
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>

        <If condition={this.props.comesBackBtn !== undefined && this.props.comesBackBtn}>
          <Button title={'重新上传配送信息'}
                  onPress={() => {
                    this.mixpanel.track('配送回传详情页_重新上传')
                    this.onAinSend(item.id, item.store_id, 1)
                  }}
                  buttonStyle={[styles.modalBtn, {
                    width: width * btn_width,
                    backgroundColor: colors.main_color
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>
      </View>
    )
  }


}

const styles = StyleSheet.create({
  ItemHeaderTitle: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    position: 'absolute',
    top: 1,
    left: 4,
  },
  platformIcon: {width: 40, height: 40, borderRadius: 24},
  humanExpectTime: {fontWeight: "bold", fontSize: 14, color: "#FF8854"},
  contentHeader: {
    paddingBottom: 12,
    borderTopWidth: 0.2,
    borderColor: colors.e5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 14,
    color: colors.color666,
    marginBottom: 4
  },
  ItemContent: {
    flexDirection: "column",
    backgroundColor: colors.white,
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    elevation: 5,
    shadowRadius: 8,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 20,
    height: 36,
    marginHorizontal: 3,
  }
});


export default connect(mapDispatchToProps)(OrderItem)
