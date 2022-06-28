import React, {Component} from 'react'
import {
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  InteractionManager,
  View,
  SafeAreaView,
  Alert,
  Dimensions,
  Platform,
  StatusBar, Modal
} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../../pubilc/util/pxToDp';
import * as globalActions from '../../reducers/global/globalActions'
import {setExtStore, setUserCfg} from '../../reducers/global/globalActions'
import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import OrderListItem from "../../pubilc/component/OrderListItem";
import Config from "../../pubilc/common/config";
import RadioItem from "@ant-design/react-native/es/radio/RadioItem";
import {Cell, CellBody, CellFooter} from "../../weui";
import tool, {simpleStore} from "../../pubilc/util/tool";
import native from "../../pubilc/util/native";
import JPush from "jpush-react-native";
import Dialog from "../common/component/Dialog";
import {MixpanelInstance} from '../../pubilc/util/analytics';
import ModalDropdown from "react-native-modal-dropdown";
import SearchExtStore from "../common/component/SearchExtStore";
import Entypo from 'react-native-vector-icons/Entypo';
import {showError} from "../../pubilc/util/ToastUtils";
import GlobalUtil from "../../pubilc/util/GlobalUtil";
import {Badge, Button, Image} from "react-native-elements";
import FloatServiceIcon from "../common/component/FloatServiceIcon";
import {calcMs} from "../../pubilc/util/AppMonitorInfo";
import {getTime} from "../../pubilc/util/TimeUtil";
import {bundleFilePath, exists, deleteFile, createFile} from "../../pubilc/util/FileUtil";
import RNFetchBlob from "rn-fetch-blob";
import Cts from "../../pubilc/common/Cts";
import RemindModal from "../../pubilc/component/remindModal";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {remind, global, device} = state;
  return {remind: remind, global: global, device: device}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

function FetchInform({navigation, onRefresh}) {
  React.useEffect(() => {
    onRefresh()
  }, [navigation])
  return null;
}

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}


const initState = {
  showNewVersionVisible: false,
  newVersionInfo: {},
  downloadFileProgress:'',
  isLoading: false,
  categoryLabels: [
    {tabname: '待打包', num: 0, status: 1},
    {tabname: '待配送', num: 0, status: 2},
    {tabname: '配送中', num: 0, status: 3},
    {tabname: '异常', num: 0, status: 8},
  ],
  query: {
    listType: null,
    offset: 0,
    page: 1,
    limit: 10,
    maxPastDays: 100,
    isAdd: true,
  },
  sortData: [
    {"label": '送达时间正序', 'value': 'expectTime asc'},
    {"label": '下单时间倒序', 'value': 'orderTime desc'},
    {"label": '下单时间正序', 'value': 'orderTime asc'}
  ],
  opRemind: {},
  storeId: 0,
  ListData: [],
  orderStatus: 1,
  sort: "expectTime asc",
  showSortModal: false,
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
  allow_edit_ship_rule: false,
  ext_store_list: [],
  ext_store_id: 0,
  orderNum: {},
  searchStoreVisible: false,
  isCanLoadMore: false,
  ext_store_name: '所有外卖店铺',
  isadditional: ''
};
const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}
const platform=Platform.OS==='android'?'Android-Bundle':'IOS-Bundle'

class OrderListScene extends Component {
  state = initState;

  constructor(props) {
    super(props);
    timeObj.method.push({startTime: getTime(), methodName: 'componentDidMount'})
    this.mixpanel = MixpanelInstance;
    let {currentUser} = this.props.global;
    if (tool.length(currentUser) > 0) {
      this.mixpanel.identify(currentUser);
    }

    this.mixpanel.track("orderpage_view", {})
    this.renderItem = this.renderItem.bind(this);
    this.getActivity();

    GlobalUtil.setOrderFresh(1)


  }

