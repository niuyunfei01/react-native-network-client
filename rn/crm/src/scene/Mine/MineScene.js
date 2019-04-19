//import liraries
import React, {PureComponent} from "react";
import {
  Image,
  InteractionManager,
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
import {ToastLong} from "../../util/ToastUtils";
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
import {Dialog, Toast} from "../../weui/index";
import SearchStore from "../component/SearchStore";

function mapStateToProps (state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global};
}

function mapDispatchToProps (dispatch) {
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
  static navigationOptions = {title: "Mine", header: null};
  
  constructor (props) {
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
      currManager,
      is_mgr,
      is_helper,
      service_uid,
      is_service_mgr,
      fnPriceControlled,
      fnProfitControlled
    } = tool.vendor(this.props.global);
    const {sign_count, bad_cases_of, order_num, turnover} = this.props.mine;
    
    // let storeActionSheet = tool.storeActionSheet(
    // 	canReadStores,
    // 	is_helper || is_service_mgr
    // );
    
    cover_image = !!cover_image ? Config.staticUrl(cover_image) : "";
    if (cover_image.indexOf("/preview.") !== -1) {
      cover_image = cover_image.replace("/preview.", "/www.");
    }
    
    this.state = {
      isRefreshing: false,
      onNavigating: false,
      FnPriceMsg: false,
      onStoreChanging: false,
      // storeActionSheet: storeActionSheet,
      
      sign_count: sign_count[currentUser],
      bad_cases_of: bad_cases_of[currentUser],
      order_num:
        fnPriceControlled > 0
          ? 0
          : !!order_num[currStoreId]
          ? order_num[currStoreId]
          : 0,
      turnover:
        fnPriceControlled > 0
          ? "计算中"
          : !!turnover[currStoreId]
          ? turnover[currStoreId]
          : 0,
      
      currentUser: currentUser,
      prefer_store: prefer_store,
      screen_name: screen_name,
      mobile_phone: mobilephone,
      currStoreId: currStoreId,
      currStoreName: currStoreName,
      currVendorId: currVendorId,
      currVersion: currVersion,
      currManager: currManager,
      is_mgr: is_mgr,
      is_helper: is_helper,
      is_service_mgr: is_service_mgr,
      fnPriceControlled: fnPriceControlled,
      fnProfitControlled: fnProfitControlled,
      currVendorName: currVendorName,
      cover_image: !!cover_image ? cover_image : "",
      adjust_cnt: 0,
      dutyUsers: [],
      searchStoreVisible: false,
      storeStatus: {}
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
    
    if (this.state.sign_count === undefined || this.state.bad_cases_of === undefined) {
      this.onGetUserCount();
    }
    if (is_mgr || is_helper) {
      this.onGetStoreTurnover();
    }
    
    if (service_uid > 0) {
      this.onGetUserInfo(service_uid);
    }
    
    this.onGetDutyUser();
  }
  
  componentWillMount () {
    let {currStoreId, canReadStores} = this.props.global;
    if (!(currStoreId > 0)) {
      let first_store_id = tool.first_store_id(canReadStores);
      if (first_store_id > 0) {
        this._doChangeStore(first_store_id, false);
      }
    }
    this.getNotifyCenter();
    this.getStoreStatus()
  }
  
  onGetUserInfo (uid) {
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
    let _this = this;
    const {dispatch} = this.props;
    InteractionManager.runAfterInteractions(() => {
      dispatch(
        fetchUserCount(currentUser, accessToken, resp => {
          if (resp.ok) {
            let {sign_count, bad_cases_of} = resp.obj;
            _this.setState({
              sign_count: sign_count,
              bad_cases_of: bad_cases_of
            });
          }
          _this.setState({isRefreshing: false});
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
  
  getStoreStatus () {
    const self = this
    const access_token = this.props.global.accessToken
    const store_id = this.props.global.currStoreId
    const api = `/api/get_store_business_status/${store_id}?access_token=${access_token}`
    HttpUtils.get.bind(this.props.navigation)(api).then(res => {
      self.setState({storeStatus: res})
    })
  }
  
  onGetStoreTurnover () {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let {currStoreId, fnPriceControlled} = this.state;
    let _this = this;
    
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
                _this.setState({
                  order_num: order_num,
                  turnover: tool.toFixed(total_price)
                });
                _this.forceUpdate();
              } else {
                ToastLong(resp.desc);
              }
              _this.setState({isRefreshing: false});
            }
          )
        );
      } else {
        dispatch(
          fetchStoreTurnover(currStoreId, accessToken, resp => {
            if (resp.ok) {
              let {order_num, turnover} = resp.obj;
              _this.setState({
                order_num: order_num,
                turnover: turnover
              });
              _this.forceUpdate();
            }
            _this.setState({isRefreshing: false});
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
  
  componentWillReceiveProps () {
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
      currManager,
      is_mgr,
      is_helper,
      is_service_mgr,
      fnPriceControlled
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
      currManager: currManager,
      is_mgr: is_mgr,
      is_helper: is_helper,
      fnPriceControlled: fnPriceControlled,
      currVendorName: currVendorName,
      cover_image: cover_image,
    });
  }
  
  onHeaderRefresh () {
    this.setState({isRefreshing: true});
    let {is_mgr, is_helper} = this.state;
    if (is_mgr || is_helper) {
      this.onGetStoreTurnover();
    } else {
      this.onGetUserCount();
    }
    
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
  
  _doChangeStore (store_id, is_skip = true) {
    if (this.state.onStoreChanging) {
      return false;
    }
    this.setState({onStoreChanging: true});
    const {dispatch} = this.props;
    const {canReadStores} = this.props.global;
    let _this = this;
    native.setCurrStoreId(store_id, function (ok, msg) {
      if (ok) {
        _this.getTimeoutCommonConfig(store_id, true, (ok, msg, obj) => {
          if (ok) {
            dispatch(setCurrentStore(store_id));
            let {
              currVendorId,
              currVersion,
              fnPriceControlled,
              is_mgr,
              is_service_mgr,
              is_helper
            } = tool.vendor(_this.props.global);
            _this.setState({
              currStoreId: store_id,
              currStoreName: canReadStores[store_id]["name"],
              currVendorId: currVendorId,
              currVersion: currVersion,
              currVendorName: canReadStores[store_id]["vendor"],
              fnPriceControlled: fnPriceControlled,
              is_mgr: is_mgr,
              is_service_mgr: is_service_mgr,
              is_helper: is_helper,
              onStoreChanging: false
            });
            // _this.onGetStoreTurnover();
            _this.setState({onStoreChanging: false});
            if (is_skip) {
              native.toOrders();
            }
          } else {
            ToastLong(msg);
            _this.setState({onStoreChanging: false});
          }
        });
      } else {
        ToastLong(msg);
        _this.setState({onStoreChanging: false});
      }
    });
  }
  
  getTimeoutCommonConfig (store_id,
                          should_refresh = false,
                          callback = () => {
                          }) {
    const {accessToken, last_get_cfg_ts} = this.props.global;
    let current_time = Moment(new Date()).unix();
    let diff_time = current_time - last_get_cfg_ts;
    
    if (should_refresh || diff_time > 300) {
      const {dispatch} = this.props;
      dispatch(getCommonConfig(accessToken, store_id, (ok, msg, obj) => {
        callback(ok, msg, obj);
      }));
    }
  }
  
  onCanChangeStore (store_id) {
    const {accessToken} = this.props.global;
    const {dispatch} = this.props;
    let _this = this;
    dispatch(
      userCanChangeStore(store_id, accessToken, resp => {
        if (resp.obj.auth_store_change) {
          _this._doChangeStore(store_id);
        } else {
          ToastLong("您没有访问该门店的权限");
        }
      })
    );
  }
  
  renderHeader () {
    return (
      <View style={header_styles.container}>
        <View style={[header_styles.main_box]}>
          <Text style={header_styles.shop_name}>
            {this.state.currStoreName}
          </Text>
          <TouchableOpacity onPress={() => this.setState({searchStoreVisible: true})}>
            <View style={{flexDirection: "row"}}>
              <Icon name="exchange" style={header_styles.change_shop}/>
              <Text style={header_styles.change_shop}>切换门店</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[header_styles.icon_box]}
          onPress={() => this.onPress(Config.ROUTE_STORE_STATUS)}
        >
          <If condition={!this.state.storeStatus.all_close}>
            <Image
              style={[header_styles.icon_open]}
              source={require("../../img/My/open_.png")}
            />
            <Text style={header_styles.open_text}>营业中</Text>
          </If>
          <If condition={this.state.storeStatus.all_close}>
            <Image
              style={[header_styles.icon_open]}
              source={require("../../img/My/close_.png")}
            />
            <Text style={header_styles.close_text}>休息中</Text>
          </If>
        </TouchableOpacity>
      </View>
    );
  }
  
  renderManager () {
    let {
      order_num,
      turnover,
      fnPriceControlled,
      fnProfitControlled
    } = this.state;
    
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
            ) : (
              <Text
                style={[worker_styles.sale_text, worker_styles.sales_money]}
              >
                营业额: ¥{turnover}
              </Text>
            )}
          </View>
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
  
  renderWorker () {
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
          {this.renderStoreBlock()}
          {this.renderVersionBlock()}
          {currVersion === Cts.VERSION_DIRECT && this.renderDirectBlock()}
          
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
          <Toast
            icon="loading"
            show={this.state.onStoreChanging}
            onRequestClose={() => {
            }}
          >
            切换门店中...
          </Toast>
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
  
  onPress (route, params = {}) {
    let _this = this;
    if (route === Config.ROUTE_SETTING) {
      native.toSettings();
      return;
    } else if (route === Config.ROUTE_GOODS_COMMENT) {
      native.toUserComments();
      return;
    }
    
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }
  
  renderStoreBlock () {
    const {
      show_activity_mgr = false,
      show_goods_monitor = false,
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
    } = this.state;
    return (
      <View style={[block_styles.container]}>
        {fnPriceControlled > 0 ? (
          <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_SETTLEMENT)}
            activeOpacity={customerOpacity}
          >
            <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/jiesuanjilu_.png")}
            />
            <Text style={[block_styles.block_name]}>结算记录</Text>
          </TouchableOpacity>
        ) : (
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
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            this.onPress(Config.ROUTE_STORE, {
              currentUser: this.state.currentUser,
              currVendorId: this.state.currVendorId,
              currVendorName: this.state.currVendorName
            });
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/dianpu_.png")}
          />
          <Text style={[block_styles.block_name]}>店铺管理</Text>
        </TouchableOpacity>
        {currVersion === Cts.VERSION_DIRECT && (
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
        )}
        
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/stores/working_status.html${token}&&_v_id=${currVendorId}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/kaoqin_.png")}
          />
          <Text style={[block_styles.block_name]}>考勤记录</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            this.onPress(Config.ROUTE_WORKER, {
              type: "worker",
              currentUser: this.state.currentUser,
              currVendorId: this.state.currVendorId,
              currVendorName: this.state.currVendorName
            });
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/yuangong_.png")}
          />
          <Text style={[block_styles.block_name]}>员工管理</Text>
        </TouchableOpacity>
        {currVersion === Cts.VERSION_DIRECT && (
          <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => {
              let path = `/market_tools/users.html${token}`;
              let url = Config.serverUrl(path, Config.https);
              this.onPress(Config.ROUTE_WEB, {url: url});
            }}
            activeOpacity={customerOpacity}
          >
            <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/kehu_.png")}
            />
            <Text style={[block_styles.block_name]}>客户管理</Text>
          </TouchableOpacity>
        )}
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
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_ORDER_SEARCH)}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/dingdansousuo_.png")}
          />
          <Text style={[block_styles.block_name]}>订单搜索</Text>
        </TouchableOpacity>
        
        {(show_activity_mgr && (is_helper || is_service_mgr)) && (
          <TouchableOpacity
            style={[block_styles.block_box]}
            onPress={() => this.onPress(Config.ROUTE_ACTIVITY_MANAGE)}
            activeOpacity={customerOpacity}
          >
            <Image
              style={[block_styles.block_img]}
              source={require("../../img/My/jiagejianguan_.png")}
            />
            <Text style={[block_styles.block_name]}>活动加价</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_GOODS_ADJUST)}
          activeOpacity={customerOpacity}
        >
          {this.state.adjust_cnt > 0 && <View style={[block_styles.notice_point]}/>}
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/shangpinqingbao_.png")}
          />
          <Text style={[block_styles.block_name]}>商品调整</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_ORDER_SURCHARGE)}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/yunyingshouyi_.png")}
          />
          <Text style={[block_styles.block_name]}>订单补偿</Text>
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
          onPress={() => {
            this.callCustomerService()
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/fuwu_.png")}
          />
          <Text style={[block_styles.block_name]}>联系服务经理</Text>
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
        
        <View style={[block_styles.empty_box]}/>
      </View>
    );
  }
  
  renderDirectBlock () {
    let token = `?access_token=${this.props.global.accessToken}`;
    let {currStoreId} = this.state;
    let {global, dispatch} = this.props;
    return (
      <View style={[block_styles.container]}>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_INVOICING, {})}
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
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/caigou_.png")}
          />
          <Text style={[block_styles.block_name]}>门店采购</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_INVENTORY_MATERIAL_LIST, {})}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/caigou_.png")}
          />
          <Text style={[block_styles.block_name]}>原料入库</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_INVENTORY_MATERIAL_TASK, {})}
          activeOpacity={customerOpacity}
        >
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
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => this.onPress(Config.ROUTE_GOODS_COMMENT)}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/My/sppingjia_.png")}
          />
          <Text style={[block_styles.block_name]}>产品评价信息</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[block_styles.block_box]}
          onPress={() => {
            let path = `/stores/quick_task_list.html${token}`;
            let url = Config.serverUrl(path, Config.https);
            this.onPress(Config.ROUTE_WEB, {url: url});
          }}
          activeOpacity={customerOpacity}
        >
          <Image
            style={[block_styles.block_img]}
            source={require("../../img/Mine/icon_mine_collection_2x.png")}
          />
          <Text style={[block_styles.block_name]}>老的提醒</Text>
        </TouchableOpacity>
      </View>
    );
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
    marginRight: pxToDp(134),
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
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(35),
    marginBottom: pxToDp(5),
    width: pxToDp(80),
    height: pxToDp(74)
  },
  open_text: {
    color: colors.main_color,
    fontSize: pxToDp(20),
    textAlign: "center"
  },
  close_text: {
    color: "#999",
    fontSize: pxToDp(20),
    textAlign: "center"
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
    marginTop: pxToDp(30)
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
    width: pxToDp(239),
    height: pxToDp(188),
    backgroundColor: colors.white,
    
    borderColor: colors.main_back,
    borderWidth: pxToDp(1),
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
    width: pxToDp(100),
    height: pxToDp(100)
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
