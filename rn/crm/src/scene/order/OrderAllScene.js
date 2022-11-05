import React, {Component} from 'react'
import {Dimensions, FlatList, InteractionManager, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {SvgXml} from "react-native-svg";
import PropTypes from "prop-types";
import * as globalActions from '../../reducers/global/globalActions'

import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import Config from "../../pubilc/common/config";
import tool from "../../pubilc/util/tool";
import pxToDp from '../../pubilc/util/pxToDp';
import {MixpanelInstance} from '../../pubilc/util/analytics';
import {showError, ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import {back, empty_data, search_icon, this_down, this_up} from "../../svg/svg";
import OrderItem from "../../pubilc/component/OrderItem";
import GoodsListModal from "../../pubilc/component/GoodsListModal";
import AddTipModal from "../../pubilc/component/AddTipModal";
import DeliveryStatusModal from "../../pubilc/component/DeliveryStatusModal";
import CancelDeliveryModal from "../../pubilc/component/CancelDeliveryModal";
import AlertModal from "../../pubilc/component/AlertModal";
import TopModal from "../../pubilc/component/TopModal";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import TopSelectModal from "../../pubilc/component/TopSelectModal";

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
  query: {
    listType: null,
    offset: 0,
    page: 1,
    limit: 10,
    maxPastDays: 100,
    isAdd: true,
  },
  ListData: [],
  orderStatus: 9,
  search_date: new Date(),
  search_status: 0,
  search_type: 0,
  search_platform: 0,
  date_desc: dayjs(new Date()).format('MM-DD'),
  status_desc: '状态',
  type_desc: '类型',
  platform_desc: '平台',
  status_list: [
    {label: '全部', value: 0},
    {label: '进行中', value: 1},
    {label: '已完成', value: 2},
    {label: '已取消', value: 3},
  ],
  type_list: [
    {label: '全部', value: 0},
    {label: '即时单', value: 1},
    {label: '预约单', value: 2},
  ],
  platform_list: [
    {label: '全部', value: 0},
    {label: '美团', value: 1},
    {label: '饿了么', value: 2},
    {label: '京东到家', value: 3},
    {label: '自定义', value: 4},
  ],
  check_list: [],
  check_item: '',
  order_id: 0,
  add_tip_id: 0,
  isCanLoadMore: false,
  show_goods_list: false,
  show_add_tip_modal: false,
  show_delivery_modal: false,
  show_cancel_delivery_modal: false,
  show_finish_delivery_modal: false,
  show_select_store_modal: false,
  show_condition_modal: 0,
  show_date_modal: false,
};

class OrderAllScene extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    device: PropTypes.object,
  }
  state = initState;

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    GlobalUtil.setOrderFresh(1)
  }


  componentWillUnmount() {
    this.focus()
    this.blur()
  }

  componentDidMount() {
    const {navigation} = this.props
    this.focus = navigation.addListener('focus', () => {
      this.onRefresh()
    })
    this.blur = navigation.addListener('blur', () => {
      this.closeModal()
    })
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
        query: {...query, page: 1, isAdd: true, offset: 0},
      },
      () => this.fetchOrders(status))
    // }, 500)
  }

  fetchOrders = (queryType, setList = 1) => {
    let {isLoading, query, orderStatus} = this.state;
    if (isLoading || !query.isAdd) {
      return null;
    }
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

  openAddTipModal = (order_id) => {
    this.setState({
      add_tip_id: order_id,
      show_add_tip_modal: true,
      show_delivery_modal: false
    })
  }

  openCancelDeliveryModal = (order_id) => {
    this.setState({
      order_id: order_id,
      show_cancel_delivery_modal: true,
      show_delivery_modal: false
    })
  }

  openFinishDeliveryModal = (order_id) => {
    this.setState({
      order_id: order_id,
      show_finish_delivery_modal: true,
      show_delivery_modal: false
    })
  }

  closeModal = () => {
    this.setState({
      order_id: 0,
      show_condition_modal: 0,
      show_delivery_modal: false,
      show_cancel_delivery_modal: false,
      show_finish_delivery_modal: false,
      show_select_store_modal: false,
      show_date_modal: false,
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


  checkDatePicker = (date) => {
    this.setState({
      search_date: date,
      date_desc: dayjs(date).format('MM-DD'),
      show_date_modal: false,
      is_right_once: 0,
    })
  };
  checkItem = (item) => {
    let {show_condition_modal} = this.state;
    let params = {};
    switch (show_condition_modal) {
      case 2:
        params = {
          show_condition_modal: 0,
          search_status: item?.value,
          status_desc: item?.value === 0 ? '状态' : item?.label,
        }
        break;
      case 3:
        params = {
          show_condition_modal: 0,
          search_type: item?.value,
          type_desc: item?.value === 0 ? '类型' : item?.label,
        }
        break;
      case 4:
        params = {
          show_condition_modal: 0,
          search_platform: item?.value,
          platform_desc: item?.value === 0 ? '平台' : item?.label,
        }
        break;
    }
    this.setState(params)
  }

  render() {
    const {currStoreId, accessToken} = this.props.global;
    let {dispatch} = this.props;
    const {
      ListData,
      order_id,
      show_goods_list,
      show_delivery_modal,
      show_add_tip_modal,
      show_cancel_delivery_modal,
      show_select_store_modal,
      show_condition_modal,
      show_date_modal,
      search_date,
      add_tip_id,
      check_list,
      check_item
    } = this.state
    return (
      <View style={styles.flex1}>
        {this.renderHead()}

        <TopSelectModal list={check_list}
                        onPress={this.checkItem.bind(this)}
                        default_val={check_item}
                        onClose={this.closeModal.bind(this)}
                        visible={show_select_store_modal}
                        marTop={80}
        />

        {this.renderConditionTabs()}
        <TopSelectModal list={check_list}
                        onPress={this.checkItem.bind(this)}
                        default_val={check_item}
                        onClose={this.closeModal.bind(this)}
                        visible={show_condition_modal > 0}
                        marTop={80}
        />

        {this.renderContent(ListData)}

        <DatePicker
          confirmText={'确定'}
          cancelText={'取消'}
          title={'日期'}
          modal
          mode={'date'}
          textColor={colors.color666}
          open={show_date_modal}
          date={search_date}
          minimumDate={dayjs(new Date()).subtract(90, 'day').toDate()}
          maximumDate={new Date()}
          onConfirm={(date) => {
            this.checkDatePicker(date)
          }}
          onCancel={() => {
            this.closeModal()
          }}
        />

        {this.renderFinishDeliveryModal()}
        <GoodsListModal
          setState={this.setState.bind(this)}
          onPress={this.onPress.bind(this)}
          accessToken={accessToken}
          order_id={order_id}
          currStoreId={currStoreId}
          show_goods_list={show_goods_list}/>
        <DeliveryStatusModal
          order_id={order_id}
          order_status={0}
          store_id={currStoreId}
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
          accessToken={accessToken}
          id={add_tip_id}
          orders_add_tip={true}
          dispatch={dispatch}
          show_add_tip_modal={show_add_tip_modal}/>

      </View>
    );
  }

  renderConditionTabs = () => {
    let {
      date_desc,
      status_desc,
      status_list,
      search_status,
      type_desc,
      type_list,
      search_type,
      platform_desc,
      platform_list,
      search_platform,
      show_condition_modal,
      show_date_modal
    } = this.state;
    return (
      <View style={styles.statusTab}>
        <TouchableOpacity
          style={{width: 0.25 * width, alignItems: "center"}}
          onPress={() => {
            this.setState({
              show_date_modal: true,
            })
          }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 14,
          }}>
            <Text style={styles.f14c33}> {date_desc} </Text>
            <SvgXml xml={show_date_modal ? this_up() : this_down()}/>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{width: 0.25 * width, alignItems: "center"}}
          onPress={() => {
            this.setState({
              show_condition_modal: show_condition_modal === 2 ? 0 : 2,
              check_list: status_list,
              check_item: search_status
            })
          }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 14,
          }}>
            <Text style={styles.f14c33}> {status_desc} </Text>
            <SvgXml xml={show_condition_modal === 2 ? this_up() : this_down()}/>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{width: 0.25 * width, alignItems: "center"}}
          onPress={() => {
            this.setState({
              show_condition_modal: show_condition_modal === 3 ? 0 : 3,
              check_list: type_list,
              check_item: search_type
            })
          }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 14,
          }}>
            <Text style={styles.f14c33}> {type_desc} </Text>
            <SvgXml xml={show_condition_modal === 3 ? this_up() : this_down()}/>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{width: 0.25 * width, alignItems: "center"}}
          onPress={() => {
            this.setState({
              show_condition_modal: show_condition_modal === 4 ? 0 : 4,
              check_list: platform_list,
              check_item: search_platform
            })
          }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 14,
          }}>
            <Text style={styles.f14c33}> {platform_desc} </Text>
            <SvgXml xml={show_condition_modal === 4 ? this_up() : this_down()}/>
          </View>
        </TouchableOpacity>
      </View>
    )
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

  renderHead = () => {
    let {store_info, only_one_store} = this.props.global;
    let {show_select_store_modal} = this.state;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        width: width,
        backgroundColor: colors.white,
        paddingHorizontal: 12,
      }}>
        <SvgXml style={{height: 44, marginRight: 16}} onPress={() => {
          this.props.navigation.goBack()
        }} xml={back()}/>

        <TouchableOpacity onPress={() => {
          if (only_one_store) {
            return;
          }
          this.setState({
            show_select_store_modal: !show_select_store_modal,
            show_condition_modal: 0
          })
          return;
        }} style={{height: 44, flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: 15, color: colors.color333}}>{tool.jbbsubstr(store_info?.name, 12)} </Text>
          <If condition={!only_one_store}>
            <SvgXml xml={show_select_store_modal ? this_up() : this_down()}/>
          </If>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            this.mixpanel.track('V4订单列表_搜索')
            this.onPress(Config.ROUTE_ORDER_SEARCH)
          }}
          style={{
            height: 44,
            width: 40,
            paddingHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
          <SvgXml xml={search_icon()}/>
        </TouchableOpacity>

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
          contentContainerStyle={{flexGrow: 1}}
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
    let {accessToken} = this.props.global
    return (
      <OrderItem showBtn={item?.show_button_list}
                 key={index}
                 fetchData={() => this.onRefresh()}
                 item={item}
                 accessToken={accessToken}
                 navigation={this.props.navigation}
                 setState={this.setState.bind(this)}
                 openCancelDeliveryModal={this.openCancelDeliveryModal.bind(this)}
                 openFinishDeliveryModal={this.openFinishDeliveryModal.bind(this)}
                 orderStatus={0}
      />
    );
  }

  renderNoOrder = () => {
    return (
      <View style={styles.noOrderContent}>
        <SvgXml xml={empty_data()}/>
        <Text style={styles.noOrderDesc}>暂无订单</Text>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  flex1: {flex: 1},
  orderListContent: {flex: 1, backgroundColor: colors.f5,},
  statusTab: {flexDirection: 'row', backgroundColor: colors.white, height: 48},
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
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderAllScene)
