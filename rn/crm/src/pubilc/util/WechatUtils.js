'use strict';
import React from 'react';
import * as wechat from 'react-native-wechat-lib'
import Config from "../common/config";
import tool from "./tool";
import {getReadableVersion} from "react-native-device-info/src/index";

wechat.registerApp(Config.APP_ID, Config.universalLink).then(r => console.log("register done:", r));

function JumpMiniProgram(path = "/pages/service/index", data = {}) {
  let str = '?ver=' + getReadableVersion() + '&';
  if (tool.length(data) > 0) {
    let paramsArray = [];
    Object.keys(data).forEach(key => paramsArray.push(key + '=' + data[key]))
    str += paramsArray.join('&')
  }
  wechat.launchMiniProgram({
    userName: Config.Program_id,
    path: path + str
  }, (res) => {
  });
}

// JumpWeb('测试','测试描述','https://cnsc-pics.cainiaoshicai.cn/platformLogo/1.png','https://www.waisongbang.com')
function JumpWeb(title, desc, img, url, type = 0) {
  wechat.shareWebpage({
    title: title,
    description: desc,
    thumbImageUrl: img,
    webpageUrl: url,
    scene: type,
  });
}

export {JumpMiniProgram, JumpWeb}

