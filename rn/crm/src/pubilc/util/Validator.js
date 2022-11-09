const tool = require("./tool");
const strategies = {
  required: function (value, errMsg) {
    console.log(value, tool.length(value))
    if (tool.length(value) <= 0) {
      return errMsg;
    }
  },
  minLenth: function (value, length, errMsg) {
    if (tool.length(value) < length) {
      return errMsg;
    }
  },
  equalLenth: function (value, length, errMsg) {
    if (tool.length(value) === length) {
      return errMsg;
    }
  },
  isMobile: function (value, errMsg) {
    if (!/^1[1|3|4|5|6|7|8|9][0-9]{9}$/.test(value)) {
      return errMsg;
    }
  }
}

export default class Validator {
  constructor() {
    this.cache = [];
  }

  add(dom, rule, errMsg) {
    const list = rule.split('|');
    for (let info of list) {
      const arr = info.split(':');
      this.cache.push(() => {
        const strategy = arr.shift();
        arr.unshift(dom);
        arr.push(errMsg);
        return strategies[strategy].apply(dom, arr);
      })
    }
  }

  start() {
    let is_validator = true;
    for (let i = 0; i < this.cache.length; i++) {
      const msg = this.cache[i]();
      if (msg) {
        is_validator = false
        return msg;
      }
    }
    if (is_validator) {
      return false;
    }
  }
}
