'use strict';
import HttpUtils from "../util/http";
import type {ICheckPhoneParams} from "../reducers/data.d";

export async function checkMessageCode(params: ICheckPhoneParams[]) {
    return HttpUtils.apiBase('POST', '/v1/api/User/check_register', params)
}

export async function addStores(params: {}) {
    return HttpUtils.apiBase('POST', '/v1/api/Stores/save_stores', params)
}

export async function queryAddress() {
    return HttpUtils.apiBase('GET', '/v1/api/Address/get_address')
}
