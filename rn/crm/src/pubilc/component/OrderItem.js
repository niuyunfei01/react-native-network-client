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

import {showError, showModal, showSuccess, ToastLong, ToastShort} from "../util/ToastUtils";
import HttpUtils from "../util/http";
import native from "../../pubilc/util/native";
import tool from "../util/tool";
import colors from "../styles/colors";
import GlobalUtil from "../util/GlobalUtil";
import Entypo from "react-native-vector-icons/Entypo"
import {Button, Image} from "react-native-elements";
import BottomModal from "./BottomModal";
import {MixpanelInstance} from "../util/analytics";
import {call, locationIcon} from "../../svg/svg";
import {SvgXml} from "react-native-svg";

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
    comesBackBtn: PropType.bool,
  };
  state = {
    verification_modal: false,
    pickupCode: '',
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
    const self = this;
    showModal("请求中")
    tool.debounces(() => {
      const api = `/api/transfer_arrived/${order_id}?access_token=${this.props.accessToken}`
      HttpUtils.get.bind(self.props.navigation)(api, {
        orderId: this.props.item.id
      }).then(() => {
        showSuccess('操作成功')
        this.props.fetchData();
      }).catch(e => {
        ToastShort('操作失败' + e.desc)
      })
    }, 600)
  }

  onCallThirdShips = (order_id, store_id) => {
    this.onPress(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: order_id,
      storeId: store_id,
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

  toSetOrderComplete = (order_id) => {
    Alert.alert('确认将订单已送达', '订单置为已送达后无法撤回，是否继续？', [{
      text: '确认', onPress: () => {
        const api = `/api/complete_order/${order_id}?access_token=${this.props.accessToken}`
        HttpUtils.get(api).then(() => {
          ToastLong('订单已送达')
          this.props.fetchData()
          GlobalUtil.setOrderFresh(1)
        }).catch(() => {
          showError('置为送达失败')
        })
      }
    }, {text: '再想想'}])
  }

  dialNumber = (val) => {
    native.dialNumber(val)
  }

  clipBoard = (val) => {
    Clipboard.setString(val)
    ToastLong('已复制到剪切板')
  }

  loseDelivery = (val) => {
    this.mixpanel.track('订单列表页_忽略配送')
    Alert.alert('提醒', "忽略配送会造成平台配送信息回传不达标，建议我自己送", [{text: '取消'}, {
      text: '继续忽略配送',
      onPress: () => {
        this.onOverlookDelivery(val)
      }
    }])
  }

  closePickModal = () => {
    this.setState({
      verification_modal: false,
    })
  }

  goVeriFicationToShop = () => {
    let {item} = this.props;
    this.setState({verification_modal: false});
    let {pickupCode} = this.state
    const api = `/v1/new_api/orders/order_checkout/${item?.id}?access_token=${this.props.accessToken}&pick_up_code=${pickupCode}`;
    HttpUtils.get(api).then(() => {
      ToastShort(`核销成功，订单已完成`)
    }).catch((reason) => {
      ToastShort(`操作失败：${reason.reason}`)
    })
  }

  touchMobile = () => {
    let {item} = this.props;
    this.mixpanel.track('订单列表页_点击手机号')
    this.dialNumber(item.mobile)
  }

  touchLocation = () => {
    let {item} = this.props;
    this.mixpanel.track('订单列表页_点击位置')
    const path = '/AmapTrack.html?orderId=' + item.id + "&access_token=" + this.props.accessToken;
    this.onPress(Config.ROUTE_WEB, {url: Config.serverUrl(path)});
  }

  routeOrder = () => {
    let {item} = this.props;
    this.onPress(Config.ROUTE_ORDER_NEW, {orderId: item.id})
    this.mixpanel.track('订单详情页')
  }

  renderContent = () => {
    return (
      <View>
        <View style={{backgroundColor: 'red', height: 20}}>
          <Text>232342</Text>
        </View>
      </View>
    )
  }


  render() {
    let {item, showBtn} = this.props;
    return (
      <TouchableWithoutFeedback onPress={() => this.routeOrder()}>
        <View style={styles.ItemContent}>

          {this.renderItemHeader()}
          <View style={{padding: 12}}>
            {this.renderUser()}
            {this.renderGoods()}
            {this.renderDeliveryDesc()}
            {this.renderDelivery()}
          </View>
          <If condition={(Number(item.pickType) === 1 && item.orderStatus < 4)}>
            {this.renderVerificationBtn()}
          </If>

          <If condition={Number(item.pickType) !== 1 && showBtn}>
            {this.renderButton()}
          </If>

          {this.renderPickModal()}

        </View>

      </TouchableWithoutFeedback>
    )
  }


  renderPickModal = () => {
    let {verification_modal, pickupCode} = this.state;
    return (
      <BottomModal
        visible={verification_modal}
        modal_type={'bottom'}
        onPress={this.goVeriFicationToShop}
        title={'自提订单核销'}
        actionText={'确定'}
        btnStyle={{
          backgroundColor: colors.main_color,
          borderRadius: 24,
          length: 48,
        }}
        btnTitleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}
        onPressClose={() => this.closePickModal()}>
        <TextInput placeholder={"请输入核销码"}
                   onChangeText={(pickupCode) => {
                     this.setState({pickupCode})
                   }}
                   value={pickupCode}
                   placeholderTextColor={colors.color999}
                   style={styles.veriFicationInput}
                   underlineColorAndroid="transparent"/>
      </BottomModal>
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
        backgroundColor: colors.f9
      }}>

        <If condition={!item.is_right_once}>
          <View style={{
            position: 'absolute',
            left: 0,
            top: 0,
          }}>
            <View style={styles.ItemHeader}/>
            <Text style={styles.ItemHeaderTitle}>预 </Text>
          </View>
        </If>

        <Image source={{uri: item.platformIcon}}
               style={styles.platformIcon}/>


        <View style={{flex: 1, marginLeft: 10}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{
              fontSize: 16,
              fontWeight: '500',
              color: colors.color333,
              marginRight: 10
            }}>#{item.platform_dayId} </Text>
            <Text style={{
              fontSize: 12,
              color: '#FF8309'
            }}>{item.friendly_order_time} </Text>
            <Text style={{
              fontSize: 12,
              color: colors.color666,
            }}>下单 </Text>
          </View>
          <Text style={{
            color: colors.color666,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 2
          }}> {item.store_name}&nbsp; #{item.dayId} </Text>
        </View>
        <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>

      </View>
    )
  }


  renderVerificationBtn = () => {
    return (
      <View style={styles.btnContent}>
        <Button title={'门店核销'}
                onPress={() => this.closePickModal()}
                buttonStyle={styles.veriFicationBtn}
                titleStyle={{color: colors.white, fontSize: 16}}
        />
      </View>
    )
  }

  renderUser = () => {
    let {item} = this.props;
    return (
      <View style={styles.contentHeader}>
        <View style={{flex: 1}}>
          <Text style={styles.userNameText}> {item.userName} &nbsp;&nbsp;{item.mobile_readable} </Text>
          <Text style={{
            color: colors.color333,
            fontSize: 14,
            fontWeight: '500'
          }}> {tool.length((item.address || '')) > 16 ? item.address.substring(0, 15) + '...' : item.address} </Text>
        </View>

        <TouchableOpacity style={{paddingHorizontal: 10,}} onPress={() => this.touchLocation()}>
          <SvgXml xml={locationIcon()}/>
        </TouchableOpacity>

        <TouchableOpacity style={{paddingHorizontal: 10,}} onPress={() => {
          // this.touchMobile()
        }}>
          <SvgXml xml={call()}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderGoods = () => {
    let {item} = this.props;
    if (item?.goods_info?.count <= 0) {
      return null;
    }
    return (
      <TouchableOpacity onPress={() => {
      }} style={[styles.contentHeader, {paddingTop: 12}]}>
        <View style={{flex: 1}}>
          <Text style={{fontWeight: '500', fontSize: 14, color: colors.color333}}>商品 {item?.goods_info?.count} 件 </Text>
          <Text style={{
            fontSize: 12,
            color: colors.color666,
            marginTop: 4,
          }}>{item?.goods_info?.short_names} </Text>
        </View>
        <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>
      </TouchableOpacity>
    )
  }

  renderDeliveryDesc = () => {
    let {item} = this.props;
    return (
      <TouchableOpacity style={[styles.contentHeader, {paddingTop: 12}]}>
        <Text style={{flex: 1, fontSize: 14, color: colors.color666}}>[ 美团/顺丰/…4个配送 ] 下单成功 </Text>
        <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>
      </TouchableOpacity>
    )
  }


  renderDelivery = () => {
    let {item} = this.props;
    return (
      <TouchableOpacity style={[styles.contentHeader, {paddingTop: 12}]}>
        <View style={{flex: 1}}>
          <Text style={{fontWeight: '500', fontSize: 14, color: colors.color333}}>配送中 </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
            <Text style={{fontWeight: '500', fontSize: 14, color: colors.color333}}>美团跑腿 </Text>
            <Text style={{fontSize: 14, color: colors.color666}}>任志峰 &nbsp; 15011309110_400 </Text>
          </View>
        </View>
        <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>
      </TouchableOpacity>
    )
  }

  renderButton = () => {
    let {item} = this.props;
    let obj_num = 0
    if (this.props.comesBackBtn) {
      obj_num = 1
    } else {
      tool.objectMap(item?.btn_list, (item, idx) => {
        obj_num += item
      })
    }
    let btn_width = 0.90 / Number(obj_num)
    return (
      <View
        style={[styles.btnContent, item?.btn_list && item?.btn_list?.switch_batch_add_tips ? {flexWrap: "wrap"} : {}]}>

        <If condition={item?.btn_list && item?.btn_list?.btn_ignore_delivery}>
          <Button title={'忽略配送'}
                  onPress={() => this.loseDelivery(item.id)}
                  buttonStyle={[styles.modalBtn, {
                    borderColor: colors.colorCCC,
                    width: width * btn_width
                  }]}
                  titleStyle={{color: colors.colorCCC, fontSize: 16}}
          />
        </If>

        <If condition={item?.btn_list && item?.btn_list?.switch_batch_cancel_delivery_order}>
          <Button title={'取消配送'}
                  onPress={() => {
                    this.setState({showDeliveryModal: false})
                    this.cancelDeliverys(item.id)
                  }}
                  buttonStyle={[styles.modalBtn, {
                    borderColor: colors.color666,
                    width: width * btn_width
                  }]}
                  titleStyle={{color: colors.color666, fontSize: 16}}
          />
        </If>

        <If condition={item?.btn_list && item?.btn_list?.transfer_self}>
          <Button title={'我自己送'}
                  onPress={() => this.myselfSend(item)}
                  buttonStyle={[styles.modalBtn, {
                    borderColor: colors.main_color,
                    width: width * btn_width
                  }]}
                  titleStyle={{color: colors.main_color, fontSize: 16}}
          />
        </If>
        <If condition={item?.btn_list && item?.btn_list?.switch_batch_add_tips}>
          <Button title={'加小费'}
                  onPress={() => {
                    this.setState({showDeliveryModal: false})
                    this.mixpanel.track('订单列表页_加小费')
                  }}
                  buttonStyle={[styles.modalBtn, {
                    borderColor: colors.main_color,
                    width: width * btn_width
                  }]}
                  titleStyle={{color: colors.main_color, fontSize: 16}}
          />
        </If>
        <If condition={item?.btn_list && item?.btn_list?.btn_call_third_delivery}>
          <Button title={'呼叫配送'}
                  onPress={() => {
                    this.onCallThirdShips(item.id, item.store_id)
                    this.mixpanel.track('订单列表页_呼叫配送')
                  }}
                  buttonStyle={[styles.callDeliveryBtn, {
                    width: width * btn_width
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>
        <If condition={item?.btn_list && item?.btn_list?.btn_contact_rider}>
          <Button title={'联系骑手'}
                  onPress={() => this.dialNumber(item.ship_worker_mobile)}
                  buttonStyle={[styles.callDeliveryBtn, {
                    width: width * btn_width
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>
        <If condition={item?.btn_list && item?.btn_list?.btn_cancel_delivery}>
          <Button title={'取消配送'}
                  onPress={() => {
                    this.setState({showDeliveryModal: false})

                    Alert.alert('提示', `确定取消当前配送吗?`, [
                      {text: '取消'},
                      {
                        text: '确定', onPress: () => {
                          this.cancelDelivery(item.id)
                        }
                      }
                    ])
                  }}
                  buttonStyle={[styles.modalBtn, {
                    borderColor: colors.main_color,
                    width: width * btn_width
                  }]}
                  titleStyle={{color: colors.main_color, fontSize: 16}}
          />
        </If>
        <If condition={this.props.comesBackBtn !== undefined && this.props.comesBackBtn}>
          <Button title={'重新上传配送信息'}
                  onPress={() => {
                    this.mixpanel.track('配送回传详情页_重新上传')
                    this.setState({showDeliveryModal: false})
                    this.onAinSend(item.id, item.store_id, 1)
                  }}
                  buttonStyle={[styles.modalBtn, {
                    width: width * btn_width,
                    borderColor: colors.main_color,
                    backgroundColor: colors.main_color
                  }]}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>
        <If condition={item?.btn_list && item?.btn_list?.btn_confirm_arrived === 1}>
          <Button title={'确认送达'}
                  onPress={() => {
                    this.mixpanel.track('确认送达')
                    this.toSetOrderComplete(item.id)
                  }}
                  buttonStyle={[styles.modalBtn, {
                    width: width * btn_width,
                    borderColor: colors.main_color,
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
  ItemHeader: {
    width: 0,
    height: 0,
    borderTopWidth: 25,
    borderTopColor: "#FF8309",
    borderTopLeftRadius: 6,
    borderRightWidth: 31,
    borderRightColor: 'transparent',
  },
  ItemHeaderTitle: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '500',
    position: 'absolute',
    top: 1,
    left: 4,
  },
  platformIcon: {width: 40, height: 40, borderRadius: 24},
  humanExpectTime: {fontWeight: "bold", fontSize: 14, color: "#FF8854"},
  contentHeader: {
    paddingBottom: 12,
    borderBottomWidth: 0.5,
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
  },
});


export default connect(mapDispatchToProps)(OrderItem)
