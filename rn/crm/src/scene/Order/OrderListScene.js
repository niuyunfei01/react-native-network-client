import React from 'react'
import ReactNative from 'react-native'
import {Tabs} from '@ant-design/react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {ToastShort} from '../../util/ToastUtils';
import pxToDp from '../../util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import RNButton from '../../widget/RNButton';
import Cts from '../../Cts'

import _ from "lodash";
import IconBadge from '../../widget/IconBadge';
import colors from "../../styles/colors";
import * as tool from "../../common/tool";
import HttpUtils from "../../util/http";
import OrderListItem from "../component/OrderListItem";

const {
  StyleSheet,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  InteractionManager,
  ActivityIndicator,
  Image,
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
class OrderListScene extends PureComponent {

  constructor(props) {
    super(props);

    const labels = [];
    labels[Cts.ORDER_STATUS_TO_READY] = '待打包'
    labels[Cts.ORDER_STATUS_TO_SHIP] = '待配送'
    labels[Cts.ORDER_STATUS_SHIPPING] = '配送中'
    labels[Cts.ORDER_STATUS_DONE] = '已完结'

    this.state = {
      canSwitch: true,
      isLoading: false,
      showStopRemindDialog: false,
      showDelayRemindDialog: false,
      opRemind: {},
      localState: {},
      categoryLabels: labels,
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
    this.fetchOrders(Cts.ORDER_STATUS_TO_READY)
  }

  onRefresh() {
    this.fetchOrders()
  }

  onTabClick = (tabData, index) => {
    const query = this.state.query;
    query.listType = tabData.type
    this.setState({query: query}, function(){
      this.onRefresh(tabData.type)
    })
  }

  categoryTitles() {
    return _.filter(this.state.categoryLabels.map((label, index) => {
      return {title: label, type: index}
    }), 'title')
  }

  fetchOrders = () => {
    let {currStoreId} = this.props.global;
    let zitiType = this.state.zitiMode ? 1 : 0;
    let search = `store:${currStoreId}`;

    const accessToken = this.props.global.accessToken;
    const {currVendorId} = tool.vendor(this.props.global);
    const params = {
      vendor_id: currVendorId,
      status: this.state.query.listType,
      offset: this.state.query.offset,
      limit: this.state.query.limit,
      max_past_day: this.state.query.maxPastDays,
      ziti: zitiType,
      search: search,
      use_v2: 1
    }

    const url = `/api/orders.json?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, params).then(res => {
      const ordersMap = this.state.orderMaps;
      ordersMap[this.state.query.listType] = res.orders
      this.setState({totals: res.totals, orderMaps: ordersMap, isLoading: false, isLoadingMore: false})
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
                  onPressDropdown={this.onPressDropdown.bind(this)}
                  onPress={this.onPress.bind(this)}/>
    );
  }

  renderContent(orders, typeId) {
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: colors.default_container_bg, color: colors.fontColor}}>
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
        <Tabs tabs={this.categoryTitles()} swipeable={true} animated={true} renderTabBar={tabProps => {
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
              } onTabClick={this.onTabClick}>
          {lists}
        </Tabs>
      </View>
    );
  }

}

const styles = StyleSheet.create({

});

export default connect(mapStateToProps, mapDispatchToProps)(OrderListScene)
