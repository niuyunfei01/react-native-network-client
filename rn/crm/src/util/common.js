'use strict';
import FetchEx from "./fetchEx";
import Config from "../config";

export function getWithTpl(url, okFn, failFn) {
  FetchEx.timeout(Config.FetchTimeout, FetchEx.get(url))
    .then(res => res.json())
    .then(json => {
      // console.log(url, json);
      okFn(json)
    }).catch((error) => {
    failFn(error)
  });
}

/**
 *
 * @param url
 * @param data object (will be json.stringify)
 * @param okFn
 * @param failFn
 */
export function jsonWithTpl(url, data, okFn, failFn) {
  FetchEx.timeout(Config.FetchTimeout, FetchEx.postJSON(url, data))
    .then(res => res.json())
    .then(json => {
      okFn(json)
    }).catch((error) => {
    failFn(error)
  });
}

/**
 *
 * @param url
 * @param data plain javascript data, will be converted to FormData
 * @param okFn function with one param: json
 * @param failFn function with error msg
 */
export function postWithTpl(url, data, okFn, failFn) {
  const formData  = new FormData();
  for(let name in data) {
    formData.append(name, data[name]);
  }
  FetchEx.timeout(Config.FetchTimeout, FetchEx.postForm(url, formData))
    .then(res => res.json())
    .then(json => {
      okFn(json)
    }).catch((error) => {
    failFn(error)
  });
}

export default {
  focusNextInput(context, ref) {
    if (context && context.refs && context.refs[ref]) {
      context.refs[ref].focus();
    }
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  NaviGoBack(navigator) {
    if (navigator && navigator.getCurrentRoutes().length > 1) {
      navigator.pop();
      return true;
    }
    return false;
  },
  isEmptyObject(obj) {
    for (var name in obj) {
      return false;
    }
    return true;
  },
  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },
  getWithTpl,
  postWithTpl
};