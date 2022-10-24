import React, {Component} from 'react'
import {
  Alert,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Button} from "react-native-elements";
import {SvgXml} from "react-native-svg";
import BleManager from "react-native-ble-manager";
import DeviceInfo from "react-native-device-info";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import {downloadApk} from "rn-app-upgrade";
import {AMapSdk} from "react-native-amap3d";
import ModalDropdown from "react-native-modal-dropdown";
import Entypo from 'react-native-vector-icons/Entypo';
import * as globalActions from '../../reducers/global/globalActions'
import {getConfig, setBleStarted, setCheckVersionAt, setUserCfg} from '../../reducers/global/globalActions'
import {setDeviceInfo} from "../../reducers/device/deviceActions";

import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import Config from "../../pubilc/common/config";
import tool from "../../pubilc/util/tool";
import native from "../../pubilc/util/native";
import pxToDp from '../../pubilc/util/pxToDp';
import {MixpanelInstance} from '../../pubilc/util/analytics';
import {hideModal, showError, showModal, ToastLong} from "../../pubilc/util/ToastUtils";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import {empty_data, menu_left, search_icon, this_down} from "../../svg/svg";
import HotUpdateComponent from "../../pubilc/component/HotUpdateComponent";
import RemindModal from "../../pubilc/component/remindModal";
import store from "../../pubilc/util/configureStore";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";
import {getTime} from "../../pubilc/util/TimeUtil";
import {nrRecordMetric} from "../../pubilc/util/NewRelicRN";
import {setNoLoginInfo} from "../../pubilc/common/noLoginInfo";
import {doJPushSetAlias, initJPush, sendDeviceStatus} from "../../pubilc/component/jpushManage";
import {print_order_to_bt} from "../../pubilc/util/ble/OrderPrinter";
import JbbModal from "../../pubilc/component/JbbModal";
import OrderItem from "../../pubilc/component/OrderItem";
import GoodsListModal from "../../pubilc/component/GoodsListModal";
import AddTipModal from "../../pubilc/component/AddTipModal";
import DeliveryStatusModal from "../../pubilc/component/DeliveryStatusModal";

const {width} = Dimensions.get("window");

function mapStateToProps(state) {
  const {global, device} = state;
  return {global: global, device: device}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const initState = {
  isLoading: false,
  categoryLabels: [
    {tabname: '新订单', num: 0, status: 9},
    {tabname: '待接单', num: 0, status: 10},
    {tabname: '待取货', num: 0, status: 2},
    {tabname: '配送中', num: 0, status: 3},
    {tabname: '异常', num: 0, status: 8},
  ],
  query: {
    listType: null,
    offset: 0,
    page: 1,
    limit: 10,
    maxPastDays: 100,
    isAdd: true,
  },
  sort_list: [
    {"label": '最新来单', 'value': 'orderTime desc'},
    {"label": '最早来单', 'value': 'orderTime asc'},
    {"label": '送达时间', 'value': 'expectTime desc'},
  ],
  ListData: [],
  orderStatus: 9,
  showSortModal: false,
  show_bind_button: false,
  orderNum: {},
  isCanLoadMore: false,
  scanBoolean: false,
  order_id: 0,
  show_goods_list: false,
  add_tip_id: 0,
  show_add_tip_modal: false,
  show_delivery_modal: false,
};
const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}

class OrderListScene extends Component {
  state = initState;

  static propTypes = {
    dispatch: PropTypes.func,
    device: PropTypes.object,
  }

  constructor(props) {
    super(props);
    timeObj.method.push({startTime: getTime(), methodName: 'componentDidMount'})
    this.mixpanel = MixpanelInstance;
    let {currentUser} = this.props.global;
    if (tool.length(currentUser) > 0) {
      this.mixpanel.identify(currentUser);
    }

    this.mixpanel.track("订单列表页", {})
    GlobalUtil.setOrderFresh(1)
  }

  calcAppStartTime = () => {
    native.getStartAppTime((flag, startAppTime) => {
      if (flag) {
        const startAppEndTime = dayjs().valueOf()
        const duration = startAppEndTime - parseInt(startAppTime)
        if (global.isLoginToOrderList)
          return
        const {currStoreId, currentUser} = this.props.global

        nrRecordMetric("start_app_end_time", {
          startAppTimeDuration: duration,
          store_id: currStoreId,
          user_id: currentUser
        })
      }
    }).then()
  }

