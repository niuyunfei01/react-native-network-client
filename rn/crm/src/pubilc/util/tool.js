import Cts from "../common/Cts";
import HttpUtils from "./http";
import {setSimpleStore} from "../../reducers/global/globalActions";
import {CommonActions} from '@react-navigation/native';
import DeviceInfo from "react-native-device-info";
import md5 from "./md5";
import dayjs from "dayjs";
import pxToDp from "./pxToDp";
import colors from "../styles/colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import React from "react";
import {Text, View} from "react-native";

export function urlByAppendingParams(url: string, params: Object) {
  let result = url;
  if (result.substr(result.length - 1) != "?") {
    result = result + `?`;
  }

  for (let key in params) {
    let value = params[key];
    result += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
  }

  result = result.substring(0, result.length - 1);
  return result;
}

export function objectMap(obj, fn) {
  const keys = Object.keys(obj);
  if (typeof keys === "undefined" || keys.length === 0) {
    return [];
  }

  return keys.map(key => fn(obj[key], key));
}

/**
 *
 * @param obj
 * @param fn (item, key) => true/false
 * @returns {{}}
 */
export function objectFilter(obj, fn) {
  const filterObj = {};
  Object.keys(obj)
    .filter(key => fn(obj[key], key))
    .map(key => (filterObj[key] = obj[key]));
  return filterObj;
}

export function objectReduce(obj, fn) {
  return Object.keys(obj).reduce((idx1, idx2) => fn(obj[idx1], obj[idx2]));
}

export function objectSum(obj, fn) {
  let total = 0;
  Object.keys(obj).map(key => (total += fn(obj[key])));
  return total;
}

export function shortOrderDay(dt) {
  return dayjs(dt).format("MMDD");
}

export function orderOrderTimeShort(dt) {
  return dayjs(dt).format("M/DD HH:mm");
}

export function isPreOrder(dt) {
  let expectSeconds = dayjs(dt).unix();
  let nowSeconds = dayjs().unix();
  return expectSeconds - nowSeconds > 60 * 90
}

export function orderExpectTime(dt) {
  return dayjs(dt).format("M/DD HH:mm");
}

export function fullDate(dt) {
  return dayjs(dt).format("YYYY-MM-DD HH:mm:ss");
}

export function fullDay(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}

export function storeTime(dt) {
  return dayjs(dt).format("H:mm");
}

export function diffDesc(dt) {
  // let old_time = dayjs(dt);
  // let now_time = dayjs(new Date()).diff(old_time, "seconds", true);
  // let now_times = dayjs(new Date()).diff(old_time, "seconds", true);
  // let diff_time = Math.floor(now_time.diff(old_time, "seconds", true));
  let diff_time = 60
  let diff_minutes = Math.floor(diff_time / 60);
  let diff_seconds = diff_time % 60;
  let diff_desc = "";
  if (diff_minutes > 0) {
    diff_desc = `${diff_minutes}分${diff_seconds}秒`;
  } else {
    diff_desc = `${diff_seconds}秒`;
  }
  return diff_desc;
}

export function vendorOfStoreId(storeId, global) {
  const {canReadStores, canReadVendors} = global;

  const vendorId = canReadStores[storeId] && canReadStores[storeId].type;
  return canReadVendors && canReadVendors[vendorId]
    ? canReadVendors[vendorId]
    : null;
}

