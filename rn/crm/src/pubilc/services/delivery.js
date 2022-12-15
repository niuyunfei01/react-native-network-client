'use strict';
import HttpUtils from "../util/http";

//进入下单页前获取配送信息
export async function getDeliveryList(access_token, order_id, store_id, vendor_id, is_addition = 0) {
  const api = `/v4/wsb_delivery/pre_call_delivery/${order_id}?access_token=${access_token}`;
  return HttpUtils.get(api, {
    weight: 0,
    remark: '',
    add_tips: '',
    expect_time: '',
    order_money: 0,
    vendor_id,
    store_id,
    is_addition,
  })
}

