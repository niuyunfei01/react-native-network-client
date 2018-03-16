'use strict';
import {
  jsonWithTpl,
  jsonWithTpl2
} from "../../util/common";
import AppConfig from '../../config.js';
import FetchEx from "../../util/fetchEx";
import {
  ToastLong
} from '../../util/ToastUtils';

const {
  GET_NAME_PRICES,
  GET_PRODUCT_DETAIL,
  GET_VENDOR_TAGS,
  ACTIVITY_VENDOR_TAGS,
  GET_MANAGE_SELECT,
} = require('../../common/constants').default;
export function saveVendorTags(json) {
  return {
    type: ACTIVITY_VENDOR_TAGS,
    json:json,
  }
}
export function saveMangeSelect(id,platformId) {
  return {
    type: GET_MANAGE_SELECT,
    selectId:id,
    platformId:platformId
  }
}
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

export function fetchProductDetail(product_id, _v_id, token, callback) {
  return dispatch => {
    const url = `api/get_product_detail/${product_id}/${_v_id}.json?access_token=${token}`;
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
        callback({
          ok: false,
          desc: error.message
        });
      });
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
        callback({
          ok: false,
          desc: error.message
        });
      });
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
        callback({
          ok: false,
          desc: error.message
        });
      });
  }
}

export function productSave(data, token, callback) {
  let url = `api/product_save.json?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {
      callback(json.ok, json.reason, json.obj);
    },
    (error) => {
      callback(error, "网络错误, 请稍后重试")
    }
  )

}
export function newProductSave(data, token, callback) {
  let url = `api/up_product_task.json?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
  )

}

export function batchPriceSave(vendor_id, data, token, callback) {
  let url = `api/edit_store_product/${vendor_id}?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {
       callback(json.ok, json.reason, json.obj);
    },
    (error) => {
      callback(error, "网络错误, 请稍后重试")
    }
  )
}

export function fetchApplyRocordList(viewStoreId, audit_status,page,token,callback) {

  return dispatch => {
    const url = `api/store_audit_list/${viewStoreId}/${audit_status}/${page}.json?access_token=${token}`;
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

function receiveVendorTags(_v_id, vendor_tags = {}) {
  return {
    type: GET_VENDOR_TAGS,
    _v_id: _v_id,
    store_tags: vendor_tags.store_tags,
    basic_category: vendor_tags.basic_category,
  }
}

/**
 *
 * @param image_info
 * @param callback
 * @param file_model_name
 * @returns {function(*)}
 * resp => {status: '1',
          fieldname: 'photo',
          fspath: '/files/201712/thumb_s/09e536ba4aa_1204.jpg',
          file_id: '30641',
          message: '<div class="ui-upload-filelist" style="float:left;"><img src="/files/201712/thumb_s/09e536ba4aa_1204.jpg" width="100px" height="100px"/><br/><input type="hidden" name="data[Uploadfile][30641][id]" value="30641"></div>'
          }
 */
export function uploadImg(image_info, callback, file_model_name = 'Product') {

  let formData = new FormData();
  let {
    uri,
    name
  } = image_info;
  let photo = {
    uri: uri,
    type: 'application/octet-stream',
    name: name
  };

  formData.append("file_post_name", 'photo');
  formData.append("file_model_name", file_model_name);
  formData.append("no_db", 0);
  formData.append("return_type", 'json');
  formData.append("data_id", 0);
  formData.append("photo", photo);
  console.log('formData -> ', formData);

  const url = `uploadfiles/upload`;

  return dispatch => {
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.post(url, formData))
      .then(resp => resp.json())
      .then(resp => {
        let ok = false;
        let desc = '';
        console.log('uploadImg resp --->', resp);
        let {
          status,
          fspath,
          file_id,
          message
        } = resp;
        if (parseInt(status) === 1) {
          ok = true;
          desc = '图片上传成功';
        } else {
          desc = message;
        }
        callback({
          ok,
          desc,
          obj: {
            file_id,
            fspath
          }
        });
      }).catch((error) => {
        console.log('error -> ', error);
        callback({
          ok: false,
          desc: '图片上传失败'
        });
      });
  }



}
export function getGoodsProduct(task_id, token, callback) {
  let url = `api/get_up_goods_task/${task_id}.json?access_token=${token}`;
  return jsonWithTpl2(url, (json) => {
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
  )

}
export function getUnRelationGoodsStores(product_id, token, callback) {
  let url = `api/get_un_relation_goods_stores/${product_id}.json?access_token=${token}`;
  return jsonWithTpl2(url, (json) => {
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
  )

}


export function RelateToStore(data, token, callback) {
  let url = `api/relation_goods_to_store.json?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {
        callback(json.ok, json.reason, json.obj);
      },
      (error) => {
        callback(error, "网络错误, 请稍后重试")
      }
  )

}

export function UpdateWMGoods(product_id, include_img, token, callback) {
  return dispatch => {
    const url = `api/update_wm_sku/${product_id}/${include_img}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp);
        }).catch((error) => {
          ToastLong(error.message);
          callback({ok: false, desc: error.message});
        }
    );
  }
}

export function fetchListVendorTags(vendor_id,token,callback) {
  return dispatch => {
    let url = `api/list_vendor_tags/${vendor_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          dispatch(saveVendorTags({[vendor_id]:resp.obj}));
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}

export function fetchListVendorGoods(vendor_id,platform_id,sortId,token,callback) {
  return dispatch => {
    let url = `api/list_vendor_goods/${vendor_id}/${platform_id}/${sortId}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          dispatch(saveMangeSelect(vendor_id,platform_id));
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}
export function fetchListStoresGoods(vendor_id,product_id,token,callback) {
  return dispatch => {
    let url = `api/list_stores_goods/${vendor_id}/${product_id}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}


export function fetchStoreChgPrice(store_id,product_id,new_price_cents,token,callback) {
  return dispatch => {
    let url = `api/store_chg_price/${store_id}/${product_id}/${new_price_cents}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}

export function editProdReferPrice(data, token, callback) {
  let url = `api/edit_prod_refer_price.json?access_token=${token}`;
  return jsonWithTpl2(url, data, (json) => {
      callback(json.ok, json.reason, json.obj);
    },
    (error) => {
      callback(error, "网络错误, 请稍后重试")
    }
  )
}




export function queryUpcCode(code,token,callback) {
  return dispatch => {
    let url = `/api/query_product_by_code/${code}.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url))
        .then(resp => resp.json())
        .then(resp => {
          callback(resp.ok,resp.desc,resp.obj);
        }).catch((error) => {
          callback({ok: false, desc: error.message});
        }
    );
  }
}
