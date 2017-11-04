'use strict'
import {jsonWithTpl} from "../../util/common";

const {
  GET_NAME_PRICES
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













