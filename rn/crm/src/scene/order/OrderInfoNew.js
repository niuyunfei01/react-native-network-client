import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Alert,
  Animated,
  Dimensions,
  InteractionManager,
  PanResponder,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import HttpUtils from "../../pubilc/util/http";
import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../../pubilc/styles/colors";
import {MapType, MapView, Marker} from "react-native-amap3d/lib/src/index";
import tool from "../../pubilc/util/tool";
import Cts from "../../pubilc/common/Cts";
import {Button} from "react-native-elements";
import pxToDp from "../../pubilc/util/pxToDp";
import native from "../../pubilc/util/native";
import numeral from "numeral";
import Clipboard from "@react-native-community/clipboard";
import Config from "../../pubilc/common/config";
import {getTime} from "../../pubilc/util/TimeUtil";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";
import PropTypes from "prop-types";
import BleManager from "react-native-ble-manager";
import {MixpanelInstance} from "../../pubilc/util/analytics";
import {getRemindForOrderPage, printInCloud} from "../../reducers/order/orderActions";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import Tips from "../common/component/Tips";
import OrderReminds from "../../pubilc/component/OrderReminds";
import {ActionSheet} from "../../weui";
import {print_order_to_bt} from "../../pubilc/util/ble/OrderPrinter";
import {markTaskDone} from "../../reducers/remind/remindActions";
import JbbModal from "../../pubilc/component/JbbModal";
import QRCode from "react-native-qrcode-svg";
import DeliveryStatusModal from "../../pubilc/component/DeliveryStatusModal"
import AddTipModal from "../../pubilc/component/AddTipModal";
import FastImage from "react-native-fast-image";
import {SvgXml} from "react-native-svg";
import {call, cross_icon} from "../../svg/svg";
import AlertModal from "../../pubilc/component/AlertModal";
import CancelDeliveryModal from "../../pubilc/component/CancelDeliveryModal";
import {setDefaultOrderInfo} from "../../reducers/global/globalActions";

const {width, height} = Dimensions.get("window")

//记录耗时的对象
const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}
// 订单操作常量
const MENU_PRINT_AGAIN = 1;               // 再次打印
const MENU_COMPLAINT_RIDER = 2;           // 投诉骑手
const MENU_CANCEL_ORDER = 3;              // 取消订单
const MENU_EDIT_BASIC = 4;                // 修改订单
const MENU_EDIT_STORE = 5;                // 修改门店
const MENU_SEND_MONEY = 6;                // 发红包
const MENU_CALL_STAFF = 7;               // 联系门店
const MENU_SET_INVALID = 8;               // 置为无效
const MENU_SET_COMPLETE = 9;             // 置为完成
const MENU_ORDER_SCAN = 10;               // 订单过机
const MENU_ORDER_SCAN_READY = 11;         // 扫码出库
const MENU_ORDER_CANCEL_TO_ENTRY = 12;    // 退单入库