export function vendor(global) {
  const {
    currentUser,
    currStoreId,
    canReadStores,
    canReadVendors,
    config
  } = global;
  let currStore =
    canReadStores[currStoreId] === undefined ? {} : canReadStores[currStoreId];
  let currVendorId = currStore["type"];
  let currVendorName = currStore["vendor"];
  let currStoreName = currStore["name"];

  let currVendor =
    canReadVendors[currVendorId] === undefined
      ? {}
      : canReadVendors[currVendorId];
  let currVersion = currVendor["version"];
  let fnProviding = currVendor["fnProviding"];
  let fnProvidingOnway = currVendor["fnProvidingOnway"];
  let service_ids = [];
  let service_uid = currVendor["service_uid"];
  let service_mgr = currVendor["service_mgr"];
  let allow_merchants_store_bind = currVendor["allow_merchants_store_bind"];
  let allow_merchants_edit_prod = currVendor["allow_merchants_edit_prod"];
  let allow_store_mgr_call_ship = currVendor["allow_store_mgr_call_ship"];
  let wsb_store_account = currVendor["wsb_store_account"] === '1';
  if (service_uid !== "" && service_uid !== undefined && service_uid > 0) {
    service_ids.push(service_uid);
  }
  if (service_mgr !== "" && service_mgr !== undefined) {
    //可能有多个 -> '811488,822472'
    service_ids.push(service_mgr);
  }

  let service_manager = "," + service_ids.join(",") + ",";
  let is_service_mgr = service_manager.indexOf("," + currentUser + ",") !== -1;

  let {help_uid} = config;
  let is_helper = false;
  if (!!help_uid) {
    let helper = "," + help_uid.join(",") + ",";
    is_helper = helper.indexOf("," + currentUser + ",") !== -1;
  }

  return {
    currVendorId: currVendorId,
    currVendorName: currVendorName,
    currVersion: currVersion,
    currStoreName: currStoreName,
    is_mgr: 0,
    is_service_mgr: is_service_mgr,
    is_helper: is_helper,
    service_uid: service_uid,
    fnProviding: fnProviding,
    fnProvidingOnway: fnProvidingOnway,
    allow_merchants_store_bind: allow_merchants_store_bind,
    allow_store_mgr_call_ship: allow_store_mgr_call_ship,
    allow_merchants_edit_prod: allow_merchants_edit_prod,
    wsb_store_account,
  };
}

export function server_info({global, user}) {
  if (user === undefined) {
    return {};
  }
  let {service_uid} = vendor(global);
  let {user_info} = user;
  return !!user_info[service_uid] ? user_info[service_uid] : {};
}

/**
 * 当前店铺信息
 * @param global
 * @param store_id
 * @returns {*}
 */
export function store(global, store_id = null) {
  const {canReadStores, currStoreId} = global;
  store_id = store_id ? store_id : currStoreId
  return canReadStores[store_id];
}

/**
 * 获取当前店铺信息；如果不存在，则需自行获取
 * @param global
 * @param dispatch if null, means don't do dispatch
 * @param storeId if null,使用currStoreId
 * @param callback
 * @returns {*}
 */
export function simpleStore(global, dispatch = null,storeId=null, callback = (store) => {
}) {
  const {currStoreId, simpleStore} = global
  const id=null===storeId?currStoreId:storeId
  if (simpleStore && simpleStore.id == id) {
    callback(simpleStore)
  } else {
    const {accessToken} = global;
    HttpUtils.get.bind({global})(`/api/read_store_simple/${id}?access_token=${accessToken}`).then(store => {
      if (dispatch) {
        dispatch(setSimpleStore(store))
      }
      callback(store)
    }, (res) => {
    })
  }
}

export function length(obj) {
  if (obj === undefined || obj === null) {
    return 0;
  } else {
    if (typeof obj === "object" && obj.length === undefined) {
      obj = Object.values(obj);
    }
  }
  return obj.length;
}

export function curr_vendor(vendor_data, currVendorId) {
  let curr_data = {};
  if (
    vendor_data !== undefined &&
    currVendorId > 0 &&
    vendor_data[currVendorId] !== undefined
  ) {
    curr_data = vendor_data[currVendorId];
  } else {
  }
  return curr_data;
}

export function user_info(mine, currVendorId, currentUser) {
  let user_info = {};
  if (
    Object.keys(mine.user_list).length > 0 &&
    mine.user_list[currVendorId] &&
    Object.keys(mine.user_list[currVendorId]).length > 0 &&
    mine.user_list[currVendorId][currentUser] &&
    Object.keys(mine.user_list[currVendorId][currentUser]).length > 0
  ) {
    // let {
    //   id, nickname, nameRemark, mobilephone, image, //user 表数据
    //   worker_id, vendor_id, user_id, status, name, mobile, //worker 表数据
    // }
    user_info = mine.user_list[currVendorId][currentUser];
  }

  return user_info;
}

export function user(reduxGlobal, reduxMine) {
  const {currentUser} = reduxGlobal
  const {currVendorId} = this.vendor(reduxGlobal)
  return user_info(reduxMine, currVendorId, currentUser)
}

export function shortTimestampDesc(timestamp) {
  return _shortTimeDesc(timestamp);
}

export function shortTimeDesc(datetime) {
  if (!datetime) return "";

  return _shortTimeDesc(datetime);
}