  componentWillUnmount() {
    this.focus()
    this.unSubscribe()
    if (this.ptListener != null) {
      this.ptListener.remove();
    }
    this.ptListener = null;
  }

  componentDidMount() {
    initJPush()
    this.whiteNoLoginInfo()
    this.getVendor()
    const {global, navigation, device} = this.props
    if (Platform.OS === 'android') {
      native.xunfeiIdentily().then()
      this.calcAppStartTime()
    }
    timeObj.method[0].endTime = getTime()
    timeObj.method[0].executeTime = timeObj.method[0].endTime - timeObj.method[0].startTime
    timeObj.method[0].executeStatus = 'success'
    timeObj.method[0].interfaceName = ""
    timeObj.method[0].methodName = "componentDidMount"
    const {currStoreId, currentUser, accessToken} = global;
    if (this.ptListener) {
      this.ptListener.remove()
    }

    native.getAutoBluePrint(() => {
      if (!this.state.bleStarted) {
        BleManager.start({showAlert: false}).then();
        this.setState({bleStarted: true})
        store.dispatch(setBleStarted(true));
      }
    }).then()


    let {lastCheckVersion = 0, printer_id, bleStarted} = global;
    //KEY_NEW_ORDER_NOT_PRINT_BT
    this.ptListener = DeviceEventEmitter.addListener(Config.Listener.KEY_PRINT_BT_ORDER_ID, (obj) => {
      if (printer_id) {
        if (!bleStarted) {
          BleManager.start({showAlert: false}).then();
          store.dispatch(setBleStarted(true));
        }
        setTimeout(() => {
          const clb = (msg, error) => {
            // noinspection JSIgnoredPromiseFromCall
            sendDeviceStatus(accessToken, {...obj, btConnected: `打印结果:${msg}-${error || ''}`})
          };
          BleManager.retrieveServices(printer_id).then((peripheral) => {
            print_order_to_bt(accessToken, peripheral, clb, obj.wm_id, false, 1);
          }).catch((error) => {
            //蓝牙尚未启动时，会导致App崩溃
            if (!bleStarted) {
              sendDeviceStatus(accessToken, {...obj, btConnected: '蓝牙尚未启动'})
              return;
            }
            //重新连接
            BleManager.connect(printer_id).then(() => {
              BleManager.retrieveServices(printer_id).then((peripheral) => {
                print_order_to_bt(peripheral, clb, obj.wm_id, false, 1);
              })
            }).catch((error2) => {
              // noinspection JSIgnoredPromiseFromCall
              sendDeviceStatus(accessToken, {...obj, btConnected: `已断开:error1-${error} error2-${error2}`})
              Alert.alert('提示', '无法自动打印: 打印机已断开连接', [{
                text: '确定', onPress: () => {
                  this.props.navigation.navigate(Config.ROUTE_PRINTERS)
                }
              }, {'text': '取消'}]);
            });
          });
        }, 300);
      } else {
        // noinspection JSIgnoredPromiseFromCall
        sendDeviceStatus(accessToken, {...obj, btConnected: '未连接'})
        Alert.alert('提示', '无法自动打印: 尚未连接到打印机', [{
          text: '确定', onPress: () => {
            this.props.navigation.navigate(Config.ROUTE_PRINTERS)
          }
        }, {'text': '取消'}]);
      }
    })

    //KEY_NEW_ORDER_NOT_PRINT_BT
    this.ptListener = DeviceEventEmitter.addListener(Config.Listener.KEY_NEW_ORDER_NOT_PRINT_BT, (obj) => {
      sendDeviceStatus(accessToken, obj)
    })
    doJPushSetAlias(currentUser);

    const currentTs = dayjs(new Date()).unix();
    if (currentTs - lastCheckVersion > 8 * 3600 && Platform.OS !== 'ios') {
      store.dispatch(setCheckVersionAt(currentTs))
      this.checkVersion();
    }

    GlobalUtil.getDeviceInfo().then(deviceInfo => {
      store.dispatch(setDeviceInfo(deviceInfo))
    })


    const {deviceInfo} = device
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = currStoreId
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderListScene"
    timeObj['is_record_request_monitor'] = global?.is_record_request_monitor
    calcMs(timeObj, accessToken)

    this.focus = navigation.addListener('focus', () => {
      this.onRefresh()
    })


    AMapSdk.init(
      Platform.select({
        android: "1d669aafc6970cb991f9baf252bcdb66",
        ios: "48148de470831f4155abda953888a487",
      })
    );
  }

