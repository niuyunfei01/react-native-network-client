'use strict';
import React from 'react';
import * as wechat from 'react-native-wechat-lib'
import Config from "../config";
import tool from "../common/tool";
import {getReadableVersion} from "react-native-device-info/src/index";
wechat.registerApp(Config.APP_ID, Config.universalLink).then(r => console.log("register done:", r));

export function JumpMiniProgram(path = "/pages/service/index", data = {}) {
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
