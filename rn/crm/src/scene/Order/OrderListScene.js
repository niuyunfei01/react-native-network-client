import React, {Component} from 'react'
import ReactNative, {Alert, Dimensions, Image, Platform, StatusBar} from 'react-native'
import {Button, Icon, List,} from '@ant-design/react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../../util/pxToDp';
import {delayRemind, fetchRemind, fetchRemindCount, updateRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'
import {setExtStore} from '../../reducers/global/globalActions'
import {hideModal, showModal, ToastShort} from '../../util/ToastUtils';
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
import {MixpanelInstance} from '../../common/analytics';
import ModalDropdown from "react-native-modal-dropdown";
import SearchExtStore from "../component/SearchExtStore";
import Buttons from 'react-native-vector-icons/Entypo';

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

const dropDownImg = require("../../img/Order/pull_down.png");
const dropUpImg = require("../../img/Order/pull_up.png");

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

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh("fresh")
    });
    return unsubscribe;
  }, [navigation])
  return null;
}


function FetchInform({navigation, onRefresh}) {
  React.useEffect(() => {
    onRefresh()
  }, [navigation])
  return null;
}


const initState = {
  canSwitch: true,
  isLoading: false,
  showStopRemindDialog: false,
  showDelayRemindDialog: false,
  opRemind: {},
  localState: {},
  categoryLabels: [
    {tabname: '待打包',num: 0, status: '1'},
    {tabname: '待配送',num: 0, status: '2'},
    {tabname: '配送中',num: 0, status: '3'},
    {tabname: '异常', num: 0,status: '8'},
  ],

  otherTypeActive: 3,
  init: false,
  storeId: '',
  lastUnix: {},
  query: {
    listType: null,
    offset: 0,
    oldoffset: -1,
    page: 1,
    limit: 10,
    maxPastDays: 100,
    isAdd: true,
    isFin: true,

  },

  ListData: [],
  toReadyTotals: [],
  toShipTotals: [],
  shippingTotals: [],
  abnormalTotals: [],
  orderMaps: [],
  storeIds: [],
  zitiMode: 0,
  orderStatus: 1,
  sort: "expectTime asc",
  showSortModal: false,
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
  img: '',
  showimgType: 1,
  showimg: true,
  activityUrl: '',
  activity: [],
  toggleImg: dropDownImg,
  allow_edit_ship_rule: false,
  ext_store_list: [],
  ext_store_id: 0,
  searchStoreVisible: false,
  ext_store_name: '所有外卖店铺',
};

class OrderListScene extends Component {
  state = initState;

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    let {currentUser} = this.props.global;
    if (tool.length(currentUser) > 0) {
      this.mixpanel.identify(currentUser);
    }
    this.mixpanel.track("orderpage_view", {})
    this.renderItem = this.renderItem.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.getActivity();
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

  static getDerivedStateFromProps(props, state) {
    if (props.global.currStoreId !== state.storeId) {
      return {...initState, storeId: props.global.currStoreId, init: false, lastUnix: {}}
    }
    return null;
  }

  getActivity() {
    const {accessToken, currStoreId} = this.props.global;
    const api = `api/get_activity_info?access_token=${accessToken}`
    let data = {
      "storeId": currStoreId,
      "pos": 1
    }
    HttpUtils.post.bind(this.props)(api, data).then((res) => {
      if (tool.length(res) > 0) {
        this.setState({
          img: res.banner,
          showimgType: res.can_close,
          activityUrl: res.url + '?access_token=' + accessToken,
          activity: res,
        })
        this.mixpanel.track("act_user_ref_ad_view", {
          img_name: res.name,
          pos: res.pos_name,
          store_id: currStoreId,
        });
      }
    })
  }