function mapStateToProps(state) {
  return {
    global: state.global,
    device: state.device
  }
}

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class OrderInfoNew extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func,
    route: PropTypes.object,
    device: PropTypes.object,
  }

  constructor(props) {
    super(props);
    timeObj.method.push({startTime: getTime(), methodName: 'componentDidMount'})
    this.mixpanel = MixpanelInstance;

    this.mixpanel.track('订单详情页')
    GlobalUtil.setOrderFresh(2) //去掉订单页面刷新
    const order_id = (this.props.route.params || {}).orderId;
    const {is_service_mgr = false} = tool.vendor(this.props.global);
    let {default_order_info} = this.props.global
    this.state = {
      isRefreshing: false,
      loadingImg: true,
      orderId: order_id,
      is_service_mgr: is_service_mgr,
      isFetching: false,
      order: default_order_info,
      actionSheet: [],
      isShowMap: false,
      logistics: [],
      delivery_desc: '',
      show_no_rider_tips: false,
      delivery_status: '配送状态',
      itemsEdited: {},
      allow_merchants_cancel_order: false,
      reminds: [],
      showPrinterChooser: false,
      modalTip: false,
      showQrcode: false,
      show_delivery_modal: false,

      toastContext: '',
      add_tip_id: 0,
      show_add_tip_modal: false,
      allowRefresh: true,
      show_finish_delivery_modal: false,
      show_cancel_delivery_modal: false
    }
    this.map_height = 290
  }

  componentDidMount = () => {
    const {deviceInfo} = this.props?.device
    const {currStoreId, currentUser, accessToken} = this.props.global;
    this.navigationOptions()
    timeObj.method[0].endTime = getTime()
    timeObj.method[0].executeTime = timeObj.method[0].endTime - timeObj.method[0].startTime
    timeObj.method[0].executeStatus = 'success'
    timeObj.method[0].interfaceName = ''
    timeObj.method[0].methodName = 'componentDidUpdate'
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = currStoreId
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderInfo"
    timeObj['is_record_request_monitor'] = this.props.global?.is_record_request_monitor
    calcMs(timeObj, accessToken)

  }

  componentDidUpdate = () => {
    if (tool.length(timeObj.method) > 0) {
      const endTime = getTime()
      const startTime = timeObj.method[0].startTime
      this.handleTimeObj('', 'success', startTime, endTime, 'componentDidUpdate', endTime - startTime)
      const duplicateObj = {...timeObj}
      timeObj.method = []
      calcMs(duplicateObj, this.props.global.accessToken)
    }
  }

  handleTimeObj = (api = '', executeStatus = 'success', startTime, endTime, methodName = '', executeTime) => {
    timeObj.method.push({
      interfaceName: api,
      executeStatus: executeStatus,
      startTime: startTime,
      endTime: endTime,
      methodName: methodName,
      executeTime: executeTime
    })
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  handleActionSheet = (order, allow_merchants_cancel_order) => {
    const as = [
      {key: MENU_PRINT_AGAIN, label: '再次打印'},
      {key: MENU_EDIT_BASIC, label: '修改订单'},
      {key: MENU_EDIT_STORE, label: '修改门店'},
      {key: MENU_CALL_STAFF, label: '联系门店'},
    ];
    const {is_service_mgr} = this.state
    if (order && order?.ship_id > 0) {
      as.push({key: MENU_COMPLAINT_RIDER, label: '投诉骑手'});
    }
    if (is_service_mgr) {
      as.push({key: MENU_SET_INVALID, label: '置为无效'});
      as.push({key: MENU_SEND_MONEY, label: '发红包'});
    }
    if (is_service_mgr || allow_merchants_cancel_order) {
      as.push({key: MENU_CANCEL_ORDER, label: '取消订单'});
    }
    if (is_service_mgr || this.props.global?.vendor_info?.wsb_store_account === "1") {
      as.push({key: MENU_SET_COMPLETE, label: '置为完成'});
    }
    if (order && order?.fn_scan_items) {
      as.push({key: MENU_ORDER_SCAN, label: '订单过机'});
    }
    if (order && order?.fn_scan_ready) {
      as.push({key: MENU_ORDER_SCAN_READY, label: '扫码出库'});
    }
    if (order && order?.cancel_to_entry) {
      as.push({key: MENU_ORDER_CANCEL_TO_ENTRY, label: '退单入库'});
    }
    // if (order && order?.fn_coupon_redeem_good) {
    //   as.push({key: MENU_REDEEM_GOOD_COUPON, label: '发放商品券'});
    // }
    // if (this._fnProvidingOnway()) {
    //   as.push({key: MENU_PROVIDING, label: '门店备货'});
    // }
    this.setState({actionSheet: as})
  }

  // _fnProvidingOnway = () => {
  //   const {global} = this.props;
  //   const storeId = this.state.order?.store_id;
  //   return storeId && storeId > 0 && global?.vendor_info?.fnProvidingOnway;
  // }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.headerRight()}
    navigation.setOptions(option);
  }

  headerRight = () => {
    return (
      <TouchableOpacity style={headerRightStyles.resetBind} onPress={() => this.navigateToOrderOperation()}>
        <Entypo name={"dots-three-horizontal"} style={headerRightStyles.text}/>
      </TouchableOpacity>
    )
  }

  fetchOrder = () => {
    showModal('加载中')
    let {orderId, isFetching} = this.state
    if (!orderId || isFetching) {
      return false;
    }
    this.setState({
      isFetching: true
    })
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    const api = `/v4/wsb_order/order_detail/${orderId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}, true).then((res) => {
      hideModal()
      const {obj} = res
      this.handleTimeObj(api, res.executeStatus, res.startTime, res.endTime, 'fetchOrder', res.endTime - res.startTime)
      this.handleActionSheet(obj, parseInt(obj.allow_merchants_cancel_order) === 1)

      // this.props.dispatch(setDefaultOrderInfo(obj))
      this.setState({
        order: obj,
        isFetching: false,
        loadingImg: false,
        itemsEdited: this._extract_edited_items(obj.items),
        allow_merchants_cancel_order: parseInt(obj.allow_merchants_cancel_order) === 1,
        isShowMap: res?.loc_lat !== '' && res?.loc_lng !== ''
      }, () => {
        this.navigationOptions()
      })
      dispatch(getRemindForOrderPage(accessToken, orderId, (ok, desc, data) => {
        if (ok) {
          this.setState({reminds: data})
        }
      }));
      this.fetchShipData()
      this.logOrderViewed();
      this.fetchThirdWays()
    }, ((res) => {
      hideModal()
      this.handleTimeObj(api, res.executeStatus, res.startTime, res.endTime, 'fetchOrder', res.endTime - res.startTime)
      ToastLong('操作失败：' + res.reason)
      this.setState({isFetching: false})
    })).catch((e) => {
      hideModal()
      ToastLong('操作失败：' + e.desc)
      this.setState({isFetching: false})
    })
  }

  navigateToOrderOperation = () => {
    this.mixpanel.track("订单操作页");
    let {actionSheet, order, orderId} = this.state;
    this.props.navigation.navigate('OrderOperation', {
      actionSheet: actionSheet,
      order: order,
      orderId: orderId
    });
  }

  _extract_edited_items = (items) => {
    const edits = {};
    (items || []).filter((item => item.origin_num !== null && item.num > item.origin_num)).forEach((item) => {
      edits[item.id] = item;
    });
    return edits;
  }

  logOrderViewed = () => {
    let {id, orderStatus} = this.state.order;
    if (orderStatus === Cts.ORDER_STATUS_TO_READY || orderStatus === Cts.ORDER_STATUS_TO_SHIP) {
      let url = `/api/log_view_order/${id}?access_token=${this.props.global.accessToken}`;
      HttpUtils.post.bind(this.props)(url, {}, true).then(res => {
        this.handleTimeObj(url, res.executeStatus, res.startTime, res.endTime, 'logOrderViewed', res.endTime - res.startTime)
      }).catch((res) => {
        this.handleTimeObj(url, res.executeStatus, res.startTime, res.endTime, 'logOrderViewed', res.endTime - res.startTime)
        ToastLong("记录订单访问次数错误！");
      })
    }
  }

  fetchShipData = () => {
    const api = `/v1/new_api/orders/third_ship_deliverie/${this.state.orderId}?access_token=${this.props.global.accessToken}`;
    HttpUtils.get.bind(this.props)(api, {}, true).then(res => {
      const {obj} = res
      this.handleTimeObj(api, res.executeStatus, res.startTime, res.endTime, 'fetchShipData', res.endTime - res.startTime)
      let logistics_arr = [];
      tool.objectMap(obj.third_deliverie_list, (item) => {
        if (item.is_show === 1) {
          logistics_arr.push(item);
        }
      });
      this.setState({
        delivery_status: obj.show_status,
        show_no_rider_tips: obj.show_no_rider_tips === 1,
        delivery_desc: obj.desc,
        logistics: logistics_arr
      })

    })
  }

  fetchThirdWays = () => {
    let {orderId, order} = this.state;
    if (order?.orderStatus === Cts.ORDER_STATUS_TO_READY || order?.orderStatus === Cts.ORDER_STATUS_TO_SHIP) {
      const api = `/api/order_third_logistic_ways/${orderId}?select=1&access_token=${this.props.global.accessToken}`;
      HttpUtils.get.bind(this.props)(api, {}, true).then((res) => {
        this.handleTimeObj(api, res.executeStatus, res.startTime, res.endTime, 'fetchThirdWays', res.endTime - res.startTime)
      }).catch(error => {
        this.handleTimeObj(api, error?.executeStatus, error?.startTime, error?.endTime, 'fetchThirdWays', error?.endTime - error?.startTime)
      })
    }
  }

  dialNumber = (val) => {
    native.dialNumber(val)
  }

  copyToClipboard = (val) => {
    Clipboard.setString(val)
    ToastLong('复制成功')
  }

  onPrint = (printer_sn) => {
    if (printer_sn) {
      this.setState({showPrinterChooser: true})
    } else {
      this._doBluetoothPrint()
    }
  }

  _cloudPrinterSN = () => {
    const {order} = this.state
    const printerName = order?.printer_sn || '未知';
    return `云打印(${printerName})`;
  }

  // 云打印
  _doCloudPrint = () => {
    const {dispatch, global} = this.props;
    let {order} = this.state;
    this._hidePrinterChooser()
    dispatch(printInCloud(global.accessToken, order.id, (ok, msg) => {
      if (ok) {
        ToastShort("已发送到打印机");
      } else {
        ToastLong('打印失败：' + msg)
      }
      this._hidePrinterChooser();
    }))
  }

  // 蓝牙打印
  _doBluetoothPrint = () => {
    this._hidePrinterChooser()
    let {order} = this.state;
    const {printer_id, accessToken} = this.props.global
    if (printer_id) {
      setTimeout(() => {
        const clb = (msg,) => {
          if (msg === 'ok') {
            ToastShort("已发送给蓝牙打印机！");
          }
          this._hidePrinterChooser();
        };
        BleManager.retrieveServices(printer_id).then((peripheral) => {
          print_order_to_bt(accessToken, peripheral, clb, order.id, order);
        }).catch(() => {
          BleManager.connect(printer_id).then(() => {
            BleManager.retrieveServices(printer_id).then((peripheral) => {
              print_order_to_bt(accessToken, peripheral, clb, order.id, order);
            }).catch(() => {
              //忽略第二次的结果
            })
          }).catch(() => {
            Alert.alert('提示', '打印机已断开连接', this.buttons);
            this._hidePrinterChooser();
          });
        });
      }, 300);
    } else {
      Alert.alert('提示', '尚未连接到打印机', [
        {
          text: '确定',
          onPress: () => this.props.navigation.navigate(Config.ROUTE_PRINTERS)
        },
        {
          text: '取消'
        }
      ]);
    }
  }

  // 商米打印
  _doSunMiPint = () => {
    const {order} = this.state
    native.printSmPrinter(order).then();
    this._hidePrinterChooser();
  }

  _hidePrinterChooser = () => {
    this.setState({showPrinterChooser: false})
  }

  printAction = [
    {
      type: 'default',
      label: '取消',
      onPress: this._hidePrinterChooser
    }
  ]

  closeModal = () => {
    this.setState({
      modalTip: false,
      show_finish_delivery_modal: false,
      show_cancel_delivery_modal: false,
    })
  }

  _doProcessRemind = (remind) => {
    const {order} = this.state
    const {dispatch, global} = this.props;
    const {accessToken} = global;
    const remindType = parseInt(remind.type);
    switch (remindType) {
      case Cts.TASK_TYPE_REFUND_BY_USER:
      case Cts.TASK_TYPE_AFS_SERVICE_BY_USER:
        if (remind?.new_refund_page) {
          this.onPress(Config.ROUTE_NEW_REFUND_AUDIT, {remind: remind, order: order})
        } else {
          this.onPress(Config.ROUTE_REFUND_AUDIT, {remind: remind, order: order})
        }
        break
      case Cts.TASK_TYPE_REMIND:
        this.onPress(Config.ROUTE_ORDER_URGE, {remind: remind, order: order})
        break
      case Cts.TASK_TYPE_DELIVERY_FAILED:
        this.onPress(Config.ROUTE_JD_AUDIT_DELIVERY, {remind: remind, order: order})
        break
      case Cts.TASK_TYPE_ORDER_CHANGE:
        this.setState({onSubmitting: true});
        showModal('处理中')
        dispatch(markTaskDone(accessToken, remind.id, Cts.TASK_STATUS_DONE, (ok, msg,) => {
          const state = {onSubmitting: false};
          hideModal()
          if (ok) {
            showSuccess('已处理');
            setTimeout(() => {
              remind.status = Cts.TASK_STATUS_DONE;
            }, 2000);
          } else {
            ToastLong(msg)
          }
          this.setState(state);
        }));
        break
      default:
        ToastLong('暂不支持该处理类型')
        break
    }
  }

  showQrcodeFlag = () => {
    this.setState({
      showQrcode: true
    })
  }

  closeQrCodeModal = () => {
    this.setState({
      showQrcode: false
    })
  }

  deliveryModalFlag = () => {
    let {order} = this.state;
    if (order?.orderStatus != Cts.ORDER_STATUS_TO_READY) {
      this.mixpanel.track('订单详情页_>')
      this.setState({show_delivery_modal: true})
    }
  }

  closeDeliveryModal = () => {
    this.setState({show_delivery_modal: false})
  }

  onCallThirdShips = (order_id, store_id, if_reship) => {
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

  callSelfAgain = () => {
    let {order} = this.state
    this.setState({show_delivery_modal: false})
    this.onCallThirdShips(order?.id, order?.store_id, 0)
  }

  goCancelDelivery = (order_id, ship_id = 0) => {
    this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
      {
        order: {id: order_id,},
        ship_id: ship_id,
        onCancelled: () => {
          this.fetchOrder();
        }
      });
  }

  cancelDelivery = (orderId) => {
    const {global} = this.props;
    const {accessToken} = global;
    const api = `/v4/wsb_delivery/preCancelDelivery?access_token=${accessToken}`;
    let params = {
      order_id: orderId
    }
    HttpUtils.get.bind(this.props)(api, params).then(res => {
      if (tool.length(res?.alert_msg) > 0) {
        Alert.alert('提示', res?.alert_msg, [{
          text: '确定', onPress: () => {
            this.goCancelDelivery(orderId)
          }
        }, {'text': '取消'}]);
      } else {
        this.goCancelDelivery(orderId)
      }
    })
  }

  cancelDeliverys = (id) => {
    const {global} = this.props;
    const {accessToken} = global;
    Alert.alert('提示', `确定取消此订单全部配送吗?`, [{
      text: '确定', onPress: () => {
        const api = `/api/batch_cancel_third_ship/${id}?access_token=${accessToken}`;
        HttpUtils.get.bind(this.props)(api, {}).then(res => {
          ToastShort(res.desc);
          this.fetchOrder()
        }).catch(() => {
          ToastShort("此订单已有骑手接单，取消失败")
        })
      }
    }, {'text': '取消'}]);
  }

  toSetOrderComplete = () => {
    const {accessToken} = this.props.global;
    let {order} = this.state;
    const api = `/api/complete_order/${order?.id}?access_token=${accessToken}`
    HttpUtils.get(api).then(() => {
      ToastLong('配送已完成')
      this.closeModal();
      this.fetchOrder()
    }).catch(() => {
      showError('配送完成失败，请稍后重试')
    })
  }

  openAddTipModal = (order_id) => {
    this.setState({
      add_tip_id: order_id,
      show_add_tip_modal: true,
      show_delivery_modal: false
    })
  }

  filterDistance = (val = 0) => {
    let flag = val / 1000
    if (flag >= 1) {
      return `${numeral(val / 1000).format('0.0')}公里`
    } else {
      return `${val}米`
    }
  }

  renderMap = () => {
    let {
      loc_lat,
      loc_lng,
      store_loc_lat,
      store_loc_lng,
      ship_worker_lat,
      ship_worker_lng,
      dada_distance,
      ship_distance_destination,
      ship_distance_store
    } = this.state.order;

    let {
      aLon,
      aLat
    } = tool.getCenterLonLat(loc_lng, loc_lat, ship_distance_destination > 0 ? ship_worker_lng : store_loc_lng, ship_distance_destination > 0 ? ship_worker_lat : store_loc_lat)

    return (
      <View {...this._gestureHandlers.panHandlers} ref={ref => this.viewRef = ref} style={{height: this.map_height}}>
        <MapView
          zoomGesturesEnabled={true}
          scrollGesturesEnabled={true}
          zoomControlsEnabled={false}
          mapType={MapType.Standard}
          style={StyleSheet.absoluteFill}
          minZoom={12}
          maxZoom={20}
          initialCameraPosition={{
            target: {latitude: Number(aLat), longitude: Number(aLon)},
            zoom: dada_distance > 2000 ? 13 : 14
          }}>
          {/*门店定位*/}
          <If condition={ship_distance_destination <= 0}>
            <Marker
              draggable={false}
              position={{latitude: Number(store_loc_lat), longitude: Number(store_loc_lng)}}
            >
              <View style={{alignItems: 'center'}}>
                <FastImage source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location_store.png'}}
                           style={{width: 30, height: 34,}}
                           resizeMode={FastImage.resizeMode.contain}
                />
              </View>

            </Marker>
          </If>
          {/*骑手位置*/}
          <If condition={ship_worker_lng !== '' && ship_worker_lat !== ''}>
            <Marker
              draggable={false}
              position={{latitude: Number(ship_worker_lat), longitude: Number(ship_worker_lng)}}
              onPress={() => {
              }}
            >
              <View style={{alignItems: 'center'}}>
                <View style={styles.mapBox}>
                  <If condition={ship_distance_destination > 0}>
                    <Text style={{color: colors.color333, fontSize: 12}}>
                      骑手距离顾客{this.filterDistance(ship_distance_destination)}
                    </Text>
                  </If>
                  <If condition={ship_distance_store > 0}>
                    <Text style={{color: colors.color333, fontSize: 12}}>
                      骑手距离商家{this.filterDistance(ship_distance_store)}
                    </Text>
                  </If>
                </View>
                <Entypo name={'triangle-down'}
                        style={{color: colors.white, fontSize: 30, position: 'absolute', top: 20}}/>
                <FastImage source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location_ship.png'}}
                           style={{width: 30, height: 34,}}
                           resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            </Marker>
          </If>
          {/*用户定位*/}
          <If condition={ship_distance_destination > 0 && loc_lat && loc_lng}>

            <Marker
              zIndex={93}
              position={{latitude: Number(loc_lat), longitude: Number(loc_lng)}}
              icon={{
                uri: "https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location.png",
                width: 22,
                height: 42,
              }}
            />
          </If>
          <If condition={ship_distance_destination <= 0 && loc_lat && loc_lng}>
            <Marker
              draggable={false}
              position={{latitude: Number(loc_lat), longitude: Number(loc_lng)}}
            >
              <View style={{alignItems: 'center'}}>
                <View style={styles.mapBox}>
                  <Text style={{color: colors.color333, fontSize: 12}}>
                    距门店{this.filterDistance(dada_distance)}
                  </Text>
                </View>
                <Entypo name={'triangle-down'}
                        style={{color: colors.white, fontSize: 30, position: 'absolute', top: 20}}/>
                <FastImage source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/location.png'}}
                           style={{width: 23, height: 48}}
                           resizeMode={FastImage.resizeMode.contain}/>
              </View>
            </Marker>
          </If>
        </MapView>
      </View>
    )
  }

  renderOrderInfo = () => {
    return (
      <View style={{marginTop: -20}}>
        {this.renderOrderInfoHeader()}
        {this.renderOrderInfoCard()}
      </View>
    )
  }


  UNSAFE_componentWillMount() {
    this.touchScreenMove()
  }

  touchScreenMove = () => {

    this._gestureHandlers = PanResponder.create({
      // 要求成为响应者：
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    });

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        this.scrollViewRef && this.scrollViewRef.setNativeProps({canCancelContentTouches: false})
        this.setState({allowRefresh: false})
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {

        return true;
      },
      onPanResponderGrant: (evt, gestureState) => {
        const {pageY, locationY} = evt.nativeEvent;
        this.preY = pageY - locationY;

        return true
      },
      onPanResponderMove: (evt, gestureState) => {

        if (Math.abs(gestureState.dy) < 3) {
          return;
        }
        let preHeight = this.preY + gestureState.dy - 70
        if (preHeight >= 0.7 * height)
          preHeight = 0.7 * height
        if (preHeight <= 0)
          preHeight = 0.3 * height
        this.viewRef && this.viewRef.setNativeProps({height: preHeight || this.preY})

      },
      onPanResponderTerminationRequest: (evt, gestureState) => {
        return true;
      },
      onPanResponderRelease: (evt, gestureState) => {

        if (Math.abs(gestureState.dy) < 3) {
          this.deliveryModalFlag()
        }
        this.scrollViewRef.setNativeProps({canCancelContentTouches: true})
        this.setState({allowRefresh: true})
        return true;

      },
      onPanResponderTerminate: (evt, gestureState) => {
        return true;
      }
    });
  }

  renderOrderInfoHeader = () => {
    let {delivery_status, delivery_desc, isShowMap, order} = this.state;
    return (
      <>
        <Animated.View {...this._panResponder.panHandlers}
                       style={isShowMap ? styles.orderInfoHeader : styles.orderInfoHeaderNoMap}>

          <If condition={isShowMap}>
            <View style={styles.orderInfoHeaderFlag}/>
          </If>
          <View style={styles.orderInfoHeaderStatus}>
            <Text style={styles.orderStatusDesc}>{delivery_status}</Text>
            <If condition={order?.orderStatus != Cts.ORDER_STATUS_TO_READY}>
              <Entypo name="chevron-thin-right" style={styles.orderStatusRightIcon}/>
            </If>
          </View>
          <Text style={styles.orderStatusNotice}>{delivery_desc} </Text>

        </Animated.View>
        {this.renderOrderInfoHeaderButton()}
      </>
    )
  }

  renderOrderInfoHeaderButton = () => {
    let {order, isShowMap} = this.state;
    let btn_list = order?.order;
    return (
      <View style={isShowMap ? styles.orderInfoHeaderButton : styles.orderInfoHeaderButtonNoMap}>
        <If condition={btn_list && btn_list?.btn_print === 1}>
          <Button title={'打印订单'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_打印订单')
                    this.onPrint(order?.printer_sn)
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonLeft}
                  titleStyle={styles.orderInfoHeaderButtonTitleLeft}
          />
        </If>
        <If condition={btn_list && btn_list?.btn_print_again === 1}>
          <Button title={'再次打印'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_再次打印')
                    Alert.alert('提醒', '当前订单已打印，是否继续打印？', [
                      {
                        text: '确定',
                        onPress: () => {
                          this.onPrint(order?.printer_sn)
                        },
                      }, {
                        text: '取消'
                      }
                    ])
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonLeft}
                  titleStyle={styles.orderInfoHeaderButtonTitleLeft}
          />
        </If>
        <If condition={btn_list && btn_list?.btn_call_third_delivery === 1}>
          <Button title={'下配送单'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_下配送单')
                    this.onCallThirdShips(order?.id, order?.store_id)
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonRight}
                  titleStyle={styles.orderInfoHeaderButtonTitleRight}
          />
        </If>
        <If condition={btn_list && btn_list?.batch_cancel_delivery === 1}>
          <Button title={'取消配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_取消全部配送')
                    this.cancelDeliverys(order?.id)
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonLeft}
                  titleStyle={styles.orderInfoHeaderButtonTitleLeft}
          />

        </If>
        <If condition={btn_list && btn_list?.btn_cancel_delivery === 1}>
          <Button title={'取消配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_取消单个配送')
                    this.openCancelDeliveryModal()
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonLeft}
                  titleStyle={styles.orderInfoHeaderButtonTitleLeft}
          />

        </If>
        <If condition={btn_list && btn_list?.btn_resend === 1}>
          <Button title={'再次配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_再次配送')
                    this.onCallThirdShips(order?.id, order?.store_id, 1)
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonRight}
                  titleStyle={styles.orderInfoHeaderButtonTitleRight}
          />
        </If>
        <If condition={btn_list && btn_list?.btn_call_third_delivery_again}>
          <Button title={'追加配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_追加配送')
                    this.callSelfAgain()
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonRight}
                  titleStyle={styles.orderInfoHeaderButtonTitleRight}
          />
        </If>
        <If condition={btn_list && btn_list?.btn_confirm_arrived === 1}>
          <Button title={'完成配送'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_完成配送')
                    this.setState({
                      show_finish_delivery_modal: true
                    })
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonRight}
                  titleStyle={styles.orderInfoHeaderButtonTitleRight}
          />
        </If>
        <If condition={btn_list && btn_list?.btn_contact_rider === 1}>
          <Button title={'联系骑手'}
                  onPress={() => {
                    this.mixpanel.track('V4订单详情_联系骑手')
                    this.dialNumber(order?.ship_worker_mobile)
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonLeft}
                  titleStyle={styles.orderInfoHeaderButtonTitleLeft}
          />
        </If>
        <If condition={btn_list && btn_list?.batch_add_delivery_tips === 1}>
          <Button title={'加小费'}
                  onPress={() => {

                    this.mixpanel.track('V4订单详情_加小费')
                    this.openAddTipModal(order?.id)
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonRight}
                  titleStyle={styles.orderInfoHeaderButtonTitleRight}
          />
        </If>
      </View>
    )
  }

  renderOrderInfoCard = () => {
    let {order, is_service_mgr} = this.state;
    const {currStoreId} = this.props.global;
    return (
      <View style={[styles.orderInfoCard, {marginTop: 10}]}>
        <View style={styles.orderCardHeader}>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <FastImage source={{uri: order?.platform_icon}} style={styles.orderCardIcon}
                       resizeMode={FastImage.resizeMode.contain}/>
            <View style={styles.orderCardInfo}>
              <Text style={styles.orderCardInfoTop}># {order?.platform_dayId} </Text>
              <Text style={styles.orderCardInfoBottom}>{order?.store_name} #{order?.dayId} </Text>
            </View>
          </View>
          <If condition={order?.platform === '6'}>
            <Button title={'查看取货码'}
                    onPress={() => {
                      this.mixpanel.track('V4订单详情_查看取货码')
                      this.showQrcodeFlag()
                    }}
                    buttonStyle={styles.qrCodeBtn}
                    titleStyle={styles.qrCodeBtnTitle}
            />
          </If>
        </View>
        <View style={[styles.orderCardContainer, {flexDirection: "column"}]}>
          <Text style={styles.cardTitle}>收件信息 </Text>
          <View style={styles.cardTitleInfo}>
            <View style={styles.cardTitleInfoLeft}>
              <Text style={styles.cardTitleUser}>{order?.userName} {order?.mobile}</Text>
              <Text style={styles.cardTitleAddress}>{order?.address} </Text>
            </View>
            <SvgXml xml={call()} width={24} height={24} onPress={() => this.dialNumber(order?.mobile)}/>
          </View>
        </View>
        <View style={styles.cuttingLine}/>
        <If condition={order?.remark}>
          <View style={[styles.orderCardContainer, {flexDirection: "row"}]}>
            <Text style={styles.remarkLabel}>备注 </Text>
            <Text style={[styles.remarkValue, {width: width * 0.8}]}>{order?.remark} </Text>
          </View>
        </If>
        <View style={styles.cuttingLine}/>
        <If condition={order?.product_total_count > 0}>
          <View style={[styles.orderCardContainer, {flexDirection: "column"}]}>
            <Text
              style={styles.cardTitle}>商品{order?.product_total_count}件 </Text>
            <If condition={order?.items?.length >= 1}>
              <For index='index' each='info' of={order?.items}>
                <TouchableOpacity style={styles.productInfo} key={index} onPress={() => {
                  this.onPress(Config.ROUTE_GOOD_STORE_DETAIL, {
                    pid: info?.product_id,
                    storeId: currStoreId,
                    item: info
                  })
                }}>
                  <FastImage
                    source={{uri: info?.product_img !== '' ? info?.product_img : 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E6%9A%82%E6%97%A0%E5%9B%BE%E7%89%87%403x.png'}}
                    style={styles.productImage}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <View style={styles.productItem}>
                    <Text style={styles.productItemName}>
                      <If condition={info?.shelf_no}>{info?.shelf_no} </If>
                      {info?.product_name}
                    </Text>
                    <If condition={info?.product_id > 0}>
                      <Text style={styles.productItemId}>(#{info?.product_id}
                        <If condition={info?.tag_code}>[{info?.tag_code}]</If>)
                      </Text>
                    </If>
                    <View style={styles.productItemPrice}>
                      <View style={{flexDirection: "row", justifyContent: "space-around", alignItems: "center"}}>
                        <If condition={order?.is_fn_price_controlled}>
                          <Text style={styles.priceBao}>保</Text>
                          <Text style={[styles.price, {marginRight: 10}]}>
                            {numeral(info?.supply_price / 100).format('0.00')}元
                          </Text>
                          <If condition={order?.is_fn_total_price}>
                            <Text style={[styles.price, {marginRight: 10}]}>
                              总价 {numeral(info?.supply_price * info?.num / 100).format('0.00')}元
                            </Text>
                          </If>
                        </If>
                        <If condition={order?.is_fn_show_wm_price}>
                          <Text style={styles.priceWai}>外</Text>
                          <Text style={styles.price}>{numeral(info?.price).format('0.00')}元 </Text>
                          <If condition={order?.is_fn_total_price}>
                            <Text style={[styles.price, {marginRight: 10}]}>
                              总价 {numeral(info?.price * info?.num).format('0.00')}元
                            </Text>
                          </If>
                        </If>
                      </View>
                      <Text style={styles.productNum}> {info?.num > 1 ? `[x ${info?.num}]` : `x ${info?.num}`} </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </For>
            </If>
          </View>
          <View style={styles.cuttingLine}/>
          <View style={[styles.orderCardContainer, {
            flexDirection: "column",
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6
          }]}>
            <If condition={order?.is_show_purchasing_price}>
              <View style={styles.productItemRow}>
                <Text style={styles.remarkLabel}>供货价小计 </Text>
                <Text style={styles.remarkValue}>{order?.bill?.income_base}元 </Text>
              </View>
            </If>
            <If condition={order?.is_show_original_price}>
              <View style={styles.productItemRow}>
                <Text style={styles.remarkLabel}>订单原价 </Text>
                <Text style={styles.remarkValue}>{numeral(order?.total_goods_price / 100).format('0.00')}元 </Text>
              </View>
            </If>
            <If condition={order?.is_show_activity_price}>
              <View style={styles.productItemRow}>
                <Text style={styles.remarkLabel}>优惠信息 </Text>
                <Text style={styles.remarkValue}>{numeral(order?.self_activity_fee / 100).format('0.00')}元 </Text>
              </View>
            </If>
            <If condition={order?.is_show_actual_price}>
              <View style={styles.productItemRow}>
                <Text style={styles.remarkLabel}>顾客实付 </Text>
                <Text style={styles.remarkValue}>{numeral(order?.orderMoney).format('0.00')}元 </Text>
              </View>
            </If>
            <If condition={order?.is_show_platform_income}>
              <View style={styles.productItemRow}>
                <Text style={styles.remarkLabel}>平台结算 </Text>
                <Text style={styles.remarkValue}>{order?.bill.total_income_from_platform}元 </Text>
              </View>
            </If>
          </View>
        </If>
      </View>
    )
  }

  renderDeliveryInfo = () => {
    let {order} = this.state;
    return (
      <View style={styles.orderInfoCard}>
        <View style={[styles.orderCardContainer, {flexDirection: "column", borderRadius: 6}]}>
          <Text style={styles.cardTitle}>配送信息 </Text>

          <If condition={order?.show_store_name}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>配送门店 </Text>
              <Text style={styles.remarkValue}>{order?.store_name} </Text>
            </View>
          </If>
          <If condition={order?.ship_create_time !== ''}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>下单时间 </Text>
              <Text style={styles.remarkValue}>{order?.ship_create_time} </Text>
            </View>
          </If>
          <If condition={order?.ship_goods_info !== ''}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>物品信息 </Text>
              <Text style={styles.remarkValue}>{order?.ship_goods_info} </Text>
            </View>
          </If>
          <If condition={order?.ship_type_desc !== ''}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>配送方式 </Text>
              <Text style={styles.remarkValue}>{order?.ship_type_desc} </Text>
            </View>
          </If>
          <If condition={order?.ship_worker_name !== ''}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>骑手姓名 </Text>
              <Text style={styles.remarkValue}>{order?.ship_worker_name} </Text>
            </View>
          </If>
          <If condition={order?.ship_worker_mobile !== ''}>
            <TouchableOpacity style={styles.productItemRow} onPress={() => this.dialNumber(order?.ship_worker_mobile)}>
              <Text style={styles.remarkLabel}>骑手电话 </Text>
              <View style={{flexDirection: "row"}}>
                <Text style={styles.remarkValue}>{order?.ship_worker_mobile} </Text>
                <Text style={styles.copyText}>拨打 </Text>
              </View>
            </TouchableOpacity>
          </If>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>配送费用 </Text>
            <Text style={styles.remarkValue}>{numeral(order?.ship_fee).format('0.00')}元 </Text>
          </View>
          <View style={styles.cuttingLine1}/>
          <If condition={tool.length(order.greeting) > 0}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>祝福语 </Text>
              <Text style={styles.remarkValue}>{order?.greeting} </Text>
            </View>
          </If>
          <If condition={tool.length(order?.giver_phone) > 0}>
            <TouchableOpacity style={styles.productItemRow} onPress={() => this.dialNumber(order?.giver_phone)}>
              <Text style={styles.remarkLabel}>订购人电话 </Text>
              <View style={{flexDirection: "row"}}>
                <Text style={styles.remarkValue}>{order?.giver_phone} </Text>
                <Text style={styles.copyText}>拨打 </Text>
              </View>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    )
  }

  renderOrderDescInfo = () => {
    let {order} = this.state;
    return (
      <View style={styles.orderInfoCard}>
        <View style={[styles.orderCardContainer, {flexDirection: "column", borderRadius: 6}]}>
          <Text style={styles.cardTitle}>订单信息 </Text>
          <TouchableOpacity style={styles.productItemRow} onPress={() => this.copyToClipboard(order?.id)}>
            <Text style={styles.remarkLabel}>订单编号 </Text>
            <View style={{flexDirection: "row"}}>
              <Text style={styles.remarkValue}>{order?.id} </Text>
              <Text style={styles.copyText}>复制 </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.productItemRow} onPress={() => this.copyToClipboard(order?.platform_oid)}>
            <Text style={styles.remarkLabel}>平台单号 </Text>
            <View style={{flexDirection: "row"}}>
              <Text style={styles.remarkValue}>{order?.platform_oid} </Text>
              <Text style={styles.copyText}>复制 </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>预计送达时间 </Text>
            <Text style={styles.remarkValue}>{order?.expectTime} </Text>
          </View>
        </View>
      </View>
    )
  }

  renderOperationLog = () => {
    let {order} = this.state;
    return (
      <TouchableOpacity style={styles.orderInfoCard} onPress={() => {
        this.onPress(Config.ROUTE_OPERATION_LOG, {id: order?.id})
      }}>
        <View style={[styles.orderCardContainer, {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 6
        }]}>
          <Text style={styles.logLabel}>操作日志 </Text>
          <Entypo name="chevron-thin-right" style={styles.orderStatusRightIcon}/>
        </View>
      </TouchableOpacity>
    )
  }

  renderPrinter = () => {
    const remindNicks = tool.length(this.state.reminds) > 0 ? this.state.reminds.nicknames : '';
    const reminds = tool.length(this.state.reminds) > 0 ? this.state.reminds.reminds : [];
    let {order = {}, modalTip, showPrinterChooser} = this.state;
    const menus = [
      {
        type: 'default',
        label: this._cloudPrinterSN(),
        onPress: this._doCloudPrint
      },
      {
        type: 'default',
        label: '蓝牙打印',
        onPress: this._doBluetoothPrint
      },
      {
        type: 'default',
        label: '商米打印',
        onPress: this._doSunMiPint
      }
    ]

    return (
      <View>
        <Tips navigation={this.props.navigation} orderId={order.id}
              storeId={order.store_id} key={order.id} modalTip={modalTip}
              onItemClick={() => this.closeModal()}/>
        <OrderReminds task_types={Cts.task_type} reminds={reminds} remindNicks={remindNicks}
                      processRemind={this._doProcessRemind.bind(this)}/>
        <ActionSheet
          visible={showPrinterChooser}
          onRequestClose={this._hidePrinterChooser}
          menus={menus}
          actions={this.printAction}
        />
      </View>)
  }

  renderQrCode = () => {
    let {showQrcode, order} = this.state;
    return (
      <JbbModal visible={showQrcode} onClose={this.closeQrCodeModal} modal_type={'center'}>
        <View style={styles.QrBox}>
          <View style={styles.QrTitle}>
            <Text style={styles.QrDesc}>查看取货码</Text>

            <SvgXml onPress={this.closeQrCodeModal} xml={cross_icon()} width={18} height={18}/>

          </View>
          <View style={styles.QrImg}>
            <QRCode value={order?.platform_oid} color="black" size={200}/>
            <Text style={styles.QrCode}>{order?.platform_oid} </Text>
          </View>
        </View>
      </JbbModal>
    )
  }

  openCancelDeliveryModal = () => {
    this.setState({
      show_cancel_delivery_modal: true,
      show_delivery_modal: false
    })
  }

  renderDeliveryModal = () => {
    let {show_delivery_modal, orderId, currStoreId} = this.state;
    const {global} = this.props;
    const {accessToken} = global;
    return (
      <DeliveryStatusModal
        order_id={orderId}
        store_id={currStoreId}
        onPress={this.onPress.bind(this)}
        openAddTipModal={this.openAddTipModal.bind(this)}
        openCancelDeliveryModal={this.openCancelDeliveryModal.bind(this)}
        accessToken={accessToken}
        show_modal={show_delivery_modal}
        onClose={this.closeDeliveryModal}
      />
    )
  }

  renderAddTipModal = () => {
    let {show_add_tip_modal, add_tip_id} = this.state;
    const {global, dispatch} = this.props;
    const {accessToken} = global;
    return (
      <AddTipModal
        setState={this.setState.bind(this)}
        accessToken={accessToken}
        id={add_tip_id}
        orders_add_tip={true}
        dispatch={dispatch}
        show_add_tip_modal={show_add_tip_modal}/>
    )
  }

  renderNoInfo = () => {
    return (
      <View style={{flexGrow: 1, backgroundColor: 'red'}}>
        <FastImage source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E5%8D%A0%E4%BD%8D%E5%9B%BE.png'}}
                   style={{width: width, height: height,}}
                   resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    )
  }

  render() {
    let {accessToken} = this.props.global;
    const {isShowMap, order, isRefreshing, allowRefresh, show_cancel_delivery_modal, loadingImg} = this.state
    if (order?.orderStatus === '4' || order?.orderStatus === '5') {
      this.setState({
        isShowMap: false
      })
    }
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchOrder}/>

        <If condition={loadingImg}>
          {this.renderNoInfo()}
        </If>

        <ScrollView ref={ref => this.scrollViewRef = ref}
                    refreshControl={
                      <RefreshControl
                        enabled={allowRefresh}
                        refreshing={isRefreshing}
                        onRefresh={() => this.fetchOrder()}
                        tintColor='gray'
                      />}
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.Content}>

          {this.renderPrinter()}


          <If condition={isShowMap}>
            {this.renderMap()}
          </If>
          {this.renderOrderInfo()}
          <If condition={order?.show_ship_info}>
            {this.renderDeliveryInfo()}
          </If>
          {this.renderOrderDescInfo()}
          {this.renderOperationLog()}
          {this.renderQrCode()}
        </ScrollView>
        {this.renderDeliveryModal()}
        {this.renderAddTipModal()}
        {this.renderFinishDeliveryModal()}

        <CancelDeliveryModal
          order_id={order?.id}
          ship_id={0}
          accessToken={accessToken}
          show_modal={show_cancel_delivery_modal}
          fetchData={this.fetchOrder.bind(this)}
          onPress={this.onPress.bind(this)}
          onClose={this.closeModal}
        />

      </View>
    );
  }

  renderFinishDeliveryModal = () => {
    let {show_finish_delivery_modal} = this.state;
    return (
      <View>
        <AlertModal
          visible={show_finish_delivery_modal}
          onClose={this.closeModal}
          onPressClose={this.closeModal}
          onPress={() => this.toSetOrderComplete()}
          title={'当前配送确认完成吗?'}
          desc={'订单送达后无法撤回，请确认顾客已收到货物'}
          actionText={'确定'}
          closeText={'再想想'}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5'},
  mapBox: {
    zIndex: 999,
    backgroundColor: colors.white,
    marginBottom: 15,
    padding: 8,
    borderRadius: 6,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.main_color,
    marginLeft: 10
  },
  orderInfoHeader: {
    height: 88,
    backgroundColor: colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: "column",
    alignItems: "center"
  },
  orderInfoHeaderNoMap: {
    height: 78,
    backgroundColor: colors.white,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 20,
    paddingTop: 20,
    width: width * 0.94,
    marginLeft: width * 0.03,
    borderRadius: 6,
    marginTop: 30
  },
  orderInfoHeaderFlag: {
    width: 32,
    height: 4,
    backgroundColor: '#DDDDDD',
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 14
  },
  orderInfoHeaderStatus: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  orderStatusDesc: {
    fontSize: 18,
    color: colors.color333,
    fontWeight: 'bold'
  },
  orderStatusRightIcon: {
    fontSize: 14,
    color: colors.color999,
    marginLeft: 5
  },
  orderStatusNotice: {
    fontSize: 14,
    color: colors.color333,
    fontWeight: '400',
    marginTop: 10
  },
  orderInfoHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
    backgroundColor: colors.white
  },
  orderInfoHeaderButtonNoMap: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: colors.white,
    width: width * 0.94,
    marginLeft: width * 0.03
  },
  orderInfoHeaderButtonLeft: {
    width: 100,
    height: 35,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.main_color,
    marginHorizontal: 10
  },
  orderInfoHeaderButtonTitleLeft: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.main_color
  },
  orderInfoHeaderButtonRight: {
    width: 100,
    height: 35,
    borderRadius: 21,
    backgroundColor: colors.main_color,
    marginHorizontal: 10
  },
  orderInfoHeaderButtonTitleRight: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.white
  },
  orderInfoCard: {
    width: width * 0.94,
    backgroundColor: colors.white,
    marginLeft: width * 0.03,
    borderRadius: 6,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    elevation: 5,
    shadowRadius: 12
  },
  orderCardHeader: {
    width: width * 0.94,
    height: 61,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  orderCardIcon: {width: 40, height: 40, borderRadius: 24},
  orderCardInfo: {
    flexDirection: "column",
    marginLeft: 11
  },
  orderCardInfoTop: {fontSize: 16, fontWeight: 'bold', color: colors.color333, marginBottom: pxToDp(5)},
  orderCardInfoBottom: {fontSize: 12, fontWeight: '400', color: colors.color999},
  orderCardContainer: {
    width: width * 0.92,
    backgroundColor: colors.white,
    padding: 12,
    paddingRight: pxToDp(12)
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.color333,
    marginBottom: 10
  },
  logLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.color333
  },
  cardTitleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15
  },
  cardTitleInfoLeft: {
    flexDirection: "column",
    width: width * 0.7
  },
  cardTitleUser: {
    fontSize: 12,
    color: colors.color666,
    fontWeight: '400',
    marginBottom: pxToDp(10)
  },
  cardTitleAddress: {
    fontSize: 12,
    color: colors.color333,
    fontWeight: 'bold'
  },
  cardTitlePhone: {
    fontSize: 16
  },
  cuttingLine: {
    backgroundColor: colors.e5,
    height: pxToDp(0.5),
    width: width * 0.86,
    marginLeft: width * 0.03
  },
  cuttingLine1: {
    backgroundColor: colors.e5,
    height: 0.5,
    width: width * 0.86,
    marginVertical: 10
  },
  productInfo: {flexDirection: "row", marginVertical: pxToDp(15)},
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 5
  },
  remarkLabel: {fontSize: 12, fontWeight: '400', color: colors.color999},
  remarkValue: {fontSize: 12, fontWeight: '400', color: colors.color333},
  productItem: {
    flexDirection: "column",
    marginLeft: pxToDp(10)
  },
  productItemName: {fontSize: 12, fontWeight: '400', color: '#1A1614', width: width * 0.7},
  productItemId: {fontSize: 12, fontWeight: '400', color: colors.color999, marginTop: 5},
  productItemPrice: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    width: width * 0.7
  },
  priceBao: {
    width: 15,
    height: 15,
    borderRadius: 2,
    borderColor: '#FF830A',
    borderWidth: 1,
    fontSize: 11,
    fontWeight: '400',
    color: '#FF8309',
    textAlign: 'center',
    marginRight: pxToDp(10)
  },
  priceWai: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#26B942',
    fontSize: 11,
    fontWeight: '400',
    color: '#26B942',
    textAlign: "center",
    marginRight: pxToDp(10)
  },
  price: {fontSize: 12, fontWeight: '400', color: '#1A1614'},
  productNum: {fontWeight: '400', fontSize: 12, color: colors.color666},
  productItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: pxToDp(10)
  },
  qrCodeBtn: {
    backgroundColor: colors.white,
    borderColor: colors.colorCCC,
    borderWidth: 0.5,
    borderRadius: 21
  },
  qrCodeBtnTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color666
  },
  QrBox: {marginBottom: 20, padding: 12, flexDirection: "column"},
  QrTitle: {flexDirection: 'row', justifyContent: "space-between", alignItems: "center", marginBottom: 20},
  QrDesc: {fontSize: 17, fontWeight: 'bold', color: colors.color333},
  QrClose: {backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray},
  QrImg: {flexDirection: 'column', justifyContent: "center", alignItems: "center", marginTop: 10},
  QrCode: {fontSize: 18, fontWeight: 'bold', color: colors.color333, marginTop: 20}
});

const headerRightStyles = StyleSheet.create({
  resetBind: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 10,
    width: 100,
    padding: 10
  },
  text: {fontSize: 20, color: colors.color666}
})

export default connect(mapStateToProps)(OrderInfoNew)
