import Moment from 'moment';
import {NavigationActions} from "react-navigation";
import Cts from "../Cts";

export function urlByAppendingParams(url: string, params: Object) {
  let result = url
  if (result.substr(result.length - 1) != '?') {
    result = result + `?`
  }

  for (let key in params) {
    let value = params[key]
    result += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`
  }

  result = result.substring(0, result.length - 1);
  return result;
}

export function objectMap(obj, fn) {
  const keys = Object.keys(obj);
  if (typeof keys === 'undefined' || keys.length === 0) {
    return [];
  }
  return keys.map((key) => fn(obj[key], key))
}

/**
 *
 * @param obj
 * @param fn (item, key) => true/false
 * @returns {{}}
 */
export function objectFilter(obj, fn) {
  const filterObj = {};
  Object.keys(obj).filter((key) => fn(obj[key], key)).map((key) => filterObj[key] = obj[key]);
  return filterObj
}

export function objectReduce(obj, fn) {
  return Object.keys(obj).reduce((idx1, idx2) => fn(obj[idx1], obj[idx2]))
}

export function objectSum(obj, fn) {
  let total = 0;
  Object.keys(obj).map((key) => total += fn(obj[key]));
  return total;
}

export function shortOrderDay(dt) {
  return Moment(dt).format('MMDD')
}

export function orderOrderTimeShort(dt) {
  return Moment(dt).format('M/DD HH:mm')
}

export function orderExpectTime(dt) {
  return Moment(dt).format('M/DD HH:mm')
}

export function fullDate(dt) {
  return Moment(dt).format('YYYY-MM-DD HH:mm:ss')
}

export function storeTime(dt) {
  return Moment(dt).format('H:mm');
}

export function vendorOfStoreId(storeId, global) {
  const {
    canReadStores,
    canReadVendors,
  } = global;

  const vendorId = canReadStores[storeId] && canReadStores[storeId].vendor_id;
  return canReadVendors && canReadVendors[vendorId] ? canReadVendors[vendorId] : null;
}

export function vendor(global) {
  const {
    currentUser,
    currStoreId,
    canReadStores,
    canReadVendors,
    config,
  } = global;
  let currStore = canReadStores[currStoreId] === undefined ? {} : canReadStores[currStoreId];
  let currVendorId = currStore['vendor_id'] || currStore['type'];
  let currVendorName = currStore['vendor'];
  let currStoreName = currStore['name'];
  let fnPriceControlled = currStore['fn_price_controlled'];

  let currVendor = canReadVendors[currVendorId] === undefined ? {} : canReadVendors[currVendorId];
  let currVersion = currVendor['version'];
  let fnProviding = currVendor['fnProviding'];
  let fnProvidingOnway = currVendor['fnProvidingOnway'];
  let mgr_ids = [];
  let service_ids = [];
  let owner_id = currStore['owner_id'];
  let vice_mgr = currStore['vice_mgr'];
  let service_uid = currVendor['service_uid'];
  let service_mgr = currVendor['service_mgr'];
  // console.log('ids -> ', owner_id, vice_mgr, service_uid, service_mgr);
  if (owner_id !== '' && owner_id !== undefined && owner_id > 0) {
    mgr_ids.push(owner_id);
  }
  if (vice_mgr !== '' && vice_mgr !== undefined && vice_mgr > 0) {
    mgr_ids.push(vice_mgr);
  }
  if (service_uid !== '' && service_uid !== undefined && service_uid > 0) {
    mgr_ids.push(service_uid);
    service_ids.push(service_uid);
  }
  if (service_mgr !== '' && service_mgr !== undefined) {//可能有多个 -> '811488,822472'
    mgr_ids.push(service_mgr);
    service_ids.push(service_mgr);
  }

  let manager = ',' + mgr_ids.join(',') + ',';
  let is_mgr = manager.indexOf(',' + currentUser + ',') !== -1;

  let service_manager = ',' + mgr_ids.join(',') + ',';
  let is_service_mgr = service_manager.indexOf(',' + currentUser + ',') !== -1;

  let {help_uid} = config;
  let is_helper = false;
  if (!!help_uid) {
    let helper = ',' + help_uid.join(',') + ',';
    is_helper = helper.indexOf(',' + currentUser + ',') !== -1;
  }

  return {
    currVendorId: currVendorId,
    currVendorName: currVendorName,
    currVersion: currVersion,
    currManager: manager,
    currStoreName: currStoreName,
    is_mgr: is_mgr,
    is_service_mgr: is_service_mgr,
    is_helper: is_helper,
    service_uid: service_uid,
    fnProviding: fnProviding,
    fnProvidingOnway: fnProvidingOnway,
    fnPriceControlled: fnPriceControlled,
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


export function store(store_id, global) {
  const {canReadStores} = global;
  return canReadStores[store_id];
}

export function length(obj) {
  if (obj === undefined) {
    return 0;
  } else {
    if (typeof(obj) === 'object' && obj.length === undefined) {
      obj = Object.values(obj);
    }
  }
  return obj.length;
}

export function curr_vendor(vendor_data, currVendorId) {
  let curr_data = {};
  if (vendor_data !== undefined && currVendorId > 0 && vendor_data[currVendorId] !== undefined) {
    curr_data = vendor_data[currVendorId];
  } else {
    console.log('curr_data -> ', vendor_data[currVendorId]);
  }
  return curr_data;
}

export function user_info(mine, currVendorId, currentUser) {
  let user_info = {};
  if (this.length(mine.user_list) > 0 && this.length(mine.user_list[currVendorId]) > 0 && this.length(mine.user_list[currVendorId][currentUser]) > 0) {
    // let {
    //   id, nickname, nameRemark, mobilephone, image, //user 表数据
    //   worker_id, vendor_id, user_id, status, name, mobile, //worker 表数据
    // }
    user_info = mine.user_list[currVendorId][currentUser];
  }

  return user_info;
}

export function shortTimestampDesc(timestamp) {

  return _shortTimeDesc(Moment(timestamp))
}

export function shortTimeDesc(datetime) {

  if (!datetime) return '';

  return _shortTimeDesc(Moment(datetime))
}

function _shortTimeDesc(dtMoment) {
  const nowMoment = Moment();

  const dSeconds = nowMoment.unix() - dtMoment.unix();
  const dYear = nowMoment.year() - dtMoment.year();

  if (dSeconds >= 0 && dSeconds < 60) {
    if (dSeconds < 10) {
      return '刚刚';
    } else {
      return `${dSeconds}秒前`;
    }
  } else if (dSeconds >= 0 && dSeconds < 3600) {
    return Math.floor(dSeconds / 60) + "分钟前";

  } else if (dYear === 0) {
    const dDay = nowMoment.dayOfYear() - dtMoment.dayOfYear();
    if (dDay <= 0 && dDay >= -1) {
      return (dDay === 0 ? '今天' : '明天') + dtMoment.format('HH:mm');
    } else {
      return dtMoment.format("M/D HH:mm");
    }
  } else {
    return dtMoment.format("YY/M/D H:i");
  }
}

export function resetNavStack(navigation, routeName, params = {}) {
  const resetAction = NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: routeName, params: params})]
  });
  navigation.dispatch(resetAction);

  console.log('_resetNavStack ' + routeName)
}

export function platforms_map() {
  let map = {};
  map[Cts.WM_PLAT_ID_BD] = '百度';
  map[Cts.WM_PLAT_ID_MT] = '美团';
  map[Cts.WM_PLAT_ID_ELE] = '饿了么';
  map[Cts.WM_PLAT_ID_JD] = '京东';
  map[Cts.WM_PLAT_ID_WX] = '微信';
  map[Cts.WM_PLAT_ID_APP] = 'App';
  map[Cts.WM_PLAT_UNKNOWN] = '未知';
  return map;
}

export function get_platform_name(platformId) {
  let map = platforms_map();
  return map[platformId] === undefined ? platformId : map[platformId];
}

export function intOf(val) {
  if (typeof val === 'string') {
    return parseInt(val);
  }

  return val;
}

function parameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function disWayStatic(index) {

  if (index == 1) {
    let map = {};
    map[Cts.FN_STATUS_ACCEPTED] = '系统已接单'
    map[Cts.FN_STATUS_ASSIGNED] = '已分配骑手'
    map[Cts.FN_STATUS_ARRIVED_STORE] = '骑手已到店'
    map[Cts.FN_STATUS_ON_WAY] = '配送中'
    map[Cts.FN_STATUS_ARRIVED] = '已送达'
    map[Cts.FN_STATUS_CANCELED] = '已取消'
    map[Cts.FN_STATUS_ABNORMAL] = '异常'
    return map;
  } else {
    let map = {};
    map[Cts.DADA_STATUS_TO_ACCEPT] = '待接单'
    map[Cts.DADA_STATUS_TO_FETCH] = '待取货'
    map[Cts.DADA_STATUS_SHIPPING] = '配送中'
    map[Cts.DADA_STATUS_ARRIVED] = '已完成'
    map[Cts.DADA_STATUS_CANCEL] = '已取消'
    map[Cts.DADA_STATUS_TIMEOUT] = '已过期'
    map[Cts.DADA_STATUS_ABNORMAL] = '指派单'
    return map;
  }
}

export function disWay() {
  let map = {};
  map[Cts.SHIP_AUTO_FN] = '蜂鸟';
  map[Cts.SHIP_AUTO_NEW_DADA] = '新达达';
  map[Cts.SHIP_AUTO_BD] = '百度';
  map[Cts.SHIP_AUTO_SX] = '闪送';
  return map
}

export function storeActionSheet(canReadStores) {
  let by = function(name,minor){
    return function(o,p){
      let a,b;
      if(o && p && typeof o === 'object' && typeof p ==='object'){
        a = o[name];
        b = p[name];
        if(a === b){
          return typeof minor === 'function' ? minor(o,p):0;
        }
        if(typeof a === typeof b){
          return a < b ? -1:1;
        }
        return typeof a < typeof b ? -1 : 1;
      }else{
        throw("error");
      }
    }
  };

  let storeActionSheet = [{key: -999, section: true, label: '选择门店'}];
  /*let sortStores = Object.values(canReadStores).sort(function (a, b) {
    let res = (parseInt(a.vendor_id) - parseInt(b.vendor_id));
    console.log('res ------------------> ', parseInt(a.vendor_id), parseInt(b.vendor_id), res);
    return res;
  });*/
  let sortStores = Object.values(canReadStores).sort(by('vendor_id',by('id')));
  for (let store of sortStores) {
    if (store.id > 0) {
      let item = {
        key: store.id,
        label: !!store.vendor ? (store.vendor + ':' + store.name) : store.name,
      };
      storeActionSheet.push(item);
    }
  }

  return storeActionSheet;
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

export default {
  urlByAppendingParams,
  objectMap,
  objectReduce,
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
  disWayStatic,
  disWay,
  vendor,
  vendorOfStoreId,
  length,
  parameterByName,
  user_info,
  first_store_id,
  storeActionSheet,
}