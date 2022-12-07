'use strict';

export default {
  trim(s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
  },
  formatException(msg) {
    let result = msg;
    if (msg.indexOf('JSON Parse error') > -1) {
      return '服务器返回数据JSON错误';
    }
    if (msg.indexOf('Network request failed') > -1) {
      return '网络请求失败，请检查网络！';
    }
    if (msg.indexOf('Cannot read property ok of undefined') > -1)
      return '服务器返回数据出错'
    return result;
  },
  strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
  },
  mapToJson(map) {
    return JSON.stringify(this.strMapToObj(map));
  },
  isMobile(string) {
    var pattern = /^1\d{10}$/;
    if (pattern.test(string)) {
      return true;
    }
    return false;
  }
};
