import React from 'react'
import ReactNative from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../../util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import Cts from '../../Cts'
import colors from "../../styles/colors";
import * as tool from "../../common/tool";
import HttpUtils from "../../util/http";
import OrderListItem from "../component/OrderListItem";
import {hideModal, showError, showModal, ToastShort} from "../../util/ToastUtils";

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

class OrderQueryResultScene extends PureComponent {

  constructor(props) {

    super(props);

    const {navigation, route} = this.props
    let title = ''
    let type = 'done'
    if (tool.length(route.params.term) > 0) {
      title = `订单中搜索:${route.params.term || ""}`
      type = 'search'
    } else {
      title = '已完成订单'
    }
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
      end: false,
    };
    navigation.setOptions({headerTitle: title})
    this.fetchOrders()
    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount() {
  }

  onRefresh() {
    let query = this.state.query;
    query.page = 1;
    this.setState({
      end: false,
      query: query,
      orders: []
    })
    this.fetchOrders()
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
    } else {
      params.search = `store:${currStoreId}`;
      params.status = Cts.ORDER_STATUS_DONE;
    }
    const url = `/api/orders.json?access_token=${accessToken}`;
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

  onPress(route, params) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  onEndReached() {
    const query = this.state.query;
    if (this.state.end) {
      ToastShort('没有更多数据了')
      return null
    }
    query.page += 1
    this.setState({query}, () => {
      this.fetchOrders()
    })
  }

  renderItem(order) {
    let {item, index} = order;
    return (
      <OrderListItem showBtn={false}
                     fetchData={this.fetchOrders.bind(this)}
                     item={item} index={index}
                     accessToken={this.props.global.accessToken}
                     key={index}
                     onRefresh={() => this.onRefresh()}
                     navigation={this.props.navigation}
                     vendorId={this.props.global.config.vendor.id}
                     allow_edit_ship_rule={false}
                     onPress={this.onPress.bind(this)}
      />
    );
  }

  renderContent(orders) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: colors.white, color: colors.fontColor}}>
        <FlatList
          extraData={orders}
          data={orders}
          renderItem={this.renderItem}
          onRefresh={this.onRefresh.bind(this)}
          onEndReachedThreshold={0.1}
          // onEndReached={this.onEndReached.bind(this)}
          onEndReached={() => {
            if (this.state.isCanLoadMore) {
              this.onEndReached();
              this.setState({isCanLoadMore: false})
            }
          }}
          onMomentumScrollBegin={() => {
            this.setState({
              isCanLoadMore: true
            })
          }}
          refreshing={this.state.isLoading}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          // getItemLayout={this._getItemLayout}
          ListEmptyComponent={() =>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              flexDirection: 'row',
              height: 210
            }}>
              <If condition={!this.state.isLoading}>
                <Text style={{fontSize: 18, color: colors.fontColor}}>
                  未搜索到订单
                </Text>
              </If>

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
