import React, {PureComponent} from "react";
import {
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
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import Icon from "react-native-vector-icons/FontAwesome";
import Button from "react-native-vector-icons/Entypo";
import Config from "../../config";
import Cts from "../../Cts";

import AppConfig from "../../config.js";
import FetchEx from "../../util/fetchEx";
import HttpUtils from "../../util/http";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {getCommonConfig, setCurrentStore, upCurrentProfile} from "../../reducers/global/globalActions";
import native from "../../common/native";
import {hideModal, showModal, ToastLong} from "../../util/ToastUtils";
import {
  fetchDutyUsers,
  fetchStoreTurnover,
  fetchUserCount,
  fetchWorkers,
  userCanChangeStore
} from "../../reducers/mine/mineActions";
import * as tool from "../../common/tool";
import {fetchUserInfo} from "../../reducers/user/userActions";
import Moment from "moment";
import {get_supply_orders} from "../../reducers/settlement/settlementActions";
import {Dialog} from "../../weui/index";
import SearchStore from "../component/SearchStore";
import NextSchedule from "./_Mine/NextSchedule";
import {Styles} from "../../themes";
import JPush from "jpush-react-native";
import {nrInteraction} from '../../NewRelicRN.js';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {screenWidth} from "react-native-calendars/src/expandableCalendar/commons";

var ScreenWidth = Dimensions.get("window").width;
function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        fetchUserCount,
        fetchWorkers,
        fetchDutyUsers,
        fetchStoreTurnover,
        fetchUserInfo,
        upCurrentProfile,
        userCanChangeStore,
        get_supply_orders,
        ...globalActions
      },
      dispatch
    )
  };
}

const customerOpacity = 0.6;

class MineScene extends PureComponent {
  constructor(props) {
    super(props);

    const {
      currentUser,
      currStoreId,
      currentUserProfile,
    } = this.props.global;


    let prefer_store = "";
    let screen_name = "";
    let mobilephone = "";
    let cover_image = "";
    if (currentUserProfile !== null) {
      prefer_store = currentUserProfile.prefer_store;
      screen_name = currentUserProfile.screen_name;
      mobilephone = currentUserProfile.mobilephone;
      cover_image = currentUserProfile.cover_image;
    }

    let {
      currStoreName,
      currVendorName,
      currVendorId,
      currVersion,
      is_helper,
      service_uid,
      is_service_mgr,
    } = tool.vendor(this.props.global);
    const {sign_count, bad_cases_of, order_num, turnover} = this.props.mine;
    let { config } = this.props.global;
    cover_image = !!cover_image ? Config.staticUrl(cover_image) : "";
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
      currentUser: currentUser,
      prefer_store: prefer_store,
      screen_name: screen_name,
      mobile_phone: mobilephone,
      currStoreId: currStoreId,
      currStoreName: currStoreName,
      currVendorId: currVendorId,
      currVersion: currVersion,
      is_helper: is_helper,
      is_service_mgr: is_service_mgr,
      fnPriceControlled: false,
      fnProfitControlled: false,
      currVendorName: currVendorName,
      cover_image: !!cover_image ? cover_image : "",
      adjust_cnt: 0,
      dutyUsers: [],
      searchStoreVisible: false,
      storeStatus: {},
      fnSeparatedExpense: false,
      allow_merchants_store_bind: false,
      DistributionBalance: []
    };

    this._doChangeStore = this._doChangeStore.bind(this);
    this.onCanChangeStore = this.onCanChangeStore.bind(this);
    this.onPress = this.onPress.bind(this);
    this.onGetUserCount = this.onGetUserCount.bind(this);
    this.onGetStoreTurnover = this.onGetStoreTurnover.bind(this);
    this.onHeaderRefresh = this.onHeaderRefresh.bind(this);
    this.onGetUserInfo = this.onGetUserInfo.bind(this);
    this.getTimeoutCommonConfig = this.getTimeoutCommonConfig.bind(this);
    this.getNotifyCenter = this.getNotifyCenter.bind(this);
    this.onGetDutyUser = this.onGetDutyUser.bind(this);

    if (service_uid > 0) {
      this.onGetUserInfo(service_uid);
    }

