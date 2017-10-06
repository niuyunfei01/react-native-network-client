import Moment from 'moment';

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

export function shortOrderDay(dt) {
    return Moment(dt).format('MMDD')
}

export function orderOrderTimeShort(dt) {
    return Moment(dt).format('M/DD HH:mm')
}

export function orderExpectTime(dt) {
    return Moment(dt).format('M/DD HH:mm')
}

export function shortTimeDesc(datetime) {

  if (!datetime) return '';

  const dtMoment = Moment(datetime);
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
    return Math.floor(dSeconds/60) + "分钟前";
    
  } else if (dYear === 0) {
    const dDay = 0;
    if (dDay <= 0 && dDay >= -1) {
      return (dDay === 0 ? '今天' : '明天') + dtMoment.format('HH:mm');
    } else {
      return dtMoment.format("M月D日 HH:mm");
    }
  } else {
    return dtMoment.format("YY/M/D H:i");
  }
}