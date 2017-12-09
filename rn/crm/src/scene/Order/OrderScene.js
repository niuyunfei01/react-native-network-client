import React, {PureComponent, Component} from 'react'
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ListView,
  Image,
  InteractionManager,
  RefreshControl,
  Alert,
  ToastAndroid,
} from 'react-native'
import InputNumber from 'rc-input-number';
import {color, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView} from '../../widget'
import {screen, system, tool, native} from '../../common'
import {bindActionCreators} from "redux";
import Icons from 'react-native-vector-icons/FontAwesome';
import Config, {serverUrl} from '../../config'
import PropTypes from 'prop-types';
import OrderStatusCell from './OrderStatusCell'
import CallBtn from './CallBtn'
import OrderBottom from './OrderBottom'
import CommonStyle from '../../common/CommonStyles'
import LoadingView from "../../widget/LoadingView";

import {
  getOrder,
  printInCloud,
  getRemindForOrderPage,
  saveOrderDelayShip,
  saveOrderItems,
  orderWayRecord,
  orderChangeLog,
  clearLocalOrder
} from '../../reducers/order/orderActions'
import {getContacts} from '../../reducers/store/storeActions';
import {markTaskDone} from '../../reducers/remind/remindActions';
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Button, ActionSheet, ButtonArea, Toast, Msg, Dialog, Icon} from "../../weui/index";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import {StatusBar} from "react-native";
import Cts from '../../Cts'
import inputNumberStyles from './inputNumberStyles';
import S from '../../stylekit';
import Entypo from "react-native-vector-icons/Entypo";
import DateTimePicker from 'react-native-modal-datetime-picker';
import ModalSelector from "../../widget/ModalSelector/index";
import { Array } from 'core-js/library/web/timers';
import styles from './OrderStyles'

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
    }, dispatch)
  }
}

const _editNum = function (edited, item) {
  return edited ? edited.num - (item.origin_num === null ? item.num : item.origin_num) : 0;
};

const hasRemarkOrTax = (order) => (!!order.user_remark) || (!!order.store_remark) || (!!order.taxer_id) || (!!order.invoice)
const supportEditGoods = (orderStatus) => {
  orderStatus = parseInt(orderStatus);
  return orderStatus === Cts.ORDER_STATUS_TO_SHIP ||
    orderStatus === Cts.ORDER_STATUS_TO_READY ||
    orderStatus === Cts.ORDER_STATUS_SHIPPING
};

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

class OrderScene extends Component {

  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    let {backPage} = params;
    return {
      headerLeft: (<NavigationItem
        icon={require('../../img/Register/back_.png')}
        iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
        onPress={() => {
          if(!!backPage){
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

  constructor(props: Object) {
    super(props);

    this.state = {

      isFetching: false,
      orderReloading: false,

      errorHints: '',

      doingUpdate: false,

      //good items editing/display
      isEditing: false,
      isEndVisible: false,
      itemsHided: true,
      itemsAdded: {},
      itemsEdited: {},
      itemsSaving: false,

      shipHided: true,
      changeHide: true,
      gotoEditPoi: false,
      showOptionMenu: false,
      showCallStore: false,
      orderQuery:false,
      orderChangeLogs: [],
      orderWayLogs: {},
      //remind
      onProcessed: false,
      reminds: {},
      remindFetching: false,
      store_contacts: [],
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
  }

  componentDidMount() {
    this._navSetParams();
  }

  componentWillMount() {
    const orderId = (this.props.navigation.state.params || {}).orderId;
    const {dispatch, order, global} = this.props;
    this.__getDataIfRequired(dispatch, global, order, orderId);
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps order.order', nextProps.order.order);

    const orderId = (this.props.navigation.state.params || {}).orderId;
    const {dispatch, global} = this.props;
    this.__getDataIfRequired(dispatch, global, nextProps.order, orderId);
  }

  __getDataIfRequired = (dispatch, global, orderStateToCmp, orderId) => {

    console.log('__getDataIfRequired', orderId);

    if (!orderId) {
      return;
    }
    
    const sessionToken = global.accessToken;
    const o = orderStateToCmp.order;

    if (!o || !o.id || o.id !== orderId) {

      console.log('__getDataIfRequired refresh, isFetching', orderId, this.state.isFetching);
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
              dispatch(getRemindForOrderPage(sessionToken, orderId, (ok, data) => {
                if (ok) {
                  this.setState({reminds: data, remindFetching: false})
                } else {
                  this.setState({errorHints: '获取提醒列表失败', remindFetching: false})
                }
              }));
            }
          }
        }))
      }
    }
  };

