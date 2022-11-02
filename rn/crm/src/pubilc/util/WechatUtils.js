'use strict';
import React from 'react';
import * as wechat from 'react-native-wechat-lib'
import Config from "../common/config";
import tool from "./tool";
import {getReadableVersion} from "react-native-device-info/src/index";
import {ToastShort} from "./ToastUtils";

let regStatus = false
wechat.registerApp(Config.APP_ID, Config.universalLink).then(() => regStatus = true);

function shareWechatImage(imageUrl, scene) {
  return new Promise((resolve, reject) => {
    wechat.shareLocalImage({imageUrl: imageUrl, scene: scene}).then((res) => {
      resolve(res)
    }).catch(reason => {
      reject(reason)
    })
  })

}

async function JumpMiniProgram(path = "/pages/service/index", data = {}) {
  if (!regStatus) {
    ToastShort('请重新打开外送帮重试')
    return
  }
  const isInstalled = await wechat.isWXAppInstalled()
  if (!isInstalled) {
    ToastShort('请先安装微信')
    return
  }
  let str = '?ver=' + getReadableVersion() + '&';
  if (tool.length(data) > 0) {
    let paramsArray = [];
    Object.keys(data).forEach(key => paramsArray.push(key + '=' + data[key]))
    str += paramsArray.join('&')
  }
  await wechat.launchMiniProgram({userName: Config.Program_id, path: path + str})

}

function wechatLogin() {
  return wechat.sendAuthRequest('snsapi_userinfo', '')
    .then(responseCode => {
      //返回code码，通过code获取access_token
      return responseCode.code
    })
    .catch(err => {
    })
}

// JumpWeb('测试','测试描述','https://cnsc-pics.cainiaoshicai.cn/platformLogo/1.png','https://www.waisongbang.com')
function JumpWeb(title, desc, img, url, type = 0) {
  wechat.shareWebpage({
    title: title,
    description: desc,
    thumbImageUrl: img,
    webpageUrl: url,
    scene: type,
  }).then(() => {
  });
}

export {JumpMiniProgram, JumpWeb, wechatLogin, shareWechatImage}

