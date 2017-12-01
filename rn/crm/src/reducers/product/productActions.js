'use strict';
import {jsonWithTpl,jsonWithTpl2} from "../../util/common";
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {ToastLong} from '../../util/ToastUtils';

const {
  GET_NAME_PRICES,
  GET_PRODUCT_DETAIL,
  GET_VENDOR_TAGS,
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

export function fetchVendorTags(_v_id, token, callback) {
  return dispatch => {
    const url = `api/get_vendor_tags/${_v_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
      .then(resp => resp.json())
      .then(resp => {
        if (resp.ok) {
          let vendor_tags = resp.obj;
          dispatch(receiveVendorTags(_v_id, vendor_tags));
        }
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}

export function productSave(data,token,callback) {
    let url = `api/product_save.json?access_token=${token}`;
    return jsonWithTpl2(url, data, (json) => {
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
    )

 // return dispatch => {
 //   FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, data))
 //   .then(res => res.json())
 //   .then(json => {
 //     callback(json)
 //   }).catch((error) => {
 //     callback(error)
 //   });
 // }

}



function receiveVendorTags(_v_id, vendor_tags = {}) {
  return {
    type: GET_VENDOR_TAGS,
    _v_id: _v_id,
    store_tags: vendor_tags.store_tags,
    basic_category: vendor_tags.basic_category,
  }
}











