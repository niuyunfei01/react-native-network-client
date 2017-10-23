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

export function shortTimestampDesc(timestamp) {

  return _shortTimeDesc(Moment(timestamp))
}

export function shortTimeDesc(datetime) {

  if (!datetime) return '';

  return _shortTimeDesc(Moment(datetime))
}

function _shortTimeDesc(dtMoment) {
  const nowMoment = Moment();

  console.log(dtMoment);

  const dSeconds = nowMoment.unix() - dtMoment.unix();
  const dYear = nowMoment.year() - dtMoment.year();

  if (dSeconds >= 0 && dSeconds < 60) {
    if (dSeconds < 10) {
      return '刚刚';
    } else {
      return `${dSeconds}秒前`;
    }
  } else if (dSeconds >= 0 && dSeconds < 3600) {
    return Math.floor(dSeconds/60) + "分钟前";

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