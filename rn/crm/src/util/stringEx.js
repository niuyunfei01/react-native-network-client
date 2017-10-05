'use strict';

export default {
    trim(s) {
        return s.replace(/(^\s*)|(\s*$)/g, "");
    },
    formatException(msg) {
        var result = msg;
        if (msg.indexOf('JSON Parse error') > -1) {
            result = 'JSON处理失败';
        } else if (msg.indexOf('Network request failed') > -1) {
            result = '网络请求失败，请检查网络！';
        }
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
        var pattern = /^1[34578]\d{9}$/;
        if (pattern.test(string)) {
            return true;
        }
        return false;
    }
};