    this.onGetDutyUser();
  }

  UNSAFE_componentWillMount () {
    let {currStoreId, canReadStores} = this.props.global;
    if (!(currStoreId > 0)) {
      let first_store_id = tool.first_store_id(canReadStores);
      if (first_store_id > 0) {
        this._doChangeStore(first_store_id, false);
      }
    }
    this.getNotifyCenter();
    this.getStoreDataOfMine()
    this._doChangeStore(currStoreId)
  }
  componentDidUpdate() {
  }

  componentWillUnmount() {
  }

  onGetUserInfo(uid) {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(fetchUserInfo(uid, accessToken, resp => {
        })
      );
    });
  }

  onGetUserCount () {
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

  onGetDutyUser () {
    const {accessToken, currStoreId} = this.props.global;
    let _this = this;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(
        fetchDutyUsers(currStoreId, accessToken, resp => {
          if (resp.ok) {
            _this.setState({
              dutyUsers: resp.obj
            })
          }
          _this.setState({isRefreshing: false});
        })
      );
    });
  }

  getNotifyCenter () {
    let _this = this;
    const {currStoreId, accessToken} = this.props.global;
    const url = `api/notify_center/${currStoreId}.json?access_token=${accessToken}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          let {adjust_cnt} = resp.obj;
          _this.setState({adjust_cnt: adjust_cnt});
        }
      })
  }

  getStoreDataOfMine (store_id = 0) {
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
        // DistributionBalance: res.bill_records
        DistributionBalance: [{day: "dasdfs", total_balanced: 125}]
      })
      if (res.allow_merchants_store_bind) {
        this.setState({
          allow_merchants_store_bind: res.allow_merchants_store_bind
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

  onGetStoreTurnover (currStoreId, fnPriceControlled) {
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

  callCustomerService () {
    let server_info = tool.server_info(this.props);
    let dutyUsers = this.state.dutyUsers;
    if (dutyUsers && Array.isArray(dutyUsers) && dutyUsers.length > 0) {
      let key = Math.floor(Math.random() * dutyUsers.length);
      let u = dutyUsers[key];
      if (u.mobilephone) {
        native.dialNumber(u.mobilephone);
        return;
      }
    }
    native.dialNumber(server_info.mobilephone);
  }

  UNSAFE_componentWillReceiveProps () {
    const {
      currentUser,
      currStoreId,
      currentUserProfile,
    } = this.props.global;

    let {
      prefer_store,
      screen_name,
      mobilephone,
      cover_image
    } = currentUserProfile;

    const {sign_count, bad_cases_of, order_num, turnover} = this.props.mine;
    let {
      currStoreName,
      currVendorName,
      currVendorId,
      currVersion,
      is_helper,
    } = tool.vendor(this.props.global);

    cover_image = !!cover_image ? Config.staticUrl(cover_image) : "";
    if (cover_image.indexOf("/preview.") !== -1) {
      cover_image = cover_image.replace("/preview.", "/www.");
    }

    this.setState({
      sign_count: sign_count[currentUser],
      bad_cases_of: bad_cases_of[currentUser],
      currentUser: currentUser,
      prefer_store: prefer_store,
      screen_name: screen_name,
      mobile_phone: mobilephone,
      currStoreId: currStoreId,
      currStoreName: currStoreName,
      currVendorId: currVendorId,
      currVersion: currVersion,
      is_helper: is_helper,
      currVendorName: currVendorName,
      cover_image: cover_image,
    });
  }

  onHeaderRefresh () {
    this.setState({isRefreshing: true});
    this.getStoreDataOfMine()
    // this.renderStoreBlock()

    let _this = this;
    const {dispatch} = this.props;
    const {accessToken, currStoreId} = this.props.global;
    dispatch(
      upCurrentProfile(accessToken, currStoreId, function (ok, desc, obj) {
        if (ok) {
          _this.setState({
            prefer_store: obj.prefer_store,
            screen_name: obj.screen_name,
            mobile_phone: obj.mobilephone,
            cover_image: !!obj.cover_image
              ? Config.staticUrl(obj.cover_image)
              : ""
          });
        } else {
          ToastLong(desc);
        }
      })
    );
  }

  _doChangeStore(store_id) {
    if (this.state.onStoreChanging) {
      return false;
    }
    this.setState({onStoreChanging: true});
    showModal('加载中...')
    const {dispatch, global} = this.props;
    const callback = (ok, msg) => {
      if (ok) {
        this.getTimeoutCommonConfig(store_id, true, (getCfgOk, msg, obj) => {
          if (getCfgOk) {
            dispatch(setCurrentStore(store_id));
            let {
              currVendorId,
              currVersion,
              is_mgr,
              is_service_mgr,
              is_helper
            } = tool.vendor(this.props.global);
            const {currentUser} = global
            if (currentUser) {
              const alias = `uid_${currentUser}`;
              JPush.setAlias({alias: alias, sequence: Moment().unix()})
              JPush.isPushStopped((isStopped) => {
                console.log(`JPush is stopped:${isStopped}`)
                if (isStopped) {
                  JPush.resumePush();
                }
              })
              console.log(`MineScene setAlias ${alias}`)
            }

            const {name, vendor} = tool.store(global, store_id)
            this.setState({
              currStoreId: store_id,
              currStoreName: name,
              currVendorId: currVendorId,
              currVersion: currVersion,
              currVendorName: vendor,
              is_mgr: is_mgr,
              is_service_mgr: is_service_mgr,
              is_helper: is_helper,
              onStoreChanging: false
            });
            hideModal()
            this.setState({onStoreChanging: false});
            this.getStoreDataOfMine(store_id)
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
      native.setCurrStoreId(store_id, callback);
    }
  }

  getTimeoutCommonConfig(store_id,
                         should_refresh = false,
                         callback = () => {
                         }) {
    const {accessToken, last_get_cfg_ts} = this.props.global;
    let diff_time = Moment(new Date()).unix() - last_get_cfg_ts;

    if (should_refresh || diff_time > Config.STORE_VENDOR_CACHE_TS) {
      const {dispatch} = this.props;
      dispatch(getCommonConfig(accessToken, store_id, (ok, msg, obj) => {
        callback(ok, msg, obj);
      }));
    }
  }

  onCanChangeStore (store_id) {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    dispatch(
      userCanChangeStore(store_id, accessToken, resp => {
        if (resp.obj.auth_store_change) {
          this._doChangeStore(store_id);
        } else {
          ToastLong("您没有该店访问权限, 如需访问请向上级申请");
        }
      })
    );
  }

  nameToLines = (storeName) => {

  }

  renderHeader () {
    const {navigation} = this.props
    const statusColorStyle = this.state.storeStatus.all_close ? (this.state.storeStatus.business_status.length > 0 ? Styles.close_text : Styles.noExtStoreText): Styles.open_text;
    return (
      <View style={[Styles.between, header_styles.container]}>
        <View style={[header_styles.main_box]}>

          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => {
              InteractionManager.runAfterInteractions(() => {
                navigation.navigate(Config.ROUTE_STORE_ADD, {
                  btn_type: "edit",
                  editStoreId: this.props.global.currStoreId,
                  actionBeforeBack: resp => {
                    console.log("edit resp =====> ", resp);
                  }
                });
              });
            }}>
            <Text style={header_styles.shop_name}>
              {this.state.currStoreName}
            </Text>
            <FontAwesome name='pencil-square-o' style={{
              color: colors.title_color,
              fontSize: pxToDp(30),
              fontWeight: "bold",
              marginVertical: pxToDp(30),
              lineHeight: pxToDp(36),
              width: pxToDp(42),
              height: pxToDp(36),
              marginLeft: pxToDp(15),
            }}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({searchStoreVisible: true})}>
            <View style={{flexDirection: "row"}}>
              <Icon name="exchange" style={header_styles.change_shop}/>
              <Text style={header_styles.change_shop}>切换门店</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[]}
                          onPress={() => this.onPress(Config.ROUTE_STORE_STATUS, {
                            updateStoreStatusCb: (storeStatus) => {
                              this.setState({storeStatus: storeStatus})
                            }
                          })}>
          <View style={[header_styles.icon_open, {justifyContent: "center", alignItems: "center", paddingRight: 10}]}>
            <Text style={[statusColorStyle, {
              fontSize: 18,
              fontWeight: 'bold'
            }]}>{this.state.storeStatus.all_status_text}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderManager () {
    let {
      order_num,
      turnover,
      fnPriceControlled,
      fnProfitControlled,
      DistributionBalance
    } = this.state;
    let {currVendorId} = tool.vendor(this.props.global);
    const {navigation} = this.props;
    let CurrentDistributionBalance = {}
    DistributionBalance.map((item, index) => {
      if (index === 0) {
        CurrentDistributionBalance = item
      }
    })
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          this.onPress(Config.ROUTE_USER, {
            type: "mine",
            currentUser: this.state.currentUser,
            currVendorId: this.state.currVendorId,
            screen_name: this.state.screen_name,
            mobile_phone: this.state.mobile_phone,
            cover_image: this.state.cover_image
          })
        }
      >
        <View style={worker_styles.container}>
          <View>
            <Image
              style={[worker_styles.icon_head]}
              source={
                !!this.state.cover_image
                  ? {uri: this.state.cover_image}
                  : require("../../img/My/touxiang180x180_.png")
              }
            />
          </View>
          <View style={[worker_styles.worker_box]}>
            <Text style={worker_styles.worker_name}>
              {(this.state.screen_name || "").substring(0, 4)}
            </Text>
          </View>
          <View style={[worker_styles.sales_box]}>
            <Text style={[worker_styles.sale_text]}>
              {fnPriceControlled > 0 ? "今日已完成" : "今日订单"}: {order_num}
            </Text>
            {fnPriceControlled > 0 && fnProfitControlled > 0 ? (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  this.setState({FnPriceMsg: true});
                }}
              >
                <Text
                  style={[worker_styles.sale_text, worker_styles.sales_money]}
                >
                  预计最低收益: {!isNaN(turnover) && "¥"}
                  {turnover}&nbsp;
                  <Icon
                    name="question-circle"
                    style={{fontSize: pxToDp(30), color: "#00aeff"}}
                  />
                </Text>
              </TouchableOpacity>
            ) : currVendorId == 68 ? <Text
                      style={[worker_styles.sale_text, worker_styles.sales_money]}
                  >
                    配送余额: ¥{CurrentDistributionBalance.total_balanced}
                  </Text> :
              <Text
                      style={[worker_styles.sale_text, worker_styles.sales_money]}
                  >
                    营业额: ¥{turnover}
                  </Text>
            }
          </View>
          {currVendorId == 68 && <TouchableOpacity onPress={() => navigation.navigate(Config.ROUTE_ACCOUNT_FILL)} style={{marginTop: pxToDp(45), marginLeft: pxToDp(25), position: "absolute", top: 0, right: 40}}>
            <View style={{
              width: pxToDp(96),
              height: pxToDp(46),
              backgroundColor: colors.main_color,
              marginRight: 8,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center"
            }}>
              <Text style={{color: colors.white, fontSize: 14, fontWeight: "bold"}}> 充值 </Text>
            </View>
          </TouchableOpacity> }
          <View style={[worker_styles.chevron_right]}>
            <Button
              name="chevron-thin-right"
              style={[worker_styles.right_btn]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderWorker() {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          this.onPress(Config.ROUTE_USER, {
            type: "mine",
            currentUser: this.state.currentUser,
            currVendorId: this.state.currVendorId,
            screen_name: this.state.screen_name,
            mobile_phone: this.state.mobile_phone,
            cover_image: this.state.cover_image
          })
        }
      >
        <View style={worker_styles.container}>
          <View>
            <Image
              style={[worker_styles.icon_head]}
              source={
                !!this.state.cover_image
                  ? {uri: this.state.cover_image}
                  : require("../../img/My/touxiang180x180_.png")
              }
            />
          </View>
          <View style={[worker_styles.worker_box]}>
            <Text style={worker_styles.worker_name}>
              {(this.state.screen_name || "").substring(0, 4)}
            </Text>
          </View>
          <View style={[worker_styles.order_box]}>
            <Text style={worker_styles.order_num}>{this.state.sign_count}</Text>
            <Text style={[worker_styles.tips_text]}>出勤天数</Text>
          </View>
          <View style={[worker_styles.question_box]}>
            <Text style={worker_styles.order_num}>
              {this.state.bad_cases_of}
            </Text>
            <Text style={[worker_styles.tips_text]}>30天投诉</Text>
          </View>
          <TouchableOpacity
            style={[worker_styles.chevron_right]}
            onPress={() =>
              this.onPress(Config.ROUTE_USER, {
                type: "mine",
                currentUser: this.state.currentUser,
                currVendorId: this.state.currVendorId
              })
            }
          >
            <Button
              name="chevron-thin-right"
              style={[worker_styles.right_btn]}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  render () {

    nrInteraction(MineScene.name)

    let {currVersion, is_mgr, is_helper} = this.state;
    return (
      <View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor="gray"
            />
          }
          style={{backgroundColor: colors.main_back}}
        >
          {this.renderHeader()}
          {is_mgr || is_helper ? this.renderManager() : this.renderWorker()}
          {currVersion === Cts.VERSION_DIRECT ? <NextSchedule/> : null}
          {this.renderStoreBlock()}
          {currVersion === Cts.VERSION_DIRECT && this.renderDirectBlock()}
          {currVersion === Cts.VERSION_DIRECT && this.renderZtBlock()}
          {this.renderVersionBlock()}
          {this.renderCopyRight()}
          <Dialog
            onRequestClose={() => {
            }}
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
                <Text style={styles.help_msg}>帮助信息</Text>
              </TouchableOpacity>
            </View>
          </Dialog>
        </ScrollView>
        <SearchStore visible={this.state.searchStoreVisible}
                     onClose={() => this.setState({searchStoreVisible: false})}
                     onSelect={(item) => {
                       this.onCanChangeStore(item.id);
                       this.setState({searchStoreVisible: false})
                     }}/>
      </View>
    );
  }

  onPress(route, params = {}) {
    if (route === Config.ROUTE_GOODS_COMMENT) {
      native.toUserComments();
      return;
    }
    this.props.navigation.navigate(route, params);
  }

  renderStoreBlock() {
    const {
      // show_activity_mgr = false,
      show_goods_monitor = false,
      enabled_good_mgr = false
    } = this.props.global.config;
    let token = `?access_token=${this.props.global.accessToken}`;
    let {
      currVendorId,
      currVersion,
      is_mgr,
      is_helper,
      is_service_mgr,
      fnPriceControlled,
      fnProfitControlled
    } = this.state
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_DistributionAnalysis)}
            activeOpacity={customerOpacity}>
          <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/DistributionAnalysis.png")}
          />
          <Text style={[block_styles.block_name]}>配送分析</Text>
        </TouchableOpacity>
        <If condition={fnPriceControlled > 0}>
          <TouchableOpacity style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_SETTLEMENT)}
            activeOpacity={customerOpacity}>
            <Image style={[block_styles.block_img]} source={require("../../img/My/jiesuanjilu_.png")}/>
            <Text style={[block_styles.block_name]}>结算记录</Text>
          </TouchableOpacity>
            <TouchableOpacity
                style={[block_styles.block_box]}
                onPress={() => this.onPress(Config.ROUTE_GOODS_APPLY_RECORD)}
                activeOpacity={customerOpacity}>
              <Image style={[block_styles.block_img]} source={require("../../img/My/dingdansousuo_.png")} />
              <Text style={[block_styles.block_name]}>调价记录</Text>
            </TouchableOpacity>
        </If>
        <If condition={fnPriceControlled <= 0}>
          <TouchableOpacity
              style={[block_styles.block_box]}
              onPress={() => {
                if (is_mgr || is_helper) {
                  let path = `/stores/worker_stats.html${token}&&_v_id=${currVendorId}`;
                  let url = Config.serverUrl(path, Config.https);
                  this.onPress(Config.ROUTE_WEB, {url: url});
                } else {
                  ToastLong("您没有查看业绩的权限");
                }
              }}
              activeOpacity={customerOpacity}>
            <Image style={[block_styles.block_img]} source={require("../../img/My/yeji_.png")}/>
            <Text style={[block_styles.block_name]}>业绩</Text>
          </TouchableOpacity>
        </If>
        {enabled_good_mgr && <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_ORDER_SURCHARGE)}
          activeOpacity={customerOpacity}>
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/yunyingshouyi_.png")}
          />
          <Text style={[block_styles.block_name]}>订单补偿</Text>
        </TouchableOpacity>}
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            this.onPress(Config.ROUTE_STORE, {
              currentUser: this.state.currentUser,
              currVendorId: this.state.currVendorId,
              currVendorName: this.state.currVendorName
            });
          }}
          activeOpacity={customerOpacity}>
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/dianpu_.png")}/>
          <Text style={[block_styles.block_name]}>店铺管理</Text>
        </TouchableOpacity>
       <TouchableOpacity style={[block_styles.block_box]} onPress={() => {
         this.onPress(Config.ROUTE_WORKER, {
              type: "worker",
              currentUser: this.state.currentUser,
              currVendorId: this.state.currVendorId,
              currVendorName: this.state.currVendorName
            });
          }}
          activeOpacity={customerOpacity}>
          <Image style={[block_styles.block_img]} source={require("../../img/My/yuangong_.png")} />
          <Text style={[block_styles.block_name]}>员工管理</Text>
        </TouchableOpacity>
        {currVersion === Cts.VERSION_DIRECT && <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/stores/working_status.html${token}&&_v_id=${currVendorId}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}>
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/kaoqin_.png")}/>
          <Text style={[block_styles.block_name]}>考勤记录</Text>
        </TouchableOpacity>}
        {fnPriceControlled > 0 &&
        is_service_mgr && (
          <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => {
              if (is_service_mgr) {
                let path = `/stores/worker_stats.html${token}&&_v_id=${currVendorId}`;
                let url = Config.serverUrl(path, Config.https);
                this.onPress(Config.ROUTE_WEB, {url: url});
              } else {
                ToastLong("您没有查看托管店业绩的权限");
              }
            }}
            activeOpacity={customerOpacity}
          >
            <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/yeji_.png")}
            />
            <Text style={[block_styles.block_name]}>业绩</Text>
          </TouchableOpacity>
        )}
        {fnPriceControlled > 0 && (fnProfitControlled > 0 || is_helper || is_service_mgr) ? (
          <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_OPERATE_PROFIT)}
            activeOpacity={customerOpacity}
          >
            <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/yunyingshouyi_.png")}
            />
            <Text style={[block_styles.block_name]}>运营收益</Text>
          </TouchableOpacity>
        ) : (
          <View/>
        )}
        {this.state.fnSeparatedExpense ? (
          <TouchableOpacity style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_SEP_EXPENSE)}
            activeOpacity={customerOpacity}>
            <Image style={[block_styles.block_img]}
              source={require("../../img/My/yunyingshouyi_.png")}/>
            <Text style={[block_styles.block_name]}>费用账单</Text>
          </TouchableOpacity>
        ) : (
          <View/>
        )}
        {(this.state.allow_merchants_store_bind == 1 || is_service_mgr ) ? (
            <TouchableOpacity style={[block_styles.block_box]}
                              onPress={() => this.onPress(Config.ROUTE_PLATFORM_LIST)}
                              activeOpacity={customerOpacity}>
              <Image style={[block_styles.block_img]}
                     source={require("../../img/My/yunyingshouyi_.png")}/>
              <Text style={[block_styles.block_name]}>平台设置</Text>
            </TouchableOpacity>
        ) : (
          <View/>
        )}

        <TouchableOpacity style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_DELIVERY_LIST)}
            activeOpacity={customerOpacity}>
          <Image style={[block_styles.block_img]}
              source={require("../../img/My/yunyingshouyi_.png")}/>
          <Text style={[block_styles.block_name]}>配送设置</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_PRINTERS)}
            activeOpacity={customerOpacity}>
          <Image style={[block_styles.block_img]}
              source={require("../../img/My/PrintSetting.png")}/>
          <Text style={[block_styles.block_name]}>打印设置</Text>
        </TouchableOpacity>
        {Platform.OS !== 'ios' &&
        <TouchableOpacity style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_INFORM)}
            activeOpacity={customerOpacity}>
          <Image style={[block_styles.block_img]}
                 source={require("../../img/My/inform.png")}/>
          <Text style={[block_styles.block_name]}>消息与铃声</Text>
        </TouchableOpacity> }


        {currVersion === Cts.VERSION_DIRECT && (
          <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => {
              let path = `/stores/show_waimai_evaluations.html${token}&&_v_id=${currVendorId}`;
              let url = Config.serverUrl(path, Config.https);
              this.onPress(Config.ROUTE_WEB, {url: url});
            }}
            activeOpacity={customerOpacity}
          >
            <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/pingjia_.png")}
            />
            <Text style={[block_styles.block_name]}>评价</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_ORDER_SEARCH)}
          activeOpacity={customerOpacity}>
          <Image style={[block_styles.block_img]}
            source={require("../../img/My/dingdansousuo_.png")} />
          <Text style={[block_styles.block_name]}>订单搜索</Text>
        </TouchableOpacity>

        {show_goods_monitor ? <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_GOODS_ADJUST)}
          activeOpacity={customerOpacity}>
          {this.state.adjust_cnt > 0 && <View style={[block_styles.notice_point]}/>}
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/shangpinqingbao_.png")}
          />
          <Text style={[block_styles.block_name]}>商品调整</Text>
        </TouchableOpacity> : null }

        <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_PUSH)}
            activeOpacity={customerOpacity}>
          <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/push.png")}
          />
          <Text style={[block_styles.block_name]}>推送设置</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderVersionBlock () {
    let server_info = tool.server_info(this.props);
    const {
      show_expense_center = false,
    } = this.props.global.config;
    return (
      <View style={[block_styles.container]}>

        {show_expense_center && (<TouchableOpacity
            style={[block_styles.block_box]}
            activeOpacity={customerOpacity}>
            <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/huiyuan_.png")}
            />
            <Text style={[block_styles.block_name]}>我的钱包</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[block_styles.block_box]}
          activeOpacity={customerOpacity}
          onPress={() => {
            this.onPress(Config.ROUTE_HELP);
          }}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/help_.png")}
          />
          <Text style={[block_styles.block_name]}>帮助</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => { this.callCustomerService() }}
          activeOpacity={customerOpacity} >
          <Image style={[block_styles.block_img]} source={require("../../img/My/fuwu_.png")} />
          <Text style={[block_styles.block_name]}>联系运营</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          activeOpacity={customerOpacity}
          onPress={() => {
            this.onPress(Config.ROUTE_VERSION);
          }}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/banben_.png")}
          />
          <Text style={[block_styles.block_name]}>版本信息</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_SETTING)}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/shezhi_.png")}
          />
          <Text style={[block_styles.block_name]}>设置</Text>
        </TouchableOpacity>
        {/*<View style={[block_styles.empty_box]}/>*/}
      </View>
    );
  }

  renderCopyRight() {
    const css = {justifyContent: 'center', alignItems: 'center', height: pxToDp(300)};
    return (
        <View style={[css]}>
            <Text style={{color: colors.colorDDD}}>@版权所有</Text>
            <Text style={{color: colors.colorDDD}}>北京家帮帮科技有限公司</Text>
            {/*<Image style={[block_styles.block_img, {marginBottom: 0}]} source={require("../../img/Login/ic_launcher.png")} />*/}
        </View>
    );
  }

  renderDirectBlock () {
    let token = `?access_token=${this.props.global.accessToken}`;
    let {currStoreId, currVendorId} = this.state;
    let {global, dispatch} = this.props;
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_INVOICING)}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/diaohuo_.png")}
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
            source={require("../../img/My/baosun_.png")}
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
          <Image style={[block_styles.block_img]} source={require("../../img/My/caigou_.png")}/>
          <Text style={[block_styles.block_name]}>门店采购</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress('InventoryHome')}
          activeOpacity={customerOpacity}>
          <Image style={[block_styles.block_img]} source={require("../../img/My/caigou_.png")}/>
          <Text style={[block_styles.block_name]}>库存管理</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_INVENTORY_MATERIAL_TASK, {})}
          activeOpacity={customerOpacity}>
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/caigou_.png")}
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
            source={require("../../img/My/baoxiao_.png")}
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
            source={require("../../img/My/fukuanjilu_.png")}
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
            source={require("../../img/My/xinxiweihu_.png")}
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
            source={require("../../img/My/fankuiyuyeji_.png")}
          />
          <Text style={[block_styles.block_name]}>反馈与业绩</Text>
        </TouchableOpacity>
        {/* TODO 该页面闪退影响发布，修复后再上线 */}
        {/*<TouchableOpacity*/}
        {/*  style={[block_styles.block_box]}*/}
        {/*  onPress={() => this.onPress(Config.ROUTE_GOODS_COMMENT)}*/}
        {/*  activeOpacity={customerOpacity}*/}
        {/*>*/}
        {/*  <Image*/}
        {/*    style={[block_styles.block_img]}*/}
        {/*    source={require("../../img/My/sppingjia_.png")}*/}
        {/*  />*/}
        {/*  <Text style={[block_styles.block_name]}>产品评价信息</Text>*/}
        {/*</TouchableOpacity>*/}
        {/*<TouchableOpacity*/}
        {/*  style={[block_styles.block_box]}*/}
        {/*  onPress={() => {*/}
        {/*    let path = `/stores/quick_task_list.html${token}`;*/}
        {/*    let url = Config.serverUrl(path, Config.https);*/}
        {/*    this.onPress(Config.ROUTE_WEB, {url: url});*/}
        {/*  }}*/}
        {/*  activeOpacity={customerOpacity}*/}
        {/*>*/}
        {/*  <Image*/}
        {/*    style={[block_styles.block_img]}*/}
        {/*    source={require("../../img/Mine/icon_mine_collection_2x.png")}*/}
        {/*  />*/}
        {/*  <Text style={[block_styles.block_name]}>老的提醒</Text>*/}
        {/*</TouchableOpacity>*/}
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
            source={require("../../img/My/kehu_.png")}
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
            source={require("../../img/My/xiaoshou_.png")}
          />
          <Text style={[block_styles.block_name]}>销售分析</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderZtBlock () {
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_ZT_ORDER_PRINT)}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/print.png")}
          />
          <Text style={[block_styles.block_name]}>打印自提单</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  fn_price_msg: {
    fontSize: pxToDp(30),
    color: "#333"
  },
  help_msg: {
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#00aeff"
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
  main_box: {
    marginTop: pxToDp(15),
    height: pxToDp(170)
  },
  shop_name: {
    color: colors.title_color,
    fontSize: pxToDp(30),
    fontWeight: "bold",
    marginVertical: pxToDp(30),
    lineHeight: pxToDp(36)
  },
  change_shop: {
    color: colors.main_color,
    fontSize: pxToDp(30),
    fontWeight: "bold",
    lineHeight: pxToDp(35)
  },
  icon_box: {
    position: "absolute",
    right: 0,
    top: 0
  },
  icon_open: {
    width: pxToDp(140),
    height: pxToDp(140)
  }
});

const worker_styles = StyleSheet.create({
  container: {
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
    backgroundColor: colors.white,
    height: pxToDp(140),
    flexDirection: "row",
    marginBottom: pxToDp(22)
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
    color: colors.title_color,
    fontSize: pxToDp(30),
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
    color: colors.title_color,
    fontSize: pxToDp(40),
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
    fontSize: pxToDp(40),
    textAlign: "center",
    color: colors.main_color
  },
  sales_box: {
    marginLeft: pxToDp(28),
    marginTop: pxToDp(30),
    width: ScreenWidth,
    position: "relative"
  },
  sale_text: {
    fontSize: pxToDp(28),
    lineHeight: pxToDp(35),
    color: "#555"
  },
  sales_money: {
    marginTop: pxToDp(15)
  }
});

const block_styles = StyleSheet.create({
  container: {
    marginBottom: pxToDp(22),
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.white
  },
  block_box: {
    //剩1个格子用正常样式占位
    // width: pxToDp(239),
    // height: pxToDp(188),
    width: ScreenWidth / 4,
    height: ScreenWidth / 4,
    backgroundColor: colors.white,

    // borderColor: colors.main_back,
    // borderWidth: pxToDp(1),
    alignItems: "center"
  },
  empty_box: {
    //剩2个格子用这个样式占位
    width: pxToDp(478),
    height: pxToDp(188),
    backgroundColor: colors.white,

    borderColor: colors.main_back,
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
    color: colors.color666,
    fontSize: pxToDp(26),
    lineHeight: pxToDp(28),
    textAlign: "center"
  },
  notice_point: {
    width: pxToDp(30),
    height: pxToDp(30),
    borderRadius: pxToDp(15),
    backgroundColor: '#f00',
    position: 'absolute',
    right: pxToDp(60),
    top: pxToDp(20),
    zIndex: 99
  }
});

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(MineScene);
