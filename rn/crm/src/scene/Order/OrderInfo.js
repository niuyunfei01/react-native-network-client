import React, {Component, PureComponent} from 'react'
import {
  Alert,
  Clipboard,
  Dimensions,
  Image,
  InteractionManager,
  Modal,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {native, screen, tool} from '../../common'
import {bindActionCreators} from "redux";
import Config from '../../config'
import OrderBottom from './OrderBottom'
import Tips from "../component/Tips";
import {
  addTipMoney,
  clearLocalOrder,
  getOrder,
  getRemindForOrderPage,
  orderCancel,
  orderCancelZsDelivery,
  orderChangeLog,
  orderWayRecord,
  printInCloud,
  saveOrderDelayShip,
  saveOrderItems,
} from '../../reducers/order/orderActions'
import {getContacts} from '../../reducers/store/storeActions';
import {markTaskDone} from '../../reducers/remind/remindActions';
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";
import {hideModal, showError, showModal, showSuccess, ToastLong, ToastShort} from "../../util/ToastUtils";
import Cts from '../../Cts'
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ModalSelector from "../../widget/ModalSelector/index";
import colors from "../../styles/colors";
import {Button} from "react-native-elements";
import pxToEm from "../../util/pxToEm";
import styles from "./OrderStyles";
import Icons from "react-native-vector-icons/FontAwesome";
import QRCode from "react-native-qrcode-svg";
import PropTypes from "prop-types";
import InputNumber from "rc-input-number";
import inputNumberStyles from "./inputNumberStyles";
import HttpUtils from "../../util/http";
import {ActionSheet, Icon} from "../../weui";
import BleManager from "react-native-ble-manager";
import DateTimePicker from "react-native-modal-datetime-picker";
import Moment from "moment/moment";
import ReceiveMoney from "./_OrderScene/ReceiveMoney";
import S from "../../stylekit";
import JbbPrompt from "../component/JbbPrompt";
import GlobalUtil from "../../util/GlobalUtil";
import {print_order_to_bt} from "../../util/ble/OrderPrinter";
import Refund from "./_OrderScene/Refund";


const numeral = require('numeral');

function mapStateToProps(state) {
  return {
    order: state.order,
    global: state.global,
    store: state.store,
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
      addTipMoney,
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

class OrderInfo extends Component {
  constructor(props) {
    super(props);
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
      isEndVisible: false,
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
      visibleReceiveQr: false,
      showCallStore: false,
      show_no_rider_tips: false,
      showDeliveryModal: false,
      deliverie_status: '',
      deliverie_desc: '',
      pickCode: ''
    };
    this.fetchOrder(order_id);
  }

  fetchData() {
    this.fetchOrder(this.state.order_id)
  }

  closeModal() {
    this.setState({
      modalTip: false
    })
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
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        order: res,
        isFetching: false,
        itemsEdited: this._extract_edited_items(res.items),
        pickCodeStatus: parseInt(res.pickType) === 1,
        allow_merchants_cancel_order: parseInt(res.allow_merchants_cancel_order) === 1,
        qrcode: tool.length(res.pickup_code) > 0 ? res.pickup_code : '',
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
      this.fetchDeliveryList()
      this.fetchThirdWays()
    }, ((res) => {
      ToastLong('操作失败：' + res.reason)
      this.setState({isFetching: false})
    })).catch((e) => {
      ToastLong('操作失败：' + e.desc)
      this.setState({isFetching: false})
    })
  }

  _extract_edited_items(items) {
    const edits = {};
    (items || []).filter((item => item.origin_num !== null && item.num > item.origin_num)).forEach((item) => {
      edits[item.id] = item;
    });
    return edits;
  }

  fetchShipData() {
    const api = `/v1/new_api/orders/third_ship_deliverie/${this.state.order_id}?access_token=${this.props.global.accessToken}`;
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({
        deliverie_status: res.show_status,
        show_no_rider_tips: res.show_no_rider_tips === 1,
        deliverie_desc: res.desc,
        logistics: res.third_deliverie_list
      })
    })
  }


  fetchDeliveryList() {
    const api = `/v1/new_api/orders/third_deliverie_record/${this.state.order_id}?access_token=${this.props.global.accessToken}`;
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({
        delivery_list: res.delivery_lists
      })
    })
  }


  fetchThirdWays() {
    let {orderStatus} = this.state.order;
    if (orderStatus === Cts.ORDER_STATUS_TO_READY || orderStatus === Cts.ORDER_STATUS_TO_SHIP) {
      const api = `/api/order_third_logistic_ways/${this.state.order_id}?select=1&access_token=${this.props.global.accessToken}`;
      HttpUtils.get.bind(this.props.navigation)(api).then(() => {
      }, () => {
      })
    }
  }

  setHeader() {
    let {order, is_service_mgr, allow_merchants_cancel_order} = this.state
    let {wsb_store_account} = this.props.global.config.vendor

    const as = [
      {key: MENU_EDIT_BASIC, label: '修改地址电话发票备注'},
      {key: MENU_EDIT_EXPECT_TIME, label: '修改配送时间'},
      {key: MENU_EDIT_STORE, label: '修改门店'},
      {key: MENU_FEEDBACK, label: '客户反馈'},
      {key: MENU_RECEIVE_QR, label: '收款码'},
      {key: MENU_CALL_STAFF, label: '联系门店'},
      // {key: MENU_SET_INVALID, label: '置为无效'},
      // {key: MENU_CANCEL_ORDER, label: '取消订单'},
    ];
    // if (is_service_mgr || this._fnViewFullFin()) {
    //   as.push({key: MENU_OLD_VERSION, label: '老版订单页'});
    // }
    if (is_service_mgr) {
      as.push({key: MENU_SET_INVALID, label: '置为无效'});
    }
    if (is_service_mgr || wsb_store_account === "1") {
      as.push({key: MENU_SET_COMPLETE, label: '置为完成'});
    }
    if (is_service_mgr || allow_merchants_cancel_order) {
      as.push({key: MENU_CANCEL_ORDER, label: '取消订单'});
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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: pxToDp(30), marginRight: pxToDp(20)}}
                onPress={() => {
                  this.onPrint()
                }}>打印</Text>
          <ModalSelector
            onChange={(option) => {
              this.onMenuOptionSelected(option)
            }}
            skin='customer'
            data={this.state.ActionSheet}>
            <Entypo name='dots-three-horizontal' style={{
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
            }}/>
          </ModalSelector>
        </View>),
    });
  }

  onPrint() {
    const order = this.state.order
    if (order.printer_sn) {
      this.setState({showPrinterChooser: true})
    } else {
      this._doBluetoothPrint()
    }
  }

  _hidePrinterChooser() {
    this.setState({showPrinterChooser: false})
  }

  renderReceiveQr(order) {
    return (
      <ReceiveMoney
        formVisible={this.state.visibleReceiveQr}
        onCloseForm={() => this.setState({visibleReceiveQr: false})}
        order={order}
      />
    )
  }

  _doCloudPrint() {
    const {dispatch, global} = this.props;
    dispatch(printInCloud(global.accessToken, this.state.order.id, (ok, msg, data) => {
      if (ok) {
        ToastShort("已发送到打印机");
      } else {
        ToastLong('打印失败：' + msg)
      }
      this._hidePrinterChooser();
    }))
  }

  _cloudPrinterSN() {
    const order = this.state.order;
    const printerName = order.printer_sn || '未知';
    return `云打印(${printerName})`;
  }

  _doBluetoothPrint() {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      BleManager.enableBluetooth().then(() => {
        console.log("The bluetooth is already enabled or the user confirm");
      }).catch((error) => {
        console.log("The user refuse to enable bluetooth:", error);
        this.setState({askEnableBle: true})
      });

      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        console.log(result)
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
          console.log("print callback:", msg, error)
          if (msg === 'ok') {
            ToastShort("已发送给蓝牙打印机！");
          }
          this._hidePrinterChooser();
        };
        console.log(printer_id, 'printer_id')
        BleManager.retrieveServices(printer_id).then((peripheral) => {
          print_order_to_bt(this.props, peripheral, clb, order.id, order);
        }).catch((error) => {
          console.log('已断开，计划重新连接', error);
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

  _doSunMiPint() {
    const {order} = this.state;
    native.printSmPrinter(order, (ok, msg) => {
      console.log("printer result:", ok, msg)
    });
    this._hidePrinterChooser();
  }


  onSaveDelayShip(date) {
    let expect_time = tool.fullDate(date);
    const {order} = this.state;
    if (Moment(expect_time).unix() <= Moment().unix()) {
      ToastLong('不能小于当前时间')
      return null;
    }
    let send_data = {
      wm_id: order.id,
      expect_time: expect_time,
    };
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(saveOrderDelayShip(send_data, accessToken, (resp) => {
        if (resp.ok) {
          ToastShort('操作成功');
          this.fetchData();
        }
      }));
    });
  }

  _dispatchToInvalidate() {
    const {dispatch} = this.props;
    dispatch(clearLocalOrder(this.state.order_id));
    this.fetchData();
  }

  onMenuOptionSelected(option) {
    const {accessToken} = this.props.global;
    const {navigation} = this.props;
    let order = this.state.order
    if (option.key === MENU_EDIT_BASIC) {
      navigation.navigate(Config.ROUTE_ORDER_EDIT, {order: order});
    } else if (option.key === MENU_EDIT_EXPECT_TIME) {//修改配送时间
      this.setState({
        isEndVisible: true,
      });
    } else if (option.key === MENU_EDIT_STORE) {
      navigation.navigate(Config.ROUTE_ORDER_STORE, {order: order});
    } else if (option.key === MENU_FEEDBACK) {
      const vm_path = order.feedback && order.feedback.id ? "#!/feedback/view/" + order.feedback.id
        : "#!/feedback/order/" + order.id;
      const path = `vm?access_token=${accessToken}${vm_path}`;
      const url = Config.serverUrl(path, Config.https);
      navigation.navigate(Config.ROUTE_WEB, {url});
    } else if (option.key === MENU_SET_INVALID) {
      navigation.navigate(Config.ROUTE_ORDER_TO_INVALID, {order: order});
      GlobalUtil.setOrderFresh(1)
    } else if (option.key === MENU_CANCEL_ORDER) {
      GlobalUtil.setOrderFresh(1)
      this.cancel_order()
    } else if (option.key === MENU_ADD_TODO) {
      navigation.navigate(Config.ROUTE_ORDER_TODO, {order: order});
    } else if (option.key === MENU_OLD_VERSION) {
      GlobalUtil.setOrderFresh(1)
      native.toNativeOrder(order.id);
    } else if (option.key === MENU_PROVIDING) {
      this._onToProvide();
    } else if (option.key === MENU_RECEIVE_QR) {
      this.setState({visibleReceiveQr: true})
    } else if (option.key === MENU_SEND_MONEY) {
      navigation.navigate(Config.ROUTE_ORDER_SEND_MONEY, {orderId: order.id, storeId: order.store_id})
    } else if (option.key === MENU_ORDER_SCAN) {
      navigation.navigate(Config.ROUTE_ORDER_SCAN, {orderId: order.id})
    } else if (option.key === MENU_ORDER_SCAN_READY) {
      navigation.navigate(Config.ROUTE_ORDER_SCAN_REDAY)
    } else if (option.key === MENU_ORDER_CANCEL_TO_ENTRY) {
      navigation.navigate(Config.ROUTE_ORDER_CANCEL_TO_ENTRY, {orderId: order.id})
    } else if (option.key === MENU_REDEEM_GOOD_COUPON) {
      navigation.navigate(Config.ROUTE_ORDER_GOOD_COUPON, {
        type: 'select',
        storeId: order.store_id,
        orderId: order.id,
        coupon_type: Cts.COUPON_TYPE_GOOD_REDEEM_LIMIT_U,
        to_u_id: order.user_id,
        to_u_name: order.userName,
        to_u_mobile: order.mobile,
      })
    } else if (option.key === MENU_SET_COMPLETE) {
      this.toSetOrderComplete()
    } else if (option.key === MENU_CALL_STAFF) {
      this._onShowStoreCall()
    } else {
      ToastShort('未知的操作');
    }
  }

  toSetOrderComplete() {
    let {accessToken, config} = this.props.global
    const {id} = config.vendor
    Alert.alert('确认将订单置为完成', '订单置为完成后无法撤回，是否继续？', [{
      text: '确认', onPress: () => {
        HttpUtils.get(`/api/complete_order/${this.state.order_id}?access_token=${accessToken}&vendorId=${id}`).then(res => {
          ToastLong('订单已完成')
          this.fetchData()
          GlobalUtil.setOrderFresh(1)
        }).catch(() => {
          showError('置为完成失败')
        })
      }
    }, {text: '再想想'}])
  }

  _onToProvide() {
    const {order, navigation} = this.props;
    if (order.order.store_id <= 0) {
      ToastLong("所属门店未知，请先设置好订单所属门店！");
      return false;
    }
    const path = `stores/orders_go_to_buy/${order.order.id}.html?access_token=${global.accessToken}`;
    navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl(path, Config.https)});
  }

  cancel_order() {
    let {orderId} = this.props.route.params;
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;

    Alert.alert(
      '确认是否取消订单', '取消订单后无法撤回，是否继续？',
      [
        {
          text: '确认', onPress: () => dispatch(orderCancel(accessToken, orderId, async (resp, reason) => {
            if (resp) {
              ToastLong('订单已取消成功')
              this.fetchData()
            } else {
              let msg = ''
              reason = JSON.stringify(reason)
              Alert.alert(reason, msg, [
                {
                  text: '我知道了',
                }
              ])
            }
          }))
        },
        {
          "text": '返回', onPress: () => {
            Alert.alert('我知道了')
          }
        }
      ]
    )
  }

  _fnProvidingOnway() {
    const {global} = this.props;
    const storeId = this.state.order.store_id;
    return storeId && storeId > 0 && (tool.vendorOfStoreId(storeId, global) || {}).fnProvidingOnway;
  }

  _orderChangeLogQuery() {
    const {dispatch, global} = this.props;
    dispatch(orderChangeLog(this.state.order_id, global.accessToken, (ok, msg, contacts) => {
      if (ok) {
        this.setState({orderChangeLogs: contacts});
      } else {
        ToastLong(msg)
      }
    }));
  }


  _doProcessRemind(remind) {
    const {order} = this.state;
    const {dispatch, navigation, global} = this.props;
    const remindType = parseInt(remind.type);
    if (remindType === Cts.TASK_TYPE_REFUND_BY_USER || remindType === Cts.TASK_TYPE_AFS_SERVICE_BY_USER) {
      navigation.navigate(Config.ROUTE_REFUND_AUDIT, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_REMIND) {
      navigation.navigate(Config.ROUTE_ORDER_URGE, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_DELIVERY_FAILED) {
      navigation.navigate(Config.ROUTE_JD_AUDIT_DELIVERY, {remind: remind, order: order})
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

  renderPrinter() {

    const remindNicks = tool.length(this.state.reminds) > 0 ? this.state.reminds.nicknames : '';
    const reminds = tool.length(this.state.reminds) > 0 ? this.state.reminds.reminds : [];
    const task_types = this.props.global.config.task_types || {};

    return (
      <View>
        <Tips navigation={this.props.navigation} orderId={this.state.order.id}
              storeId={this.state.order.store_id} key={this.state.order.id} modalTip={this.state.modalTip}
              onItemClick={() => this.closeModal()}></Tips>
        <OrderReminds task_types={task_types} reminds={reminds} remindNicks={remindNicks}
                      processRemind={this._doProcessRemind.bind(this)}/>
        <ActionSheet
          visible={this.state.showPrinterChooser}
          onRequestClose={() => this._hidePrinterChooser()}
          menus={[
            {
              type: 'default',
              label: this._cloudPrinterSN(),
              onPress: this._doCloudPrint.bind(this),
            }, {
              type: 'default',
              label: '蓝牙打印',
              onPress: this._doBluetoothPrint.bind(this),
            }, {
              type: 'default',
              label: '商米打印',
              onPress: this._doSunMiPint.bind(this),
            }
          ]}
          actions={[
            {
              type: 'default',
              label: '取消',
              onPress: this._hidePrinterChooser.bind(this),
            }
          ]}
        />

        <DateTimePicker
          cancelTextIOS={'取消'}
          confirmTextIOS={'修改'}
          customHeaderIOS={() => {
            return (<View/>)
          }}
          date={new Date(this.state.order.expectTime)}
          mode='datetime'
          isVisible={this.state.isEndVisible}
          onConfirm={(date) => {
            this.onSaveDelayShip(date)
          }}
          onCancel={() => {
            this.setState({
              isEndVisible: false,
            });
          }}
        />


        <ActionSheet
          visible={this.state.showCallStore}
          onRequestClose={() => {
            this.setState({showCallStore: false})
          }}
          menus={this._contacts2menus()}
          actions={[
            {
              type: 'default',
              label: '取消',
              onPress: this._hideCallStore.bind(this),
            }
          ]}
        />


        {this.renderReceiveQr(this.state.order)}
      </View>)
  }


  _hideCallStore() {
    this.setState({showCallStore: false});
  }

  _onShowStoreCall() {

    const {store, dispatch, global} = this.props;

    const store_id = this.state.order.store_id;
    const contacts = (store.store_contacts || {}).store_id;

    if (!contacts || contacts.length === 0) {
      this.setState({showContactsLoading: true});
      dispatch(getContacts(global.accessToken, store_id, (ok, msg, contacts) => {
        this.setState({store_contacts: contacts, showContactsLoading: false, showCallStore: true})
      }));
    } else {
      this.setState({showCallStore: true})
    }
  }

  _contacts2menus() {
    // ['desc' => $desc, 'mobile' => $mobile, 'sign' => $on_working, 'id' => $uid]
    return (this.state.store_contacts || []).map((contact, idx) => {
      const {sign, mobile, desc, id} = contact;
      return {
        type: 'default',
        label: desc + (sign ? '[上班] ' : ''),
        onPress: () => {
          native.dialNumber(mobile)
        }
      }
    });
  }


  renderHeader() {
    let {order} = this.state;
    return (
      <View style={{
        borderRadius: pxToDp(20),
        paddingBottom: pxToDp(10),
        backgroundColor: colors.white,
      }}>
        <View style={{
          backgroundColor: "#28A077",
          borderTopLeftRadius: pxToDp(20),
          borderTopRightRadius: pxToDp(20),
          padding: pxToDp(30),
          paddingBottom: pxToDp(20),
        }}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{
              color: order.status_show === '订单已取消' ? '#F76969' : colors.white,
              textDecorationLine: order.status_show === '订单已取消' ? 'line-through' : "none",
              fontSize: 20,
            }}>{order.status_show}  </Text>
            <View style={{flex: 1}}></View>
            <Text style={{
              color: colors.white,
              fontSize: 16,
              width: pxToEm(300),
              textAlign: 'right'
            }}>{order.show_seq}  </Text>
          </View>
          <View style={{flexDirection: 'row', marginTop: 8}}>
            <Text style={{color: colors.white, fontSize: 12, marginTop: pxToDp(2)}}>预计送达时间</Text>
            <Text style={{color: colors.white, fontSize: 12, marginLeft: pxToDp(10)}}>{order.expectTime}</Text>
          </View>
        </View>
        <View style={{padding: pxToDp(20)}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 12, width: pxToDp(110)}}>下单时间 </Text>
            <Text style={{fontSize: 12}}>{order.orderTime}  </Text>
            <View style={{flex: 1}}></View>
            <Text style={{fontSize: 12}}>{order.show_store_name}  </Text>
          </View>
          <TouchableOpacity onPress={() => {
            Clipboard.setString(order.id)
            ToastLong('已复制到剪切板')
          }} style={{flexDirection: 'row', marginTop: pxToDp(15)}}>
            <Text style={{fontSize: 12, width: pxToDp(110)}}>订单号 </Text>
            <Text style={{fontSize: 12}}>{order.id}  </Text>
            <Text style={{fontSize: 12, color: colors.main_color, marginLeft: pxToDp(30)}}>复制 </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            Clipboard.setString(order.platform_oid)
            ToastLong('已复制到剪切板')
          }} style={{flexDirection: 'row', marginTop: pxToDp(15)}}>
            <Text style={{fontSize: 12, width: pxToDp(110)}}>平台单号 </Text>
            <Text style={{fontSize: 12}}>{order.platform_oid}</Text>
            <Text style={{fontSize: 12, color: colors.main_color, marginLeft: pxToDp(30)}}>复制 </Text>
          </TouchableOpacity>
          {tool.length(order.remark) > 0 ? <View style={{marginTop: pxToDp(15)}}>
            <View style={{flexDirection: 'row',}}>
              <Text style={{fontSize: 12, width: pxToDp(110)}}>客户备注 </Text>
              <Text style={{fontSize: 12, color: "#F76969", width: pxToDp(440)}}>{order.remark}  </Text>
            </View>
            {/*<View style={{flexDirection: 'row'}}>*/}
            {/*  <View style={{width: pxToDp(110)}}></View>*/}
            {/*  <View>*/}
            {/*    <Text style={{marginTop: pxToDp(15), fontSize: 12,}}>缺货时电话与我沟通，收餐人隐私号</Text>*/}
            {/*    <Text style={{marginTop: pxToDp(15), fontSize: 12,}}>*/}
            {/*      <Text style={{color: colors.main_color, fontSize: 12}}>13078855098_0125 </Text>*/}
            {/*      <Text>,手机号</Text>*/}
            {/*      <Text style={{color: colors.main_color, fontSize: 12}}>187****6997 </Text>*/}
            {/*    </Text>*/}
            {/*  </View>*/}
            {/*</View>*/}
          </View> : null}

          {tool.length(order.store_remark) > 0 ? <View style={{marginTop: pxToDp(15)}}>
            <View style={{flexDirection: 'row',}}>
              <Text style={{fontSize: 12, width: pxToDp(110)}}>商户备注 </Text>
              <Text style={{fontSize: 12, color: "#F76969", flex: 1}}>{order.store_remark}  </Text>
            </View>
          </View> : null}
          {tool.length(order.giver_phone) > 0 ? <View style={{marginTop: pxToDp(15)}}>
            <View style={{flexDirection: 'row',}}>
              <Text style={{fontSize: 12, width: pxToDp(110)}}>订购人电话 </Text>
              <Text style={{fontSize: 12, color: "#F76969", flex: 1}}>{order.giver_phone}  </Text>
            </View>
          </View> : null}
          {tool.length(order.invoice) > 0 ? <View style={{marginTop: pxToDp(15)}}>
            <View style={{flexDirection: 'row',}}>
              <Text style={{fontSize: 12, width: pxToDp(110)}}>发票抬头 </Text>
              <Text style={{fontSize: 12, color: "#F76969", flex: 1}}>{order.invoice}  </Text>
            </View>
          </View> : null}
          {tool.length(order.taxer_id) > 0 ? <View style={{marginTop: pxToDp(15)}}>
            <View style={{flexDirection: 'row',}}>
              <Text style={{fontSize: 12, width: pxToDp(110)}}>税号 </Text>
              <Text style={{fontSize: 12, color: "#F76969", flex: 1}}>{order.taxer_id}  </Text>
            </View>
          </View> : null}
          {tool.length(order.greeting) > 0 ? <View style={{marginTop: pxToDp(15)}}>
            <View style={{flexDirection: 'row',}}>
              <Text style={{fontSize: 12, width: pxToDp(110)}}>祝福语 </Text>
              <Text style={{fontSize: 12,}}>{order.greeting}  </Text>
            </View>
          </View> : null}
        </View>
      </View>
    )
  }

  onConfirmAddTip(logisticId, val) {
    let token = this.props.global.accessToken
    const api = `v1/new_api/delivery/add_tips/${logisticId}/${val}?access_token=${token}`;
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      this.setState({
        showDeliveryModal: false
      })
      Alert.alert('提示', '追加小费成功', [{text: '知道了'}])
      this.fetchData()
    }).catch(e => {
      if (e.ok === false) {
        this.setState({
          showDeliveryModal: false
        })
        Alert.alert('提示', `${e.reason}`, [{text: '知道了'}])
        this.fetchData()
      }
    })
  }

  renderDeliveryInfo() {
    const {navigation} = this.props;
    return (<View>
      <For each="item" index="i" of={this.state.logistics}>
        <If condition={item.is_show === 1}>
          <View key={i} style={{
            borderBottomColor: colors.fontColor,
            borderBottomWidth: this.state.logistics.length - 1 === i ? 0 : pxToDp(1),
            paddingBottom: this.state.logistics.length - 1 === i ? 0 : pxToDp(20),
            marginTop: pxToDp(20),
          }}>
            <Text style={{
              fontWeight: 'bold',
              fontSize: 14
            }}>{item.logistic_name} - {item.status_name} {item.call_wait_desc}  </Text>
            <View style={{flexDirection: 'row', marginTop: pxToDp(20)}}>
              {tool.length(item.driver_name) > 0 && tool.length(item.driver_phone) > 0 ?
                <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
                  native.dialNumber(item.driver_phone)
                }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.fontColor,
                      // marginLeft: pxToDp(30),
                      marginTop: pxToDp(3)
                    }}>{item.distance} 米,{item.fee} 元 骑手：{item.driver_name}  </Text>
                  <Text
                    style={{fontSize: 12, color: colors.main_color, marginLeft: pxToDp(30)}}>{item.driver_phone}</Text>
                  {/*<Text*/}
                  {/*  style={{*/}
                  {/*    fontSize: 12,*/}
                  {/*    color: colors.main_color,*/}
                  {/*    marginLeft: pxToDp(10),*/}
                  {/*    marginTop: pxToDp(3)*/}
                  {/*  }}>拨打</Text>*/}

                </TouchableOpacity> : null
              }
            </View>
            <If condition={tool.length(item.driver_name) > 0 && tool.length(item.driver_phone) > 0}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: pxToDp(20),
              }}>
                <Button title={'投诉骑手'}
                        onPress={() => {
                          navigation.navigate(Config.ROUTE_COMPLAIN, {id: item.id})
                        }}
                        buttonStyle={{
                          backgroundColor: colors.white,
                          borderWidth: pxToDp(1),
                          width: pxToDp(150),
                          borderColor: colors.fontColor,
                          borderRadius: pxToDp(10),
                          padding: pxToDp(15),
                          marginRight: pxToDp(15)
                        }}

                        titleStyle={{
                          color: colors.fontColor,
                          fontSize: 12,
                        }}
                />
                {item.show_trace ? <Button title={'呼叫骑手'}
                                           onPress={() => {
                                             native.dialNumber(item.driver_phone)
                                           }}
                                           buttonStyle={{
                                             backgroundColor: colors.main_color,
                                             width: pxToDp(150),
                                             borderRadius: pxToDp(10),
                                             padding: pxToDp(14),
                                             marginRight: pxToDp(15)
                                           }}

                                           titleStyle={{
                                             color: colors.white,
                                             fontSize: 12,
                                             fontWeight: 'bold'
                                           }}
                /> : null}
                {item.can_add_tip ?
                  <JbbPrompt
                    title={'输入小费'}
                    onConfirm={(value) => this.onConfirmAddTip(item.id, value)}
                    initValue={item.tip}>
                    <Button title={'加小费'}
                            buttonStyle={{
                              backgroundColor: colors.main_color,
                              width: pxToDp(150),
                              borderRadius: pxToDp(10),
                              padding: pxToDp(15),
                              marginRight: pxToDp(15)
                            }}
                            titleStyle={{
                              color: colors.white,
                              fontSize: 12,
                            }}
                    />
                  </JbbPrompt>
                  : null}
                {item.can_cancel ? <Button title={'取消配送'}
                                           onPress={() => {
                                             navigation.navigate(Config.ROUTE_ORDER_CANCEL_SHIP,
                                               {
                                                 order: this.state.order,
                                                 ship_id: item.id,
                                                 onCancelled: (ok, reason) => {
                                                   this.fetchData()
                                                 }
                                               });
                                           }}
                                           buttonStyle={{
                                             backgroundColor: colors.fontColor,
                                             borderWidth: pxToDp(1),
                                             width: pxToDp(150),
                                             borderColor: colors.fontColor,
                                             borderRadius: pxToDp(10),
                                             padding: pxToDp(15),
                                           }}

                                           titleStyle={{
                                             color: colors.white,
                                             fontSize: 12,
                                           }}
                /> : null}
              </View>
            </If>
          </View>
        </If>
      </For>
    </View>)
  }

  renderDelivery() {

    return (
      <View style={{
        borderRadius: pxToDp(20),
        paddingBottom: pxToDp(30),
        padding: pxToDp(20),
        backgroundColor: colors.white,
        marginTop: pxToDp(20),
      }}>

        {this.state.order.pickType === '1' ? <TouchableOpacity onPress={() => {
          this.setState({
            showQrcode: !this.state.showQrcode
          })
        }} style={{flexDirection: 'row'}}>
          <Text style={{
            fontSize: 12,
            color: colors.main_color,
            marginLeft: pxToDp(12),
            marginRight: pxToDp(20)
          }}>取货码：{this.state.qrcode}</Text>
          <MaterialCommunityIcons name={'focus-field'}
                                  style={{color: colors.main_color, fontSize: 14}}></MaterialCommunityIcons>
        </TouchableOpacity> : null}

        {this.state.order.pickType === '1' ?
          <View
            style={{flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: pxToDp(30)}}>
            <QRCode
              value={this.state.qrcode}
              color="black"
              size={150}
            />
          </View> : null}
        <If condition={this.state.order.pickType !== '1'}>
          <TouchableOpacity onPress={() => {
            if (this.state.deliverie_status !== '已接单' && this.state.deliverie_status !== '待呼叫配送') {
              this.setState({showDeliveryModal: true})
            }
          }}>
            <Text style={{
              textAlign: "center",
              fontSize: 21,
              color: colors.main_color,
              marginTop: pxToDp(30),
              fontWeight: "bold"
            }}>{this.state.deliverie_status}</Text>

            <Text style={{
              textAlign: 'center',
              fontWeight: "bold",
              marginTop: pxToDp(25)
            }}>
              <Text>
                <Text> {this.state.deliverie_desc}  </Text>
                {this.state.deliverie_status !== '已接单' && this.state.deliverie_status !== '待呼叫配送' ?
                  <Entypo name='chevron-thin-right' style={{fontSize: 14}}/> : null}
              </Text>
            </Text>
          </TouchableOpacity>

          {this.state.order.platform === '6' ?
            <View
              style={{justifyContent: "center", alignItems: "center", marginTop: pxToDp(30)}}>
              <QRCode
                value={this.state.order.platform_oid}
                color="black"
                size={150}
              />
              <Text style={{
                fontSize: 14,
                marginTop: pxToDp(20)
              }}>{this.state.order.platform_oid}</Text>
            </View> : null}

          {this.renderDeliveryInfo()}

          <If condition={this.state.show_no_rider_tips}>
            <TouchableOpacity onPress={() => {
              this.setState({
                modalTip: true,

              })

            }} style={{marginTop: pxToDp(20)}}>
              <View style={{
                backgroundColor: "#EAFFEE",
                flexDirection: 'row',
                borderRadius: pxToDp(20),
                marginTop: pxToDp(20),
                padding: pxToDp(15)
              }}>
                <Entypo name='help-with-circle' style={{fontSize: 14, color: colors.main_color}}/>
                <Text style={{fontSize: 12, marginLeft: pxToDp(20), marginTop: pxToDp(2)}}>长时间没有骑手接单怎么办？</Text>
              </View>
            </TouchableOpacity>
          </If>
          {/*    <View style={{*/}
          {/*  backgroundColor: "#EAFFEE",*/}
          {/*  flexDirection: 'row',*/}
          {/*  borderRadius: pxToDp(20),*/}
          {/*  marginTop: pxToDp(20),*/}
          {/*  padding: pxToDp(15)*/}
          {/*}}>*/}
          {/*  <Entypo name='help-with-circle' style={{fontSize: 14, color: colors.main_color}}/>*/}
          {/*  <Text style={{fontSize: 12, marginLeft: pxToDp(20), marginTop: pxToDp(2)}}>长时间没有骑手接单怎么办？</Text>*/}
          {/*</View> : null}*/}
        </If>
      </View>
    )
  }

  renderClient() {
    let {order} = this.state;
    return (
      <View style={{
        borderRadius: pxToDp(20),
        paddingBottom: pxToDp(20),
        padding: pxToDp(20),
        backgroundColor: colors.white,
        marginTop: pxToDp(20),
      }}>
        <View>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 12, width: pxToDp(80), marginTop: pxToDp(5)}}>姓名</Text>
            <Text style={{fontSize: 14, fontWeight: 'bold'}}>{order.userName}</Text>
            <Text
              style={{
                fontSize: 10,
                color: colors.white,
                backgroundColor: "#FFB454",
                padding: pxToDp(5),
                marginRight: pxToDp(30),
                marginLeft: pxToDp(30),
              }}>{order.order_times === '1' ? "新客户" : `第${order.order_times}次`}</Text>
            <Text onPress={() => {
              this.props.navigation.navigate(Config.ROUTE_ORDER_EDIT, {order: order});
            }} style={{fontSize: 10, color: colors.main_color, marginTop: pxToDp(5)}}>修改订单</Text>
          </View>
          <View style={{flexDirection: 'row', marginTop: pxToDp(15)}}>
            <Text style={{fontSize: 12, width: pxToDp(80), marginTop: pxToDp(5)}}>地址</Text>
            <View style={{flexDirection: 'row', width: Dimensions.get("window").width * 0.6}}>
              <Text style={{
                fontSize: 12,
              }}>{order.address}-{Number(order.dada_distance / 1000).toFixed(2)}km</Text>
              <Text style={{
                fontSize: 12,
                color: colors.main_color,
                marginTop: "auto",
                marginBottom: "auto",
                marginLeft: pxToDp(15),
              }} onPress={() => {
                let orderId = order.id;
                const accessToken = this.props.global.accessToken
                let path = '/AmapTrack.html?orderId=' + orderId + "&access_token=" + accessToken;
                const uri = Config.serverUrl(path);
                this.props.navigation.navigate(Config.ROUTE_WEB, {url: uri});
              }}>查看地图</Text>
            </View>
          </View>
          <TouchableOpacity style={{flexDirection: 'row', marginTop: pxToDp(15)}} onPress={() => {
            native.dialNumber(order.mobile)
          }}>
            <Text style={{fontSize: 12, width: pxToDp(80), marginTop: pxToDp(5)}}>电话</Text>
            <Text style={{fontSize: 12, color: colors.main_color}}>{order.mobileReadable}</Text>
            <Text style={{fontSize: 12, color: colors.main_color, marginLeft: pxToDp(30)}}>拨打</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _onItemRowNumberChanged(item, newNum) {
    this._recordEdition({...item, num: newNum});
  }

  _recordEdition(item) {
    if (item.id) {
      this.setState({itemsEdited: {...this.state.itemsEdited, [item.id]: item}});
    } else {
      this.setState({itemsAdded: {...this.state.itemsAdded, [item.product_id]: item}});
    }
  }

  total_goods_num(items) {
    let num = 0
    items.forEach((item) => {
      num += parseInt(item.num);
    })
    return num
  }

  _totalEditingCents() {
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

  _doRefund() {
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

  _doSaveItemsEdit() {

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

  _doAddItem(item) {
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


  renderGoods() {
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
      <View style={{
        borderRadius: pxToDp(20),
        paddingBottom: pxToDp(20),
        padding: pxToDp(20),
        backgroundColor: colors.white,
        marginTop: pxToDp(20),
      }}>
        <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
          this.setState({showGoodsList: !this.state.showGoodsList})
        }}>
          <Text style={{
            fontSize: 12,
            marginTop: pxToDp(10),
            width: pxToEm(240),
            // marginLeft: pxToDp(30)
          }}>共{this.total_goods_num(_items)}件商品</Text>
          <View style={{flex: 1}}></View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: pxToDp(310),
          }}>
            <Button
              onPress={() => {
                this._doRefund()
              }}
              title={'退款申请'}
              buttonStyle={{
                backgroundColor: colors.fontColor,
                borderWidth: pxToDp(1),
                borderColor: colors.fontColor,
                borderRadius: pxToDp(10),
                padding: pxToDp(12),
                marginLeft: 0,
                marginRight: 0,
              }}
              titleStyle={{
                color: colors.white,
                fontSize: 12
              }}
            />

            {!this.state.isEditing ?
              <Button
                title={'修改商品'}
                disabled={!order._op_edit_goods}
                onPress={() => {
                  this.setState({isEditing: true, showGoodsList: false})
                }}
                buttonStyle={{
                  backgroundColor: colors.main_color,
                  borderRadius: pxToDp(10),
                  padding: pxToDp(12),
                  marginLeft: 0,
                  marginRight: 0,
                }}

                titleStyle={{
                  color: colors.white,
                  fontSize: 12
                }}
              /> : null}
            {this.state.isEditing ? <Button
              title={'修改'}
              disabled={!order._op_edit_goods}
              onPress={() => {
                this._doSaveItemsEdit()
              }}
              buttonStyle={{
                backgroundColor: colors.main_color,
                borderRadius: pxToDp(10),
                padding: pxToDp(12),
                marginLeft: 0,
                marginRight: 0,
              }}
              titleStyle={{
                color: colors.white,
                fontSize: 12
              }}
            /> : null}

            {this.state.isEditing ? <Button
              title={'取消'}
              disabled={!order._op_edit_goods}
              onPress={() => {
                this.setState({isEditing: false,})
              }}
              buttonStyle={{
                backgroundColor: colors.main_color,
                borderRadius: pxToDp(10),
                padding: pxToDp(12),
                marginLeft: 0,
                marginRight: 0,
              }}
              titleStyle={{
                color: colors.white,
                fontSize: 12
              }}
            /> : null}


          </View>
          {this.state.showGoodsList ?
            <Entypo name='chevron-thin-right' style={{fontSize: 16, marginTop: pxToDp(6)}}/> :
            <Entypo name='chevron-thin-up' style={{fontSize: 16, marginTop: pxToDp(6)}}/>}
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
          <View style={[{
            marginTop: pxToDp(12),
            flexDirection: 'row',
            alignContent: 'center',
          }, styles.moneyRow]}>
            <View style={[styles.moneyLeft, {alignItems: 'flex-end'}]}>
              <Text style={[styles.moneyListTitle, {flex: 1}]}>供货价小计</Text>
            </View>
            <View style={{flex: 1}}/>
            {/*直营店显示外卖价，管理员显示保底价，非直营店根据模式显示*/}
            <Text style={styles.moneyListNum}>
              {/*直接显示保底价总计*/}
              {numeral(order.supply_price / 100).format('0.00')}
            </Text>
          </View>
          : null}
        {/*管理员 和 直营店 可看*/}
        <If condition={is_service_mgr || !order.is_fn_price_controlled || order.is_fn_show_wm_price}>
          <View style={[{
            marginTop: pxToDp(12),
            flexDirection: 'row',
            alignContent: 'center',
          }, styles.moneyRow]}>
            <View style={[styles.moneyLeft, {alignItems: 'flex-end'}]}>
              <Text style={styles.moneyListTitle}>用户已付</Text>
              <Text style={{fontSize: pxToEm(20), flex: 1}}>含平台扣费、优惠等</Text>
            </View>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>
              {numeral(order.orderMoney).format('0.00')}
            </Text>
          </View>
          <View style={[{
            marginTop: pxToDp(12),
            flexDirection: 'row',
            alignContent: 'center',
          }, styles.moneyRow]}>
            <Text style={[styles.moneyListTitle, {width: pxToDp(480)}]}>配送费</Text>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>{numeral(order.deliver_fee / 100).format('0.00')}</Text>
          </View>
          <View style={[{
            marginTop: pxToDp(12),
            flexDirection: 'row',
            alignContent: 'center',
          }, styles.moneyRow]}>
            <View style={[styles.moneyLeft, {alignItems: 'center'}]}>
              <Text style={styles.moneyListTitle}>优惠</Text>
              <TouchableOpacity style={{marginLeft: 5}}><Icons name='question-circle-o'/></TouchableOpacity>
            </View>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>{numeral(order.self_activity_fee / 100).format('0.00')} </Text>
          </View>
          <If condition={order.bill && order.bill.total_income_from_platform}>
            <View style={[{
              marginTop: pxToDp(12),
              flexDirection: 'row',
              alignContent: 'center',
            }, styles.moneyRow]}>
              <Text
                style={[styles.moneyListTitle, {width: pxToDp(480)}]}>{order.bill.total_income_from_platform[0]}</Text>
              <View style={{flex: 1}}/>
              <Text style={styles.moneyListNum}>{order.bill.total_income_from_platform[1]}</Text>
            </View>
          </If>
        </If>

        {order.additional_to_pay != '0' ?
          <View style={[{
            marginTop: pxToDp(12),
            flexDirection: 'row',
            alignContent: 'center',
            alignItems: 'center'
          }]}>
            <View style={{
              width: pxToDp(480),
              flexDirection: 'row',
            }}>
              <Text style={{
                flex: 1,
                fontSize: pxToDp(26),
                color: colors.color333,
              }}>需加收/退款</Text>
              <TouchableOpacity style={[{marginLeft: pxToDp(20), alignItems: 'center', justifyContent: 'center'}]}>
                <Text style={{color: colors.main_color, fontWeight: 'bold', flexDirection: 'row'}}>
                  <Text>收款码</Text>
                  <Icons name='qrcode'/>
                </Text>
              </TouchableOpacity>
              {(order.additional_to_pay != 0) &&
              <Text style={{
                fontSize: pxToDp(26),
                color: colors.main_color,
              }}>{order.additional_to_pay > 0 ? '加收' : '退款'}</Text>}
            </View>
            <View style={{flex: 1}}/>
            <Text style={{
              fontSize: pxToDp(26),
              color: colors.color777
            }}>
              {numeral(order.additional_to_pay / 100).format('+0.00')}
            </Text>
          </View>
          : null}
        {/*管理员可看*/}
        <If condition={is_service_mgr || !order.is_fn_price_controlled}>
          <View style={{
            flexDirection: 'row',
            alignContent: 'center',
            marginBottom: pxToDp(12),
            alignItems: 'center'
          }}>
            <View style={{
              width: pxToDp(480),
              flexDirection: 'row',
            }}>
              <Text style={{
                flex: 1,
                fontSize: pxToDp(26),
                color: colors.color333
              }}>商品原价</Text>
              {totalMoneyEdit !== 0 &&
              <View>
                <Text
                  style={[{
                    backgroundColor: totalMoneyEdit > 0 ? colors.editStatusAdd : colors.editStatusDeduct,
                    color: colors.white,
                    fontSize: pxToDp(22),
                    borderRadius: pxToDp(5),
                    alignSelf: 'center',
                    paddingLeft: 5,
                    paddingRight: 5,
                    paddingTop: 2,
                    paddingBottom: 2
                  }]}>
                  {totalMoneyEdit > 0 ? '需加收' : '需退款'}{numeral(totalMoneyEdit / 100).format('0.00')}元
                </Text>
                <Text style={[{
                  textDecorationLine: 'line-through',
                  fontSize: pxToDp(26),
                  color: colors.color777,
                }]}>
                  {numeral(order.total_goods_price / 100).format('0.00')}
                </Text>
              </View>}
            </View>
            <View style={{flex: 1}}/>
            <Text style={{
              fontSize: pxToDp(26),
              color: colors.color777,
            }}>
              {numeral(finalTotal).format('0.00')}
            </Text>
          </View>
        </If>
        <Refund
          orderId={order.id}
          platform={order.platform}
          isFnPriceControl={order.is_fn_price_controlled}
          isServiceMgr={is_service_mgr}
        />
        <View style={{borderTopColor: colors.fontColor, borderTopWidth: pxToDp(1)}}></View>
        {tool.length(worker_nickname) > 0 ?
          <View style={[{
            marginTop: pxToDp(12),
            flexDirection: 'row',
            alignContent: 'center',
          }, styles.moneyRow, {marginTop: pxToDp(12)}]}>
            <Text style={{fontSize: 12, width: pxToDp(140)}}>分拣人姓名</Text>
            <Text style={{fontSize: 12}}>{worker_nickname}</Text>
          </View>
          : null}

        {order.time_ready ?
          <View style={[{
            marginTop: pxToDp(12),
            flexDirection: 'row',
            alignContent: 'center',
          }, styles.moneyRow, {marginTop: pxToDp(12)}]}>
            <Text style={{fontSize: 12, width: pxToDp(140)}}>分拣时间</Text>
            <Text style={{fontSize: 12}}>{order.time_ready}</Text>
          </View>
          : null}

        {order.pack_operator ?
          <View style={[{
            marginTop: pxToDp(12),
            flexDirection: 'row',
            alignContent: 'center',
          }, styles.moneyRow, {marginTop: pxToDp(12)}]}>
            <Text style={{fontSize: 12, width: pxToDp(140)}}>记录人</Text>
            <Text style={{fontSize: 12}}>{order.pack_operator.nickname}</Text>
          </View>
          : null}

      </View>
    )
  }

  renderChangeLog() {
    return (
      <View style={{
        marginBottom: pxToDp(100),
        borderRadius: pxToDp(20),
        paddingBottom: pxToDp(20),
        padding: pxToDp(20),
        backgroundColor: colors.white,
        marginTop: pxToDp(20),
      }}>
        <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
          this.setState({showChangeLogList: !this.state.showChangeLogList})
        }}>
          <Text style={{fontSize: 12}}>修改记录</Text>
          <View style={{flex: 1}}></View>
          {this.state.showChangeLogList ?
            <Entypo name='chevron-thin-right' style={{fontSize: 14}}/> :
            <Entypo name='chevron-thin-up' style={{fontSize: 14}}/>}
        </TouchableOpacity>
        {this.renderChangeLogList()}
      </View>
    )
  }

  renderChangeLogList() {
    if (!this.state.showChangeLogList && this.state.orderChangeLogs.length > 0) {
      return this.state.orderChangeLogs.map((item, index) => {
        return (
          <View key={index}
                style={{width: '100%', paddingHorizontal: pxToDp(30), backgroundColor: '#fff', minHeight: pxToDp(180)}}>
            <View style={{
              flex: 1,
              borderBottomWidth: pxToDp(1),
              borderColor: "#bfbfbf",
              minHeight: pxToDp(150),
              justifyContent: 'center'
            }}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{
                  color: '#59B26A',
                  fontSize: pxToEm(26),
                  overflow: 'hidden',
                  height: pxToDp(35)
                }}>{item.updated_name}</Text>
                <Text style={{
                  flex: 1,
                  color: '#59B26A',
                  fontSize: pxToEm(26),
                  overflow: 'hidden',
                  height: pxToDp(35),
                  marginLeft: pxToDp(24)
                }}>{item.modified}</Text>
              </View>
              <View style={{marginTop: pxToDp(20), width: '100%', height: 'auto', marginBottom: pxToDp(20)}}>
                <Text selectable={true}
                      style={{fontSize: pxToEm(24), height: 'auto', lineHeight: pxToDp(28)}}>{item.what}</Text>
              </View>
            </View>
          </View>
        )
      })
    } else if (this.state.orderChangeLogs.length === 0 && !this.state.showChangeLogList) {
      return <View style={{
        alignItems: 'center'
      }}>
        <Text style={{textAlign: "center", marginTop: pxToDp(30)}}>没有相应的记录</Text>
      </View>
    }
  }

  renderDeliveryStatus(list) {
    return (
      <View>
        <For each="log" index="i" of={list}>
          <View style={{
            flexDirection: 'row',
            paddingTop: pxToDp(15),
            paddingBottom: pxToDp(15),
          }}>
            <View style={{width: 30}}>
              <View style={{
                width: pxToDp(30),
                height: pxToDp(30),
                backgroundColor: log.status_color,
                borderRadius: pxToDp(15)
              }}>
                {i !== 0 ? <View style={{
                  width: pxToDp(5),
                  height: pxToDp(35),
                  backgroundColor: log.status_color,
                  position: 'absolute',
                  bottom: pxToDp(28),
                  left: pxToDp(13)
                }}></View> : null}

                {i !== list.length - 1 ? <View style={{
                    width: pxToDp(5),
                    height: pxToDp(35),
                    backgroundColor: log.status_color,
                    position: 'absolute',
                    top: pxToDp(28),
                    left: pxToDp(13)
                  }}></View>
                  : null}
              </View>
            </View>
            <View style={{width: '90%'}}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{color: log.status_desc_color, fontSize: 12}}>{log.status_desc}  </Text>
                <View style={{flex: 1}}></View>
                <Text style={{color: log.lists[0].content_color, fontSize: 12}}>{log.lists[0].content}  </Text>
              </View>
              <Text
                style={{
                  color: log.lists[0].desc_color,
                  fontSize: 10,
                  marginTop: pxToDp(10)
                }}>{log.lists[0].desc}  </Text>
            </View>
          </View>
        </For>
      </View>
    )
  }

  renderDeliveryModal() {
    let {navigation} = this.props;

    let height = tool.length(this.state.delivery_list) >= 3 ? pxToDp(800) : tool.length(this.state.delivery_list) * 250;
    if (tool.length(this.state.delivery_list) < 2) {
      height = 400;
    }
    return (
      <Modal visible={this.state.showDeliveryModal} hardwareAccelerated={true}
             onRequestClose={() => this.setState({showDeliveryModal: false})}
             transparent={true}>
        <View style={{flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.25)',}}>
          <TouchableOpacity style={{flex: 1}} onPress={() => {
            this.setState({showDeliveryModal: false})
          }}></TouchableOpacity>

          <View style={{
            backgroundColor: colors.white,
            height: height,
            borderTopLeftRadius: pxToDp(30),
            borderTopRightRadius: pxToDp(30),
          }}>
            <View style={{flexDirection: 'row',}}>
              <Text onPress={() => {
                navigation.navigate(Config.ROUTE_STORE_STATUS)
                this.setState({showDeliveryModal: false})
              }} style={{color: colors.main_color, marginTop: pxToDp(20), marginLeft: pxToDp(20)}}>呼叫配送规则</Text>
              <View style={{flex: 1}}></View>
              <TouchableOpacity onPress={() => {
                this.setState({showDeliveryModal: false})
              }}>
                <Entypo name={'cross'} style={{fontSize: pxToDp(50), color: colors.fontColor}}/>
              </TouchableOpacity>
            </View>

            <ScrollView
              overScrollMode="always"
              automaticallyAdjustContentInsets={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}>

              <View style={{padding: pxToDp(20),}}>
                <For each="info" index="i" of={this.state.delivery_list}>
                  <View key={i} style={{
                    padding: pxToDp(20),
                    borderRadius: pxToDp(15),
                    backgroundColor: "#F3F3F3",
                    marginBottom: pxToDp(20),
                  }}>
                    <TouchableOpacity onPress={() => {
                      let delivery_list = this.state.delivery_list
                      delivery_list[i].default_show = !delivery_list[i].default_show
                      this.setState({delivery_list: delivery_list})
                    }} style={{flexDirection: 'row'}}>
                      <Text style={{
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>{info.desc}  </Text>
                      <Text style={{
                        color: info.content_color,
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>{info.status_content} - {info.fee} 元 </Text>
                      <View style={{flex: 1}}></View>
                      {!info.default_show ? <Entypo name='chevron-thin-right' style={{fontSize: 14}}/> :
                        <Entypo name='chevron-thin-up' style={{fontSize: 14}}/>}
                    </TouchableOpacity>
                    <View
                      style={{fontSize: 12, marginTop: 12, marginBottom: 12, flexDirection: 'row'}}>
                      <Text style={{width: pxToDp(450)}}>{info.content} {info.driver_phone}  </Text>
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
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                      {info.btn_lists.can_cancel === 1 ? <Button title={'撤回呼叫'}
                                                                 onPress={() => {
                                                                   this.setState({showDeliveryModal: false})
                                                                   navigation.navigate(Config.ROUTE_ORDER_CANCEL_SHIP,
                                                                     {
                                                                       order: this.state.order,
                                                                       ship_id: info.ship_id,
                                                                       onCancelled: (ok, reason) => {
                                                                         this.fetchData()
                                                                       }
                                                                     });
                                                                 }}
                                                                 buttonStyle={{
                                                                   backgroundColor: colors.white,
                                                                   borderWidth: pxToDp(2),
                                                                   width: pxToDp(150),
                                                                   borderColor: colors.fontBlack,
                                                                   borderRadius: pxToDp(10),
                                                                   padding: pxToDp(14),
                                                                   marginRight: pxToDp(15)
                                                                 }}
                                                                 titleStyle={{
                                                                   color: colors.fontBlack,
                                                                   fontSize: 12,
                                                                   fontWeight: 'bold'
                                                                 }}
                      /> : null}
                      {info.btn_lists.can_complaint === 1 ? <Button title={'投诉骑手'}
                                                                    onPress={() => {
                                                                      this.setState({showDeliveryModal: false})
                                                                      navigation.navigate(Config.ROUTE_COMPLAIN, {id: info.ship_id})
                                                                    }}
                                                                    buttonStyle={{
                                                                      backgroundColor: colors.white,
                                                                      borderWidth: pxToDp(1),
                                                                      width: pxToDp(150),
                                                                      borderColor: colors.fontBlack,
                                                                      borderRadius: pxToDp(10),
                                                                      padding: pxToDp(15),
                                                                      marginRight: pxToDp(15)
                                                                    }}
                                                                    titleStyle={{
                                                                      color: colors.fontBlack,
                                                                      fontSize: 12,
                                                                    }}
                      /> : null}

                      {info.btn_lists.can_view_position === 1 ? <Button title={'查看位置'}
                                                                        onPress={() => {
                                                                          this.setState({showDeliveryModal: false})
                                                                          const accessToken = this.props.global.accessToken
                                                                          let path = '/rider_tracks.html?delivery_id=' + info.ship_id + "&access_token=" + accessToken;
                                                                          const uri = Config.serverUrl(path);
                                                                          this.props.navigation.navigate(Config.ROUTE_WEB, {url: uri});
                                                                        }}
                                                                        buttonStyle={{
                                                                          backgroundColor: colors.white,
                                                                          borderWidth: pxToDp(1),
                                                                          width: pxToDp(150),
                                                                          borderColor: colors.main_color,
                                                                          borderRadius: pxToDp(10),
                                                                          padding: pxToDp(15),
                                                                          marginRight: pxToDp(15)
                                                                        }}

                                                                        titleStyle={{
                                                                          color: colors.main_color,
                                                                          fontSize: 12,
                                                                        }}
                      /> : null}
                      {info.btn_lists.add_tip === 1 ?
                        <JbbPrompt
                          title={'输入小费'}
                          onConfirm={(value) => this.onConfirmAddTip(info.ship_id, value)}
                          initValue={info.tip}
                        >
                          <Button title={'加小费'}
                                  buttonStyle={{
                                    backgroundColor: colors.main_color,
                                    width: pxToDp(150),
                                    borderRadius: pxToDp(10),
                                    padding: pxToDp(15),
                                    marginRight: pxToDp(15)
                                  }}
                                  titleStyle={{
                                    color: colors.white,
                                    fontSize: 12,
                                  }}
                          />
                        </JbbPrompt>
                        : null}
                      {info.btn_lists.can_call === 1 ? <Button title={'呼叫骑手'}
                                                               onPress={() => {
                                                                 native.dialNumber(info.driver_phone)
                                                               }}
                                                               buttonStyle={{
                                                                 backgroundColor: colors.main_color,
                                                                 borderWidth: pxToDp(1),
                                                                 width: pxToDp(150),
                                                                 borderColor: colors.fontColor,
                                                                 borderRadius: pxToDp(10),
                                                                 padding: pxToDp(15),
                                                                 marginRight: pxToDp(15)
                                                               }}
                                                               titleStyle={{
                                                                 color: colors.white,
                                                                 fontSize: 12,
                                                               }}
                      /> : null}

                    </View>
                  </View>
                </For>
              </View>
            </ScrollView>
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
    const noOrder = (!order || !order.id || order.id !== orderId);
    return noOrder ?
      <ScrollView
        contentContainerStyle={{alignItems: 'center', justifyContent: 'space-around', flex: 1, backgroundColor: '#fff'}}
        refreshControl={refreshControl}>
        <View>
          <Text style={{textAlign: 'center'}}>{this.state.isFetching ? '正在加载' : '下拉刷新'}</Text>
        </View>
      </ScrollView>
      : (
        <View style={[{flex: 1, backgroundColor: colors.back_color}]}>

          <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
          <ScrollView
            refreshControl={refreshControl}
            style={{
              padding: pxToDp(20),
            }}>
            {this.renderPrinter()}
            {this.renderHeader()}
            <If condition={this.state.deliverie_status || this.state.order.pickType === '1'}>
              {this.renderDelivery()}
            </If>
            {this.renderGoods()}
            {this.renderClient()}
            {this.renderChangeLog()}
            {this.renderDeliveryModal()}
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


class ItemRow extends PureComponent {
  static propTypes = {
    item: PropTypes.object.isRequired,
    orderStoreId: PropTypes.string.isRequired,
    idx: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    isEditing: PropTypes.bool,
    isAdd: PropTypes.bool,
    edits: PropTypes.object,
    onInputNumberChange: PropTypes.func,
    nav: PropTypes.object,
    fnShowWmPrice: PropTypes.bool
  }

  constructor(props) {
    super(props);
  }

  render() {
    const {
      idx, item, isAdd, edited, orderStoreId, onInputNumberChange = () => {
      }, isEditing = false, nav, fnShowWmPrice, fnPriceControlled, isServiceMgr = false
    } = this.props;

    if (item.crm_order_detail_hide) {
      return null
    }

    const editNum = _editNum(edited, item);

    const showEditAdded = isEditing && !isAdd && edited && editNum !== 0;
    const isPromotion = Math.abs(item.price * 100 - item.normal_price) >= 1;

    return <View key={idx} style={[{
      marginTop: pxToDp(12),
      flexDirection: 'row',
      alignContent: 'center',
    }, {
      marginTop: 0,
      paddingTop: pxToDp(14),
      paddingBottom: pxToDp(14),
      borderBottomColor: colors.color999,
      borderBottomWidth: screen.onePixel,
    }]}>
      <View style={{flex: 3, flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => {
            let {product_id} = item
            nav.navigate(Config.ROUTE_GOOD_STORE_DETAIL, {pid: product_id, storeId: orderStoreId, item: item})
          }}
        >
          <Image
            style={styles.product_img}
            source={!!item.product_img ? {uri: item.product_img} : require('../../img/Order/zanwutupian_.png')}
          />
        </TouchableOpacity>
        <View>
          <Text style={{
            fontSize: pxToEm(26),
            color: colors.color333,
            marginBottom: pxToDp(14),
          }}>
            <If condition={item.shelf_no}>{item.shelf_no} </If>{item.name}
            <Text style={{fontSize: pxToEm(22), color: colors.fontGray}}>(#{item.product_id}<If
              condition={item.tag_code}>[{item.tag_code}]</If>)</Text>
          </Text>

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/*管理员看到的*/}
            <If condition={isServiceMgr || fnShowWmPrice}>
              <Text style={styles.priceMode}>保</Text>
              <Text style={{color: '#f44140'}}>{numeral(item.supply_price / 100).format('0.00')}</Text>
              <View style={{marginLeft: 30}}/>
              <Text style={styles.priceMode}>外</Text>
              <Text style={{color: '#f44140'}}>{numeral(item.price).format('0.00')}</Text>
            </If>
            {/*商户看到的*/}
            <If condition={!isServiceMgr && !fnShowWmPrice}>
              {/*保底模式*/}
              <If condition={fnPriceControlled}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[styles.priceMode]}>保</Text>
                  <Text style={{color: '#f44140'}}>{numeral(item.supply_price / 100).format('0.00')}</Text>
                </View>
                <Text style={{color: '#f9b5b2', flex: 1}}>
                  总价 {numeral(item.supply_price / 100 * item.num).format('0.00')}
                </Text>
              </If>
              {/*联营模式*/}
              <If condition={!fnPriceControlled}>
                <Text style={styles.priceMode}>外</Text>
                <Text style={{color: '#f44140'}}>{numeral(item.price).format('0.00')}</Text>
                <If condition={!isAdd}>
                  <Text style={{color: '#f9b5b2', marginLeft: 30}}>
                    总价 {numeral(item.price * item.num).format('0.00')}
                  </Text>
                </If>
              </If>
            </If>
          </View>
        </View>
      </View>
      {isEditing && !isAdd && edited && edited.num < item.num ? (<View style={{alignItems: 'flex-end', flex: 1}}>
        <Text
          style={[styles.editStatus, {backgroundColor: colors.editStatusDeduct, opacity: 0.7,}]}>已减{-editNum}件</Text>
        <Text
          style={[styles.editStatus, {
            backgroundColor: colors.editStatusDeduct,
            opacity: 0.7,
          }]}>退{numeral(-editNum * item.price).format('0.00')}</Text>
      </View>) : (showEditAdded && <View style={{alignItems: 'flex-end', flex: 1}}>
        <Text style={[styles.editStatus, {backgroundColor: colors.editStatusAdd, opacity: 0.7,}]}>已加{editNum}件</Text>
        <Text
          style={[styles.editStatus, {
            backgroundColor: colors.editStatusAdd,
            opacity: 0.7,
          }]}>收{numeral(editNum * item.normal_price / 100).format('0.00')}</Text>
      </View>)}

      {isEditing && isAdd && <View style={{alignItems: 'flex-end', flex: 1}}>
        <Text style={[styles.editStatus, {backgroundColor: colors.editStatusAdd, opacity: 0.7,}]}>加货{item.num}</Text>
        <Text
          style={[styles.editStatus, {
            backgroundColor: colors.editStatusAdd,
            opacity: 0.7,
          }]}>收{numeral(item.num * item.price).format('0.00')}</Text>
      </View>}

      {isPromotion &&
      <Text style={[styles.editStatus, {alignSelf: 'flex-end', flex: 1, color: colors.color999}]}>促销</Text>
      }
      {(!isEditing || isPromotion) &&
      <Text style={[item.num > 1 ? {alignSelf: 'flex-end', fontSize: pxToEm(26), color: '#f44140'} : {
        alignSelf: 'flex-end',
        fontSize: pxToEm(26),
        color: colors.color666
      }, {flex: 1, textAlign: 'right'}]}>X{item.num}</Text>}

      {isEditing && !isPromotion &&
      <View style={[{flex: 1}]}>
        <InputNumber
          styles={inputNumberStyles}
          min={0}
          value={(edited || item).num}
          style={{
            backgroundColor: 'white',
            width: Platform.OS === 'ios' ? 70 : 80,
          }}
          onChange={(v) => {
            onInputNumberChange(item, v)
          }}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        />
      </View>}
    </View>
  }
}


class OrderReminds extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {

    const {reminds, task_types, remindNicks, processRemind} = this.props;

    return <View>{(reminds || []).map((remind, idx) => {
      const type = parseInt(remind.type);
      const taskType = task_types['' + type];
      const status = parseInt(remind.status);
      const quick = parseInt(remind.quick);

      return <View key={remind.id} style={{
        borderBottomWidth: screen.onePixel,
        borderBottomColor: colors.color999,
        marginBottom: pxToDp(20),
        borderRadius: pxToDp(15),
        backgroundColor: quick !== Cts.TASK_QUICK_NO ? '#edd9d9' : '#f0f9ef',
        paddingLeft: pxToDp(30),
        paddingRight: pxToDp(30)
      }}>
        <View style={{
          flexDirection: 'row',
          height: pxToDp(70), alignItems: 'center'
        }}>
          <Text>{taskType ? taskType.name : '待办'}</Text>
          <Text style={{marginLeft: pxToDp(20),}}>{tool.shortTimeDesc(remind.created)}</Text>

          <View style={{flex: 1}}/>
          {status === Cts.TASK_STATUS_WAITING && remind.exp_finish_time && remind.exp_finish_time > 0 &&
          <Text>{tool.shortTimestampDesc(remind.exp_finish_time * 1000)}</Text>}
          {status === Cts.TASK_STATUS_WAITING &&
          <TouchableOpacity
            style={{
              backgroundColor: '#ea7575',
              height: pxToDp(50),
              paddingLeft: 5,
              paddingRight: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              marginLeft: pxToDp(40)
            }}
            onPress={() => {
              processRemind(remind)
            }}
          >
            <Text style={{color: colors.white,}}>{type === Cts.TASK_TYPE_ORDER_CHANGE ? '标记为已处理' : '处理'}</Text>
          </TouchableOpacity>
          }
          {status === Cts.TASK_STATUS_DONE && <View style={{flexDirection: 'row'}}>
            <Text>{tool.shortTimeDesc(remind.resolved_at)}</Text>
            {remind.resolved_by &&
            <Text style={[S.mr5, S.ml5]}>{remindNicks['' + remind.resolved_by]}</Text>}
            <Icon name='success_no_circle' size={16}/>
          </View>}
        </View>
        {type === Cts.TASK_TYPE_ORDER_CHANGE &&
        <View style={{borderTopWidth: screen.onePixel, borderTopColor: '#ccc', paddingTop: 10, paddingBottom: 10}}>
          <Text style={{fontSize: pxToEm(12), color: '#808080'}}>{remind.taskDesc}</Text>
        </View>}
      </View>;
    })}</View>
  }
}