  openAndroidNotification = () => {
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

      native.xunfeiIdentily((resp) => {
        console.log(resp, 'kedaxunfei');
      })

    }
  }

  componentDidMount() {
    const {global, dispatch} = this.props
    simpleStore(global, dispatch)
    this.openAndroidNotification();
    this.getNewVersionInfo()
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
    timeObj['componentName'] = "OrderListScene"
    timeObj['is_record_request_monitor'] = config.is_record_request_monitor
    calcMs(timeObj, accessToken)
  }

  getNewVersionInfo=()=>{
    const url='/v1/new_api/Version/getBundleUrl'
    const version=__DEV__?'5':Cts.BUNDLE_VERSION;
    const params={platform:platform,version:version}
    HttpUtils.get.bind(this.props)(url,params).then(res=>{
      if(parseInt(res.android)>version)
        this.setState({newVersionInfo:res,showNewVersionVisible:true})
      console.log('res',res)
    }).catch(error=>{showError(error)})
  }

  updateBundle=(newVersionInfo)=>{
    RNFetchBlob.fetch('GET',newVersionInfo.bundle_url,{'Content-Type':'octet-stream'})
        .progress({count:10},(received, total)=>{
          const downloadFileProgress=parseInt(`${(received/total)*100}`)
          this.setState({downloadFileProgress:`${downloadFileProgress}%`})
        })
        .then(async (resp) => {
          const status = resp.info().status;
          const fileNameArray = newVersionInfo.bundle_url.split('/');
          const fileName = fileNameArray[fileNameArray.length - 1];
          const filepath = bundleFilePath + '/' + fileName;
          const existFile = await exists(filepath);
          if (existFile) {
            await deleteFile(filepath)
          }
          if (status === 200) {
            const content = resp.text()
            await createFile(filepath, content)
            this.setState({downloadFileProgress:'下载完成，请重新打开软件'})
          }
        }).catch(error => showError(error))
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(timeObj.method.length > 0) {
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

  getActivity = () => {
    const {accessToken, currStoreId} = this.props.global;
    const api = `api/get_activity_info?access_token=${accessToken}`
    let data = {
      storeId: currStoreId,
      pos: 1
    }
    HttpUtils.post.bind(this.props)(api, data, true).then((res) => {
      const{obj} = res
      timeObj.method.push({
        interfaceName: api,
        startTime: res.startTime,
        endTime: res.endTime,
        executeTime: res.endTime - res.startTime,
        executeStatus: res.executeStatus,
        methodName: 'getActivity'
      })
      if (tool.length(obj) > 0) {
        this.setState({
          img: obj.banner,
          showimgType: obj.can_close,
          activityUrl: obj.url + '?access_token=' + accessToken,
          activity: obj,
        })
        this.mixpanel.track("act_user_ref_ad_view", {
          img_name: obj.name,
          pos: obj.pos_name,
          store_id: currStoreId,
        });
      }
    }).catch(error => {
      timeObj.method.push({
        interfaceName: api,
        startTime: error.startTime,
        endTime: error.endTime,
        executeTime: error.endTime - error.startTime,
        executeStatus: error.executeStatus,
        methodName: 'getActivity'
      })
    })
  }

  closeActivity = () => {
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

  getVendor = () => {
    let {is_service_mgr, allow_merchants_store_bind, wsb_store_account} = tool.vendor(this.props.global);
    this.setState({
      is_service_mgr: is_service_mgr,
      allow_merchants_store_bind: allow_merchants_store_bind === '1',
      showBtn: wsb_store_account,
    })
    this.getstore()
    this.clearStoreCache()
  }

  getstore = () => {
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

  clearStoreCache = () => {
    const {accessToken, currStoreId} = this.props.global;
    const api = `/api/get_store_balance/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props.navigation)(api).then(res => {
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


  onRefresh = (status) => {
    tool.debounces(() => {
      if (GlobalUtil.getOrderFresh() === 2 || this.state.isLoading) {
        GlobalUtil.setOrderFresh(1)
        if (this.state.isLoading) this.state.isLoading = true;
        return null;
      }
      this.state.query.page = 1;
      this.state.query.isAdd = true;
      this.state.query.offset = 0;
      this.fetchOrders(status)
    }, 600)
  }

  // 新订单1  待取货  106   配送中 1
  fetorderNum = () => {
    let {currStoreId} = this.props.global;
    let params = {
      search: `store:${currStoreId}`,
    }

    if (this.state.ext_store_id > 0 && this.props.global.show_orderlist_ext_store) {
      params.search = 'ext_store_id_lists:' + this.state.ext_store_id + '*store:' + currStoreId;
    }

    const accessToken = this.props.global.accessToken;
    const url = `/v1/new_api/orders/orders_count?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url, params, true).then(res => {
      const {obj} = res
      timeObj.method.push({
        interfaceName: url,
        startTime: res.startTime,
        endTime: res.endTime,
        executeTime: res.endTime - res.startTime,
        executeStatus: res.executeStatus,
        methodName: 'fetorderNum'
      })
      this.setState({
        orderNum: obj.totals,
        isadditional: obj?.delvery_reship_count !== undefined && Number(obj.delvery_reship_count) === 1
      })
    }).catch(error => {
      timeObj.method.push({
        interfaceName: url,
        startTime: error.startTime,
        endTime: error.endTime,
        executeTime: error.endTime - error.startTime,
        executeStatus: error.executeStatus,
        methodName: 'fetorderNum'
      })
    })

  }

  fetchOrders = (queryType, setList = 1) => {
    this.fetorderNum();
    if (this.state.isLoading || !this.state.query.isAdd) {
      return null;
    }
    const {currVendorId} = tool.vendor(this.props.global);
    let {currStoreId, accessToken, show_orderlist_ext_store, user_config} = this.props.global;
    let search = `store:${currStoreId}`;
    let initQueryType = "";
    const order_by = user_config !== undefined && user_config?.order_list_by ? user_config?.order_list_by : 'expectTime asc';
    initQueryType = queryType || this.state.orderStatus;
    this.setState({
      orderStatus: initQueryType,
      isLoading: true,
    })

    let params = {
      status: initQueryType,
      vendor_id: currVendorId,
      offset: this.state.query.offset,
      limit: this.state.query.limit,
      max_past_day: 100,
      search: search,
      use_v2: 1,
      is_right_once: this.state.orderStatus === 7 ? 7 : 1, //预订单类型
      order_by: order_by
    }
    if (this.state.ext_store_id > 0 && show_orderlist_ext_store) {
      params.search = 'ext_store_id_lists:' + this.state.ext_store_id + '*store:' + currStoreId;
    }
    if (currVendorId && accessToken) {
      const url = `/api/orders_list.json?access_token=${accessToken}`;
      HttpUtils.get.bind(this.props)(url, params).then(res => {
        if (tool.length(res.tabs) !== this.state.categoryLabels.length) {
          for (let i in res.tabs) {
            res.tabs[i].num = 0;
          }
          this.setState({
            orderStatus: parseInt(res.tabs[0].status),
            categoryLabels: res.tabs,
            showTabs: true,
            isLoading: false,
          })
          this.onRefresh()
          return null
        }
        this.setState({
          categoryLabels: res.tabs,
        })
        let {ListData, query} = this.state;
        if (tool.length(res.orders) < query.limit) {
          query.isAdd = false;
        }
        query.page++;
        query.listType = initQueryType
        query.offset = Number(query.page - 1) * query.limit;
        this.setState({
          ListData: setList === 1 ? res.orders : ListData.concat(res.orders),
          isLoading: false,
          query
        })
      }, (res) => {
        showError(res.reason);
        this.setState({isLoading: false})
      })
    }

  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  render() {
    const {show_orderlist_ext_store, currStoreId, accessToken} = this.props.global;

    const {showNewVersionVisible,showSortModal,ext_store_list,searchStoreVisible,newVersionInfo,downloadFileProgress}=this.state
    return (
      <View style={{flex: 1}}>
        <FloatServiceIcon/>
        <FetchView navigation={this.props.navigation} onRefresh={this.onRefresh.bind(this)}/>
        <FetchInform navigation={currStoreId} onRefresh={this.getVendor.bind(this)}/>
        {this.renderTabsHead()}
        <Dialog visible={showSortModal} onRequestClose={() => this.setState({showSortModal: false})}>
          {this.showSortSelect()}
        </Dialog>
        <If condition={ext_store_list.length > 0 && show_orderlist_ext_store}>
          <View style={{
            flexDirection: 'row',
            lineHeight: 30,
            paddingLeft: '2%',
            paddingTop: 10,
            paddingBottom: 6,
            backgroundColor: colors.white
          }}>
            <Text onPress={() => {
                this.setState({searchStoreVisible: true})
              }}
              style={{fontSize: pxToDp(30), marginTop: pxToDp(3)}}>{this.state.ext_store_name} </Text>
            <Entypo name='chevron-thin-right' style={[styles.right_btn]}/>
          </View>
          </If>
        <SearchExtStore visible={searchStoreVisible}
                        data={ext_store_list}
                        onClose={() => this.setState({
                          searchStoreVisible: false,
                          ext_store_name: '所有外卖店铺',
                          ext_store_id: 0
                        })}
                        onSelect={(item) => {
                          if (item.id === "0") {
                            item.name = '所有外卖店铺'
                          }
                          this.state.query.page = 1;
                          this.state.query.isAdd = true;
                          this.state.query.offset = 0;
                          this.setState({
                            searchStoreVisible: false,
                            ext_store_id: item.id,
                            ext_store_name: item.name,
                            isLoading: false,
                          }, () => {
                            this.fetchOrders()
                          })
                        }}/>

          {this.state.showTabs ? this.renderStatusTabs() : this.renderContent(this.state.ListData)}
          <If condition={this.state.show_hint}>
            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>{this.state.hint_msg === 1 ? "系统通知未开启" : "消息铃声异常提醒"} </Text>
              </CellBody>
              <CellFooter>
                <Text style={[styles.button_status]} onPress={this.openNotifySetting}>去查看</Text>
              </CellFooter>
            </Cell>
          </If>
          <Modal visible={showNewVersionVisible} transparent={true} hardwareAccelerated={true}>
            <View style={styles.modalWrap}>
              <View style={styles.modalContentWrap}>
                <View style={{alignItems:'center', justifyContent:'center'}}>
                  <Image source={require('../../img/Login/ic_launcher.png')} style={styles.modalImgStyle}/>
                  {/*<Text style= {styles.modalTitleText}>*/}
                  {/*  体验新版本*/}
                  {/*</Text>*/}
                </View>
                <Text style={styles.modalContentText}>
                  {newVersionInfo.info}
                </Text>
                <If condition={downloadFileProgress!==''}>
                  <Text style= {styles.modalTitleText}>
                    下载进度：{downloadFileProgress}
                  </Text>
                </If>
                <TouchableOpacity style={styles.modalBtnWrap} onPress={()=>this.updateBundle(newVersionInfo)}>
                  <Text style={styles.modalBtnText}>
                    立即体验
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <RemindModal onPress={this.onPress.bind(this)} accessToken={accessToken} currStoreId={currStoreId}/>
        </View>
    );
  }

  openNotifySetting= () => {
    if (this.state.hint_msg === 1) {
      native.toOpenNotifySettings()
    }
    if (this.state.hint_msg === 2) {
      this.onPress(Config.ROUTE_SETTING);
    }
  }

  renderTabsHead = () => {
    return (
      <View style={styles.tabsHeader}>
        <View style={styles.tabsHeader1}>
          <Text onPress={() => {
            this.setState({
              showTabs: true,
              ListData: [],
              orderStatus: this.state.categoryLabels[0].status,
            }, () => {
              this.onRefresh(this.state.categoryLabels[0].status)
            })
          }}
                style={this.state.orderStatus !== 7 ? styles.tabsHeader2 : styles.tabsHeader3}> 处理中 </Text>
          <Text onPress={() => {
            this.setState({
              showTabs: false,
              orderStatus: 7,
              ListData: [],
            }, () => {
              this.onRefresh(7)
            })
          }}
                style={this.state.orderStatus === 7 ? styles.tabsHeader2 : styles.tabsHeader3}> 预订单 </Text>
          <Text onPress={() => {
            const {navigation} = this.props
            navigation.navigate(Config.ROUTE_ORDER_SEARCH_RESULT, {max_past_day: 180})
          }}
                style={styles.tabsHeader3}> 全部订单 </Text>
        </View>

        <TouchableOpacity onPress={() => {
          this.onPress(Config.ROUTE_ORDER_SEARCH)
        }} style={{width: 0.15 * width, flexDirection: 'row'}}>
          <View style={{flex: 1}}></View>
          <Entypo name={"magnifying-glass"} style={{fontSize: 24, color: colors.color666}}/>
        </TouchableOpacity>
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
          dropdownTextHighlightStyle={{color: '#fff'}}
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
            marginLeft: 18,
          }}>
            <Entypo name={"menu"} style={{fontSize: 26, color: colors.color666}}/>
          </View>
        </ModalDropdown>
      </View>
    )
  }


  renderStatusTabs = () => {
    const tabwidth = 1 / this.state.categoryLabels.length;
    if (!tool.length(this.state.categoryLabels) > 0) {
      return null;
    }
    return (
      <View style={{flex: 1}}>
        <View style={{flexDirection: 'row', backgroundColor: colors.white, height: 40,}}>
          <For index="i" each='tab' of={this.state.categoryLabels}>

            <TouchableOpacity
              key={i}
              style={{width: tabwidth * width, alignItems: "center"}}
              onPress={() => {
                this.onRefresh(tab.status)
              }}>
              <View style={{
                borderColor: colors.main_color,
                // borderBottomWidth: this.state.orderStatus === tab.status ? 3 : 0,
                height: 38,
                justifyContent: 'center',
              }}>
                <Text style={{
                  color: colors.color333,
                  fontSize: 14,
                  fontWeight: this.state.orderStatus === tab.status ? "bold" : "normal"
                }}>{tab.tabname} </Text>
                <If condition={tool.length(this.state.orderNum) > 0 && this.state.orderNum[tab.status] > 0}>
                  <Badge
                    status="error"
                    value={this.state.orderNum[tab.status] > 99 ? '99+' : this.state.orderNum[tab.status]}
                    containerStyle={{position: 'absolute', top: 1, right: -15}}/>
                </If>
              </View>
              <If condition={this.state.orderStatus === tab.status}>
                <View style={{height: 2, width: 24, backgroundColor: colors.main_color}}></View>
              </If>
            </TouchableOpacity>

          </For>

        </View>
        {this.renderContent(this.state.ListData)}
      </View>
    )
  }

  renderContent = (orders) => {
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

          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (this.state.isCanLoadMore) {
              this.setState({isCanLoadMore: false}, () => {
                this.listmore();
              })
            }
          }}
          onMomentumScrollBegin={() => {
            this.setState({
              isCanLoadMore: true
            })
          }}
          onTouchMove={(e) => {
            if (Math.abs(this.pageY - e.nativeEvent.pageY) > Math.abs(this.pageX - e.nativeEvent.pageX)) {
              this.setState({scrollLocking: true});
            } else {
              this.setState({scrollLocking: false});
            }
          }}
          renderItem={this.renderItem}
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

  listmore = () => {
    if (this.state.query.isAdd) {
      this.fetchOrders(this.state.orderStatus, 0);
    }
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

  showSortSelect = () => {
    let {user_config} = this.props.global;
    let sort = user_config?.order_list_by ? user_config?.order_list_by : 'expectTime asc';
    return(
        <View style={{marginTop: 12}}>
          <For index="index" each="sortItem" of={this.state.sortData}>
            <RadioItem key={index} style={{fontSize: 12, fontWeight: 'bold', backgroundColor: colors.white}}
                       checked={sort === sortItem.value}
                       onChange={event => {
                         if (event.target.checked) {
                           this.setOrderBy(sortItem.value)
                         }
                       }}>
              <Text style={{color: colors.fontBlack}}>{sortItem.label} </Text>
            </RadioItem>
          </For>
        </View>
    )
  }
  setOrderBy = (order_by) => {
    let {user_config} = this.props.global
    user_config.order_list_by = order_by
    this.props.dispatch(setUserCfg(user_config));
    this.setState({
      showSortModal: false,
      sort: order_by
    }, () => {
      this.onRefresh(this.state.orderStatus)
    })
  }


  renderItem = (order) => {
    let {item, index} = order;
    return (
      <OrderListItem showBtn={this.state.showBtn}
                     fetchData={this.onRefresh.bind(this, this.state.orderStatus)}
                     item={item}
                     accessToken={this.props.global.accessToken}
                     onRefresh={() => this.onRefresh()}
                     navigation={this.props.navigation}
                     vendorId={this.props.global.config.vendor.id}
                     allow_edit_ship_rule={this.state.allow_edit_ship_rule}
                     setState={this.setState.bind(this)}
                     orderStatus={this.state.orderStatus}
                     onPress={this.onPress.bind(this)}/>
    );
  }

  renderNoOrder = () => {
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
        <If condition={this.state.show_button && (this.state.allow_merchants_store_bind || this.state.is_service_mgr)}>
          <Button title={'去授权外卖店铺'}
                  onPress={() => {
                    this.mixpanel.track("orderpage_authorizestore_click", {});
                    this.onPress(Config.PLATFORM_BIND)
                  }}
                  buttonStyle={{
                    width: width - 20,
                    borderRadius: pxToDp(10),
                    backgroundColor: colors.main_color,
                    marginTop: pxToDp(30)
          }}

                  titleStyle={{
                    color: colors.white,
                    fontSize: 16
          }}
          />
        </If>
      </View>
    )
  }

  onPressActivity = () => {
    const {currStoreId} = this.props.global;
    this.onPress(Config.ROUTE_WEB, {url: this.state.activityUrl, title: '老带新活动'})
    this.mixpanel.track("act_user_ref_ad_click", {
      img_name: this.state.activity.name,
      pos: this.state.activity.pos_name,
      store_id: currStoreId,
    });
  }

  rendertopImg = () => {
    return (
      <View>
        <If condition={this.state.isadditional && this.state.orderStatus !== 7}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate(Config.ROUTE_ORDER_SEARCH_RESULT, {additional: true})
            }}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              backgroundColor: '#EEDEE0',
              height: 40
          }}>
            <Text style={{color: colors.color666, fontSize: 12, paddingLeft: 13, flex: 1}}>
              存在正在补送的订单
            </Text>
            <Button onPress={() => {
              this.props.navigation.navigate(Config.ROUTE_ORDER_SEARCH_RESULT, {additional: true})
            }}
                    title={'查看'}
                    buttonStyle={{
                      backgroundColor: colors.red,
                      borderRadius: 6,
                      marginRight: 13,
                      paddingVertical: 3,
                      paddingHorizontal: 4,
                    }}
                    titleStyle={{
                      fontSize: 12,
                      color: colors.white,
                    }}>
            </Button>
          </TouchableOpacity>
        </If>
        <If condition={this.state.img !== '' && this.state.showimgType === 1 && this.state.showimg && GlobalUtil.getRecommend()}>
          <TouchableOpacity onPress={() => {
            this.onPressActivity()
          }} style={{paddingBottom: pxToDp(20), paddingLeft: '3%', paddingRight: '3%'}}>
            <Image source={{uri: this.state.img}} resizeMode={'contain'} style={styles.image}/>
            <Entypo onPress={() => {
              this.setState({
                showimg: false
              }, () => this.closeActivity())
            }} name='cross' style={{
              fontSize: 25,
              position: 'absolute',
              color: colors.white,
              right: 12,
              top: -1,
            }}/>
          </TouchableOpacity>
        </If>

      </View>
    )
  }

  renderbottomImg = () => {
    return (
      <If condition={this.state.img !== '' && this.state.showimgType !== 1 && this.state.showimg && GlobalUtil.getRecommend()}>
        <TouchableOpacity onPress={() => {
          this.onPressActivity()
        }} style={{paddingTop: '5%', paddingLeft: '3%', paddingRight: '3%',
        }}>
          <Image source={{uri: this.state.img}} resizeMode={'contain'} style={styles.image}/>
        </TouchableOpacity>
      </If>
    )
  }

}

