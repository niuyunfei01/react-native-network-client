'use strict'
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import { getWithTpl, jsonWithTpl } from '../../util/common'
import Cts from "../../Cts";
import { ToastShort } from "../../util/ToastUtils";

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

export function printInCloud(sessionToken, orderId, callback) {
  return dispatch => {
    const url = `api/print_in_cloud/${orderId}.json?access_token=${sessionToken}`
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          dispatch(msgPrintInCloudDone({orderId, printTimes: json.obj}))
        }
        callback(json.ok, json.reason, json.obj)
      }).catch((error) => {
      console.log('print_order error:', error)
      callback(false, "打印失败, 请检查网络稍后重试")
    });
  }
}

export function orderEditItem(item) {
  return dispatch => {
    dispatch({
      type: ORDER_EDIT_ITEM,
      item,
    })
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
  callback = callback || function(){};
  return dispatch => {
    dispatch(getOrderRequest());
    const url = `api/order_by_id/${orderId}.json?access_token=${sessionToken}&op_ship_call=1`;
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

/**
 */
export function saveOrderBaisc(token, orderId, changes, callback) {
  return dispatch => {
    const url = `api/order_chg_basic/${orderId}.json?access_token=${token}`
    jsonWithTpl(url, changes, (json) => {
        if (json.ok) {
          dispatch({type: ORDER_INVALIDATED, id: orderId});
        }
        callback(json.ok, json.reason, json.obj)
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

/**
 */
export function saveOrderItems(token, wmId, changes, callback) {
  return dispatch => {
    const url = `api/order_chg_goods/${wmId}.json?access_token=${token}`;
    jsonWithTpl(url, changes, (json) => {
        if (json.ok) {
          dispatch({type: ORDER_INVALIDATED, id: wmId});
          callback(true, json.reason, json.obj);
        } else {
          callback(false, json.reason, json.obj);
        }
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

/**
 */
export function orderChgStore(token, wmId, store_id, old_store_id, reason, callback) {
  return dispatch => {
    const url = `api/order_chg_store/${wmId}/${store_id}/${old_store_id}.json?access_token=${token}&reason=${reason}`;
    getWithTpl(url, (json) => {
        if (json.ok) {
          dispatch({type: ORDER_INVALIDATED, id: wmId});
          callback(true, json.reason, json.obj);
        } else {
          callback(false, json.reason, json.obj);
        }
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

export function orderAuditRefund(token, id, task_id, is_agree, reason, callback) {
  return dispatch => {
    const url = `api/order_audit_refund/${id}.json?access_token=${token}`;
    const agree_code = is_agree ? Cts.REFUND_AUDIT_AGREE : Cts.REFUND_AUDIT_REFUSE;
    jsonWithTpl(url, {agree_code, reason, task_id}, (json) => {
        if (json.ok) {
          dispatch({type: ORDER_INVALIDATED, id: id});
        }
        callback(json.ok, json.reason, json.obj)
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

export function orderToInvalid(token, id, reason_key, custom, callback) {
  return dispatch => {
    const url = `api/order_set_invalid/${id}.json?access_token=${token}`;
    jsonWithTpl(url, {reason_key, custom}, (json) => {
        if (json.ok) {
          dispatch({type: ORDER_INVALIDATED, id: id});
        }
        callback(json.ok, json.reason, json.obj)
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

export function orderAddTodo(token, id, taskType, remark, callback) {
  return dispatch => {
    const url = `api/order_waiting_list/${id}.json?task_type=${taskType}&access_token=${token}&remark=${remark}`;
    getWithTpl(url, (json) => {
        callback(json.ok, json.reason, json.obj)
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

export function orderAuditUrging(token, id, task_id, reply_type, custom, callback) {
  return dispatch => {
    const url = `api/order_audit_urging/${id}.json?access_token=${token}`;
    jsonWithTpl(url, {reply_type, custom, task_id}, (json) => {
        callback(json.ok, json.reason, json.obj)
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

export function orderUrgingReplyReasons(token, id, task_id, callback) {
  return dispatch => {
    const url = `api/order_urging_replies/${id}.json?access_token=${token}`;
    jsonWithTpl(url, {task_id}, (json) => {
        callback(json.ok, json.reason, json.obj)
      }, (error) => {
        console.log('error:', error);
        callback(false, "网络错误, 请稍后重试")
      }
    )
  }
}

export function getRemindForOrderPage(token, orderId, callback) {
  return dispatch => {
    getWithTpl(`api/list_notice_of_order/${orderId}?access_token=${token}`,
      (json) => {
        if (json.ok) {
          callback(true, json.obj)
        } else {
          callback(false, "数据获取失败");
        }
      },
      (error) => {
        callback(false, "网络错误：" + error)
      }
    )
  }
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
        callback(false,'网络错误'+error)

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
        callback(false,'网络错误'+error)

      }
    )

  }
}
