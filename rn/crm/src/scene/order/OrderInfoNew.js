import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  InteractionManager,
  PanResponder,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import HttpUtils from "../../pubilc/util/http";
import {hideModal, showModal, showSuccess, ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../../pubilc/styles/colors";
import {MapType, MapView, Marker} from "react-native-amap3d/lib/src/index";
import tool from "../../pubilc/util/tool";
import Cts from "../../pubilc/common/Cts";
import {Button} from "react-native-elements";
import pxToDp from "../../pubilc/util/pxToDp";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
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

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

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
const MENU_EDIT_BASIC = 1;
const MENU_EDIT_EXPECT_TIME = 2;
const MENU_EDIT_STORE = 3;
const MENU_FEEDBACK = 4;
const MENU_SET_INVALID = 5; // 置为无效
const MENU_ADD_TODO = 6;
const MENU_PROVIDING = 8;
const MENU_SEND_MONEY = 9;
const MENU_RECEIVE_QR = 10;
const MENU_ORDER_SCAN = 11;
const MENU_ORDER_SCAN_READY = 12;
const MENU_ORDER_CANCEL_TO_ENTRY = 13;
const MENU_REDEEM_GOOD_COUPON = 14;
const MENU_CANCEL_ORDER = 15; // 取消订单
const MENU_SET_COMPLETE = 16; // 置为完成
const MENU_CALL_STAFF = 17; // 联系员工

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
    GlobalUtil.setOrderFresh(2) //去掉订单页面刷新
    const order_id = (this.props.route.params || {}).orderId;
    const {is_service_mgr = false} = tool.vendor(this.props.global);
    this.state = {
      isRefreshing: false,
      orderId: order_id,
      is_service_mgr: is_service_mgr,
      isFetching: false,
      order: {
        orderStatus: '',
        id: '',
        pickType: '',
        printer_sn: '',
        store_id: '',
        platform: '',
      },
      actionSheet: [],
      isShowMap: false,
      delivery_list: [],
      is_merchant_add_tip: false,
      logistics: [],
      delivery_desc: '',
      show_no_rider_tips: false,
      delivery_status: '',
      itemsEdited: {},
      pickCodeStatus: false,
      allow_merchants_cancel_order: false,
      qrcode: '',
      reminds: [],
      showPrinterChooser: false,
      modalTip: false,
      showQrcode: false,
      showDeliveryModal: false,
      map_height: new Animated.Value(290),
    }

  }

  componentDidMount = () => {
    this.fetchOrder()
    this.navigationOptions()
    timeObj.method[0].endTime = getTime()
    timeObj.method[0].executeTime = timeObj.method[0].endTime - timeObj.method[0].startTime
    timeObj.method[0].executeStatus = 'success'
    timeObj.method[0].interfaceName = ''
    timeObj.method[0].methodName = 'componentDidUpdate'
    const {deviceInfo} = this.props?.device
    const {currStoreId, currentUser, accessToken} = this.props.global;
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = currStoreId
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderInfo"
    timeObj['is_record_request_monitor'] = this.props.global?.is_record_request_monitor
    calcMs(timeObj, accessToken)
    this.enableBluetooth()
  }
  setMapHeight = (map_height) => {
    Animated.timing(                       // 随时间变化而执行动画
      this.state.map_height,            // 动画中的变量值
      {
        toValue: map_height,                        // 透明度最终变为1，即完全不透明
        duration: 400,                   // 让动画持续一段时间
      }
    ).start();
  }

  UNSAFE_componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onPanResponderGrant: (evt, gestureState) => {
        return true;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (-5 < gestureState.dy && gestureState.dy < 5) {
          return;
        }
        this.setMapHeight((gestureState.dy > 10 ? 0.68 : 0.35) * height)
      },
      onPanResponderTerminationRequest: (evt, gestureState) => {
        return true;
      },
      onPanResponderRelease: (evt, gestureState) => {
        return true;

      },
      onPanResponderTerminate: (evt, gestureState) => {
        return true;
        // Another component has become the responder, so this gesture
        // should be cancelled
      }
    });

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

  enableBluetooth = () => {
    const {printer_id} = this.props.global
    if (Platform.OS === 'android' && Platform.Version >= 23 && printer_id !== '0') {
      BleManager.enableBluetooth().then().catch(() => {
        this.setState({askEnableBle: true})
      });

      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (!result) {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(() => {
          });
        }
      });
    }

  }

  handleActionSheet = (order, allow_merchants_cancel_order) => {
    const as = [
      {key: MENU_EDIT_BASIC, label: '修改地址电话发票备注'},
      {key: MENU_EDIT_EXPECT_TIME, label: '修改配送时间'},
      {key: MENU_EDIT_STORE, label: '修改门店'},
      {key: MENU_FEEDBACK, label: '客户反馈'},
      {key: MENU_RECEIVE_QR, label: '收款码'},
      {key: MENU_CALL_STAFF, label: '联系门店'},
    ];
    const {is_service_mgr} = this.state
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
    if (this._fnProvidingOnway()) {
      as.push({key: MENU_ADD_TODO, label: '稍后处理'});
      as.push({key: MENU_PROVIDING, label: '门店备货'});
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
    if (order && order?.fn_coupon_redeem_good) {
      as.push({key: MENU_REDEEM_GOOD_COUPON, label: '发放商品券'});
    }
    this.setState({actionSheet: as})
  }

  _fnProvidingOnway = () => {
    const {global} = this.props;
    const storeId = this.state.order?.store_id;
    return storeId && storeId > 0 && global?.vendor_info?.fnProvidingOnway;
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.headerRight()}
    navigation.setOptions(option);
  }

  headerRight = () => {
    return (
      <TouchableOpacity
        style={headerRightStyles.resetBind}
        onPress={() => this.navigateToOrderOperation()}
      >
        <Entypo name={"dots-three-horizontal"} style={headerRightStyles.text}/>
      </TouchableOpacity>
    )
  }

  fetchOrder = () => {
    let {orderId, isFetching} = this.state
    if (!orderId || isFetching) {
      return false;
    }
    this.setState({
      isFetching: true
    })
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    const api = `/v1/new_api/orders/order_by_id/${orderId}?access_token=${accessToken}&op_ship_call=1&bill_detail=1`
    HttpUtils.get.bind(this.props)(api, {}, true).then((res) => {
      const {obj} = res
      this.handleTimeObj(api, res.executeStatus, res.startTime, res.endTime, 'fetchOrder', res.endTime - res.startTime)
      this.handleActionSheet(obj, parseInt(obj.allow_merchants_cancel_order) === 1)
      this.setState({
        order: obj,
        isFetching: false,
        itemsEdited: this._extract_edited_items(obj.items),
        pickCodeStatus: parseInt(obj.pickType) === 1,
        allow_merchants_cancel_order: parseInt(obj.allow_merchants_cancel_order) === 1,
        qrcode: tool.length(obj.pickup_code) > 0 ? obj.pickup_code : ''
      }, () => {

        if (res?.loc_lat !== '' && res?.loc_lng !== '') {
          this.setState({
            isShowMap: true
          })
        }

        this.navigationOptions()
      })
      dispatch(getRemindForOrderPage(accessToken, orderId, (ok, desc, data) => {
        if (ok) {
          this.setState({reminds: data})
        }
      }));
      this.fetchShipData()
      this.logOrderViewed();
      this.fetchDeliveryList()
      this.fetchThirdWays()

    }, ((res) => {
      this.handleTimeObj(api, res.executeStatus, res.startTime, res.endTime, 'fetchOrder', res.endTime - res.startTime)
      ToastLong('操作失败：' + res.reason)
      this.setState({isFetching: false})
    })).catch((e) => {
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

  fetchDeliveryList = () => {
    const api = `/v1/new_api/orders/third_deliverie_record/${this.state.orderId}?access_token=${this.props.global.accessToken}`;
    HttpUtils.get.bind(this.props)(api, {}, true).then(res => {
      const {obj} = res
      this.handleTimeObj(api, res.executeStatus, res.startTime, res.endTime, 'fetchDeliveryList', res.endTime - res.startTime)
      this.setState({
        delivery_list: undefined !== obj?.delivery_lists && Array.isArray(obj.delivery_lists) ? obj.delivery_lists : [],
        is_merchant_add_tip: undefined !== obj?.is_merchant_add_tip ? Boolean(obj.is_merchant_add_tip) : false
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
    ToastLong('已复制到剪切板')
  }

  onPrint = () => {
    const {order} = this.state
    if (order.printer_sn) {
      this.setState({showPrinterChooser: true})
    } else {
      this._doBluetoothPrint()
    }
  }

  _cloudPrinterSN = () => {
    const {order} = this.state
    const printerName = order.printer_sn || '未知';
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

  closeModal = () => {
    this.setState({
      modalTip: false
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

  printAction = [
    {
      type: 'default',
      label: '取消',
      onPress: this._hidePrinterChooser
    }
  ]

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
    if (this.state.delivery_status !== '待呼叫配送') {
      this.mixpanel.track('订单详情页_>')
      this.setState({showDeliveryModal: true})
    }
  }

  closeDeliveryModal = () => {
    this.setState({showDeliveryModal: false})
  }

  renderMap = () => {
    let {loc_lat, loc_lng, store_name} = this.state.order;
    let {map_height} = this.state;
    return (
      <Animated.View style={{height: map_height}}>
        <MapView
          scrollGesturesEnabled={false}
          rotateGesturesEnabled={false}
          mapType={MapType.Navi}
          initialCameraPosition={{
            target: {latitude: Number(loc_lat), longitude: Number(loc_lng)},
            zoom: 16
          }}>
          <Marker
            draggable={false}
            position={{latitude: Number(loc_lat), longitude: Number(loc_lng)}}
            onPress={() => alert("onPress")}
          >
            <View style={{alignItems: 'center'}}>
              <View style={styles.mapBox}>
                <Text style={{
                  color: colors.white,
                  fontSize: 18,
                }}>{store_name} </Text>
              </View>
              <Entypo name={'triangle-down'}
                      style={{color: colors.main_color, fontSize: 30, position: 'absolute', top: 24}}/>
            </View>
          </Marker>
        </MapView>
      </Animated.View>
    )
  }

  renderOrderInfo = () => {
    return (
      <View style={{zIndex: 999, marginTop: -20}}>
        {this.renderOrderInfoHeader()}
        {this.renderOrderInfoCard()}
      </View>
    )
  }

  renderOrderInfoHeader = () => {
    let {delivery_status, delivery_desc, isShowMap} = this.state;
    return (
      <TouchableOpacity style={isShowMap ? styles.orderInfoHeader : styles.orderInfoHeaderNoMap}
                        onPress={() => this.deliveryModalFlag()}>
        <If condition={isShowMap}>
          <View style={styles.orderInfoHeaderFlag}/>
        </If>
        <View style={styles.orderInfoHeaderStatus}>
          <Text style={styles.orderStatusDesc}>{delivery_status}</Text>
          <Entypo name="chevron-thin-right" style={styles.orderStatusRightIcon}/>
        </View>
        <Text style={styles.orderStatusNotice}>{delivery_desc} </Text>
        {this.renderOrderInfoHeaderButton()}
      </TouchableOpacity>
    )
  }

  renderOrderInfoHeaderButton = () => {
    let {order} = this.state;
    return (
      <View style={styles.orderInfoHeaderButton}>
        <If condition={order.orderStatus === '1'}>
          <Button title={'打印订单'}
                  onPress={() => this.onPrint()}
                  buttonStyle={styles.orderInfoHeaderButtonLeft}
                  titleStyle={styles.orderInfoHeaderButtonTitleLeft}
          />
          <Button title={'下配送单'}
                  onPress={() => {
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonRight}
                  titleStyle={styles.orderInfoHeaderButtonTitleRight}
          />
        </If>
        <If condition={order.orderStatus === '2' || order.orderStatus === '3'}>
          <Button title={'取消配送'}
                  onPress={() => this.onPrint()}
                  buttonStyle={styles.orderInfoHeaderButtonLeft}
                  titleStyle={styles.orderInfoHeaderButtonTitleLeft}
          />

        </If>
        <If condition={order.orderStatus === '2' || order.orderStatus === '4' || order.orderStatus === '5'}>
          <Button title={'再次配送'}
                  onPress={() => {
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonRight}
                  titleStyle={styles.orderInfoHeaderButtonTitleRight}
          />
        </If>
        <If condition={order.orderStatus === '3'}>
          <Button title={'完成配送'}
                  onPress={() => {
                  }}
                  buttonStyle={styles.orderInfoHeaderButtonRight}
                  titleStyle={styles.orderInfoHeaderButtonTitleRight}
          />
        </If>
        <If condition={order.orderStatus === '5'}>
          <Button title={'联系达达'}
                  onPress={() => this.onPrint()}
                  buttonStyle={styles.orderInfoHeaderButtonLeft}
                  titleStyle={styles.orderInfoHeaderButtonTitleLeft}
          />
        </If>
      </View>
    )
  }

  renderOrderInfoCard = () => {
    let {order, is_service_mgr} = this.state;
    return (
      <View style={[styles.orderInfoCard, {marginTop: 10}]}>
        <View style={styles.orderCardHeader}>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <Image
              source={{url: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E7%BE%8E%E5%9B%A2%E5%A4%96%E5%8D%96%403x.png'}}
              style={styles.orderCardIcon}/>
            <View style={styles.orderCardInfo}>
              <Text style={styles.orderCardInfoTop}># {order?.platform_dayId} </Text>
              <Text style={styles.orderCardInfoBottom}>{order?.store_name} #{order?.dayId} </Text>
            </View>
          </View>
          <If condition={order?.pickType === '1'}>
            <Button title={'查看取货码'}
                    onPress={() => this.showQrcodeFlag()}
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
            <FontAwesome5 solid={false} onPress={() => this.dialNumber(order?.mobile)} name={'phone'}
                          style={styles.cardTitlePhone}/>
          </View>
        </View>
        <View style={styles.cuttingLine}/>
        <View style={[styles.orderCardContainer, {flexDirection: "row"}]}>
          <Text style={styles.remarkLabel}>备注 </Text>
          <Text style={styles.remarkValue}>{order?.remark} </Text>
        </View>
        <View style={styles.cuttingLine}/>
        <View style={[styles.orderCardContainer, {flexDirection: "column"}]}>
          <Text style={styles.cardTitle}>商品{order?.items?.length}件 </Text>
          <If condition={order?.items?.length >= 1}>
            <For index='index' each='info' of={order?.items}>
              <View style={styles.productInfo} key={index}>
                <Image
                  source={{url: info?.product_img !== '' ? info?.product_img : 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E6%9A%82%E6%97%A0%E5%9B%BE%E7%89%87%403x.png'}}
                  style={styles.productImage}
                />
                <View style={styles.productItem}>
                  <Text style={styles.productItemName}>{info?.product_name} </Text>
                  <Text style={styles.productItemId}>#{info?.product_id} </Text>
                  <View style={styles.productItemPrice}>
                    <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                      <If condition={is_service_mgr || order?.is_fn_show_wm_price}>
                        <Text style={styles.priceBao}>保</Text>
                        <Text style={styles.price}>{numeral(info?.supply_price / 100).format('0.00')}元 </Text>
                        <Text style={styles.priceWai}>外</Text>
                        <Text style={styles.price}>{numeral(info?.price).format('0.00')}元 </Text>
                      </If>
                      <If condition={!is_service_mgr && !order?.is_fn_show_wm_price}>
                        <If condition={order?.is_fn_price_controlled}>
                          <Text
                            style={[styles.price, {marginRight: 10}]}>{numeral(info?.supply_price / 100).format('0.00')}元 </Text>
                          <Text style={styles.priceBao}>保</Text>
                          <Text style={styles.price}>总价 {numeral(info?.supply_price / 100).format('0.00')}元 </Text>
                        </If>
                        <If condition={!order?.is_fn_price_controlled}>
                          <Text
                            style={[styles.price, {marginRight: 10}]}>总价 {numeral(info?.supply_price / 100).format('0.00')}元 </Text>
                          <Text style={styles.priceWai}>外</Text>
                          <Text style={styles.price}>{numeral(info?.price).format('0.00')}元 </Text>
                        </If>
                      </If>
                    </View>
                    <Text style={styles.productNum}> x {info?.num} </Text>
                  </View>
                </View>
              </View>
            </For>
          </If>
        </View>
        <View style={styles.cuttingLine}/>
        <View style={[styles.orderCardContainer, {
          flexDirection: "column",
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6
        }]}>
          <If condition={order?.is_fn_price_controlled}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>供货价小计 </Text>
              <Text style={styles.remarkValue}>{numeral(order?.supply_price / 100).format('0.00')}元 </Text>
            </View>
          </If>
          <If condition={is_service_mgr || !order?.is_fn_price_controlled || order?.is_fn_show_wm_price}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>顾客实付 </Text>
              <Text style={styles.remarkValue}>{numeral(order?.orderMoney).format('0.00')}元 </Text>
            </View>
          </If>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>优惠信息 </Text>
            <Text style={styles.remarkValue}>{numeral(order?.self_activity_fee / 100).format('0.00')}元 </Text>
          </View>
          <If condition={order?.bill && order?.bill?.total_income_from_platform}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>平台结算 </Text>
              <Text style={styles.remarkValue}>{order?.bill.total_income_from_platform[1]}元 </Text>
            </View>
          </If>
          <If condition={is_service_mgr || !order?.is_fn_price_controlled}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>订单原价 </Text>
              <Text style={styles.remarkValue}>{numeral(order?.total_goods_price / 100).format('0.00')}元 </Text>
            </View>
          </If>
        </View>
      </View>
    )
  }

  renderDeliveryInfo = () => {
    let {order} = this.state;
    return (
      <View style={styles.orderInfoCard}>
        <View style={[styles.orderCardContainer, {flexDirection: "column", borderRadius: 6}]}>
          <Text style={styles.cardTitle}>配送信息 </Text>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>配送门店 </Text>
            <Text style={styles.remarkValue}>{order?.store_name} </Text>
          </View>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>下单时间 </Text>
            <Text style={styles.remarkValue}>{order?.orderTime} </Text>
          </View>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>物品信息 </Text>
            <Text style={styles.remarkValue}>蛋糕 /200元/3千克 </Text>
          </View>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>配送方式 </Text>
            <Text style={styles.remarkValue}>自配送/美团跑腿 </Text>
          </View>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>骑手信息 </Text>
            <Text style={styles.remarkValue}>叶佳华 </Text>
          </View>
          <TouchableOpacity style={styles.productItemRow} onPress={() => this.dialNumber(17678024864)}>
            <Text style={styles.remarkLabel}>骑手电话 </Text>
            <View style={{flexDirection: "row"}}>
              <Text style={styles.remarkValue}>17678024864 </Text>
              <Text style={styles.copyText}>拨打 </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.productItemRow}>
            <Text style={styles.remarkLabel}>配送费用 </Text>
            <Text style={styles.remarkValue}>{numeral(order?.deliver_fee / 100).format('0.00')}元 </Text>
          </View>
          <View style={styles.cuttingLine1}/>
          <If condition={tool.length(order.greeting) > 0}>
            <View style={styles.productItemRow}>
              <Text style={styles.remarkLabel}>祝福语 </Text>
              <Text style={styles.remarkValue}>{order?.greeting} </Text>
            </View>
          </If>
          <TouchableOpacity style={styles.productItemRow} onPress={() => this.dialNumber(order?.mobile)}>
            <Text style={styles.remarkLabel}>订购人电话 </Text>
            <View style={{flexDirection: "row"}}>
              <Text style={styles.remarkValue}>{order?.mobile} </Text>
              <Text style={styles.copyText}>拨打 </Text>
            </View>
          </TouchableOpacity>
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
          visible={true}
          onRequestClose={this._hidePrinterChooser}
          menus={menus}
          actions={this.printAction}
        />
      </View>)
  }

  renderQrCode = () => {
    let {showQrcode, qrcode} = this.state;
    return (
      <JbbModal visible={showQrcode} onClose={this.closeQrCodeModal} modal_type={'center'}>
        <View style={styles.QrBox}>
          <View style={styles.QrTitle}>
            <Text style={styles.QrDesc}>查看取货码</Text>
            <Entypo onPress={this.closeQrCodeModal} name="cross" style={styles.QrClose}/>
          </View>
          <View style={styles.QrImg}>
            <QRCode value={qrcode} color="black" size={200}/>
            <Text style={styles.QrCode}>{qrcode} </Text>
          </View>
        </View>
      </JbbModal>
    )
  }

  renderDeliveryModal = () => {
    let {delivery_list, order, showDeliveryModal, orderId} = this.state;
    return (
      <DeliveryStatusModal
        id={orderId}
        pl_name={order?.pl_name}
        platform_dayId={order?.platform_dayId}
        expectTimeStr={order?.expectTimeStr}
        visible={showDeliveryModal}
        delivery_list={delivery_list}
        onClose={this.closeDeliveryModal}
      />
    )
  }

  render() {
    const {isRefreshing, isShowMap, order} = this.state
    if (order?.orderStatus === '4') {
      this.setState({
        isShowMap: false
      })
    }
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchOrder}/>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => this.fetchOrder()}
              tintColor='gray'
            />}
          style={styles.Content}>

          {this.renderPrinter()}
          <View  {...this._panResponder.panHandlers}>
            <If condition={isShowMap}>
              {this.renderMap()}
            </If>
            {this.renderOrderInfo()}
          </View>
          {this.renderDeliveryInfo()}
          {this.renderOrderDescInfo()}
          {this.renderOperationLog()}
          {this.renderQrCode()}
          {this.renderDeliveryModal()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5'},
  mapBox: {
    zIndex: 999,
    backgroundColor: colors.main_color,
    marginBottom: 15,
    padding: 8,
    borderRadius: 6,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.main_color
  },
  orderInfoHeader: {
    height: 138,
    backgroundColor: colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: "column",
    alignItems: "center"
  },
  orderInfoHeaderNoMap: {
    height: 128,
    backgroundColor: colors.white,
    flexDirection: "column",
    paddingLeft: 20,
    paddingTop: 20,
    width: width * 0.94,
    marginLeft: width * 0.03,
    borderRadius: 6
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
    fontWeight: '500'
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
    marginVertical: 10
  },
  orderInfoHeaderButtonLeft: {
    width: 100,
    height: 35,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.main_color,
    marginRight: 10
  },
  orderInfoHeaderButtonTitleLeft: {
    fontWeight: '500',
    fontSize: 14,
    color: colors.main_color
  },
  orderInfoHeaderButtonRight: {
    width: 100,
    height: 35,
    borderRadius: 21,
    backgroundColor: colors.main_color
  },
  orderInfoHeaderButtonTitleRight: {
    fontWeight: '500',
    fontSize: 14,
    color: colors.white
  },
  orderInfoCard: {
    width: width * 0.94,
    backgroundColor: colors.white,
    marginLeft: width * 0.03,
    borderRadius: 6,
    marginBottom: 10
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
  orderCardInfoTop: {fontSize: 16, fontWeight: '500', color: colors.color333, marginBottom: pxToDp(5)},
  orderCardInfoBottom: {fontSize: 12, fontWeight: '400', color: colors.color999},
  orderCardContainer: {
    width: width * 0.94,
    backgroundColor: colors.white,
    padding: 12
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.color333,
    marginBottom: 10
  },
  logLabel: {
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '500'
  },
  cardTitlePhone: {
    fontSize: 16
  },
  cuttingLine: {
    backgroundColor: colors.e5,
    height: 0.5,
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
  productItemName: {fontSize: 12, fontWeight: '400', color: '#1A1614'},
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
    marginRight: pxToDp(10),
    marginLeft: 20
  },
  price: {fontSize: 12, fontWeight: '400', color: '#1A1614'},
  productNum: {fontWeight: '400', fontSize: 12, color: colors.color666},
  productItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10
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
  QrDesc: {fontSize: 17, fontWeight: '500', color: colors.color333},
  QrClose: {backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray},
  QrImg: {flexDirection: 'column', justifyContent: "center", alignItems: "center", marginTop: 10},
  QrCode: {fontSize: 18, fontWeight: '500', color: colors.color333, marginTop: 20}
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
