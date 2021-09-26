import React, {Component} from 'react'
import ReactNative from 'react-native'
import {Tabs} from '@ant-design/react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {hideModal, showModal, ToastShort} from '../../util/ToastUtils';
import pxToDp from '../../util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import Cts from '../../Cts'

import _ from "lodash";
import IconBadge from '../../widget/IconBadge';
import colors from "../../styles/colors";
import * as tool from "../../common/tool";
import HttpUtils from "../../util/http";
import OrderListItem from "../component/OrderListItem";
import Moment from "moment/moment";

showModal('加载中');
const {
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  InteractionManager,
  View,
  SafeAreaView
} = ReactNative;

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

const labels = [];
labels[Cts.ORDER_STATUS_TO_READY] = '待打包'
labels[Cts.ORDER_STATUS_TO_SHIP] = '待配送'
labels[Cts.ORDER_STATUS_SHIPPING] = '配送中'
labels[Cts.ORDER_STATUS_DONE] = '已完结'

const initState = {
  canSwitch: true,
  isLoading: false,
  showStopRemindDialog: false,
  showDelayRemindDialog: false,
  opRemind: {},
  localState: {},
  categoryLabels: labels,
  otherTypeActive: 3,
  init: false,
  storeId: '',
  lastUnix: {},
  query: {
    listType: Cts.ORDER_STATUS_TO_READY,
    offset: 0,
    limit: 100,
    maxPastDays: 100,
  },
  totals: [],
  orderMaps: [],
  storeIds: [],
  zitiMode: 0
};

let canLoadMore;
class OrderListScene extends Component {

  state = initState;

  static getDerivedStateFromProps(props, state) {
    if (props.global.currStoreId !== state.storeId) {
      return {...initState, storeId: props.global.currStoreId, init: false, lastUnix: {}}
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    canLoadMore = false;
  }

  componentDidMount() {
    this.fetchOrders(Cts.ORDER_STATUS_TO_READY)
  }

  onRefresh() {
    this.fetchOrders()
  }

  onTabClick = (tabData, index) => {
    console.log("tab:", tabData, "index:", index)
    const query = this.state.query;
    if (query.listType !== tabData.type) {
      query.listType = tabData.type
      this.setState({query: query, isLoading: true}, () => {
        this.onRefresh(tabData.type)
      })
    } else {
        console.log(`duplicated:${index}`)
    }
  }

  categoryTitles() {
    return _.filter(this.state.categoryLabels.map((label, index) => {
      return {title: label, type: index}
    }), 'title')
  }

  fetchOrders = (queryType) => {
    let {currStoreId} = this.props.global;
    let zitiType = this.state.zitiMode ? 1 : 0;
    let search = `store:${currStoreId}`;

    const accessToken = this.props.global.accessToken;
    const {currVendorId} = tool.vendor(this.props.global);
    const initQueryType = queryType || this.state.query.listType;
    const params = {
      vendor_id: currVendorId,
      status: initQueryType,
      offset: this.state.query.offset,
      limit: this.state.query.limit,
      max_past_day: this.state.query.maxPastDays,
      ziti: zitiType,
      search: search,
      use_v2: 1
    }

    if (currVendorId && accessToken && !this.state.isFetching) {
      this.setState({isFetching: true})
      const url = `/api/orders.json?access_token=${accessToken}`;
      const init = true;
      HttpUtils.get.bind(this.props)(url, params).then(res => {
        const orderMaps = this.state.orderMaps;
        orderMaps[initQueryType] = res.orders
        const lastUnix = this.state.lastUnix;
        lastUnix[initQueryType] = Moment().unix();
        this.setState({
          totals: res.totals,
          orderMaps,
          storeId: currStoreId,
          lastUnix,
          isFetching: false,
          isLoading: false,
          isLoadingMore: false,
          init
        })
        hideModal();
      }, (res) => {
        const lastUnix = this.state.lastUnix;
        lastUnix[initQueryType] = Moment().unix();
        this.setState({isLoading: false, errorMsg: res.reason, isLoadingMore: false, isFetching: false, lastUnix, init})
      })
    }
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

  onPressDropdown(key, id, type) {
    const {remind} = this.props;
    if (remind.doingUpdate) {
      ToastShort("操作太快了！");
      return false;
    }
    if (parseInt(key) === 0) {
      this._showDelayRemindDialog(type, id);
    } else {
      this._showStopRemindDialog(type, id);
    }
  }

  __resetState() {
    setTimeout(() => {
      this.setState({canSwitch: true})
    }, 2500)
  }

  _showDelayRemindDialog(type, id) {
    this.setState({
      showDelayRemindDialog: true,
      opRemind: {type: type, id: id}
    });
  }

  _showStopRemindDialog(type, id) {
    this.setState({
      showStopRemindDialog: true,
      opRemind: {type: type, id: id}
    });
  }

  onEndReached(typeId) {
  }

  renderFooter(typeId) {
  }

  renderItem(order) {
    let {item, index} = order;
    return (
      <OrderListItem item={item} index={index} key={index} onRefresh={() => this.onRefresh()}
                  onPressDropdown={this.onPressDropdown.bind(this)} navigation={this.props.navigation}
                  onPress={this.onPress.bind(this)}/>
    );
  }

  renderContent(orders, typeId) {
    const seconds_passed = Moment().unix() - this.state.lastUnix[typeId];
    if (!this.state.init || seconds_passed > 60) {
      console.log(`do a render for type: ${typeId} init:${this.state.init} time_passed:${seconds_passed}`)
      this.fetchOrders(typeId)
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: colors.f7, color: colors.fontColor}}>
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
        onEndReached={this.onEndReached.bind(this, typeId)}
        onRefresh={this.onRefresh.bind(this, typeId)}
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
              暂无订单
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
    let lists = [];

    this.state.categoryLabels.forEach((label, typeId) => {
      const orders = this.state.orderMaps[typeId] || []
      lists.push(
          <View
              key={`${typeId}`}
              tabLabel={label}
              style={{flex: 1, color: colors.fontColor}}>
            {this.renderContent(orders, typeId)}
          </View>);
    });

    return (
        <View style={{flex: 1}}>
          <Tabs tabs={this.categoryTitles()} swipeable={false} animated={true} renderTabBar={tabProps => {
            return (<View style={{ paddingHorizontal: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>{
                  tabProps.tabs.map((tab, i) => {
                    let total = this.state.totals[tab.type] || '0';
                    return <TouchableOpacity activeOpacity={0.9}
                                             key={tab.key || i}
                                             style={{ width:"40%", padding: 15}}
                                             onPress={() => {
                                               const { goToTab, onTabClick } = tabProps;
                                               onTabClick(tab, i);
                                               goToTab && goToTab(i);
                                             }}>
                      <IconBadge MainElement={
                        <View>
                          <Text style={{ color: tabProps.activeTab === i ? 'green' : 'black'}}>
                            { (tab.type === Cts.ORDER_STATUS_DONE) ? tab.title : `${tab.title}(${total})`}
                          </Text>
                              </View>}
                                       Hidden="1"
                                       IconBadgeStyle={{width: 20, height: 15, top: -10, right: 0}}
                            />
                          </TouchableOpacity>;
                      })}</View>
                )}
              } onTabClick={()=>{}} onChange={this.onTabClick}>
          {lists}
        </Tabs>
      </View>
    );
  }

}

const styles = StyleSheet.create({

});

export default connect(mapStateToProps, mapDispatchToProps)(OrderListScene)
