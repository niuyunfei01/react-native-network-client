import React, {Component} from 'react'
import {
  Dimensions,
  FlatList,
  InteractionManager,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Button} from "react-native-elements";
import {SvgXml} from "react-native-svg";
import PropTypes from "prop-types";
import ModalDropdown from "react-native-modal-dropdown";
import * as globalActions from '../../reducers/global/globalActions'
import {getConfig, setOrderListBy} from '../../reducers/global/globalActions'
import {getImRemindCount, getStoreImConfig, setImRemindCount} from '../../reducers/im/imActions'

import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import Config from "../../pubilc/common/config";
import tool from "../../pubilc/util/tool";
import pxToDp from '../../pubilc/util/pxToDp';
import {MixpanelInstance} from '../../pubilc/util/analytics';
import {hideModal, showError, showModal, ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import {cross_icon, down, empty_data, menu, menu_left, search_icon} from "../../svg/svg";
import HotUpdateComponent from "../../pubilc/component/HotUpdateComponent";
import RemindModal from "../../pubilc/component/remindModal";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";
import {getTime} from "../../pubilc/util/TimeUtil";
import JbbModal from "../../pubilc/component/JbbModal";
import OrderItem from "../../pubilc/component/OrderItem";
import GoodsListModal from "../../pubilc/component/GoodsListModal";
import AddTipModal from "../../pubilc/component/AddTipModal";
import DeliveryStatusModal from "../../pubilc/component/DeliveryStatusModal";
import CancelDeliveryModal from "../../pubilc/component/CancelDeliveryModal";
import JbbAlert from "../../pubilc/component/JbbAlert";

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

const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}

