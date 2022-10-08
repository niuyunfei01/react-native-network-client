import React, {Component} from "react";
import {
  DeviceEventEmitter,
  Dimensions,
  Image,
  InteractionManager,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import {
  fetchStoreTurnover,
  fetchUserCount,
  fetchWorkers,
  userCanChangeStore,
} from "../../../reducers/mine/mineActions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {getConfig} from "../../../reducers/global/globalActions";
import {get_supply_orders} from "../../../reducers/settlement/settlementActions";
import store from "../../../reducers/store/index"
import {setRecordFlag} from "../../../reducers/store/storeActions"

import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import dayjs from "dayjs";

import JbbText from "../../common/component/JbbText";
import GoodsIncrement from "../../common/component/GoodsIncrement";
import BottomModal from "../../../pubilc/component/BottomModal";

import Config from "../../../pubilc/common/config";
import Cts from "../../../pubilc/common/Cts";
import FetchEx from "../../../pubilc/util/fetchEx";
import HttpUtils from "../../../pubilc/util/http";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import pxToEm from "../../../pubilc/util/pxToEm";
import native from "../../../pubilc/util/native";
import {hideModal, showError, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import * as tool from "../../../pubilc/util/tool";
import {Dialog} from "../../../weui";
import NextSchedule from "./_Mine/NextSchedule";
import {nrInteraction} from '../../../pubilc/util/NewRelicRN.js';
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import {SvgXml} from "react-native-svg";
import {
  achievement,
  commodityAdjustment,
  contactCustomerService,
  dataAnalysis,
  delivery,
  deliveryManagement,
  employeeManagement,
  expenseBill,
  help,
  messageRingtone,
  notice,
  operatingIncome,
  orderCompensation,
  orderSearch,
  pencilIcon,
  platformSettings,
  priceAdjustmentRecord,
  printSettings,
  pushSettings,
  rightArrow,
  settings,
  settlementRecord,
  shareActivity,
  shopManagement,
  stallIcon,
  switchStore,
  versionInformation,
  wallet
} from "../../../svg/svg";
import {LineView, Styles} from "../GoodsIncrementService/GoodsIncrementServiceStyle";
import {doJPushSetAlias} from "../../../pubilc/component/jpushManage";

var ScreenWidth = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}


function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        fetchUserCount,
        fetchWorkers,
        fetchStoreTurnover,
        userCanChangeStore,
        get_supply_orders,
        ...globalActions
      },
      dispatch
    )
  };
}

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    return navigation.addListener('focus', () => {
      onRefresh()
    });
  }, [navigation])
  return null;
}


const customerOpacity = 0.6;
const time = dayjs().format('YYYY-MM-DD')
let hasPriceControl = false
let hasAllowAnalys = true

class MineScene extends Component {
  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track('我的')
    const {
      currentUser,
      currStoreId,
      currentUserProfile,
      accessToken
    } = this.props.global;

    let prefer_store = "";
    let mobilephone = "";
    let cover_image = "";
    if (currentUserProfile !== null) {
      prefer_store = currentUserProfile.prefer_store;
      mobilephone = currentUserProfile.mobilephone;
      cover_image = currentUserProfile.cover_image;
    }

    let {
      currVendorId,
      currVersion,
      is_helper,
      service_uid,
      is_service_mgr,
    } = tool.vendor(this.props.global);
    const {sign_count, bad_cases_of, order_num, turnover} = this.props.mine;
    cover_image = cover_image ? Config.staticUrl(cover_image) : "";
    if (cover_image.indexOf("/preview.") !== -1) {
      cover_image = cover_image.replace("/preview.", "/www.");
    }

    this.state = {
      isRefreshing: false,
      onNavigating: false,
      FnPriceMsg: false,
      onStoreChanging: false,
      sign_count: sign_count[currentUser] || '',
      bad_cases_of: bad_cases_of[currentUser] || '',
      order_num: order_num[currStoreId] || '',
      turnover: turnover[currStoreId] || '',
      prefer_store: prefer_store,
      mobile_phone: mobilephone,
      currStoreId: currStoreId,
      currVendorId: currVendorId,
      currVersion: currVersion,
      is_helper: is_helper,
      is_service_mgr: is_service_mgr,
      fnPriceControlled: false,
      fnProfitControlled: false,
      cover_image: cover_image ? cover_image : "",
      adjust_cnt: 0,
      dutyUsers: [],
      // searchStoreVisible: false,
      storeStatus: {},
      fnSeparatedExpense: false,
      allow_merchants_store_bind: false,
      allow_analys: false,
      show_activity: false,
      activity_img: '',
      activity_url: '',
      // DistributionBalance: []
      turnover_new: '',
      title_new: '',
      order_num_new: '',
      is_mgr: false,
      showRecord: false,
      wsb_store_account: 0,
      have_not_read_advice: 0,
      show_call_service_modal: false,
      is_self_yy: false,
      contacts: '',
      title: "今日美团外卖自配送回传率",
      label: '实时回传：',
      content: "全部已达标",
      color: "green",
      footer: '自然日有效配送信息上传率需>=90%',
      showComesback: false,
    };

