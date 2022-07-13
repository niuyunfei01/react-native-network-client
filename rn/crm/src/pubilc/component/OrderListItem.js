import React from "react";
import PropTypes from "prop-types";
import PropType from "prop-types";
import Config from "../common/config";
import {bindActionCreators} from "redux";
import Tips from "../../scene/common/component/Tips";
import {
  Alert,
  Dimensions,
  InteractionManager,
  Modal,
  ScrollView,
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

import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../util/ToastUtils";
import pxToDp from "../util/pxToDp";
import HttpUtils from "../util/http";
import native from "../../pubilc/util/native";
import tool from "../util/tool";
import colors from "../styles/colors";
import GlobalUtil from "../util/GlobalUtil";
import LinearGradient from 'react-native-linear-gradient'
import Entypo from "react-native-vector-icons/Entypo"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import {Button, Image} from "react-native-elements";
import BottomModal from "./BottomModal";
import {Input} from "../../weui";
import {MixpanelInstance} from "../util/analytics";

let width = Dimensions.get("window").width;

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      addTipMoney, orderCallShip, cancelShip, cancelReasonsList, addTipMoneyNew
    }, dispatch)
  }
}

class OrderListItem extends React.PureComponent {
  static propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    showBtn: PropTypes.bool,
    onPress: PropTypes.func,
    onRefresh: PropTypes.func,
    fetchData: PropType.func,
    orderStatus: PropType.number,
    order: PropType.object,
    onItemClick: PropTypes.func,
    setState: PropType.func
  };
  state = {
    modalTip: false,
    addTipModal: false,
    addMoneyNum: '',
    veriFicationToShop: false,
    pickupCode: '',
    respReason: '',
    order_id: "",
    store_id: "",
    showDeliveryModal: false,
    delivery_list: [],
    delivery_btn: [],
    if_reship: 0,
    ok: true,
    is_merchant_add_tip: 0,
    toastContext: ''
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

  fetchShipData = (item) => {
    tool.debounces(() => {
      //保存参数 作为Tips的传参
      // this.state.order_id = item.id;
      // this.state.store_id = item.store_id;
      showModal('加载中...')
      const api = `/v1/new_api/orders/third_deliverie_record/${this.props.item.id}?access_token=${this.props.accessToken}`;
      HttpUtils.get.bind(this.props)(api).then(res => {
        hideModal()
        if (tool.length(res.delivery_lists)) {
          this.setState({
            showDeliveryModal: true,
            delivery_list: res.delivery_lists,
            if_reship: res.delivery_btns.if_reship,
            delivery_btn: res.delivery_btns,
            is_merchant_add_tip: res.is_merchant_add_tip,
            order_id: item.id,
            store_id: item.store_id
          })
        } else {
          ToastShort('暂无数据')
        }
      }).catch((obj) => {
        ToastShort(`操作失败：${obj.reason}`)
      })
      this.setState({
        order_id: item.id,
        store_id: item.store_id
      })
    }, 600)
    this.mixpanel.track("配送页")
  }

  onCallSelf = () => {
    Alert.alert('提醒', '取消专送和第三方配送呼叫，\n' + '\n' + '才能发【自己配送】\n' + '\n' + '确定自己配送吗？', [
      {
        text: '确定',
        onPress: () => {
          this.onTransferSelf()
        },
      }, {
        text: '取消'
      }
    ])
  }

  onTransferSelf = () => {
    const api = `/api/order_transfer_self?access_token=${this.props.accessToken}`
    HttpUtils.get.bind(this.props.navigation)(api, {
      orderId: this.props.item.id
    }).then(res => {
      ToastShort('操作成功');
      this.props.fetchData();
    }).catch(e => {
      ToastLong('操作失败:' + e.desc);
    })
  }

  onChangeAccount = (text) => {
    this.setState({...this.state, addMoneyNum: text.toString()})
  }

  onStopSchedulingTo = () => {
    Alert.alert('提醒', '确定要暂停吗？', [
      {
        text: '确定',
        onPress: () => {
          this.onStopScheduling()
        },
      }, {
        text: '取消'
      }
    ])
  }

  onStopScheduling = () => {
    const self = this;
    const api = `/api/stop_auto_ship?access_token=${this.props.accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api, {
      orderId: this.props.item.id
    }).then(res => {
      ToastShort('操作成功');
      this.setState({showDeliveryModal: false})
    }).catch(e => {
      ToastLong('操作失败')
    })
  }

  upAddTip = () => {
    let {addMoneyNum, shipId} = this.state;
    const accessToken = this.props.accessToken;
    const {dispatch} = this.props;
    if (addMoneyNum > 0) {
      dispatch(addTipMoneyNew(shipId, addMoneyNum, accessToken, async (resp) => {
        if (resp.ok) {
          this.setState({addTipModal: false, respReason: '加小费成功'})
          ToastShort(resp.reason)
        } else {
          this.setState({respReason: resp.desc, ok: resp.ok})
        }
        await this.setState({addMoneyNum: ''});
      }));
    } else {
      this.setState({addMoneyNum: '', respReason: '加小费的金额必须大于0', ok: false});
    }
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

  cancelPlanDelivery = (order_id, planId) => {
    tool.debounces(() => {
      let api = `/v1/new_api/orders/cancel_delivery_plan/${order_id}/${planId}`;
      HttpUtils.get(api).then(success => {
        ToastShort(`取消预约成功`)
        this.fetchData()
      }).catch((reason) => {
        ToastShort(`${reason.reason}`)
      })
    }, 600)
  }

  onCallThirdShips = (order_id, store_id, if_reship) => {
    this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
      orderId: order_id,
      storeId: store_id,
      selectedWay: [],
      if_reship: if_reship,
      onBack: (res) => {
        if (res && res.count >= 0) {
          ToastShort('发配送成功')
        } else {
          ToastShort('发配送失败，请联系运营人员')
        }
      }
    });
  }

  onClickTimes = (item) => {
    let searchTerm = `@@${item['real_mobile']}|||store:${item['store_id']}`
    const {navigation} = this.props
    navigation.navigate(Config.ROUTE_ORDER_SEARCH_RESULT, {term: searchTerm, max_past_day: 10000})
  }

  goVeriFicationToShop = (id) => {
    let {pickupCode} = this.state
    const api = `/v1/new_api/orders/order_checkout/${id}?access_token=${this.props.accessToken}&pick_up_code=${pickupCode}`;
    HttpUtils.get(api).then(success => {
      ToastShort(`核销成功，订单已完成`)
    }).catch((reason) => {
      ToastShort(`操作失败：${reason.reason}`)
    })
  }

  onAinSend = (order_id, store_id) => {
    this.props.navigation.navigate(Config.ROUTE_ORDER_AIN_SEND, {
      orderId: order_id,
      storeId: store_id,
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

  hideModalTip = () => {
    this.setState({
      modalTip: false
    })
  }

  openModalTipChangeInfo = (storeId, id) => {
    this.setState({
      modalTip: true,
      addTipModal: false,
      store_id: storeId,
      order_id: id
    })
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

  openVeriFicationToShop = () => {
    this.setState({
      veriFicationToShop: true
    })
  }

  closePickModal = () => {
    this.setState({
      veriFicationToShop: false,
    })
  }

  closeAddTipModal = () => {
    this.setState({
      addTipModal: false
    })
  }

  closeDeliveryModal = () => {
    this.setState({showDeliveryModal: false})
  }

  onCanceled = (val) => {
    this.setState({showDeliveryModal: false})
    this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
      {
        order: this.state.order,
        ship_id: val,
        onCancelled: (ok, reason) => {
          this.fetchData()
        }
      });
  }

  cancelPlan = (val) => {
    let {order_id} = this.state
    this.setState({showDeliveryModal: false})
    Alert.alert('提醒', "确定取消预约发单吗", [{text: '取消'}, {
      text: '确定',
      onPress: () => {
        this.cancelPlanDelivery(order_id, val)
      }
    }])
  }

  toComplan = (val) => {
    this.setState({showDeliveryModal: false})
    this.onPress(Config.ROUTE_COMPLAIN, {id: val})
  }

  catLocation = (val) => {
    this.setState({showDeliveryModal: false})
    const accessToken = this.props.accessToken
    let path = '/rider_tracks.html?delivery_id=' + val + "&access_token=" + accessToken;
    const uri = Config.serverUrl(path);
    this.onPress(Config.ROUTE_WEB, {url: uri});
    this.mixpanel.track('查看位置')
  }

  goAddTip = (val) => {
    this.setState({
      addTipModal: true,
      modalTip: false,
      showDeliveryModal: false,
      shipId: val
    })
  }

  onCallThirdShipsAgain = () => {
    let {order_id, store_id} = this.state
    this.setState({showDeliveryModal: false})
    this.onCallThirdShips(order_id, store_id, 1)
  }

  onMineSendDelivery = () => {
    let {order_id, store_id} = this.state
    this.setState({showDeliveryModal: false})
    this.onAinSend(order_id, store_id)
  }

  stopSchecduling = () => {
    this.setState({showDeliveryModal: false})
    this.onStopSchedulingTo()
  }

  callSelfAgain = () => {
    let {order_id, store_id} = this.state
    this.setState({showDeliveryModal: false})
    this.onCallThirdShips(order_id, store_id, 0)
  }

  cancelDelivery = (val) => {
    const token = this.props.accessToken
    let orderId = val
    const api = `/api/pre_cancel_order?access_token=${token}`;
    let params = {
      order_id: orderId
    }
    let order = this.props.item
    HttpUtils.get.bind(this.props)(api, params).then(res => {
      if (res.deduct_fee < 0) {
        Alert.alert('提示', `该订单已有骑手接单，如需取消配送可能会扣除相应违约金`, [{
          text: '确定', onPress: () => {
            this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
                {
                  order: order,
                  ship_id: 0,
                  onCancelled: (ok, reason) => {
                    this.fetchData()
                  }
                });
          }
        }, {'text': '取消'}]);
      } else if (res.deduct_fee == 0) {
        this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
            {
              order: order,
              ship_id: 0,
              onCancelled: (ok, reason) => {
                this.fetchData()
              }
            });
      } else {
        this.setState({
          toastContext: res.deduct_fee
        }, () => {
          Alert.alert('提示', `该订单已有骑手接单，如需取消配送会扣除相应违约金${this.state.toastContext}元`, [{
            text: '确定', onPress: () => {
              this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
                  {
                    order: order,
                    ship_id: 0,
                    onCancelled: (ok, reason) => {
                      this.fetchData()
                    }
                  });
            }
          }, {'text': '取消'}]);
        })
      }
    }).catch(e => {
      showError(`${e.reason}`)
    })
  }

  render() {
    return (
      <View>
        <Tips navigation={this.props.navigation} orderId={this.state.order_id}
              storeId={this.state.store_id} key={this.state.order_id} modalTip={this.state.modalTip}
              onItemClick={() => this.hideModalTip()}/>
        {this.renderItem()}
        {this.renderPickModal()}
        {this.renderDeliveryModal()}
      </View>
    );
  }

  renderItemHeader = () => {
    let {item} = this.props;
    return (
      <View style={styles.flexColumn}>
        <If condition={item.is_right_once}>
          <View style={styles.ItemHeader}/>
          <Text style={styles.ItemHeaderTitle}>预 </Text>
        </If>
        <If condition={item.pickType === "1"}>
          <View style={styles.pickType1}>
            <Text style={styles.pickType1Text}>到店自提 </Text>
          </View>
        </If>

        <View style={[styles.ItemHeaderInfo, {top: item.pickType !== "1" ? 10 : 24}]}>
          <Image source={{uri: item.platformIcon}}
                 style={styles.platformIcon}/>
          <View style={styles.platformId}>
            {/*<Text style={[styles.platformText, {marginLeft: 10, fontSize: 16}]}># </Text>*/}
            <Text style={[styles.platformText, {marginLeft: 10, fontSize: 24}]}>{item.platform_dayId} </Text>
            <Text style={styles.platformDayId}>总#{item.dayId} </Text>
            <If condition={Number(item.orderStatus) === 5}>
              <Text style={styles.orderCancelDesc}>订单已取消 </Text>
            </If>
          </View>
        </View>

        <If condition={item.pickType !== "1"}>
          <View style={{flexDirection: 'row', marginTop: item.is_right_once ? 10 : 50, marginLeft: 26}}>
            <Text style={styles.pickTypeText}> 预计 </Text>
            <Text style={styles.humanExpectTime}> {item.humanExpectTime} </Text>
            <Text style={styles.pickTypeText}> 前送达 </Text>
          </View>
        </If>

      </View>
    )
  }

  touchMobile = (item) => {
    this.mixpanel.track('订单列表页_点击手机号')
    this.dialNumber(item.mobile)
  }
  touchLocation = (item) => {
    this.mixpanel.track('订单列表页_点击位置')
    const path = '/AmapTrack.html?orderId=' + item.id + "&access_token=" + this.props.accessToken;
    this.onPress(Config.ROUTE_WEB, {url: Config.serverUrl(path)});
  }
  renderUser = () => {
    let {item} = this.props;
    return (
      <View style={styles.contentHeader}>
        <View style={styles.flexRowAlignCenter}>
          <View style={{width: width * 0.65}}>
            <Text style={styles.userNameText}> {item.userName}-{item.mobileReadable} </Text>
            <View style={styles.orderTimeBox}>
              <Text onPress={() => this.onClickTimes(item)}
                    style={styles.orderTimeText}>
                {item.order_times <= 1 ? '新客户' : `第${item.order_times}次`} </Text>
            </View>
          </View>
          <FontAwesome5 solid={false} onPress={() => this.touchMobile(item)} name={'phone-alt'}
                        style={styles.mobileIcon}/>
          <FontAwesome5 solid={false} onPress={() => this.touchLocation(item)} name={'map-marker-alt'}
                        style={styles.locationIcon}/>
        </View>
        <Text style={styles.userAddressText}>
          {item.address}
        </Text>
      </View>
    )
  }

  renderOrderInfo = () => {
    let {item} = this.props;
    return (
      <View style={styles.contentHeader}>
        <If condition={item.show_store_name}>
          <View style={styles.orderInfoContent}>
            <Text style={styles.orderInfoStoreName}>店铺名称 </Text>
            <Text style={styles.orderInfoStoreNameText}>{item.show_store_name}</Text>
          </View>
        </If>

        <If condition={item.orderTimeInList}>
          <View style={styles.orderTimeList}>
            <Text style={styles.orderTimeLabel}>下单时间 </Text>
            <Text style={styles.orderTimeValue}>{item.orderTimeInList}</Text>
          </View>
        </If>

        {/*<View style={{flexDirection: 'row', marginTop: 14}}>*/}
        {/*  <Text style={{fontSize: 14, color: colors.color333, width: width * 0.24}}>订单号 </Text>*/}
        {/*  <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>{item.id} </Text>*/}
        {/*  <Text onPress={() => {*/}
        {/*    Clipboard.setString(item.id)*/}
        {/*    ToastLong('已复制到剪切板')*/}
        {/*  }} style={{*/}
        {/*    fontSize: 14,*/}
        {/*    color: colors.main_color,*/}
        {/*    marginRight: 14,*/}
        {/*  }}>复制</Text>*/}
        {/*</View>*/}

        <View style={[{alignItems: 'center'}, styles.orderTimeList]}>
          <Text style={styles.orderTimeLabel}>平台单号 </Text>
          <Text style={[{flex: 1}, styles.orderTimeValue]}>{item.platform_oid} </Text>
          <Text onPress={() => this.clipBoard(item.platform_oid)} style={styles.copyText}>复制 </Text>
        </View>

        <TouchableOpacity style={[{alignItems: 'center'}, styles.orderTimeList]}
                          onPress={() => this.touchOrderInfoDetail(item)}>
          <Text style={styles.orderTimeLabel}>{item.moneyLabel} </Text>
          <Text style={[styles.orderTimeValue, {flex: 1, fontWeight: 'bold'}]}>¥{item.moneyInList} </Text>
          <Text style={styles.mainText}>详情 </Text>
          <Entypo name='chevron-thin-right' style={styles.mainText}/>
        </TouchableOpacity>

      </View>
    )
  }

  touchOrderInfoDetail = (item) => {
    this.mixpanel.track('点击详情')
    this.onPress(Config.ROUTE_ORDER, {orderId: item.id})
  }

  touchShipDetail = (item) => {
    this.mixpanel.track('查看配送详情')
    this.fetchShipData(item)
  }

  renderDeliveryInfo = () => {
    let {item} = this.props;
    return (
      <TouchableOpacity onPress={() => this.touchShipDetail(item)} style={styles.contentHeader1}>
        <View style={[{alignItems: 'center'}, styles.orderInfoContent]}>
          <Text style={[styles.orderTimeValue, {flex: 1, fontWeight: 'bold'}]}>配送状态 </Text>
          <Text style={styles.mainText}>查看配送详情 </Text>
          <Entypo name='chevron-thin-right' style={styles.mainText}/>
        </View>
        <Text style={styles.deliveryShipStatus}>
          {item.shipStatusText}
        </Text>
      </TouchableOpacity>
    )
  }

  myselfSend = (item) => {
    this.setState({showDeliveryModal: false})
    this.onAinSend(item.id, item.store_id)
    this.mixpanel.track('订单列表页_我自己送')
  }
  renderButton = () => {
    let {item, orderStatus} = this.props;
    return (
      <View style={styles.btnContent}>

        <If condition={orderStatus === 9 && this.props.showBtn}>
          <Button title={'忽略配送'}
                  onPress={() => this.loseDelivery(item.id)}
                  buttonStyle={[styles.modalBtn, {borderColor: colors.colorCCC}]}
                  titleStyle={{color: colors.colorCCC, fontSize: 16}}
          />
          <Button title={'我自己送'}
                  onPress={() => this.myselfSend(item)}
                  buttonStyle={[styles.modalBtn, {borderColor: colors.main_color}]}
                  titleStyle={{color: colors.main_color, fontSize: 16}}
          />
          <Button title={'呼叫配送'}
                  onPress={() => {
                    this.onCallThirdShips(item.id, item.store_id)
                    this.mixpanel.track('订单列表页_呼叫配送')
                  }}
                  buttonStyle={styles.callDeliveryBtn}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>
        <If condition={(Number(orderStatus) === 10 || Number(orderStatus) === 8) && this.props.showBtn}>
          <Button title={'呼叫配送'}
                  onPress={() => {
                    this.onCallThirdShips(item.id, item.store_id)
                  }}
                  buttonStyle={styles.callDeliveryBtn}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
          <Button title={'我自己送'}
                  onPress={() => {
                    this.setState({showDeliveryModal: false})
                    this.onAinSend(item.id, item.store_id)
                  }}
                  buttonStyle={[styles.modalBtn, {borderColor: colors.main_color}]}
                  titleStyle={{color: colors.main_color, fontSize: 16}}
          />
        </If>
        <If condition={(Number(orderStatus) === 2 || Number(orderStatus) === 3) && this.props.showBtn}>
          <Button title={'联系骑手'}
                  onPress={() => this.dialNumber(item.ship_worker_mobile)}
                  buttonStyle={styles.callDeliveryBtn}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
          <Button title={'取消配送'}
                  onPress={() => {
                    this.setState({showDeliveryModal: false})
                    this.cancelDelivery(item.id)
                  }}
                  buttonStyle={[styles.modalBtn, {borderColor: colors.main_color}]}
                  titleStyle={{color: colors.main_color, fontSize: 16}}
          />
        </If>
        <If condition={item.pickType === "1" && item.orderStatus < 4}>
          <View style={{flex: 1}}/>
          <Button title={'到店核销'}
                  onPress={() => this.openVeriFicationToShop()}
                  buttonStyle={styles.veriFicationBtn}
                  titleStyle={{color: colors.white, fontSize: 16}}
          />
        </If>
      </View>
    )
  }

  routeOrder = (item) => {
    this.onPress(Config.ROUTE_ORDER, {orderId: item.id})
    this.mixpanel.track('订单详情页')
  }

  renderItem = () => {
    let {item} = this.props;
    return (
      <TouchableWithoutFeedback onPress={() => this.routeOrder(item)}>
        <View style={styles.ItemContent}>
          <LinearGradient style={styles.ItemHeaderLinear}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          colors={item.pickType === "1" ? ['#F7FFFE', '#D0EDFF'] : ['#FFFAF7', '#FFE4D0']}>
            {this.renderItemHeader()}
          </LinearGradient>
          {this.renderUser()}
          {this.renderOrderInfo()}
          {this.renderDeliveryInfo()}
          {(Number(item.pickType) === 1 && item.orderStatus < 4) || this.props.showBtn ? this.renderButton() : null}
          <If condition={this.props.orderStatus === 10}>
            <TouchableOpacity
              onPress={() => this.openModalTipChangeInfo(item.store_id, item.id)} style={styles.noRunMan}>
              <Entypo name='help-with-circle' style={styles.helpIcon}/>
              <Text style={styles.helpText}>长时间没有骑手接单怎么办？</Text>
            </TouchableOpacity>
          </If>
        </View>

      </TouchableWithoutFeedback>
    )
  }

  renderPickModal = () => {
    let {item} = this.props;
    return (
      <BottomModal
        visible={this.state.veriFicationToShop}
        modal_type={'center'}
        onPress={async () => {
          await this.setState({veriFicationToShop: false});
          this.goVeriFicationToShop(item.id)
        }}
        title={'到店核销'}
        actionText={'确定'}
        closeText={'取消'}
        onClose={() => this.closePickModal()}>
        <TextInput placeholder={"请输入取货码"}
                   onChangeText={(pickupCode) => {
                     this.setState({pickupCode})
                   }}
                   value={this.state.pickupCode}
                   placeholderTextColor={'#ccc'}
                   style={styles.veriFicationInput}
                   underlineColorAndroid="transparent"/>
      </BottomModal>
    )
  }

  renderAddTipModal = () => {
    let {is_merchant_add_tip} = this.state
    const tipListTop = [
      {label: '1元', value: 1},
      {label: '2元', value: 2},
      {label: '3元', value: 3}
    ]
    const tipListBottom = [
      {label: '4元', value: 4},
      {label: '5元', value: 5},
      {label: '10元', value: 10}
    ]
    return (
      <Modal
        visible={this.state.addTipModal}
        onRequestClose={() => this.closeAddTipModal()}
        animationType={'slide'}
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.container]}>
            <TouchableOpacity onPress={() => this.closeAddTipModal()} style={styles.addTipRightIcon}>
              <Entypo name={"circle-with-cross"}
                      style={styles.addTipRightIconStyle}/>
            </TouchableOpacity>
            <Text style={styles.addTipTitleText}>加小费</Text>
            <Text style={styles.addTipTitleDesc}>多次添加以累计金额为主，最低一元</Text>
            <If condition={is_merchant_add_tip === 1}>
              <Text style={styles.addTipTitleTextRemind}>小费金额商家和外送帮各承担一半，在订单结算时扣除小费</Text>
            </If>
            <View style={[styles.container1]}>
              <Text style={styles.f26}>金额</Text>
              <View style={styles.tipSelect}>
                <For index='i' each='info' of={tipListTop}>
                  <Text key={i} style={styles.amountBtn} onPress={() => {
                    this.onChangeAccount(info.value)
                  }}>
                    {info.label}
                  </Text>
                </For>
              </View>
              <View style={styles.tipSelect}>
                <For index='i' each='info' of={tipListBottom}>
                  <Text key={i} style={styles.amountBtn} onPress={() => {
                    this.onChangeAccount(info.value)
                  }}>{info.label}</Text>
                </For>
              </View>
              <View style={styles.addTipInputBox}>
                <Input
                  style={styles.addTipInput}
                  placeholder={'请输入其他金额'}
                  defaultValue={`${this.state.addMoneyNum}`}
                  keyboardType='numeric'
                  onChangeText={(value) =>
                    this.onChangeAccount(value)
                  }
                />
                <Text style={styles.addTipInputRight}>元</Text>
              </View>
              <If condition={!this.state.ok || this.state.addMoneyNum === 0}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
                  <Entypo name={"help-with-circle"}
                          style={styles.addTipHelpIcon}/>
                  <Text style={styles.addTipReason}>{this.state.respReason}</Text>
                </View>
              </If>
            </View>
            <View style={styles.btn1}>
              <View style={styles.flex1}>
                <TouchableOpacity style={styles.marginH10} onPress={() => this.closeAddTipModal()}>
                  <Text style={styles.btnText2}>取消</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.flex1}>
                <TouchableOpacity style={styles.marginH10} onPress={() => this.upAddTip()}>
                  <Text style={styles.btnText}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  renderDeliveryModal = () => {
    let {delivery_btn} = this.state
    let height = tool.length(this.state.delivery_list) >= 3 ? pxToDp(800) : tool.length(this.state.delivery_list) * 250;
    if (tool.length(this.state.delivery_list) < 2) {
      height = 400;
    }
    return (
      <View>
        {this.renderAddTipModal()}

        <Modal visible={this.state.showDeliveryModal} hardwareAccelerated={true}
               onRequestClose={() => this.closeDeliveryModal()}
               transparent={true}>
          <View style={{flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.25)',}}>
            <TouchableOpacity style={{flex: 1}} onPress={() => this.closeDeliveryModal()}/>
            <View style={[styles.deliveryModalContent, {height: height}]}>
              <View style={{flexDirection: 'row'}}>
                <Text onPress={() => {
                  this.onPress(Config.ROUTE_STORE_STATUS)
                  this.closeDeliveryModal()
                }} style={styles.deliveryModalTitle}>呼叫配送规则</Text>
                <View style={{flex: 1}}/>
                <TouchableOpacity onPress={() => this.closeDeliveryModal()}>
                  <Entypo name={'cross'} style={{fontSize: pxToDp(50), color: colors.fontColor}}/>
                </TouchableOpacity>
              </View>

              <ScrollView
                overScrollMode="always"
                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}>

                <View style={{padding: pxToDp(20)}}>
                  <For each="info" index="i" of={this.state.delivery_list}>
                    <View key={i} style={styles.deliveryItem}>
                      <TouchableOpacity onPress={() => {
                        let arr = [...this.state.delivery_list]
                        arr[i].default_show = !arr[i].default_show
                        this.props.setState({
                          delivery_list: arr
                        })
                      }} style={{flexDirection: 'row'}}>
                        <Text style={[{color: info.desc_color ? info.desc_color : 'black'}, styles.textBold]}>
                          {info.desc} -
                        </Text>
                        <Text style={[{color: info.content_color}, styles.textBold]}>
                          {info.status_content}{info.plan_id === 0 ? ` - ${info.fee} 元` : ''}
                        </Text>
                        <View style={{flex: 1}}/>
                        {!info.default_show ? <Entypo name='chevron-thin-right' style={styles.f14}/> :
                          <Entypo name='chevron-thin-up' style={styles.f14}/>}
                      </TouchableOpacity>
                      <View style={{marginVertical: 12, flexDirection: 'row'}}>
                        <Text style={styles.productWeight}> 商品重量-{info.weight}kg </Text>
                        <If condition={info.fee_tip > 0}>
                          <Text style={styles.productWeight}>
                            小费：{info.fee_tip}元
                          </Text>
                        </If>
                      </View>

                      <View style={styles.driverContent}>
                        <Text style={styles.driverText}>{info.content} {info.driver_phone} {info.ext_num}  </Text>
                      </View>
                      <View style={styles.btnList}>
                        <If condition={info.btn_lists.can_cancel === 1}>
                          <Button title={'撤回呼叫'}
                                  onPress={() => this.onCanceled(info.ship_id)}
                                  buttonStyle={styles.onCanceledBtn}
                                  titleStyle={styles.btnTitleText}/>
                        </If>
                        <If condition={info.btn_lists.can_cancel_plan === 1}>
                          <Button title={'取消预约'}
                                  onPress={() => this.cancelPlan(info.plan_id)}
                                  buttonStyle={styles.onCanceledBtn}
                                  titleStyle={styles.btnTitleText}
                          />
                        </If>
                        <If condition={info.btn_lists.can_complaint === 1}>
                          <Button title={'投诉骑手'}
                                  onPress={() => this.toComplan(info.ship_id)}
                                  buttonStyle={styles.onCanceledBtn}
                                  titleStyle={styles.btnTitleText}
                          />
                        </If>
                        <If condition={info.btn_lists.can_view_position === 1}>
                          <Button title={'查看位置'}
                                  onPress={() => {
                                    this.catLocation(info.ship_id)
                                  }}
                                  buttonStyle={styles.catLocationBtn}
                                  titleStyle={styles.catLocationText}
                          />
                        </If>
                        <If condition={info.btn_lists.add_tip === 1}>
                          <Button title={'加小费'}
                                  onPress={() => this.goAddTip(info.ship_id)}
                                  buttonStyle={styles.addTipBtn}
                                  titleStyle={styles.addTipBtnText}/>
                        </If>
                        <If condition={info.btn_lists.can_call === 1}>
                          <Button title={'联系骑手'}
                                  onPress={() => this.dialNumber(info.driver_phone)}
                                  buttonStyle={styles.addTipBtn}
                                  titleStyle={styles.addTipBtnText}/>
                        </If>
                      </View>
                    </View>
                  </For>
                  <View style={styles.deliveryModalBottomBtn}>
                    <If condition={delivery_btn.if_reship === 1}>
                      <Button title={'补送'}
                              onPress={() => this.onCallThirdShipsAgain()}
                              buttonStyle={styles.addTipBtn}
                              titleStyle={styles.addTipBtnText}
                      />
                    </If>
                    <If condition={delivery_btn.self_ship === 1}>
                      <Button title={'我自己送'}
                              onPress={() => this.onMineSendDelivery()}
                              buttonStyle={styles.addTipBtn}
                              titleStyle={styles.addTipBtnText}
                      />
                    </If>
                    <If condition={delivery_btn.stop_auto_ship === 1}>
                      <Button title={'暂停调度'}
                              onPress={() => this.stopSchecduling()}
                              buttonStyle={styles.addTipBtn}
                              titleStyle={styles.addTipBtnText}
                      />
                    </If>
                    <If condition={delivery_btn.call_ship === 1}>
                      <Button title={'追加配送'}
                              onPress={() => this.callSelfAgain()}
                              buttonStyle={styles.addTipBtn}
                              titleStyle={styles.addTipBtnText}
                      />
                    </If>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    )
  }

  renderDeliveryStatus = (list) => {
    return (
      <View>
        <For each="log" index="i" of={list}>
          <View key={i} style={styles.deliveryStatusContent}>
            <View style={{width: 30}}>
              <View style={[styles.deliveryStatusHeader, {backgroundColor: log.status_color,}]}>
                <If condition={i !== 0}>
                  <View style={[styles.deliveryStatusTitleBottom, {backgroundColor: log.status_color}]}/>
                </If>
                <If condition={i !== list.length - 1}>
                  <View style={[styles.deliveryStatusTitleTop, {backgroundColor: log.status_color}]}/>
                </If>
              </View>
            </View>
            <View style={{width: '90%'}}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{color: log.status_desc_color, fontSize: 12}}>{log.status_desc}  </Text>
                <View style={{flex: 1}}></View>
                <Text style={{color: log.lists[0].content_color, fontSize: 12}}>{log.lists[0].content}  </Text>
              </View>
              <Text style={{color: log.lists[0].desc_color, fontSize: 10, marginTop: pxToDp(10)}}>
                {log.lists[0].desc} {log.lists[0].ext_num}
              </Text>
            </View>
          </View>
        </For>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  flexColumn: {flexDirection: 'column'},
  flexRowAlignCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputStyle: {
    borderWidth: pxToDp(1),
    borderRadius: pxToDp(10),
    paddingLeft: pxToDp(30)
  },
  ItemHeader: {
    width: 0,
    height: 0,
    borderTopWidth: 42,
    borderTopColor: "#f98754",
    borderRightWidth: 40,
    borderRightColor: 'transparent',
  },
  ItemHeaderTitle: {
    color: colors.white,
    position: 'absolute',
    top: 1,
    left: 1,
    fontSize: 18
  },
  ItemHeaderInfo: {
    position: 'absolute',
    left: 26,
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {width: 36, height: 36, borderRadius: 18},
  platformId: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  platformText: {fontWeight: 'bold', color: colors.color333},
  platformDayId: {fontSize: 14, color: colors.color333, marginLeft: 10},
  orderCancelDesc: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#F21F1F",
    position: 'absolute',
    left: width * 0.46
  },
  pickTypeText: {fontWeight: "bold", fontSize: 14, color: colors.color333},
  humanExpectTime: {fontWeight: "bold", fontSize: 14, color: "#FF8854"},
  pickType1: {
    backgroundColor: "#3CABFF",
    borderBottomRightRadius: 8,
    width: 66,
    height: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickType1Text: {
    color: colors.white,
    fontSize: 14,
  },
  contentHeader: {
    paddingVertical: 10,
    marginHorizontal: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: colors.colorEEE
  },
  contentHeader1: {
    paddingVertical: 10,
    marginHorizontal: 12,
    paddingHorizontal: 4,
  },
  orderInfoContent: {flexDirection: "row", marginTop: 4},
  orderInfoStoreName: {fontSize: 14, color: colors.color333, width: width * 0.24},
  orderInfoStoreNameText: {fontSize: 14, color: colors.color333},
  orderTimeList: {flexDirection: "row", marginTop: 14},
  orderTimeLabel: {fontSize: 14, color: colors.color333, width: width * 0.24},
  orderTimeValue: {fontSize: 14, color: colors.color333},
  copyText: {
    fontSize: 14,
    color: colors.main_color,
    marginRight: 14,
  },
  mainText: {
    fontSize: 14,
    color: colors.main_color,
  },
  deliveryShipStatus: {fontSize: 14, color: colors.color666, marginTop: 10},
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.color333,
    marginTop: 2,
    marginBottom: 13
  },
  orderTimeBox: {
    width: width * 0.18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.main_color,
    borderRadius: 2,
    height: 16,
  },
  orderTimeText: {color: colors.white, fontSize: 10},
  mobileIcon: {width: width * 0.125, fontSize: 25, color: colors.main_color},
  locationIcon: {fontSize: 28, color: colors.main_color},
  userAddressText: {fontSize: 14, color: colors.color666, marginTop: 10},
  btnContent: {
    paddingVertical: 10,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: colors.colorEEE
  },
  modalBtn: {
    borderRadius: 2,
    paddingVertical: 7,
    backgroundColor: colors.white,
    borderWidth: 1
  },
  callDeliveryBtn: {
    borderRadius: 2,
    paddingVertical: 7,
    backgroundColor: colors.main_color,
  },
  veriFicationBtn: {
    borderRadius: 2,
    paddingVertical: 7,
    backgroundColor: colors.main_color,
    marginRight: 10
  },
  ItemContent: {
    flexDirection: "column",
    backgroundColor: colors.white,
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 6,
  },
  ItemHeaderLinear: {
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    width: "100%",
    height: 74,
  },
  noRunMan: {
    paddingVertical: 10,
    marginHorizontal: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.colorEEE
  },
  helpIcon: {
    fontSize: 20,
    color: colors.main_color,
  },
  helpText: {
    marginLeft: 10,
    color: colors.color333,
    lineHeight: pxToDp(40)
  },
  veriFicationInput: {
    color: colors.color333,
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#999',
    fontSize: 16,
    height: pxToDp(90),
    borderWidth: pxToDp(1),
    borderRadius: pxToDp(10),
    marginVertical: 20,
  },
  addTipText: {fontWeight: "bold", fontSize: pxToDp(32)},
  addTipDesc: {
    fontSize: pxToDp(26),
    color: colors.color333,
    marginVertical: pxToDp(15)
  },
  addTipDesc1: {
    fontSize: pxToDp(22),
    color: '#F32B2B',
    marginVertical: pxToDp(10)
  },
  accountList: {flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(15)},
  addTipRightIcon: {
    position: "absolute", right: "3%", top: "3%"
  },
  addTipRightIconStyle: {fontSize: pxToDp(45), color: colors.color666},
  addTipTitleText: {fontWeight: "bold", fontSize: pxToDp(32)},
  addTipTitleDesc: {
    fontSize: pxToDp(26),
    color: colors.color333,
    marginVertical: pxToDp(15)
  },
  addTipTitleTextRemind: {
    fontSize: pxToDp(22),
    color: '#F32B2B',
    marginVertical: pxToDp(10)
  },
  addTipInputBox: {alignItems: "center", marginTop: pxToDp(30)},
  addTipInput: {
    fontSize: pxToDp(24),
    borderWidth: pxToDp(1),
    paddingLeft: pxToDp(15),
    width: "100%",
    height: "40%"
  },
  addTipInputRight: {
    fontSize: pxToDp(26),
    position: "absolute",
    top: "25%",
    right: "5%"
  },
  addTipHelpIcon: {
    fontSize: pxToDp(35),
    color: colors.warn_red,
    marginHorizontal: pxToDp(10)
  },
  addTipReason: {
    color: colors.warn_red,
    fontWeight: "bold"
  },
  tipSelect: {flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(15)},
  addTipReasonIcon: {
    fontSize: pxToDp(25),
    color: colors.warn_red,
    marginHorizontal: pxToDp(10)
  },
  addTipReasonText: {
    fontSize: pxToDp(25),
    color: colors.warn_red,
    marginHorizontal: pxToDp(10)
  },
  deliveryModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: pxToDp(30),
    borderTopRightRadius: pxToDp(30),
  },
  deliveryModalTitle: {color: colors.main_color, marginTop: pxToDp(20), marginLeft: pxToDp(20)},
  deliveryItem: {
    padding: pxToDp(20),
    borderRadius: pxToDp(15),
    backgroundColor: "#F3F3F3",
    marginBottom: pxToDp(20),
  },
  textBold: {
    fontWeight: "bold",
    fontSize: 12
  },
  f14: {
    fontSize: 14
  },
  productWeight: {
    fontSize: 12,
    color: colors.color333
  },
  driverContent: {fontSize: 12, marginTop: 12, marginBottom: 12, flexDirection: 'row'},
  driverText: {width: pxToDp(600)},
  btnList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15
  },
  onCanceledBtn: {
    backgroundColor: colors.white,
    borderWidth: pxToDp(2),
    width: pxToDp(150),
    borderColor: colors.fontBlack,
    borderRadius: pxToDp(10),
    padding: pxToDp(14),
    marginRight: pxToDp(15)
  },
  catLocationBtn: {
    backgroundColor: colors.white,
    borderWidth: pxToDp(1),
    width: pxToDp(150),
    borderColor: colors.main_color,
    borderRadius: pxToDp(10),
    padding: pxToDp(15),
    marginRight: pxToDp(15)
  },
  catLocationText: {
    color: colors.main_color,
    fontSize: 12,
  },
  addTipBtn: {
    backgroundColor: colors.main_color,
    width: pxToDp(150),
    borderRadius: pxToDp(10),
    padding: pxToDp(15),
    marginRight: pxToDp(15)
  },
  addTipBtnText: {
    color: colors.white,
    fontSize: 12,
  },
  btnTitleText: {
    color: colors.fontBlack,
    fontSize: 12,
    fontWeight: 'bold'
  },
  deliveryModalBottomBtn: {
    marginHorizontal: 10,
    borderBottomLeftRadius: pxToDp(20),
    borderBottomRightRadius: pxToDp(20),
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: pxToDp(10)
  },
  deliveryStatusContent: {
    flexDirection: 'row',
    paddingVertical: pxToDp(15)
  },
  deliveryStatusHeader: {
    width: pxToDp(30),
    height: pxToDp(30),
    borderRadius: pxToDp(15)
  },
  deliveryStatusTitleTop: {
    width: pxToDp(5),
    height: pxToDp(35),
    position: 'absolute',
    top: pxToDp(28),
    left: pxToDp(13)
  },
  deliveryStatusTitleBottom: {
    width: pxToDp(5),
    height: pxToDp(35),
    position: 'absolute',
    bottom: pxToDp(28),
    left: pxToDp(13)
  },
  btn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: pxToDp(30)
  },
  btn1: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: pxToDp(15),
    marginBottom: pxToDp(10)
  },
  marginH10: {marginHorizontal: pxToDp(10)},
  flex1: {
    flex: 1
  },
  btnText: {
    height: 40,
    backgroundColor: colors.main_color,
    color: 'white',
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: pxToDp(15),
    paddingHorizontal: pxToDp(30),
    borderRadius: pxToDp(10)
  },
  btnText1: {
    height: 30,
    backgroundColor: colors.white,
    color: 'black',
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: pxToDp(50),
    paddingHorizontal: pxToDp(20),
    borderRadius: pxToDp(30)
  },
  btnText2: {
    height: 40,
    backgroundColor: colors.colorBBB,
    color: 'white',
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: pxToDp(15),
    paddingHorizontal: pxToDp(30),
    borderRadius: pxToDp(10)
  },
  pullImg: {
    width: pxToDp(90),
    height: pxToDp(72)
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: pxToDp(10),
    padding: pxToDp(20),
    alignItems: 'center'
  },
  container1: {
    width: '95%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    padding: pxToDp(20),
    justifyContent: "flex-start",
    borderTopWidth: pxToDp(1),
    borderTopColor: "#CCCCCC"
  },
  amountBtn: {
    borderWidth: 1,
    borderColor: colors.title_color,
    width: "30%", textAlign: 'center',
    paddingVertical: pxToDp(5)
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
});


export default connect(mapDispatchToProps)(OrderListItem)
