import React, {Component} from 'react'
import ReactNative, {
  Alert,
  Clipboard,
  Dimensions,
  Modal,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import native from '../../pubilc/util/native'
import tool from '../../pubilc/util/tool'
import {bindActionCreators} from "redux";
import Config from '../../pubilc/common/config'
import OrderBottom from './OrderBottom'
import Tips from "../common/component/Tips";
import {
  addTipMoneyNew,
  clearLocalOrder,
  getOrder,
  getRemindForOrderPage,
  orderCancelZsDelivery,
  orderChangeLog,
  orderWayRecord,
  printInCloud,
  saveOrderItems,
} from '../../reducers/order/orderActions'
import {getContacts} from '../../reducers/store/storeActions';
import {markTaskDone} from '../../reducers/remind/remindActions';
import {connect} from "react-redux";
import pxToDp from "../../pubilc/util/pxToDp";
import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import Cts from '../../pubilc/common/Cts'
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../../pubilc/styles/colors";
import {Button} from "react-native-elements";
import pxToEm from "../../pubilc/util/pxToEm";
import styles from "./OrderStyles";
import Icons from "react-native-vector-icons/FontAwesome";
import QRCode from "react-native-qrcode-svg";
import HttpUtils from "../../pubilc/util/http";
import {ActionSheet, Input} from "../../weui";
import BleManager from "react-native-ble-manager";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import {print_order_to_bt} from "../../pubilc/util/ble/OrderPrinter";
import Refund from "./_OrderScene/Refund";
import FloatServiceIcon from "../common/component/FloatServiceIcon";
import ItemRow from "../../pubilc/component/ItemRow";
import OrderReminds from "../../pubilc/component/OrderReminds";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";
import {getTime} from "../../pubilc/util/TimeUtil";

const numeral = require('numeral');
const {InteractionManager} = ReactNative;

function mapStateToProps(state) {
  return {
    order: state.order,
    global: state.global,
    store: state.store,
    device:state.device
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      getContacts,
      getOrder,
      printInCloud,
      getRemindForOrderPage,
      saveOrderItems,
      markTaskDone,
      orderWayRecord,
      clearLocalOrder,
      orderCancelZsDelivery,
    }, dispatch)
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

const {StyleSheet} = ReactNative

const _editNum = function (edited, item) {
  return edited ? edited.num - (item.origin_num === null ? item.num : item.origin_num) : 0;
};

const MENU_EDIT_BASIC = 1;
const MENU_EDIT_EXPECT_TIME = 2;
const MENU_EDIT_STORE = 3;
const MENU_FEEDBACK = 4;
const MENU_SET_INVALID = 5; // 置为无效
const MENU_ADD_TODO = 6;
const MENU_OLD_VERSION = 7;
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

const timeObj={
  deviceInfo:{},
  currentStoreId:'',
  currentUserId:'',
  moduleName:'',
  componentName:'',
  method:[]
}//记录耗时的对象

class OrderInfo extends Component {
  constructor(props) {
    super(props);
    timeObj.method.push({startTime:getTime(),methodName: 'componentDidMount'})
    const {is_service_mgr = false} = tool.vendor(this.props.global);
    const order_id = (this.props.route.params || {}).orderId;
    GlobalUtil.setOrderFresh(2) //去掉订单页面刷新
    this.state = {
      modalTip: false,
      showChangeLogList: true,
      showGoodsList: false,
      order_id: order_id,
      order: {},
      ActionSheet: [],
      isFetching: false,
      shipCallHided: true,
      isEditing: false,
      itemsAdded: {},
      itemsEdited: {},
      orderChangeLogs: [],
      orderWayLogs: {},
      delivery_list: [],
      addTipMoney: false,
      is_service_mgr: is_service_mgr,
      logistics: [],
      cat_code_status: false,
      allow_merchants_cancel_order: false,
      pickCodeStatus: false,
      showQrcode: false,
      show_no_rider_tips: false,
      showDeliveryModal: false,
      deliverie_status: '',
      deliverie_desc: '',
      pickCode: '',
      toastContext: '',
      addTipModal: false,
      addMoneyNum: '',
      respReason: '',
      ok: true,
      is_merchant_add_tip: 0,
      step: 0
    };
    this.fetchOrder(order_id);
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  fetchData = () => {
    this.fetchOrder(this.state.order_id)
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if(timeObj.method.length>0) {
      const endTime=getTime()
      const startTime=timeObj.method[0].startTime
      timeObj.method.push({
        interfaceName:'',
        executeStatus:'success',
        startTime:startTime,
        endTime:endTime,
        methodName:'componentDidUpdate',
        executeTime:endTime-startTime
      })
      const duplicateObj= {...timeObj}
      timeObj.method=[]
      calcMs(duplicateObj,this.props.global.accessToken)
    }
  }

  componentDidMount() {
    timeObj.method[0].endTime=getTime()
    timeObj.method[0].executeTime=timeObj.method[0].endTime-timeObj.method[0].startTime
    timeObj.method[0].executeStatus='success'
    timeObj.method[0].interfaceName=''
    timeObj.method[0].methodName='componentDidUpdate'
    const {deviceInfo} = this.props.device
    const {currStoreId, currentUser,accessToken,config} = this.props.global;
    timeObj['deviceInfo']=deviceInfo
    timeObj.currentStoreId=currStoreId
    timeObj.currentUserId=currentUser
    timeObj['moduleName']="订单"
    timeObj['componentName']="OrderInfo"
    timeObj['is_record_request_monitor']=config.is_record_request_monitor
    calcMs(timeObj,accessToken)
  }
  fetchOrder(order_id) {
    if (!order_id || this.state.isFetching) {
      return false;
    }
    this.setState({
      isFetching: true,
    })
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    const api = `/v1/new_api/orders/order_by_id/${order_id}?access_token=${accessToken}&op_ship_call=1&bill_detail=1`
    HttpUtils.get.bind(this.props)(api,{},true).then((res) => {
      const {obj}=res
      timeObj.method.push({
        interfaceName:api,
        executeStatus:res.executeStatus,
        startTime:res.startTime,
        endTime:res.endTime,
        methodName:'fetchOrder',
        executeTime:res.endTime-res.startTime
      })
      this.setState({
        order: obj,
        isFetching: false,
        itemsEdited: this._extract_edited_items(obj.items),
        pickCodeStatus: parseInt(obj.pickType) === 1,
        allow_merchants_cancel_order: parseInt(obj.allow_merchants_cancel_order) === 1,
        qrcode: tool.length(obj.pickup_code) > 0 ? obj.pickup_code : '',
      }, () => {
        this.setHeader()
      });
      dispatch(getRemindForOrderPage(accessToken, order_id, (ok, desc, data) => {
        if (ok) {
          this.setState({reminds: data})
        }
      }));
      this._orderChangeLogQuery();
      this.fetchShipData()
      this.logOrderViewed();
      this.fetchDeliveryList()
      this.fetchThirdWays()

    }, ((res) => {
      timeObj.method.push({
        interfaceName:api,
        executeStatus:res.executeStatus,
        startTime:res.startTime,
        endTime:res.endTime,
        methodName:'fetchOrder',
        executeTime:res.endTime-res.startTime
      })
      ToastLong('操作失败：' + res.reason)
      this.setState({isFetching: false})

    })).catch((e) => {
      timeObj.method.push({
        interfaceName:api,
        executeStatus:e.executeStatus,
        startTime:e.startTime,
        endTime:e.endTime,
        methodName:'fetchOrder',
        executeTime:e.endTime-e.startTime
      })
      ToastLong('操作失败：' + e.desc)
      this.setState({isFetching: false})

    })
  }

  fetchShipData() {
    const api = `/v1/new_api/orders/third_ship_deliverie/${this.state.order_id}?access_token=${this.props.global.accessToken}`;
    HttpUtils.get.bind(this.props)(api,{},true).then(res => {
      const {obj}=res
      timeObj.method.push({
        interfaceName:api,
        executeStatus:res.executeStatus,
        startTime:res.startTime,
        endTime:res.endTime,
        methodName:'fetchShipData',
        executeTime:res.endTime-res.startTime
      })
      this.setState({
        deliverie_status: obj.show_status,
        show_no_rider_tips: obj.show_no_rider_tips === 1,
        deliverie_desc: obj.desc,
        logistics: obj.third_deliverie_list
      })

    })
  }

  fetchDeliveryList() {
    const api = `/v1/new_api/orders/third_deliverie_record/${this.state.order_id}?access_token=${this.props.global.accessToken}`;
    HttpUtils.get.bind(this.props)(api,{},true).then(res => {
      const {obj}=res
      timeObj.method.push({
        interfaceName:api,
        executeStatus:res.executeStatus,
        startTime:res.startTime,
        endTime:res.endTime,
        methodName:'fetchDeliveryList',
        executeTime:res.endTime-res.startTime
      })
      this.setState({
        delivery_list: undefined!== obj?.delivery_lists && Array.isArray(obj.delivery_lists) ? obj.delivery_lists : [],
        is_merchant_add_tip: undefined!== obj?.is_merchant_add_tip ? Boolean(obj.is_merchant_add_tip) : false
      })

    })
  }

  fetchThirdWays() {
    let {orderStatus} = this.state.order;
    if (orderStatus === Cts.ORDER_STATUS_TO_READY || orderStatus === Cts.ORDER_STATUS_TO_SHIP) {
      const api = `/api/order_third_logistic_ways/${this.state.order_id}?select=1&access_token=${this.props.global.accessToken}`;
      HttpUtils.get.bind(this.props.navigation)(api,{},true).then((res) => {
        timeObj.method.push({
          interfaceName:api,
          executeStatus:res.executeStatus,
          startTime:res.startTime,
          endTime:res.endTime,
          methodName:'fetchThirdWays',
          executeTime:res.endTime-res.startTime
        })
      }).catch(error=>{
        timeObj.method.push({
          interfaceName:api,
          executeStatus:error.executeStatus,
          startTime:reerrors.startTime,
          endTime:error.endTime,
          methodName:'fetchThirdWays',
          executeTime:error.endTime-error.startTime
      })
    })
  }}

  navigateToOrderOperation = () => {
    this.props.navigation.navigate('OrderOperation', {
      ActionSheet: this.state.ActionSheet,
      order: this.state.order,
      orderId: this.props.route.params.orderId
    });
  }

  closeModal = () => {
    this.setState({
      modalTip: false
    })
  }

  _extract_edited_items = (items) => {
    const edits = {};
    (items || []).filter((item => item.origin_num !== null && item.num > item.origin_num)).forEach((item) => {
      edits[item.id] = item;
    });
    return edits;
  }

  logOrderViewed() {
    let {id, orderStatus} = this.state.order;
    if (orderStatus === Cts.ORDER_STATUS_TO_READY || orderStatus === Cts.ORDER_STATUS_TO_SHIP) {
      let url = `/api/log_view_order/${id}?access_token=${this.props.global.accessToken}`;
      HttpUtils.post.bind(this.props)(url,{},true).then(res => {
        timeObj.method.push({
          interfaceName:url,
          executeStatus:res.executeStatus,
          startTime:res.startTime,
          endTime:res.endTime,
          methodName:'logOrderViewed',
          executeTime:res.endTime-res.startTime
        })
      }, () => {
        // ToastLong(res.desc);
      }).catch((res) => {
        timeObj.method.push({
          interfaceName:url,
          executeStatus:res.executeStatus,
          startTime:res.startTime,
          endTime:res.endTime,
          methodName:'logOrderViewed',
          executeTime:res.endTime-res.startTime
        })
        ToastLong("记录订单访问次数错误！");
      })
    }
  }

  setHeader = () => {
    let {order, is_service_mgr, allow_merchants_cancel_order} = this.state
    let {wsb_store_account} = this.props.global.config.vendor

    const moreOperationsStyles = {
      ...Platform.select({
        ios: {
          marginTop: pxToDp(25),
        },
        android: {}
      }),
      marginRight: pxToDp(20),
      height: pxToDp(60),
      width: pxToDp(60),
      fontSize: pxToDp(30),
      color: colors.color666,
      textAlign: 'center',
      textAlignVertical: 'center',
    }
    const as = [
      {key: MENU_EDIT_BASIC, label: '修改地址电话发票备注'},
      {key: MENU_EDIT_EXPECT_TIME, label: '修改配送时间'},
      {key: MENU_EDIT_STORE, label: '修改门店'},
      {key: MENU_FEEDBACK, label: '客户反馈'},
      {key: MENU_RECEIVE_QR, label: '收款码'},
      {key: MENU_CALL_STAFF, label: '联系门店'},
    ];
    if (is_service_mgr) {
      as.push({key: MENU_SET_INVALID, label: '置为无效'});
    }
    if (is_service_mgr || allow_merchants_cancel_order) {
      as.push({key: MENU_CANCEL_ORDER, label: '取消订单'});
    }
    if (is_service_mgr || wsb_store_account === "1") {
      as.push({key: MENU_SET_COMPLETE, label: '置为完成'});
    }
    if (this._fnProvidingOnway()) {
      as.push({key: MENU_ADD_TODO, label: '稍后处理'});
      as.push({key: MENU_PROVIDING, label: '门店备货'});
    }
    if (order && order.fn_scan_items) {
      as.push({key: MENU_ORDER_SCAN, label: '订单过机'});
    }
    if (order && order.fn_scan_ready) {
      as.push({key: MENU_ORDER_SCAN_READY, label: '扫码出库'});
    }
    if (is_service_mgr) {
      as.push({key: MENU_SEND_MONEY, label: '发红包'});
    }
    if (order && order.cancel_to_entry) {
      as.push({key: MENU_ORDER_CANCEL_TO_ENTRY, label: '退单入库'});
    }
    if (order && order.fn_coupon_redeem_good) {
      as.push({key: MENU_REDEEM_GOOD_COUPON, label: '发放商品券'});
    }
    this.setState({ActionSheet: as})
    let {navigation} = this.props;
    navigation.setOptions({
      headerTitle: '订单详情',
      headerRight: () => (
        <View style={Styles.flexRowAlignCenter}>
          <Text style={Styles.printText}
                onPress={() => {
                  this.onPrint()
                }}>打印</Text>

          <TouchableOpacity onPress={() => this.navigateToOrderOperation()}>
            <Entypo name='dots-three-horizontal' style={moreOperationsStyles}/>
          </TouchableOpacity>
        </View>),
    });
  }

  onPrint = () => {
    const order = this.state.order
    if (order.printer_sn) {
      this.setState({showPrinterChooser: true})
    } else {
      this._doBluetoothPrint()
    }
  }

  _hidePrinterChooser = () => {
    this.setState({showPrinterChooser: false})
  }

  _doCloudPrint = () => {
    const {dispatch, global} = this.props;
    this._hidePrinterChooser()
    dispatch(printInCloud(global.accessToken, this.state.order.id, (ok, msg) => {
      if (ok) {
        ToastShort("已发送到打印机");
      } else {
        ToastLong('打印失败：' + msg)
      }
      this._hidePrinterChooser();
    }))
  }

  _cloudPrinterSN = () => {
    const order = this.state.order;
    const printerName = order.printer_sn || '未知';
    return `云打印(${printerName})`;
  }

  _doBluetoothPrint = () => {
    this._hidePrinterChooser()
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      BleManager.enableBluetooth().then(() => {
      }).catch((error) => {
        this.setState({askEnableBle: true})
      });

      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (!result) {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
          });
        }
      });
    }
    let order = this.state.order;
    const {printer_id} = this.props.global
    if (printer_id) {
      setTimeout(() => {
        const clb = (msg, error) => {
          if (msg === 'ok') {
            ToastShort("已发送给蓝牙打印机！");
          }
          this._hidePrinterChooser();
        };
        BleManager.retrieveServices(printer_id).then((peripheral) => {
          print_order_to_bt(this.props, peripheral, clb, order.id, order);
        }).catch((error) => {
          BleManager.connect(printer_id).then(() => {
            BleManager.retrieveServices(printer_id).then((peripheral) => {
              print_order_to_bt(this.props, peripheral, clb, order.id, order);
            }).catch((error) => {
              //忽略第二次的结果
            })
          }).catch((error) => {
            Alert.alert('提示', '打印机已断开连接', [{
              text: '确定', onPress: () => {
                this.props.navigation.navigate(Config.ROUTE_PRINTERS)
              }
            }, {
              'text': '取消', onPress: () => {
              }
            }]);
            this._hidePrinterChooser();
          });
        });
      }, 300);
    } else {
      Alert.alert('提示', '尚未连接到打印机', [{
        text: '确定', onPress: () => {
          this.props.navigation.navigate(Config.ROUTE_PRINTERS)
        }
      }, {
        'text': '取消', onPress: () => {
        }
      }]);
    }

  }

  _doSunMiPint = () => {
    const {order} = this.state;
    native.printSmPrinter(order, (ok, msg) => {
    });
    this._hidePrinterChooser();
  }

  _dispatchToInvalidate = () => {
    const {dispatch} = this.props;
    dispatch(clearLocalOrder(this.state.order_id));
    this.fetchData();
  }

  _fnProvidingOnway = () => {
    const {global} = this.props;
    const storeId = this.state.order.store_id;
    return storeId && storeId > 0 && (tool.vendorOfStoreId(storeId, global) || {}).fnProvidingOnway;
  }

  _orderChangeLogQuery = () => {
    const {dispatch, global} = this.props;
    dispatch(orderChangeLog(this.state.order_id, global.accessToken, (ok, msg, contacts) => {
      if (ok) {
        this.setState({orderChangeLogs: contacts});
      } else {
        ToastLong(msg)
      }
    }));
  }

  _doProcessRemind = (remind) => {
    const {order} = this.state;
    const {dispatch, global} = this.props;
    const remindType = parseInt(remind.type);
    if (remindType === Cts.TASK_TYPE_REFUND_BY_USER || remindType === Cts.TASK_TYPE_AFS_SERVICE_BY_USER) {
      this.onPress(Config.ROUTE_REFUND_AUDIT, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_REMIND) {
      this.onPress(Config.ROUTE_ORDER_URGE, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_DELIVERY_FAILED) {
      this.onPress(Config.ROUTE_JD_AUDIT_DELIVERY, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_ORDER_CHANGE) {
      this.setState({onSubmitting: true});
      showModal('处理中')
      const token = global.accessToken;
      dispatch(markTaskDone(token, remind.id, Cts.TASK_STATUS_DONE, (ok, msg, data) => {
        const state = {onSubmitting: false};
        hideModal()
        if (ok) {
          showSuccess('已处理');
          // state.onProcessed = true;
          setTimeout(() => {
            remind.status = Cts.TASK_STATUS_DONE;
            // this.setState({onProcessed: false});
          }, 2000);
        } else {
          ToastLong(msg)
        }
        this.setState(state);
      }));
    } else {
      ToastLong('暂不支持该处理类型')
    }
  }

  copyToClipboard = (val) => {
    Clipboard.setString(val)
    ToastLong('已复制到剪切板')
  }

  showQrcodeFlag = () => {
    this.setState({
      showQrcode: !this.state.showQrcode
    })
  }

  deliveryModalFlag = () => {
    if (this.state.deliverie_status !== '已接单' && this.state.deliverie_status !== '待呼叫配送') {
      this.setState({showDeliveryModal: true})
    }
  }

  noRiderTipsFlag = () => {
    this.setState({
      modalTip: true
    })
  }

  renderPrinter = () => {
    const remindNicks = tool.length(this.state.reminds) > 0 ? this.state.reminds.nicknames : '';
    const reminds = tool.length(this.state.reminds) > 0 ? this.state.reminds.reminds : [];
    const task_types = this.props.global.config.task_types || {};
    let {order = {}, modalTip} = this.state;
    const menus = [
      {
        type: 'default',
        label: this._cloudPrinterSN(),
        onPress: this._doCloudPrint.bind(this)
      }, {
        type: 'default',
        label: '蓝牙打印',
        onPress: this._doBluetoothPrint.bind(this)
      }, {
        type: 'default',
        label: '商米打印',
        onPress: this._doSunMiPint.bind(this)
      }
    ]
    const printAction = [
      {
        type: 'default',
        label: '取消',
        onPress: this._hidePrinterChooser.bind(this)
      }
    ]
    return (
        <View>
          <Tips navigation={this.props.navigation} orderId={order.id}
                storeId={order.store_id} key={order.id} modalTip={modalTip}
                onItemClick={() => this.closeModal()}/>
          <OrderReminds task_types={task_types} reminds={reminds} remindNicks={remindNicks}
                        processRemind={this._doProcessRemind.bind(this)}/>
          <ActionSheet
              visible={this.state.showPrinterChooser}
              onRequestClose={() => this._hidePrinterChooser()}
              menus={menus}
              actions={printAction}
          />
        </View>)
  }

  renderHeader = () => {
    let {order} = this.state;
    return (
      <View style={Styles.headerBody}>
        <View style={Styles.headerBodyTitle}>
          <View style={Styles.flexRow}>
            <Text style={order.status_show === '订单已取消' ? Styles.orderStatus : Styles.orderStatusShow}>{order.status_show}  </Text>
            <View style={styles.flex1}/>
            <Text style={Styles.orderSeq}>{order.show_seq}  </Text>
          </View>
          <View style={Styles.orderExpectTime}>
            <Text style={Styles.orderExpectTimeLabel}>预计送达时间</Text>
            <Text style={Styles.orderExpectTimeContent}>{order.expectTime} </Text>
          </View>
        </View>
        <View style={styles.p20}>
          <View style={Styles.flexRow}>
            <Text style={Styles.orderCreateTime}>下单时间 </Text>
            <Text style={Styles.f12}>{order.orderTime}  </Text>
            <View style={styles.flex1}></View>
            <Text style={Styles.f12}>{order.show_store_name}  </Text>
          </View>
          <TouchableOpacity onPress={() => {
            this.copyToClipboard(order.id)
          }} style={Styles.flexRowMT15}>
            <Text style={Styles.f12w110}>订单号 </Text>
            <Text style={Styles.f12}>{order.id}  </Text>
            <Text style={Styles.copyText}>复制 </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.copyToClipboard(order.platform_oid)} style={Styles.flexRowMT15}>
            <Text style={Styles.f12w110}>平台单号 </Text>
            <Text style={Styles.f12}>{order.platform_oid} </Text>
            <Text style={Styles.copyText}>复制 </Text>
          </TouchableOpacity>
          {tool.length(order.remark) > 0 ? <View style={Styles.MT15}>
            <View style={Styles.flexRow}>
              <Text style={Styles.f12w110}>客户备注 </Text>
              <Text style={Styles.remarkTxt}>{order.remark}  </Text>
            </View>
          </View> : null}

          {tool.length(order.store_remark) > 0 ? <View style={Styles.MT15}>
            <View style={Styles.flexRow}>
              <Text style={Styles.f12w110}>商户备注 </Text>
              <Text style={Styles.orderRemark}>{order.store_remark}  </Text>
            </View>
          </View> : null}
          {tool.length(order.giver_phone) > 0 ? <View style={Styles.MT15}>
            <View style={Styles.flexRow}>
              <Text style={Styles.f12w110}>订购人电话 </Text>
              <Text style={Styles.orderRemark}>{order.giver_phone}  </Text>
            </View>
          </View> : null}
          {tool.length(order.invoice) > 0 ? <View style={Styles.MT15}>
            <View style={Styles.flexRow}>
              <Text style={Styles.f12w110}>发票抬头 </Text>
              <Text style={Styles.orderRemark}>{order.invoice}  </Text>
            </View>
          </View> : null}
          {tool.length(order.taxer_id) > 0 ? <View style={Styles.MT15}>
            <View style={Styles.flexRow}>
              <Text style={Styles.f12w110}>税号 </Text>
              <Text style={Styles.orderRemark}>{order.taxer_id}  </Text>
            </View>
          </View> : null}
          {tool.length(order.greeting) > 0 ? <View style={Styles.MT15}>
            <View style={Styles.flexRow}>
              <Text style={Styles.f12w110}>祝福语 </Text>
              <Text style={Styles.f12}>{order.greeting}  </Text>
            </View>
          </View> : null}
        </View>
      </View>
    )
  }

  renderDelivery() {
    return (
        <View style={Styles.deliveryBody}>
          {this.state.order.pickType === '1' ? <TouchableOpacity onPress={() => this.showQrcodeFlag()} style={Styles.flexRow}>
            <Text style={Styles.qrcodeLabel}>取货码：{this.state.qrcode} </Text>
            <MaterialCommunityIcons name={'focus-field'}
                                    style={Styles.qrcodeIcon}/>
          </TouchableOpacity> : null}

          {this.state.order.pickType === '1' ?
              <View style={Styles.qrcodeContent}>
                <QRCode
                    value={this.state.qrcode}
                    color="black"
                    size={150}
                />
              </View> : null}
          <If condition={this.state.order.pickType !== '1'}>
            <TouchableOpacity onPress={() => this.deliveryModalFlag()}>
              <Text style={Styles.deliveryStatusText}>{this.state.deliverie_status} </Text>
              <Text style={Styles.deliveryStatusInfo}>
                <Text style={Styles.color333}> {this.state.deliverie_desc}  </Text>
                {this.state.deliverie_status !== '已接单' && this.state.deliverie_status !== '待呼叫配送' ?
                    <Entypo name='chevron-thin-right' style={{fontSize: 14}}/> : null}
              </Text>
            </TouchableOpacity>

            {this.state.order.platform === '6' ?
                <View style={Styles.platformQR}>
                  <QRCode
                      value={this.state.order.platform_oid}
                      color="black"
                      size={150}
                  />
                  <Text style={Styles.platformText}>{this.state.order.platform_oid} </Text>
                </View> : null}

            {this.renderDeliveryInfo()}

            <If condition={this.state.show_no_rider_tips}>
              <TouchableOpacity onPress={() => this.noRiderTipsFlag()} style={Styles.noRiderTips}>
                <View style={Styles.noRiderTipsHeader}>
                  <Entypo name='help-with-circle' style={Styles.questionIcon}/>
                  <Text style={Styles.noRiderTipsLabel}>长时间没有骑手接单怎么办？</Text>
                </View>
              </TouchableOpacity>
            </If>
          </If>
        </View>
    )
  }

  renderDeliveryInfo = () => {
    return (<View style={styles.flex1}>
      <For each="item" index="i" of={this.state.logistics}>
        <If condition={item.is_show === 1} key={i}>
          <View style={this.state.logistics.length - 1 === i ? Styles.deliveryInfo : Styles.deliveryInfoOn}>
            <Text style={Styles.fwf14}>{item.logistic_name} - {item.status_name} {item.call_wait_desc}  </Text>
            <View style={Styles.driverName}>
              {tool.length(item.driver_name) > 0 && tool.length(item.driver_phone) > 0 ?
                  <TouchableOpacity style={Styles.flexRow} onPress={() => this.dialPhone(item.driver_phone)}>
                    <Text style={Styles.driverInfo}>{item.distance} 米,{item.fee} 元 骑手：{item.driver_name}  </Text>
                    <Text style={Styles.driverPhone}>{item.driver_phone} </Text>
                  </TouchableOpacity> : null
              }
            </View>
            <If condition={tool.length(item.driver_name) > 0 && tool.length(item.driver_phone) > 0}>
              <View style={Styles.deliveryInfoBtnBox}>
                {item.can_complaint ? <Button title={'投诉骑手'}
                                              onPress={() => this.onPress(Config.ROUTE_COMPLAIN, {id: item.id})}
                                              buttonStyle={Styles.deliveryInfoBtnWhite}
                                              titleStyle={Styles.deliveryInfoBtnTextGray}
                /> : null}
                {item.show_trace ? <Button title={'联系骑手'}
                                           onPress={() => this.dialPhone(item.driver_phone)}
                                           buttonStyle={Styles.deliveryInfoBtnGreen}
                                           titleStyle={Styles.deliveryInfoBtnTextWhite}
                /> : null}
                {item.can_add_tip ?
                    <Button title={'加小费'}
                            onPress={() => {
                              this.addTip(item.id)
                            }}
                            buttonStyle={Styles.deliveryInfoBtnGreen}
                            titleStyle={Styles.deliveryInfoBtnTextWhite}
                    />
                    : null}
                {item.can_cancel ? <Button title={'取消配送'}
                                           onPress={() => this.cancelDelivery(item.id)}
                                           buttonStyle={Styles.deliveryInfoBtnWhite}
                                           titleStyle={Styles.deliveryInfoBtnTextGray}
                /> : null}
              </View>
            </If>
          </View>
        </If>
      </For>
    </View>)
  }

  renderClient = () => {
    let {order} = this.state;
    return (
        <View style={Styles.clientHeader}>
          <View style={Styles.flexRow}>
            <Text style={Styles.clientLabel}>姓名</Text>
            <Text style={Styles.clientNameValue}>{order.userName} </Text>
            <Text style={Styles.clientOrderTimes}>{order.order_times === '1' ? "新客户" : `第${order.order_times}次`} </Text>
            <Text onPress={() => this.onPress(Config.ROUTE_ORDER_EDIT, {order: order})} style={Styles.clientChangeInfoTitle}>修改订单</Text>
          </View>
          <View style={Styles.flexRowMT15}>
            <Text style={Styles.clientLabel}>地址</Text>
            <View style={Styles.clientAddress}>
              <Text style={Styles.f12}>{order.address}-{Number(order.dada_distance / 1000).toFixed(2)}km</Text>
              <Text style={Styles.clientCatMap} onPress={() => this.clientCatMap(order.id)}>查看地图</Text>
            </View>
          </View>
          <TouchableOpacity style={Styles.mobileBody} onPress={() => this.dialPhone(order.mobile)}>
            <Text style={Styles.clientLabel}>电话</Text>
            <Text style={Styles.clientPhone}>{order.mobileReadable} </Text>
            <Text style={Styles.clientPhoneCall}>拨打</Text>
          </TouchableOpacity>

          <If condition={order.backup_phones_readable !== undefined && order.backup_phones_readable.length > 0}>
            <For each="phone" index="idx" of={order.backup_phones_readable}>
              <TouchableOpacity style={Styles.mobileBody} onPress={() => this.dialPhone(order.backup_phones[idx])} key={idx}>
                <Text style={Styles.clientLabel}>备用电话</Text>
                <Text style={Styles.clientPhone}>{phone} </Text>
                <Text style={Styles.clientPhoneCall}>拨打</Text>
              </TouchableOpacity>
            </For>
          </If>
        </View>
    )
  }

  onConfirmAddTip = () => {
    let token = this.props.global.accessToken
    const {dispatch} = this.props;
    let {shipId, addMoneyNum} = this.state
    if (addMoneyNum > 0) {
      dispatch(addTipMoneyNew(shipId, addMoneyNum, token, async (resp) => {
        if (resp.ok) {
          this.setState({addTipModal: false, respReason: '加小费成功'})
          ToastShort(resp.reason)
          this.fetchData()
        } else {
          this.setState({respReason: resp.desc, ok: resp.ok})
        }
        await this.setState({addMoneyNum: ''});
      }));
    } else {
      this.setState({addMoneyNum: '', respReason: '加小费的金额必须大于0', ok: false});
    }
  }

  dialPhone = (val) => {
    native.dialNumber(val)
  }

  addTip = (val) => {
    this.setState({
      addTipModal: true,
      modalTip: false,
      showDeliveryModal: false,
      shipId: val
    })
  }

  cancelDelivery = (val) => {
    let token = this.props.global.accessToken
    const api = `/api/pre_cancel_order?access_token=${token}`;
    let params = {}
    if (val !== undefined) {
      params = {
        delivery_id: val,
        order_id: this.state.order.id
      }
    } else {
      params = {
        delivery_id: 0,
        order_id: this.state.order.id
      }
    }
    HttpUtils.get.bind(this.props)(api, params).then(res => {
      if (res.deduct_fee < 0) {
        Alert.alert('提示', `该订单已有骑手接单，如需取消配送可能会扣除相应违约金`, [{
          text: '确定', onPress: () => {
            this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
                {
                  order: this.state.order,
                  ship_id: val,
                  onCancelled: (ok, reason) => {
                    this.fetchData()
                  }
                });
          }
        }, {'text': '取消'}]);
      } else if (res.deduct_fee == 0) {
        navigation.navigate(Config.ROUTE_ORDER_CANCEL_SHIP,
            {
              order: this.state.order,
              ship_id: val,
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
                    order: this.state.order,
                    ship_id: val,
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

  clientCatMap = (id) => {
    const accessToken = this.props.global.accessToken
    let path = '/AmapTrack.html?orderId=' + id + "&access_token=" + accessToken;
    const uri = Config.serverUrl(path);
    this.onPress(Config.ROUTE_WEB, {url: uri});
  }

  clientCatMap = (id) => {
    const accessToken = this.props.global.accessToken
    let path = '/AmapTrack.html?orderId=' + id + "&access_token=" + accessToken;
    const uri = Config.serverUrl(path);
    this.onPress(Config.ROUTE_WEB, {url: uri});
  }

  _onItemRowNumberChanged = (item, newNum) => {
    this._recordEdition({...item, num: newNum});
  }

  _recordEdition = (item) => {
    if (item.id) {
      this.setState({itemsEdited: {...this.state.itemsEdited, [item.id]: item}});
    } else {
      this.setState({itemsAdded: {...this.state.itemsAdded, [item.product_id]: item}});
    }
  }

  total_goods_num = (items) => {
    let num = 0
    items.forEach((item) => {
      num += parseInt(item.num);
    })
    return num
  }

  _totalEditingCents = () => {
    const {order} = this.state;
    const totalAdd = this.state.itemsAdded && Object.keys(this.state.itemsAdded).length > 0 ?
      tool.objectSum(this.state.itemsAdded, (item) => item.num * item.normal_price)
      : 0;
    let totalEdit = 0;
    if (this.state.itemsEdited && tool.length(order) > 0) {
      order.items.map((item) => {
        const edited = this.state.itemsEdited[item.id];
        const editNum = _editNum(edited, item);
        if (editNum !== 0) {
          totalEdit += editNum * item.normal_price;
        }
      });
    }
    const totalChanged = totalAdd + totalEdit;
    if (totalChanged < 0) {
      //退款金额： [(退款菜品现价 + 餐盒费)/(全部菜品现价总和 + 餐盒费)] * (最终支付价格 - 配送费)
      //退款规则：
      return totalChanged;
    } else {
      return totalChanged;
    }
  }

  _onToProvide = () => {
    const {order, navigation} = this.props;
    if (order.store_id <= 0) {
      ToastLong("所属门店未知，请先设置好订单所属门店！");
      return false;
    }
    const path = `stores/orders_go_to_buy/${order.id}.html?access_token=${global.accessToken}`;
    navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl(path, Config.https)});
  }

  _doRefund = () => {
    const {order} = this.state;
    let url = `api/support_manual_refund/${order.platform}/${order.id}?access_token=${
      this.props.global.accessToken
    }`
    HttpUtils.get.bind(this.props.navigation)(url).then(() => {
      this.props.navigation.navigate(Config.ROUTE_REFUND_DETAIL, {orderDetail: order})
    }, () => {
      ToastLong('获取数据失败')
    })
  }

  _doUpdate = () => {
    this.setState({isEditing: true, showGoodsList: false})
  }

  _doSaveItemsEdit = () => {

    const {dispatch, global} = this.props;
    const items = {
      ...this.state.itemsAdded,
      ...this.state.itemsEdited,
    };
    this.setState({onSubmitting: true});
    showModal("处理中")
    const token = global.accessToken;
    const wmId = this.state.order.id;
    dispatch(saveOrderItems(token, wmId, items, (ok, msg, resp) => {
      hideModal()
      if (ok) {
        this.setState({
          itemsAdded: {},
          itemsEdited: {},
          isEditing: false,
          onSubmitting: true,
        });
        showModal('处理中')
        this.fetchOrder(this.state.order_id)
      } else {
        ToastLong(msg)
        this.setState({
          onSubmitting: false,
        });
      }
    }));
  }

  _doCancel = () => {
    this.setState({isEditing: false,})
  }

  _doAddItem = (item) => {
    if (item.product_id && this.state.itemsAdded[item.product_id]) {
      let msg;
      if (item.num > 0) {
        msg = `商品[${item['name']}]已更新`;
      } else {
        msg = `商品[${item['name']}]已撤销`
      }
      ToastShort(msg)
    }
    this._recordEdition(item)
  }

  onChangeAccount = (text) => {
    this.setState({addMoneyNum: text})
  }

  cancelPlanDelivery = (order_id, planId) => {
    showModal("请求中 ")
    tool.debounces(() => {
      let api = `/v1/new_api/orders/cancel_delivery_plan/${order_id}/${planId}`;
      HttpUtils.get(api).then(success => {
        hideModal()
        showSuccess(`取消预约成功`)
        this.fetchData()
      }).catch((reason) => {
        hideModal()
        showError(`${reason.reason}`)
      })
    }, 300)
  }

  showGoodsListFlag = () => {
    this.setState({showGoodsList: !this.state.showGoodsList})
  }

  showLogChangeList = () => {
    this.setState({showChangeLogList: !this.state.showChangeLogList})
  }

  closeDeliveryModal = () => {
    this.setState({showDeliveryModal: false})
  }

  downDeliveryInfo = (i) => {
    let delivery_list = this.state.delivery_list
    delivery_list[i].default_show = !delivery_list[i].default_show
    this.setState({delivery_list: delivery_list})
  }

  closeAddTipModal = () => {
    this.setState({
      addTipModal: false
    })
  }

  renderGoods = () => {
    const {order, is_service_mgr} = this.state;
    const _items = order.items || {};
    const totalMoneyEdit = this.state.isEditing ? this._totalEditingCents() : 0;
    const finalTotal = (tool.intOf(order.total_goods_price) + totalMoneyEdit) / 100;
    const pack_workers = order.pack_workers ? order.pack_workers : {};
    let worker_nickname = tool.objectMap(pack_workers, (worker, idx) => {
      return worker.nickname
    })
    if (tool.length(worker_nickname) > 0) {
      worker_nickname = worker_nickname[0]
    }

    return (
      <View style={Styles.goodsBody}>
        <TouchableOpacity style={Styles.flexRow} onPress={() => this.showGoodsListFlag()}>
          <Text style={Styles.goodsTotal}>共{this.total_goods_num(_items)}件商品</Text>
          <View style={styles.flex1}/>
          <View style={Styles.goodsTitle}>
            <Button onPress={() => this._doRefund()}
              title={'退款申请'}
              buttonStyle={Styles.goodsButtonRefund}
              titleStyle={Styles.goodsButtonTitle}
            />
            {!this.state.isEditing ?
              <Button
                title={'修改商品'}
                disabled={!order._op_edit_goods}
                onPress={() => this._doUpdate()}
                buttonStyle={Styles.goodsButtonUpdate}
                titleStyle={Styles.goodsButtonTitle}
              /> : null}
            {this.state.isEditing ? <Button
              title={'修改'}
              disabled={!order._op_edit_goods}
              onPress={() => this._doSaveItemsEdit()}
              buttonStyle={Styles.goodsButtonUpdate}
              titleStyle={Styles.goodsButtonTitle}
            /> : null}
            {this.state.isEditing ? <Button
              title={'取消'}
              disabled={!order._op_edit_goods}
              onPress={() => this._doCancel()}
              buttonStyle={Styles.goodsButtonUpdate}
              titleStyle={Styles.goodsButtonTitle}
            /> : null}
          </View>
          {this.state.showGoodsList ?
            <Entypo name='chevron-thin-right' style={Styles.showGoodsList}/> :
            <Entypo name='chevron-thin-up' style={Styles.showGoodsList}/>}
        </TouchableOpacity>

        {!this.state.showGoodsList ? tool.objectMap(_items, (item, idx) => {
          return (
            <ItemRow
              key={idx}
              item={item}
              edited={this.state.itemsEdited[item.id]}
              idx={idx}
              orderStoreId={order.store_id}
              nav={this.props.navigation}
              isEditing={this.state.isEditing}
              onInputNumberChange={this._onItemRowNumberChanged.bind(this)}
              fnShowWmPrice={order.is_fn_show_wm_price}
              fnPriceControlled={order.is_fn_price_controlled}
              isServiceMgr={is_service_mgr}
            />
          );
        }) : null}
        {!this.state.showGoodsList ? tool.objectMap(this.state.itemsAdded, (item, idx) => {
          return (
            <ItemRow
              key={idx}
              item={item}
              isAdd={true}
              idx={idx}
              orderStoreId={order.store_id}
              nav={this.props.navigation}
              isEditing={this.state.isEditing}
              onInputNumberChange={this._onItemRowNumberChanged.bind(this)}
              fnShowWmPrice={order.is_fn_show_wm_price}
              fnPriceControlled={order.is_fn_price_controlled}
              isServiceMgr={is_service_mgr}
            />
          );
        }) : null}

        {order.is_fn_price_controlled ?
          <View style={[styles.moneyLabel, styles.moneyRow]}>
            <View style={styles.moneyLeft}>
              <Text style={styles.moneyListTitle}>供货价小计</Text>
            </View>
            <View style={styles.flex1}/>
            {/*直营店显示外卖价，管理员显示保底价，非直营店根据模式显示*/}
            <Text style={styles.moneyListNum}>
              {/*直接显示保底价总计*/}
              {numeral(order.supply_price / 100).format('0.00')}
            </Text>
          </View>
          : null}
        {/*管理员 和 直营店 可看*/}
        <If condition={is_service_mgr || !order.is_fn_price_controlled || order.is_fn_show_wm_price}>
          <View style={[styles.moneyLabel, styles.moneyRow]}>
            <View style={styles.moneyLeft}>
              <Text style={styles.moneyListTitle}>用户已付</Text>
              <Text style={styles.moneyRightTitle}>含平台扣费、优惠等</Text>
            </View>
            <View style={styles.flex1}/>
            <Text style={styles.moneyListNum}>
              {numeral(order.orderMoney).format('0.00')}
            </Text>
          </View>
          <View style={[styles.moneyLabel, styles.moneyRow]}>
            <Text style={[styles.moneyListTitle, {width: pxToDp(480)}]}>配送费</Text>
            <View style={styles.flex1}/>
            <Text style={styles.moneyListNum}>{numeral(order.deliver_fee / 100).format('0.00')} </Text>
          </View>
          <View style={[styles.moneyLabel, styles.moneyRow]}>
            <View style={[styles.moneyLeft, {alignItems: 'center'}]}>
              <Text style={styles.moneyListTitle}>优惠</Text>
              <TouchableOpacity style={{marginLeft: 5}}><Icons name='question-circle-o' color={colors.color777}/></TouchableOpacity>
            </View>
            <View style={styles.flex1}/>
            <Text style={styles.moneyListNum}>{numeral(order.self_activity_fee / 100).format('0.00')} </Text>
          </View>
          <If condition={order.bill && order.bill.total_income_from_platform}>
            <View style={[styles.moneyLabel, styles.moneyRow]}>
              <Text style={[styles.moneyListTitle, styles.w480]}>{order.bill.total_income_from_platform[0]} </Text>
              <View style={styles.flex1}/>
              <Text style={styles.moneyListNum}>{order.bill.total_income_from_platform[1]} </Text>
            </View>
          </If>
        </If>

        {order.additional_to_pay != '0' ?
          <View style={Styles.additional}>
            <View style={Styles.additional}>
              <Text style={Styles.additionalText}>需加收/退款</Text>
            </View>
            <View style={styles.flex1}/>
            <Text style={Styles.additionalTextNum}>
              {numeral(order.additional_to_pay / 100).format('+0.00')}
            </Text>
          </View>
          : null}
        {/*管理员可看*/}
        <If condition={is_service_mgr || !order.is_fn_price_controlled}>
          <View style={Styles.fn_price}>
            <View style={[styles.w480, Styles.flexRow]}>
              <Text style={Styles.product_price}>商品原价</Text>
              {totalMoneyEdit !== 0 &&
              <View>
                <Text
                  style={totalMoneyEdit > 0 ? Styles.editStatusAdd : Styles.editStatusDeduct}>
                  {totalMoneyEdit > 0 ? '需加收' : '需退款'}{numeral(totalMoneyEdit / 100).format('0.00')}元
                </Text>
                <Text style={Styles.totalGoodsPrice}>
                  {numeral(order.total_goods_price / 100).format('0.00')}
                </Text>
              </View>}
            </View>
            <View style={styles.flex1}/>
            <Text style={Styles.totalGoodsPriceBottom}>
              {numeral(finalTotal).format('0.00')}
            </Text>
          </View>
        </If>
        <View style={Styles.borderLine}/>
        {tool.length(worker_nickname) > 0 ?
          <View style={[styles.moneyLabel, styles.moneyRow]}>
            <Text style={Styles.f12w140}>分拣人姓名</Text>
            <Text style={Styles.f12}>{worker_nickname} </Text>
          </View>
          : null}

        {order.time_ready ?
          <View style={[styles.moneyLabel, styles.moneyRow, {marginTop: pxToDp(12)}]}>
            <Text style={Styles.f12w140}>分拣时间</Text>
            <Text style={Styles.f12}>{order.time_ready} </Text>
          </View>
          : null}

        {order.pack_operator ?
          <View style={[styles.moneyLabel, styles.moneyRow, {marginTop: pxToDp(12)}]}>
            <Text style={Styles.f12w140}>记录人</Text>
            <Text style={Styles.f12}>{order.pack_operator.nickname} </Text>
          </View>
          : null}


        <Refund
          orderId={order.id}
          platform={order.platform}
          isFnPriceControl={order.is_fn_price_controlled}
          isServiceMgr={is_service_mgr}
        />

      </View>
    )
  }

  renderChangeLog = () => {
    return (
      <View style={Styles.logHeader}>
        <TouchableOpacity style={Styles.flexRow} onPress={() => this.showLogChangeList()}>
          <Text style={Styles.f12}>修改记录</Text>
          <View style={styles.flex1}/>
          {this.state.showChangeLogList ?
            <Entypo name='chevron-thin-right' style={Styles.f14}/> :
            <Entypo name='chevron-thin-up' style={Styles.f14}/>}
        </TouchableOpacity>
        {this.renderChangeLogList()}
      </View>
    )
  }

  renderChangeLogList = () => {
    if (!this.state.showChangeLogList && this.state.orderChangeLogs.length > 0) {
      return this.state.orderChangeLogs.map((item, index) => {
        return (
          <View key={index}
                style={Styles.logChangeListContain}>
            <View style={Styles.logChangeListContent}>
              <View style={Styles.flexRow}>
                <Text style={Styles.logChangeListTitle}>{item.updated_name} </Text>
                <Text style={Styles.logChangeListLabel}>{item.modified} </Text>
              </View>
              <View style={Styles.logChangeListInfo}>
                <Text selectable={true}
                      style={Styles.logChangeListInfoText}>{item.what} </Text>
              </View>
            </View>
          </View>
        )
      })
    } else if (this.state.orderChangeLogs.length === 0 && !this.state.showChangeLogList) {
      return <View style={Styles.logNone}>
        <Text style={Styles.logNoneText}>没有相应的记录</Text>
      </View>
    }
  }

  renderDeliveryStatus = (list) => {
    return (
      <View>
        <For each="log" index="i" of={list}>
          <View style={Styles.deliveryStatusHeader} key={i}>
            <View style={Styles.deliveryStatusHeaderTop}>
              <View style={[{backgroundColor: log.status_color}, Styles.deliveryStatusTitle]}>
                {i !== 0 ? <View style={[{backgroundColor: log.status_color}, Styles.deliveryStatusContentBottom]}/> : null}
                {i !== list.length - 1 ? <View style={[{backgroundColor: log.status_color}, Styles.deliveryStatusContentTop]}/> : null}
              </View>
            </View>
            <View style={Styles.deliveryStatusHeaderBottom}>
              <View style={Styles.flexRow}>
                <Text style={[{color: log.status_desc_color}, Styles.f12]}>{log.status_desc}  </Text>
                <View style={styles.flex1}/>
                <Text style={[{color: log.lists[0].content_color}, Styles.f12]}>{log.lists[0].content}  </Text>
              </View>
              <Text
                style={[{color: log.lists[0].desc_color}, Styles.deliveryStatusExtNum]}>{log.lists[0].desc} {log.lists[0].ext_num} </Text>
            </View>
          </View>
        </For>
      </View>
    )
  }

  renderDeliveryModal = () => {
    let {navigation} = this.props;
    let height = tool.length(this.state.delivery_list) >= 3 ? pxToDp(800) : tool.length(this.state.delivery_list) * 250;
    if (tool.length(this.state.delivery_list) < 2) {
      height = 400;
    }
    return (
      <Modal visible={this.state.showDeliveryModal} hardwareAccelerated={true}
             onRequestClose={() => this.closeDeliveryModal()}
             transparent={true}>
        <View style={Styles.deliveryModalTop}>
          <TouchableOpacity style={styles.flex1} onPress={() => this.closeDeliveryModal()}/>
          <View style={[Styles.deliveryModalHeader, {height: height}]}>
            <View style={Styles.flexRow}>
              <Text onPress={() => {
                this.onPress(Config.ROUTE_STORE_STATUS)
                this.closeDeliveryModal()
              }} style={Styles.deliveryModalTitle}>呼叫配送规则</Text>
              <View style={styles.flex1}/>
              <TouchableOpacity onPress={() => this.closeDeliveryModal()}>
                <Entypo name={'cross'} style={Styles.deliveryModalIcon}/>
              </TouchableOpacity>
            </View>

            <ScrollView
              overScrollMode="always"
              automaticallyAdjustContentInsets={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}>

              <View style={Styles.deliveryModalContent}>
                <If condition={this.state.delivery_list}>
                  <For each="info" index="i" of={this.state.delivery_list}>
                    <View key={i} style={Styles.deliveryModalContentInfo}>
                      <TouchableOpacity onPress={() => this.downDeliveryInfo(i)} style={Styles.flexRow}>
                        <Text style={Styles.deliveryModalText}>{info.desc}  </Text>
                        <Text style={[{color: info.content_color}, Styles.deliveryModalText]}>{info.status_content}{info.plan_id === 0 ? ` - ${info.fee} 元` : ''} </Text>
                        <View style={styles.flex1}/>
                        {!info.default_show ? <Entypo name='chevron-thin-right' style={Styles.f14}/> :
                          <Entypo name='chevron-thin-up' style={Styles.f14}/>}
                      </TouchableOpacity>
                      <View style={Styles.deliveryInfoWeight}>
                        <Text style={[Styles.color333, Styles.f12]}> 商品重量-{info.weight}kg </Text>
                        <If condition={info.fee_tip > 0}><Text style={[Styles.color333, Styles.f12]}> 小费：{info.fee_tip}元 </Text></If>
                      </View>

                      <View style={Styles.deliveryInfoPhone}>
                        <Text style={Styles.w450}>{info.content} {info.driver_phone} {info.ext_num}  </Text>
                        {/*{info.driver_phone && !info.default_show ? <TouchableOpacity onPress={() => {*/}
                        {/*  native.dialNumber(info.driver_phone)*/}
                        {/*}}>*/}
                        {/*  <Entypo name='phone'*/}
                        {/*          style={{*/}
                        {/*            fontSize: 14,*/}
                        {/*            color: colors.main_color,*/}
                        {/*            marginLeft: pxToDp(30)*/}
                        {/*          }}/></TouchableOpacity> : null}*/}
                      </View>
                      {info.default_show ? this.renderDeliveryStatus(info.log_lists) : null}
                      <View style={Styles.deliveryModalButton}>
                        {info.btn_lists.can_cancel === 1 ? <Button title={'撤回呼叫'}
                                                                   onPress={() => {
                                                                     this.setState({showDeliveryModal: false})
                                                                     this.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
                                                                       {
                                                                         order: this.state.order,
                                                                         ship_id: info.ship_id,
                                                                         onCancelled: (ok, reason) => {
                                                                           this.fetchData()
                                                                         }
                                                                       });
                                                                   }}
                                                                   buttonStyle={Styles.deliveryButtonBgWhite}
                                                                   titleStyle={Styles.deliveryModalButtonTextBlack}
                        /> : null}
                        {info.btn_lists.can_cancel_plan === 1 ? <Button title={'取消预约'}
                                                                        onPress={() => {
                                                                          this.setState({showDeliveryModal: false})
                                                                          Alert.alert('提醒', "确定取消预约发单吗", [{text: '取消'}, {
                                                                            text: '确定',
                                                                            onPress: () => {
                                                                              this.cancelPlanDelivery(this.state.order_id, info.plan_id)
                                                                            }
                                                                          }])
                                                                        }}
                                                                        buttonStyle={Styles.deliveryButtonBgWhite}
                                                                        titleStyle={Styles.deliveryModalButtonTextBlack}
                        /> : null}
                        {info.btn_lists.can_complaint === 1 ? <Button title={'投诉骑手'}
                                                                      onPress={() => {
                                                                        this.setState({showDeliveryModal: false})
                                                                        navigation.navigate(Config.ROUTE_COMPLAIN, {id: info.ship_id})
                                                                      }}
                                                                      buttonStyle={Styles.deliveryButtonBgWhite}
                                                                      titleStyle={Styles.deliveryModalButtonTextBlack}
                        /> : null}

                        {info.btn_lists.can_view_position === 1 ? <Button title={'查看位置'}
                                                                          onPress={() => {
                                                                            this.setState({showDeliveryModal: false})
                                                                            const accessToken = this.props.global.accessToken
                                                                            let path = '/rider_tracks.html?delivery_id=' + info.ship_id + "&access_token=" + accessToken;
                                                                            const uri = Config.serverUrl(path);
                                                                            this.onPress(Config.ROUTE_WEB, {url: uri});
                                                                          }}
                                                                          buttonStyle={[Styles.deliveryButtonBgWhite, {borderColor: colors.main_color}]}
                                                                          titleStyle={Styles.deliveryModalButtonTextGreen}
                        /> : null}
                        {info.btn_lists.add_tip === 1 ?
                          <Button title={'加小费'}
                                  onPress={() => {
                                    this.setState({
                                      addTipModal: true,
                                      modalTip: false,
                                      showDeliveryModal: false,
                                      shipId: info.ship_id
                                    })
                                  }}
                                  buttonStyle={Styles.deliveryButtonBgGreen}
                                  titleStyle={Styles.deliveryModalButtonTextWhite}
                          /> : null
                        }
                        {info.btn_lists.can_call === 1 ? <Button title={'联系骑手'}
                                                                 onPress={() => {
                                                                   native.dialNumber(info.driver_phone)
                                                                 }}
                                                                 buttonStyle={Styles.deliveryButtonBgGreen}
                                                                 titleStyle={Styles.deliveryModalButtonTextWhite}
                        /> : null}

                      </View>
                    </View>
                  </For>
                </If>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
        <View style={Styles.modalBackground}>
          <View style={[Styles.container]}>
            <TouchableOpacity onPress={() => this.closeAddTipModal()} style={Styles.addTipRightIcon}>
              <Entypo name={"circle-with-cross"}
                      style={Styles.addTipRightIconStyle}/>
            </TouchableOpacity>
            <Text style={Styles.addTipTitleText}>加小费</Text>
            <Text style={Styles.addTipTitleDesc}>多次添加以累计金额为主，最低一元</Text>
            <If condition={is_merchant_add_tip === 1}>
              <Text style={Styles.addTipTitleTextRemind}>小费金额商家和外送帮各承担一半，在订单结算时扣除小费</Text>
            </If>
            <View style={[Styles.container1]}>
              <Text style={Styles.f26}>金额</Text>
              <View style={Styles.tipSelect}>
                <For index='i' each='info' of={tipListTop}>
                  <Text key={i} style={Styles.amountBtn} onPress={() => {
                    this.onChangeAccount(info.value)
                  }}>{info.label}</Text>
                </For>
              </View>
              <View style={Styles.tipSelect}>
                <For index='i' each='info' of={tipListBottom}>
                  <Text key={i} style={Styles.amountBtn} onPress={() => {
                    this.onChangeAccount(info.value)
                  }}>{info.label}</Text>
                </For>
              </View>
              <View style={Styles.addTipInputBox}>
                <Input
                  style={Styles.addTipInput}
                  placeholder={'请输入其他金额'}
                  defaultValue={`${this.state.addMoneyNum}`}
                  keyboardType='numeric'
                  onChangeText={(value) =>
                    this.onChangeAccount(value)
                  }
                />
                <Text style={Styles.addTipInputRight}>元</Text>
              </View>
              {
                (!this.state.ok || this.state.addMoneyNum === 0) &&
                <View
                  style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}}>
                  <Entypo name={"help-with-circle"}
                          style={Styles.addTipHelpIcon}/>
                  <Text style={Styles.addTipReason}>{this.state.respReason}</Text>
                </View>
              }
            </View>
            <View style={Styles.btn1}>
              <View style={styles.flex1}><TouchableOpacity style={Styles.marginH10}
                                                        onPress={() => this.closeAddTipModal()}><Text
                style={Styles.btnText2}>取消</Text></TouchableOpacity></View>
              <View style={styles.flex1}><TouchableOpacity style={Styles.marginH10}
                                                        onPress={() => {
                                                          this.onConfirmAddTip()
                                                        }}><Text
                style={Styles.btnText}>确定</Text></TouchableOpacity></View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  render() {
    const order = this.state.order;
    let refreshControl = <RefreshControl
      refreshing={this.state.isFetching}
      onRefresh={this._dispatchToInvalidate.bind(this)}
      tintColor='gray'
    />;
    const orderId = (this.props.route.params || {}).orderId;
    const noOrder = (!order || !order.id || Number(order.id) !== Number(orderId));

    return noOrder ?
      <ScrollView
        contentContainerStyle={Styles.contentContainer}
        refreshControl={refreshControl}>
        <View>
          <FloatServiceIcon/>
          <Text style={Styles.textAlignCenter}>{this.state.isFetching ? '正在加载' : '下拉刷新'} </Text>
        </View>
      </ScrollView>
      : (
        <View style={Styles.contentBody}>

          <FloatServiceIcon/>
          <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
          <ScrollView
            refreshControl={refreshControl}
            style={styles.p20}>
            {this.renderPrinter()}
            {this.renderHeader()}
            <If condition={this.state.deliverie_status || this.state.order.pickType === '1'}>
              {this.renderDelivery()}
            </If>
            {this.renderGoods()}
            {this.renderClient()}
            {this.renderChangeLog()}
            {this.renderDeliveryModal()}
            {this.renderAddTipModal()}
          </ScrollView>
          <OrderBottom order={order} btn_list={order.btn_list} token={this.props.global.accessToken}
                       navigation={this.props.navigation}
                       fetchData={this.fetchData.bind(this)}
                       fnProvidingOnway={this._fnProvidingOnway()} onToProvide={this._onToProvide}/>
        </View>
      );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderInfo)

const Styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    backgroundColor: '#fff'
  },
  contentBody: {flex: 1, backgroundColor: colors.back_color},
  textAlignCenter: {textAlign: 'center'},
  p20: {
    padding: pxToDp(20)
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
  tipSelect: {flexDirection: "row", justifyContent: "space-around", marginTop: pxToDp(15)},
  flexRow: {
    flexDirection: 'row'
  },
  flexRowMT15: {
    flexDirection: 'row',
    marginTop: pxToDp(15)
  },
  flexRowAlignCenter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  marginH10: {marginHorizontal: pxToDp(10)},
  color333: {
    color: colors.color333
  },
  printText: {
    fontSize: pxToDp(30),
    marginRight: pxToDp(20)
  },
  headerBody: {
    borderRadius: pxToDp(20),
    paddingBottom: pxToDp(10),
    backgroundColor: colors.white,
  },
  headerBodyTitle: {
    backgroundColor: "#28A077",
    borderTopLeftRadius: pxToDp(20),
    borderTopRightRadius: pxToDp(20),
    padding: pxToDp(30),
    paddingBottom: pxToDp(20),
  },
  orderStatus: {
    color: '#F76969',
    textDecorationLine: 'line-through',
    fontSize: 20
  },
  orderStatusShow: {
    color: colors.white,
    textDecorationLine: 'none',
    fontSize: 20
  },
  orderSeq: {
    color: colors.white,
    fontSize: 16,
    width: pxToEm(300),
    textAlign: 'right'
  },
  orderExpectTime: {
    flexDirection: 'row',
    marginTop: 8
  },
  orderExpectTimeLabel: {
    color: colors.white,
    fontSize: 12,
    marginTop: pxToDp(2)
  },
  orderExpectTimeContent: {
    color: colors.white,
    fontSize: 12,
    marginLeft: pxToDp(10)
  },
  f12: {
    fontSize: 12
  },
  f14: {
    fontSize: 14
  },
  f26: {
    fontSize: pxToDp(26)
  },
  w450: {
    width: pxToDp(450)
  },
  f12w110: {
    fontSize: 12,
    width: pxToDp(110)
  },
  f12w140: {
    fontSize: 12,
    width: pxToDp(140)
  },
  orderCreateTime: {
    fontSize: 12,
    width: pxToDp(110)
  },
  copyText: {
    fontSize: 12,
    color: colors.main_color,
    marginLeft: pxToDp(30)
  },
  MT15: {
    marginTop: pxToDp(15)
  },
  remarkTxt: {
    fontSize: 12,
    color: "#F76969",
    width: pxToDp(440)
  },
  orderRemark: {
    fontSize: 12,
    color: "#F76969",
    flex: 1
  },
  deliveryInfo: {
    borderBottomColor: colors.fontColor,
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginTop: pxToDp(20),
    justifyContent: "center",
    alignItems: "center"
  },
  deliveryInfoOn: {
    borderBottomColor: colors.fontColor,
    borderBottomWidth: 1,
    paddingBottom: 20,
    marginTop: pxToDp(20),
    justifyContent: "center",
    alignItems: "center"
  },
  fwf14: {
    fontWeight: 'bold',
    fontSize: 14
  },
  driverName: {
    flexDirection: 'row',
    marginTop: pxToDp(20)
  },
  driverInfo: {
    fontSize: 12,
    color: colors.fontColor,
    marginTop: pxToDp(3)
  },
  driverPhone: {
    fontSize: 12,
    color: colors.main_color,
    marginLeft: pxToDp(30)
  },
  deliveryInfoBtnBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: pxToDp(20),
  },
  deliveryInfoBtnWhite: {
    backgroundColor: colors.white,
    borderWidth: pxToDp(1),
    width: pxToDp(150),
    borderColor: colors.fontColor,
    borderRadius: pxToDp(10),
    padding: pxToDp(15),
    marginRight: pxToDp(15)
  },
  deliveryInfoBtnTextGray: {
    color: colors.fontColor,
    fontSize: 12,
    fontWeight: 'bold'
  },
  deliveryInfoBtnTextWhite: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold'
  },
  deliveryInfoBtnGreen: {
    backgroundColor: colors.main_color,
    width: pxToDp(150),
    borderRadius: pxToDp(10),
    padding: pxToDp(14),
    marginRight: pxToDp(15)
  },
  deliveryBody: {
    borderRadius: pxToDp(20),
    paddingBottom: pxToDp(30),
    padding: pxToDp(20),
    backgroundColor: colors.white,
    marginTop: pxToDp(20),
  },
  deliveryStatusText: {
    textAlign: "center",
    fontSize: 21,
    color: colors.main_color,
    marginTop: pxToDp(30),
    fontWeight: "bold"
  },
  deliveryStatusInfo: {
    textAlign: 'center',
    fontWeight: "bold",
    marginTop: pxToDp(25)
  },
  qrcodeLabel: {
    fontSize: 12,
    color: colors.main_color,
    marginLeft: pxToDp(12),
    marginRight: pxToDp(20)
  },
  qrcodeIcon: {color: colors.main_color, fontSize: 14},
  qrcodeContent: {flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop:pxToDp(30)},
  platformQR: {justifyContent: "center", alignItems: "center", marginTop: pxToDp(30)},
  platformText: {
    fontSize: 14,
    marginTop: pxToDp(20)
  },
  noRiderTips: {marginTop: pxToDp(20)},
  noRiderTipsHeader: {
    backgroundColor: "#EAFFEE",
    flexDirection: 'row',
    borderRadius: pxToDp(20),
    marginTop: pxToDp(20),
    padding: pxToDp(15)
  },
  questionIcon: {fontSize: 14, color: colors.main_color},
  noRiderTipsLabel: {fontSize: 12, marginLeft: pxToDp(20), marginTop: pxToDp(2)},
  clientHeader: {
    borderRadius: pxToDp(20),
    paddingBottom: pxToDp(20),
    padding: pxToDp(20),
    backgroundColor: colors.white,
    marginTop: pxToDp(20),
  },
  clientLabel: {fontSize: 12, width: pxToDp(80)},
  clientNameValue: {fontSize: 14},
  clientOrderTimes: {
    fontSize: 10,
    color: colors.white,
    backgroundColor: "#FFB454",
    padding: pxToDp(5),
    marginRight: pxToDp(30),
    marginLeft: pxToDp(30),
  },
  clientChangeInfoTitle: {fontSize: 10, color: colors.main_color, marginTop: pxToDp(5)},
  clientAddress: {flexDirection: 'row', width: Dimensions.get("window").width * 0.6},
  clientCatMap: {
    fontSize: 10,
    color: colors.main_color,
    marginTop: "auto",
    marginBottom: "auto",
    marginLeft: pxToDp(15),
  },
  mobileBody: {flexDirection: 'row', alignItems: 'center', marginTop: pxToDp(15)},
  clientPhone: {fontSize: 12, color: colors.main_color},
  clientPhoneCall: {fontSize: 12, color: colors.main_color, marginLeft: pxToDp(30)},
  goodsBody: {
    borderRadius: pxToDp(20),
    paddingBottom: pxToDp(20),
    padding: pxToDp(20),
    backgroundColor: colors.white,
    marginTop: pxToDp(20),
  },
  goodsTotal: {
    fontSize: 12,
    marginTop: pxToDp(10),
    width: pxToEm(240)
  },
  goodsTitle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: pxToDp(310),
  },
  goodsButtonRefund: {
    backgroundColor: colors.fontColor,
    borderWidth: pxToDp(1),
    borderColor: colors.fontColor,
    borderRadius: pxToDp(10),
    padding: pxToDp(12),
    marginLeft: 0,
    marginRight: 0,
  },
  goodsButtonTitle: {
    color: colors.white,
    fontSize: 12
  },
  goodsButtonUpdate: {
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(10),
    padding: pxToDp(12),
    marginLeft: 0,
    marginRight: 0,
  },
  showGoodsList: {fontSize: 16, marginTop: pxToDp(6)},
  additional: {
    marginTop: pxToDp(12),
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center'
  },
  additionalText: {
    flex: 1,
    fontSize: pxToDp(26),
    color: colors.color333,
  },
  additionalTextNum: {
    fontSize: pxToDp(26),
    color: colors.color777
  },
  fn_price: {
    flexDirection: 'row',
    alignContent: 'center',
    marginBottom: pxToDp(12),
    alignItems: 'center'
  },
  product_price: {
    flex: 1,
    fontSize: pxToDp(26),
    color: colors.color333
  },
  editStatusAdd: {
    backgroundColor: colors.editStatusAdd,
    color: colors.white,
    fontSize: pxToDp(22),
    borderRadius: pxToDp(5),
    alignSelf: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2
  },
  editStatusDeduct: {
    backgroundColor: colors.editStatusDeduct,
    color: colors.white,
    fontSize: pxToDp(22),
    borderRadius: pxToDp(5),
    alignSelf: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2
  },
  totalGoodsPrice: {
    textDecorationLine: 'line-through',
    fontSize: pxToDp(26),
    color: colors.color777,
  },
  totalGoodsPriceBottom: {
    fontSize: pxToDp(26),
    color: colors.color777,
  },
  borderLine: {borderTopColor: colors.fontColor, borderTopWidth: pxToDp(1)},
  logHeader: {
    marginBottom: pxToDp(100),
    borderRadius: pxToDp(20),
    paddingBottom: pxToDp(20),
    padding: pxToDp(20),
    backgroundColor: colors.white,
    marginTop: pxToDp(20),
  },
  logChangeListContain: {
    width: '100%',
    paddingHorizontal: pxToDp(30),
    backgroundColor: '#fff',
    minHeight: pxToDp(180)
  },
  logChangeListContent: {
    flex: 1,
    borderBottomWidth: pxToDp(1),
    borderColor: "#bfbfbf",
    minHeight: pxToDp(150),
    justifyContent: 'center'
  },
  logChangeListTitle: {
    color: '#59B26A',
    fontSize: pxToEm(26),
    overflow: 'hidden',
    height: pxToDp(35)
  },
  logChangeListLabel: {
    flex: 1,
    color: '#59B26A',
    fontSize: pxToEm(26),
    overflow: 'hidden',
    height: pxToDp(35),
    marginLeft: pxToDp(24)
  },
  logChangeListInfo: {marginTop: pxToDp(20), width: '100%', height: 'auto', marginBottom: pxToDp(20)},
  logChangeListInfoText: {fontSize: pxToEm(24), height: 'auto', lineHeight: pxToDp(28)},
  logNone: {alignItems: 'center'},
  logNoneText: {textAlign: "center", marginTop: pxToDp(30)},
  deliveryStatusHeader: {
    flexDirection: 'row',
    paddingVertical: pxToDp(15)
  },
  deliveryStatusHeaderTop: {
    width: 30
  },
  deliveryStatusHeaderBottom: {
    width: '90%'
  },
  deliveryStatusExtNum: {
    fontSize: 10,
    marginTop: pxToDp(10)
  },
  deliveryStatusTitle: {
    width: pxToDp(30),
    height: pxToDp(30),
    borderRadius: pxToDp(15)
  },
  deliveryStatusContentTop: {
    width: pxToDp(5),
    height: pxToDp(45),
    position: 'absolute',
    top: pxToDp(28),
    left: pxToDp(13)
  },
  deliveryStatusContentBottom: {
    width: pxToDp(5),
    height: pxToDp(45),
    position: 'absolute',
    bottom: pxToDp(28),
    left: pxToDp(13)
  },
  deliveryModalTop: {flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.25)'},
  deliveryModalHeader: {
    backgroundColor: colors.white,
    borderTopLeftRadius: pxToDp(30),
    borderTopRightRadius: pxToDp(30),
  },
  deliveryModalTitle: {color: colors.main_color, marginTop: pxToDp(20), marginLeft: pxToDp(20)},
  deliveryModalIcon: {fontSize: pxToDp(50), color: colors.fontColor},
  deliveryModalContent: {padding: pxToDp(20)},
  deliveryModalContentInfo: {
    padding: pxToDp(20),
    borderRadius: pxToDp(15),
    backgroundColor: "#F3F3F3",
    marginBottom: pxToDp(20),
  },
  deliveryModalText: {
    fontWeight: "bold",
    fontSize: 12
  },
  deliveryInfoWeight: {marginVertical: 12, flexDirection: 'row'},
  deliveryInfoPhone: {fontSize: 12, marginBottom: 12, flexDirection: 'row'},
  deliveryModalButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deliveryModalButtonTextBlack: {
    color: colors.fontBlack,
    fontSize: 12
  },
  deliveryModalButtonTextWhite: {
    color: colors.white,
    fontSize: 12
  },
  deliveryModalButtonTextGreen: {
    color: colors.main_color,
    fontSize: 12
  },
  deliveryButtonBgWhite: {
    backgroundColor: colors.white,
    borderWidth: pxToDp(2),
    width: pxToDp(150),
    borderColor: colors.fontBlack,
    borderRadius: pxToDp(10),
    padding: pxToDp(14),
    marginRight: pxToDp(15)
  },
  deliveryButtonBgGreen: {
    backgroundColor: colors.main_color,
    width: pxToDp(150),
    borderRadius: pxToDp(10),
    padding: pxToDp(14),
    marginRight: pxToDp(15)
  },
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

});
