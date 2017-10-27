import Moment from 'moment';
import {NavigationActions} from "react-navigation";

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
  return Object.keys(obj).map((key) => fn(obj[key], key))
}

export function objectReduce(obj, fn) {
  return Object.keys(obj).reduce((idx1, idx2) => fn(obj[idx1], obj[idx2]))
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

export function vendor(global) {
  const {
    currentUser,
    currStoreId,
    canReadStores,
    canReadVendors,
  } = global;
  let currStore = canReadStores[currStoreId] === undefined ? {} : canReadStores[currStoreId];
  let currVendorId = currStore['vendor_id'];
  let currVendorName = currStore['vendor'];

  let currVendor = canReadVendors[currVendorId] === undefined ? {} : canReadVendors[currVendorId];
  let currVersion = currVendor['version'];
  // console.log('currVendorId -> ', currVendorId);
  // console.log('currStore -> ', currStore);
  console.log('currVendor -> ', currVendor);

  let mgr_ids = [];
  let owner_id = currStore['owner_id'];
  let vice_mgr = currStore['vice_mgr'];
  let service_uid = currVendor['service_uid'];
  let service_mgr = currVendor['service_mgr'];
  console.log('ids -> ', owner_id, vice_mgr, service_uid, service_mgr);
  if(owner_id !== '' && owner_id !== undefined && owner_id > 0){
    mgr_ids.push(owner_id);
  }
  if(vice_mgr !== '' && vice_mgr !== undefined && vice_mgr > 0){
    mgr_ids.push(vice_mgr);
  }
  if(service_uid !== '' && service_uid !== undefined && service_uid > 0){
    mgr_ids.push(service_uid);
  }
  if(service_mgr !== '' && service_mgr !== undefined){//可能有多个 -> '811488,822472'
    mgr_ids.push(service_mgr);
  }

  let manager = ','+mgr_ids.join(',')+',';
  console.log('manager -> ', manager);
  let is_mgr = manager.indexOf(','+currentUser+',') !== -1;
  return {
    currVendorId: currVendorId,
    currVendorName: currVendorName,
    currVersion: currVersion,
    currManager: manager,
    is_mgr: is_mgr,
  };
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
  navigation.dispatch(resetAction)

  console.log('_resetNavStack ' + routeName)
}

export default {
  urlByAppendingParams,
  objectMap,
  objectReduce,
  shortTimeDesc,
  shortTimestampDesc,
  shortOrderDay,
  orderOrderTimeShort,
  orderExpectTime,
  resetNavStack,
}