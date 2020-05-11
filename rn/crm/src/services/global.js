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