  whiteNoLoginInfo = () => {
    this.unSubscribe = store.subscribe(() => {
      this.handleNoLoginInfo(store.getState().global)
    })
  }

  handleNoLoginInfo = (reduxGlobal) => {
    const {co_type} = tool.vendor(reduxGlobal)
    if (co_type === undefined || reduxGlobal.vendor_id === '' || reduxGlobal.vendor_id === undefined || reduxGlobal?.vendor_id === '' || reduxGlobal?.printer_id === '') {
      return;
    }
    if (reduxGlobal.store_id === 0)
      return;
    if (reduxGlobal.vendor_id === 0)
      return;
    const flag = reduxGlobal.accessToken === global.noLoginInfo.accessToken &&
      reduxGlobal.currentUser === global.noLoginInfo.currentUser &&
      reduxGlobal.store_id === global.noLoginInfo.store_id &&
      reduxGlobal.host === global.noLoginInfo.host &&
      co_type === global.noLoginInfo.co_type &&
      reduxGlobal.vendor_id === global.noLoginInfo.currVendorId &&
      reduxGlobal?.enabled_good_mgr === global.noLoginInfo.enabledGoodMgr &&
      reduxGlobal?.printer_id === global.noLoginInfo.printer_id

    if (flag) {
      return
    }
    const noLoginInfo = {
      accessToken: reduxGlobal.accessToken,
      currentUser: reduxGlobal.currentUser,
      currStoreId: reduxGlobal.store_id,
      host: reduxGlobal.host || Config.defaultHost,
      co_type: co_type,
      enabledGoodMgr: reduxGlobal.enabled_good_mgr,
      currVendorId: reduxGlobal.vendor_id,
      printer_id: reduxGlobal.printer_id || '0',
      show_bottom_tab: reduxGlobal.show_bottom_tab,
    }
    global.noLoginInfo = noLoginInfo
    setNoLoginInfo(JSON.stringify(noLoginInfo))
  }

  checkVersion = () => {
    HttpUtils.get('/api/check_version', {r: DeviceInfo.getBuildNumber()}).then(res => {
      if (res.yes) {
        Alert.alert('新版本提示', res.desc, [
          {text: '稍等再说', style: 'cancel'},
          {
            text: '现在更新',
            style: 'default',
            onPress: () => {
              downloadApk({
                interval: 250, // listen to upload progress event, emit every 666ms
                apkUrl: res.download_url,
                downloadInstall: true
              }).then();
            }
          },
        ])
      }
    })
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (tool.length(timeObj.method) > 0) {
      const endTime = getTime()
      const startTime = timeObj.method[0].startTime
      timeObj.method.push({
        interfaceName: '',
        executeStatus: 'success',
        startTime: startTime,
        endTime: endTime,
        methodName: 'componentDidUpdate',
        executeTime: endTime - startTime
      })
      const duplicateObj = {...timeObj}
      timeObj.method = []
      calcMs(duplicateObj, this.props.global.accessToken)
    }
  }

  getVendor = () => {
    const {accessToken, currStoreId} = this.props.global;
    if (currStoreId > 0) {
      let api = `/api/get_store_business_status/${currStoreId}?access_token=${accessToken}`
      HttpUtils.get.bind(this.props)(api).then(res => {
        this.setState({
          show_bind_button: tool.length(res.business_status) <= 0,
        })
      })
      api = `/api/get_store_balance/${currStoreId}?access_token=${accessToken}`
      HttpUtils.get.bind(this.props)(api).then(res => {
        if (res.sum < 0) {
          Alert.alert('提醒', '余额不足请充值', [
            {
              text: '取消'
            },
            {
              text: '去充值',
              onPress: () => {
                this.onPress(Config.ROUTE_ACCOUNT_FILL, {
                  onBack: () => {
                    Alert.alert('提醒', '余额不足期间系统自动发单失败，充值成功后，系统将重新自动发单', [
                      {
                        text: '确定'
                      }
                    ])
                  }
                });
              }
            }
          ])
        }
      })
    }

  }

