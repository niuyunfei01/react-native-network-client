/**
 * # deviceActions.js
 *
 * What platform are we running on, ie ```ios``` or ```android```
 *
 * What version is the app?
 *
 */
'use strict'

/**
 * ## Imports
 *
 * The actions supported
 */
const {
  SET_PLATFORM,
  SET_VERSION,
  SET_DEVICE_INFO
} = require('../../pubilc/common/constants').default

/**
 * ## Set the platformState
 *
 */
export function setPlatform(platform) {
  return {
    type: SET_PLATFORM,
    payload: platform
  }
}

/**
 * ## set the version
 *
 */
export function setVersion(version) {
  return {
    type: SET_VERSION,
    payload: version
  }
}

export function setDeviceInfo(deviceInfo) {
  return {
    type: SET_DEVICE_INFO,
    deviceInfo: deviceInfo
  }
}