  closeActivity() {
    const {accessToken, currStoreId} = this.props.global;
    const api = `api/close_user_refer_ad?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
    })
    this.mixpanel.track("close_user_refer_ad", {
      img_name: this.state.activity.name,
      pos: this.state.activity.pos_name,
      store_id: currStoreId,
    });
  }

  getVendor() {
    let {is_service_mgr, allow_merchants_store_bind, wsb_store_account} = tool.vendor(this.props.global);
    allow_merchants_store_bind = allow_merchants_store_bind === '1' ? true : false;
    this.setState({
      is_service_mgr: is_service_mgr,
      allow_merchants_store_bind: allow_merchants_store_bind,
      showBtn: wsb_store_account,
    })
    this.fetchOrders(1)
    this.getstore()
    this.clearStoreCache()
  }

  getstore() {
    this.setState({
      show_button: false,
    })
    const {dispatch} = this.props
    const {accessToken, currStoreId} = this.props.global;
    if (currStoreId > 0) {
      const api = `/api/get_store_business_status/${currStoreId}?access_token=${accessToken}`
      HttpUtils.get.bind(this.props)(api).then(res => {
        if (res.business_status.length > 0) {
          let all_store = {
            id: "0",
            name: "A所有外卖店铺",
            poi_name: "A所有外卖店铺",
          }
          res.business_status.push(all_store)
          dispatch(setExtStore(res.business_status));
          this.setState({
            ext_store_list: res.business_status,
            allow_edit_ship_rule: res.allow_edit_ship_rule
          })
        } else {
          this.setState({
            show_button: true,
            allow_edit_ship_rule: res.allow_edit_ship_rule
          })
        }

      })
    }
  }

  clearStoreCache() {
    const self = this;
    const {accessToken, currStoreId} = self.props.global;
    const api = `/api/get_store_balance/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(self.props.navigation)(api).then(res => {
      let balance = res.sum
      if (balance < 0) {
        Alert.alert('提醒', '余额不足请充值', [
          {
            text: '取消'
          },
          {
            text: '去充值',
            onPress: () => {
              this.props.navigation.navigate(Config.ROUTE_ACCOUNT_FILL, {
                onBack: (res) => {
                  Alert.alert('提醒', '余额不足期间系统自动发单失败，充值成功后，系统将重新自动发单', [
                    {
                      text: '确定'
                    }
                  ])
                }
              });
            }
          }
        ])
      }
    })
  }

  onTabClick = (status) => {

    if (!this.state.query.isFin) {
      return
    }

    const query = this.state.query;
    if (query.listType !== status) {
      query.listType = status
      this.setState({isLoading: true, listData: []}, () => {
        this.onRefresh(status)
      })
    }
  }

  _onItemClick(info) {
    // 在这里重新刷新待配送页面
    console.log(info);
    this.onRefresh(this.state.categoryLabels[1].status)
  }

  onRefresh(status) {

    if (status === 'fresh' && !this.props.global.isorderFresh) {

      return
    }

    this.state.query.page = 1;
    this.state.query.oldoffset = -1;
    this.state.query.isFin = true;
    this.state.query.isAdd = true;
    this.state.query.offset = 0;

    this.state.listData = [];
    this.setState({isLoading: true, listData: []}, () => {
      this.fetchOrders(status)
    })


  }
  // 新订单1  待取货  106   配送中 1
   fetorderNum = (arr)=>{  //对新版tab订单进行循环
    let tabarr = arr;
     let {currStoreId} = this.props.global;
      for(let i in arr){
        // console.log(i)
        let params = {
          status: arr[i].status,
          search: `store:${currStoreId}`,

          use_v2: 1,
        }
        const accessToken = this.props.global.accessToken;
        const url = `/api/orders_list.json?access_token=${accessToken}`;
        HttpUtils.get.bind(this.props)(url, params).then(res => {
          console.log('status = '+arr[i].status,'i='+i ,"num = "+res.tabs[i].num,  res)
          tabarr[i].num = res.tabs[i].num;
          this.setState({
            categoryLabels:tabarr})
        })

      }

   }

