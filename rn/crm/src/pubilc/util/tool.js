import Cts from "../common/Cts";
import {CommonActions} from '@react-navigation/native';
import dayjs from "dayjs";

export const SFCategory = [
  {value: '1', label: '快餐'},
  {value: '2', label: '送药'},
  {value: '3', label: '百货'},
  {value: '4', label: '脏衣服收'},
  {value: '5', label: '干净衣服派'},
  {value: '6', label: '生鲜'},
  {value: '7', label: '保单'},
  {value: '8', label: '高端饮品'},
  {value: '9', label: '现场勘验'},
  {value: '10', label: '快递'},
  {value: '12', label: '文件'},
  {value: '13', label: '蛋糕'},
  {value: '14', label: '鲜花'},
  {value: '15', label: '电子数码'},
  {value: '16', label: '服装鞋帽'},
  {value: '17', label: '汽车配件'},
  {value: '18', label: '珠宝'},
  {value: '20', label: '披萨'},
  {value: '21', label: '中餐'},
  {value: '22', label: '水产'},
  {value: '27', label: '专人直送'},
  {value: '32', label: '中端饮品'},
  {value: '33', label: '便利店'},
  {value: '34', label: '面包糕点'},
  {value: '35', label: '火锅'},
  {value: '36', label: '证照'},
  {value: '40', label: '烧烤小龙虾'},
  {value: '41', label: '外部落地配'},
  {value: '47', label: '烟酒行'},
  {value: '48', label: '成人用品'},
  {value: '99', label: '其他'}];

export function objectMap(obj, fn) {
  const keys = Object.keys(obj);
  if (typeof keys === "undefined" || length(keys) === 0) {
    return [];
  }

  return keys.map((key, index) => fn(obj[key], key, index));
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


export function vendor(global) {
  const {
    currentUser,
    store_info,
    vendor_info,
    vendor_id,
    help_uid,
  } = global;
  let currVendorName = vendor_info["brand_name"];
  let currStoreName = store_info["name"];

  let currVersion = vendor_info["version"];
  let fnProviding = vendor_info["fnProviding"];
  let fnProvidingOnway = vendor_info["fnProvidingOnway"];
  let service_ids = [];
  let service_uid = vendor_info["service_uid"];
  let service_mgr = vendor_info["service_mgr"];
  let allow_merchants_store_bind = vendor_info["allow_merchants_store_bind"];
  let allow_merchants_edit_prod = vendor_info["allow_merchants_edit_prod"];
  let allow_store_mgr_call_ship = vendor_info["allow_store_mgr_call_ship"];
  let wsb_store_account = vendor_info["wsb_store_account"] === '1';
  if (service_uid !== "" && service_uid !== undefined && service_uid > 0) {
    service_ids.push(service_uid);
  }
  if (service_mgr !== "" && service_mgr !== undefined) {
    //可能有多个 -> '811488,822472'
    service_ids.push(service_mgr);
  }

  let service_manager = "," + service_ids.join(",") + ",";
  let is_service_mgr = service_manager.indexOf("," + currentUser + ",") !== -1;

  let is_helper = false;
  if (help_uid) {
    let helper = "," + help_uid.join(",") + ",";
    is_helper = helper.indexOf("," + currentUser + ",") !== -1;
  }
  return {
    currVendorId: vendor_id,
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
    co_type: vendor_info.co_type,
  };
}

/**
 * 当前店铺信息
 * @param global
 * @returns {*}
 */
export function store(global) {
  const {store_info} = global;
  return store_info;
}

export function length(obj) {
  if (obj === undefined || obj === null) {
    return 0;
  }
  switch (typeof obj) {
    case "boolean":
      return Number(obj)
    case "number":
      return obj
    case "function":
      return 0
    case "string":
      return obj.length
    case "object":
      return Object.values(obj).length;
    default:
      return 0
  }

}

const pickImageOptions = (cropping) => {
  return {
    width: 800,
    height: 800,
    cropping: cropping,
    cropperCircleOverlay: false,
    includeExif: true,
    cropperChooseText: '选择图片',
    cropperCancelText: '取消'
  };
}

export function curr_vendor(vendor_data, currVendorId) {
  let curr_data = {};
  if (
    vendor_data !== undefined &&
    currVendorId > 0 &&
    vendor_data[currVendorId] !== undefined
  ) {
    curr_data = vendor_data[currVendorId];
  }
  return curr_data;
}

export function user_info(mine, currVendorId, currentUser) {
  let user_info = {};
  if (
    length(Object.keys(mine.user_list)) > 0 &&
    mine.user_list[currVendorId] &&
    length(Object.keys(mine.user_list[currVendorId])) > 0 &&
    mine.user_list[currVendorId][currentUser] &&
    length(Object.keys(mine.user_list[currVendorId][currentUser])) > 0
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
  return user_info(reduxMine, reduxGlobal?.vendor_id, currentUser)
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
  name = name.replace(/[[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
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
        results[callbackIndex] = callback.apply(this, arguments);
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

function getCenterLonLat(oneLon, oneLat, twoLon, twoLat) {
  //oneLon：第一个点的经度；oneLat：第一个点的纬度；twoLon：第二个点的经度；twoLat：第二个点的纬度；
  let aLon = 0, aLat = 0;
  let bLon = Number(oneLon) - Number(twoLon);
  let bLat = Number(oneLat) - Number(twoLat);
  //Math.abs()绝对值
  if (bLon > 0) {
    aLon = Number(oneLon) - Math.abs(bLon) / 2;
  } else {
    aLon = Number(twoLon) - Math.abs(bLon) / 2;
  }
  if (bLat > 0) {
    aLat = Number(oneLat) - Math.abs(bLat) / 2;
  } else {
    aLat = Number(twoLat) - Math.abs(bLat) / 2;
  }
  return {aLon, aLat};
}

function jbbsubstr(str = '', height = 0, start = 0, default_str = '') {
  if (typeof str !== 'string' && typeof str !== 'number') {
    return default_str;
  }
  return length((str || default_str)) > height ? height > 0 ? str.substring(start, height - 1) + '...' : '...' + str.substr(height) : (str || default_str)
}

export default {
  objectMap,
  shortTimeDesc,
  shortTimestampDesc,
  shortOrderDay,
  fullDate,
  orderOrderTimeShort,
  orderExpectTime,
  resetNavStack,
  objectSum,
  objectFilter,
  store,
  intOf,
  vendor,
  user,
  length,
  parameterByName,
  user_info,
  fullDay,
  toFixed,
  billStatus,
  get_platform_name,
  pickImageOptions,
  ship_name,
  sellingStatus,
  headerSupply,
  deepClone,
  getOperateDetailsType,
  isPreOrder,
  priceOptimize,
  debounces,
  throttle,
  getCenterLonLat,
  jbbsubstr
};