  onRefresh = (status) => {
    // tool.debounces(() => {
    const {isLoading, query} = this.state
    if (GlobalUtil.getOrderFresh() === 2 || isLoading) {
      GlobalUtil.setOrderFresh(1)
      if (isLoading)
        this.setState({isLoading: true})
      return;
    }
    this.setState({
        query: {...query, page: 1, isAdd: true, offset: 0}
      },
      () => this.fetchOrders(status))
    // }, 500)
  }

  // 新订单1  待取货  106   配送中 1
  fetorderNum = () => {
    let {currStoreId, accessToken} = this.props.global;
    let params = {
      search: `store:${currStoreId}`,
    }

    const url = `/v4/wsb_order/order_counts?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, params, true).then(res => {
      const {obj} = res
      timeObj.method.push({
        interfaceName: url,
        startTime: res.startTime,
        endTime: res.endTime,
        executeTime: res.endTime - res.startTime,
        executeStatus: res.executeStatus,
        methodName: 'fetorderNum'
      })
      this.setState({
        orderNum: obj.totals,
      })
    }).catch(error => {
      timeObj.method.push({
        interfaceName: url,
        startTime: error.startTime,
        endTime: error.endTime,
        executeTime: error.endTime - error.startTime,
        executeStatus: error.executeStatus,
        methodName: 'fetorderNum'
      })
    })

  }

  fetchOrders = (queryType, setList = 1) => {
    let {isLoading, query, orderStatus} = this.state;
    if (isLoading || !query.isAdd) {
      return null;
    }
    this.fetorderNum();
    let vendor_id = this.props.global?.vendor_id || global.noLoginInfo.currVendorId
    let {currStoreId, accessToken, user_config} = this.props.global;
    let search = `store:${currStoreId}`;
    let initQueryType = queryType || orderStatus;
    const order_by = user_config && user_config?.order_list_by ? user_config?.order_list_by : 'expectTime asc';

    this.setState({
      orderStatus: initQueryType,
      isLoading: true,
    })

    let params = {
      status: initQueryType,
      vendor_id: vendor_id,
      offset: query.offset,
      limit: query.limit,
      max_past_day: 100,
      search: search,
      use_v2: 1,
      is_right_once: 1, //预订单类型
      order_by: order_by
    }

    if (vendor_id && accessToken) {
      const url = `/v4/wsb_order/order_list?access_token=${accessToken}`;
      HttpUtils.get.bind(this.props)(url, params).then(res => {
        let {ListData, query} = this.state;
        if (tool.length(res.orders) < query.limit) {
          query.isAdd = false;
        }
        query.page++;
        query.listType = initQueryType
        query.offset = Number(query.page - 1) * query.limit;
        this.setState({
          ListData: setList === 1 ? res.orders : ListData.concat(res.orders),
          isLoading: false,
          query: query,
        })
      }, (res) => {
        showError(res.reason);
        this.setState({isLoading: false})
      })
    }

  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  bind_platform = () => {
    this.mixpanel.track("orderpage_authorizestore_click", {});
    this.onPress(Config.PLATFORM_BIND)
  }

  onSelect = (e) => {
    let {showSortModal} = this.state;
    if (e === 1) {
      this.mixpanel.track('V4订单列表_手动下单')
      this.onPress(Config.ROUTE_ORDER_SETTING)
    } else if (e === 0) {
      this.mixpanel.track('V4订单列表_订单排序')
      this.setState({showSortModal: !showSortModal})
    } else {
      this.mixpanel.track('订单列表扫描')
      this.setState({
        scanBoolean: true,
      })
    }
  }

  onScanSuccess = (code) => {
    if (code) {
      ToastLong('加载中')
      const {accessToken} = this.props.global;
      const api = `/v1/new_api/orders/barcode_decode/${code}?access_token=${accessToken}`
      HttpUtils.get.bind(this.props)(api).then((res) => {
        if (res.order_id && Number(res.order_id) > 0) {
          this.onPress(Config.ROUTE_ORDER, {orderId: res.order_id})
        }
      })
    }
  }

  onScanFail = () => {
    ToastLong('编码不合法，请重新扫描')
  }

  closeDeliveryModal = () => {
    this.setState({
      order_id: 0,
      show_delivery_modal: false
    })
  }
  openAddTipModal = (order_id) => {
    this.setState({
      add_tip_id: order_id,
      show_add_tip_modal: true,
      show_delivery_modal: false
    })
  }

  render() {
    const {currStoreId, accessToken} = this.props.global;
    const {is_service_mgr = false} = tool.vendor(this.props.global);
    let {dispatch} = this.props;
    const {
      ListData,
      order_id,
      show_goods_list,
      show_delivery_modal,
      show_add_tip_modal,
      add_tip_id,
    } = this.state

    return (
      <View style={styles.flex1}>

        {/*<FloatServiceIcon fromComponent={'订单列表'}/>*/}
        {this.renderHead()}
        {this.renderStatusTabs()}
        {this.renderContent(ListData)}
        {this.renderSortModal()}
        <HotUpdateComponent accessToken={accessToken} currStoreId={currStoreId}/>
        <RemindModal dispatch={dispatch} onPress={this.onPress.bind(this)} accessToken={accessToken}
                     currStoreId={currStoreId}/>
        <GoodsListModal
          setState={this.setState.bind(this)}
          onPress={this.onPress.bind(this)}
          is_service_mgr={is_service_mgr}
          accessToken={accessToken}
          order_id={order_id}
          currStoreId={currStoreId}
          show_goods_list={show_goods_list}/>

        <DeliveryStatusModal
          order_id={order_id}
          store_id={currStoreId}
          fetchData={this.onRefresh.bind(this)}
          onPress={this.onPress.bind(this)}
          openAddTipModal={this.openAddTipModal.bind(this)}
          accessToken={accessToken}
          show_modal={show_delivery_modal}
          onClose={this.closeDeliveryModal}
        />

        <AddTipModal
          setState={this.setState.bind(this)}
          accessToken={accessToken}
          id={add_tip_id}
          orders_add_tip={true}
          dispatch={dispatch}
          show_add_tip_modal={show_add_tip_modal}/>

        {/*<Scanner visible={scanBoolean} title="返回"*/}
        {/*         onClose={() => this.setState({scanBoolean: false})}*/}
        {/*         onScanSuccess={code => this.onScanSuccess(code)}*/}
        {/*         onScanFail={code => this.onScanFail(code)}/>*/}
      </View>
    );
  }

  closeModal = () => {
    this.setState({
      showSortModal: false
    })
  }

  setOrderBy = (order_by) => {
    if(order_by === 'orderTime desc'){
      this.mixpanel.track('V4订单列表_最新来单')
    }else if(order_by === 'orderTime asc'){
      this.mixpanel.track('V4订单列表_最早来单')
    }else {
      this.mixpanel.track('V4订单列表_送达时间')
    }
    let {user_config} = this.props.global
    let {dispatch} = this.props
    user_config.order_list_by = order_by
    dispatch(setUserCfg(user_config));
  }

  renderSortModal = () => {
    let {user_config} = this.props.global;
    let sort = user_config?.order_list_by ? user_config?.order_list_by : 'expectTime asc';
    let {showSortModal, sort_list} = this.state;
    return (
      <JbbModal visible={showSortModal} HighlightStyle={{padding: 0}} modalStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={'bottom'}>
        <View style={{marginBottom: 20}}>
          <View style={{flexDirection: 'row', padding: 12, justifyContent: 'space-between'}}>
            <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
              订单排序
            </Text>
            <Entypo onPress={this.closeModal} name="cross"
                    style={{backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray}}/>
          </View>
          <View style={{paddingHorizontal: 12, paddingVertical: 5}}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              justifyContent: "space-around",
              flexWrap: "wrap"
            }}>
              <For index='index' each='info' of={sort_list}>
                <TouchableOpacity key={index} style={{
                  borderWidth: 0.5,
                  borderColor: info.value === sort ? colors.main_color : colors.colorDDD,
                  backgroundColor: info.value === sort ? '#DFFAE2' : colors.white,
                  width: width * 0.25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 4,
                  paddingVertical: 14,
                  marginVertical: 5
                }} onPress={() => this.setOrderBy(info.value)}>
                  <Text key={index}
                        style={{
                          fontSize: 14,
                          color: info.value === sort ? colors.main_color : colors.color333,
                          fontWeight: info.value === sort ? '500' : '400'
                        }}
                        onPress={() => this.setOrderBy(info.value)}>
                    {info.label}
                  </Text>
                </TouchableOpacity>
              </For>
            </View>
            <Button title={'确 定'}
                    onPress={() => {
                      this.onRefresh()
                      this.closeModal()
                    }}
                    buttonStyle={[{backgroundColor: colors.main_color, borderRadius: 24, height: 48}]}
                    titleStyle={{color: colors.f7, fontWeight: '500', fontSize: 20, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }

  onCanChangeStore = (item) => {
    showModal("切换店铺中...")
    tool.debounces(() => {
      const {dispatch, global, navigation} = this.props;
      const {accessToken} = global;
      dispatch(getConfig(accessToken, item?.id, (ok, msg, obj) => {
        if (ok) {
          tool.resetNavStack(navigation, Config.ROUTE_ALERT, {
            initTab: Config.ROUTE_ORDERS,
            initialRouteName: Config.ROUTE_ALERT
          });
          hideModal()
        } else {
          ToastLong(msg);
          hideModal()
        }
      }));
    })
  }

  renderHead = () => {
    let {store_info} = this.props.global;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        width: width,
        backgroundColor: colors.white,
        paddingHorizontal: 12
      }}>
        <SvgXml style={{height: 44, marginRight: 16}} onPress={() => {
          this.mixpanel.track('V4订单列表_我的')
          this.onPress(Config.ROUTE_MINE_NEW)
        }}
                xml={menu_left()}/>

        <TouchableOpacity onPress={() => {
          this.onPress(Config.ROUTE_STORE_SELECT, {onBack: (item) => this.onCanChangeStore(item)})
        }}
                          style={{height: 44, flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: 15, color: colors.color333}}>
            {tool.jbbsubstr(store_info?.name, 8)}
          </Text>
          <SvgXml xml={this_down()}/>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.mixpanel.track('V4订单列表_搜索')
            this.onPress(Config.ROUTE_ORDER_SEARCH)
          }}
          style={{height: 44, width: 40, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
          <SvgXml xml={search_icon()}/>
        </TouchableOpacity>

        <ModalDropdown
          dropdownStyle={styles.modalDropDown}
          dropdownTextStyle={styles.modalDropDownText}
          dropdownTextHighlightStyle={{color: colors.color333}}
          options={['订单排序', '手动下单']}
          defaultValue={''}
          onSelect={(e) => this.onSelect(e)}
        >
          <View style={{height: 44, width: 40, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
            <Entypo name={"dots-three-horizontal"} style={{fontSize: 20, color: colors.color333}}/>
          </View>
        </ModalDropdown>

      </View>
    )
  }

  renderStatusTabs = () => {
    let {orderStatus, orderNum, categoryLabels} = this.state;
    const tab_width = 1 / tool.length(categoryLabels);
    if (!tool.length(categoryLabels) > 0) {
      return;
    }
    return (
      <View style={styles.statusTab}>
        <For index="i" each='tab' of={categoryLabels}>
          <TouchableOpacity
            key={i}
            style={{width: tab_width * width, alignItems: "center"}}
            onPress={() => this.onRefresh(tab.status)}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingTop: 10,
            }}>
              <Text style={[styles.f14c33, {
                fontWeight: orderStatus === tab.status ? "bold" : "normal",
                color: orderStatus === tab.status ? colors.main_color : colors.color333
              }]}>
                {orderNum[tab.status] > 0 ? orderNum[tab.status] > 999 ? '999+' : orderNum[tab.status] : '-'}
              </Text>
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingBottom: 10,
            }}>
              <Text style={[styles.f14c33, {
                fontWeight: orderStatus === tab.status ? "bold" : "normal",
                color: orderStatus === tab.status ? colors.main_color : colors.color333
              }]}>
                {tab.tabname}
              </Text>
            </View>
            <If condition={orderStatus === tab.status}>
              <View style={styles.statusTabRight}/>
            </If>
          </TouchableOpacity>
        </For>
      </View>
    )
  }

  onTouchStart = (e) => {
    this.pageX = e.nativeEvent.pageX;
    this.pageY = e.nativeEvent.pageY;
  }
  onEndReached = () => {
    if (this.state.isCanLoadMore) {
      this.setState({isCanLoadMore: false}, () => this.listmore())
    }
  }
  onMomentumScrollBegin = () => {
    this.setState({isCanLoadMore: true})
  }
  onTouchMove = (e) => {
    if (Math.abs(this.pageY - e.nativeEvent.pageY) > Math.abs(this.pageX - e.nativeEvent.pageX)) {
      this.setState({scrollLocking: true});
    } else {
      this.setState({scrollLocking: false});
    }
  }
  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }
  _getItemLayout = (data, index) => {
    return {length: pxToDp(250), offset: pxToDp(250) * index, index}
  }
  _keyExtractor = (item) => {
    return item.id.toString();
  }


  renderContent = (orders) => {
    let {isLoading} = this.state;
    return (
      <View style={styles.orderListContent}>
        <FlatList
          data={orders}
          legacyImplementation={false}
          directionalLockEnabled={true}
          onTouchStart={(e) => this.onTouchStart(e)}
          onEndReachedThreshold={0.3}
          onEndReached={this.onEndReached}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          onTouchMove={(e) => this.onTouchMove(e)}
          renderItem={this.renderItem}
          onRefresh={this.onRefresh}
          refreshing={isLoading}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
          ListEmptyComponent={this.renderNoOrder()}
          initialNumToRender={5}
        />
      </View>
    );
  }

  listmore = () => {
    if (this.state.query.isAdd) {
      this.fetchOrders(this.state.orderStatus, 0);
    }
  }


  renderItem = (order) => {
    let {item, index} = order;
    let {orderStatus} = this.state;
    let {accessToken} = this.props.global
    return (
      <OrderItem showBtn={item?.show_button_list}
                 key={index}
                 fetchData={() => this.onRefresh()}
                 item={item}
                 accessToken={accessToken}
                 navigation={this.props.navigation}
                 setState={this.setState.bind(this)}
                 orderStatus={orderStatus}
      />
    );
  }

  renderNoOrder = () => {
    let {is_service_mgr, allow_merchants_store_bind} = tool.vendor(this.props.global);
    let {show_bind_button} = this.state;
    return (
      <View style={styles.noOrderContent}>
        <SvgXml xml={empty_data()}/>
        <If condition={!show_bind_button}>
          <Text style={styles.noOrderDesc}>暂无订单</Text>
        </If>

        <If condition={show_bind_button && (allow_merchants_store_bind || is_service_mgr)}>

          <Text style={styles.noOrderDesc}>暂无绑定外卖店铺</Text>
          <Button title={'去绑定'}
                  onPress={() => this.bind_platform()}
                  buttonStyle={styles.noOrderBtn}
                  titleStyle={styles.noOrderBtnTitle}
          />
        </If>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  flex1: {flex: 1},
  modalDropDown: {
    width: 128,
    height: 100,
    backgroundColor: colors.white,
    borderColor: colors.colorDDD,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  modalDropDownText: {
    textAlignVertical: 'center',
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    lineHeight: 23,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.color333,
  },
  statusTab: {flexDirection: 'row', backgroundColor: colors.white, height: 56},
  f14c33: {
    color: colors.color333,
    fontSize: 14
  },
  statusTabRight: {height: 2, width: 48, backgroundColor: colors.main_color},
  orderListContent: {flex: 1, backgroundColor: colors.f5,},
  sortSelect: {fontSize: 12, fontWeight: 'bold', backgroundColor: colors.white},
  noOrderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 80,
  },
  noOrderDesc: {
    fontSize: 15,
    marginTop: 9,
    marginBottom: 20,
    color: colors.color999
  },
  noOrderBtn: {
    width: 180,
    borderRadius: 20,
    backgroundColor: colors.main_color,
    paddingVertical: 10,
    marginTop: 20
  },
  noOrderBtnTitle: {
    color: colors.white,
    fontSize: 16
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderListScene)
