//import liraries
import React, {PureComponent} from 'react'
import {FlatList, InteractionManager, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import colors from "../../pubilc/styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import HttpUtils from "../../pubilc/util/http";
import {getTime} from "../../pubilc/util/TimeUtil";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";
import AntDesign from "react-native-vector-icons/AntDesign";
import OrderListItem from "../../pubilc/component/OrderListItem";
import tool from "../../pubilc/util/tool";
import {hideModal, showError, showModal} from "../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {mine, user, global, device} = state;
  return {mine: mine, user: user, global: global, device: device}
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
}//记录耗时的对象

let contentFromOrderList = false

class OrderSearchScene extends PureComponent {
  constructor(props) {
    super(props);

    timeObj.method.push({startTime: getTime(), methodName: 'componentDidMount'})
    const term = props.route.params?.term
    this.state = {
      keyword: term && term.length > 12 && term.substring(9, 13) || '',
      isRefreshing: false,
      isSearching: false,
      prefix: [],
      orderList: [],
      end: false,
      isLoading: false,
      query: {
        page: 1,
        limit: 10,
        max_past_day: 7
      }
    };
    this.filterType = ''
    this.fetchOrderSearchPrefix()
  }

  componentDidMount() {
    const term = this.props.route.params?.term
    if (term && term.length > 0) {
      contentFromOrderList = true
      this.queryOrderInfo(true)
    }
    timeObj.method[0].endTime = getTime()
    timeObj.method[0].executeTime = timeObj.method[0].endTime - timeObj.method[0].startTime
    timeObj.method[0].executeStatus = 'success'
    timeObj.method[0].interfaceName = ""
    timeObj.method[0].methodName = "componentDidMount"
    const {deviceInfo} = this.props.device
    const {currStoreId, currentUser, accessToken, config} = this.props.global;
    timeObj['deviceInfo'] = deviceInfo
    timeObj.currentStoreId = currStoreId
    timeObj.currentUserId = currentUser
    timeObj['moduleName'] = "订单"
    timeObj['componentName'] = "OrderSearchScene"
    timeObj['is_record_request_monitor'] = config.is_record_request_monitor
    calcMs(timeObj, accessToken)
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

  fetchOrderSearchPrefix() {
    const {accessToken} = this.props.global
    const api = `/api/order_search_prefix?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {}, true).then(res => {
      timeObj.method.push({
        interfaceName: api,
        executeStatus: res.executeStatus,
        startTime: res.startTime,
        endTime: res.endTime,
        methodName: 'fetchOrderSearchPrefix',
        executeTime: res.endTime - res.startTime
      })
      this.setState({prefix: res.obj})

    })
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onSearch = (keyword) => {
    this.setState({keyword: keyword})
  };
  onRefresh = () => {
    tool.debounces(() => {
      const {query} = this.state
      query.page = 1
      this.setState({
        end: false,
        query: query,
        orderList: []
      }, () => this.queryOrderInfo(false))
    })
  }

  onPress(route, params) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  renderItem(order, global, navigation) {
    const {item, index} = order;
    const {accessToken} = global
    return (
      <OrderListItem showBtn={false}
                     item={item}
                     index={index}
                     accessToken={accessToken}
                     key={index}
                     onRefresh={() => this.onRefresh()}
                     navigation={navigation}
                     vendorId={global.config.vendor.id}
                     setState={this.setState.bind(this)}
                     allow_edit_ship_rule={false}
                     onPress={this.onPress.bind(this)}
      />
    );
  }

  touchBtn = (value) => {
    this.filterType = value
    contentFromOrderList = false
    this.queryOrderInfo(true)
  }

  onEndReached = () => {
    const {query, end} = this.state
    if (end) {
      showError('没有更多数据了')
      return
    }
    query.page += 1
    this.setState({query: query}, () => this.queryOrderInfo(false))
  }

  queryOrderInfo = (isChangeType) => {
    const {accessToken} = this.props.global;
    const {currVendorId} = tool.vendor(this.props.global);
    const {query, keyword, isLoading} = this.state
    const term = this.props.route.params?.term
    if (isLoading)
      return
    this.setState({isLoading: true})
    showModal('加载中...')
    const params = {
      vendor_id: currVendorId,
      offset: (query.page - 1) * query.limit,
      max_past_day: contentFromOrderList ? 10000 : query.max_past_day,
      limit: query.limit,
      search: term && contentFromOrderList ? encodeURIComponent(term) : encodeURIComponent(`${this.filterType}${keyword}`),
      use_v2: 1
    }
    const url = `/api/orders.json?access_token=${accessToken}`;
    HttpUtils.get(url, params).then(res => {
      hideModal()
      const orderList = isChangeType ? res.orders : this.state.orderList.concat(res.orders)
      const end = res.orders.length < query.limit
      this.setState({orderList: orderList, end: end, isLoading: false})
    }, res => {
      hideModal()
      this.setState({isLoading: false})
      showError(res.reason)
    }).catch(error => {
      hideModal()
      this.setState({isLoading: false})
      showError(error.reason)
    })
  }

  render() {
    const {keyword, prefix, orderList, isLoading} = this.state
    const {global, navigation, route} = this.props
    const term = route.params?.term
    return (
      <>
        <View style={styles.searchWarp}>
          <AntDesign name={'search1'} size={14}/>
          <TextInput style={styles.textInput}
                     value={keyword}
                     placeholder={'流水号/订单号/手机尾号/商品名称/取货码'}
                     onChangeText={(keyword) => this.onSearch(keyword)}/>
        </View>
        <If condition={keyword.length > 0}>
          <View style={styles.filterZoneWrap}>
            <Text style={styles.filterTipText}>
              点击标签筛选
            </Text>
            <View style={styles.filterBtnZone}>
              {
                prefix && prefix.map((item, index) => {
                  return (
                    <TouchableOpacity key={index}
                                      style={styles.filterBtn}
                                      onPress={() => this.touchBtn(item.value)}>
                      <Text style={styles.filterBtnText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })
              }
            </View>
          </View>
        </If>
        <If condition={orderList.length > 0}>
          <Text style={styles.filterBtnText}>
            {contentFromOrderList && term && term.length > 0 ? '' : '近七日'}共计
            <Text style={styles.orderListLength}>
              {orderList.length}
            </Text>
            单
          </Text>
        </If>
        <If condition={orderList.length === 0}>
          <Text style={styles.descriptionTipText}>
            支持搜索词说明
          </Text>
          <LineView/>
          <Text style={styles.descriptionText}>
            支持输入订单号、流水号、手机尾号（后4位）、商品名称、取货码进行搜索
          </Text>
        </If>
        <FlatList data={orderList}
                  renderItem={(item) => this.renderItem(item, global, navigation)}
                  initialNumToRender={2}
                  onRefresh={this.onRefresh}
                  onEndReachedThreshold={0.1}
                  onEndReached={this.onEndReached}
                  refreshing={isLoading}
                  removeClippedSubviews={true}
                  keyExtractor={(item, index) => `${index}`}
        />
      </>
    );
  }

}


const styles = StyleSheet.create({
  searchWarp: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 2,
    height: 28,
    paddingRight: 12,
    paddingLeft: 12,
    marginTop: 4,
    backgroundColor: colors.white
  },
  filterZoneWrap: {
    backgroundColor: colors.white,
    padding: 12
  },
  filterTipText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.color666,
    lineHeight: 18
  },
  filterBtnZone: {
    flexDirection: 'row',
    paddingLeft: 21,
    paddingRight: 14,
    paddingTop: 10,
    flexWrap: 'wrap'
  },
  filterBtn: {
    backgroundColor: colors.colorEEE,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.colorCCC,
    marginRight: 25,
    marginBottom: 15,
    width: 72
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
    paddingTop: 2,
    paddingBottom: 2,
    textAlign: 'center'
  },
  descriptionTipText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.color666,
    lineHeight: 18,
    paddingTop: 14,
    paddingLeft: 11,
    paddingBottom: 4
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 17,
    paddingTop: 14,
    paddingLeft: 11,
    paddingRight: 16,
    paddingBottom: 4
  },
  textInput: {
    fontSize: 14, color: colors.color999, flex: 1, paddingTop: 4, paddingBottom: 4, paddingLeft: 4
  },
  orderListLength: {color: '#F21F1F'},
  line: {borderBottomWidth: 1, borderBottomColor: colors.colorEEE, marginLeft: 12, marginRight: 15}
});

const LineView = () => {
  return <View style={styles.line}/>
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderSearchScene)
