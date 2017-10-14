'use strict';

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
  }
};