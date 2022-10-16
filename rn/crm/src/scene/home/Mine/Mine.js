import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Dimensions, Image, ImageBackground,
  InteractionManager, Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import HttpUtils from "../../../pubilc/util/http";
import Entypo from "react-native-vector-icons/Entypo";
import colors from "../../../pubilc/styles/colors";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import LinearGradient from "react-native-linear-gradient";
import {rgbaColor} from "react-native-reanimated/src/reanimated2/Colors";
import {SvgXml} from "react-native-svg";
import {
  achievement, commodityAdjustment,
  contactCustomerService,
  dataAnalysis,
  delivery,
  deliveryManagement,
  employeeManagement,
  expenseBill, help,
  messageRingtone, notice,
  operatingIncome,
  orderCompensation, orderSearch,
  platformSettings,
  priceAdjustmentRecord,
  printSettings, pushSettings,
  Service,
  settings,
  settlementRecord, shareActivity,
  shopManagement, stallIcon, versionInformation,
  wallet
} from "../../../svg/svg";
import pxToDp from "../../../pubilc/util/pxToDp";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import tool from "../../../pubilc/util/tool";
import Config from "../../../pubilc/common/config";
import {Button} from "react-native-elements";
import GoodsIncrement from "../../common/component/GoodsIncrement";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import Cts from "../../../pubilc/common/Cts";
import FetchEx from "../../../pubilc/util/fetchEx";
import Swiper from 'react-native-swiper'
import FastImage from "react-native-fast-image";
import {setNoLoginInfo} from "../../../pubilc/common/noLoginInfo";
import {logout} from "../../../reducers/global/globalActions";

const width = Dimensions.get("window").width;

//记录耗时的对象
const timeObj = {
  deviceInfo: {},
  currentStoreId: '',
  currentUserId: '',
  moduleName: '',
  componentName: '',
  method: []
}

const customerOpacity = 0.6;
let hasPriceControl = false;
let hasAllowAnalys = false;

