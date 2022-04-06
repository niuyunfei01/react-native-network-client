"use strict";
import AppConfig from "../pubilc/common/config.js";
import DeviceInfo from "react-native-device-info";

export default {
  timeout(ms, promise) {
    return new Promise(function (resolve, reject) {
      const timer = setTimeout(function () {
        reject(new Error("请求超时，请重新尝试"));
      }, ms);
      promise.then(
          res => {
            clearTimeout(timer);
            resolve(res);
          },
          err => {
            clearTimeout(timer);
            reject(err);
          }
      );
    });
  },
  //post数据
  post(action, formData) {
    //action为url
    const url = AppConfig.apiUrl(action);
    return fetch(url, {
      credential: "include", //带上cookie发送请求请求
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });
  },

  postForm(action, object) {
    const url = AppConfig.apiUrl(action);

    let parameters = Object.keys(object) // expand the elements from the .entries() iterator into an actual array
        .map(
            key => encodeURIComponent(key) + "=" + encodeURIComponent(object[key])
        )
        .join("&"); // transform the elements into encoded key-value-pairs

    return fetch(url, {
      credential: "include", //带上cookie发送请求请求
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: parameters
    });
  },

  postJSON(action, data) {
    const url = AppConfig.apiUrl(action);
    return fetch(url, {
      credential: "include",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        version: DeviceInfo.getVersion(),
        build_number: DeviceInfo.getBuildNumber(),
      },
      body: JSON.stringify(data)
    });
  },

  get(action, paras = "") {
    let url = AppConfig.apiUrl(action + (paras === "" ? "" : "?" + paras));
    return fetch(url, {
      credential: "include", //带上cookie发送请求请求
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        version: DeviceInfo.getVersion(),
        build_number: DeviceInfo.getBuildNumber(),
      }
    });
  }
};