const styles = StyleSheet.create({
  modalWrap:{
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  modalContentWrap:{
    width:'80%',
    backgroundColor: colors.colorEEE,
    borderRadius:8,
    padding:12,
  },
  modalTitleText:{fontSize:12,fontWeight:'bold',paddingTop:8,paddingBottom:8,marginLeft:20,lineHeight:25},
  modalImgStyle:{width:51.2,height:51.2,marginTop:12,borderRadius:8},
  modalContentText:{paddingTop:12,paddingBottom:16,marginLeft:20,marginRight:20,lineHeight:25},
  modalBtnWrap:{
    backgroundColor:colors.main_color,
    marginLeft:20,
    marginRight:20
  },
  modalBtnText:{color:colors.white,fontSize:20,padding:12,textAlign:'center'},
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
    paddingVertical: 8,
    width: width
  },
  tabsHeader1: {
    backgroundColor: colors.f7,
    width: 0.75 * width,
    padding: pxToDp(8),
    paddingLeft: pxToDp(0),
    borderRadius: pxToDp(15),
    flexDirection: 'row',
    marginLeft: 10,
  },
  tabsHeader2: {
    width: 0.24 * width,
    justifyContent: 'center',
    paddingVertical: pxToDp(10),
    alignItems: 'center',
    borderRadius: pxToDp(18),
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: "center",
    marginLeft: pxToDp(10),
    color: colors.main_color,
    backgroundColor: colors.white
  },
  tabsHeader3: {
    width: 0.24 * width,
    justifyContent: 'center',
    fontWeight: 'bold',
    paddingVertical: pxToDp(10),
    alignItems: 'center',
    borderRadius: pxToDp(18),
    fontSize: pxToDp(26),
    textAlign: "center",
    marginLeft: pxToDp(10),
    color: colors.title_color,
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
    // width: '100%',
    height: 70,
    borderRadius: 10
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderListScene)