function mapStateToProps(state) {
  return {
    order: state.order,
    global: state.global,
    store: state.store,
    device: state.device
  }
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

class Mine extends PureComponent {

  static propTypes = {

  }

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    const {currStoreId, access_token} = this.props.global;
    let {
      currVendorId,
      currVersion,
      is_helper,
      is_service_mgr,
      co_type
    } = tool.vendor(this.props.global);
    this.state = {
      isRefreshing: false,
      currStoreId: currStoreId,
      currVendorId: currVendorId,
      currVersion: currVersion,
      access_token: access_token,
      is_service_mgr: is_service_mgr,
      co_type: co_type,
      storeStatus: {},
      fnSeparatedExpense: false,
      fnPriceControlled: false,
      fnProfitControlled: false,
      wsb_store_account: 0,
      showRecord: false,
      is_self_yy: false,
      contacts: '',
      allow_merchants_store_bind: false,
      allow_analys: false,
      is_helper: is_helper,
      show_call_service_modal: false,

      is_mgr: false,

      storeInfo: {
        store_name: '',
        role_desc: '',
        balance: 0
      },
      menu_list: {},
      title: "今日美团外卖自配送回传率",
      label: '实时回传：',
      content: "全部已达标",
      color: "green",
      footer: '自然日有效配送信息上传率需>=90%',
      showComeBack: false,
      show_activity: false,
      activity_img: '',
      activity_url: '',
      adjust_cnt: 0,
      have_not_read_advice: 0,
      activity: [],
      img: ''
    }
    this.getHuichuan(currStoreId, access_token)
  }

  componentDidMount = () => {
    const {currStoreId, access_token} = this.props.global;
    this.fetchMineData()
    this.getActivity(currStoreId, access_token)
    this.getNotifyCenter(currStoreId, access_token)
    this.getActivitySwiper()
  }

  componentDidUpdate = () => {

  }

  handleTimeObj = (api = '', executeStatus = 'success', startTime, endTime, methodName = '', executeTime) => {
    timeObj.method.push({
      interfaceName: api,
      executeStatus: executeStatus,
      startTime: startTime,
      endTime: endTime,
      methodName: methodName,
      executeTime: executeTime
    })
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  onRefresh = () => {
  }

  onHeaderRefresh() {
  }

  navigateToBack = () => {
    this.props.navigation.goBack();
  }

  getStoreDataOfMine = (store_id = 0) => {
    let {access_token, currStoreId} = this.state;
    if (store_id <= 0) {
      store_id = currStoreId
    }
    const api = `/api/store_data_for_mine/${store_id}?access_token=${access_token}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({
        storeStatus: res.store_status,
        fnSeparatedExpense: res.fnSeparatedExpense,
        is_mgr: res.is_store_mgr,
        fnPriceControlled: res.fnPriceControlled,
        fnProfitControlled: res.fnProfitControlled,
        wsb_store_account: res.wsb_store_account,
        showRecord: res.show_questionnaire && res.show_questionnaire,
        is_self_yy: res.customer_service_auth !== undefined ? res.customer_service_auth?.is_self_yy : false,
        contacts: res.customer_service_auth !== undefined ? res.customer_service_auth?.contacts : "",
      })
      if (tool.length(res.allow_merchants_store_bind) > 0) {
        this.setState({
          allow_merchants_store_bind: res.allow_merchants_store_bind
        })
      }
      if (tool.length(res.allow_analys) > 0) {
        this.setState({
          allow_analys: res.allow_analys === '1'
        })
      }
      // let {is_helper} = this.state;
      // if (res.is_store_mgr || is_helper) {
      //   this.onGetStoreTurnover(store_id, res.fnPriceControlled);
      // } else {
      //   this.onGetUserCount();
      // }
    })
  }

  getHuichuan = (currStoreId, accessToken) => {
    const api = `/v1/new_api/delivery_sync_log/summary?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId}).then(res => {
      this.setState({
        title: res.title,
        label: res.sync_info.label,
        content: res.sync_info.content,
        color: res.sync_info.color,
        footer: res.footer,
        showComeBack: res.show,
      })
    })
  }

  getActivity = (currStoreId, access_token) => {
    const api = `api/get_activity_info?access_token=${access_token}`
    let data = {
      "storeId": currStoreId,
      "pos": 1,
      "auto_hide": 0,
    }
    HttpUtils.post.bind(this.props)(api, data).then((res) => {
      if (Array.isArray(res.list) && tool.length(res.list) > 0) {
        res.list.map(item => {
          if (item.id === '3') {
            this.setState({
              show_activity: true,
              activity_img: item.icon,
              activity_url: item.url + '?access_token=' + access_token,
            })
          }
        })
        return
      }
      this.setState({
        show_activity: true,
        activity_img: res.icon,
        activity_url: res.url + '?access_token=' + access_token,
      })
    }).catch(() => {
    })
  }

  getNotifyCenter = (currStoreId, access_token) => {
    let _this = this;
    const url = `api/notify_center/${currStoreId}.json?access_token=${access_token}`;
    FetchEx.timeout(Config.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          let {adjust_cnt} = resp.obj;
          _this.setState({adjust_cnt: adjust_cnt});
        }
      })
  }

  fetchMineData = () => {
    let {currStoreId} = this.state;
    const {accessToken} = this.props.global
    const api = `/v4/wsb_user/personalCenter`;
    HttpUtils.get.bind(this.props)(api, {
      store_id: currStoreId,
      access_token: accessToken
    }).then(res => {
      this.setState({
        storeInfo: {
          store_name: res.store_name,
          role_desc: res.role_desc,
          balance: res.balance
        },
        menu_list: res.menu_list
      })
    })
  }

  getActivitySwiper = () => {
    const {accessToken, currStoreId} = this.props.global;
    const api = `api/get_activity_info?access_token=${accessToken}`
    let data = {
      storeId: currStoreId,
      pos: 1
    }
    HttpUtils.post.bind(this.props)(api, data, true).then((res) => {
      const {obj} = res
      this.handleTimeObj(api, res.executeStatus, res.startTime, res.endTime, 'getActivity', res.endTime - res.startTime)
      if (tool.length(obj) > 0) {
        this.setState({
          img: obj.banner,
          showImgType: obj.can_close,
          activity: obj.list ?? [obj]
        })
        this.mixpanel.track("act_user_ref_ad_view", {
          store_id: currStoreId,
          list: obj.list
        });
      } else {
        this.setState({
          show_img: false
        })
      }
    }).catch(error => {
      this.handleTimeObj(api, error.executeStatus, error.startTime, error.endTime, 'getActivity', error.endTime - error.startTime)
    })
  }

  // 联系客服
  JumpToServices = () => {
    let {currentUser, currentUserProfile, vendor_id} = this.props.global;
    let {currStoreId} = this.state;
    let data = {
      v: vendor_id,
      s: currStoreId,
      u: currentUser,
      m: currentUserProfile.mobilephone,
      place: 'cancelOrder'
    }
    this.mixpanel.track('我的_联系客服')
    JumpMiniProgram("/pages/service/index", data);
  }

  jumpToAccountFill = () => {
    const {navigation} = this.props;
    this.mixpanel.track('我的_充值')
    navigation.navigate(Config.ROUTE_ACCOUNT_FILL)
  }

  navigateToDistributionAnalysis = () => {
    this.mixpanel.track('数据分析页')
    this.onPress(Config.ROUTE_DistributionAnalysis)
  }

  navigateToSelfDelivery = () => {
    this.props.navigation.navigate(Config.ROUTE_COMES_BACK);
    this.mixpanel.track('我的_查看回传率')
  }

  navigateToOrderSearch = () => {
    this.mixpanel.track('订单搜索')
    this.onPress(Config.ROUTE_ORDER_SEARCH)
  }

  navigateToPlatformSetting = () => {
    this.mixpanel.track('平台页')
    this.onPress(Config.ROUTE_STORE_STATUS, {
      updateStoreStatusCb: (storeStatus) => {
        this.setState({storeStatus: storeStatus})
      }
    })
  }

  navigateToDeliverySetting = () => {
    this.mixpanel.track('配送管理')
    this.onPress(Config.ROUTE_DELIVERY_LIST, {dispatch: this.props.dispatch})
  }

  navigateToPrinterSetting = () => {
    this.mixpanel.track('打印页')
    this.onPress(Config.ROUTE_PRINTERS)
  }

  navigateToPushSetting = () => {
    this.mixpanel.track('推送页')
    this.onPress(Config.ROUTE_PUSH)
  }

  navigateToVersionInfo = () => {
    this.mixpanel.track('版本信息页')
    this.onPress(Config.ROUTE_VERSION);
  }

  navigateToHelpPage = () => {
    this.mixpanel.track('帮助页')
    this.onPress(Config.ROUTE_HELP)
  }

  navigateToStoreManager = () => {
    this.mixpanel.track('店铺页')
    const {currentUser, vendor_info} = this.props.global;
    const {is_mgr, currVendorId} = this.state
    this.onPress(Config.ROUTE_STORE, {
      currentUser: currentUser,
      currVendorId: currVendorId,
      currVendorName: vendor_info?.brand_name,
      is_mgr: is_mgr
    });
  }

  navigateToSettingPage = () => {
    this.mixpanel.track('设置页')
    this.onPress(Config.ROUTE_SETTING)
  }

  onPressActivity = (info) => {
    const {currStoreId, accessToken} = this.props.global;
    this.onPress(Config.ROUTE_WEB, {url: info.url + '?access_token=' + accessToken, title: info.name})
    this.mixpanel.track("act_user_ref_ad_click", {
      img_name: info.name,
      pos: info.pos_name,
      store_id: currStoreId,
    });
  }

  logOutAccount = () => {
    const {dispatch, navigation, global} = this.props;
    this.mixpanel.reset();
    const noLoginInfo = {
      accessToken: '',
      currentUser: 0,
      currStoreId: 0,
      host: '',
      co_type: '',
      enabledGoodMgr: '',
      currVendorId: '',
      printer_id: global.printer_id || '0'
    }
    setNoLoginInfo(JSON.stringify(noLoginInfo))
    dispatch(logout(() => {
      tool.resetNavStack(navigation,Config.ROUTE_LOGIN,{})
    }));
  }

  renderHeader = () => {
    return (
      <View
        style={headerRightStyles.resetBind}>
        <TouchableOpacity onPress={() => this.navigateToBack()}>
          <Entypo name="chevron-thin-left" style={headerRightStyles.text}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.JumpToServices()} style={headerRightStyles.rightBtn}>
          <SvgXml xml={Service()} width={18} height={18}/>
          <Text style={headerRightStyles.rightText}>联系客服 </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderStoreInfo = () => {
    let {store_info} = this.props.global;
    return (
      <View style={styles.storeInfoBox}>
        <Image source={{url: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E5%BA%97%E9%93%BA%E5%A4%B4%E5%83%8F%403x.png'}}
               style={{width: 48, height: 48}}/>
        <View style={{flexDirection: "column", marginLeft: 10}}>
          <View style={styles.storeContent}>
            <Text style={styles.storeName}>
              {tool.length((store_info?.name || '')) > 12 ? store_info?.name.substring(0, 11) + '...' : store_info?.name}
            </Text>
            <View style={styles.storeType}>
              <Text style={styles.storeTypeText}>连锁版 </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.roleBox} onPress={() => this.onPress(Config.ROUTE_PER_IDENTIFY)}>
            <Text style={styles.roleText}>店长 </Text>
            <Entypo name="chevron-thin-right" style={styles.roleIcon}/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderStore = () => {
    let {storeInfo} = this.state;
    return (
      <ImageBackground
        style={{width: width, height:222}}
        source={{uri:'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E6%88%91%E7%9A%84-%E8%83%8C%E6%99%AF%403x.png'}}
        imageStyle={{width: width, height:222}}>
        {this.renderHeader()}
        {this.renderStoreInfo()}
      </ImageBackground>
    )
  }

  renderWallet = () => {
    return (
      <LinearGradient style={styles.walletBox}
                      start={{x: 0, y: 0}}
                      end={{x: 0, y: 1}}
                      colors={['#E7FFEB', '#FFFFFF']}>
        <View>
          <Text style={styles.walletLabel}>
            外送帮账户余额 (元)
          </Text>
          <Text style={styles.walletValue}>
            1987.09
          </Text>
        </View>
        <Button title={'立即充值'}
                onPress={() => this.jumpToAccountFill()}
                buttonStyle={styles.walletBtn}
                titleStyle={styles.walletBtnTitle}
        />
      </LinearGradient>
    )
  }

  renderValueAdded = () => {
    const {navigation, global} = this.props
    const {currStoreId, accessToken, store_info} = global
    const {vip_info = {}} = store_info;
    return (
      <If condition={vip_info.show_vip}>
        <GoodsIncrement currStoreId={currStoreId} accessToken={accessToken} navigation={navigation}/>
      </If>
    )
  }

  renderCommonFunction = () => {
    let {is_service_mgr, fnPriceControlled, allow_analys, wsb_store_account, color, content, showComeBack, co_type} = this.state

    if (!allow_analys && is_service_mgr && fnPriceControlled > 0)
      hasPriceControl = true
    if (fnPriceControlled > 0)
      hasAllowAnalys = false
    return (
      <View style={[styles.zoneWrap]}>
        <Text style={styles.zoneWrapTitle}>
          常用
        </Text>
        <View style={styles.flexRowWrap}>
          <If condition={wsb_store_account === 1}>
            <TouchableOpacity style={[block_styles.block_box]}
                              onPress={() => this.onPress(Config.ROUTE_SEP_EXPENSE)}
                              activeOpacity={customerOpacity}>
              <SvgXml xml={wallet()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>钱包</Text>
            </TouchableOpacity>
          </If>
          <If condition={wsb_store_account !== 1 && fnPriceControlled > 0}>
            <TouchableOpacity style={[block_styles.block_box]}
                              onPress={() => this.onPress(Config.ROUTE_SETTLEMENT)}
                              activeOpacity={customerOpacity}>
              <SvgXml xml={settlementRecord()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>结算记录</Text>
            </TouchableOpacity>
          </If>
          <If condition={allow_analys || is_service_mgr}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={this.navigateToDistributionAnalysis}
              activeOpacity={customerOpacity}>
              <SvgXml xml={dataAnalysis()} width={28} height={28} style={[block_styles.block_img]}/>

              <Text style={[block_styles.block_name]}>数据分析 </Text>
            </TouchableOpacity>
          </If>
          <If condition={!hasAllowAnalys}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => this.onPress(Config.ROUTE_GOODS_APPLY_RECORD)}
              activeOpacity={customerOpacity}>
              <SvgXml xml={priceAdjustmentRecord()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>调价记录</Text>
            </TouchableOpacity>
          </If>
          <If condition={co_type === 'peisong' && showComeBack}>
            <TouchableOpacity style={[block_styles.block_box]} onPress={this.navigateToSelfDelivery}
                              activeOpacity={customerOpacity}>
              <View style={[block_styles.deliveryTip, {backgroundColor: color}]}>
                <Text allowFontScaling={false} style={block_styles.deliveryTipText}>
                  {content}
                </Text>
              </View>
              <SvgXml xml={delivery()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>配送回传</Text>
            </TouchableOpacity>
          </If>
          <If condition={co_type !== 'peisong'}>
            <TouchableOpacity style={[block_styles.block_box]} onPress={this.navigateToSettingPage}
                              activeOpacity={customerOpacity}>
              <SvgXml xml={settings()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>设置</Text>
            </TouchableOpacity>
          </If>
          <TouchableOpacity style={[block_styles.block_box]} onPress={this.JumpToServices}
                            activeOpacity={customerOpacity}>
            <SvgXml xml={contactCustomerService()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>联系客服</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderStoreBlock = () => {
    const {
      currentUser,
      accessToken,
      vendor_id,
      vendor_info,
      store_info,
      show_goods_monitor = false,
      enabled_good_mgr = false
    } = this.props.global;
    let token = `?access_token=${accessToken}`;
    let {
      currVersion, is_mgr, is_helper, is_service_mgr, fnPriceControlled, fnProfitControlled, activity_url,
      activity_img, wsb_store_account, color, content, showComesback, co_type
    } = this.state
    const fn_stall = store_info?.fn_stall
    return (
      <View style={styles.zoneWrap}>
        <Text style={styles.zoneWrapTitle}>
          配送设置
        </Text>
        <View style={styles.flexRowWrap}>
          <If condition={co_type !== 'peisong' && showComesback}>
            <TouchableOpacity style={[block_styles.block_box]} onPress={this.navigateToSelfDelivery}
                              activeOpacity={customerOpacity}>
              <View style={[block_styles.deliveryTip, {backgroundColor: color}]}>
                <Text allowFontScaling={false} style={block_styles.deliveryTipText}>
                  {content}
                </Text>
              </View>
              <SvgXml xml={delivery()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>配送回传</Text>
            </TouchableOpacity>
          </If>
          <TouchableOpacity style={[block_styles.block_box]} onPress={this.navigateToOrderSearch} activeOpacity={customerOpacity}>
            <SvgXml xml={orderSearch()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>订单搜索</Text>
          </TouchableOpacity>
          <If condition={fnPriceControlled > 0}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => this.onPress(Config.ROUTE_SETTLEMENT)}
              activeOpacity={customerOpacity}>
              <SvgXml xml={settlementRecord()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>结算记录</Text>
            </TouchableOpacity>
            <If condition={!hasPriceControl && hasAllowAnalys}>
              <TouchableOpacity
                style={[block_styles.block_box]}
                onPress={() => this.onPress(Config.ROUTE_GOODS_APPLY_RECORD)}
                activeOpacity={customerOpacity}>
                <SvgXml xml={priceAdjustmentRecord()} width={28} height={28} style={[block_styles.block_img]}/>
                <Text style={[block_styles.block_name]}>调价记录</Text>
              </TouchableOpacity>
            </If>
          </If>
          <If condition={fnPriceControlled <= 0}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => {
                if (is_mgr || is_helper) {
                  let path = `/stores/worker_stats.html${token}&&_v_id=${vendor_id}`;
                  let url = Config.serverUrl(path, Config.https);
                  this.onPress(Config.ROUTE_WEB, {url: url});
                  this.mixpanel.track('业绩页')
                } else {
                  ToastLong("您没有查看业绩的权限");
                }
              }}
              activeOpacity={customerOpacity}>
              <SvgXml xml={achievement()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>业绩</Text>
            </TouchableOpacity>
          </If>
          <If condition={enabled_good_mgr}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => this.onPress(Config.ROUTE_ORDER_SURCHARGE)}
              activeOpacity={customerOpacity}>
              <SvgXml xml={orderCompensation()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>订单补偿</Text>
            </TouchableOpacity>
          </If>
          <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={this.navigateToStoreManager}
            activeOpacity={customerOpacity}>
            <SvgXml xml={shopManagement()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>店铺管理</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[block_styles.block_box]} onPress={() => {
            this.mixpanel.track('员工页')
            this.onPress(Config.ROUTE_WORKER, {
              type: "worker",
              currentUser: currentUser,
              currVendorId: vendor_id,
              currVendorName: vendor_info?.brand_name
            });
          }} activeOpacity={customerOpacity}>
            <SvgXml xml={employeeManagement()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>员工管理</Text>
          </TouchableOpacity>
          <If condition={currVersion === Cts.VERSION_DIRECT}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => {
                let path = `/stores/working_status.html${token}&&_v_id=${vendor_id}`;
                let url = Config.serverUrl(path, Config.https);
                this.onPress(Config.ROUTE_WEB, {url: url});
              }} activeOpacity={customerOpacity}>
              <Image
                style={[block_styles.block_img]}
                source={require("../../../img/My/kaoqin_.png")}/>
              <Text style={[block_styles.block_name]}>考勤记录</Text>
            </TouchableOpacity>
          </If>
          <If condition={fnPriceControlled > 0 && is_service_mgr}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => {
                if (is_service_mgr) {
                  let path = `/stores/worker_stats.html${token}&&_v_id=${vendor_id}`;
                  let url = Config.serverUrl(path, Config.https);
                  this.onPress(Config.ROUTE_WEB, {url: url});
                  this.mixpanel.track('业绩页')
                } else {
                  ToastLong("您没有查看托管店业绩的权限");
                }
              }} activeOpacity={customerOpacity}
            >
              <SvgXml xml={achievement()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>业绩</Text>
            </TouchableOpacity>
          </If>
          <If condition={fnPriceControlled > 0 && (fnProfitControlled > 0 || is_helper || is_service_mgr)}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => this.onPress(Config.ROUTE_OPERATE_PROFIT)}
              activeOpacity={customerOpacity}
            >
              <SvgXml xml={operatingIncome()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>运营收益</Text>
            </TouchableOpacity>
          </If>

          <If condition={wsb_store_account !== 1}>
            <TouchableOpacity style={[block_styles.block_box]}
                              onPress={() => this.onPress(Config.ROUTE_OLDSEP_EXPENSE, {showBtn: wsb_store_account})}
                              activeOpacity={customerOpacity}>
              <SvgXml xml={expenseBill()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>费用账单</Text>
            </TouchableOpacity>
          </If>

          <TouchableOpacity style={[block_styles.block_box]}
                            onPress={this.navigateToPlatformSetting}
                            activeOpacity={customerOpacity}>
            <SvgXml xml={platformSettings()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>平台设置</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[block_styles.block_box]} onPress={this.navigateToDeliverySetting}
                            activeOpacity={customerOpacity}>
            <SvgXml xml={deliveryManagement()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>配送管理</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[block_styles.block_box]} onPress={this.navigateToPrinterSetting}
                            activeOpacity={customerOpacity}>
            <SvgXml xml={printSettings()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>打印设置</Text>
          </TouchableOpacity>
          <If condition={Platform.OS !== 'ios'}>
            <TouchableOpacity style={[block_styles.block_box]}
                              onPress={() => this.onPress(Config.ROUTE_INFORM)}
                              activeOpacity={customerOpacity}>
              <SvgXml xml={messageRingtone()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>消息与铃声</Text>
            </TouchableOpacity>
          </If>
          <If condition={currVersion === Cts.VERSION_DIRECT}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => {
                let path = `/stores/show_waimai_evaluations.html${token}&&_v_id=${vendor_id}`;
                let url = Config.serverUrl(path, Config.https);
                this.onPress(Config.ROUTE_WEB, {url: url});
              }}
              activeOpacity={customerOpacity}
            >
              <Image
                style={[block_styles.block_img]}
                source={require("../../../img/My/pingjia_.png")}
              />
              <Text style={[block_styles.block_name]}>评价</Text>
            </TouchableOpacity>
          </If>
          <If condition={show_goods_monitor}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => this.onPress(Config.ROUTE_GOODS_ADJUST)}
              activeOpacity={customerOpacity}>
              {this.state.adjust_cnt > 0 && <View style={[block_styles.notice_point]}/>}
              <SvgXml xml={commodityAdjustment()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>商品调整</Text>
            </TouchableOpacity>
          </If>

          <TouchableOpacity style={[block_styles.block_box]} onPress={this.navigateToPushSetting} activeOpacity={customerOpacity}>
            <SvgXml xml={pushSettings()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>推送设置</Text>
          </TouchableOpacity>

          <If condition={fn_stall === '1'}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => this.onPress(Config.ROUTE_HOME_SETTLEMENT_STALL_SETTLEMENT)}
              activeOpacity={customerOpacity}>
              <SvgXml xml={stallIcon()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>摊位结算</Text>
            </TouchableOpacity>
          </If>
          <If condition={wsb_store_account === 1 && tool.length(activity_img) > 0}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => this.onPress(Config.ROUTE_WEB, {url: activity_url, title: '老带新活动'})}
              activeOpacity={customerOpacity}>
              <SvgXml xml={shareActivity()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>老带新活动</Text>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    );
  }

  renderVersionBlock = () => {
    const {have_not_read_advice, activity_url, activity_img, wsb_store_account, co_type} = this.state
    const {show_expense_center} = this.props.global;
    return (
      <View style={styles.zoneWrap}>
        <Text style={styles.zoneWrapTitle}>
          其他
        </Text>
        <View style={styles.flexRowWrap}>
          <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_HISTORY_NOTICE)}
            activeOpacity={customerOpacity}>
            <If condition={have_not_read_advice > 0}>
              <View style={[block_styles.notice_point]}/>
            </If>
            <SvgXml xml={notice()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>公告</Text>
          </TouchableOpacity>
          <If condition={wsb_store_account !== 1 && tool.length(activity_img) > 0}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => this.onPress(Config.ROUTE_WEB, {url: activity_url, title: '老带新活动'})}
              activeOpacity={customerOpacity}>
              <SvgXml xml={shareActivity()} width={28} height={28}/>
              <Text style={[block_styles.block_name]}>老带新活动</Text>
            </TouchableOpacity>
          </If>
          <TouchableOpacity
            style={[block_styles.block_box]}
            activeOpacity={customerOpacity}
            onPress={this.navigateToVersionInfo}
          >
            <SvgXml xml={versionInformation()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>版本信息</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[block_styles.block_box]} activeOpacity={customerOpacity} onPress={this.navigateToHelpPage}>
            <SvgXml xml={help()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>帮助</Text>
          </TouchableOpacity>

          <If condition={co_type === 'peisong'}>
            <TouchableOpacity style={[block_styles.block_box]} onPress={this.navigateToSettingPage}
                              activeOpacity={customerOpacity}>
              <SvgXml xml={settings()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>设置</Text>
            </TouchableOpacity>
          </If>
          <If condition={show_expense_center}>
            <TouchableOpacity
              style={[block_styles.block_box]}
              activeOpacity={customerOpacity}>
              <Image style={[block_styles.block_img]} source={require("../../../img/My/huiyuan_.png")}/>
              <Text style={[block_styles.block_name]}>我的钱包</Text>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    );
  }

  renderSwiper = () => {
    let {activity} = this.state
    return (
      <Swiper
              showsButtons={false}
              height={100}
              horizontal={true}
              paginationStyle={{bottom: 10}}
              autoplay={true}
              autoplayTimeout={4}
              loop={true}
      >
        <For index='i' each='info' of={activity}>
          <TouchableOpacity onPress={() => this.onPressActivity(info)} key={i}>
            <FastImage style={styles.swiper} source={{uri: info.banner}} resizeMode={FastImage.resizeMode.contain}/>
          </TouchableOpacity>
        </For>
      </Swiper>
    )
  }

  renderLoginOut = () => {
    return (
      <Button title={'退出账号'}
              onPress={() => this.logOutAccount()}
              buttonStyle={styles.logOut}
              titleStyle={styles.logOutTitle}
      />
    )
  }

  renderCopyRight = () => {
    return (
      <View style={styles.companyInfoWrap}>
        <Text style={{color: colors.colorDDD}}>@版权所有</Text>
        <Text style={{color: colors.colorDDD}}>北京家帮帮科技有限公司</Text>
      </View>
    );
  }

  render() {
    let {isRefreshing} = this.state;
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.onRefresh}/>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor='gray'
            />}
          style={styles.Content}>
          {this.renderStore()}
          <View style={{position: "relative", top: -53}}>
            {this.renderWallet()}
            {this.renderValueAdded()}
            {this.renderCommonFunction()}
            {this.renderStoreBlock()}
            {this.renderVersionBlock()}
            {this.renderSwiper()}
            {this.renderLoginOut()}
            {this.renderCopyRight()}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Content: {backgroundColor: '#F5F5F5'},
  storeInfoBox: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center"
  },
  storeContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  storeName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.white
  },
  storeType: {
    width: 44,
    height: 18,
    backgroundColor: rgbaColor(255,255,255,0.9),
    borderRadius: 2,
    alignItems: "center",
    marginLeft: pxToDp(10)
  },
  storeTypeText: {
    fontWeight: '400',
    fontSize: 12,
    color: '#49C360',
    lineHeight: 18
  },
  roleBox: {
    width: 50,
    height: 20,
    borderRadius: 10,
    backgroundColor: rgbaColor(255,255,255,0.2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: pxToDp(10)
  },
  roleText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.white
  },
  roleIcon: {
    fontSize: 12,
    color: colors.white
  },
  walletBox: {
    width: width * 0.92,
    height: 86,
    borderRadius: 6,
    marginLeft: width * 0.04,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  walletLabel: {
    fontWeight: '400',
    fontSize: 12,
    color: colors.color666,
    marginBottom: 10
  },
  walletValue: {
    fontWeight: '500',
    fontSize: 24,
    color: colors.color333
  },
  walletBtn: {
    width: 93,
    height: 36,
    backgroundColor: '#FF8309',
    borderRadius: 21
  },
  walletBtnTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white
  },
  ValueAddBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 11
  },
  ValueAddBoxLeft: {flexDirection: "row", alignItems: "center"},
  ValueAddBtn: {
    fontWeight: '400',
    fontSize: 12,
    color: '#AD6500'
  },
  ValueAddIcon: {
    fontSize: 12,
    color: '#AD6500'
  },
  content: {
    width: width * 0.92,
    marginLeft: width * 0.04,
    height: 250,
    borderRadius: 6,
    backgroundColor: colors.white,
    marginTop: 10
  },
  ValueAddLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#985800',
    marginRight: 5
  },
  ValueAddDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: '#C5852C'
  },
  zoneWrap: {
    width: width * 0.92,
    marginLeft: width * 0.04,
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 12,
    marginTop: 10
  },
  zoneWrapTitle: {fontSize: 16, fontWeight: '500', color: colors.color333},
  flexRowWrap: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  companyInfoWrap: {
    justifyContent: 'center', alignItems: 'center', height: pxToDp(100), marginTop: 50
  },
  swiper: {
    width: width * 0.92,
    height: 80,
    borderRadius: 10,
    marginLeft: width * 0.04,
    marginTop: 10
  },
  logOut: {
    width: width * 0.92,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    marginLeft: width * 0.04,
    marginTop: 10
  },
  logOutTitle: {
    fontWeight: '400',
    fontSize: 16,
    color: colors.color666
  }
});

const headerRightStyles = StyleSheet.create({
  resetBind: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 10,
    backgroundColor: rgbaColor(255,255,255,0)
  },
  text: {
    fontSize: 20,
    color: colors.white
  },
  rightBtn: {
    width: 90,
    height: 32,
    backgroundColor: rgbaColor(255,255,255,0.2),
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  rightText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.white,
    marginLeft: pxToDp(5)
  }
})

const block_styles = StyleSheet.create({
  block_box: {
    width: width / 5,
    height: width / 5,
    alignItems: "center"
  },
  block_img: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(16),
    width: pxToDp(60),
    height: pxToDp(60)
  },
  block_name: {
    color: colors.color333,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17,
    textAlign: "center"
  },
  deliveryTip: {
    width: 41,
    height: 11,
    borderRadius: 7,
    right: 12,
    top: pxToDp(20),
    position: 'absolute',
    zIndex: 99,
  },
  deliveryTipText: {
    fontSize: 7, fontWeight: '400', color: colors.white, lineHeight: 9, textAlign: 'center'
  }
});

export default connect(mapStateToProps)(Mine)
