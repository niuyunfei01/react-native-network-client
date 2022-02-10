const _ = require('lodash');
const Util = require('./Util');
const Buffer = require('buffer').Buffer;
var iconv = require('iconv-lite');
const Common = {
  INIT: "1B 40",//初始化
  ALIGN_LEFT: "1B 61 00",//左对齐
  ALIGN_RIGHT: "1B 61 02",//居右对齐
  ALIGN_CENTER: "1B 61 01",//居中对齐
  UNDER_LINE: "1C 2D 01",//下划线
  PRINT_AND_NEW_LINE: "0A",//打印并换行
  FONT_SMALL: "1B 4D 01",//小号字体9x17
  FONT_NORMAL: "1B 4D 00",//正常12x24
  FONT_BOLD: "1B 45 01",//粗体
  // FONT_H_W_NORMAL: '1D 21 00',// 字体不放大
  FONT_H_W_NORMAL: '1B 21 00',// 字体不放大
  FONT_HEIGHT_TIMES: '1B 21 10',
  FONT_WIDTH_TIMES: '1B 21 20',
  FONT_HEIGHT_WIDTH_TIMES: '1B 21 30',
  SOUND: "1B 42 02 02" // 蜂鸣 2次/100ms
};

const Config = {
  wordNumber: 48 // 可打印的字数，对应80mm纸张
};

let printArray = [];

function writeTextToDevice(text) {
  let re = iconv.encode(text, 'gbk')
  printArray = printArray.concat(Array.from(re));
  return re;
}

function writeHexToDevice(hexString) {

  let str = hexString.toLowerCase().replace(" ", "");
  let pos = 0;
  let len = str.length;
  if (len % 2 !== 0) {
    return null;
  }

  len /= 2;
  let hexA = [];
  for (let i = 0; i < len; i++) {
    let s = str.substr(pos, 2);
    let v = parseInt(s, 16);
    hexA.push(v);
    pos += 2;
  }

  printArray = printArray.concat(hexA);
  return hexA;
}

function setConfig(config) {
  Object.assign(Config, config);
}

function leftRight(left, right, wordNumber = Config.wordNumber) {
  return left + Util.getSpace(wordNumber - Util.getWordsLength(left) - Util.getWordsLength(right)) + right;
}

function keyValue(name, value, wordNumber = Config.wordNumber) {
  const nameLen = Util.getWordsLength(name);
  let vArr = [], temp = '';

  _.each(value, (v, i) => {
    const tvLen = Util.getWordsLength(temp + v);
    const diff = tvLen - (wordNumber - nameLen);
    if (diff <= 0) {
      temp += v;
      if (i === value.length - 1) {
        vArr.push(temp);
      }
    } else {
      if (Util.isChinese(v) && diff === 1) {
        temp += ' ';
      }
      vArr.push(temp);
      temp = v;
    }

  });

  return _.map(vArr, (v, i) => {
    if (i === 0) {
      return name + v;
    } else {
      return Util.getSpace(name.length) + v;
    }
  }).join('');
}

const ESC = {
  Common,
  Util: {
    leftRight,
    keyValue,
  },
  setConfig,
  init() {
    writeHexToDevice(Common.INIT);
  },

  printAndNewLine() {
    writeHexToDevice(Common.PRINT_AND_NEW_LINE);
  },

  alignLeft() {
    writeHexToDevice(Common.ALIGN_LEFT);
  },

  alignCenter() {
    writeHexToDevice(Common.ALIGN_CENTER);
  },

  alignRight() {
    writeHexToDevice(Common.ALIGN_RIGHT);
  },

  underline() {
    writeHexToDevice(Common.UNDER_LINE);
  },

  fontSmall() {
    writeHexToDevice(Common.FONT_SMALL);
  },

  fontNormal() {
    writeHexToDevice(Common.FONT_NORMAL);
  },

  fontBold() {
    writeHexToDevice(Common.FONT_BOLD);
  },

  fontHeightTimes() {
    writeHexToDevice(Common.FONT_HEIGHT_TIMES);
  },

  fontNormalHeightWidth() {
    writeHexToDevice(Common.FONT_H_W_NORMAL);
  },

  fontWidthTimes() {
    writeHexToDevice(Common.FONT_WIDTH_TIMES);
  },

  fontHeightWidthTimes() {
    writeHexToDevice(Common.FONT_HEIGHT_WIDTH_TIMES);
  },

  text(str) {
    writeTextToDevice(str)
  },

  hex(hexStr) {
    writeHexToDevice(hexStr)
  },

  startLine(len) {
    writeTextToDevice(Util.getStars(len))
  },

  sound() {
    writeHexToDevice(Common.SOUND);
  },

  walkPaper(n) {
    writeHexToDevice("1b 64 " + n.toString(16))
  },

  getByte() {
    return printArray;
  },

  resetByte() {
    printArray = [];
  }

};

module.exports = ESC;
