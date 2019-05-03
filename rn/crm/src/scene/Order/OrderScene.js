import React, {Component, PureComponent} from 'react'
import {
  Alert,
  Image,
  InteractionManager,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import InputNumber from 'rc-input-number';
import {NavigationItem, Separator} from '../../widget'
import {native, screen, tool} from '../../common'
import {bindActionCreators} from "redux";
import Icons from 'react-native-vector-icons/FontAwesome';
import Config from '../../config'
import PropTypes from 'prop-types';
import OrderStatusCell from './OrderStatusCell'
import CallBtn from './CallBtn'
import OrderBottom from './OrderBottom'
import CommonStyle from '../../common/CommonStyles'
import {Button1} from '../component/All'
import {
  addTipMoney,
  clearLocalOrder,
  getOrder,
  getRemindForOrderPage,
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
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {ActionSheet, Cell, CellBody, CellFooter, Cells, Dialog, Icon, Input, Toast,} from "../../weui/index";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import Cts from '../../Cts'
import inputNumberStyles from './inputNumberStyles';
import S from '../../stylekit';
import Entypo from "react-native-vector-icons/Entypo";
import DateTimePicker from 'react-native-modal-datetime-picker';
import ModalSelector from "../../widget/ModalSelector/index";
import {Array} from 'core-js/library/web/timers';
import styles from './OrderStyles'
import {getWithTpl} from "../../util/common";
import {Colors, Metrics, Styles} from "../../themes";
import Refund from "./_OrderScene/Refund";
import Delivery from "./_OrderScene/Delivery";
import ReceiveMoney from "./_OrderScene/ReceiveMoney";
import HttpUtils from "../../util/http";

const numeral = require('numeral');

function mapStateToProps (state) {
  return {
    order: state.order,
    global: state.global,
    store: state.store,
  }
}

function mapDispatchToProps (dispatch) {
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

const _editNum = function (edited, item) {
  return edited ? edited.num - (item.origin_num === null ? item.num : item.origin_num) : 0;
};

const hasRemarkOrTax = (order) => (!!order.user_remark) || (!!order.store_remark) || (!!order.taxer_id) || (!!order.invoice)

const shouldShowItems = (orderStatus) => {
  orderStatus = parseInt(orderStatus);
  return orderStatus === Cts.ORDER_STATUS_TO_SHIP ||
    orderStatus === Cts.ORDER_STATUS_TO_READY
};

const MENU_EDIT_BASIC = 1;
const MENU_EDIT_EXPECT_TIME = 2;
const MENU_EDIT_STORE = 3;
const MENU_FEEDBACK = 4;
const MENU_SET_INVALID = 5;
const MENU_ADD_TODO = 6;
const MENU_OLD_VERSION = 7;
const MENU_PROVIDING = 8;
const MENU_SEND_MONEY = 9;
const MENU_RECEIVE_QR = 10;
const MENU_ORDER_SCAN = 11;

const ZS_LABEL_SEND = 'send_ship';
const ZS_LABEL_CANCEL = 'cancel';

class OrderScene extends Component {
  
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {backPage} = params;
    return {
      headerLeft: (<NavigationItem
        icon={require('../../img/Register/back_.png')}
        iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
        onPress={() => {
          if (!!backPage) {
            console.log('backPage -> ', backPage);
            native.gotoPage(backPage);
          } else {
            navigation.goBack();
          }
        }}
      />),
      headerTitle: '订单详情',
      headerRight: (<View style={{flexDirection: 'row', alignItems: 'center'}}>
        <NavigationItem
          iconStyle={{width: pxToDp(66), height: pxToDp(54)}}
          icon={require('../../img/Order/print_.png')}
          onPress={() => {
            params.onPrint()
          }}
        />
        <ModalSelector
          onChange={(option) => {
            params.onMenuOptionSelected(option)
          }}
          skin='customer'
          data={params.ActionSheet}>
          <Entypo name='dots-three-horizontal' style={styles.btn_select}/>
        </ModalSelector>
      </View>),
    }
  };
  
  constructor (props) {
    super(props);
    let {currVendorId} = tool.vendor(this.props.global);
    this.state = {
      isJbbVendor: tool.isJbbVendor(currVendorId),
      isFetching: false,
      orderReloading: false,
      
      errorHints: '',
      select_zs_label: '',
      cancel_zs_hint: false,
      
      doingUpdate: false,
      shipCallHided: true,
      
      //good items editing/display
      isEditing: false,
      isEndVisible: false,
      itemsHided: false,
      itemsAdded: {},
      itemsEdited: {},
      itemsSaving: false,
      
      shipHided: true,
      changeHide: true,
      gotoEditPoi: false,
      showOptionMenu: false,
      showCallStore: false,
      orderQuery: false,
      orderChangeLogs: [],
      orderWayLogs: {},
      wayLoadingShow: false,
      changeLoadingShow: false,
      //remind
      onProcessed: false,
      reminds: {},
      remindFetching: false,
      store_contacts: [],
      addTipDialog: false,
      addTipMoney: false,
      addMoneyNum: '',
      visible: false,
      reason: '饿了呢暂不支持商家退款，请联系用户在客户端发起申请，收到申请后同意退款。',
      phone: undefined,
      person: '联系客户',
      isServiceMgr: false,
      visibleReceiveQr: false,
      logistics: []
    };
    
    this._onLogin = this._onLogin.bind(this);
    this.toMap = this.toMap.bind(this);
    this.goToSetMap = this.goToSetMap.bind(this);
    this._dispatchToInvalidate = this._dispatchToInvalidate.bind(this);
    this.onToggleMenuOption = this.onToggleMenuOption.bind(this);
    this.onPrint = this.onPrint.bind(this);
    this._onShowStoreCall = this._onShowStoreCall.bind(this);
    this._doSaveItemsCancel = this._doSaveItemsCancel.bind(this);
    this._doSaveItemsEdit = this._doSaveItemsEdit.bind(this);
    this._onItemRowNumberChanged = this._onItemRowNumberChanged.bind(this);
    this._doProcessRemind = this._doProcessRemind.bind(this);
    this.onMenuOptionSelected = this.onMenuOptionSelected.bind(this);
    this.onSaveDelayShip = this.onSaveDelayShip.bind(this);
    this._openAddGood = this._openAddGood.bind(this);
    this._totalEditingCents = this._totalEditingCents.bind(this);
    this._getWayRecord = this._getWayRecord.bind(this);
    this._orderChangeLog = this._orderChangeLog.bind(this);
    
    this._toEditBasic = this._toEditBasic.bind(this);
    this._fnProvidingOnway = this._fnProvidingOnway.bind(this);
    this._onToProvide = this._onToProvide.bind(this);
    this._callShip = this._callShip.bind(this);
    this.cancelZsDelivery = this.cancelZsDelivery.bind(this);
    this._doRefund = this._doRefund.bind(this);
    this.logOrderViewed = this.logOrderViewed.bind(this);
  }
  
  componentDidMount () {
    this._navSetParams();
  }
  
  componentWillMount () {
    const orderId = (this.props.navigation.state.params || {}).orderId;
    const {dispatch, global} = this.props;
    this.__getDataIfRequired(dispatch, global, null, orderId);
    this._orderChangeLogQuery();
    this.wayRecordQuery();
    
  }
  
  componentWillReceiveProps (nextProps) {
    const orderId = (this.props.navigation.state.params || {}).orderId;
    const {dispatch, global} = this.props;
    this.__getDataIfRequired(dispatch, global, nextProps.order, orderId)
    
  }
  
  __getDataIfRequired = (dispatch, global, orderStateToCmp, orderId) => {
    if (!orderId) {
      return;
    }
    
    const sessionToken = global.accessToken;
    const o = orderStateToCmp ? orderStateToCmp.order : false;
    
    if (!o || !o.id || o.id !== orderId) {
      if (!this.state.isFetching) {
        this.setState({isFetching: true});
        dispatch(getOrder(sessionToken, orderId, (ok, data) => {
          
          let state = {
            isFetching: false,
          };
          
          if (!ok) {
            state.errorHints = data;
            this.setState(state)
          } else {
            this._setAfterOrderGot(data, state);
            if (!this.state.remindFetching) {
              this.setState({remindFetching: true});
              dispatch(getRemindForOrderPage(sessionToken, orderId, (ok, desc, data) => {
                if (ok) {
                  this.setState({reminds: data, remindFetching: false})
                  this._orderChangeLogQuery();
                  this.wayRecordQuery();
                  this.logOrderViewed();
                  this.fetchShipData()
                } else {
                  this.setState({errorHints: desc, remindFetching: false})
                }
              }));
            }
          }
        }))
      }
    }
  };
  
  fetchShipData () {
    const self = this
    const navigation = self.props.navigation
    const orderId = (this.props.navigation.state.params || {}).orderId;
    const api = `/api/order_deliveries/${orderId}?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      this.setState({logistics: res})
    })
  }
  
  static _extract_edited_items (items) {
    const edits = {};
    (items || []).filter((item => item.origin_num !== null && item.num > item.origin_num)).forEach((item) => {
      edits[item.id] = item;
    });
    return edits;
  }
  
  _navSetParams = () => {
    let {backPage} = (this.props.navigation.state.params || {});
    const {enabled_special_menu = false} = this.props.global.config;
    const {is_service_mgr = false} = tool.vendor(this.props.global);
    const as = [
      {key: MENU_EDIT_BASIC, label: '修改地址电话发票备注'},
      {key: MENU_EDIT_EXPECT_TIME, label: '修改配送时间'},
      {key: MENU_EDIT_STORE, label: '修改门店'},
      {key: MENU_FEEDBACK, label: '客户反馈'},
      {key: MENU_SET_INVALID, label: '置为无效'},
    ];
    
    if (is_service_mgr || this._fnViewFullFin()) {
      as.push({key: MENU_OLD_VERSION, label: '老版订单页'});
    }
    
    if (this._fnProvidingOnway()) {
      as.push({key: MENU_ADD_TODO, label: '稍后处理'});
      as.push({key: MENU_PROVIDING, label: '门店备货'});
    }
    as.push({key: MENU_RECEIVE_QR, label: '收款码'});
    if (is_service_mgr) {
      as.push({key: MENU_SEND_MONEY, label: '发红包'})
    }
    as.push({key: MENU_ORDER_SCAN, label: '订单过机'});
    
    let params = {
      onMenuOptionSelected: this.onMenuOptionSelected,
      onPrint: this.onPrint,
      backPage: backPage,
      ActionSheet: as
    };
    this.props.navigation.setParams(params);
    this.setState({isServiceMgr: is_service_mgr})
  };
  
  _setAfterOrderGot = (order, initialState) => {
    this.setState({
      itemsEdited: OrderScene._extract_edited_items(order.items),
      //itemsHided: !shouldShowItems(order.orderStatus),
      ...initialState,
    });
    
    this._navSetParams();
  };
  
  onPrint () {
    const order = this.props.order.order
    if (order) {
      const store = tool.store(this.props.global, order.store_id)
      if (store && store.cloudPrinter) {
        this.setState({showPrinterChooser: true})
      } else {
        this._doBluetoothPrint()
      }
    }
  }
  
  onToggleMenuOption () {
    this.setState((prevState) => {
      return {showOptionMenu: !prevState.showOptionMenu}
    })
  }
  
  onMenuOptionSelected (option) {
    
    const {accessToken} = this.props.global;
    const {navigation, order, global, dispatch} = this.props;
    
    if (option.key === MENU_EDIT_BASIC) {
      
      this._toEditBasic();
    } else if (option.key === MENU_EDIT_EXPECT_TIME) {//修改配送时间
      if (this.state.doingUpdate) {
        return;
      }
      this.setState({
        doingUpdate: true,
        isEndVisible: true,
      });
    } else if (option.key === MENU_EDIT_STORE) {
      
      navigation.navigate(Config.ROUTE_ORDER_STORE, {order: order.order});
    } else if (option.key === MENU_FEEDBACK) {
      
      const _o = order.order;
      const vm_path = _o.feedback && _o.feedback.id ? "#!/feedback/view/" + _o.feedback.id
        : "#!/feedback/order/" + _o.id;
      const path = `vm?access_token=${accessToken}${vm_path}`;
      const url = Config.serverUrl(path, Config.https);
      navigation.navigate(Config.ROUTE_WEB, {url});
    } else if (option.key === MENU_SET_INVALID) {
      navigation.navigate(Config.ROUTE_ORDER_TO_INVALID, {order: order.order});
    } else if (option.key === MENU_ADD_TODO) {
      navigation.navigate(Config.ROUTE_ORDER_TODO, {order: order.order});
    } else if (option.key === MENU_OLD_VERSION) {
      native.toNativeOrder(order.order.id);
    } else if (option.key === MENU_PROVIDING) {
      this._onToProvide();
    } else if (option.key === MENU_RECEIVE_QR) {
      this.setState({visibleReceiveQr: true})
    } else if (option.key === MENU_SEND_MONEY) {
      navigation.navigate(Config.ROUTE_ORDER_SEND_MONEY, {orderId: order.order.id, storeId: order.order.store_id})
    } else if (option.key === MENU_ORDER_SCAN) {
      navigation.navigate(Config.ROUTE_ORDER_SCAN)
    } else {
      ToastShort('未知的操作');
    }
  }
  
  onSaveDelayShip (date) {
    // let Hours = date.getHours();
    // let Minutes = date.getMinutes();
    let expect_time = tool.fullDate(date);
    const {order} = this.props.order;
    
    let wm_id = order.id;
    let send_data = {
      wm_id: wm_id,
      expect_time: expect_time,
    };
    console.log('send_data => ', send_data);
    const {accessToken} = this.props.global;
    let _this = this;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(saveOrderDelayShip(send_data, accessToken, (resp) => {
        console.log('delay_ship resp -> ', resp);
        _this.setState({
          isEndVisible: false,
          doingUpdate: false,
        });
        if (resp.ok) {
          ToastShort('操作成功');
          this._dispatchToInvalidate();
        }
      }));
    });
  }
  
  _onShowStoreCall () {
    
    const {store, dispatch, global} = this.props;
    
    const store_id = this.props.order.order.store_id;
    const contacts = (store.store_contacts || {}).store_id;
    
    if (!contacts || contacts.length === 0) {
      this.setState({showContactsLoading: true});
      
      dispatch(getContacts(global.accessToken, store_id, (ok, msg, contacts) => {
        console.log("getContacts: ok=", ok, "msg", msg);
        this.setState({store_contacts: contacts, showContactsLoading: false, showCallStore: true})
      }));
    } else {
      this.setState({showCallStore: true})
    }
  }
  
  _contacts2menus () {
    // ['desc' => $desc, 'mobile' => $mobile, 'sign' => $on_working, 'id' => $uid]
    return (this.state.store_contacts || []).map((contact, idx) => {
      console.log(contact, idx);
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
  
  _toEditBasic () {
    const {navigation, order} = this.props;
    navigation.navigate(Config.ROUTE_ORDER_EDIT, {order: order.order});
  }
  
  _hideCallStore () {
    this.setState({showCallStore: false});
  }
  
  _dispatchToInvalidate () {
    const {dispatch, order} = this.props;
    dispatch(clearLocalOrder(order.order.id));
    this.wayRecordQuery();
    this._orderChangeLogQuery();
    this.fetchShipData()
  }
  
  _hidePrinterChooser () {
    this.setState({showPrinterChooser: false})
  }
  
  _cloudPrinterSN () {
    const stores = this.props.global.canReadStores;
    const order = this.props.order.order;
    const store = stores[order.id];
    const printerName = (store && store.cloudPrinter) ? store.cloudPrinter : '未知';
    return `云打印(${printerName})`;
  }
  
  _doCloudPrint () {
    const {dispatch, order} = this.props;
    const {accessToken} = this.props.global;
    dispatch(printInCloud(accessToken, order.order.id, (ok, msg, data) => {
      console.log('print done:', ok, msg, data);
      if (ok) {
        ToastShort("已发送到打印机");
      } else {
        this.setState({errorHints: '打印失败：' + msg})
      }
      this._hidePrinterChooser();
    }))
  }
  
  _doBluetoothPrint () {
    const order = this.props.order.order;
    native.printBtPrinter(order, (ok, msg) => {
      console.log("printer result:", ok, msg)
    });
    this._hidePrinterChooser();
  }
  
  _doSunMiPint () {
    const order = this.props.order.order;
    native.printSmPrinter(order, (ok, msg) => {
      console.log("printer result:", ok, msg)
    });
    this._hidePrinterChooser();
  }
  
  _onLogin () {
    const orderId = this.props.order.order.id;
    this.props.navigation.navigate(Config.ROUTE_LOGIN, {next: Config.ROUTE_ORDER, nextParams: {orderId}})
  }
  
  _doSaveItemsEdit () {
    
    const {dispatch, order, global} = this.props;
    const items = {
      ...this.state.itemsAdded,
      ...this.state.itemsEdited,
    };
    
    this.setState({onSubmitting: true});
    const token = global.accessToken;
    const wmId = order.order.id;
    dispatch(saveOrderItems(token, wmId, items, (ok, msg, resp) => {
      console.log('resp', resp);
      if (ok) {
        this.setState({
          itemsAdded: {},
          itemsEdited: {},
          isEditing: false,
          onSubmitting: true,
        });
        
        dispatch(getOrder(token, wmId, (ok, data) => {
          const ps = {
            onSubmitting: false,
          };
          if (!ok) {
            ps.errorHints = "刷新订单信息失败：" + data;
          }
          this.setState(ps);
        }));
      } else {
        this.setState({
          onSubmitting: false,
          errorHints: msg
        });
      }
    }));
  }
  
  _doSaveItemsCancel () {
    this.setState({isEditing: false})
  }
  
  _openAddGood () {
    const {navigation} = this.props;
    const order = this.props.order.order;
    const params = {
      esId: order.ext_store_id, platform: order.platform, storeId: order.store_id,
      actionBeforeBack: (prod, num) => {
        console.log(prod, num);
        this._doAddItem({
          product_id: prod.pid,
          num,
          name: prod.name,
          price: prod.price,
          normal_price: prod.price * 100
        });
      },
    };
    navigation.navigate('ProductAutocomplete', params);
  }
  
  _doAddItem (item) {
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
  
  _onItemRowNumberChanged (item, newNum) {
    
    console.log('accept a item:', item, 'to new', newNum);
    this._recordEdition({...item, num: newNum});
  }
  
  _doRefund () {
    const {order} = this.props.order;
    let url = `api/support_manual_refund/${order.platform}/${order.id}?access_token=${
      this.props.global.accessToken
      }`
    http: getWithTpl(
      url,
      json => {
        if (json.ok) {
          this.props.navigation.navigate(Config.ROUTE_REFUND_DETAIL, {orderDetail: order})
        } else {
          this.setState({
            visible: true,
            phone: json.obj && json.obj.phone ? json.obj.phone : this.props.order.order.mobile,
            person: json.obj && json.obj.phone ? '联系服务经理' : '联系客户',
            reason: json.reason
          })
        }
      },
      error => {
        ToastLong('获取数据失败')
      }
    );
  }
  
  _recordEdition (item) {
    if (item.id) {
      this.setState({itemsEdited: {...this.state.itemsEdited, [item.id]: item}});
    } else {
      this.setState({itemsAdded: {...this.state.itemsAdded, [item.product_id]: item}});
    }
  }
  
  _totalEditingCents () {
    const {order} = this.props.order;
    const totalAdd = this.state.itemsAdded && Object.keys(this.state.itemsAdded).length > 0 ?
      tool.objectSum(this.state.itemsAdded, (item) => item.num * item.normal_price)
      : 0;
    
    let totalEdit = 0;
    if (this.state.itemsEdited) {
      (order.items || []).map((item) => {
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
  
  goToSetMap () {
    this.setState({gotoEditPoi: false});
    
    const {order} = this.props.order;
    this.props.navigation.navigate(Config.ROUTE_ORDER_EDIT, {order: order})
  }
  
  toMap () {
    const {order} = this.props.order;
    if (order) {
      const validPoi = order.gd_lng && order.gd_lat;
      if (validPoi) {
        const store = this.props.global.canReadStores[order.store_id] || {};
        const path = `${Config.MAP_WAY_URL}?start=${store.loc_lng},${store.loc_lat}&dest=${order.gd_lng},${order.gd_lat}`;
        const uri = Config.serverUrl(path);
        this.props.navigation.navigate(Config.ROUTE_WEB, {url: uri});
        console.log(uri)
        return;
      }
    }
    //a page to set the location for this url!!
    this.setState({
      gotoEditPoi: true
    });
    this.goToSetMap();
  }
  
  _doProcessRemind (remind) {
    const {order} = this.props.order;
    const {dispatch, navigation, global} = this.props;
    const remindType = parseInt(remind.type);
    if (remindType === Cts.TASK_TYPE_REFUND_BY_USER) {
      navigation.navigate(Config.ROUTE_REFUND_AUDIT, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_REMIND) {
      navigation.navigate(Config.ROUTE_ORDER_URGE, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_DELIVERY_FAILED) {
      navigation.navigate(Config.ROUTE_JD_AUDIT_DELIVERY, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_ORDER_CHANGE) {
      this.setState({onSubmitting: true});
      const token = global.accessToken;
      dispatch(markTaskDone(token, remind.id, Cts.TASK_STATUS_DONE, (ok, msg, data) => {
        const state = {onSubmitting: false};
        if (ok) {
          state.onProcessed = true;
          setTimeout(() => {
            remind.status = Cts.TASK_STATUS_DONE;
            this.setState({onProcessed: false});
          }, 2000);
        } else {
          state.errorHints = msg;
        }
        this.setState(state);
      }));
    } else {
      this.setState({errorHints: '暂不支持该处理类型'})
    }
  }
  
  _fnProvidingOnway () {
    const {order, global} = this.props;
    const storeId = (order.order || {}).store_id;
    return storeId && storeId > 0 && (tool.vendorOfStoreId(storeId, global) || {}).fnProvidingOnway;
  }

  _fnViewFullFin () {
    const {order, global} = this.props;
    return (order.order || {}).fn_full_fin;
  }
  
  _callShip () {
    const {navigation, order} = this.props;
    navigation.navigate(Config.ROUTE_ORDER_CALL_SHIP, {order: order.order});
  }
  
  _onToProvide () {
    const {order, global, dispatch, navigation} = this.props;
    if (order.order.store_id <= 0) {
      ToastLong("所属门店未知，请先设置好订单所属门店！");
      return false;
    }
    
    const path = `stores/orders_go_to_buy/${order.order.id}.html?access_token=${global.accessToken}`;
    navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl(path, Config.https)});
  }
  
  _getWayRecord () {
    this.setState({shipHided: !this.state.shipHided})
    
  }
  
  wayRecordQuery () {
    const {dispatch, global, navigation} = this.props;
    let {orderId} = navigation.state.params;
    dispatch(orderWayRecord(orderId, global.accessToken, (ok, msg, contacts) => {
      let mg = 0;
      if (ok) {
        mg = contacts
      } else {
        Alert.alert(msg)
      }
      this.setState({orderWayLogs: mg, wayLoadingShow: false})
    }));
  }
  
  renderAddTip () {
    let {order} = this.props.order;
    let dada = this.state.orderWayLogs.hasOwnProperty(Cts.SHIP_AUTO_NEW_DADA)
    let {orderStatus, auto_ship_type} = order;
    if ((orderStatus == Cts.ORDER_STATUS_TO_READY || orderStatus == Cts.ORDER_STATUS_TO_SHIP) && dada && auto_ship_type == Cts.SHIP_AUTO_NEW_DADA && (!this.state.shipHided)) {
      
      return (
        <TouchableOpacity
          onPress={() => {
            this.setState({addTipDialog: true})
          }}
        >
          <View style={{
            height: pxToDp(40),
            backgroundColor: '#59b26a',
            borderRadius: pxToDp(20),
            paddingHorizontal: pxToDp(10),
            paddingVertical: pxToDp(4),
            marginTop: pxToDp(20),
            marginRight: pxToDp(30)
          }}>
            <Text style={{
              height: pxToDp(24),
              fontSize: pxToDp(24),
              textAlign: 'center',
              color: '#EEEEEE',
              lineHeight: pxToDp(24)
            }}>加小费</Text>
          </View>
        </TouchableOpacity>
      );
    }
  }
  
  renderWayRecord () {
    let order = this.props.order.order
    let orderWayLogs = this.state.orderWayLogs
    if (!this.state.shipHided) {
      if (typeof orderWayLogs == 'object' && (tool.length(orderWayLogs) > 0)) {
        return tool.objectMap(this.state.orderWayLogs, (item, index) => {
          return (
            <View key={index} style={{
              flex: 1,
              flexDirection: "row",
              backgroundColor: '#fff',
              paddingLeft: pxToDp(30),
              paddingRight: pxToDp(30),
              paddingTop: pxToDp(20),
              width: '100%'
            }}>
              <View style={{width: pxToDp(124)}}>
                <View style={wayRecord.expressName}>
                  <Text
                    style={{fontSize: pxToDp(24), textAlign: 'center', color: '#58B169'}}>{tool.disWay()[index]}</Text>
                </View>
              </View>
              <View style={{flex: 1}}>
                {
                  item.map((ite, key) => {
                    return (
                      <View key={key}>
                        <View style={{paddingBottom: pxToDp(20), flex: 1}}>
                          <View style={{flexDirection: 'row'}}>
                            <Text style={{width: pxToDp(140), fontSize: pxToDp(26), marginRight: pxToDp(20)}}>
                              {
                                tool.disWayStatic(index)[ite.order_status]
                              }
                            </Text>
                            <Text style={{fontSize: pxToDp(24)}}>{ite.created}</Text>
                          </View>
                        </View>
                      </View>
                    )
                  })
                }
              
              </View>
            </View>
          )
        })
      } else if (tool.length(orderWayLogs) == 0 && (typeof orderWayLogs == 'object')) {
        return <View style={{
          height: pxToDp(50),
          backgroundColor: "#fff",
          paddingLeft: pxToDp(30),
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Text style={{color: '#59B26A'}}>没有相应的记录</Text>
        </View>
      }
    }
  }
  
  _orderChangeLog () {
    this.setState({changeHide: !this.state.changeHide})
  }
  
  _orderChangeLogQuery () {
    const {dispatch, global, navigation} = this.props;
    let {orderId} = navigation.state.params;
    dispatch(orderChangeLog(orderId, global.accessToken, (ok, msg, contacts) => {
      if (ok) {
        this.setState({orderChangeLogs: contacts, changeLoadingShow: false});
      } else {
        Alert.alert(msg)
      }
    }));
  }
  
  renderChangeLogs () {
    if (!this.state.changeHide && this.state.orderChangeLogs.length > 0) {
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
                  fontSize: pxToDp(26),
                  overflow: 'hidden',
                  height: pxToDp(35)
                }}>{item.updated_name}</Text>
                <Text style={{
                  flex: 1,
                  color: '#59B26A',
                  fontSize: pxToDp(26),
                  overflow: 'hidden',
                  height: pxToDp(35),
                  marginLeft: pxToDp(24)
                }}>{item.modified}</Text>
              </View>
              <View style={{marginTop: pxToDp(20), width: '100%', height: 'auto', marginBottom: pxToDp(20)}}>
                <Text selectable={true}
                      style={{fontSize: pxToDp(24), height: 'auto', lineHeight: pxToDp(28)}}>{item.what}</Text>
              </View>
            </View>
          </View>
        )
      })
    } else if (this.state.orderChangeLogs.length == 0 && !this.state.changeHide) {
      return <View style={{
        height: pxToDp(50),
        backgroundColor: "#fff",
        paddingLeft: pxToDp(30),
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <Text style={{color: '#59B26A'}}>没有相应的记录</Text>
      </View>
    }
  }
  
  upAddTip () {
    let {orderId} = this.props.navigation.state.params;
    let {addMoneyNum} = this.state;
    let {accessToken} = this.props.global;
    const {dispatch} = this.props;
    if (addMoneyNum > 0) {
      this.setState({onSubmitting: true});
      dispatch(addTipMoney(orderId, addMoneyNum, accessToken, async (resp) => {
        if (resp.ok) {
          ToastLong('加小费成功')
        } else {
          ToastLong(resp.desc)
        }
        await this.setState({onSubmitting: false, addMoneyNum: ''});
        this._orderChangeLogQuery();
      }));
    } else {
      this.setState({addMoneyNum: ''});
      ToastLong('加小费的金额必须大于0')
    }
  }
  
  total_goods_num (items) {
    let num = 0
    items.forEach((item) => {
      num += parseInt(item.num);
    })
    return num
  }
  
  //modal弹出框
  modal = () => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.setState({visible: false});
        }}
      >
        <View
          style={[
            {
              position: "absolute",
              width: "100%",
              height: Metrics.CH - 60,
              backgroundColor: "rgba(0,0,0,0.1)",
              zIndex: 200
            },
            Styles.center
          ]}
        >
          <View style={{
            width: Metrics.CW * 0.85,
            paddingVertical: 36,
            paddingHorizontal: 18,
            backgroundColor: Colors.white,
            borderRadius: 8
          }}>
            <Text style={{
              fontSize: 14,
              color: '#333',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 20
            }}>{this.state.reason}</Text>
            <Button1 t={this.state.person} w="100%" r={5} mgt={10}
                     onPress={() => Linking.openURL(`tel:${this.state.phone}`)}/>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
  
  renderReceiveQr (order) {
    return (
      <ReceiveMoney
        formVisible={this.state.visibleReceiveQr}
        onCloseForm={() => this.setState({visibleReceiveQr: false})}
        order={order}
      />
    )
  }
  
  render () {
    const order = this.props.order.order;
    let refreshControl = <RefreshControl
      refreshing={this.state.isFetching}
      onRefresh={this._dispatchToInvalidate}
      tintColor='gray'
    />;
    const orderId = (this.props.navigation.state.params || {}).orderId;
    const noOrder = (!order || !order.id || order.id !== orderId);
    
    if (noOrder) {
      const {dispatch, global, store} = this.props;
    }
    
    return noOrder ?
      <ScrollView
        contentContainerStyle={{alignItems: 'center', justifyContent: 'space-around', flex: 1, backgroundColor: '#fff'}}
        refreshControl={refreshControl}>
        <View>
          {!!this.state.errorHints &&
          <Text style={{textAlign: 'center'}}>{this.state.errorHints}</Text>}
          <Text style={{textAlign: 'center'}}>{this.state.isFetching ? '正在加载' : '下拉刷新'}</Text>
        </View>
      </ScrollView>
      : (
        <View style={[styles.container, {flex: 1}]}>
          {
            this.state.visible ?
              this.modal() : null
          }
          {this.state.showOptionMenu &&
          <TouchableOpacity style={[top_styles.icon_dropDown]}>
          </TouchableOpacity>}
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
          
          <ActionSheet
            visible={this.state.showCallStore}
            onRequestClose={() => {
              console.log('call_store_contacts action_sheet closed!')
            }}
            menus={this._contacts2menus()}
            actions={[
              {
                type: 'default',
                label: '取消',
                onPress: this._hideCallStore.bind(this),
              }
            ]}
            style={{maxHeight: '50%'}}
          />
          
          
          <ScrollView
            refreshControl={refreshControl}>
            {this.renderHeader()}
          </ScrollView>
          <OrderBottom order={order} navigation={this.props.navigation} callShip={this._callShip}
                       fnProvidingOnway={this._fnProvidingOnway()} onToProvide={this._onToProvide}/>
          
          <Dialog
            onRequestClose={() => {
            }}
            visible={!!this.state.errorHints}
            buttons={[{
              type: 'default',
              label: '知道了',
              onPress: () => {
                this.setState({errorHints: ''})
              }
            }]}
          >
            <Text>{this.state.errorHints}</Text>
          </Dialog>
  
          <Dialog
            onRequestClose={() => {
            }}
            visible={this.state.addTipMoney}
            title={'加小费'}
            buttons={[{
              type: 'default',
              label: '取消',
              onPress: () => {
                this.setState({addTipMoney: false, addMoneyNum: ''})
              }
            },
              {
                type: 'default',
                label: '确定',
                onPress: async () => {
                  await this.setState({addTipMoney: false});
                  this.upAddTip()
                }
              }
            ]}
          >
            <Input
              placeholder={'请输入金额，金额只能大于0'}
              value={`${this.state.addMoneyNum}`}
              keyboardType='numeric'
              onChangeText={(text) => {
                this.setState({addMoneyNum: text})
              }}
            />
          </Dialog>
  
          <Dialog
            onRequestClose={() => {
            }}
            visible={this.state.addTipDialog}
            buttons={[{
              type: 'default',
              label: '知道了',
              onPress: () => {
                this.setState({addTipDialog: false, addTipMoney: true})
              }
            }]}
          >
            <View>
              <Text style={{color: '#000'}}>
                1.达达或美团快送加小费金额以
                <Text style={{color: "red"}}>最新一次为准</Text>
                ,新一次金额必须大于上次加小费的金额.
              </Text>
              <Text style={{color: '#000'}}>2. 如果加错小费, 或需减少小费, 请取消配送, 并重新发单, 小费将被清0, 可重新加小费.</Text>
            </View>
          </Dialog>
          
          <Toast
            icon="loading"
            show={this.state.onSubmitting}
            onRequestClose={() => {
            }}
          >处理中</Toast>
          
          <Toast
            icon="loading"
            show={this.state.orderQuery}
            onRequestClose={() => {
            }}
          >加载中</Toast>
          
          <Toast
            icon="success"
            show={this.state.onProcessed}
            onRequestClose={() => {
              this.setState({onProcessed: false})
            }}
          >已处理</Toast>
          
          <DateTimePicker
            date={new Date(order.expectTime)}
            mode='datetime'
            isVisible={this.state.isEndVisible}
            onConfirm={(date) => {
              this.onSaveDelayShip(date)
            }}
            onCancel={() => {
              this.setState({
                isEndVisible: false,
                doingUpdate: false,
              });
            }}
          />
          
          <Dialog
            onRequestClose={() => {
            }}
            style={{backgroundColor: '#fff'}}
            visible={this.state.cancel_zs_hint}
            title={'干预配送'}
            buttons={[{
              type: 'default',
              label: '关闭',
              onPress: () => {
                this.setState({cancel_zs_hint: false, select_zs_label: ''});
              }
            }, {
              type: 'primary',
              label: '确认',
              onPress: () => {
                if (this.state.select_zs_label === ZS_LABEL_CANCEL) {//取消
                  this.setState({cancel_zs_hint: false});
                  this.cancelZsDelivery();
                } else if (this.state.select_zs_label === ZS_LABEL_SEND) {//发配送
                  this.setState({cancel_zs_hint: false});
                  this._callShip();
                } else {
                  ToastLong('请选择干预方式');
                }
                this.setState({select_zs_label: ''});
              }
            }]}
          >
            <Cells style={ship_style.cell_box}>
              <Cell
                onPress={() => {
                  this.setState({select_zs_label: ZS_LABEL_SEND});
                }}
                customStyle={[ship_style.cell_row]}>
                <CellBody style={{flexDirection: 'column'}}>
                  <Text style={[ship_style.cell_body,
                    (this.state.select_zs_label === ZS_LABEL_SEND && {color: colors.main_color})
                  ]}>发自配送并保留专送</Text>
                  <Text style={ship_style.cell_tips}>一方先接单后,另一方会被取消</Text>
                </CellBody>
                {this.state.select_zs_label === ZS_LABEL_SEND && <CellFooter>
                  <Icon name="success_no_circle" style={ship_style.icon_size}/>
                </CellFooter>}
              </Cell>
              <Cell
                onPress={() => {
                  this.setState({select_zs_label: ZS_LABEL_CANCEL});
                }}
                customStyle={ship_style.cell_row}>
                <CellBody style={{flexDirection: 'column'}}>
                  <Text style={[ship_style.cell_body,
                    (this.state.select_zs_label === ZS_LABEL_CANCEL && {color: colors.main_color})
                  ]}>取消专送</Text>
                  <Text style={ship_style.cell_tips}>只取消专送配送,不做其他操作</Text>
                </CellBody>
                {this.state.select_zs_label === ZS_LABEL_CANCEL && <CellFooter>
                  <Icon name="success_no_circle" style={ship_style.icon_size}/>
                </CellFooter>}
              </Cell>
            </Cells>
          </Dialog>
  
          {this.renderReceiveQr(order)}
        </View>
      );
  }
  
  cancelZsDelivery () {
    const {dispatch, global, order} = this.props;
    let {zs_status, id} = order.order;
    zs_status = parseInt(zs_status);
    let wm_id = id;
    if (this.state.onSubmitting) {
      return false;
    }
    if (wm_id > 0) {
      if (zs_status === Cts.ZS_STATUS_CANCEL || zs_status === Cts.ZS_STATUS_ABNORMAL) {
        this.setState({errorHints: '专送已是取消状态'});
      } else {
        this.setState({onSubmitting: true});
        dispatch(orderCancelZsDelivery(global.accessToken, wm_id, (ok, msg) => {
          this.setState({onSubmitting: false});
          if (ok) {
            //this._callShip();
          } else {
            this.setState({errorHints: msg});
          }
        }));
      }
    } else {
      this.setState({errorHints: '错误的订单ID'});
    }
  }
  
  logOrderViewed () {
    const {order, global} = this.props;
    let {id, orderStatus} = order.order;
    if (orderStatus == Cts.ORDER_STATUS_TO_READY || orderStatus == Cts.ORDER_STATUS_TO_SHIP) {
      let {accessToken} = global;
      let url = `/api/log_view_order/${id}?access_token=${accessToken}`;
      getWithTpl(url, function (json) {
        if (json.ok) {
          ToastLong(json.desc);
        }
      }, function () {
        ToastLong("记录订单访问次数错误！");
      });
    }
  }
  
  renderShipStatus () {
    let {shipCallHided} = this.state;
    let {
      ext_store, orderStatus, zs_status, orderTime, jd_ship_worker_name, jd_ship_worker_mobile,
      auto_ship_type, dada_status, dada_distance, dada_fee, dada_tips, dada_mobile = '', dada_dm_name
    } = this.props.order.order;
    let {zs_way, ship_site_mobile = '', ship_site_tel = ''} = ext_store;
    auto_ship_type = parseInt(auto_ship_type);
    dada_status = parseInt(dada_status);
    zs_status = parseInt(zs_status);
    zs_way = parseInt(zs_way);
    orderStatus = parseInt(orderStatus);
    
    let auto_ship_view = null;
    if ((auto_ship_type === Cts.SHIP_AUTO_FN ||
      auto_ship_type === Cts.SHIP_AUTO_NEW_DADA ||
      auto_ship_type === Cts.SHIP_AUTO_BD ||
      auto_ship_type === Cts.SHIP_AUTO_SX ||
      auto_ship_type == Cts.SHIP_AUTO_MT ||
      auto_ship_type == Cts.SHIP_AUTO_MT_ZB) && (
      dada_status !== Cts.DADA_STATUS_CANCEL &&
      dada_status !== Cts.DADA_STATUS_TIMEOUT
    )) {
      let ship_name = tool.disWay()[auto_ship_type];
      let dada_ship_status = tool.disWayStatic(Cts.SHIP_AUTO_NEW_DADA)[dada_status];
      
      auto_ship_view = (
        <View>
          <View style={[ship_style.ship_box, {flexDirection: 'column'}]}>
            <View style={[ship_style.ship_box, {borderBottomWidth: 0}]}>
              <View style={ship_style.ship_info}>
                <Text style={ship_style.ship_info_text}>
                  {dada_status === Cts.DADA_STATUS_TO_ACCEPT ?
                    ship_name + ' - ' + dada_ship_status :
                    (dada_status === Cts.DADA_STATUS_TO_FETCH ||
                      dada_status === Cts.DADA_STATUS_SHIPPING ||
                      dada_status === Cts.DADA_STATUS_ARRIVED) &&
                    (tool.length(dada_mobile) > 0 ?
                        `骑手 ${dada_dm_name} ${dada_ship_status}` : ship_name + dada_ship_status
                    )}
                </Text>
                {tool.length(dada_mobile) > 0 &&
                <Text style={ship_style.ship_diff_time}>
                  {ship_name}({dada_mobile})
                </Text>}
              </View>
              {dada_status === Cts.DADA_STATUS_TO_ACCEPT && (
                <View style={ship_style.ship_btn_view}>
                  {auto_ship_type === Cts.SHIP_AUTO_NEW_DADA && <ClickBtn
                    btn_text={'加小费'}
                    onPress={() => {
                      this.setState({addTipDialog: true})
                    }}
                  />}
                </View>
              )}
              {(dada_status === Cts.DADA_STATUS_TO_FETCH ||
                dada_status === Cts.DADA_STATUS_SHIPPING ||
                dada_status === Cts.DADA_STATUS_ARRIVED) && tool.length(dada_mobile) > 0 &&
              (<View style={ship_style.ship_btn_view}>
                {!(zs_way > 0) && (ship_site_mobile !== '' || ship_site_tel !== '') && (
                  <ImageBtn
                    source={shipCallHided ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')}
                    onPress={() => {
                      this.setState({shipCallHided: !shipCallHided});
                    }}
                    imageStyle={styles.pullImg}
                  />
                )}
                <ClickBtn
                  type={'full'}
                  btn_text={'呼叫'}
                  onPress={() => {
                    native.dialNumber(dada_mobile)
                  }}
                />
              </View>)}
            </View>
            <View style={{
              marginHorizontal: pxToDp(30),
              flexDirection: "row",
              alignItems: 'center',
              height: pxToDp(80),
              borderTopWidth: pxToDp(1),
              borderColor: colors.back_color,
              borderStyle: 'dashed'
            }}>
              <Text style={[ship_style.ship_diff_time]}>
                距离:{dada_distance}米.配送费:{dada_fee}元.已加小费:{dada_tips}元
              </Text>
            </View>
          </View>
          
          {!shipCallHided && ship_site_mobile !== '' && (
            <View style={ship_style.ship_box}>
              <View style={ship_style.ship_info}>
                <Text style={ship_style.ship_info_text}>
                  站点/客服 <Text style={ship_style.ship_tel_text}>({ship_site_tel})</Text>
                </Text>
              </View>
              <View style={ship_style.ship_btn_view}>
                <ClickBtn
                  btn_text={'呼叫'}
                  onPress={() => {
                    native.dialNumber(ship_site_mobile)
                  }}
                />
              </View>
            </View>
          )}
          {!shipCallHided && ship_site_tel !== '' && (
            <View style={ship_style.ship_box}>
              <View style={ship_style.ship_info}>
                <Text style={ship_style.ship_info_text}>
                  站点备用电话 <Text style={ship_style.ship_tel_text}>({ship_site_tel})</Text>
                </Text>
              </View>
              <View style={ship_style.ship_btn_view}>
                <ClickBtn
                  btn_text={'呼叫'}
                  onPress={() => {
                    native.dialNumber(ship_site_tel)
                  }}
                />
              </View>
            </View>
          )}
        </View>
      );
    }
    let zs_ship_view = null;
    if ((zs_way === Cts.SHIP_ZS_JD ||
      zs_way === Cts.SHIP_KS_MT || zs_way === Cts.SHIP_ZS_MT ||
      zs_way === Cts.SHIP_ZS_ELE || zs_way === Cts.SHIP_ZS_BD) || (
      auto_ship_type === Cts.SHIP_ZS_JD ||
      auto_ship_type === Cts.SHIP_KS_MT || auto_ship_type === Cts.SHIP_ZS_MT ||
      auto_ship_type === Cts.SHIP_ZS_ELE || auto_ship_type === Cts.SHIP_ZS_BD ||
      auto_ship_type == Cts.SHIP_KS_ELE
    )) {//专送配送
      let zs_ship = tool.autoPlat(zs_way, zs_status);
      let zs_ship_status = tool.zs_status(zs_status);
      let zs_name = tool.ship_name(zs_way);
      
      zs_ship_view = (
        <View>
          <View style={[ship_style.ship_box, {flexDirection: "column"}]}>
            <View style={[ship_style.ship_box, {borderBottomWidth: 0}]}>
              <View style={ship_style.ship_info}>
                <Text style={ship_style.ship_info_text}>
                  {(zs_status === Cts.ZS_STATUS_TO_FETCH ||
                    zs_status === Cts.ZS_STATUS_ON_WAY ||
                    zs_status === Cts.ZS_STATUS_ARRIVED) &&
                  tool.length(jd_ship_worker_mobile) > 0 ?
                    `骑手 ${jd_ship_worker_name} ${zs_ship_status}` : zs_ship
                  }
                </Text>
                <Text style={ship_style.ship_diff_time}>
                  {zs_status === Cts.ZS_STATUS_TO_ACCEPT ? '已等待: ' + tool.diffDesc(orderTime) : zs_name}
                  {tool.length(jd_ship_worker_mobile) > 0 &&
                  <Text style={ship_style.ship_diff_time}>
                    ({jd_ship_worker_mobile})
                  </Text>}
                </Text>
              </View>
              
              {(zs_status === Cts.ZS_STATUS_TO_ACCEPT ||
                zs_status === Cts.ZS_STATUS_CANCEL ||
                zs_status === Cts.ZS_STATUS_ABNORMAL
              ) && (
                <View style={ship_style.ship_btn_view}>
                  {(zs_status === Cts.ZS_STATUS_TO_ACCEPT && (zs_way === Cts.SHIP_KS_MT || zs_way === Cts.SHIP_ZS_MT)) &&
                  <ClickBtn
                    btn_text={'加小费'}
                    onPress={() => {
                      this.setState({addTipDialog: true})
                    }}
                  />}
                  {(zs_status !== Cts.ZS_STATUS_NEVER_START &&
                    zs_status !== Cts.ZS_STATUS_CANCEL &&
                    zs_status !== Cts.ZS_STATUS_ABNORMAL
                  ) && <ClickBtn
                    type={'full'}
                    btn_text={'转自配送'}
                    style={{marginLeft: pxToDp(30)}}
                    onPress={() => {
                      this.setState({cancel_zs_hint: true});
                    }}
                  />}
                  {(ship_site_mobile !== '' || ship_site_tel !== '') && (
                    <ClickBtn
                      type={'full'}
                      btn_text={'催单'}
                      style={{marginLeft: pxToDp(30)}}
                      onPress={() => {
                        this.setState({shipCallHided: !shipCallHided});
                      }}
                    />
                  )}
                </View>
              )}
              {(zs_status === Cts.ZS_STATUS_TO_FETCH ||
                zs_status === Cts.ZS_STATUS_ON_WAY ||
                zs_status === Cts.ZS_STATUS_ARRIVED) && tool.length(jd_ship_worker_mobile) > 0 &&
              (<View style={ship_style.ship_btn_view}>
                {(ship_site_mobile !== '' || ship_site_tel !== '') && (
                  <ImageBtn
                    source={shipCallHided ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')}
                    onPress={() => {
                      this.setState({shipCallHided: !shipCallHided});
                    }}
                    imageStyle={styles.pullImg}
                  />
                )}
                <ClickBtn
                  type={'full'}
                  btn_text={'呼叫'}
                  onPress={() => {
                    native.dialNumber(jd_ship_worker_mobile)
                  }}
                />
              </View>)}
            </View>
            <View style={{
              marginHorizontal: pxToDp(30),
              flexDirection: "row",
              alignItems: 'center',
              height: pxToDp(80),
              borderTopWidth: pxToDp(1),
              borderColor: colors.back_color,
              borderStyle: 'dashed'
            }}>
              <Text style={[ship_style.ship_diff_time]}>
                距离:{dada_distance}米.配送费:{dada_fee}元.已加小费:{dada_tips}元
              </Text>
            </View>
          </View>
          
          {!shipCallHided && ship_site_mobile !== '' && (
            <View style={ship_style.ship_box}>
              <View style={ship_style.ship_info}>
                <Text style={ship_style.ship_info_text}>
                  站点/客服 <Text style={ship_style.ship_tel_text}>({ship_site_tel})</Text>
                </Text>
              </View>
              <View style={ship_style.ship_btn_view}>
                <ClickBtn
                  btn_text={'呼叫'}
                  onPress={() => {
                    native.dialNumber(ship_site_mobile)
                  }}
                />
              </View>
            </View>
          )}
          {!shipCallHided && ship_site_tel !== '' && (
            <View style={ship_style.ship_box}>
              <View style={ship_style.ship_info}>
                <Text style={ship_style.ship_info_text}>
                  站点备用电话 <Text style={ship_style.ship_tel_text}>({ship_site_tel})</Text>
                </Text>
              </View>
              <View style={ship_style.ship_btn_view}>
                <ClickBtn
                  btn_text={'呼叫'}
                  onPress={() => {
                    native.dialNumber(ship_site_tel)
                  }}
                />
              </View>
            </View>
          )}
        </View>
      );
    }
    
    if (zs_ship_view !== null || auto_ship_view !== null) {
      return (
        <View>
          {zs_ship_view}
          {auto_ship_view}
        </View>
      );
    } else {
      return null;
    }
  }
  
  renderHeader () {
    const {order} = this.props.order;
    const {isServiceMgr} = this.state
    const validPoi = order.loc_lng && order.loc_lat;
    const navImgSource = validPoi ? require('../../img/Order/dizhi_.png') : require('../../img/Order/dizhi_pre_.png');
    
    const totalMoneyEdit = this.state.isEditing ? this._totalEditingCents() : 0;
    const finalTotal = (tool.intOf(order.total_goods_price) + totalMoneyEdit) / 100;
    
    //console.log(finalTotal, totalMoneyEdit, order.total_goods_price, this.state);
    const _items = order.items || {};
    const remindNicks = this.state.reminds.nicknames || {};
    const task_types = this.props.global.config.task_types || {};
    const mobile_label = order.mobile.replace(',', '转');
    
    return (<View>
        <OrderReminds task_types={task_types} reminds={this.state.reminds.reminds} remindNicks={remindNicks}
                      processRemind={this._doProcessRemind}/>
        <View style={[CommonStyle.topBottomLine, {backgroundColor: '#fff'}]}>
          <View style={[styles.row, {height: pxToDp(40), alignItems: 'center'}]}>
            <Text style={{fontSize: pxToDp(32), color: colors.color333}}>{order.userName}</Text>
            <ImageBtn source={require('../../img/Order/profile.png')}/>
            <TouchableOpacity style={{marginLeft: 15, height: pxToDp(40), width: pxToDp(80)}}
                              onPress={this._toEditBasic}>
              <Icons name='edit' size={20} color={colors.main_color}/></TouchableOpacity>
            <View style={{flex: 1}}/>
            <Image style={[styles.icon, {width: pxToDp(44), height: pxToDp(42)}]}
                   source={require('../../img/Order/message_.png')}/>
          </View>
          <Text style={[styles.row, {
            fontSize: pxToDp(30),
            fontWeight: 'bold',
            color: colors.color666,
            marginTop: pxToDp(20),
            marginRight: pxToDp(114 + 20)
          }]} selectable={true}>
            {order.address}
          </Text>
          <View style={[styles.row, {paddingLeft: 0, marginBottom: pxToDp(14)}]}>
            <TouchableOpacity style={{
              width: pxToDp(96),
              height: pxToDp(42),
              backgroundColor: colors.main_color,
              borderRadius: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }} onPress={() => {
              native.ordersSearch(`uid:${order.user_id}`)
            }}>
              <Text style={{fontSize: pxToDp(22), fontWeight: 'bold', color: colors.white}}>第{order.order_times}次</Text>
            </TouchableOpacity>
            <CallBtn mobile={order.mobile} label={mobile_label}/>
            <View style={{flex: 1}}/>
            <TouchableOpacity onPress={this.toMap} style={{width: pxToDp(80), alignItems: 'flex-end'}}>
              <Image style={[styles.icon, {width: pxToDp(40), height: pxToDp(48)}]} source={navImgSource}/>
            </TouchableOpacity>
          </View>
          
          {hasRemarkOrTax(order) &&
          <View style={[styles.row, {marginBottom: pxToDp(14), marginTop: 0, flexDirection: 'column'}]}>
            <Separator style={{backgroundColor: colors.color999, marginBottom: pxToDp(14)}}/>
            {!!order.user_remark &&
            <Remark label="客户备注" remark={order.user_remark}
                    style={{fontWeight: 'bold', color: 'red', fontSize: pxToDp(24)}}/>}
            {!!order.store_remark &&
            <Remark label="商家备注" remark={order.store_remark}/>}
            {!!order.invoice &&
            <Remark label="发票抬头" remark={order.invoice}/>}
            {!!order.taxer_id &&
            <Remark label="税号" remark={order.taxer_id}/>}
          </View>}
        
        </View>
        
        <OrderStatusCell order={order} onPressCall={this._onShowStoreCall}/>
        {this.state.isJbbVendor ? <Delivery
          order={order}
          logistics={this.state.logistics}
          fetchData={() => this.fetchShipData()}/> : this.renderShipStatus()}
    
        <View style={[CommonStyle.topBottomLine, styles.block]}>
          <View style={[styles.row, {
            marginRight: 0,
            alignItems: 'center',
            borderBottomColor: colors.color999,
            borderBottomWidth: screen.onePixel,
            // paddingBottom: pxToDp(16),
            // paddingTop: pxToDp(16),
            marginTop: 0,
            height: pxToDp(70),
          }]}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Text style={{color: colors.title_color, fontSize: pxToDp(30), fontWeight: 'bold'}}>商品明细</Text>
              <Text style={{
                color: colors.color999,
                fontSize: pxToDp(24),
                marginLeft: pxToDp(20)
              }}>{
                this.total_goods_num(_items)
              }件商品</Text>
            </View>
            <View style={{flex: 1}}/>
            <ImageBtn source={require('../../img/Order/refund.png')}
                      imageStyle={{width: pxToDp(152), height: pxToDp(40)}} onPress={this._doRefund}/>
            
            {this.state.isEditing && <View style={{flexDirection: 'row', paddingRight: pxToDp(30)}}>
              
              <ImageBtn
                source={require('../../img/Order/good/queren_.png')}
                imageStyle={{width: pxToDp(152), height: pxToDp(40)}} onPress={this._doSaveItemsEdit}/>
              <ImageBtn
                source={require('../../img/Order/good/quxiao_.png')}
                imageStyle={{width: pxToDp(110), height: pxToDp(40)}} onPress={this._doSaveItemsCancel}/>
            </View>}
            
            {!this.state.isEditing && (
              order._op_edit_goods ?
                <ImageBtn source={require('../../img/Order/items_edit.png')} onPress={() => {
                  this.setState({isEditing: true, itemsHided: false})
                }}/>
                : <ImageBtn source={require('../../img/Order/items_edit_disabled.png')}/>)
            }
            
            {!this.state.isEditing && (this.state.itemsHided ?
              <ImageBtn source={require('../../img/Order/pull_up.png')} onPress={
                () => {
                  this.setState({itemsHided: false});
                  console.log("after click pull_up", this.state)
                }
              } imageStyle={styles.pullImg}/>
              : <ImageBtn source={require('../../img/Order/pull_down.png')} imageStyle={styles.pullImg} onPress={() => {
                this.setState({itemsHided: true});
                console.log("after click pull_down", this.state)
              }}/>)
            }
          </View>
          {!this.state.itemsHided && tool.objectMap(_items, (item, idx) => {
            return (
              <ItemRow
                key={idx}
                item={item}
                edited={this.state.itemsEdited[item.id]}
                idx={idx}
                nav={this.props.navigation}
                isEditing={this.state.isEditing}
                onInputNumberChange={this._onItemRowNumberChanged}
                fnShowWmPrice={order.is_fn_show_wm_price}
                fnPriceControlled={order.is_fn_price_controlled}
                isServiceMgr={isServiceMgr}
              />
            );
          })}
          {!this.state.itemsHided && tool.objectMap(this.state.itemsAdded, (item, idx) => {
            return (
              <ItemRow
                key={idx}
                item={item}
                isAdd={true}
                idx={idx}
                nav={this.props.navigation}
                isEditing={this.state.isEditing}
                onInputNumberChange={this._onItemRowNumberChanged}
                fnShowWmPrice={order.is_fn_show_wm_price}
                fnPriceControlled={order.is_fn_price_controlled}
                isServiceMgr={isServiceMgr}
              />
            );
          })}
          
          {!this.state.itemsHided && this.state.isEditing &&
          <View style={[styles.row, {
            height: pxToDp(100),
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 0,
            borderBottomColor: colors.color999,
            borderBottomWidth: screen.onePixel
          }]}>
            <ImageBtn source={require('../../img/Order/good/jiahuo_.png')}
                      imageStyle={{width: pxToDp(70), height: pxToDp(70)}} onPress={this._openAddGood}/>
          </View>}
          {order.is_fn_price_controlled ?
            <View style={[styles.row, styles.moneyRow, {marginTop: pxToDp(12)}]}>
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
          <If condition={isServiceMgr || !order.is_fn_price_controlled}>
            <View style={[styles.row, styles.moneyRow]}>
              <View style={[styles.moneyLeft, {alignItems: 'flex-end'}]}>
                <Text style={styles.moneyListTitle}>用户已付</Text>
                <Text style={{fontSize: pxToDp(20), flex: 1}}>含平台扣费、优惠等</Text>
                {/*<Text style={styles.moneyListSub}>微信支付</Text>*/}
              </View>
              <View style={{flex: 1}}/>
              <Text style={styles.moneyListNum}>
                {numeral(order.orderMoney).format('0.00')}
              </Text>
            </View>
            <View style={[styles.row, styles.moneyRow]}>
              <Text style={[styles.moneyListTitle, {width: pxToDp(480)}]}>配送费</Text>
              <View style={{flex: 1}}/>
              <Text style={styles.moneyListNum}>{numeral(order.deliver_fee / 100).format('0.00')}</Text>
            </View>
            <View style={[styles.row, styles.moneyRow]}>
              <View style={[styles.moneyLeft, {alignItems: 'center'}]}>
                <Text style={styles.moneyListTitle}>优惠</Text>
                <TouchableOpacity style={{marginLeft: 5}}><Icons name='question-circle-o'/></TouchableOpacity>
              </View>
              <View style={{flex: 1}}/>
              <Text style={styles.moneyListNum}>{numeral(order.self_activity_fee / 100).format('0.00')}</Text>
            </View>
          </If>
          
          {order.additional_to_pay != '0' ?
            <View style={[styles.row, styles.moneyRow]}>
              <View style={styles.moneyLeft}>
                <Text style={[styles.moneyListTitle, {flex: 1}]}>需加收/退款</Text>
                <TouchableOpacity style={[{marginLeft: pxToDp(20), alignItems: 'center', justifyContent: 'center'}]}>
                  <Text style={{color: colors.main_color, fontWeight: 'bold', flexDirection: 'row'}}>
                    <Text>收款码</Text>
                    <Icons name='qrcode'/>
                  </Text>
                </TouchableOpacity>
                {(order.additional_to_pay != 0) &&
                <Text style={styles.moneyListSub}>{order.additional_to_pay > 0 ? '加收' : '退款'}</Text>}
              </View>
              <View style={{flex: 1}}/>
              <Text style={styles.moneyListNum}>
                {numeral(order.additional_to_pay / 100).format('+0.00')}
              </Text>
            </View>
            : null}
          
          {/*管理员可看*/}
          <If condition={isServiceMgr || !order.is_fn_price_controlled}>
            <View style={[styles.row, styles.moneyRow,]}>
              <View style={styles.moneyLeft}>
                <Text style={[styles.moneyListTitle, {flex: 1}]}>商品原价</Text>
                
                {totalMoneyEdit !== 0 &&
                <View><Text
                  style={[styles.editStatus, {backgroundColor: totalMoneyEdit > 0 ? colors.editStatusAdd : colors.editStatusDeduct}]}>
                  {totalMoneyEdit > 0 ? '需加收' : '需退款'}{numeral(totalMoneyEdit / 100).format('0.00')}元
                </Text>
                  <Text style={[styles.moneyListNum, {textDecorationLine: 'line-through'}]}>
                    {numeral(order.total_goods_price / 100).format('0.00')}
                  </Text></View>}
              
              </View>
              <View style={{flex: 1}}/>
              <Text style={styles.moneyListNum}>
                {numeral(finalTotal).format('0.00')}
              </Text>
            </View>
          </If>
        </View>
        
        <Refund
          orderId={order.id}
          platform={order.platform}
          isFnPriceControl={order.is_fn_price_controlled}
          isServiceMgr={isServiceMgr}
        />
        
        <View>
          <View style={[CommonStyle.topBottomLine, styles.block]}>
            <View style={[styles.row, {
              alignItems: 'center',
              marginTop: 0,
              height: pxToDp(65),
              marginRight: 0,
            }]}>
              <Text style={{color: colors.title_color, fontSize: pxToDp(30), fontWeight: 'bold'}}>运单记录</Text>
              {order.dada_fee > 0 && (
                <Text style={{color: colors.fontGray, fontSize: pxToDp(25), marginLeft: pxToDp(15)}}>
                  配送费: {order.dada_fee}元
                </Text>
              )}
              {order.dada_tips > 0 && (
                <Text style={{color: colors.fontGray, fontSize: pxToDp(25), marginLeft: pxToDp(20)}}>
                  小费: {order.dada_tips}元
                </Text>
              )}
              <View style={{flex: 1}}/>
              <ImageBtn
                source={
                  this.state.shipHided ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')
                } imageStyle={styles.pullImg}
                onPress={() => {
                  this._getWayRecord()
                }}
              />
            </View>
          </View>
          <View style={{
            backgroundColor: '#fff',
            borderTopWidth: pxToDp(1),
            borderTopColor: "#D3D3D3",
            position: 'relative'
          }}>
            {
              this.renderWayRecord()
            }
            <View style={{position: 'absolute', right: pxToDp(0), top: pxToDp(0)}}>
              {
                this.renderAddTip()
              }
            </View>
          </View>
        </View>
        
        <View style={{marginBottom: pxToDp(100)}}>
          <View style={[CommonStyle.topBottomLine, styles.block,]}>
            <View style={[styles.row, {
              alignItems: 'center',
              marginTop: 0,
              height: pxToDp(65),
              marginRight: 0,
            }]}>
              <Text
                style={{
                  color: colors.title_color,
                  fontSize: pxToDp(30),
                  fontWeight: 'bold',
                  marginBottom: pxToDp(1)
                }}>修改记录</Text>
              <View style={{flex: 1}}/>
              <ImageBtn source={
                this.state.changeHide ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')
              }
                        imageStyle={styles.pullImg} onPress={() => {
                this._orderChangeLog()
              }}
              />
            
            </View>
          </View>
          <View style={{marginTop: pxToDp(1)}}>
            {
              this.renderChangeLogs()
            }
          </View>
        </View>
      
      </View>
    )
  }
}

class OrderReminds extends PureComponent {
  constructor (props) {
    super(props)
  }
  
  render () {
    
    const {reminds, task_types, remindNicks, processRemind} = this.props;
    
    return <View>{(reminds || []).map((remind, idx) => {
      const type = parseInt(remind.type);
      const taskType = task_types['' + type];
      const status = parseInt(remind.status);
      const quick = parseInt(remind.quick);
      
      return <View key={remind.id} style={{
        borderBottomWidth: screen.onePixel,
        borderBottomColor: colors.color999,
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
          <Text style={{fontSize: 12, color: '#808080'}}>{remind.taskDesc}</Text>
        </View>}
      </View>;
    })}</View>
  }
}

class ItemRow extends PureComponent {
  static propTypes = {
    item: PropTypes.object.isRequired,
    idx: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    isEditing: PropTypes.bool,
    isAdd: PropTypes.bool,
    edits: PropTypes.object,
    onInputNumberChange: PropTypes.func,
    nav: PropTypes.object,
    fnShowWmPrice: PropTypes.bool
  }
  
  constructor (props) {
    super(props);
  }
  
  render () {
    const {
      idx, item, isAdd, edited, onInputNumberChange = () => {
      }, isEditing = false, nav, fnShowWmPrice, fnPriceControlled, isServiceMgr = false
    } = this.props;
    
    if (item.crm_order_detail_hide) {
      return null
    }
    
    const editNum = _editNum(edited, item);
    
    const showEditAdded = isEditing && !isAdd && edited && editNum !== 0;
    const isPromotion = Math.abs(item.price * 100 - item.normal_price) >= 1;
    
    return <View key={idx} style={[styles.row, {
      marginTop: 0,
      paddingTop: pxToDp(14),
      paddingBottom: pxToDp(14),
      borderBottomColor: colors.color999,
      borderBottomWidth: screen.onePixel,
    }]}>
      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => {
            let {product_id} = item
            nav.navigate(Config.ROUTE_GOODS_DETAIL, {productId: product_id})
          }}
        >
          <Image
            style={styles.product_img}
            source={!!item.product_img ? {uri: item.product_img} : require('../../img/Order/zanwutupian_.png')}
          />
        </TouchableOpacity>
        <View>
          <Text style={{
            fontSize: pxToDp(26),
            color: colors.color333,
            marginBottom: pxToDp(14),
          }}>
            <If condition={item.shelf_no}>{item.shelf_no} </If>{item.name}
            <Text style={{fontSize: pxToDp(22), color: colors.fontGray}}>(#{item.product_id}<If condition={item.tag_code}>[{item.tag_code}]</If>)</Text>
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
                <Text style={styles.priceMode}>保</Text>
                <Text style={{color: '#f44140'}}>{numeral(item.supply_price / 100).format('0.00')}</Text>
                <Text style={{color: '#f9b5b2', marginLeft: 30}}>
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
      {isEditing && !isAdd && edited && edited.num < item.num ? (<View style={{alignItems: 'flex-end'}}>
        <Text
          style={[styles.editStatus, {backgroundColor: colors.editStatusDeduct, opacity: 0.7,}]}>已减{-editNum}件</Text>
        <Text
          style={[styles.editStatus, {
            backgroundColor: colors.editStatusDeduct,
            opacity: 0.7,
          }]}>退{numeral(-editNum * item.price).format('0.00')}</Text>
      </View>) : (showEditAdded && <View style={{alignItems: 'flex-end'}}>
        <Text style={[styles.editStatus, {backgroundColor: colors.editStatusAdd, opacity: 0.7,}]}>已加{editNum}件</Text>
        <Text
          style={[styles.editStatus, {
            backgroundColor: colors.editStatusAdd,
            opacity: 0.7,
          }]}>收{numeral(editNum * item.normal_price / 100).format('0.00')}</Text>
      </View>)}
      
      {isEditing && isAdd && <View style={{alignItems: 'flex-end'}}>
        <Text style={[styles.editStatus, {backgroundColor: colors.editStatusAdd, opacity: 0.7,}]}>加货{item.num}</Text>
        <Text
          style={[styles.editStatus, {
            backgroundColor: colors.editStatusAdd,
            opacity: 0.7,
          }]}>收{numeral(item.num * item.price).format('0.00')}</Text>
      </View>}
      
      {isPromotion &&
      <Text style={[styles.editStatus, {alignSelf: 'flex-end', color: colors.color999}]}>促销</Text>
      }
      {(!isEditing || isPromotion) &&
      <Text style={item.num > 1 ? {alignSelf: 'flex-end', fontSize: pxToDp(26), color: '#f44140'} : {
        alignSelf: 'flex-end',
        fontSize: pxToDp(26),
        color: colors.color666
      }}>X{item.num}</Text>}
      
      {isEditing && !isPromotion &&
      <View style={[{marginLeft: 10}]}>
        <InputNumber
          styles={inputNumberStyles}
          min={0}
          value={parseInt((edited || item).num)}
          style={{backgroundColor: 'white', width: 96}}
          onChange={(v) => {
            onInputNumberChange(item, v)
          }}
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        />
      </View>}
    </View>
  }
}

class Remark
  extends PureComponent {
  
  constructor (props) {
    super(props)
  }
  
  render () {
    const {label, remark, style} = this.props;
    return (<View style={{flexDirection: 'row'}}>
      <Text style={[styles.remarkText, style]}>{label}:</Text>
      <Text selectable={true} style={[styles.remarkText, styles.remarkTextBody, style]}>{remark}</Text>
    </View>)
  }
}

class ImageBtn extends PureComponent {
  constructor (props) {
    super(props)
  }
  
  render () {
    
    const {source, onPress, imageStyle, ...others} = this.props;
    
    return <TouchableOpacity onPress={onPress} others>
      <Image source={source} style={[styles.btn4text, {alignSelf: 'center', marginLeft: pxToDp(20)}, imageStyle]}/>
    </TouchableOpacity>
  }
}

class ClickBtn extends PureComponent {
  constructor (props) {
    super(props)
  }
  
  render () {
    let {style, type, onPress, btn_text, mobile, text_style} = this.props;
    return (
      <TouchableOpacity
        onPress={() => onPress()}
        style={[{
          width: pxToDp(115),
          height: pxToDp(56),
          borderColor: '#59b26a',
          borderWidth: pxToDp(1),
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
          backgroundColor: type === 'full' ? '#59b26a' : '#fff',
        }, style]}
      >
        <Text
          style={{color: type === 'full' ? '#fff' : '#59b26a', fontSize: pxToDp(24), ...text_style}}>{btn_text}</Text>
      </TouchableOpacity>
    );
  }
}

const ship_style = StyleSheet.create({
  ship_box: {
    minHeight: pxToDp(120),
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: '#D3D3D3',
  },
  ship_info: {
    marginLeft: pxToDp(30),
    justifyContent: 'center'
  },
  ship_info_text: {
    color: '#3e3e3e',
    fontSize: pxToDp(32)
  },
  ship_tel_text: {
    color: '#bfbfbf',
    fontSize: pxToDp(24)
  },
  ship_diff_time: {
    color: '#bfbfbf',
    fontSize: pxToDp(24),
    marginTop: pxToDp(5)
  },
  ship_btn_view: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    marginRight: pxToDp(30),
  },
  cell_box: {
    marginTop: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    marginLeft: 0,
    paddingLeft: pxToDp(10),
    height: pxToDp(130),
    justifyContent: 'center',
  },
  cell_body: {
    fontSize: pxToDp(36),
    color: '#515151',
  },
  cell_tips: {
    marginTop: pxToDp(5),
    fontSize: pxToDp(24),
    color: '#a4a4a4',
  },
  icon_size: {
    fontSize: 20,
  },
});

const top_styles = StyleSheet.create({
  icon_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
    position: 'absolute',
    right: 0,
    // backgroundColor: 'green',
  },
  icon_img_dropDown: {
    width: pxToDp(88),
    height: pxToDp(55),
  },
  drop_style: {
    // width: pxToDp(88),
    // height: pxToDp(55),
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drop_listStyle: {//下拉列表的样式
    width: pxToDp(150),
    // height: pxToDp(141),
    backgroundColor: '#5f6660',
    marginTop: -StatusBar.currentHeight,
  },
  drop_textStyle: {//下拉选项文本的样式
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: '#fff',
    height: pxToDp(69),
    backgroundColor: '#5f6660',
    borderRadius: pxToDp(3),
    borderColor: '#5f6660',
    borderWidth: 1,
    shadowRadius: pxToDp(3),
  },
  drop_optionStyle: {//选项点击之后的文本样式
    color: '#4d4d4d',
    backgroundColor: '#939195',
  },
});
const wayRecord = StyleSheet.create({
  expressName: {
    height: pxToDp(30),
    width: pxToDp(76),
    backgroundColor: '#EEEEEE',
    borderRadius: pxToDp(10)
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderScene)
