import React, {PureComponent} from 'react'
import {FlatList, Text, InteractionManager, View, SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../../pubilc/util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import Cts from '../../pubilc/common/Cts'
import colors from "../../pubilc/styles/colors";
import tool from "../../pubilc/util/tool";
import HttpUtils from "../../pubilc/util/http";
import OrderListItem from "../../pubilc/component/OrderListItem";
import {hideModal, showError, showModal, ToastShort} from "../../pubilc/util/ToastUtils";
import DateTimePicker from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import {SearchBar} from "../../weui";
import {calcMs} from '../../pubilc/util/AppMonitorInfo'
import {getTime} from "../../pubilc/util/TimeUtil";
import {MixpanelInstance} from "../../pubilc/util/analytics";
import Config from "../../pubilc/common/config";

function mapStateToProps(state) {
  const {remind, global, device} = state;
  return {remind: remind, global: global, device: device}
}

const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}//记录耗时的对象

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchRemind,
      updateRemind,
      fetchRemindCount,
      delayRemind, ...globalActions
    }, dispatch)
  }
}

const STATUS_FILTER = [
  {label: '全部订单', id: 0},
  {label: '已取消', id: 5},
  {label: '异常', id: 8}
]

class OrderQueryResultScene extends PureComponent {
  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    timeObj.method.push({startTime: getTime(), methodName: 'componentDidMount'})
    this.mixpanel.track("全部的订单")
    const {navigation, route} = props
    let title = '全部订单'
    let type = 'done'
    if (route.params.additional !== undefined && route.params.additional) {
      title = '补送单'
      type = 'additional'
    }
    navigation.setOptions({headerTitle: title})
    this.state = {
      isLoading: false,
      query: {
        page: 1,
        limit: 10,
        maxPastDays: 20,
      },
      orders: [],
      isCanLoadMore: false,
      type: type,
      date: dayjs().format('YYYY-MM-DD'),
      showDatePicker: false,
      end: false,
      dateBtn: 1,
      platformBtn: 0,
      platform: Cts.PLAT_ARRAY,
      selectStatus: STATUS_FILTER[0]
    };

  }

  onRefresh = () => {
    tool.debounces(() => {
      let query = this.state.query;
      query.page = 1;
      this.setState({
        end: false,
        query: query,
        orders: []
      }, () => {
        this.getOrderList()
      })
    }, 600)
  }

  onPress(route, params) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  onEndReached() {
    const {query, end} = this.state;
    if (end) {
      ToastShort('没有更多数据了')
      return null
    }
    query.page += 1
    this.setState({query}, () => {
      this.getOrderList()
    })
  }

  renderItem = (order) => {
    let {item, index} = order;
    return (
      <OrderListItem showBtn={false}
                     fetchData={this.getOrderList}
                     item={item} index={index}
                     accessToken={this.props.global.accessToken}
                     key={index}
                     onRefresh={() => this.onRefresh()}
                     navigation={this.props.navigation}
                     vendorId={this.props.global.config.vendor.id}
                     setState={this.setState.bind(this)}
                     allow_edit_ship_rule={false}
                     onPress={this.onPress.bind(this)}
      />
    );
  }

  onMomentumScrollBegin = () => {
    this.setState({
      isCanLoadMore: true
    })
  }

  renderContent() {
    const {orders, isCanLoadMore, isLoading} = this.state
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: colors.back_color, color: colors.fontColor}}>
        <FlatList
          data={orders}
          renderItem={this.renderItem}
          onRefresh={() => this.onRefresh()}
          onEndReachedThreshold={0.1}
          onEndReached={() => {
            if (isCanLoadMore) {
              this.onEndReached();
              this.setState({isCanLoadMore: false})
            }
          }}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          refreshing={isLoading}
          keyExtractor={(item, index) => `${index}`}
          //shouldItemUpdate={this._shouldItemUpdate}
          // getItemLayout={(data, index) => this.getItemLayout(data, index)}
          ListEmptyComponent={this.listEmptyComponent()}
          initialNumToRender={5}
        />
      </SafeAreaView>
    );
  }

  listEmptyComponent = () => {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row', height: 210}}>
        <If condition={!this.state.isLoading}>
          <Text style={{fontSize: 18, color: colors.fontColor}}>
            未搜索到订单
          </Text>
        </If>
      </View>
    )
  }
  _shouldItemUpdate = (prev, next) => {
    return prev.item !== next.item;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

    if (timeObj.method.length > 0) {
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

  componentDidMount() {
    // this.onSearch('', false)
    this.getOrderList()
    timeObj.method[0].endTime = getTime()
    timeObj.method[0].executeTime = timeObj.method[0].endTime - timeObj.method[0].startTime
    timeObj.method[0].executeStatus = 'success'
    timeObj.method[0].methodName = "componentDidMount"
    timeObj.method[0].interfaceName = ''
    const {deviceInfo} = this.props.device
    const {currStoreId, currentUser, accessToken, config} = this.props.global;
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = currStoreId
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderQueryResultScene"
    timeObj['is_record_request_monitor'] = config.is_record_request_monitor
    calcMs(timeObj, accessToken)
  }

  getOrderList = (keywords = '', isSearch = false) => {
    if (this.state.type === 'additional') {
      this.fetchOrders()
      return
    }
    this.onSearch(keywords, isSearch)
  }

  render() {
    const {type} = this.state

    return (
      <View style={{flex: 1, backgroundColor: colors.back_color}}>
        <If condition={type === 'done'}>
          {this.renderHeader()}
        </If>
        {this.renderContent()}
      </View>
    );
  }

  fetchOrders = () => {
    if (this.state.isLoading) {
      return null;
    }
    showModal("加载中...")
    this.setState({isLoading: true})
    const {accessToken, currStoreId} = this.props.global;
    const {currVendorId} = tool.vendor(this.props.global);
    const params = {
      vendor_id: currVendorId,
      offset: (this.state.query.page - 1) * this.state.query.limit,
      limit: this.state.query.limit,
      use_v2: 1
    }
    if (this.state.type === 'search') {
      const {term, max_past_day} = this.props.route.params
      params.max_past_day = max_past_day || this.state.query.maxPastDays;
      params.search = encodeURIComponent(term);
      if ("invalid:" === term) {
        params.status = Cts.ORDER_STATUS_INVALID
      }
    } else if (this.state.type === 'additional') {
      params.store_id = currStoreId;
    } else {
      params.search = encodeURIComponent(`store:${currStoreId}|||orderDate:${this.state.date}|||pl:${this.state.platformBtn}`);
      params.status = Cts.ORDER_STATUS_DONE;
    }
    let url = `/api/orders.json?access_token=${accessToken}`;

    if (this.state.type === 'additional') {
      url = `/api/get_three_day_delivery_order?access_token=${accessToken}`;
    }

    HttpUtils.get.bind(this.props)(url, params).then(res => {

      hideModal()
      if (tool.length(res.orders) < this.state.query.limit) {
        this.setState({
          end: true,
        })
      }
      let orders = this.state.orders.concat(res.orders)
      this.setState({
        orders: orders,
        isLoading: false,
      })
    }, (res) => {
      this.setState({isLoading: false})
      showError(res.reason)
    })

  }

  onSearch = (keywords, isSearch) => {
    const {isLoading, date, platformBtn, selectStatus, query, orders} = this.state
    if (isLoading) {
      return
    }
    showModal("加载中...")
    this.setState({isLoading: true})

    let params = {
      search_date: date,
      platform: platformBtn,
      order_status: selectStatus.id,
      search_from: 'app',
      page: query.page,
      limit: query.limit
    }
    if (keywords.length > 0)
      params = {...params, keywords: keywords}
    const url = `/v1/new_api/orders/order_all_list`;
    HttpUtils.get.bind(this.props)(url, params, true).then(res => {
      const {obj} = res
      hideModal()
      timeObj.method.push({
        interfaceName: url,
        executeStatus: res.executeStatus,
        startTime: res.startTime,
        endTime: res.endTime,
        methodName: 'onSearch',
        executeTime: res.endTime - res.startTime
      })
      //如果是搜索，直接使用接口返回的数据，如果是下拉或者上拉，添加数据
      this.setState({
        orders: isSearch ? obj : orders.concat(obj),
        isLoading: false,
        end: obj.length < query.limit
      })
    }, (res) => {
      timeObj.method.push({
        interfaceName: url,
        executeStatus: res.executeStatus,
        startTime: res.startTime,
        endTime: res.endTime,
        methodName: 'onSearch',
        executeTime: res.endTime - res.startTime
      })
      this.setState({isLoading: false})
      showError(res.reason)
    })
  };

  selectItem = (item) => {
    this.setState({
      selectStatus: item,
    }, () => {
      this.onRefresh()
    })
  }

  jumpToSearch = () => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(Config.ROUTE_ORDER_SEARCH);
    });

  }

  renderHeader() {
    const {selectStatus, date, showDatePicker, dateBtn, platform, platformBtn} = this.state
    return (
      <>
        <SearchBar placeholder="平台订单号/外送帮单号/手机号/顾客地址" onFocus={this.jumpToSearch}/>
        <View style={styles.rowWrap}>
          <DateTimePicker
            cancelTextIOS={'取消'}
            confirmTextIOS={'确定'}
            customHeaderIOS={() => {
              return (<View/>)
            }}
            date={new Date(date)}
            mode='date'
            isVisible={showDatePicker}
            onConfirm={(date) => {
              this.setState({
                showDatePicker: false,
                date: tool.fullDay(date),
              }, () => {
                this.onRefresh()
              });
            }}
            onCancel={() => {
              this.setState({
                showDatePicker: false,
              });
            }}
          />
          <Text style={styles.description}> 下单日期 </Text>
          <TouchableOpacity onPress={() => {
            this.setState({
              dateBtn: 1,
              date: dayjs().format('YYYY-MM-DD')
            }, () => {
              this.onRefresh()
            })
          }} style={{
            borderRadius: 2,
            backgroundColor: dateBtn === 1 ? colors.main_color : colors.white,
            marginLeft: pxToDp(15),
            alignItems: 'center',
            justifyContent: 'center',
            padding: pxToDp(10),
          }}>
            <Text style={{fontSize: 12, color: dateBtn === 1 ? colors.white : colors.fontBlack}}>今天</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            this.setState({
              dateBtn: 2,
              date: dayjs().subtract(1, 'day').format('YYYY-MM-DD')
            }, () => {
              this.onRefresh()
            })
          }} style={{
            borderRadius: 2,
            backgroundColor: dateBtn === 2 ? colors.main_color : colors.white,
            marginLeft: pxToDp(15),
            alignItems: 'center',
            justifyContent: 'center',
            padding: pxToDp(10),
          }}>
            <Text style={{fontSize: 12, color: dateBtn === 2 ? colors.white : colors.fontBlack}}>昨天</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            this.setState({
              dateBtn: 3,
              showDatePicker: !showDatePicker
            })
          }} style={{
            borderRadius: 2,
            backgroundColor: dateBtn === 3 ? colors.main_color : colors.white,
            marginLeft: pxToDp(15),
            alignItems: 'center',
            justifyContent: 'center',
            padding: pxToDp(10),
          }}>
            <Text style={{fontSize: 12, color: dateBtn === 3 ? colors.white : colors.fontBlack}}>自定义</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rowWrap}>
          <Text style={styles.description}> 平台筛选 </Text>
          <For index='i' each='info' of={platform}>
            <TouchableOpacity onPress={() => {
              this.setState({
                platformBtn: info.id,
              }, () => {
                this.onRefresh()
              })
            }} key={i} style={{
              borderRadius: 2,
              backgroundColor: platformBtn === info.id ? colors.main_color : colors.white,
              marginLeft: pxToDp(15),
              alignItems: 'center',
              justifyContent: 'center',
              padding: pxToDp(10),
            }}>
              <Text style={{fontSize: 12, color: platformBtn === info.id ? colors.white : colors.fontBlack}}>
                {info.label}
              </Text>
            </TouchableOpacity>
          </For>

        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.description}> 状态筛选 </Text>
          {
            STATUS_FILTER.map((item, index) => {
              const backgroundColor = selectStatus.id === item.id ? colors.main_color : colors.white
              const color = selectStatus.id === item.id ? colors.white : colors.fontBlack
              return (
                <TouchableOpacity key={index} onPress={() => this.selectItem(item)}
                                  style={[styles.btnWrap, {backgroundColor: backgroundColor}]}>
                  <Text style={{fontSize: 12, color: color}}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
      </>
    )
  }

}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    marginTop: pxToDp(3),
    padding: pxToDp(10),
  },
  rowWrap: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: pxToDp(20),
    paddingTop: pxToDp(10),
    paddingLeft: 0,
  },
  btnWrap: {
    borderRadius: 2,
    marginLeft: pxToDp(15),
    alignItems: 'center',
    justifyContent: 'center',
    padding: pxToDp(10),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(OrderQueryResultScene)