function _shortTimeDesc(datetime) {
  let dtMoment = dayjs(datetime);
  const nowMoment = dayjs();

  const dSeconds = nowMoment.unix() - dtMoment.unix();
  const dYear = nowMoment.year() - dtMoment.year();

  if (dSeconds >= 0 && dSeconds < 60) {
    if (dSeconds < 10) {
      return "刚刚";
    } else {
      return `${dSeconds}秒前`;
    }
  } else if (dSeconds >= 0 && dSeconds < 3600) {
    return Math.floor(dSeconds / 60) + "分钟前";
  } else if (dYear === 0) {
    const dDay = dayjs().diff(datetime, 'day')
    if (dDay <= 0 && dDay >= -1) {
      return (dDay === 0 ? "今天" : "明天") + dtMoment.format("HH:mm");
    } else {
      return dtMoment.format("M/D HH:mm");
    }
  } else {
    return dtMoment.format("YY/M/D HH:mm");
  }
}

export function resetNavStack(navigation, routeName, params = {}) {
  const resetAction = CommonActions.reset({
    index: 0,
    routes: [
      {name: routeName, params: params}
    ]
  });
  navigation.dispatch(resetAction);
}

export function platforms_map() {
  let map = {};
  map[Cts.WM_PLAT_ID_BD] = "百度";
  map[Cts.WM_PLAT_ID_MT] = "美团";
  map[Cts.WM_PLAT_ID_ELE] = "饿了么";
  map[Cts.WM_PLAT_ID_JD] = "京东";
  map[Cts.WM_PLAT_ID_WX] = "微信";
  map[Cts.WM_PLAT_ID_APP] = "App";
  map[Cts.WM_PLAT_UNKNOWN] = "未知";
  return map;
}

export function get_platform_name(platformId) {
  let map = platforms_map();
  return map[platformId] === undefined ? platformId : map[platformId];
}

export function intOf(val) {
  if (typeof val === "string") {
    return parseInt(val);
  }

  return val;
}

function parameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function disWayStatic(index) {
  if (index == 1) {
    let map = {};
    map[Cts.FN_STATUS_ACCEPTED] = "系统已接单";
    map[Cts.FN_STATUS_ASSIGNED] = "已分配骑手";
    map[Cts.FN_STATUS_ARRIVED_STORE] = "骑手已到店";
    map[Cts.FN_STATUS_ON_WAY] = "配送中";
    map[Cts.FN_STATUS_ARRIVED] = "已送达";
    map[Cts.FN_STATUS_CANCELED] = "已取消";
    map[Cts.FN_STATUS_ABNORMAL] = "异常";
    return map;
  } else {
    let map = {};
    map[Cts.DADA_STATUS_TO_ACCEPT] = "待接单";
    map[Cts.DADA_STATUS_TO_FETCH] = "待取货";
    map[Cts.DADA_STATUS_SHIPPING] = "配送中";
    map[Cts.DADA_STATUS_ARRIVED] = "已完成";
    map[Cts.DADA_STATUS_CANCEL] = "已取消";
    map[Cts.DADA_STATUS_TIMEOUT] = "已过期";
    map[Cts.DADA_STATUS_ABNORMAL] = "指派单";
    return map;
  }
}

export function disWay() {
  let map = {};
  map[Cts.SHIP_AUTO_FN] = "蜂鸟";
  map[Cts.SHIP_AUTO_NEW_DADA] = "新达达";
  map[Cts.SHIP_AUTO_BD] = "百度";
  map[Cts.SHIP_AUTO_SX] = "闪送";
  map[Cts.SHIP_AUTO_MT] = "美团跑腿";
  map[Cts.SHIP_AUTO_MT_ZB] = "美团众包";
  return map;
}

export function storeActionSheet(canReadStores, is_service_mgr = false) {
  let by = function (name, minor) {
    return function (o, p) {
      let a, b;
      if (o && p && typeof o === "object" && typeof p === "object") {
        a = o[name];
        b = p[name];
        if (a === null || b === null) {
          return a === null ? -1 : 1;
        }
        if (a === b) {
          return typeof minor === "function" ? minor(o, p) : 0;
        }
        if (typeof a === typeof b && typeof a === "string") {
          return a.localeCompare(b);
        }
        if (typeof a === typeof b) {
          return a < b ? -1 : 1;
        }
        return typeof a < typeof b ? -1 : 1;
      } else {
        throw "error";
      }
    };
  };

  let storeActionSheet = [{key: -999, section: true, label: "选择门店"}];
  let sortStores = Object.values(canReadStores).sort(
    by("type", by("city", by("id")))
  );
  for (let store of sortStores) {
    if (store.id > 0) {
      let city = store.city ? store.city : "";
      let item = {
        key: store.id,
        label:
          is_service_mgr && !!store.vendor
            ? store.vendor + city + ":" + store.name
            : store.name
      };
      storeActionSheet.push(item);
    }
  }

  return storeActionSheet;
}

