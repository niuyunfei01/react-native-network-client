import React, {Component} from 'react'
import ReactNative, {Alert, Modal, Platform, Dimensions} from 'react-native'
import {Button, Icon, List, Tabs,} from '@ant-design/react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {ToastShort} from '../../util/ToastUtils';
import pxToDp from '../../util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import Cts from '../../Cts'

import _ from "lodash";
import colors from "../../styles/colors";
import * as tool from "../../common/tool";
import HttpUtils from "../../util/http";
import OrderListItem from "../component/OrderListItem";
import Moment from "moment/moment";
import Config from "../../config";
import RadioItem from "@ant-design/react-native/es/radio/RadioItem";
import JbbText from "../component/JbbText";
import {Cell, CellBody, CellFooter} from "../../weui";
import native from "../../common/native";
import JPush from "jpush-react-native";
import Dialog from "../component/Dialog";
import IconBadge from "../../widget/IconBadge";

let width = Dimensions.get("window").width;
let height = Dimensions.get("window").height;

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


function FetchInform({navigation, onRefresh}) {
  React.useEffect(() => {
      onRefresh()
  }, [navigation])
  return null;
}


const labels = [];
labels[Cts.ORDER_STATUS_TO_READY] = '待打包'
labels[Cts.ORDER_STATUS_TO_SHIP] = '待配送'
labels[Cts.ORDER_STATUS_SHIPPING] = '配送中'
labels[Cts.ORDER_STATUS_DONE] = '已完结'
labels[Cts.ORDER_STATUS_ABNORMAL] = '异常'
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
  toReadyTotals: [],
  toShipTotals: [],
  shippingTotals: [],
  abnormalTotals: [],
  orderMaps: [],
  storeIds: [],
  zitiMode: 0,
  orderStatus: 0,
  sort: "expectTime asc",
  showSortModal: false,
  showMoreModal: false,
  sortData: [
    {"label": '送达时间正序(默认)', 'value': 'expectTime asc'},
    {"label": '下单时间倒序', 'value': 'orderTime desc'},
    {"label": '下单时间正序', 'value': 'orderTime asc'}
  ],
  show_voice_pop: false,
  show_inform_pop: false,
  show_hint: false,
  hint_msg: 1,
  showTabs: true,
  show_button: false,
  is_service_mgr: false,
  allow_merchants_store_bind: true,
  showBtn: false,
  yuOrders: [],
  showMore: false
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
    this.getSortList();

    if (Platform.OS !== 'ios') {
      JPush.isNotificationEnabled((enabled) => {
        this.setState({show_voice_pop: !enabled})
        if (this.state.show_voice_pop) {
          Alert.alert('开启通知', '系统通知暂未开启，开启系统通知后将会及时收到外送帮的通知提示', [
            {
              text: '忽略', style: 'cancel', onPress: () => {
                this.setState({show_hint: true, hint_msg: 1})
              }
            },
            {
              text: '去设置', onPress: () => {
                native.toOpenNotifySettings((resp, msg) => {
                  console.log(resp, msg)
                })
                // this.onPress(Config.ROUTE_SETTING);
              }
            },
          ])
        }
      })
      native.getDisableSoundNotify((disabled) => {
        this.setState({show_inform_pop: disabled})

        if (this.state.show_inform_pop && !this.state.show_voice_pop) {
          Alert.alert('语音播报', '外送帮语音播报暂未开启，导致来单没有提示，请您及时开启订单提醒', [
            {
              text: '忽略', style: 'cancel', onPress: () => {
                this.setState({show_hint: true, hint_msg: 2})
              }
            },
            {
              text: '去设置', onPress: () => {
                this.onPress(Config.ROUTE_SETTING);
              }
            },
          ])
        }
      })
    }
  }

  getSortList() {
    if (this.state.sortData.length === 0) {
      const {accessToken} = this.props.global;
      const api = `api/get_sort?access_token=${accessToken}`
      HttpUtils.get.bind(this.props)(api).then((res) => {
        this.setState({
          sortData: res,
        })
      }, () => {
        this.setState({
          sortData: [
            {"label": '送达时间正序(默认)', 'value': 'expectTime asc'},
            {"label": '下单时间倒序', 'value': 'orderTime desc'},
            {"label": '下单时间正序', 'value': 'orderTime asc'},
          ],
        })
      })

    }
  }

  componentDidMount() {
    this.getVendor()
    if (this.state.orderStatus === 0) {
      this.fetchOrders(Cts.ORDER_STATUS_TO_READY)
    }
  }

  getVendor(){
    let {is_service_mgr, allow_merchants_store_bind, currVendorId} = tool.vendor(this.props.global);
    allow_merchants_store_bind = allow_merchants_store_bind === '1' ? true : false;
    let showBtn = currVendorId === '68' ? true : false;
    console.log('allow_merchants_store_bind',allow_merchants_store_bind)
    console.log('currVendorId',currVendorId)
    this.setState({
      is_service_mgr: is_service_mgr,
      allow_merchants_store_bind: allow_merchants_store_bind,
      showBtn: showBtn,
    })
    if (this.state.orderStatus === 0) {
      this.fetchOrders(Cts.ORDER_STATUS_TO_READY)
    }
  }

  onRefresh() {
    this.fetchOrders()
  }

  onTabClick = (tabData, index) => {
    // console.log("tab:", tabData, "index:", index)
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
    const order_by = this.state.sort;
    const orderStatus = this.state.orderStatus;
    const params = {
      vendor_id: currVendorId,
      status: initQueryType,
      offset: this.state.query.offset,
      limit: this.state.query.limit,
      max_past_day: this.state.query.maxPastDays,
      ziti: zitiType,
      search: search,
      use_v2: 1,
      is_right_once: orderStatus,
      order_by: order_by
    }

    if (currVendorId && accessToken && !this.state.isFetching) {
      this.setState({isFetching: true})
      const url = `/api/orders.json?access_token=${accessToken}`;
      const init = true;
      HttpUtils.get.bind(this.props)(url, params).then(res => {
        const orderMaps = this.state.orderMaps;
        res.orders.map((item) => {
          if (item.is_right_once === true) {
            this.setState({
              yuOrders: res.orders
            })
          }
        })
        let show_button = this.state.show_button;
        if (initQueryType === 6 && res.orders.length === 0) {
          show_button = true
        }
        for (let total in res.totals) {
          if (res.totals[total] !== 0) {
            show_button = false;
          }
        }
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
          show_button: show_button,
          init
        })
        switch (initQueryType) {
          case Cts.ORDER_STATUS_TO_READY:
            this.setState({
              toReadyTotals: res.totals
            })
            break;
          case Cts.ORDER_STATUS_TO_SHIP:
            this.setState({
              toShipTotals: res.totals
            })
            break;
          case Cts.ORDER_STATUS_SHIPPING:
            this.setState({
              shippingTotals: res.totals
            })
            break;
          case Cts.ORDER_STATUS_ABNORMAL:
            this.setState({
              abnormalTotals: res.totals
            })
            break;
        }
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
      <OrderListItem showBtn={this.state.showBtn} fetchData={this.fetchOrders.bind(this)} item={item} index={index}
                     accessToken={this.props.global.accessToken} key={index}
                     onRefresh={() => this.onRefresh()}
                     onPressDropdown={this.onPressDropdown.bind(this)} navigation={this.props.navigation}
                     onPress={this.onPress.bind(this)}/>
    );
  }

  renderContent(orders, typeId) {
    let that = this;
    const seconds_passed = Moment().unix() - this.state.lastUnix[typeId];
    if (!this.state.init || seconds_passed > 60) {
      console.log(`do a render for type: ${typeId} init:${this.state.init} time_passed:${seconds_passed}`)
      this.fetchOrders(typeId)
    }
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: colors.f7, color: colors.fontColor, marginTop: pxToDp(10)}}>
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
              // flexDirection: 'row',
              height: 210
            }}>
              <Text style={{fontSize: 18, color: colors.fontColor}}>
                暂无订单
              </Text>
              <If
                condition={this.state.show_button && (this.state.allow_merchants_store_bind || this.state.is_service_mgr)}>
                <Button
                  type={'primary'}
                  onPress={() => {
                    that.onPress(Config.PLATFORM_BIND)
                  }}
                  style={{
                    width: '90%',
                    marginLeft: "2%",
                    backgroundColor: colors.main_color,
                    borderWidth: 0,
                    textAlignVertical: "center",
                    textAlign: "center",
                    marginTop: pxToDp(30)
                  }}>去授权外卖店铺</Button>
              </If>
            </View>}
          initialNumToRender={5}
        />
      </SafeAreaView>
    );
  }

  setShowTabsStatus(type) {
    this.setState({
      showTabs: type
    })
  }

  setOrderStatus(type) {

    this.setState({
      orderStatus: type,
    })
    //修改订单请求筛选参数
  }

  showSortSelect() {
    let items = []
    let that = this;
    let sort = that.state.sort;
    for (let i in this.state.sortData) {
      const sorts = that.state.sortData[i]
      items.push(<RadioItem key={i} style={{fontSize: 12, fontWeight: 'bold', backgroundColor: colors.white}}
                            checked={sort === sorts.value}
                            onChange={event => {
                              if (event.target.checked) {
                                this.setState({
                                  showSortModal: false,
                                  sort: sorts.value
                                }, () => this.fetchOrders(this.state.query.listType))
                              }
                            }}><JbbText style={{color: colors.fontBlack}}>{sorts.label}</JbbText></RadioItem>)
    }
    return <List style={{marginTop: 12}}>
      {items}
    </List>
  }

  onCancel() {
    this.setState({
      showMore: false
    })
  }

  renderTabsHead() {
    return (
      <View style={styles.tabsHeader}>
        <View style={styles.tabsHeader1}>
          {this.state.orderStatus === 0 &&
          <Text onPress={() => {
            this.setOrderStatus(0)
            this.setShowTabsStatus(1)
          }} style={styles.tabsHeader2}> 全部订单 </Text>}
          {this.state.orderStatus === 0 &&
          <Text onPress={() => {
            this.setOrderStatus(1)
            this.setShowTabsStatus(0)
            this.fetchOrders(Cts.ORDER_STATUS_PREDICT)
          }} style={styles.tabsHeader3}> 预订单 </Text>}

          {this.state.orderStatus === 1 &&
          <Text onPress={() => {
            this.setOrderStatus(0)
            this.setShowTabsStatus(1)
          }} style={styles.tabsHeader4}> 全部订单 </Text>}
          {this.state.orderStatus === 1 &&
          <Text onPress={() => {
            this.setOrderStatus(1)
            this.setShowTabsStatus(0)
            this.fetchOrders(Cts.ORDER_STATUS_PREDICT)
          }} style={styles.tabsHeader5}> 预订单 </Text>}
        </View>
        {/*<Tabs tabs={tabs} style={{width: 100,backgroundColor:'red'}} />*/}
        <View style={{flex: 1,}}></View>
        <Icon onPress={() => {
          this.onPress(Config.ROUTE_ORDER_SEARCH)
        }} name={"search"}/>
        <Text style={{margin: pxToDp(10), marginLeft: pxToDp(30), marginRight: pxToDp(30), fontSize: pxToDp(32)}}
              onPress={() => {
                this.setState({
                  showMore: true
                })
              }}>更多</Text>
        <Modal
            visible={this.state.showMore}
            animationType={"fade"}
            onRequestClose={() => this.onCancel()}
            transparent={true}
            style={styles.container}
        >
          <View style={styles.sortModal}/>
          <View style={styles.sortModalSelect}>
            <Text style={{margin: pxToDp(10), marginLeft: pxToDp(30), marginRight: pxToDp(30), fontSize: pxToDp(32),color: colors.white}}
                  onPress={() => {
                if (this.state.sortData.length === 0) {
                  ToastShort("排序选项加载中")
                } else {
                  let showSortModal = !this.state.showSortModal;
                  this.setState({showSortModal: showSortModal})
                }
              }}>排序</Text>
            <Text style={styles.goToNew} onPress={() => {this.onPress(Config.ROUTE_ORDER_SETTING, this.setState({showMore: false}))}}>新建</Text>
          </View>
        </Modal>
      </View>
    )
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

    let {currStoreId} = this.props.global;

    let lists = [];
    this.state.categoryLabels.forEach((label, typeId) => {
      let tmpId = typeId;
      if (typeId == 6) {
        tmpId = 8
      } else if (typeId == 8) {
        tmpId = 6
      }
      const orders = this.state.orderMaps[tmpId] || []
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

        <FetchInform navigation={currStoreId} onRefresh={this.getVendor.bind(this)}/>

        {this.renderTabsHead()}
        {/*<Modal style={styles.container} animationType='fade' transparent={true}*/}
        {/*       onClose={() => {*/}
        {/*         let showSortModal = !this.state.showSortModal;*/}
        {/*         this.setState({showSortModal: showSortModal})*/}
        {/*       }}*/}
        {/*       visible={this.state.showSortModal}>*/}
        <Dialog visible={this.state.showSortModal} onRequestClose={() => this.setState({showSortModal: false})}>
          {/*<View style={{*/}
          {/*  width: '55%',*/}
          {/*  position: 'absolute',*/}
          {/*  right: '3%',*/}
          {/*  top: '3.5%',*/}
          {/*}}>*/}
          {this.showSortSelect()}
          {/*</View>*/}
        </Dialog>
        {/*</Modal>*/}
        {
          this.state.showTabs ?
              <Tabs tabs={this.categoryTitles()} swipeable={false} animated={true} renderTabBar={tabProps => {
                return (<View style={{flexDirection: 'row', marginLeft: pxToDp(10)}}>{
                      [tabProps.tabs[3], tabProps.tabs[4]] = [tabProps.tabs[4], tabProps.tabs[3]],
                      tabProps.tabs.map((tab, i) => {
                      let totals = this.state.totals;
                      switch (tab.type) {
                      case Cts.ORDER_STATUS_TO_READY:
                      totals = this.state.toReadyTotals;
                      break;
                      case Cts.ORDER_STATUS_TO_SHIP:
                      totals = this.state.toShipTotals;
                      break;
                      case Cts.ORDER_STATUS_SHIPPING:
                      totals = this.state.shippingTotals;
                      break;
                      case Cts.ORDER_STATUS_ABNORMAL:
                      totals = this.state.abnormalTotals;
                      break;
                    }
                      let total = totals[tab.type] || '0';
                      return <TouchableOpacity activeOpacity={0.9}
                      key={tab.key || i}
                      style={{width: width * 0.2, borderBottomWidth: tabProps.activeTab === i ? pxToDp(3) : pxToDp(0), borderBottomColor: tabProps.activeTab === i ? colors.main_color : colors.white, paddingVertical: 10, paddingLeft: 10}}
                      onPress={() => {
                      const {goToTab, onTabClick} = tabProps;
                      onTabClick(tab, i);
                      goToTab && goToTab(i);
                    }}>
                      <View>
                      <Text style={{width: width, ...Platform.select({
                      ios: {
                      lineHeight: 40,
                    },
                      android: {
                      lineHeight: 40,
                    }
                    }),color: tabProps.activeTab === i ? 'green' : 'black',}}>
                    {(tab.type === Cts.ORDER_STATUS_DONE) ? tab.title : `${tab.title}(${total})`}
                      </Text>
                      </View>
                      </TouchableOpacity>;
                    })}</View>
                )
              }
              } onTabClick={() => {
              }} onChange={this.onTabClick}>
                {lists}
              </Tabs>  :
              <View style={{flex: 1}}>
                <SafeAreaView style={{flex: 1, backgroundColor: colors.f7, color: colors.fontColor, marginTop: pxToDp(10)}}>
                  <FlatList
                      extraData={this.state.yuOrders}
                      data={this.state.yuOrders}
                      legacyImplementation={false}
                      directionalLockEnabled={true}
                      onTouchStart={(e) => {
                        this.pageX = e.nativeEvent.pageX;
                        this.pageY = e.nativeEvent.pageY;
                      }}
                      onEndReachedThreshold={0.5}
                      renderItem={this.renderItem}
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
                              暂无订单
                            </Text>
                          </View>}
                      initialNumToRender={5}
                  />
                </SafeAreaView>
              </View>
        }


        {this.state.show_hint &&
        <Cell customStyle={[styles.cell_row]}>
          <CellBody>
            {this.state.hint_msg === 1 && <Text style={[styles.cell_body_text]}>系统通知未开启</Text> ||
            <Text style={[styles.cell_body_text]}>消息铃声异常提醒</Text>}
          </CellBody>
          <CellFooter>
            <Text style={[styles.button_status]} onPress={() => {
              if (this.state.hint_msg === 1) {
                native.toOpenNotifySettings((resp, msg) => {
                  console.log(resp, msg)
                })
              }
              if (this.state.hint_msg === 2) {
                this.onPress(Config.ROUTE_SETTING);
              }
            }}>去查看</Text>
          </CellFooter>
        </Cell>}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  cell_row: {
    marginLeft: 0,
    paddingLeft: pxToDp(20),
    backgroundColor: "#F2DDE0",
    height: pxToDp(70),
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  button_status: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    padding: pxToDp(7),
    backgroundColor: colors.warn_color,
    borderRadius: pxToDp(3),
    color: colors.white,
  },
  printer_status_ok: {
    color: colors.main_color,
  },
  printer_status_error: {
    color: '#f44040',
  },
  searchBarPrefix: {
    flexDirection: 'row',
    width: pxToDp(140),
    flex: 1,
    position: 'relative',
    alignItems: 'center'
  },
  label_box: {
    backgroundColor: colors.white,
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(10),
  },
  alert_msg: {
    paddingHorizontal: pxToDp(5),
    paddingVertical: pxToDp(10),
    fontSize: pxToDp(28),
    color: colors.color999,
  },
  label_view: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label_style: {
    textAlign: 'center',
    textAlignVertical: 'center',
    borderWidth: pxToDp(1),
    borderColor: colors.color999,
    margin: pxToDp(10),
    borderRadius: 13,
    paddingVertical: pxToDp(8),
    paddingHorizontal: pxToDp(20),
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fontGray,
  },
  goToNew: {
    margin: pxToDp(10),
    marginLeft: pxToDp(30),
    marginRight: pxToDp(30),
    fontSize: pxToDp(32),
    color: colors.white
  },
  tabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: "nowrap",
    marginTop: pxToDp(5),
    width: width
  },
  tabsHeader1: {
    backgroundColor: colors.colorDDD,
    // width: pxToDp(400),
    width: 0.6 * width,
    padding: pxToDp(5),
    borderRadius: pxToDp(5),
    // height:pxToDp(120),
    flexDirection: 'row',
    marginLeft: pxToDp(10)
  },
  tabsHeader2: {
    padding: pxToDp(10),
    borderRadius: pxToDp(10),
    // width: pxToDp(190),
    width: 0.3 * width,
    fontSize: pxToDp(32),
    textAlign: "center",
    backgroundColor: colors.white
  },
  tabsHeader3: {
    padding: pxToDp(10),
    borderRadius: pxToDp(10),
    // marginLeft: pxToDp(10),
    // width: pxToDp(190),
    marginLeft: 0.025 * width,
    width: 0.25 * width,
    fontSize: pxToDp(32),
    textAlign: "center"
  },
  tabsHeader4: {
    padding: pxToDp(10),
    borderRadius: pxToDp(10),
    // width: pxToDp(190),
    width: 0.3 * width,
    fontSize: pxToDp(32),
    textAlign: "center"
  },
  tabsHeader5: {
    padding: pxToDp(10),
    borderRadius: pxToDp(10),
    // marginLeft: pxToDp(10),
    // width: pxToDp(190),
    marginLeft: 0.025 * width,
    width: 0.25 * width,
    fontSize: pxToDp(32),
    textAlign: "center",
    backgroundColor: colors.white
  },
  sortModal: {
    width: 0,
    height: 0,
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(0,0,0,0.75)',
    position: "absolute",
    top: 37,
    left: 350,
  },
  sortModalSelect: {
    width: '30%',
    position: 'absolute',
    right: '3%',
    top: '6%',
    backgroundColor:'rgba(0,0,0,0.75)',
    borderRadius: pxToDp(10)
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderListScene)