  static _extract_edited_items(items) {
    const edits = {};
    (items || []).filter((item => item.origin_num !== null && item.num > item.origin_num)).forEach((item) => {
      edits[item.id] = item;
    });
    return edits;
  }

  _navSetParams = () => {
    let {backPage} = (this.props.navigation.state.params || {});

    const as = [
      {key: MENU_EDIT_BASIC, label: '修改地址电话发票备注'},
      {key: MENU_EDIT_EXPECT_TIME, label: '修改配送时间'},
      {key: MENU_EDIT_STORE, label: '修改门店'},
      {key: MENU_FEEDBACK, label: '客户反馈'},
      {key: MENU_SET_INVALID, label: '置为无效'},
      {key: MENU_ADD_TODO, label: '稍后处理'},
      {key: MENU_OLD_VERSION, label: '老版订单页'},
    ];

    if (this._fnProvidingOnway()) {
      as.push({key: MENU_PROVIDING, label: '门店备货'});
    }

    let params = {
      onMenuOptionSelected: this.onMenuOptionSelected,
      onPrint: this.onPrint,
      backPage: backPage,
      ActionSheet: as
    };
    this.props.navigation.setParams(params);
  };

  _setAfterOrderGot = (order, initialState) => {
    this.setState({
      itemsEdited: OrderScene._extract_edited_items(order.items),
      itemsHided: !shouldShowItems(order.orderStatus),
      ...initialState,
  });

    this._navSetParams();
  };

  onPrint() {

    const order = this.props.order.order;

    const store = tool.store(order.store_id, this.props.global);

    if (store && store.cloudPrinter) {
      this.setState({showPrinterChooser: true})
    } else {
      this._doBluetoothPrint()
    }
  }

  onToggleMenuOption() {
    this.setState((prevState) => {
      return {showOptionMenu: !prevState.showOptionMenu}
    })
  }

