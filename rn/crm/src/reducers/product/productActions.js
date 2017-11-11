'use strict';
import {jsonWithTpl} from "../../util/common";
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';

const {
  GET_NAME_PRICES,
  GET_PRODUCT_DETAIL,
} = require('../../common/constants').default;


export function getProdPricesList(token, esId, platform, storeId, callback) {
  return dispatch => {
    const url = `api/on_sale_prod_prices/${esId}/${platform}/${storeId}.json?access_token=${token}`;
    const key = keyOfProdInfos(esId, platform, storeId);
    jsonWithTpl(url, {}, (json) => {
      if (json.ok) {
        callback(true, json.reason, json.obj.prods);
        dispatch({
          type: GET_NAME_PRICES,
          key: key,
          prods: json.obj.prods,
        });
      } else {
        callback(false, json.reason);
      }
    }, (error) => {
      callback(false, error);
    })
  }
}

export function keyOfProdInfos(esId, platform, storeId) {
  return `${esId}_${platform}_${storeId}`;
}

export function fetchProductDetail(product_id, token, callback) {
  return dispatch => {
    const url = `api/get_product_detail/${product_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          let detail = resp.obj;
          dispatch(receiveProductDetail(product_id, detail));
        } else {
          dispatch(receiveProductDetail(product_id));
          ToastLong(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        dispatch(receiveProductDetail(product_id));
        ToastLong(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}

function receiveProductDetail(product_id, detail = {}) {
  return {
    type: GET_PRODUCT_DETAIL,
    product_id: product_id,
    product_detail: detail,
  }
}

export function fetchVendorProduct(_v_id, product_id, token, callback) {
  return dispatch => {
    const url = `api/get_vendor_product/${_v_id}/${product_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (!resp.ok) {
          ToastLong(resp.desc);
        }
        callback(resp);
      }).catch((error) => {
        ToastLong(error.message);
        callback({ok: false, desc: error.message});
      }
    );
  }
}







