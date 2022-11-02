'use strict';
import HttpUtils from "../util/http";
import type {ICheckLoginParams, ICheckSendMobileCodeParams} from "../../reducers/data.d";

export async function sendMobileCode(params: ICheckSendMobileCodeParams[]) {
  return HttpUtils.get('/v4/wsb_user/getMobileCode', params)
}

export async function Login(params: ICheckLoginParams[]) {
  return HttpUtils.get('/v4/wsb_user/login', params, false, false, false)
}

