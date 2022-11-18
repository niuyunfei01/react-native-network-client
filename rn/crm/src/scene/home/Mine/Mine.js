import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  adjust,
  deliveries,
  delivery_sync,
  ext_store,
  fee_bills,
  help,
  history_notice,
  operator_data,
  order_compensate,
  order_search,
  performance,
  printer,
  product,
  push,
  Service,
  setting,
  settlement,
  stall_settlement,
  stores,
  third_recharge,
} from "../../../svg/svg";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import tool from "../../../pubilc/util/tool";
import Config from "../../../pubilc/common/config";
import {Button} from "react-native-elements";
import GoodsIncrement from "../../common/component/GoodsIncrement";
import {showError} from "../../../pubilc/util/ToastUtils";
import Swiper from 'react-native-swiper'
import FastImage from "react-native-fast-image";
import {setNoLoginInfo} from "../../../pubilc/common/noLoginInfo";
import {logout} from "../../../reducers/global/globalActions";
import AlertModal from "../../../pubilc/component/AlertModal";

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

const menu_list = [
  {
    title: "常用",
    items: [
      {name: "全部订单", type: "Router", path: "OrderSearchResult", icon: "order_search", badge: {}},
      {name: "经营数据", type: "Router", path: "DistributionAnalysis", icon: "operator_data", badge: {}},
      {
        name: "配送回传",
        type: "Router",
        path: "ComesBack",
        icon: "delivery_sync",
        badge: {label: "达标", color: "white", bg_color: "#26B942"}
      },
      {name: "三方充值", type: "Router", path: "TripartiteRecharge", icon: "third_recharge", badge: {}}
    ]
  },
  {
    title: "配送设置",
    items: [
      {name: "外卖门店", type: "Router", path: "StoreStatus", icon: "ext_store", badge: {}},
      {name: "配送管理", type: "Router", path: "DeliveryList", icon: "deliveries", badge: {}},
      {name: "门店管理", type: "Router", path: "Store", icon: "stores", badge: {}},
      {name: "打印设置", type: "Router", path: "PrinterSetting", icon: "printer", badge: {}}
    ]
  },
  {
    title: "其他",
    items: [
      {name: "通知设置", type: "Router", path: "PushSetting", icon: "push", badge: {}},
      {name: "系统设置", type: "Router", path: "Setting", icon: "setting", badge: {}},
      {name: "帮助中心", type: "Router", path: "Help", icon: "help", badge: {}},
      {name: "系统公告", type: "Router", path: "HistoryNoticeScene", icon: "history_notice", badge: {}}]
  }
]

class Mine extends PureComponent {