function sortStores(canReadStores) {
  let by = function (name, minor) {
    return function (o, p) {
      let a, b;
      if (o && p && typeof o === "object" && typeof p === "object") {
        a = o[name];
        b = p[name];
        if (a === null || b === null) {
          return a === null ? -1 : 1;
        }
        if (a === b) {
          return typeof minor === "function" ? minor(o, p) : 0;
        }
        if (typeof a === typeof b && typeof a === "string") {
          return a.localeCompare(b);
        }
        if (typeof a === typeof b) {
          return a < b ? -1 : 1;
        }
        return typeof a < typeof b ? -1 : 1;
      } else {
        throw "error";
      }
    };
  };

  return Object.values(canReadStores).sort(
    by("vendor_id", by("city", by("district", by("name"))))
  );
}

/**
 * 数组按指定字段排序
 * @param itemlist
 * @param gby
 * @param keyName
 * @param valueName
 * @returns {Array}
 * @constructor
 */
function ArrayGroupBy(itemlist, gby, keyName = 'key', valueName = 'value') {
  var setGroupObj = function (noteObj, rule, gby, gIndex, maxIndex) {
    var gname = rule[gby[gIndex]];
    if (gIndex == maxIndex) {
      if (noteObj[gname] == undefined)
        noteObj[gname] = [];
      if (noteObj[gname].indexOf(rule) < 0) {
        noteObj[gname].push(rule);
      }
    } else {
      if (noteObj[gname] == undefined) {
        noteObj[gname] = {};
      }
      setGroupObj(noteObj[gname], rule, gby, gIndex + 1, maxIndex);
    }
  }

  var noteObj = {};
  for (var i = 0; i < itemlist.length; i++) {
    setGroupObj(noteObj, itemlist[i], gby, 0, gby.length - 1);
  }

  var getSubInfo = function (note, p, gIndex, maxIndex) {
    var newobj = {}
    newobj[keyName] = p;
    newobj[valueName] = [];
    if (gIndex == maxIndex) {
      for (var k in note[p]) {
        newobj[valueName].push(note[p][k]);
      }
    } else {
      for (var k in note[p]) {
        newobj[valueName].push(getSubInfo(note[p][k], k, gIndex + 1, maxIndex));
      }
    }
    return newobj;
  }
  var myobj = [];
  for (var p in noteObj) {
    myobj.push(getSubInfo(noteObj, p, 0, gby.length - 1));
  }
  return myobj;
}

/**
 * 门店数据 格式化 -> React-Native-Modal-Selector
 * @param canReadStores
 */
export function storeListOfModalSelector(canReadStores) {
  const storeListGroup = ArrayGroupBy(sortStores(canReadStores), ['city'], 'label', 'children')
  let return_data = []
  let return_data_deep = 2

  for (let i in storeListGroup) {
    let storeListGroupByCity = storeListGroup[i]

    if (storeListGroupByCity.label === 'undefined') {
      storeListGroup.splice(i, 1)
      continue
    }

    storeListGroupByCity.key = i
    let storeDistrictCityValue = storeListGroupByCity.children

    for (store of storeDistrictCityValue) {
      store.label = store.vendor + '-' + store.district + '-' + store.name
      store.key = store.id
    }
  }

  return_data = storeListGroup

  if (storeListGroup.length === 1) {
    return_data_deep = 1
    return_data = storeListGroup[0].children
  }
  return {return_data, return_data_deep}
}

/**
 * 按照城市分组门店
 * @param stores
 */
export function storeListGroupByCity(stores) {
  const storeByCity = ArrayGroupBy(sortStores(stores), ['city'])
  const obj = {}
  for (let item of storeByCity) {
    const key = item.key
    obj[key] = item.value
  }
  return obj
}

export function first_store_id(canReadStores) {
  let first_store_id = 0;
  for (let store of Object.values(canReadStores)) {
    if (store.id > 0) {
      first_store_id = store.id;
      break;
    }
  }
  return first_store_id;
}

