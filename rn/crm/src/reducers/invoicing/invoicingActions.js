'use strict';

import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';
import Cts from "../../Cts";

const {
  FETCH_UNLOCKED_REQ
} = require('../../common/constants').default;

export function fetchUnlocked(store_id, token, callback) {
  return dispatch => {
    const url = `InventoryApi/list_unlocked/${store_id}?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        let {ok, reason, obj} = resp;
        if(ok){
          dispatch(receiveUnlockedReq(obj))
        }else{
          ToastLong(reason);
          dispatch(receiveUnlockedReq([]))
        }
        callback();
      });
  }
}

function receiveUnlockedReq(data) {
  return {
    type: FETCH_UNLOCKED_REQ,
    unlockedList: data
  }
}

