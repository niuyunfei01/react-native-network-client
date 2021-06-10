import React from 'react'
import ReactNative from 'react-native'
import {Tabs} from '@ant-design/react-native';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {ToastShort} from '../../util/ToastUtils';
import pxToDp from '../../util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import RNButton from '../../widget/RNButton';
import Config from '../../config'
import Cts from '../../Cts'

import _ from "lodash";
import IconBadge from '../../widget/IconBadge';
import colors from "../../styles/colors";
import * as tool from "../../common/tool";
import HttpUtils from "../../util/http";
import Styles from "../../common/CommonStyles";
import JbbText from "../component/JbbText";
import {Line} from "../component/All";

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
let loadMoreTime = 0;
const _otherSubTypeIds = [Cts.TASK_TYPE_OTHER_IMP, Cts.TASK_TYPE_UN_CLASSIFY, Cts.TASK_TYPE_UPLOAD_NEW_GOODS, Cts.TASK_TYPE_CHG_SUPPLY_PRICE];//其他分类下的子分类定义
const _otherTypeTag = 103;

// create a component
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

  _getToken() {
    const {global} = this.props;
    return global['accessToken']
  }

  _getStoreAndVendorId() {
    let {currVendorId} = tool.vendor(this.props.global);
    let {currStoreId} = this.props.global;
    return {'store_id': currStoreId, 'vendor_id': currVendorId}
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
      //暂停提示
      this._showDelayRemindDialog(type, id);
    } else {
      //强制关闭
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
    let time = Date.parse(new Date()) / 1000;
    const {remind} = this.props;
    let token = this._getToken();
    let pageNum = remind.currPage[typeId];
    canLoadMore = true;
    if (remind.noMore[typeId]) {
      canLoadMore = false;
    }
    if (canLoadMore && time - loadMoreTime > 1) {
      const {dispatch} = this.props;
      let {store_id, vendor_id} = this._getStoreAndVendorId();
      dispatch(fetchRemind(false, false, typeId, true, pageNum + 1, token, Cts.TASK_STATUS_WAITING, vendor_id, store_id));
      loadMoreTime = Date.parse(new Date()) / 1000;
    }
  }

  pressSubButton(type) {
    this.setState({
      otherTypeActive: type
    });
  }

  pressToDoneRemind(route, params = {}) {
    let _this = this;
    let {canSwitch} = _this.state;
    if (canSwitch) {
      _this.setState({canSwitch: false});
      InteractionManager.runAfterInteractions(() => {
        _this.props.navigation.navigate(route, params);
      });
      this.__resetState();
    }
  }

  __getBadgeButton(key, name, quick) {
    quick = quick ? quick : 0;
    let activeType = this.state.otherTypeActive;
    let self = this;
    return <IconBadge
      key={key}
      MainElement={
        <RNButton
          onPress={() => self.pressSubButton(key)}
          containerStyle={activeType == key ? styles.subButtonActiveContainerStyle : styles.subButtonContainerStyle}
          style={activeType == key ? styles.subButtonActiveStyle : styles.subButtonStyle}>
          {name}
        </RNButton>
      }
      BadgeElement={
        <Text style={{color: '#FFFFFF', fontSize: pxToDp(18)}}>{quick > 99 ? '99+' : quick}</Text>
      }
      MainViewStyle={{marginHorizontal: pxToDp(10)}}
      Hidden={quick == 0}
      IconBadgeStyle={styles.iconBadgeStyle}
      MainProps={{key: key}}
    />;
  }

  renderHead(typeId) {
    let self = this;
    if (typeId != _otherTypeTag) {
      return null;
    }
    let buttons = [];
    const {remind} = this.props;
    let quickNum = remind.quickNum;

    let {is_helper, is_service_mgr} = tool.vendor(this.props.global);
    if ((is_helper || is_service_mgr) && _otherSubTypeIds.indexOf(Cts.TASK_TYPE_UPLOAD_GOODS_FAILED) === -1) {//上传商品失败分类只展示给服务人员和后台人员
      _otherSubTypeIds.push(Cts.TASK_TYPE_UPLOAD_GOODS_FAILED);
    }
    _otherSubTypeIds.forEach((typeId) => {
      buttons.push(self.__getBadgeButton(typeId, this.state.categoryLabels[typeId], quickNum[typeId]));
    });
    return (
      <View style={styles.listHeadStyle}>
        {buttons}
      </View>
    );
  }

  renderFooter(typeId) {
    const {remind} = this.props;
    if (!remind.isLoadMore[typeId]) return <View style={{
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <RNButton
        activeOpacity={0.7}
        onPress={() => {
          this.pressToDoneRemind(Config.ROUTE_DONE_REMIND, {
            type: 'DoneRemind',
            title: '已处理工单'
          })
        }}
        containerStyle={styles.stickyButtonContainer}
        style={{
          fontSize: 16,
          color: '#999'
        }}>
        已处理工单
      </RNButton>
    </View>;
    else
      return (
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator styleAttr='Inverse' color='#3e9ce9'/>
          <Text style={{textAlign: 'center', fontSize: 16}}>
            加载中…
          </Text>
        </View>
      );
  }

  renderItem(order) {
    let {item, index} = order;
    return (
      <OrderItem item={item} index={index} key={index} onRefresh={() => this.onRefresh()}
                  onPressDropdown={this.onPressDropdown.bind(this)}
                  onPress={this.onPress.bind(this)}/>
    );
  }

  renderContent(orders, typeId) {
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
        onEndReached={this.onEndReached.bind(this, typeId)}
        onRefresh={this.onRefresh.bind(this, typeId)}
        refreshing={this.state.isLoading}
        ListFooterComponent={this.renderFooter.bind(this, typeId)}
        ListHeaderComponent={this.renderHead.bind(this, typeId)}
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
                          let total = this.state.totals[tab.type] || '';
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
                                  { (Number(total) === 0 || tab.type === Cts.ORDER_STATUS_DONE) ? tab.title : `${tab.title}(${total})`}
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

const dropDownImg = require("../../img/Order/pull_down.png");

class OrderItem extends React.PureComponent {

  static propTypes = {
    item: PropTypes.object,
    index: PropTypes.number,
    onPressDropdown: PropTypes.func,
    onPress: PropTypes.func,
    onRefresh: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {toggleImg: dropDownImg};
  }

  render() {
    let {item, onPress} = this.props;
    return (
      <View onPress={() => {onPress(Config.ROUTE_ORDER, {orderId: item.id})}}>
        <View style={[Styles.between]}>
          <View style={Styles.cowbetween}><JbbText>#{item.dayId} 期望送达 </JbbText><JbbText>{item.expectTimeStr}</JbbText></View>
          <View style={Styles.between}>
            <View><JbbText>{item.address}</JbbText></View>
            <View style={Styles.cowbetween}><JbbText>{item.userName}</JbbText><JbbText>{item.mobile}</JbbText></View>
            <View style={Styles.cowbetween}><JbbText>{item.moneyInList}</JbbText><JbbText>{item.orderTimeInList}</JbbText></View>
          </View>
          <View><JbbText>Bottom</JbbText></View>
        </View>
        <Line/>
      </View>
    );
  }
}

const styles = StyleSheet.create({

});

export default connect(mapStateToProps, mapDispatchToProps)(OrderListScene)
