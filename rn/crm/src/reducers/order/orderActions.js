'use strict'
import {orderUrlWithId} from "../../api";
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

export function getOrderRequest () {
    return {
        type: GET_ORDER_REQUEST
    }
}
export function getOrderSuccess (json) {
    return {
        type: GET_ORDER_SUCCESS,
        payload: json
    }
}
export function getOrderFailure (json) {
    return {
        type: GET_ORDER_FAILURE,
        payload: json
    }
}

/**
 */
export function getOrder(sessionToken, orderId) {
    return dispatch => {
        dispatch(getOrderRequest())
        // store or get a sessionToken
        return fetch(orderUrlWithId(sessionToken, orderId))
            .then((res) => {
                // return res.json().then(function (resp) {
                //     if ((res.status === 200 || res.status === 201)) {
                //         console.log(resp)
                //         return resp
                //     } else {
                //         throw (resp)
                //     }
                // })
                return res.json()
            }).then( (res_data) => {
                console.log(res_data);
                return res_data;
            })
            .then((json) => {
                dispatch(getOrderSuccess(json))
            })
            .catch((error) => {
                dispatch(getOrderFailure(error))
            })
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
export function updateOrder (userId, username, email, sessionToken) {
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