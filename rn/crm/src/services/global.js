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
export async function queryPlatform(user_id) {
    return HttpUtils.apiBase('GET', `/v1/new_api/ExtStores/get_ext_stores_by_owner_id?user_id=${user_id}`)
}
export async function unbindExt(params:{}) {
    return HttpUtils.apiBase('POST', `/v1/new_api/ExtStores/unbindExt`,params)
}
export async function checkBindExt(params) {
    return HttpUtils.apiBase('GET', `/v1/new_api/ExtStores/get_check_is_bind_ext?token=${params.token}&user_id=${params.user_id}`)
}
export async function getStoreDelivery(ext_store_id) {
    return HttpUtils.apiBase('GET', `/v1/new_api/ExtStores/get_ext_stores_delivery?ext_store_id=${ext_store_id}`)
}
export async function updateStoresDelivery(params) {
    return HttpUtils.apiBase('POST', `/v1/new_api/Stores/update_stores_delivery`,params)
}
export async function addStoresDelivery(params) {
    return HttpUtils.apiBase('POST', `/v1/new_api/Delivery/store`,params)
}
export async function getDeliveryList(store_id) {
    return HttpUtils.apiBase('GET', `/v1/new_api/Delivery/index?store_id=${store_id}`)
}
