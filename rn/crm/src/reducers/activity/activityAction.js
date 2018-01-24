'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';
import Cts from "../../Cts";

const {
  ACTIVITY_COMMON_RULE,
  ACTIVITY_SPECIAL_RULE,
} = require('../../common/constants').default;

export function updateCommonRule(arr) {
  return {
    type: ACTIVITY_COMMON_RULE,
    arr:arr
  }
}

export function updateCommonRule(arr) {
  return {
    type: ACTIVITY_COMMON_RULE,
    arr:arr
  }
}