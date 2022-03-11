'use strict';
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {getWithTpl, getWithTpl2, jsonWithTpl2} from '../../util/common'
import Cts from "../../Cts";
import {ToastShort} from "../../util/ToastUtils";
import HttpUtils from "../../util/http";

/**
 * ## Imports
 *
 * The actions for profile
 */
const {
  GET_ORDER_REQUEST,
  GET_ORDER_SUCCESS,
  GET_ORDER_FAILURE,

  ORDER_UPDATE_REQUEST,
  ORDER_UPDATE_SUCCESS,
  ORDER_UPDATE_FAILURE,

  ORDER_PRINTED_CLOUD,
  ORDRE_ADD_ITEM,
  ORDER_EDIT_ITEM,
  ORDER_INVALIDATED,
  ORDER_WAY_ROCED

} = require('../../common/constants').default;

export function getOrderRequest() {
  return {
    type: GET_ORDER_REQUEST
  }
}

export function getOrderSuccess(json) {
  return {
    type: GET_ORDER_SUCCESS,
    payload: json
  }
}

export function getOrderFailure(json) {
  return {
    type: GET_ORDER_FAILURE,
    payload: json
  }
}

export function msgPrintInCloudDone(json) {
  return {
    type: ORDER_PRINTED_CLOUD,
    payload: json,
  }
}

let jsonReqThenInvalidate = function (url, id, callback, changes = {}) {
  return jsonWithTpl2(url, changes
    , (json, dispatch) => {
      if (json.ok) {
        dispatch({type: ORDER_INVALIDATED, id: id});
      }
      callback(json.ok, json.reason, json.obj)
    }
    , (error) => callback(false, "网络错误, 请稍后重试")
  )
};

let getReqThenInvalidate = function (url, id, callback) {
  return getWithTpl2(url,
    (json, dispatch) => {
      if (json.ok) {
        dispatch({type: ORDER_INVALIDATED, id: id});
      }
      callback(json.ok, json.reason, json.obj)
    }, (error) => callback(false, "网络错误, 请稍后重试" + (error ? ':' : '') + error))
};

export function printInCloud(sessionToken, orderId, callback) {
  const url = `api/print_in_cloud/${orderId}.json?access_token=${sessionToken}`;
  return getWithTpl2(url, (json, dispatch) => {
    // if (json.ok) {
    //   dispatch(msgPrintInCloudDone({orderId, printTimes: json.obj}))
    // }
    callback(json.ok, json.reason, json.obj)
  }, (error) => {
    console.log('print_order error:', error);
    callback(false, "打印失败, 请检查网络稍后重试")
  });
}

export function clearLocalOrder(id) {
  return dispatch => {
    dispatch({type: ORDER_INVALIDATED, id: id});
  };
}

/**
 *
 * @param sessionToken
 * @param orderId
 * @param callback (ok, msg|order) => {}
 * @returns {function(*)}
 */
