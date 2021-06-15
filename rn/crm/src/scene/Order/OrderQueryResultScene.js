import React from 'react'
import ReactNative from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../../util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import Cts from '../../Cts'

import _ from "lodash";
import colors from "../../styles/colors";
import * as tool from "../../common/tool";
import HttpUtils from "../../util/http";
import OrderListItem from "../component/OrderListItem";

const {
  FlatList,
  Text,
  InteractionManager,
  View,
  SafeAreaView
} = ReactNative;

const {PureComponent} = React;

function mapStateToProps(state) {
  const {remind, global} = state;
  return {remind: remind, global: global}
}

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


let canLoadMore;
class OrderQueryResultScene extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      canSwitch: true,
      isLoading: false,
      showStopRemindDialog: false,
      showDelayRemindDialog: false,
      opRemind: {},
      localState: {},
      otherTypeActive: 3,
      query: {
        listType: Cts.ORDER_STATUS_TO_READY,
        offset: 0,
        limit: 100,
        maxPastDays: 100,
      },
      totals:[],
      orderMaps: [],
      storeIds: [],
      zitiMode: 0
    };
    this.renderItem = this.renderItem.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    canLoadMore = false;
  }

  componentDidMount() {
    this.fetchOrders()
  }

  onRefresh() {
    this.fetchOrders()
  }

  fetchOrders = () => {
    let zitiType = this.state.zitiMode ? 1 : 0;
    const accessToken = this.props.global.accessToken;
    const {currVendorId, currStoreId} = tool.vendor(this.props.global);
    const {term, max_past_day} = this.props.route.params

    console.log("route params:", this.props.route.params)

    const params = {
      vendor_id: currVendorId,
      offset: this.state.query.offset,
      limit: this.state.query.limit,
      max_past_day: max_past_day || this.state.query.maxPastDays,
      ziti: zitiType,
      search: encodeURIComponent(term),
      use_v2: 1
    }
    if ("invalid:" === term) {
      params.status = Cts.ORDER_STATUS_INVALID
    }

    console.log("http params:", params)

    const url = `/api/orders.json?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      this.setState({totals: res.totals, orders: res.orders, isLoading: false, isLoadingMore: false})
    }, (res) => {
      this.setState({isLoading: false, errorMsg: res.reason, isLoadingMore: false})
    })
  }

  onPress(route, params) {
    let {canSwitch} = this.state;
    if (canSwitch) {
      this.setState({canSwitch: false});
      InteractionManager.runAfterInteractions(() => {
        this.props.navigation.navigate(route, params);
      });
      this.__resetState();
    }
  }

  __resetState() {
    setTimeout(() => {
      this.setState({canSwitch: true})
    }, 2500)
  }

  onEndReached() {
  }

  renderFooter(typeId) {
  }

  renderItem(order) {
    let {item, index} = order;
    return (
      <OrderListItem item={item} index={index} key={index} onRefresh={() => this.onRefresh()}
                  onPress={this.onPress.bind(this)}/>
    );
  }

  renderContent(orders) {
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: colors.white, color: colors.fontColor}}>
      <FlatList
        extraData={orders}
        data={orders}
        legacyImplementation={false}
        directionalLockEnabled={true}
        onTouchStart={(e) => {
          this.pageX = e.nativeEvent.pageX;
          this.pageY = e.nativeEvent.pageY;
        }}
        onTouchMove={(e) => {
          if (Math.abs(this.pageY - e.nativeEvent.pageY) > Math.abs(this.pageX - e.nativeEvent.pageX)) {
            this.setState({scrollLocking: true});
          } else {
            this.setState({scrollLocking: false});
          }
        }}
        onEndReachedThreshold={0.5}
        renderItem={this.renderItem}
        onEndReached={this.onEndReached.bind(this)}
        onRefresh={this.onRefresh.bind(this)}
        refreshing={this.state.isLoading}
        keyExtractor={this._keyExtractor}
        shouldItemUpdate={this._shouldItemUpdate}
        getItemLayout={this._getItemLayout}
        ListEmptyComponent={() =>
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            flexDirection: 'row',
            height: 210
          }}>
            <Text style={{fontSize: 18, color: colors.fontColor}}>
              未搜索到订单
            </Text>
          </View>}
        initialNumToRender={5}
      />
        </SafeAreaView>
    );
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

  render() {
    const orders = this.state.orders || []
    return (
        <View style={{flex: 1}}>
          {this.renderContent(orders)}
        </View>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderQueryResultScene)