    this._doChangeStore = this._doChangeStore.bind(this);
    this.onCanChangeStore = this.onCanChangeStore.bind(this);
    this.onPress = this.onPress.bind(this);
    this.onGetUserCount = this.onGetUserCount.bind(this);
    this.onGetStoreTurnover = this.onGetStoreTurnover.bind(this);
    this.onHeaderRefresh = this.onHeaderRefresh.bind(this);
    this.onGetUserInfo = this.onGetUserInfo.bind(this);
    this.getCommonConfig = this.getCommonConfig.bind(this);
    this.getNotifyCenter = this.getNotifyCenter.bind(this);
    this.onRefresh = this.onRefresh.bind(this)

    if (service_uid > 0) {
      this.onGetUserInfo(service_uid);
    }
    this.getHuichuan(currStoreId, accessToken)
  }

  UNSAFE_componentWillMount() {
    this.getNotifyCenter();
    this.getStoreDataOfMine()
    // this._doChangeStore(currStoreId)
    this.getStoreTurnover();
    this.getHaveNotReadAdvice();
  }

  componentDidMount = () => {
    this.getActivity();
    this.registerJpush();
    this.subscription = DeviceEventEmitter.addListener("EventChangeStore", (params) => {
      this.onCanChangeStore(params['id']);
    })
  }

  // getStoreList = () => {
  //   const {accessToken, currStoreId} = this.props.global;
  //   let {md5_read_stores} = this.props.global?.config;
  //   const api = `/v1/new_api/Stores/check_can_read_stores/${md5_read_stores}?access_token=${accessToken}`
  //   HttpUtils.get.bind(this.props)(api).then((res) => {
  //     if (!res) {
  //       this.getTimeoutCommonConfig(currStoreId, () => {
  //       })
  //     }
  //   })
  // }

  getStoreTurnover = () => {
    const {accessToken, currStoreId} = this.props.global;
    const api = `v1/new_api/stores/get_store_turnover/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        turnover_new: res.data['turnover'],
        title_new: res.title,
        order_num_new: res.data['order_num']
      })
    })
  }

  getHaveNotReadAdvice = () => {
    const {accessToken, currStoreId, currentUser} = this.props.global
    const api = `/v1/new_api/advice/haveNotReadAdvice`
    HttpUtils.get.bind(this.props)(api, {
      store_id: currStoreId,
      access_token: accessToken,
      uid: currentUser
    }).then((res) => {
      this.setState({
        have_not_read_advice: res.have_not_read && res.have_not_read == 1
      })
    })
  }

  onRefresh = () => {
    // this.getStoreList();
    this.getStoreTurnover();
    this.getHaveNotReadAdvice();
  }

  onGetUserInfo = (uid) => {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;

    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchWorkers(this.state.currVendorId, accessToken, resp => {
        })
      );
    });
  }


  onGetUserCount = () => {
    const {currentUser, accessToken} = this.props.global;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(
        fetchUserCount(currentUser, accessToken, resp => {
          if (resp.ok) {
            let {sign_count, bad_cases_of} = resp.obj;
            this.setState({
              sign_count: sign_count,
              bad_cases_of: bad_cases_of
            });
          }
          this.setState({isRefreshing: false});
        })
      );
    });
  }

  getNotifyCenter = () => {
    let _this = this;
    const {currStoreId, accessToken} = this.props.global;
    const url = `api/notify_center/${currStoreId}.json?access_token=${accessToken}`;
    FetchEx.timeout(Config.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          let {adjust_cnt} = resp.obj;
          _this.setState({adjust_cnt: adjust_cnt});
        }
      })
  }

  getStoreDataOfMine = (store_id = 0) => {
    const access_token = this.props.global.accessToken
    if (store_id <= 0) {
      store_id = this.props.global.currStoreId
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
      let {is_helper} = this.state;
      if (res.is_store_mgr || is_helper) {
        this.onGetStoreTurnover(store_id, res.fnPriceControlled);
      } else {
        this.onGetUserCount();
      }
    })
  }

  onGetStoreTurnover = (currStoreId, fnPriceControlled) => {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;

    InteractionManager.runAfterInteractions(() => {
      if (fnPriceControlled > 0) {
        dispatch(
          get_supply_orders(
            currStoreId,
            tool.fullDay(new Date()),
            accessToken,
            async resp => {
              if (resp.ok) {
                let {order_num, total_price} = resp.obj;
                this.setState({
                  order_num: order_num,
                  turnover: tool.toFixed(total_price)
                });
                this.forceUpdate();
              } else {
                ToastLong(resp.desc);
              }
              this.setState({isRefreshing: false});
            }
          )
        );
      } else {
        dispatch(
          fetchStoreTurnover(currStoreId, accessToken, resp => {
            if (resp.ok) {
              let {order_num, turnover} = resp.obj;
              this.setState({
                order_num: order_num,
                turnover: turnover
              });
            }
            this.setState({isRefreshing: false});
          })
        );
      }
    });
  }

  UNSAFE_componentWillReceiveProps() {
    const {
      currentUser,
      currStoreId,
      currentUserProfile,
    } = this.props.global;

    let {
      prefer_store,
      mobilephone,
      cover_image
    } = currentUserProfile;

    const {sign_count, bad_cases_of, order_num, turnover} = this.props.mine;
    let {
      currVendorId,
      currVersion,
      is_helper,
    } = tool.vendor(this.props.global);

    cover_image = cover_image ? Config.staticUrl(cover_image) : "";
    if (cover_image.indexOf("/preview.") !== -1) {
      cover_image = cover_image.replace("/preview.", "/www.");
    }

    this.setState({
      sign_count: sign_count[currentUser],
      bad_cases_of: bad_cases_of[currentUser],
      currentUser: currentUser,
      prefer_store: prefer_store,
      mobile_phone: mobilephone,
      currStoreId: currStoreId,
      currVendorId: currVendorId,
      currVersion: currVersion,
      is_helper: is_helper,
      cover_image: cover_image,
    });
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.getStoreDataOfMine()
    const {accessToken, currStoreId} = this.props.global;
  }

  registerJpush = () => {
    const {currentUser} = this.props.global
    doJPushSetAlias(currentUser)
  }

  _doChangeStore = (store_id) => {
    if (this.state.onStoreChanging) {
      return false;
    }
    this.setState({onStoreChanging: true});
    showModal('加载中...')
    const {global} = this.props;
    const callback = (ok, msg) => {
      if (ok) {
        this.getCommonConfig(store_id, (ok, msg, obj) => {
          if (ok) {
            let {
              is_mgr,
              is_service_mgr,
              is_helper
            } = tool.vendor(this.props.global);
            let {vendor_info, vendor_id} = global;
            this.setState({
              currStoreId: store_id,
              currVendorId: vendor_id,
              currVersion: vendor_info?.currVersion,
              is_mgr: is_mgr,
              is_service_mgr: is_service_mgr,
              is_helper: is_helper,
              onStoreChanging: false
            });
            this.setState({onStoreChanging: false});
          } else {
            ToastLong(msg);
            hideModal()
            this.setState({onStoreChanging: false});
          }
        });
      } else {
        ToastLong(msg);
        hideModal()
        this.setState({onStoreChanging: false});
      }
    };
    if (Platform.OS === 'ios') {
      callback(true, '');
    } else {
      native.setCurrStoreId(store_id, callback).then();
    }
  }

  getCommonConfig = (store_id, callback = () => {
  }) => {
    const {accessToken} = this.props.global;
    this.props.dispatch(getConfig(accessToken, store_id, (ok, msg, obj) => {
      callback(ok, msg, obj);
    }));
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
        showComesback: res.show,
      })
    })
  }

  onCanChangeStore = (store_id) => {
    const {dispatch, global} = this.props;
    const {accessToken} = global;
    dispatch(
      userCanChangeStore(store_id, accessToken, resp => {
        if (resp.obj.auth_store_change) {
          this._doChangeStore(store_id);
          this.getStoreDataOfMine(store_id)
          this.getStoreTurnover()
          this.getHuichuan(store_id, accessToken)
        } else {
          ToastLong("您没有该店访问权限, 如需访问请向上级申请");
        }
      })
    );
  }

  recordQuestionFirstShow(flag) {
    const {accessToken, currentUser} = this.props.global;
    const api = `/vi/new_api/record/record_question_first_show?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {
      user_id: currentUser,
      flag: flag
    }).then()
  }

  onPress = (route, params = {}) => {
    this.props.navigation.navigate(route, params);
  }

  orderSearch = () => {
    this.mixpanel.track('订单搜索')
    this.onPress(Config.ROUTE_ORDER_SEARCH)
  }

  distributionAnalysis = () => {
    this.mixpanel.track('数据分析页')
    this.onPress(Config.ROUTE_DistributionAnalysis)
  }

  storeManager = () => {
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

  pushSetting = () => {
    this.mixpanel.track('推送页')
    this.onPress(Config.ROUTE_PUSH)
  }
  platformSetting = () => {
    this.mixpanel.track('平台页')
    this.onPress(Config.ROUTE_STORE_STATUS, {
      updateStoreStatusCb: (storeStatus) => {
        this.setState({storeStatus: storeStatus})
      }
    })
  }

  printerSetting = () => {
    this.mixpanel.track('打印页')
    this.onPress(Config.ROUTE_PRINTERS)
  }

  deliverySetting = () => {
    this.mixpanel.track('配送管理')
    this.onPress(Config.ROUTE_DELIVERY_LIST, {dispatch: this.props.dispatch})
  }

  settingPage = () => {
    this.mixpanel.track('设置页')
    this.onPress(Config.ROUTE_SETTING)
  }
  versionInfo = () => {
    this.mixpanel.track('版本信息页')
    this.onPress(Config.ROUTE_VERSION);
  }
  oncallservice = () => {
    if (!this.state.is_self_yy) {
      return this.setState({
        show_call_service_modal: true
      })
    }
    this.mixpanel.track('我的_联系客服')
    this.openMiniprogarm()
  }

  getActivity = () => {
    const {accessToken, currStoreId} = this.props.global;
    const api = `api/get_activity_info?access_token=${accessToken}`
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
              activity_url: item.url + '?access_token=' + accessToken,
            })
          }
        })
        return
      }
      this.setState({
        show_activity: true,
        activity_img: res.icon,
        activity_url: res.url + '?access_token=' + accessToken,
      })
    }).catch(() => {
    })
  }

  helpPage = () => {
    this.mixpanel.track('帮助页')
    this.onPress(Config.ROUTE_HELP)
  }

  openMiniprogarm = () => {
    let {currVendorId} = tool.vendor(this.props.global)
    let data = {
      v: currVendorId,
      s: this.props.global.currStoreId,
      u: this.props.global.currentUser,
      m: this.props.global.currentUserProfile.mobilephone,
      place: 'mine'
    }
    JumpMiniProgram("/pages/service/index", data);
  }

  oncloseCallModal = (e = 0) => {
    this.setState({
      show_call_service_modal: false
    })
    if (e === 1) {
      this.openMiniprogarm()
    }
  }


  callService = () => {
    if (this.state.contacts !== '' && this.state.contacts !== undefined) {
      this.setState({
        show_call_service_modal: false
      }, () => {
        native.dialNumber(this.state.contacts);
      })
    } else {
      ToastLong("号码为空")
    }
  }

  jumpToAddStore = () => {
    const {navigation} = this.props
    let {is_mgr} = this.state
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate(Config.ROUTE_STORE_ADD, {
        btn_type: "edit",
        is_mgr: is_mgr,
        editStoreId: this.props.global.currStoreId
      });
    });
  }

  renderHeader = () => {
    let {store_info} = this.props.global;
    return (
      <View style={[header_styles.main_box]}>
        <View style={header_styles.row}>
          <JbbText style={header_styles.shop_name}>
            {tool.length((store_info?.name || '')) > 12 ? store_info?.name.substring(0, 11) + '...' : store_info?.name}
          </JbbText>
          <TouchableOpacity style={styles.modifyStore} onPress={this.jumpToAddStore}>
            <SvgXml xml={pencilIcon(colors.color333, 18, 18)}/>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => {
          this.onPress(Config.ROUTE_STORE_SELECT, {
            onBack: (item) => {
              this.selectStore(item)
            }
          })
        }}>
          <View style={header_styles.row}>
            <SvgXml xml={switchStore(colors.main_color, 18, 18)}/>
            <Text style={header_styles.change_shop}>切换门店 </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  selectStore = (item) => {
    DeviceEventEmitter.emit("EventChangeStore", {
      id: item['id']
    })
  }

  jumpToStoreStatus = () => {
    this.onPress(Config.ROUTE_STORE_STATUS, {
      updateStoreStatusCb: (storeStatus) => {
        this.setState({storeStatus: storeStatus})
      }
    })
  }
  renderStoreStatus = () => {
    let {storeStatus} = this.state
    const statusColorStyle = storeStatus.all_close ? (tool.length(storeStatus.business_status) > 0 ? styles.close_text : styles.noExtStoreText) : styles.open_text;
    const statusFlag = storeStatus.all_close ? (tool.length(storeStatus.business_status) > 0 ? styles.closeFlag : styles.noExtStoreFlag) : styles.openStoreFlag;
    const storeStatusWrap = storeStatus.all_close ? (tool.length(storeStatus.business_status) > 0 ? header_styles.closeStoreStatusWrap : header_styles.noExtStoreStatusWrap) : header_styles.openStoreStatusWrap;
    const rightStatus = storeStatus.all_close ? (tool.length(storeStatus.business_status) > 0 ? '#EE2626' : '#409EFF') : colors.main_color
    return (
      <TouchableOpacity style={storeStatusWrap} onPress={this.jumpToStoreStatus}>
        <View style={header_styles.row}>
          <View style={statusFlag}/>
          <View style={[header_styles.icon_open]}>
            <Text style={[statusColorStyle, {fontSize: 14, fontWeight: 'bold'}]}>
              {storeStatus.all_status_text}
            </Text>
          </View>
        </View>
        <SvgXml xml={rightArrow(rightStatus)}/>
      </TouchableOpacity>
    )
  }

  jumpToUser = () => {
    const {currentUser, currentUserProfile} = this.props.global;
    this.onPress(Config.ROUTE_USER, {
      type: "mine",
      currentUser: currentUser,
      currVendorId: this.state.currVendorId,
      screen_name: currentUserProfile?.screen_name,
      mobile_phone: this.state.mobile_phone,
      cover_image: this.state.cover_image
    })
  }

  jumpToAccountFill = () => {
    const {navigation} = this.props;
    this.mixpanel.track('我的_充值')
    navigation.navigate(Config.ROUTE_ACCOUNT_FILL)
  }

  renderManager = () => {
    let {
      turnover, fnPriceControlled, fnProfitControlled, turnover_new, title_new, order_num_new, cover_image,
      wsb_store_account
    } = this.state;
    let {currentUserProfile} = this.props.global
    return (
      <TouchableOpacity activeOpacity={1} onPress={this.jumpToUser}>

        <View style={worker_styles.container}>
          <Image
            style={[worker_styles.icon_head]}
            source={tool.length(cover_image) > 0 ? {uri: cover_image} : require("../../../img/My/touxiang180x180_.png")}
          />

          <View style={[worker_styles.sales_box]}>
            <Text style={worker_styles.worker_name}>
              {(currentUserProfile?.screen_name || "").substring(0, 4)}
            </Text>
            <Text style={[worker_styles.sale_text]}>
              {fnPriceControlled > 0 ? "今日已完成" : "今日订单"}: {order_num_new}
            </Text>
            {fnPriceControlled > 0 && fnProfitControlled > 0 ? (
                <TouchableOpacity activeOpacity={1} onPress={() => this.setState({FnPriceMsg: true})}>
                  <Text style={[worker_styles.sale_text, worker_styles.sales_money]}>
                    预计最低收益: {!isNaN(turnover) && "¥"}{turnover}&nbsp;
                    <FontAwesome name="question-circle" color={'#00aeff'} size={16}/>
                  </Text>
                </TouchableOpacity>
              ) :
              <Text style={[worker_styles.sale_text]}>
                {title_new}: ¥{turnover_new}
              </Text>
            }
          </View>
          <If condition={wsb_store_account === 1}>
            <TouchableOpacity onPress={this.jumpToAccountFill} style={worker_styles.accountBill}>
              <View style={worker_styles.accountBillWrap}>
                <Text style={{color: colors.white, fontSize: 14, fontWeight: "bold"}}> 充值 </Text>
              </View>
            </TouchableOpacity>
          </If>
          <View style={[worker_styles.chevron_right]}>
            <SvgXml xml={rightArrow(colors.main_color)} style={[worker_styles.right_btn]}/>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderWorker = () => {
    const {currentUser, currentUserProfile} = this.props.global;
    const {cover_image} = this.state
    return (
      <TouchableOpacity activeOpacity={1} onPress={this.jumpToUser}>
        <View style={worker_styles.container}>
          <Image
            style={[worker_styles.icon_head]}
            source={tool.length(cover_image) > 0 ? {uri: cover_image} : require("../../../img/My/touxiang180x180_.png")}/>
          <View style={[worker_styles.worker_box]}>
            <Text style={worker_styles.worker_name}>
              {(currentUserProfile?.screen_name || "").substring(0, 4)}
            </Text>
          </View>
          <View style={[worker_styles.order_box]}>
            <Text style={worker_styles.order_num}>{this.state.sign_count} </Text>
            <Text style={[worker_styles.tips_text]}>出勤天数 </Text>
          </View>
          <View style={[worker_styles.question_box]}>
            <Text style={worker_styles.order_num}>
              {this.state.bad_cases_of}
            </Text>
            <Text style={[worker_styles.tips_text]}>30天投诉 </Text>
          </View>
          <TouchableOpacity
            style={[worker_styles.chevron_right]}
            onPress={() =>
              this.onPress(Config.ROUTE_USER, {
                type: "mine",
                currentUser: currentUser,
                currVendorId: this.state.currVendorId
              })
            }
          >
            <Entypo name="chevron-thin-right" style={[worker_styles.right_btn]}/>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  selfDelivery = () => {
    this.props.navigation.navigate(Config.ROUTE_COMES_BACK);
    this.mixpanel.track('我的_查看回传率')
  }

  renderOftenUse = () => {
    const {
      is_service_mgr, fnPriceControlled, allow_analys, wsb_store_account, color, content, showComesback
    } = this.state
    const {global} = this.props
    let {co_type} = tool.vendor(global);
    if (!allow_analys && is_service_mgr && fnPriceControlled > 0)
      hasPriceControl = true
    if (fnPriceControlled > 0)
      hasAllowAnalys = false
    return (
      <View style={[styles.zoneWrap]}>
        <Text style={Styles.headerTitleText}>
          常用功能
        </Text>
        <LineView/>
        <View style={header_styles.row}>
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
              onPress={this.distributionAnalysis}
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
          <If condition={co_type === 'peisong' && showComesback}>
            <TouchableOpacity style={[block_styles.block_box]} onPress={this.selfDelivery}
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
            <TouchableOpacity style={[block_styles.block_box]} onPress={this.settingPage}
                              activeOpacity={customerOpacity}>
              <SvgXml xml={settings()} width={28} height={28} style={[block_styles.block_img]}/>
              <Text style={[block_styles.block_name]}>设置</Text>
            </TouchableOpacity>
          </If>
          <TouchableOpacity style={[block_styles.block_box]} onPress={this.oncallservice}
                            activeOpacity={customerOpacity}>
            <SvgXml xml={contactCustomerService()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>联系客服</Text>
          </TouchableOpacity>

        </View>
      </View>
    )
  }

  render() {

    nrInteraction(MineScene.name)

    let {currVersion, is_mgr, is_helper} = this.state;
    const {navigation, global} = this.props
    const {currStoreId, accessToken, store_info} = global
    const {vip_info = {}} = store_info;
    return (
      <>
        {this.renderHeader()}
        <FetchView navigation={this.props.navigation} onRefresh={this.onRefresh}/>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor="gray"
            />
          }
          style={{backgroundColor: colors.f2, marginTop: 4}}
        >

          {this.renderStoreStatus()}
          {is_mgr || is_helper ? this.renderManager() : this.renderWorker()}
          <If condition={currVersion === Cts.VERSION_DIRECT}>
            <NextSchedule/>
          </If>
          <If condition={vip_info.show_vip}>
            <GoodsIncrement currStoreId={currStoreId} accessToken={accessToken} navigation={navigation}/>
          </If>
          {this.renderOftenUse()}
          {this.renderStoreBlock()}
          <If condition={currVersion === Cts.VERSION_DIRECT}>
            {this.renderDirectBlock()}
            {this.renderZtBlock()}
          </If>
          {this.renderVersionBlock()}
          {this.renderCopyRight()}
          <Dialog
            visible={this.state.FnPriceMsg}
            buttons={[
              {
                type: "primary",
                label: "知道了",
                onPress: () => {
                  this.setState({FnPriceMsg: false});
                }
              }
            ]}
          >
            <Text style={styles.fn_price_msg}>
              最低收益为 已完成订单 的 所有商品 的 保底价 总和
            </Text>
            <Text/>
            <View style={{flexDirection: "row"}}>
              <Text style={styles.fn_price_msg}>有关保底价的相关问题可查看 </Text>
              <TouchableOpacity
                onPress={() => {
                  this.setState({FnPriceMsg: false});
                  let path = `/help/answer?type_id=5`;
                  let url = Config.serverUrl(path, Config.https);
                  this.onPress(Config.ROUTE_WEB, {url: url});
                }}
              >
                <Text style={styles.help_msg}>帮助信息 </Text>
              </TouchableOpacity>
            </View>
          </Dialog>
          {this.renderModal()}
        </ScrollView>
      </>
    );
  }

  jumpToHuiChuan = () => {
    this.mixpanel.track('我的_查看回传率')
    this.props.navigation.navigate(Config.ROUTE_COMES_BACK);

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
      currVendorId, currVersion, is_mgr, is_helper, is_service_mgr, fnPriceControlled, fnProfitControlled, activity_url,
      activity_img, wsb_store_account, color, content, showComesback
    } = this.state
    const fn_stall = store_info?.fn_stall
    const co_type = vendor_info?.co_type
    return (
      <View style={[block_styles.bottomWrap]}>
        <If condition={co_type !== 'peisong' && showComesback}>
          <TouchableOpacity style={[block_styles.block_box]} onPress={this.selfDelivery}
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
        <TouchableOpacity style={[block_styles.block_box]} onPress={this.orderSearch} activeOpacity={customerOpacity}>
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
          onPress={this.storeManager}
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
        }}
                          activeOpacity={customerOpacity}>
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
            }}
            activeOpacity={customerOpacity}>
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
            }}
            activeOpacity={customerOpacity}
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

        <If condition={this.state.wsb_store_account !== 1}>
          <TouchableOpacity style={[block_styles.block_box]}
                            onPress={() => this.onPress(Config.ROUTE_OLDSEP_EXPENSE, {showBtn: this.state.wsb_store_account})}
                            activeOpacity={customerOpacity}>
            <SvgXml xml={expenseBill()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>费用账单</Text>
          </TouchableOpacity>
        </If>

        <TouchableOpacity style={[block_styles.block_box]}
                          onPress={this.platformSetting}
                          activeOpacity={customerOpacity}>
          <SvgXml xml={platformSettings()} width={28} height={28} style={[block_styles.block_img]}/>
          <Text style={[block_styles.block_name]}>平台设置</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[block_styles.block_box]} onPress={this.deliverySetting}
                          activeOpacity={customerOpacity}>
          <SvgXml xml={deliveryManagement()} width={28} height={28} style={[block_styles.block_img]}/>

          <Text style={[block_styles.block_name]}>配送管理</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[block_styles.block_box]} onPress={this.printerSetting}
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

        <TouchableOpacity style={[block_styles.block_box]} onPress={this.pushSetting} activeOpacity={customerOpacity}>
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
    );
  }

  renderVersionBlock = () => {
    const {have_not_read_advice, activity_url, activity_img, wsb_store_account} = this.state
    const {show_expense_center, vendor_info} = this.props.global;
    let co_type = vendor_info?.co_type;
    return (
      <View style={[block_styles.bottomWrap]}>
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
            <SvgXml xml={shareActivity()} width={28} height={28} style={[block_styles.block_img]}/>
            <Text style={[block_styles.block_name]}>老带新活动</Text>
          </TouchableOpacity>
        </If>
        <TouchableOpacity
          style={[block_styles.block_box]}
          activeOpacity={customerOpacity}
          onPress={this.versionInfo}
        >
          <SvgXml xml={versionInformation()} width={28} height={28} style={[block_styles.block_img]}/>
          <Text style={[block_styles.block_name]}>版本信息</Text>
        </TouchableOpacity>


        <TouchableOpacity style={[block_styles.block_box]} activeOpacity={customerOpacity} onPress={this.helpPage}>
          <SvgXml xml={help()} width={28} height={28} style={[block_styles.block_img]}/>
          <Text style={[block_styles.block_name]}>帮助</Text>
        </TouchableOpacity>

        <If condition={co_type === 'peisong'}>
          <TouchableOpacity style={[block_styles.block_box]} onPress={this.settingPage}
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

        {/*<View style={[block_styles.empty_box]}/>*/}
      </View>
    );
  }

  renderCopyRight = () => {

    return (
      <View style={styles.companyInfoWrap}>
        <Text style={{color: colors.colorDDD}}>@版权所有</Text>
        <Text style={{color: colors.colorDDD}}>北京家帮帮科技有限公司</Text>
      </View>
    );
  }

  renderDirectBlock = () => {
    let token = `?access_token=${this.props.global.accessToken}`;
    let {currStoreId, currVendorId} = this.state;
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_INVOICING)}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/diaohuo_.png")}
          />
          <Text style={[block_styles.block_name]}>调货单</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/stores/prod_loss.html${token}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/baosun_.png")}
          />
          <Text style={[block_styles.block_name]}>报损</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/stores/orders_buy_combined.html${token}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}>
          <Image style={[block_styles.block_img]} source={require("../../../img/My/caigou_.png")}/>
          <Text style={[block_styles.block_name]}>门店采购</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress('InventoryHome')}
          activeOpacity={customerOpacity}>
          <Image style={[block_styles.block_img]} source={require("../../../img/My/caigou_.png")}/>
          <Text style={[block_styles.block_name]}>库存管理</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_INVENTORY_MATERIAL_TASK, {})}
          activeOpacity={customerOpacity}>
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/caigou_.png")}
          />
          <Text style={[block_styles.block_name]}>任务中心</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/expenses/show_expenses.html${token}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/baoxiao_.png")}
          />
          <Text style={[block_styles.block_name]}>报销</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/stores/direct_pay_list.html${token}&&store_id=${currStoreId}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/fukuanjilu_.png")}
          />
          <Text style={[block_styles.block_name]}>微信付款记录</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/stores/products.html${token}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/xinxiweihu_.png")}
          />
          <Text style={[block_styles.block_name]}>产品模板信息维护</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/vm/index.html${token}&&time=${Date.now()}#!/home`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/fankuiyuyeji_.png")}
          />
          <Text style={[block_styles.block_name]}>反馈与业绩</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/market_tools/users.html${token}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}>
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/kehu_.png")}
          />
          <Text style={[block_styles.block_name]}>客户管理</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/stores/sales_ana.html${token}&&_v_id=${currVendorId}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/xiaoshou_.png")}
          />
          <Text style={[block_styles.block_name]}>销售分析</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderZtBlock = () => {
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_ZT_ORDER_PRINT)}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../../img/My/print.png")}
          />
          <Text style={[block_styles.block_name]}>打印自提单</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderModal = () => {
    return (
      <View style={[block_styles.container]}>
        <BottomModal
          title={'有奖问卷调研'}
          actionText={'领取'}
          btnStyle={{
            backgroundColor: colors.white,
          }}
          btnTitleStyle={{color: colors.main_color, fontWeight: 'bold'}}
          closeText={'下班再看'}
          closeBtnStyle={{
            borderColor: colors.b2,
            borderRightWidth: pxToDp(1),
            borderLeftWidth: 0,
            borderTopWidth: 0,
            borderBottomWidth: 0
          }}
          btnBottomStyle={{
            borderTopWidth: pxToDp(1),
            borderColor: colors.b2,
            paddingBottom: 0,
          }}
          onPressClose={() => {
            store.dispatch(setRecordFlag(true))
            this.setState({
              showRecord: false,
            })
            this.recordQuestionFirstShow(1)
          }}
          onPress={() => {
            this.recordQuestionFirstShow(0)
            this.setState({
              showRecord: false,
            })
            let url = 'https://jinshuju.net/f/ObTCwq';
            this.onPress(Config.ROUTE_WEB, {url: url, title: '问卷调查'});
          }}
          visible={this.state.showRecord}
          onClose={() => this.setState({
            showRecord: false,
          })}
        >
          <Text style={{
            color: 'red',
            fontWeight: 'bold',
            fontSize: 16,
            margin: 10,
            textAlign: 'center'
          }}>运营邀请您领取1000元现金红包</Text>
        </BottomModal>

        <BottomModal title={'提示'} actionText={'其他问题'} closeText={'配送问题'} onPress={this.callService}
                     onPressClose={() => this.oncloseCallModal(1)}
                     visible={this.state.show_call_service_modal}
                     btnBottomStyle={{
                       borderTopWidth: 1,
                       borderTopColor: "#E5E5E5",
                       paddingBottom: 0,
                     }}
                     closeBtnStyle={{
                       borderWidth: 0,
                       borderRadius: 0,
                       borderRightWidth: 1,
                       borderColor: "#E5E5E5",
                     }}
                     btnStyle={{borderWidth: 0, backgroundColor: colors.white}}
                     closeBtnTitleStyle={{color: colors.color333}}
                     btnTitleStyle={{color: colors.main_color}} onClose={this.oncloseCallModal}>
          <View style={{
            marginHorizontal: 20,
            marginVertical: 8
          }}>
            <Text style={{
              fontSize: 15,
              color: colors.color333,
            }}>您的问题是：</Text>
            <Text style={{
              fontSize: 15,
              color: colors.color333,
              marginVertical: 4,
            }}> 配送问题：请点击配送问题，联系客服</Text>
            <Text style={{
              fontSize: 15,
              color: colors.color333,
            }}> 其他问题：请点击其他问题或通过其他方式联系店铺运营 </Text>
          </View>
        </BottomModal>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  zoneWrap: {
    backgroundColor: colors.white,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 8
  },
  companyInfoWrap: {
    justifyContent: 'center', alignItems: 'center', height: pxToDp(300)
  },
  modifyStore: {
    padding: 10,
  },
  fn_price_msg: {
    fontSize: pxToEm(30),
    color: colors.color333
  },
  help_msg: {
    fontSize: pxToEm(30),
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#00aeff"
  },
  closeFlag: {
    marginLeft: 12,
    marginRight: 4,
    backgroundColor: colors.warn_color,
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  noExtStoreFlag: {
    marginLeft: 12,
    marginRight: 4,
    backgroundColor: '#409EFF',
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  openStoreFlag: {
    marginLeft: 12,
    marginRight: 4,
    backgroundColor: colors.main_color,
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  close_text: {
    color: colors.warn_red,
    textAlign: "center"
  },
  noExtStoreText: {
    color: '#409EFF',
    textAlign: "center"
  },
  open_text: {
    color: colors.main_color,
    textAlign: "center"
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

const header_styles = StyleSheet.create({
  container: {
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
    paddingLeft: pxToDp(30),
    backgroundColor: colors.white,
    marginBottom: pxToDp(14)
  },
  row: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  main_box: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingTop: 11,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 11,

  },
  shop_name: {
    color: colors.color111,
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 25
  },
  change_shop: {
    paddingLeft: 4,
    color: colors.main_color,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 17
  },
  icon_box: {
    position: "absolute",
    right: 0,
    top: 0
  },
  icon_open: {
    height: 39,
    justifyContent: 'center'
  },
  openStoreStatusWrap: {
    backgroundColor: '#EAFAED',
    borderRadius: 4,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeStoreStatusWrap: {
    backgroundColor: '#FAEAEA',
    borderRadius: 4,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  noExtStoreStatusWrap: {
    backgroundColor: '#EAF2FA',
    borderRadius: 4,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

const worker_styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: colors.white,
    flexDirection: "row",
    marginLeft: 10,
    marginRight: 10,
  },
  icon_head: {
    marginHorizontal: pxToDp(20),
    marginVertical: pxToDp(25),
    width: pxToDp(90),
    height: pxToDp(90),
    borderRadius: pxToDp(50)
  },
  worker_box: {
    width: pxToDp(130),
    justifyContent: "center"
  },
  worker_name: {
    color: colors.color111,
    lineHeight: 17,
    fontSize: 12,
    fontWeight: "bold"
  },
  order_box: {
    marginLeft: pxToDp(35),
    justifyContent: "center"
  },
  question_box: {
    marginLeft: pxToDp(60),
    justifyContent: "center"
  },
  order_num: {
    color: colors.color111,
    fontSize: pxToEm(40),
    lineHeight: pxToDp(40),
    fontWeight: "bold",
    textAlign: "center"
  },
  tips_text: {
    color: colors.color999,
    fontSize: pxToDp(24),
    lineHeight: pxToDp(26),
    textAlign: "center",
    marginTop: pxToDp(16)
  },
  chevron_right: {
    position: "absolute",
    right: 0,
    justifyContent: "center",
    alignItems: "flex-start",
    width: pxToDp(60),
    height: pxToDp(140)
  },
  right_btn: {
    fontSize: pxToEm(40),
    textAlign: "center",
    color: colors.main_color
  },
  sales_box: {
    marginLeft: 12,
    marginTop: 11,
    position: "relative"
  },
  sale_text: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.color000
  },
  sales_money: {
    marginTop: 9,
    marginBottom: 6
  },
  accountBill: {
    marginTop: pxToDp(45),
    marginLeft: pxToDp(25),
    position: "absolute",
    top: 0,
    right: 40
  },
  accountBillWrap: {
    width: pxToDp(96),
    height: pxToDp(46),
    backgroundColor: colors.main_color,
    marginRight: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  }
});

const block_styles = StyleSheet.create({
  container: {
    marginBottom: pxToDp(22),
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.white
  },
  bottomWrap: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: "wrap",
    borderRadius: 8,
    backgroundColor: colors.white
  },
  block_box: {
    //剩1个格子用正常样式占位
    // width: pxToDp(239),
    // height: pxToDp(188),
    width: ScreenWidth / 4 - 5,
    height: ScreenWidth / 4 - 5,

    // borderColor: colors.main_back,
    // borderWidth: pxToDp(1),
    alignItems: "center"
  },
  empty_box: {
    //剩2个格子用这个样式占位
    width: pxToDp(478),
    height: pxToDp(188),
    backgroundColor: colors.white,

    borderColor: colors.f2,
    borderWidth: pxToDp(1),
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
  notice_point: {
    width: pxToDp(30),
    height: pxToDp(30),
    borderRadius: pxToDp(15),
    backgroundColor: colors.red,
    position: 'absolute',
    right: pxToDp(60),
    top: pxToDp(20),
    zIndex: 99
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

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(MineScene);