export function getOrder(sessionToken, orderId, callback) {
  callback = callback || function () {
  };
  return dispatch => {
    dispatch(getOrderRequest());
    const url = `api/order_by_id/${orderId}.json?access_token=${sessionToken}&op_ship_call=1&bill_detail=1`;
    getWithTpl(url, (json) => {
        dispatch(getOrderSuccess(json));
        const ok = json && json.id === orderId;
        callback(ok, ok ? json : "返回数据错误")
      }, (error) => {
        dispatch(getOrderFailure(error));
        console.log('getOrder error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

export function saveUserTag(token, userId, tagIds, callback) {
  const url = `api/save_user_tags/${userId}.json?access_token=${token}`;
  return jsonWithTpl2(url, tagIds
    , (json, dispatch) => {
      callback(json.ok, json.reason, json.obj)
    }
    , (error) => callback(false, "网络错误, 请稍后重试")
  )
}

export function saveOrderBasic(token, orderId, changes, callback) {
  const url = `api/order_chg_basic/${orderId}.json?access_token=${token}`;
  return jsonReqThenInvalidate(url, orderId, callback, changes);
}

export function orderStartShip(token, id, shipper_id, callback) {
  const url = `api/order_start_ship_by_id/${id}.json?access_token=${token}&worker_id=${shipper_id}`;
  return getReqThenInvalidate(url, id, callback);
}

export function orderSetArrived(token, id, callback) {
  const url = `api/order_set_arrived_by_id/${id}.json?access_token=${token}`;
  return getReqThenInvalidate(url, id, callback);
}

export function orderSetReady(token, id, workerIdList, callback) {
  const workListStr = Array.isArray(workerIdList) ? workerIdList.join(',') : workerIdList;
  const url = `api/order_set_ready_by_id/${id}.json?access_token=${token}&worker_id=${workListStr}`;
  return getReqThenInvalidate(url, id, callback);
}

export function orderTransferSelf(token, orderId, callback) {
  const url = `/api/order_transfer_self?access_token=${token}&orderId=${orderId}`;
  return getReqThenInvalidate(url, orderId, callback);
}

/**
 *
 * @param token
 * @param id
 * @param oldWorkerId
 * @param workerIdList
 * @param callback
 */
export function orderChgPackWorker(token, id, oldWorkerId, workerIdList, callback) {
  const workListStr = Array.isArray(workerIdList) ? workerIdList.join(',') : workerIdList;
  const url = `api/order_chg_pack_worker/${id}/${oldWorkerId}/${workListStr}.json?access_token=${token}`
  return jsonReqThenInvalidate(url, id, callback);
}

/**
 */
export function saveOrderItems(token, wmId, changes, callback) {
  const url = `api/order_chg_goods/${wmId}.json?access_token=${token}`;
  return jsonReqThenInvalidate(url, wmId, callback, changes);
}

/**
 */
export function orderChgStore(token, wmId, store_id, old_store_id, reason, callback) {
  const url = `api/order_chg_store/${wmId}/${store_id}/${old_store_id}.json?access_token=${token}&reason=${reason}`;
  return getReqThenInvalidate(url, wmId, callback);
}

export function orderAuditRefund(token, id, task_id, is_agree, reason, log_money, callback) {
  const url = `api/order_audit_refund/${id}.json?access_token=${token}`;
  const agree_code = is_agree ? Cts.REFUND_AUDIT_AGREE : Cts.REFUND_AUDIT_REFUSE;
  return jsonReqThenInvalidate(url, id, callback, {agree_code, reason, task_id, log_money});
}

export function orderToInvalid(token, id, reason_key, custom, callback) {
  const url = `api/order_set_invalid/${id}.json?access_token=${token}`;
  return jsonReqThenInvalidate(url, id, callback, {reason_key, custom});
}

export function orderCallShip(token, id, way, callback) {
  const url = `api/order_dada_start/${id}/${way}.json?access_token=${token}`;
  return getReqThenInvalidate(url, id, callback);
}

export function orderCancelZsDelivery(token, id, callback) {
  const url = `api/cancel_zs_delivery/${id}.json?access_token=${token}`;
  return getReqThenInvalidate(url, id, callback);
}

export function orderCancel(token, id, callback) {
  const url = `api/cancel_order/${id}.json?access_token=${token}`;
  return getReqThenInvalidate(url, id, callback);
}

export function orderAddTodo(token, id, taskType, remark, callback) {
  const url = `api/order_waiting_list/${id}.json?task_type=${taskType}&access_token=${token}&remark=${remark}`;
  return getWithTpl2(url, (json) => {
      callback(json.ok, json.reason, json.obj)
    }, (error) => callback(false, "网络错误, 请稍后重试")
  )
}

export function orderAuditUrging(token, id, task_id, reply_type, custom, callback) {
  const url = `api/order_audit_urging/${id}.json?access_token=${token}`;
  return jsonReqThenInvalidate(url, id, callback, {reply_type, custom, task_id});
}

export function orderUrgingReplyReasons(token, id, task_id, callback) {
  const url = `api/order_urging_replies/${id}.json?access_token=${token}`;
  return jsonWithTpl2(url, {task_id}, (json) => {
      callback(json.ok, json.reason, json.obj)
    }
    , (error) => callback(false, "网络错误, 请稍后重试"));
}

export function getRemindForOrderPage(token, orderId, callback) {
  return getWithTpl2(`api/list_notice_of_order/${orderId}?access_token=${token}`,
    (json) => {
      let {ok, desc, obj} = json;
      callback(ok, desc, obj);
    }, (error) => callback(false, "网络错误, 请稍后重试", {})
  )
}

export function orderUpdateFailure() {
  return {
    type: ORDER_UPDATE_FAILURE,
  }

}

export function orderUpdateSuccess() {
  return {
    type: ORDER_UPDATE_SUCCESS,
  }
}

export function orderUpdateRequest() {
  return {
    type: ORDER_UPDATE_REQUEST
  }
}

/**
 *
 */
export function updateOrder(userId, username, email, sessionToken) {
  return dispatch => {
    dispatch(orderUpdateRequest())
    return appAuthToken.getSessionToken(sessionToken)
      .then((token) => {
        return BackendFactory(token).updateProfile(userId,
          {
            username: username,
            email: email
          }
        )
      })
      .then(() => {
        dispatch(orderUpdateSuccess())
        dispatch(getOrder())
      })
      .catch((error) => {
        dispatch(orderUpdateFailure(error))
      })
  }
}


export function saveOrderDelayShip(data, token, callback) {
  return dispatch => {
    const url = `api/order_delay_ship.json`;
    let data_arr = [];
    data_arr.push(`access_token=${token}`);
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        let val = data[key];
        data_arr.push(`${key}=${val}`);
      }
    }
    let params = data_arr.join('&&');
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url, params))
      .then(resp => resp.json())
      .then(resp => {
        if (!resp.ok) {
          ToastShort(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        ToastShort(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function orderWayRecord(orderid, token, callback) {
  return dispatch => {
    const url = `api/get_order_ships/${orderid}?access_token=${token}`;
    getWithTpl(url,
      (json) => {
        if (json.ok) {
          callback(true, json.desc, json.obj);
        } else {
          callback(false, '数据获取失败');
        }

      },
      (error) => {
        callback(false, '网络错误' + error)

      }
    )
  }
}

export function orderChangeLog(orderid, token, callback) {
  return dispatch => {
    const url = `api/get_order_change_log/${orderid}?access_token=${token}`;
    getWithTpl(url,
      (json) => {
        if (json.ok) {
          callback(true, json.desc, json.obj);
        } else {
          callback(false, '数据获取失败');
        }
      },
      (error) => {
        callback(false, '网络错误' + error)
      }
    )

  }
}

export function addTipMoney(order_id, money, token, callback) {
  return dispatch => {
    const url = `api/order_dada_tips/${order_id}/${money}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function addTipMoneyNew(shipId, addMoneyNum, accessToken, callback) {
  return dispatch => {
    const url = `v1/new_api/delivery/add_tips/${shipId}/${addMoneyNum}?access_token=${accessToken}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function cancelReasonsList(ship_id, order_id, token, callback) {
  return dispatch => {
    const url = `api/third_ship_cancel_reasons/${ship_id}/${order_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function cancelShip(ship_id, reason_id, order_id, token, callback) {
  const url = `api/third_ship_cancel/${ship_id}/${reason_id}/${order_id}.json?access_token=${token}`;
  return jsonReqThenInvalidate(url, order_id, callback);
}

export function deliveryFailedAudit(token, id, data, callback) {
  const url = `api/delivery_failed_audit.json?access_token=${token}`;
  return jsonReqThenInvalidate(url, id, callback, data);
}

export function fetchPrintHexStr(wmId, callback) {
  const api = `/api/get_blue_print_bytes/${wmId}?access_token=${this.global.accessToken}`;

  if (typeof callback !== 'function') {
    callback = (ok, hex) => {
    }
  }
  HttpUtils.get.bind(this)(api).then(res => {
    callback(true, res.hex);
  }, (ok, reason, obj) => {
    ToastShort("获取远程打印格式失败，使用本地格式打印")
    callback(false)
  })
}