export function toFixed(num, type = "", abs = false) {
  if (abs) {
    num = Math.abs(num)
  }
  if (type == "int") {
    return parseInt(num) / 100;
  } else if (type === 'yuan') {
    return Number(num).toFixed(2);
  } else if (type === 'percent') {
    return Number(num * 100).toFixed(2) + '%';
  } else {
    return (parseInt(num) / 100).toFixed(2);
  }
}

export function billStatus(status) {
  let map = {};
  map[Cts.BILL_STATUS_WAIT] = "待打款";
  map[Cts.BILL_STATUS_PAID] = "已打款";
  map[Cts.BILL_STATUS_INVALID] = "已作废";
  return map[status];
}

export function autoPlat(type, status) {
  return `${this.ship_name(type)}: ${this.zs_status(status)}`;
}

export function ship_name(type) {
  let plat = {};
  plat[Cts.SHIP_ZS_JD] = "京东专送";
  plat[Cts.SHIP_ZS_MT] = "美团专送";
  plat[Cts.SHIP_KS_MT] = "美团快送";
  plat[Cts.SHIP_ZS_ELE] = "饿了么专送";
  plat[Cts.SHIP_KS_ELE] = "饿了么快送";
  plat[Cts.SHIP_ZS_BD] = "百度专送";

  return plat[type] === undefined ? "未知配送" : plat[type];
}

export function zs_status(status) {
  let znMap = {};
  znMap[Cts.ZS_STATUS_NEVER_START] = "待召唤";
  znMap[Cts.ZS_STATUS_TO_ACCEPT] = "待接单";
  znMap[Cts.ZS_STATUS_TO_FETCH] = "待取货";
  znMap[Cts.ZS_STATUS_ON_WAY] = "已在途";
  znMap[Cts.ZS_STATUS_ARRIVED] = "已送达";
  znMap[Cts.ZS_STATUS_CANCEL] = "已取消";
  znMap[Cts.ZS_STATUS_ABNORMAL] = "异常";

  return znMap[status] === undefined ? "未知状态" : znMap[status];
}

export function sellingStatus(sell_status) {
  let map = {};
  map[Cts.STORE_PROD_ON_SALE] = "上架";
  map[Cts.STORE_PROD_OFF_SALE] = "下架";
  map[Cts.STORE_PROD_SOLD_OUT] = "缺货";
  if (map[sell_status]) {
    return map[sell_status];
  } else {
    return "选择门店状态";
  }
}

export function headerSupply(mode) {
  let map = {};
  map[Cts.STORE_SELF_PROVIDED] = "门店自采";
  map[Cts.STORE_COMMON_PROVIDED] = "总部供货";
  if (map[mode]) {
    return map[mode];
  } else {
    return "选择供货方式";
  }
}

export function simpleBarrier() {
  let requiredCallbacks = 0,
    doneCallbacks = 0,
    startTime = Date.now(),
    results = [];

  function defaultCallback(err, data) {
    return data;
  }

  let instance = {
    waitOn: function (callback) {
      let callbackIndex = requiredCallbacks;
      callback = callback || defaultCallback;
      requiredCallbacks++;
      return function () {
        let result = callback.apply(this, arguments);
        results[callbackIndex] = result;
        doneCallbacks++;
        if (requiredCallbacks === doneCallbacks) {
          instance.duration = Date.now() - startTime;
          instance.endWithCallback(results);
        }
      };
    },
    endWith: function (fn) {
      instance.endWithCallback = fn;
    },
    getRequiredCallbacks: function () {
      return requiredCallbacks;
    },
    getDoneCallbacks: function () {
      return doneCallbacks;
    }
  };
  return instance;
}

function getOperateDetailsType(type) {
  let map = {};
  map[Cts.OPERATE_DISTRIBUTION_TIPS] = "加小费详情";
  map[Cts.OPERATE_REFUND_OUT] = "退款详情";
  map[Cts.OPERATE_OTHER_OUT] = "其他支出流水";
  return map[type];
}