  onMenuOptionSelected(option) {

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
    } else {
      ToastShort('未知的操作');
    }
  }

  onSaveDelayShip(date) {
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

  _onShowStoreCall() {

    const {store, dispatch, global} = this.props;

    const store_id = this.props.order.order.store_id;
    const contacts = (store.store_contacts ||{}).store_id;

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

  _contacts2menus() {
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

  _toEditBasic() {
    const {navigation, order} = this.props;
    navigation.navigate(Config.ROUTE_ORDER_EDIT, {order: order.order});
  }

  _hideCallStore() {
    this.setState({showCallStore: false});
  }

  _dispatchToInvalidate() {
    const {dispatch, order} = this.props;
    dispatch(clearLocalOrder(order.order.id));
  }

  _hidePrinterChooser() {
    this.setState({showPrinterChooser: false})
  }
  _cloudPrinterSN() {
    const stores = this.props.global.canReadStores;
    const order = this.props.order.order;
    const store = stores[order.id];
    const printerName = (store && store.cloudPrinter) ? store.cloudPrinter : '未知';
    return `云打印(${printerName})`;
  }
  _doCloudPrint() {
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
  _doBluetoothPrint() {
    const order = this.props.order.order;
    native.printBtPrinter(order, (ok, msg) => {
      console.log("printer result:", ok, msg)
    });
    this._hidePrinterChooser();
  }
  _onLogin() {
    const orderId = this.props.order.order.id;
    this.props.navigation.navigate(Config.ROUTE_LOGIN, {next: Config.ROUTE_ORDER, nextParams: {orderId}})
  }

  _doSaveItemsEdit() {

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

  _doSaveItemsCancel() {
    this.setState({isEditing: false})
  }

  _openAddGood() {
    const {navigation, dispatch} = this.props;
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

  _onItemRowNumberChanged(item, newNum) {

    console.log('accept a item:', item, 'to new', newNum);
    this._recordEdition({...item, num: newNum});
  }

  _recordEdition(item) {
    if (item.id) {
      this.setState({itemsEdited: {...this.state.itemsEdited, [item.id]: item}});
    } else {
      this.setState({itemsAdded: {...this.state.itemsAdded, [item.product_id]: item}});
    }
  }

  _totalEditingCents() {
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

  goToSetMap() {
    this.setState({gotoEditPoi: false});

    const {order} = this.props.order;
    this.props.navigation.navigate(Config.ROUTE_ORDER_EDIT, {order: order})
  }

  toMap() {
    const {dispatch, global} = this.props;
    const {order} = this.props.order;
    const validPoi = order.gd_lng && order.gd_lat;

    if (validPoi) {
      const store = this.props.global.canReadStores[order.store_id] || {};
      const path = `${Config.MAP_WAY_URL}?start=${store.loc_lng},${store.loc_lat}&dest=${order.gd_lng},${order.gd_lat}`;
      const uri = Config.serverUrl(path);
      this.props.navigation.navigate(Config.ROUTE_WEB, {url: uri});
      console.log(uri)
    } else {
      //a page to set the location for this url!!
      this.setState({
        gotoEditPoi: true
      });
    }
  }

  _doProcessRemind(remind) {
    const {order} = this.props.order;
    const {dispatch, navigation, global} = this.props;
    const remindType = parseInt(remind.type);
    if (remindType === Cts.TASK_TYPE_REFUND_BY_USER) {
      navigation.navigate(Config.ROUTE_REFUND_AUDIT, {remind: remind, order: order})
    } else if (remindType === Cts.TASK_TYPE_REMIND) {
      navigation.navigate(Config.ROUTE_ORDER_URGE, {remind: remind, order: order})
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
      this.setState({errorHints: '暂不支持的处理类型：' + remind})
    }
  }

  _fnProvidingOnway() {
    const {order, global} = this.props;
    
    const storeId = (order.order||{}).store_id;
    return storeId > 0 && (tool.vendorOfStoreId(storeId, global) || {}).fnProvidingOnway;
  }

  _callShip () {
    const {navigation, order} = this.props;
    navigation.navigate(Config.ROUTE_ORDER_CALL_SHIP, {order: order.order});
  }

  _onToProvide() {
    const {order, global, dispatch, navigation} = this.props;
    if (order.order.store_id <= 0) {
      ToastLong("所属门店未知，请先设置好订单所属门店！");
      return false;
    }

    const path = `stores/orders_go_to_buy/${order.order.id}.html?access_token=${global.accessToken}`;
    navigation.navigate(Config.ROUTE_WEB, {url: Config.serverUrl(path, Config.https)});
  }
  _getWayRecord() {
    this.setState({ shipHided: !this.state.shipHided })
    let orderWayLogs = this.state.orderWayLogs

    if (this.state.shipHided && tool.length(tool.length(orderWayLogs) == 0)) {
      this.wayRecordQuery()
      console.log(orderWayLogs)

    }

  }

  wayRecordQuery() {
    const { dispatch, order, global } = this.props;
    dispatch(orderWayRecord(order.order_id, global.accessToken, (ok, msg, contacts) => {
      let mg = 0
      if (ok) {
        // if (tool.length(contacts)>0) {
        mg = contacts
        // }
      } else {
        Alert.alert(msg)
      }
      this.setState({ orderWayLogs: mg })
      console.log(this.state.orderWayLogs)

    }));
  }



  renderWayRecord() {
    let orderWayLogs = this.state.orderWayLogs
    if (!this.state.shipHided) {
      if (typeof orderWayLogs == 'object' && (tool.length(orderWayLogs) > 0)) {
        return tool.objectMap(this.state.orderWayLogs, (item, index) => {
          return (
            <View key={index} style={{ flex: 1, backgroundColor: '#fff', paddingLeft: pxToDp(30), paddingRight: pxToDp(30), flexDirection: 'row', paddingTop: pxToDp(20), width: '100%' }}>
              <View style={{ width: pxToDp(124) }}>
                <View style={wayRecord.expressName}>
                  <Text style={{ fontSize: pxToDp(24), textAlign: 'center', color: '#58B169' }}>{tool.disWay()[index]}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                {
                  item.map((ite, key) => {
                    return (
                      <View key={key}>
                        <View style={{ paddingBottom: pxToDp(20), flex: 1 }}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={{ width: pxToDp(140), fontSize: pxToDp(26), marginRight: pxToDp(20) }}>
                              {
                                tool.disWayStatic(index)[ite.order_status]
                              }
                            </Text>
                            <Text style={{ fontSize: pxToDp(24) }}>{ite.created}</Text>
                          </View>
                        </View>
                      </View>
                    )
                  })
                }
              </View>
              <View style={{ width: pxToDp(90) }}>
                {
                  tool.objectMap(this.state.orderWayLogs, (item, index) => {
                    item.forEach((ite) => {
                      if (ite.hasOwnProperty('add_tips_btn') && (ite.add_tips_btn == 1)) {
                        return (
                          <View style={{ height: pxToDp(30), backgroundColor: '#59b26a', borderRadius: pxToDp(5) }}>
                            <Text style={{ height: pxToDp(24), fontSize: pxToDp(24), textAlign: 'center', color: '#EEEEEE', lineHeight: pxToDp(24) }}>加小费</Text>
                          </View>)
                      }
                    });
                  })
                }
              </View>
            </View>

          )

        })
      } else if (tool.length(orderWayLogs) == 0 && (typeof orderWayLogs == 'object')) {
        return <View style={{ height: pxToDp(50), backgroundColor: "#fff", paddingLeft: pxToDp(30), flexDirection: 'row', alignItems: 'center' }}>

          <Text style={{ color: '#59B26A' }}>没有相应的记录</Text>

        </View>
      } else {
        return <LoadingView />
      }
    }

  }

  _orderChangeLog() {

    this.setState({ changeHide: !this.state.changeHide })
    if (this.state.orderChangeLogs.length == 0 && this.state.changeHide) {
      this._orderChangeLogQuery();
    } else {
      this.renderChangeLogs()
    }

  }

  _orderChangeLogQuery() {
    const { dispatch, order, global } = this.props;
    dispatch(orderChangeLog(order.order_id, global.accessToken, (ok, msg, contacts) => {

      if (ok) {
        this.setState({ orderChangeLogs: contacts });
      } else {
        Alert.alert(msg)
      }
    }));
  }


  renderChangeLogs() {
    if (!this.state.changeHide && this.state.orderChangeLogs.length > 0) {
      return this.state.orderChangeLogs.map((item, index) => {
        return (
          <View key={index} style={{ width:'100%',paddingHorizontal:pxToDp(30),backgroundColor:'#fff'}}>
            <View style={{flex:1,borderBottomWidth:pxToDp(1),borderColor:"#bfbfbf",height:pxToDp(150),justifyContent:'center'}}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: '#59B26A', fontSize: pxToDp(26), overflow: 'hidden', height: pxToDp(30) }}>{item.updated_name}</Text>
                <Text style={{ flex: 1, color: '#59B26A', fontSize: pxToDp(26), overflow: 'hidden', height: pxToDp(30), marginLeft: pxToDp(24) }}>{item.modified}</Text>
              </View>
              <View style={{ marginTop: pxToDp(20),width:'100%' }}>
                <Text style={{ fontSize: pxToDp(24) }}>{item.what}</Text>
              </View>
            </View>
          </View>
        )
      })

    } else if (this.state.orderChangeLogs.length == 0 && !this.state.changeHide) {
      return <LoadingView />
    }

  }

  render() {
    const order = this.props.order.order;
    let refreshControl = <RefreshControl
      refreshing={this.state.isFetching}
      onRefresh={this._dispatchToInvalidate}
      tintColor='gray'
    />;

    const orderId = (this.props.navigation.state.params || {}).orderId;
    const noOrder = (!order || !order.id || order.id !== orderId);
    console.log('noOrder', noOrder, order);

    if (noOrder) {
      const {dispatch, global, store} = this.props;
      this.__getDataIfRequired(dispatch, global, this.props.order, orderId);
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
          />

          <Dialog onRequestClose={() => {
          }}
                  visible={this.state.gotoEditPoi}
                  buttons={[{
                    type: 'warn',
                    label: '去设置',
                    onPress: this.goToSetMap,
                  },
                    {
                      type: 'default',
                      label: '取消',
                      onPress: () => this.setState({gotoEditPoi: false}),
                    }
                  ]}
          ><Text>没有经纬度信息</Text></Dialog>
          <ScrollView
            refreshControl={refreshControl}>
            {this.renderHeader()}
          </ScrollView>
            <OrderBottom order={order} navigation={this.props.navigation} callShip={this._callShip} fnProvidingOnway={this._fnProvidingOnway()} onToProvide={this._onToProvide}/>

          <Dialog onRequestClose={() => {
          }}
                  visible={!!this.state.errorHints}
                  buttons={[{
                    type: 'default',
                    label: '知道了',
                    onPress: () => {
                      this.setState({errorHints: ''})
                    }
                  }]}
          ><Text>{this.state.errorHints}</Text></Dialog>

          <Toast
            icon="loading"
            show={this.state.onSubmitting}
            onRequestClose={() => {
            }}
          >提交中</Toast>

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
        </View>
      );
  }

  renderHeader() {
    const {order} = this.props.order;

    const validPoi = order.loc_lng && order.loc_lat;
    const navImgSource = validPoi ? require('../../img/Order/dizhi_.png') : require('../../img/Order/dizhi_pre_.png');

    const totalMoneyEdit = this.state.isEditing ? this._totalEditingCents() : 0;
    const finalTotal = (tool.intOf(order.total_goods_price) + totalMoneyEdit) / 100;

    console.log(finalTotal, totalMoneyEdit, order.total_goods_price, this.state);

    const _items = order.items || {};
    const remindNicks = this.state.reminds.nicknames || {};
    const task_types = this.props.global.config.task_types || {};

    return (<View>
        <OrderReminds task_types={task_types} reminds={this.state.reminds.reminds} remindNicks={remindNicks}
                      processRemind={this._doProcessRemind}/>
        <View style={[CommonStyle.topBottomLine, {backgroundColor: '#fff'}]}>
          <View style={[styles.row, {height: pxToDp(40), alignItems: 'center'}]}>
            <Text style={{fontSize: pxToDp(32), color: colors.color333}}>{order.userName}</Text>
            <ImageBtn source={require('../../img/Order/profile.png')}/>
            <TouchableOpacity style={{marginLeft: 15, height: pxToDp(40), width: pxToDp(80)}} onPress={this._toEditBasic}>
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
          }]}>
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
              native.ordersByMobileTimes(order.mobile, order.order_times)
            }}>
              <Text style={{fontSize: pxToDp(22), fontWeight: 'bold', color: colors.white}}>第{order.order_times}次</Text>
            </TouchableOpacity>
            <CallBtn mobile={order.mobile}/>
            <View style={{flex: 1}}/>
            <TouchableOpacity onPress={this.toMap} style={{width: pxToDp(80), alignItems: 'flex-end'}}>
              <Image style={[styles.icon, {width: pxToDp(40), height: pxToDp(48)}]} source={navImgSource}/>
            </TouchableOpacity>
          </View>

          {hasRemarkOrTax(order) &&
          <View style={[styles.row, {marginBottom: pxToDp(14), marginTop: 0, flexDirection: 'column'}]}>
            <Separator style={{backgroundColor: colors.color999, marginBottom: pxToDp(14)}}/>
            {!!order.user_remark &&
            <Remark label="客户备注" remark={order.user_remark}/>}
            {!!order.store_remark &&
            <Remark label="商家备注" remark={order.store_remark}/>}
            {!!order.invoice &&
            <Remark label="发票抬头" remark={order.invoice}/>}
            {!!order.taxer_id &&
            <Remark label="税号" remark={order.taxer_id}/>}
          </View>}

        </View>

        <OrderStatusCell order={order} onPressCall={this._onShowStoreCall}/>

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
              }}>{_items.length}种商品</Text>
            </View>
            <View style={{flex: 1}}/>

            {this.state.isEditing && <View style={{flexDirection: 'row', paddingRight: pxToDp(30)}}>
              <ImageBtn source={require('../../img/Order/good/queren_.png')}
                        imageStyle={{width: pxToDp(152), height: pxToDp(40)}} onPress={this._doSaveItemsEdit}/>
              <ImageBtn source={require('../../img/Order/good/quxiao_.png')}
                        imageStyle={{width: pxToDp(110), height: pxToDp(40)}} onPress={this._doSaveItemsCancel}/>
            </View>}

            {!this.state.isEditing && (
              supportEditGoods(order.orderStatus) ?
                <ImageBtn source={require('../../img/Order/items_edit.png')} onPress={() => {
                  this.setState({isEditing: true, itemsHided: false})
                }}/>
                : <ImageBtn source={require('../../img/Order/items_edit_disabled.png')}/>)
            }

            {!this.state.isEditing && (this.state.itemsHided ?
              <ImageBtn source={require('../../img/Order/pull_down.png')} onPress={
                () => {
                  this.setState({itemsHided: false});
                  console.log("after click pull_down", this.state)
                }
              } imageStyle={styles.pullImg}/>
              : <ImageBtn source={require('../../img/Order/pull_up.png')} imageStyle={styles.pullImg} onPress={() => {
                this.setState({itemsHided: true});
                console.log("after click pull_up", this.state)
              }}/>)
            }
          </View>
          {!this.state.itemsHided && tool.objectMap(_items, (item, idx) => {
            return (<ItemRow key={idx} item={item} edited={this.state.itemsEdited[item.id]} idx={idx}
                             isEditing={this.state.isEditing} onInputNumberChange={this._onItemRowNumberChanged}/>);
          })}
          {!this.state.itemsHided && tool.objectMap(this.state.itemsAdded, (item, idx) => {
            return (<ItemRow key={idx} item={item} isAdd={true} idx={idx} isEditing={this.state.isEditing}
                             onInputNumberChange={this._onItemRowNumberChanged}/>);
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

          <View style={[styles.row, styles.moneyRow, {marginTop: pxToDp(12)}]}>
            <View style={styles.moneyLeft}>
              <Text style={[styles.moneyListTitle, {flex: 1}]}>商品总额</Text>

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
          <View style={[styles.row, styles.moneyRow]}>
            <View style={[styles.moneyLeft, {alignItems: 'flex-end'}]}>
              <Text style={styles.moneyListTitle}>用户已付</Text>
              <Text style={{fontSize: pxToDp(20), flex: 1}}>含平台扣费、优惠等</Text>
              <Text style={styles.moneyListSub}>微信支付</Text>
            </View>
            <View style={{flex: 1}}/>
            <Text style={styles.moneyListNum}>
              {numeral(order.orderMoney).format('0.00')}
            </Text>
          </View>
          {order.addition_to_pay !== 0 &&
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
          }
        </View>
        <View>
        <View style={[CommonStyle.topBottomLine, styles.block]}>
          <View style={[styles.row, {
            alignItems: 'center',
            marginTop: 0,
            height: pxToDp(65),
            marginRight: 0,
          }]}>
            <Text style={{ color: colors.title_color, fontSize: pxToDp(30), fontWeight: 'bold' }}>运单记录</Text>
            <View style={{ flex: 1 }} />
            <ImageBtn source={
              this.state.shipHided ? require('../../img/Order/pull_down.png') : require('../../img/Order/pull_up.png')
            } imageStyle={styles.pullImg}
              onPress={() => {
                this._getWayRecord()
              }
              } />
          </View>
        </View>
        {
          this.renderWayRecord()
        }
      </View>

      <View>
        <View style={[CommonStyle.topBottomLine, styles.block]}>
          <View style={[styles.row, {
            alignItems: 'center',
            marginTop: 0,
            height: pxToDp(65),
            marginRight: 0,
          }]}>
            <Text style={{ color: colors.title_color, fontSize: pxToDp(30), fontWeight: 'bold' }}>修改记录</Text>

            <View style={{ flex: 1 }} />
            <ImageBtn source={
              this.state.changeHide ? require('../../img/Order/pull_down.png') : require('../../img/Order/pull_up.png')
            }
              imageStyle={styles.pullImg} onPress={() => {
                this._orderChangeLog()
              }}
            />

          </View>
        </View>
        {
          this.renderChangeLogs()
        }
      </View>



   
    </View>
    )
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
          <TouchableOpacity style={{
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
                            }}>
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
  constructor(props) {
    super(props);
  }

  render() {
    const {
      idx, item, isAdd, edited, onInputNumberChange = () => {
      }, isEditing = false
    } = this.props;

    const editNum = _editNum(edited, item);

    const showEditAdded = isEditing && !isAdd && edited && editNum !== 0;
    const isPromotion = Math.abs(item.price * 100 - item.normal_price) >= 1;

    return <View key={idx} style={[styles.row, {
      marginTop: 0,
      paddingTop: pxToDp(14),
      paddingBottom: pxToDp(14),
      borderBottomColor: colors.color999,
      borderBottomWidth: screen.onePixel
    }]}>
      <View style={{flex: 1}}>
        <Text style={{
          fontSize: pxToDp(26),
          color: colors.color333,
          marginBottom: pxToDp(14)
        }}>{item.name}</Text>
        <View style={{flexDirection: 'row'}}>
          <Text style={{color: '#f44140'}}>{numeral(item.price).format('0.00')}</Text>
          {!isAdd &&
          <Text style={{color: '#f9b5b2', marginLeft: 30}}>总价 {numeral(item.price * item.num).format('0.00')}</Text>
          }
        </View>
      </View>
      {showEditAdded && <View style={{alignItems: 'flex-end'}}>
        <Text style={[styles.editStatus, {backgroundColor: colors.editStatusAdd}]}>已加{editNum}件</Text>
        <Text
          style={[styles.editStatus, {backgroundColor: colors.editStatusAdd}]}>收{numeral(editNum * item.normal_price / 100).format('0.00')}</Text>
      </View>
      }
      {isEditing && !isAdd && edited && edited.num < item.num && <View style={{alignItems: 'flex-end'}}>
        <Text style={[styles.editStatus, {backgroundColor: colors.editStatusDeduct}]}>已减{-editNum}件</Text>
        <Text
          style={[styles.editStatus, {backgroundColor: colors.editStatusDeduct}]}>退{numeral(-editNum * item.price).format('0.00')}</Text>
      </View>
      }

      {isEditing && isAdd && <View style={{alignItems: 'flex-end'}}>
        <Text style={[styles.editStatus, {backgroundColor: colors.editStatusAdd}]}>加货{item.num}</Text>
        <Text
          style={[styles.editStatus, {backgroundColor: colors.editStatusAdd}]}>收{numeral(item.num * item.price).format('0.00')}</Text>
      </View>}

      {isPromotion &&
      <Text style={[styles.editStatus, {alignSelf: 'flex-end', color: colors.color999}]}>促销</Text>
      }
      {(!isEditing || isPromotion) &&
      <Text style={{alignSelf: 'flex-end', fontSize: pxToDp(26), color: colors.color666}}>X{item.num}</Text>}

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

ItemRow.PropTypes = {
  item: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  isEditing: PropTypes.bool,
  isAdd: PropTypes.bool,
  edits: PropTypes.object,
  onInputNumberChange: PropTypes.func,
};

class Remark extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {
    const {label, remark} = this.props;
    return (<View style={{flexDirection: 'row'}}>
      <Text style={styles.remarkText}>{label}:</Text>
      <Text style={[styles.remarkText, styles.remarkTextBody]}>{remark}</Text>
    </View>)
  }
}
class ImageBtn extends PureComponent {
  constructor(props) {
    super(props)
  }
  render() {

    const {source, onPress, imageStyle, ...others} = this.props;

    return <TouchableOpacity onPress={onPress} others>
      <Image source={source} style={[styles.btn4text, {alignSelf: 'center', marginLeft: pxToDp(20)}, imageStyle]}/>
    </TouchableOpacity>
  }
}


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
})

export default connect(mapStateToProps, mapDispatchToProps)(OrderScene)