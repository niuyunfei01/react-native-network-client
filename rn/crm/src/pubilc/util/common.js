"use strict";
import FetchEx from "./fetchEx";
import Config from "../common/config";

/**
 * @param url
 * @param okFn (json, dispatch) => {}
 * @param failFn (error, dispatch) => {}
 * @returns {function(*=)}
 */
export function getWithTpl2(url, okFn, failFn) {
  failFn =
    failFn ||
    (error => {

    });

  return dispatch => getWithTpl(url, okFn, failFn, dispatch);
}

export function jsonWithTpl2(url, data, okFn, failFn) {
  failFn =
    failFn ||
    (error => {

    });

  return dispatch => jsonWithTpl(url, data, okFn, failFn, dispatch);
}

/**
 *
 *  请优先使用 getWithTpl2
 * @param url
 * @param okFn
 * @param failFn
 * @param dispatch
 */
export function getWithTpl(url, okFn, failFn, dispatch) {
  FetchEx.timeout(Config.FetchTimeout, FetchEx.get(url))
    .then(res => res.json())
    .then(json => {
      okFn(json, dispatch);
    })
    .catch(error => {
      failFn && failFn(error, dispatch);
    });
}

/**
 *
 * @deprecated 请优先使用 jsonWithTpl2
 * @param url
 * @param data object (will be json.stringify)
 * @param okFn
 * @param failFn
 * @param dispatch
 */
export function jsonWithTpl(url, data, okFn, failFn, dispatch) {
  FetchEx.timeout(Config.FetchTimeout, FetchEx.postJSON(url, data))
    .then(res => res.json())
    .then(json => {
      okFn(json, dispatch);
    })
    .catch(error => {
      dispatch ? failFn(error, dispatch) : failFn(error);
    });
}

/**
 *
 * @param url
 * @param data plain javascript data, object key/value pairs
 * @param okFn function with one param: json
 * @param failFn function with error msg
 */
export function postWithTpl(url, data, okFn, failFn) {
  FetchEx.timeout(Config.FetchTimeout, FetchEx.postForm(url, data))
    .then(res => res.json())
    .then(json => {
      okFn(json);
    })
    .catch(error => {
      failFn(error);
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

    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  },
  getWithTpl,
  postWithTpl
};

export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}

export function padNum(num, size) {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

export function keySort(obj) {
  let keys = Object.keys(obj).sort(), sortedObj = {};

  for (let i in keys) {
    sortedObj[keys[i]] = obj[keys[i]];
  }
  return sortedObj;
}

export function makeObjToString(obj) {
  let str = ''
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      str += key + obj[key]
    }
  }
  return str
}
