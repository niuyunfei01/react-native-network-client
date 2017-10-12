'use strict'
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";

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
  ORDER_UPDATE_FAILURE

} = require('../../common/constants').default

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

/**
 */
export function
getOrder(sessionToken, orderId, callback) {
  return dispatch => {
    dispatch(getOrderRequest())
    const url = `api/order_by_id/${orderId}.json?access_token=${sessionToken}&op_ship_call=1`
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(res => res.json())
      .then(json => {
        dispatch(getOrderSuccess(json))
        const ok = json && json.id === orderId;
        callback(ok, ok ? json : "返回数据错误")
      }).catch((error) => {
        dispatch(getOrderFailure(error))
        console.log('getOrder error:', error)
        callback(false, "网络错误, 请稍后重试")
      });
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