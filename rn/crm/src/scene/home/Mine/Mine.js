import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Alert,
  Dimensions, Image, ImageBackground,
  InteractionManager,
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
  shopManagement, stallIcon, switchStore, versionInformation,
  wallet
} from "../../../svg/svg";
import pxToDp from "../../../pubilc/util/pxToDp";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import tool from "../../../pubilc/util/tool";
import Config from "../../../pubilc/common/config";
import {Button} from "react-native-elements";
import GoodsIncrement from "../../common/component/GoodsIncrement";
import {hideModal, showError, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import Swiper from 'react-native-swiper'
import FastImage from "react-native-fast-image";
import {setNoLoginInfo} from "../../../pubilc/common/noLoginInfo";
import {getConfig, logout} from "../../../reducers/global/globalActions";

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
    const {currStoreId, accessToken} = this.props.global;
    let {
      currVendorId,
      currVersion,
      co_type
    } = tool.vendor(this.props.global);
    this.state = {
      isRefreshing: false,
      currStoreId: currStoreId,
      currVendorId: currVendorId,
      currVersion: currVersion,
      access_token: accessToken,
      wsb_store_account: 0,
      co_type: co_type,
      storeStatus: {},
      is_mgr: false,
      storeInfo: {
        store_name: '',
        role_desc: ''
      },
      balanceInfo: {
        balance: 0.00,
        disabled_recharge: false,
        disabled_view_bill: false
      },
      menu_list: [],
      activity: [],
      img: ''
    }
  }

  componentDidMount = () => {
    this.fetchMineData()
    this.fetchWsbWallet()
    this.getActivitySwiper()
    this.getStoreDataOfMine()
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
    this.fetchMineData()
    this.fetchWsbWallet()
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
        is_mgr: res.is_store_mgr,
        wsb_store_account: res.wsb_store_account
      })
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
        menu_list: this.formatArr(res.menu_list)
      })
    })
  }

  fetchWsbWallet = () => {
    const {accessToken} = this.props.global
    const api = `/v4/wsbWallet/balance`;
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken
    }).then(res => {
      this.setState({
        balanceInfo: {
          balance: res.balance,
          disable_recharge: res.disabled_recharge === 1,
          disable_view_bill: res.disable_view_bill === 1
        }
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

  jumpToAccountFill = (flag) => {
    if (flag) {
      const {navigation} = this.props;
      this.mixpanel.track('我的_充值')
      navigation.navigate(Config.ROUTE_ACCOUNT_FILL)
    } else {
      return showError('暂无权限')
    }
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
    this.onPress(Config.ROUTE_STORE_STATUS, {
      updateStoreStatusCb: (storeStatus) => {
        this.setState({storeStatus: storeStatus})
      }
    })
  }

  navigateToDeliverySetting = () => {
    this.onPress(Config.ROUTE_DELIVERY_LIST, {dispatch: this.props.dispatch})
  }

  navigateToExpense = () => {
    this.onPress(Config.ROUTE_OLDSEP_EXPENSE, {showBtn: this.state.wsb_store_account})
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
    const {currentUser, vendor_info} = this.props.global;
    const {is_mgr, currVendorId} = this.state
    this.onPress(Config.ROUTE_STORE, {
      currentUser: currentUser,
      currVendorId: currVendorId,
      currVendorName: vendor_info?.brand_name,
      is_mgr: is_mgr
    });
  }

  navigateToWorker = () => {
    const {currentUser, vendor_info, vendor_id} = this.props.global;
    this.onPress(Config.ROUTE_WORKER, {
      type: "worker",
      currentUser: currentUser,
      currVendorId: vendor_id,
      currVendorName: vendor_info?.brand_name
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
    Alert.alert('提醒', `确定要退出吗？`, [
      {
        text: '取消',
        style: 'cancel'
      },
      {
        text: '确定',
        style: 'default',
        onPress: () => {
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
      }
    ]);
  }

  formatArr (arr) {
    let map = new Map()
    for (let item in arr) {
      if (!map.has(item)) {
        map.set(arr[item], arr[item])
      }
    }
    return [...map.values()]
  }

  touchBlockNavigate = (info) => {
    this.mixpanel.track(`${info?.name}`)
    if (info?.type === 'Router') {
      switch (info?.path) {
        case 'Store':
          this.navigateToStoreManager()
          break
        case 'Worker':
          this.navigateToWorker()
          break
        case 'StoreStatus':
          this.navigateToPlatformSetting()
          break
        case 'DeliveryList':
          this.navigateToDeliverySetting()
          break
        case 'OldSeparatedExpense':
          this.navigateToExpense()
          break
        default:
          this.onPress(info?.path)
      }
    } else {
      let path = info?.path;
      let url = Config.serverUrl(path, Config.https);
      this.onPress(Config.ROUTE_WEB, {url: url});
    }
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
    let {storeInfo} = this.state;
    return (
      <View style={styles.storeInfoBox}>
        <Image source={{url: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E5%BA%97%E9%93%BA%E5%A4%B4%E5%83%8F%403x.png'}}
               style={{width: 48, height: 48}}/>
        <View style={{flexDirection: "column", marginLeft: 10}}>
          <View style={styles.storeContent}>
            <Text style={styles.storeName}>
              {tool.length((storeInfo?.store_name || '')) > 12 ? storeInfo?.store_name.substring(0, 11) + '...' : storeInfo?.store_name}
            </Text>
            <View style={styles.storeType}>
              <Text style={styles.storeTypeText}>连锁版 </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.roleBox} onPress={() => this.onPress(Config.ROUTE_PER_IDENTIFY)}>
            <Text style={styles.roleText}>{storeInfo?.role_desc} </Text>
            <Entypo name="chevron-thin-right" style={styles.roleIcon}/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderStore = () => {
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
    let {balanceInfo} = this.state;
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
            {balanceInfo?.disabled_view_bill ? balanceInfo?.balance : `*****`}
          </Text>
        </View>
        <Button title={'立即充值'}
                onPress={() => this.jumpToAccountFill(balanceInfo?.disable_recharge)}
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

  renderBlock = () => {
    let {menu_list} = this.state;
    return (
      <For of={menu_list} each='item' index='index'>
        <View style={[styles.zoneWrap]} key={index}>
          <Text style={styles.zoneWrapTitle}>
            {item?.title}
          </Text>
          <View style={styles.flexRowWrap}>
            <For of={item?.items} each='info' index='index'>
              <TouchableOpacity style={[block_styles.block_box]} key={index}
                                onPress={() => this.touchBlockNavigate(info)}
                                activeOpacity={customerOpacity}>
                <If condition={tool.length(info?.badge) > 0}>
                  <View style={[block_styles.deliveryTip, {backgroundColor: info?.badge?.bg_color}]}>
                    <Text allowFontScaling={false} style={block_styles.deliveryTipText}>
                      {info?.badge?.label}
                    </Text>
                  </View>
                </If>
                <SvgXml xml={wallet()} width={28} height={28} style={[block_styles.block_img]}/>
                <Text style={[block_styles.block_name]}>{info?.name} </Text>
              </TouchableOpacity>
            </For>
          </View>
        </View>
      </For>
    )
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

  onCanChangeStore = (item) => {
    showModal("切换店铺中...")
    tool.debounces(() => {
      const {dispatch, global, navigation} = this.props;
      const {accessToken} = global;
      dispatch(getConfig(accessToken, item?.id, (ok, msg, obj) => {
        if (ok) {
          tool.resetNavStack(navigation, Config.ROUTE_ALERT, {
            initTab: Config.ROUTE_ORDERS,
            initialRouteName: Config.ROUTE_ALERT
          });
          hideModal()
        } else {
          ToastLong(msg);
          hideModal()
        }
      }));
    })
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
              onRefresh={() => this.onRefresh()}
              tintColor='gray'
            />}
          style={styles.Content}>

          {/*<TouchableOpacity onPress={() => {*/}
          {/*  this.onPress(Config.ROUTE_STORE_SELECT, {*/}
          {/*    onBack: (item) => {*/}
          {/*      this.onCanChangeStore(item)*/}
          {/*    }*/}
          {/*  })*/}
          {/*}}>*/}
          {/*    <Text style={{fontSize:20,margin:20}}>切换门店 </Text>*/}
          {/*</TouchableOpacity>*/}

          {this.renderStore()}
          <View style={{position: "relative", top: -53}}>
            {this.renderWallet()}
            {this.renderValueAdded()}
            {this.renderBlock()}
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
    right: 0,
    top: pxToDp(20),
    position: 'absolute',
    zIndex: 99,
  },
  deliveryTipText: {
    fontSize: 7, fontWeight: '400', color: colors.white, lineHeight: 11, textAlign: 'center'
  }
});

export default connect(mapStateToProps)(Mine)