function deepClone(obj) {
  function isClass(o) {
    if (o === null) return "Null";
    if (o === undefined) return "Undefined";
    return Object.prototype.toString.call(o).slice(8, -1);
  }

  let result;
  let oClass = isClass(obj);
  if (oClass === "Object") {
    result = {};
  } else if (oClass === "Array") {
    result = [];
  } else {
    return obj;
  }
  for (let key in obj) {
    let copy = obj[key];
    if (isClass(copy) === "Object") {
      result[key] = arguments.callee(copy); //递归调用
    } else if (isClass(copy) === "Array") {
      result[key] = arguments.callee(copy);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

function getVendorName(vendorId) {
  let map = {};
  map[Cts.STORE_TYPE_SELF] = "菜鸟食材";
  map[Cts.STORE_TYPE_AFFILIATE] = "菜鸟";
  map[Cts.STORE_TYPE_GZW] = "鲜果集";
  map[Cts.STORE_TYPE_BLX] = "比邻鲜";
  map[Cts.STORE_TYPE_HLCS] = "华联超市";
  map[0] = "全部";
  return map[vendorId];
}

function getSortName(sortId) {
  let map = {};
  map[Cts.GOODS_MANAGE_DEFAULT_SORT] = "默认排序";
  map[Cts.GOODS_MANAGE_SOLD_SORT] = "销量降序";
  return map[sortId];
}

function goodSoldStatusImg(status) {
  let map = {};
  map[Cts.STORE_PROD_ON_SALE] =
    <FontAwesome5 name={'cart-arrow-up'} style={{fontSize: pxToDp(28), marginLeft: pxToDp(20), color: colors.gray}}/>;
  map[Cts.STORE_PROD_OFF_SALE] = <FontAwesome5 name={'cart-arrow-down'} style={{
    fontSize: pxToDp(28),
    marginLeft: pxToDp(20),
    color: colors.gray
  }}/>;
  map[Cts.STORE_PROD_SOLD_OUT] = <View style={{
    width: pxToDp(28),
    height: pxToDp(28),
    marginLeft: pxToDp(20),
    alignSelf: "flex-end",
    backgroundColor: colors.warn_color
  }}><Text style={{color: colors.white}}>缺</Text></View>;
  return map[status];
}

function getTimeStamp(str) {
  return new Date(str.replace(/-/g, "/")).getTime();
}

/**
 * 价格尾数优化（需要和mobileweb项目 __priceWithExtra 方法保持一致）
 * @param $spPrice 分
 * @return float|int
 */
function priceOptimize($spPrice) {
  let jiao;
  jiao = Math.floor($spPrice / 10);
  if ($spPrice >= 200) { //超过此价才处理尾数
    let jiao_mod = jiao % 10;
    if (jiao_mod < 3) {
      $spPrice = Math.floor(jiao / 10) * 100 - 1;
    } else if (jiao_mod < 5) {
      $spPrice = Math.floor(jiao / 10) * 100 + 50;
    } else if (jiao_mod === 7) {
      $spPrice = Math.floor(jiao / 10) * 100 + 80;
    } else {
      $spPrice = jiao * 10;
    }
  }

  return $spPrice
}

let timer = null;

/**
 * 防抖函数
 */
function debounces(fn, delay = 800) {
  if (timer) {
    clearTimeout(timer)
    timer = setTimeout(fn, delay)
  } else {
    timer = setTimeout(fn, delay)
  }
}

/**
 * 节流函数
 * 定时器方案
 */
function throttle(fn, wait) {
  var timer = null;
  return function () {
    var context = this;
    var args = arguments;
    if (!timer) {
      timer = setTimeout(function () {
        fn.apply(context, args);
        timer = null;
      }, wait)
    }
  }
}


/**
 * 图片上传key
 */
function imageKey(imgName) {
  let curTime = Date.now();
  let UniqueId = DeviceInfo.getUniqueId();
  let str = md5.hex_md5(UniqueId + curTime + imgName);
  return str
}

export default {
  urlByAppendingParams,
  objectMap,
  objectReduce,
  shortTimeDesc,
  shortTimestampDesc,
  shortOrderDay,
  diffDesc,
  fullDate,
  orderOrderTimeShort,
  orderExpectTime,
  resetNavStack,
  objectSum,
  objectFilter,
  store,
  intOf,
  disWayStatic,
  disWay,
  vendor,
  user,
  vendorOfStoreId,
  length,
  parameterByName,
  user_info,
  first_store_id,
  storeActionSheet,
  storeListOfModalSelector,
  fullDay,
  toFixed,
  billStatus,
  get_platform_name,
  autoPlat,
  ship_name,
  zs_status,
  sellingStatus,
  headerSupply,
  deepClone,
  getOperateDetailsType,
  getVendorName,
  getSortName,
  goodSoldStatusImg,
  getTimeStamp,
  simpleBarrier,
  isPreOrder,
  priceOptimize,
  debounces,
  throttle,
  imageKey
};
