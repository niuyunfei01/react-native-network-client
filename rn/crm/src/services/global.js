'use strict';
import HttpUtils from "../util/http";
import type {ICheckRegisterParams} from "../reducers/data.d";

export async function checkMessageCode(params: ICheckRegisterParams[]) {
  return HttpUtils.apiBase('POST', '/v1/new_api/User/check_register', params)
}

export async function addStores(params: {}) {
  return HttpUtils.apiBase('POST', '/v1/new_api/Stores/save_stores', params)
}

export async function queryAddress() {
  return HttpUtils.apiBase('GET', '/v1/new_api/Address/get_address')
}

export async function queryPlatform(stores_id) {
  return HttpUtils.apiBase('GET', `/v1/new_api/ExtStores/get_ext_stores_by_stores_id?stores_id=${stores_id}`)
}

export async function unbindExt(params: {}) {
  return HttpUtils.apiBase('POST', `/v1/new_api/ExtStores/unbindExt`, params)
}

export async function checkBindExt(params) {
  return HttpUtils.apiBase('GET', `/v1/new_api/ExtStores/get_check_is_bind_ext?token=${params.token}&user_id=${params.user_id}`)
}

export async function getStoreDelivery(ext_store_id) {
  return HttpUtils.apiBase('GET', `/v1/new_api/ExtStores/get_ext_stores_delivery?ext_store_id=${ext_store_id}`)
}

export async function updateStoresDelivery(token, ext_store_id, params) {
  return HttpUtils.apiBase('PUT', `/v1/new_api/ExtStores/update_stores_delivery?ext_store_id=${ext_store_id}&access_token=${token}`, params)
}

export async function addStoresDelivery(params) {
  return HttpUtils.apiBase('POST', `/v1/new_api/Delivery/store`, params)
}