class OrderListScene extends Component {
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
    this.list_ref = undefined;
    const {order_status} = props.route.params || {}
    this.state = {
      isLoading: false,
      categoryLabels: [
        {tabname: '新订单', num: 0, status: 9},
        {tabname: '待接单', num: 0, status: 10},
        {tabname: '待取货', num: 0, status: 2},
        {tabname: '配送中', num: 0, status: 3},
        {tabname: '异常', num: 0, status: 8},
        {tabname: '退款', num: 0, status: 11},
      ],
      query: {
        listType: null,
        offset: 0,
        page: 1,
        limit: 10,
        maxPastDays: 100,
        is_add: true,
      },
      sort_list: [
        {"label": '最新来单', 'value': 'orderTime desc'},
        {"label": '最早来单', 'value': 'orderTime asc'},
        {"label": '送达时间', 'value': 'expectTime asc'},
      ],
      ListData: [],
      order_status: order_status ?? 9,
      show_sort_modal: false,
      show_bind_button: false,
      orderNum: {},
      is_can_load_more: false,
      scanBoolean: false,
      order_id: 0,
      show_goods_list: false,
      add_tip_id: 0,
      show_add_tip_modal: false,
      show_delivery_modal: false,
      show_cancel_delivery_modal: false,
      show_finish_delivery_modal: false,
      orders_add_tip: true,
    };
  }


  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    const {navigation, device} = this.props
    timeObj.method[0].endTime = getTime()
    timeObj.method[0].executeTime = timeObj.method[0].endTime - timeObj.method[0].startTime
    timeObj.method[0].executeStatus = 'success'
    timeObj.method[0].interfaceName = ""
    timeObj.method[0].methodName = "componentDidMount"
    const {store_id, currentUser, accessToken, is_record_request_monitor} = this.props.global;
    const {deviceInfo} = device
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = store_id
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderListScene"
    timeObj['is_record_request_monitor'] = is_record_request_monitor
    calcMs(timeObj, accessToken)
    this.getVendor()
    this.focus = navigation.addListener('focus', () => {
      this.onRefresh()
    })
    global.navigation = navigation
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
    const {accessToken, store_id} = this.props.global;
    if (store_id > 0) {
      let api = `/api/get_store_business_status/${store_id}?access_token=${accessToken}`
      HttpUtils.get.bind(this.props)(api).then(res => {
        this.setState({
          show_bind_button: tool.length(res.business_status) <= 0,
        })
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

    if (status && this.list_ref) {
      this.list_ref.scrollToOffset({index: 0, viewPosition: 0, animated: true})
    }
    this.setState({
        query: {...query, page: 1, is_add: true, offset: 0}
      },
      () => this.fetchOrders(status))
    // }, 500)
  }

  // 新订单1  待取货  106   配送中 1
  fetorderNum = () => {
    let {store_id, accessToken} = this.props.global;
    let params = {
      search: `store:${store_id}`,
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
    let {isLoading, query, order_status} = this.state;
    if (isLoading || !query.is_add) {
      return null;
    }
    this.fetorderNum();
    let vendor_id = this.props.global?.vendor_id || global.noLoginInfo.currVendorId
    let {store_id, accessToken, order_list_by = 'expectTime asc'} = this.props.global;
    let search = `store:${store_id}`;
    let initQueryType = queryType || order_status;

    this.setState({
      order_status: initQueryType,
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
      order_by: order_list_by
    }
    if (vendor_id && accessToken) {
      const url = `/v4/wsb_order/order_list?access_token=${accessToken}`;
      HttpUtils.get.bind(this.props)(url, params).then(res => {
        let {ListData, query} = this.state;
        if (tool.length(res.orders) < query.limit) {
          query.is_add = false;
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
    let {show_sort_modal} = this.state;
    if (e === 1) {
      this.mixpanel.track('V4订单列表_手动下单')
      this.onPress(Config.ROUTE_ORDER_SETTING)
    } else if (e === 0) {
      this.mixpanel.track('V4订单列表_订单排序')
      this.setState({show_sort_modal: !show_sort_modal})
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
          this.onPress(Config.ROUTE_ORDER_NEW, {orderId: res.order_id})
        }
      })
    }
  }

  openAddTipModal = (add_tip_id, orders_add_tip = true) => {
    this.setState({
      add_tip_id: add_tip_id,
      orders_add_tip: orders_add_tip,
      show_add_tip_modal: true,
      show_delivery_modal: false
    })
  }


  openCancelDeliveryModal = (order_id) => {
    this.setState({
      order_id: order_id,
      show_cancel_delivery_modal: true,
      show_finish_delivery_modal: false,
      show_delivery_modal: false,
    })
  }

  openFinishDeliveryModal = (order_id) => {
    this.setState({
      order_id: order_id,
      show_delivery_modal: false,
      show_cancel_delivery_modal: false,
    }, () => {
      JbbAlert.show({
        title: '当前配送确认完成吗?',
        desc: '订单送达后无法撤回，请确认顾客已收到货物',
        actionText: '确定',
        closeText: '再想想',
        onPress: this.toSetOrderComplete,
      })
    })
  }


  render() {
    const {store_id, accessToken} = this.props.global;
    let {dispatch} = this.props;
    const {
      order_id,
      show_goods_list,
      show_delivery_modal,
      show_add_tip_modal,
      show_cancel_delivery_modal,
      add_tip_id,
      order_status,
      orders_add_tip,
    } = this.state

    return (
      <View style={styles.flex1}>
        {/*<FloatServiceIcon fromComponent={'订单列表'}/>*/}
        {this.renderHead()}
        {this.renderStatusTabs()}
        {this.renderContent()}
        {this.renderSortModal()}
        <HotUpdateComponent accessToken={accessToken} store_id={store_id}/>
        <RemindModal dispatch={dispatch} onPress={this.onPress.bind(this)} accessToken={accessToken}
                     store_id={store_id}/>
        <GoodsListModal
          setState={this.setState.bind(this)}
          onPress={this.onPress.bind(this)}
          accessToken={accessToken}
          order_id={order_id}
          store_id={store_id}
          show_goods_list={show_goods_list}/>

        <DeliveryStatusModal
          order_id={order_id}
          order_status={order_status}
          store_id={store_id}
          fetchData={this.onRefresh.bind(this)}
          onPress={this.onPress.bind(this)}
          openAddTipModal={this.openAddTipModal.bind(this)}
          openCancelDeliveryModal={this.openCancelDeliveryModal.bind(this)}
          openFinishDeliveryModal={this.openFinishDeliveryModal.bind(this)}
          accessToken={accessToken}
          show_modal={show_delivery_modal}
          onClose={this.closeModal}
        />

        <CancelDeliveryModal
          order_id={order_id}
          ship_id={0}
          accessToken={accessToken}
          show_modal={show_cancel_delivery_modal}
          fetchData={this.onRefresh.bind(this)}
          onPress={this.onPress.bind(this)}
          onClose={this.closeModal}
        />

        <AddTipModal
          setState={this.setState.bind(this)}
          fetchData={this.onRefresh.bind(this)}
          accessToken={accessToken}
          id={add_tip_id}
          orders_add_tip={orders_add_tip}
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
      order_id: 0,
      show_delivery_modal: false,
      show_cancel_delivery_modal: false,
      show_sort_modal: false,
    })
  }

  toSetOrderComplete = () => {
    this.closeModal();
    let {accessToken} = this.props.global;
    let {order_id} = this.state;
    const api = `/api/complete_order/${order_id}?access_token=${accessToken}`
    HttpUtils.get(api).then(() => {
      ToastLong('订单已送达')
      this.fetchOrders()
    }).catch(() => {
      ToastShort('“配送完成失败，请稍后重试”')
    })
  }


  setOrderBy = (order_by) => {
    if (order_by === 'orderTime desc') {
      this.mixpanel.track('V4订单列表_最新来单')
    } else if (order_by === 'orderTime asc') {
      this.mixpanel.track('V4订单列表_最早来单')
    } else {
      this.mixpanel.track('V4订单列表_送达时间')
    }
    let {dispatch} = this.props
    dispatch(setOrderListBy(order_by));
  }

  renderSortModal = () => {
    let {order_list_by = 'expectTime asc'} = this.props.global;
    let {show_sort_modal, sort_list} = this.state;
    return (
      <JbbModal visible={show_sort_modal} HighlightStyle={{padding: 0}} modalStyle={{padding: 0}}
                onClose={this.closeModal}
                modal_type={'bottom'}>
        <View style={{marginBottom: 20}}>
          <View style={{flexDirection: 'row', padding: 12, justifyContent: 'space-between'}}>
            <Text style={{color: colors.color333, fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>
              订单排序
            </Text>

            <SvgXml onPress={this.closeModal} xml={cross_icon()}/>

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
                  borderColor: info.value === order_list_by ? colors.main_color : colors.colorDDD,
                  backgroundColor: info.value === order_list_by ? '#DFFAE2' : colors.white,
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
                          color: info.value === order_list_by ? colors.main_color : colors.color333,
                          fontWeight: info.value === order_list_by ? 'bold' : '400'
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
                    titleStyle={{color: colors.f7, fontWeight: 'bold', fontSize: 20, lineHeight: 28}}/>
          </View>
        </View>
      </JbbModal>
    )
  }

  onCanChangeStore = (item) => {
    showModal("切换店铺中...")
    const {dispatch, global} = this.props;
    const {accessToken} = global;
    dispatch(getConfig(accessToken, item?.id, (ok, msg, obj) => {
      if (ok) {
        tool.debounces(() => {
          hideModal()
          this.onRefresh(9)
        })
      } else {
        ToastLong(msg);
        hideModal()
      }
    }));
    dispatch(getStoreImConfig(accessToken, item?.id));
    dispatch(getImRemindCount(accessToken, item?.id, (ok, msg, obj) => {
      if (ok) {
        hideModal()
        dispatch(setImRemindCount(obj.message_count))
      } else {
        ToastLong(msg);
        hideModal()
      }
    }))
  }

  navigationToChangeStore = () => {
    let {only_one_store} = this.props.global;
    if (only_one_store) {
      return;
    }
    GlobalUtil.setOrderFresh(2)
    this.onPress(Config.ROUTE_STORE_SELECT, {onBack: (item) => this.onCanChangeStore(item)})
  }

  renderHead = () => {
    let {store_info, only_one_store} = this.props.global;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        width: width,
        backgroundColor: colors.white,
      }}>
        <SvgXml style={{height: 44, marginRight: 16, marginLeft: 12}} onPress={() => {
          this.mixpanel.track('V4订单列表_我的')
          this.onPress(Config.ROUTE_MINE_NEW, {show_back_icon: true})
        }}
                xml={menu_left()}/>

        <TouchableOpacity onPress={() => this.navigationToChangeStore()}
                          style={{height: 44, flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: 15, color: colors.color333, fontWeight: 'bold'}}>
            {tool.jbbsubstr(store_info?.name, 12)}&nbsp;
          </Text>
          <If condition={!only_one_store}>
            <SvgXml xml={down(16, 16, colors.color333)}/>
          </If>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            this.mixpanel.track('V4订单列表_搜索')
            this.onPress(Config.ROUTE_SEARCH_ORDER, {search_store_id: store_info?.id})
          }}
          style={{height: 44, width: 40, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
          <SvgXml xml={search_icon()}/>
        </TouchableOpacity>

        <ModalDropdown
          dropdownStyle={styles.modalDropDown}
          dropdownTextStyle={styles.modalDropDownText}
          dropdownTextHighlightStyle={{color: colors.color333}}
          style={{paddingRight: 12}}
          options={['订单排序', '手动下单']}
          defaultValue={''}
          onSelect={(e) => this.onSelect(e)}
        >
          <View style={{height: 44, width: 40, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
            <SvgXml xml={menu()}/>
          </View>
        </ModalDropdown>

      </View>
    )
  }

  renderStatusTabs = () => {
    let {order_status, orderNum, categoryLabels} = this.state;
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
                fontWeight: order_status === tab.status ? "bold" : "normal",
                color: order_status === tab.status ? colors.main_color : colors.color333
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
                fontWeight: order_status === tab.status ? "bold" : "normal",
                color: order_status === tab.status ? colors.main_color : colors.color333
              }]}>
                {tab.tabname}
              </Text>
            </View>
            <If condition={order_status === tab.status}>
              <View style={styles.statusTabRight}/>
            </If>
          </TouchableOpacity>
        </For>
      </View>
    )
  }

  onEndReached = () => {
    if (this.state.is_can_load_more && this.state.query.is_add) {
      this.setState({is_can_load_more: false}, () => {
        this.fetchOrders(this.state.order_status, 0);
      })
    }
  }
  onMomentumScrollBegin = () => {
    if (this.state.query.is_add) {
      this.setState({is_can_load_more: true})
    }
  }
  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }
  _keyExtractor = (item) => {
    return item.id.toString();
  }

  _getItemLayout = (data, index) => {
    return {length: 340, offset: 340 * index, index}
  }

  renderContent = () => {
    let {isLoading, ListData} = this.state;
    return (
      <View style={styles.orderListContent}>
        <FlatList
          data={ListData}
          legacyImplementation={false}
          directionalLockEnabled={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={this.onEndReached}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          renderItem={this.renderItem}
          onRefresh={this.onRefresh}
          ref={(ref) => {
            this.list_ref = ref
          }}
          refreshing={isLoading}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          ListEmptyComponent={this.renderNoOrder()}
          ListFooterComponent={this.renderBottomView()}
          getItemLayout={this._getItemLayout}
          initialNumToRender={3}
        />
      </View>
    );
  }

  renderBottomView = () => {
    let {query, ListData} = this.state;
    if (query?.is_add || tool.length(ListData) < 3) {
      return <View/>
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10}}>
        <Text style={{fontSize: 14, color: colors.color999}}> 已经到底了～ </Text>
      </View>
    )
  }

  renderItem = (order) => {
    let {item, index} = order;
    let {order_status} = this.state;
    let {accessToken, vendor_id} = this.props.global
    return (
      <OrderItem showBtn={item?.show_button_list}
                 key={index}
                 vendor_id={vendor_id}
                 fetchData={() => this.onRefresh()}
                 item={item}
                 accessToken={accessToken}
                 navigation={this.props.navigation}
                 setState={this.setState.bind(this)}
                 openCancelDeliveryModal={this.openCancelDeliveryModal.bind(this)}
                 openFinishDeliveryModal={this.openFinishDeliveryModal.bind(this)}
                 order_status={order_status}
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.colorDDD,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    elevation: 5,
    shadowRadius: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    marginTop: -StatusBar.currentHeight,
  },
  modalDropDownText: {
    textAlignVertical: 'center',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.color333,
  },
  statusTab: {flexDirection: 'row', backgroundColor: colors.white, height: 56},
  f14c33: {
    color: colors.color333,
    fontSize: 14
  },
  statusTabRight: {
    height: 2,
    width: 42,
    backgroundColor: colors.main_color,
    position: 'absolute', bottom: 0
  },
  orderListContent: {flex: 1, backgroundColor: colors.f5},
  sortSelect: {fontSize: 12, fontWeight: 'bold', backgroundColor: colors.white},
  noOrderContent: {
    alignItems: 'center',
    justifyContent: 'center',
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
