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
import {MixpanelInstance} from '../../pubilc/util/analytics';
import {ToastLong, ToastShort} from "../../pubilc/util/ToastUtils";
import {back, empty_data, search_icon, this_down, this_up} from "../../svg/svg";
import OrderItem from "../../pubilc/component/OrderItem";
import GoodsListModal from "../../pubilc/component/GoodsListModal";
import AddTipModal from "../../pubilc/component/AddTipModal";
import DeliveryStatusModal from "../../pubilc/component/DeliveryStatusModal";
import CancelDeliveryModal from "../../pubilc/component/CancelDeliveryModal";
import AlertModal from "../../pubilc/component/AlertModal";
import DatePicker from "react-native-date-picker";
import dayjs from "dayjs";
import TopSelectModal from "../../pubilc/component/TopSelectModal";
import JbbModal from "../../pubilc/component/JbbModal";

const {width} = Dimensions.get("window");

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class OrderAllScene extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    let {store_id, store_info, only_one_store} = this.props.global;
    this.state = {
      store_id,
      only_one_store,
      is_loading: false,
      query: {
        page_size: 10,
        page: 1,
        is_add: true,
      },
      list: [],
      store_list: [],
      search_start_date: new Date(),
      search_end_date: new Date(),
      search_start_date_input_val: new Date(),
      search_end_date_input_val: new Date(),
      search_store_id: store_id,
      search_store_name: store_info?.name,
      search_status: 0,
      search_type: 0,
      search_platform: 0,
      date_desc: '今日',
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
        {label: '美团', value: 3},
        {label: '饿了么', value: 4},
        {label: '京东到家', value: 6},
        {label: '自定义', value: -1},
      ],
      check_list: [],
      check_item: '',
      order_id: 0,
      add_tip_id: 0,
      is_can_load_more: false,
      show_goods_list: false,
      show_add_tip_modal: false,
      show_delivery_modal: false,
      show_cancel_delivery_modal: false,
      show_finish_delivery_modal: false,
      show_select_store_modal: false,
      show_condition_modal: 0,
      show_date_modal: false,
      show_date_select_modal: false,
      show_date_type: 1,
      fetch_store_page: 1,
      fetch_store_page_size: 10,
      is_last_page: false
    }
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
    this.fetchStoreList()
  }

  fetchStoreList = () => {
    const {accessToken, only_one_store} = this.props.global;
    const {fetch_store_page_size, fetch_store_page, store_list, is_last_page} = this.state
    if (only_one_store || is_last_page)
      return
    let params = {page: fetch_store_page, page_size: fetch_store_page_size}
    this.setState({refreshing: true})
    const api = `/v4/wsb_store/listCanReadStore?access_token=${accessToken}`
    HttpUtils.get(api, params).then(res => {
      let list = fetch_store_page !== 1 ? store_list.concat(res?.lists) : res?.lists
      this.setState({
        store_list: list,
        refreshing: false,
        fetch_store_page: fetch_store_page + 1,
        is_last_page: tool.length(res?.lists) < fetch_store_page_size
      })
    }).catch(() => {
      this.setState({refreshing: false})
    })
  }

  onRefresh = () => {
    const {query} = this.state
    this.setState({
        query: {...query, page: 1, is_add: true, page_size: 10},
      },
      () => this.fetchOrderList())
  }

  fetchOrderList = (setList = 1) => {
    let {
      is_loading,
      query,
      search_start_date,
      search_end_date,
      search_type,
      search_status,
      search_platform,
      search_store_id
    } = this.state;
    if (is_loading || !query.is_add) {
      return null;
    }
    this.setState({
      is_loading: true,
    })

    let {accessToken} = this.props.global;
    let params = {
      search_store_id: search_store_id,
      page: query.page,
      page_size: query.page_size,
      start_time: dayjs(search_start_date).format('YYYY-MM-DD'),
      end_time: dayjs(search_end_date).format('YYYY-MM-DD'),
      search_type,
      search_status,
      search_platform,
    }

    const url = `/v4/wsb_order/order_search?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      let {list, query} = this.state;
      if (tool.length(res.data) < query.page_size) {
        query.is_add = false;
      }
      query.page++;
      this.setState({
        is_loading: false,
        query: {...query},
        list: setList === 1 ? res.data : list.concat(res.data),
      })
    }, (res) => {
      ToastLong(res.reason);
      this.setState({is_loading: false})
    }).catch((res) => {
      ToastLong(res.reason);
      this.setState({is_loading: false})
    })

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
      this.fetchOrderList()
    }).catch(() => {
      ToastShort('“配送完成失败，请稍后重试”')
    })
  }


  checkDatePicker = (date) => {
    let {show_date_type} = this.state;
    let params = {
      show_date_select_modal: false,
      is_right_once: 0,
    }
    if (show_date_type === 1) {
      params.search_start_date_input_val = date;
    } else {
      params.search_end_date_input_val = date;
    }
    this.setState(params)
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
    this.setState(params, () => {
      this.onRefresh()
    })
  }

  checkStore = (item) => {
    this.setState({
      show_select_store_modal: false,
      search_store_id: item?.id,
      search_store_name: item?.name
    }, () => {
      this.fetchOrderList()
    })
  }

  render() {
    const {currStoreId, accessToken} = this.props.global;
    let {dispatch} = this.props;
    const {
      order_id,
      show_goods_list,
      show_delivery_modal,
      show_add_tip_modal,
      show_cancel_delivery_modal,
      show_select_store_modal,
      show_condition_modal,
      add_tip_id,
      search_store_id,
      check_list,
      store_list,
      check_item,
      refreshing
    } = this.state
    return (
      <View style={styles.flex1}>
        {this.renderHead()}
        {this.renderConditionTabs()}
        {this.renderContent()}
        {this.renderDateModal()}
        {this.renderFinishDeliveryModal()}

        <TopSelectModal list={show_condition_modal > 0 ? check_list : store_list}
                        label_field={show_condition_modal > 0 ? undefined : 'name'}
                        value_field={show_condition_modal > 0 ? undefined : 'id'}
                        onPress={show_condition_modal > 0 ? this.checkItem.bind(this) : this.checkStore.bind(this)}
                        default_val={show_condition_modal > 0 ? check_item : search_store_id}
                        onEndReachedThreshold={0.3}
                        onEndReached={show_condition_modal > 0 ? undefined : this.fetchStoreList}
                        refreshing={show_condition_modal > 0 ? undefined : refreshing}
                        initialNumToRender={10}
                        onClose={this.closeModal.bind(this)}
                        visible={show_select_store_modal || show_condition_modal > 0}
                        marTop={show_condition_modal > 0 ? 80 : 40}
        />

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

  confirmDate = () => {
    let {search_start_date_input_val, search_end_date_input_val,} = this.state;
    let date_desc = ''
    if (dayjs(search_start_date_input_val).format('YYYY-MM-DD') === dayjs(search_end_date_input_val).format('YYYY-MM-DD')) {
      date_desc = dayjs(search_start_date_input_val).format('MM/DD');
      if (dayjs(search_start_date_input_val).format('YYYY-MM-DD') === dayjs(new Date()).format('YYYY-MM-DD')) {
        date_desc = '今日'
      }
    } else {
      date_desc = dayjs(search_start_date_input_val).format('MM/DD') + '-' + dayjs(search_end_date_input_val).format('MM/DD');
    }
    this.setState({
      show_date_modal: false,
      search_start_date: search_start_date_input_val,
      search_end_date: search_end_date_input_val,
      date_desc,
    }, () => {
      this.onRefresh()
    })
  }

  renderDateModal = () => {
    let {
      show_date_modal,
      search_start_date_input_val,
      search_end_date_input_val,
      show_date_select_modal,
      show_date_type
    } = this.state;
    return (
      <JbbModal visible={show_date_modal} onClose={this.closeModal} modal_type={'bottom'}
                modalStyle={{padding: 0}}
      >
        <View>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            height: 50,
            marginHorizontal: 20
          }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.color333}}> 选择日期 </Text>
            <Text
              style={{fontSize: 16, fontWeight: '400', color: colors.main_color, padding: 10}}
              onPress={this.confirmDate}> 确定 </Text>
          </View>

          <View style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            height: 70
          }}>
            <TouchableOpacity onPress={() => {
              this.setState({show_date_select_modal: true, show_date_type: 1})
            }}>
              <Text> {dayjs(search_start_date_input_val).format('YYYY-MM-DD')} </Text>
            </TouchableOpacity>
            <Text>-</Text>
            <TouchableOpacity onPress={() => this.setState({show_date_select_modal: true, show_date_type: 2})}>
              <Text> {dayjs(search_end_date_input_val).format('YYYY-MM-DD')} </Text>
            </TouchableOpacity>

            <DatePicker
              confirmText={'确定'}
              cancelText={'取消'}
              title={'选择日期'}
              modal
              mode={'date'}
              textColor={colors.color666}
              open={show_date_select_modal}
              date={show_date_type === 1 ? search_start_date_input_val : search_end_date_input_val}
              minimumDate={show_date_type === 1 ? dayjs(new Date()).subtract(90, 'day').toDate() : search_start_date_input_val}
              maximumDate={new Date()}
              onConfirm={(date) => {
                this.checkDatePicker(date)
              }}
              onCancel={() => {
                this.setState({
                  show_date_select_modal: false
                })
              }}
            />
          </View>
        </View>
      </JbbModal>
    )
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
    let {show_select_store_modal, store_list, only_one_store, search_store_name, search_store_id} = this.state;
    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        width: width,
        backgroundColor: colors.white,
        paddingHorizontal: 6,
      }}>
        <SvgXml style={{marginRight: 4}} onPress={() => {
          this.props.navigation.goBack()
        }} xml={back()}/>

        <TouchableOpacity disabled={only_one_store} onPress={() => {

          let {is_service_mgr} = tool.vendor(this.props.global);
          if (is_service_mgr) {
            return this.onPress(Config.ROUTE_STORE_SELECT, {onBack: (item) => this.checkStore(item)})
          }

          if (tool.length(store_list) <= 0) {
            this.fetchStoreList()
            return ToastShort('正在请求店铺信息，请稍后再试');
          }
          this.setState({
            show_select_store_modal: !show_select_store_modal,
            show_condition_modal: 0
          })
        }} style={{height: 44, flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{
            fontSize: 15,
            color: colors.color333,
            fontWeight: 'bold'
          }}>{tool.jbbsubstr(search_store_name, 12)} </Text>
          <If condition={!only_one_store}>
            <SvgXml xml={show_select_store_modal ? this_up() : this_down()}/>
          </If>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            this.mixpanel.track('V4订单列表_搜索')
            this.onPress(Config.ROUTE_SEARCH_ORDER, {search_store_id})
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

  onEndReached = () => {
    let {query, is_can_load_more} = this.state;
    if (is_can_load_more) {
      this.setState({is_can_load_more: false}, () => {
        if (query?.is_add) {
          this.fetchOrderList(0);
        } else {
          ToastShort('已经到底部了')
        }
      })
    }
  }

  onMomentumScrollBegin = () => {
    this.setState({is_can_load_more: true})
  }

  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  _getItemLayout = (data, index) => {
    return {length: 120, page_size: 120 * index, index}
  }

  renderContent = () => {
    let {is_loading, list} = this.state;
    return (
      <View style={styles.orderListContent}>
        <FlatList
          contentContainerStyle={{flexGrow: 1}}
          data={list}
          legacyImplementation={false}
          directionalLockEnabled={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={this.onEndReached}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          renderItem={this.renderItem}
          onRefresh={this.onRefresh}
          refreshing={is_loading}
          keyExtractor={(item, index) => `${index}`}
          shouldItemUpdate={this._shouldItemUpdate}
          ListEmptyComponent={this.renderNoOrder()}
          ListFooterComponent={this.renderBottomView()}
          initialNumToRender={3}
        />
      </View>
    );
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
                 order_status={0}
      />
    );
  }

  renderNoOrder = () => {
    let {list, is_loading} = this.state;
    if (is_loading, tool.length(list) > 0) {
      return null
    }
    return (
      <View style={styles.noOrderContent}>
        <SvgXml xml={empty_data()}/>
        <Text style={styles.noOrderDesc}> 暂无订单 </Text>
      </View>
    )
  }


  renderBottomView = () => {
    let {query, list} = this.state;
    if (query?.is_add || tool.length(list) < 3) {
      return <View/>
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10}}>
        <Text style={{fontSize: 14, color: colors.color999}}> 已经到底了～ </Text>
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