  fetchOrders = (queryType) => {
    let that = this;
    if (this.state.query.oldoffset === this.state.offset) {
      return
    }
    if (this.state.query.offset === 0) {
      this.state.ListData = [];
    }

    if (!this.state.query.isFin) {
      return
    }
    this.state.query.isFin = false;
    let {currStoreId} = this.props.global;
    let zitiType = this.state.zitiMode ? 1 : 0;
    let search = `store:${currStoreId}`;
    const accessToken = this.props.global.accessToken;
    const {currVendorId} = tool.vendor(this.props.global);
    let initQueryType = "";
    const order_by = this.state.sort;
    const orderStatus = this.state.orderStatus;
    let params = {
      vendor_id: currVendorId,
      offset: this.state.query.offset,
      limit: 10,
      max_past_day: 100,
      ziti: zitiType,
      search: search,
      use_v2: 1,
      is_right_once: orderStatus, //预订单类型
      order_by: order_by
    }
    if (queryType !== 'fresh') {
      initQueryType = queryType || this.state.query.listType;
      params.status = initQueryType;
    }
    showModal("加载中")
    let {show_orderlist_ext_store} = this.props.global;
    if (this.state.ext_store_id > 0 && show_orderlist_ext_store === true) {
      params.search = 'ext_store_id_lists:' + this.state.ext_store_id + '*store:' + currStoreId;
    }

    if (currVendorId && accessToken && !this.state.isFetching) {
      this.setState({isFetching: true})
      const url = `/api/orders_list.json?access_token=${accessToken}`;
      const init = true;
      HttpUtils.get.bind(this.props)(url, params).then(res => {
        hideModal()

        if (this.props.global.isorderFresh) {
          that.state.query.listType = res.tabs[0].status;
        }

        if(tool.length(res.tabs)>4){//当数组长度为5的时候 循环便利数据
            this.fetorderNum(res.tabs)
        }
        this.props.global.isorderFresh = false
        if (tool.length(res.orders) < 10) {
          that.state.query.isAdd = false;
        }
        if (!that.state.query.listType) {
          that.state.query.listType = res.tabs[0].status;
        }

        that.state.query.isFin = true;
        that.state.query.page++;
        that.state.query.oldoffset = that.state.query.offset;
        that.state.query.offset = Number(that.state.query.page - 1) * 10;

        const lastUnix = this.state.lastUnix;
        lastUnix[initQueryType] = Moment().unix();
        this.setState({
          categoryLabels: res.tabs,
          ListData: that.state.ListData.concat(res.orders),
          storeId: currStoreId,
          lastUnix,
          isFetching: false,
          isLoading: false,
          isLoadingMore: false,
          // show_button: show_button,
          init
        })
      }, (res) => {
        const lastUnix = this.state.lastUnix;
        lastUnix[initQueryType] = Moment().unix();
        this.setState({
          isLoading: false,
          errorMsg: res.reason,
          isLoadingMore: false,
          isFetching: false,
          lastUnix,
          init
        })
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

  onEndReached() {
  }

  renderFooter() {

  }

  renderItem(order) {
    let {item, index} = order;
    let {allow_edit_ship_rule} = this.state;
    return (
      <OrderListItem showBtn={this.state.showBtn} fetchData={this.fetchOrders.bind(this)} item={item}
                     index={index}
                     accessToken={this.props.global.accessToken} key={index}
                     onRefresh={() => this.onRefresh()}
                     onPressDropdown={this.onPressDropdown.bind(this)} navigation={this.props.navigation}
                     vendorId={this.props.global.config.vendor.id}
                     allow_edit_ship_rule={allow_edit_ship_rule}
                     onPress={this.onPress.bind(this)}/>
    );
  }

  renderNoOrder() {
    return (
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
              this.mixpanel.track("orderpage_authorizestore_click", {});
              this.onPress(Config.PLATFORM_BIND)
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
      </View>
    )
  }

  listmore() {
    if (this.state.query.isAdd) {
      console.log("加载更多")
      this.fetchOrders();

    }

  }

  renderContent(orders) {
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
          renderItem={this.renderItem}
          onEndReachedThreshold={0.5}
          onEndReached={this.listmore.bind(this)}
          onRefresh={this.onRefresh.bind(this)}
          refreshing={this.state.isLoading}
          keyExtractor={this._keyExtractor}
          shouldItemUpdate={this._shouldItemUpdate}
          getItemLayout={this._getItemLayout}
          ListFooterComponent={this.renderbottomImg()}
          ListHeaderComponent={this.rendertopImg()}
          ListEmptyComponent={this.renderNoOrder()}
          initialNumToRender={5}
        />
      </SafeAreaView>
    );
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
                                }, () => this.onRefresh(this.state.query.listType))
                              }
                            }}><JbbText style={{color: colors.fontBlack}}>{sorts.label}</JbbText></RadioItem>)
    }
    return <List style={{marginTop: 12}}>
      {items}
    </List>
  }

  renderTabsHead() {
    return (
      <View style={styles.tabsHeader}>
        <View style={styles.tabsHeader1}>
          <Text onPress={() => {
            this.setState({
              showTabs: true,
              orderStatus: 1,
            })
          }}
                style={this.state.orderStatus === 1 ? styles.tabsHeader2 : [styles.tabsHeader2, styles.tabsHeader3]}> 处理中 </Text>
          <Text onPress={() => {
            this.setState({
              showTabs: false,
              orderStatus: 7,
            }, () => {
              this.fetchOrders()
            })
          }}
                style={this.state.orderStatus === 7 ? styles.tabsHeader2 : [styles.tabsHeader2, styles.tabsHeader3]}> 预订单 </Text>
          <Text onPress={() => {
            const {navigation} = this.props
            navigation.navigate(Config.ROUTE_ORDER_SEARCH_RESULT, {max_past_day: 180})
          }}
                style={this.state.orderStatus === 0 ? styles.tabsHeader2 : [styles.tabsHeader2, styles.tabsHeader3]}> 全部订单 </Text>
        </View>
        <View style={{flex: 1}}></View>
        <Icon onPress={() => {
          this.onPress(Config.ROUTE_ORDER_SEARCH)
        }} name={"search"}/>
        <ModalDropdown
          dropdownStyle={{
            marginRight: pxToDp(10),
            width: pxToDp(150),
            height: pxToDp(180),
            backgroundColor: '#5f6660',
            marginTop: -StatusBar.currentHeight,
          }}
          dropdownTextStyle={{
            textAlignVertical: 'center',
            textAlign: 'center',
            fontSize: pxToDp(28),
            fontWeight: 'bold',
            color: '#fff',
            height: pxToDp(90),
            backgroundColor: '#5f6660',
            borderRadius: pxToDp(3),
            borderColor: '#5f6660',
            borderWidth: 1,
            shadowRadius: pxToDp(3),
          }}
          dropdownTextHighlightStyle={{
            color: '#fff'
          }}
          onDropdownWillShow={() => this.setState({
            toggleImg: dropUpImg
          })}
          onDropdownWillHide={() => this.setState({
            toggleImg: dropDownImg
          })}
          options={['新 建', '排 序']}
          defaultValue={''}
          onSelect={(e) => {
            if (e === 0) {
              this.onPress(Config.ROUTE_ORDER_SETTING)
            } else {
              let showSortModal = !this.state.showSortModal;
              this.setState({showSortModal: showSortModal})
            }
          }}
        >


          <View style={{
            marginRight: pxToDp(20),
            marginLeft: pxToDp(20),
          }}>
            <Icon name={"menu"}/>
          </View>
        </ModalDropdown>
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


  onSelectedItemsChange = (store_categories) => {
    this.setState({ext_store: store_categories});
  };

  onPressActivity() {
    const {currStoreId} = this.props.global;
    this.onPress(Config.ROUTE_WEB, {url: this.state.activityUrl, title: '老带新活动'})
    this.mixpanel.track("act_user_ref_ad_click", {
      img_name: this.state.activity.name,
      pos: this.state.activity.pos_name,
      store_id: currStoreId,
    });
  }

  rendertopImg() {
    return (
      <If condition={this.state.img !== '' && this.state.showimgType === 1 && this.state.showimg}>
        <TouchableOpacity onPress={() => {
          this.onPressActivity()
        }} style={{
          paddingBottom: pxToDp(20),
          paddingLeft: '3%',
          paddingRight: '3%',
        }}>
          <Image source={{uri: this.state.img}} resizeMode={'contain'} style={styles.image}/>
          <Text
            onPress={() => {
              this.setState({
                showimg: false
              }, () => this.closeActivity())
            }}
            style={{
              position: 'absolute',
              right: '1%',
              width: pxToDp(40),
              height: pxToDp(40),
              borderRadius: pxToDp(20),
              backgroundColor: colors.fontColor,
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.listTitleColor,
              textAlignVertical: 'center',
              ...Platform.select({
                ios: {
                  lineHeight: 30,
                },
                android: {}
              }),
            }}>❌</Text>
        </TouchableOpacity>
      </If>
    )
  }

  renderbottomImg() {
    return (
      <If condition={this.state.img !== '' && this.state.showimgType !== 1 && this.state.showimg}>
        <TouchableOpacity onPress={() => {
          this.onPressActivity()
        }} style={{
          paddingTop: '5%',
          paddingLeft: '3%',
          paddingRight: '3%',
        }}>
          <Image source={{uri: this.state.img}} resizeMode={'contain'} style={styles.image}/>
        </TouchableOpacity>
      </If>
    )
  }


  render() {

    let {currStoreId, show_orderlist_ext_store} = this.props.global;


    let lists = [];
    //初始化页面
    let typeId = this.state.categoryLabels[0].status;
    let tmpId = typeId;


    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.onRefresh.bind(this, "fresh")}/>
        <FetchInform navigation={currStoreId} onRefresh={this.getVendor.bind(this)}/>
        {this.renderTabsHead()}
        <Dialog visible={this.state.showSortModal} onRequestClose={() => this.setState({showSortModal: false})}>
          {this.showSortSelect()}
        </Dialog>

        {this.state.ext_store_list.length > 0 && show_orderlist_ext_store === true ?
          <View style={{
            // padding: pxToDp(20),
            flexDirection: 'row',
            lineHeight: 30,
            paddingLeft: '2%',
            // padding: pxToDp(20),
            paddingTop: 10,
            paddingBottom: 6,
            backgroundColor: colors.white
          }}>
            <Text
              onPress={() => {
                this.setState({searchStoreVisible: true})
              }}
              style={{fontSize: pxToDp(30), marginTop: pxToDp(3)}}>{this.state.ext_store_name}</Text>
            <Buttons name='chevron-thin-right' style={[styles.right_btn]}/>
          </View> : null}
        <SearchExtStore visible={this.state.searchStoreVisible}
                        data={this.state.ext_store_list}
                        onClose={() => this.setState({
                          searchStoreVisible: false,
                          ext_store_name: '所有外卖店铺',
                          ext_store_id: 0
                        })}
                        onSelect={(item) => {
                          if (item.id === "0") {
                            item.name = '所有外卖店铺'
                          }
                          this.setState({
                            searchStoreVisible: false, ext_store_id: item.id, ext_store_name: item.name
                          }, () => {
                            this.fetchOrders()
                          })
                        }}/>


        {
          this.state.showTabs ?
            //全部订单
            <View style={{flex: 1}}>
              {/*顶部选项卡*/}
              <View style={{flexDirection: 'row', backgroundColor: colors.white, height: 40,}}>

                {this.state.categoryLabels.map((tab, i) => {
                  const tabwidth = 1 / this.state.categoryLabels.length;
                  return <View
                    style={{
                      width: tabwidth * width,
                      alignItems: 'center',
                      position: 'relative',
                      borderBottomWidth: this.state.query.listType === tab.status ? 3 : 0,
                      borderBottomColor: colors.main_color,
                    }}>
                    <Text style={{
                      color: this.state.query.listType === tab.status ? 'green' : 'black',
                      lineHeight: 40
                    }} onPress={() => {

                      let query = {
                        listType: tab.status,

                      };
                      this.setState({
                        query,
                        ListData: [],
                      })
                      this.onTabClick(tab.status)

                    }
                    }>{tab.tabname}</Text>
                    <If condition={tab.num > 0}>
                      <View style={{
                        position: 'absolute',
                        right: 6,
                        top: 4,
                        width: 20,
                        height: 20,
                        lineHeight: 16,
                        fontSize: 10,
                        textAlign: 'center',
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: 12
                      }}>
                        <Text style={{
                          textAlign: 'center',

                          color: 'white',
                          borderRadius: 12
                        }}>{tab.num}</Text>
                      </View>
                    </If>
                  </View>
                })}

              </View>
              {/*ListData*/}
              {this.renderContent(this.state.ListData)}
            </View>

            :

            this.renderContent(this.state.ListData)
        }

        {this.state.show_hint ?
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              {this.state.hint_msg === 1 && <Text style={[styles.cell_body_text]}>系统通知未开启</Text> ||
              <Text style={[styles.cell_body_text]}>消息铃声异常提醒</Text>}
            </CellBody>
            <CellFooter>
              <Text style={[styles.button_status]} onPress={() => {
                if (this.state.hint_msg === 1) {
                  native.toOpenNotifySettings((resp, msg) => {
                  })
                }
                if (this.state.hint_msg === 2) {
                  this.onPress(Config.ROUTE_SETTING);
                }
              }}>去查看</Text>
            </CellFooter>
          </Cell> : null}

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
    backgroundColor: colors.white,
    marginTop: pxToDp(5),
    width: width
  },
  tabsHeader1: {
    backgroundColor: colors.white,
    width: 0.66 * width,
    padding: pxToDp(8),
    paddingLeft: pxToDp(0),
    borderRadius: pxToDp(15),
    borderWidth: pxToDp(1),
    borderColor: colors.main_color,
    flexDirection: 'row',
    marginLeft: pxToDp(10)
  },
  tabsHeader2: {
    padding: pxToDp(10),
    borderRadius: pxToDp(18),
    width: 0.2 * width,
    fontSize: pxToDp(26),
    textAlign: "center",
    marginLeft: pxToDp(10),
    color: colors.white,
    backgroundColor: colors.main_color
  },
  tabsHeader3: {
    color: colors.title_color,
    backgroundColor: colors.white,
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: pxToDp(10)
  },
  image: {
    width: '100%',
    height: pxToDp(200),
    borderRadius: pxToDp(15)
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderListScene)