  static propTypes = {}

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    const {currStoreId, accessToken} = this.props.global;
    let {
      currVendorId,
      currVersion,
    } = tool.vendor(this.props.global);
    this.state = {
      isRefreshing: false,
      currStoreId: currStoreId,
      currVendorId: currVendorId,
      currVersion: currVersion,
      access_token: accessToken,
      wsb_store_account: 0,
      storeStatus: {},
      is_mgr: false,
      storeInfo: {
        store_name: '',
        role_desc: ''
      },
      balanceInfo: {
        balance: 0.00,
        disabled_recharge: false,
        disabled_view_bill: false,
        freeze_balance: '',
        freeze_notice: '冻结金额为待抢单运单最大配送费之和',
      },
      menu_list: menu_list,
      activity: [],
      img: '',
      show_freeze_balance_alert: false
    }
  }

  componentDidMount = () => {
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
          freeze_balance: res?.freeze_balance,
          freeze_notice: res?.freeze_notice,
          disable_recharge: res.disabled_recharge === 0,
          disable_view_bill: res.disable_view_bill === 0
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
  JumpToServices = async () => {
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
    await JumpMiniProgram("/pages/service/index", data);
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


  navigateToStoreManager = () => {
    this.onPress(Config.ROUTE_STORE_LIST);
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
    Alert.alert('提醒', `确定要退出吗？`, [
      {
        text: '取消',
        style: 'cancel'
      },
      {
        text: '确定',
        style: 'default',
        onPress: () => {
          this.mixpanel.reset();
          const noLoginInfo = {
            accessToken: '',
            currentUser: 0,
            currStoreId: 0,
            host: '',
            enabledGoodMgr: '',
            currVendorId: '',
            refreshToken: '',
            expireTs: 0,
            printer_id: '0',
            order_list_by: 'orderTime asc'
          }
          setNoLoginInfo(JSON.stringify(noLoginInfo))
          dispatch(logout(() => {
            tool.resetNavStack(navigation, Config.ROUTE_LOGIN, {})
          }));
        }
      }
    ]);
  }

  formatArr(arr) {
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

    let {is_service_mgr} = tool.vendor(this.props.global);
    if (info?.type === 'Router') {
      switch (info?.path) {
        case 'Store':
          this.onPress(Config.ROUTE_STORE_LIST);
          break
        case 'OrderSearchResult':
          this.onPress(is_service_mgr ? Config.ROUTE_ORDER_SEARCH_RESULT : Config.ROUTE_ORDER_ALL);
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
        <TouchableOpacity style={{
          width: 90,
          height: 32,
        }} onPress={() => this.navigateToBack()}>
          <Entypo name="chevron-thin-left" style={headerRightStyles.text}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.JumpToServices()} style={headerRightStyles.rightBtn}>
          <SvgXml xml={Service()} width={18} height={18}/>
          <Text style={headerRightStyles.rightText}>联系客服 </Text>
        </TouchableOpacity>
      </View>
    )
  }

  jumpToAddStore = () => {
    let {is_mgr} = this.state
    this.onPress(Config.ROUTE_STORE_ADD, {
      btn_type: "edit",
      is_mgr: is_mgr,
      editStoreId: this.props.global.currStoreId
    })
  }


  renderStoreInfo = () => {
    let {storeInfo} = this.state;
    return (
      <View style={styles.storeInfoBox}>
        <Image
          source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E5%BA%97%E9%93%BA%E5%A4%B4%E5%83%8F%403x.png'}}
          style={{width: 48, height: 48}}/>
        <View style={{flexDirection: "column", marginLeft: 10}}>
          <TouchableOpacity onPress={() => {
            this.jumpToAddStore()
          }} style={styles.storeContent}>
            <Text style={styles.storeName}>
              {tool.jbbsubstr(storeInfo?.store_name, 12)}
            </Text>
            <View style={styles.storeType}>
              <Text style={styles.storeTypeText}>连锁版 </Text>
            </View>
          </TouchableOpacity>
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
        style={{width: width, height: 222}}
        source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E6%88%91%E7%9A%84-%E8%83%8C%E6%99%AF%403x.png'}}
        imageStyle={{width: width, height: 222}}>
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
        <View style={{borderRightColor: colors.e5, borderRightWidth: 0.5, paddingRight: 20}}>
          <Text style={styles.walletLabel}>
            账户余额(元)
          </Text>
          <Text style={styles.walletValue}>
            {balanceInfo?.disable_view_bill ? balanceInfo?.balance : `*****`}
          </Text>
        </View>

        <View style={{flex: 1, marginLeft: 19}}>
          <Text style={styles.walletLabel} onPress={() => {
            this.setState({
              show_freeze_balance_alert: true
            })
          }}>
            冻结金额(元) <Entypo name='help-with-circle' style={{fontSize: 14, color: colors.colorCCC,}}/>
          </Text>
          <Text style={styles.walletValue}>
            {balanceInfo?.disable_view_bill ? balanceInfo?.freeze_balance : `*****`}
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

  closeModal = () => {
    this.setState({
      show_freeze_balance_alert: false,
    })
  }

  renderFreezeBalanceAlertModal = () => {
    let {show_freeze_balance_alert, balanceInfo} = this.state;
    return (
      <View>
        <AlertModal
          visible={show_freeze_balance_alert}
          onClose={this.closeModal}
          onPress={() => this.closeModal()}
          title={'冻结金额'}
          desc={balanceInfo?.freeze_notice}
          actionText={'知道了'}/>
      </View>
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

  getIcon = (icon) => {
    switch (icon) {
      case 'order_search':
        return order_search();

      case 'operator_data':
        return operator_data()

      case 'delivery_sync':
        return delivery_sync()

      case 'adjust':
        return adjust()

      case 'order_compensate':
        return order_compensate()

      case 'product':
        return product()

      case 'performance':
        return performance()

      case 'fee_bills':
        return fee_bills()

      case 'ext_store':
        return ext_store()

      case 'deliveries':
        return deliveries()

      case 'stores':
        return stores()

      case 'printer':
        return printer()

      case 'push':
        return push()

      case 'setting':
        return setting()

      case 'help':
        return help()

      case 'history_notice':
        return history_notice()

      case 'third_recharge':
        return third_recharge()

      case 'stall_settlement':
        return stall_settlement()

      case 'settlement':
        return settlement()

      default:
        return order_search()

    }
  }

  renderBlock = () => {
    let {menu_list} = this.state;
    return (
      <For of={menu_list} each='item' index='index'>
        <View style={[styles.zoneWrap]} key={index}>
          <Text style={styles.zoneWrapTitle}>{item?.title} </Text>
          <View style={{flexDirection: 'row', justifyContent: 'center', flex: 1}}>
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

                  <SvgXml xml={this.getIcon(info?.icon)} width={28} height={28} style={[block_styles.block_img]}/>
                  <Text style={[block_styles.block_name]}>{info?.name} </Text>
                </TouchableOpacity>
              </For>
            </View>
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
          {this.renderStore()}
          <View style={{position: "relative", top: -53, paddingHorizontal: 12}}>
            {this.renderWallet()}
            {this.renderFreezeBalanceAlertModal()}
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
    fontWeight: 'bold',
    color: colors.white
  },
  storeType: {
    width: 44,
    height: 18,
    backgroundColor: rgbaColor(255, 255, 255, 0.9),
    borderRadius: 2,
    alignItems: "center",
    marginLeft: 5
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
    backgroundColor: rgbaColor(255, 255, 255, 0.2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5
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
    height: 86,
    borderRadius: 6,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between"
  },
  walletLabel: {
    fontSize: 12,
    color: colors.color666,
    marginBottom: 10
  },
  walletValue: {
    fontWeight: 'bold',
    fontSize: 20,
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#985800',
    marginRight: 5
  },
  ValueAddDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: '#C5852C'
  },
  zoneWrap: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 12,
    marginTop: 10
  },
  zoneWrapTitle: {fontSize: 16, fontWeight: 'bold', color: colors.color333},
  flexRowWrap: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  companyInfoWrap: {
    justifyContent: 'center', alignItems: 'center', height: 50, marginTop: 50
  },
  swiper: {
    height: 80,
    borderRadius: 10,
    marginTop: 10
  },
  logOut: {
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
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
    backgroundColor: rgbaColor(255, 255, 255, 0)
  },
  text: {
    fontSize: 20,
    color: colors.white
  },
  rightBtn: {
    width: 90,
    height: 32,
    backgroundColor: rgbaColor(0, 0, 0, 0.15),
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  rightText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 3
  }
})

const block_styles = StyleSheet.create({
  block_box: {
    width: (width * 0.75) / 4,
    height: (width * 0.75) / 4,
    marginHorizontal: 5,
    alignItems: "center"
  },
  block_img: {
    marginTop: 15,
    marginBottom: 8,
    width: 30,
    height: 30
  },
  block_name: {
    color: colors.color333,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17,
    textAlign: "center"
  },
  deliveryTip: {
    paddingHorizontal: 4,
    height: 14,
    borderRadius: 7,
    right: 0,
    top: 10,
    position: 'absolute',
    zIndex: 99,
  },
  deliveryTipText: {
    fontSize: 10, fontWeight: 'bold', color: colors.white, lineHeight: 14, textAlign: 'center'
  }
});

export default connect(mapStateToProps)(Mine)
