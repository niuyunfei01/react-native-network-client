import React from 'react'
import {hideModal, showModal, ToastShort} from "../util/ToastUtils";
import HttpUtils from "../util/http";
import JbbAlert from "./JbbAlert";

class AgreeRefundModal extends React.Component {
  static getInfo = (store_id, order_id, accessToken, fetchData = undefined) => {
    showModal('请求中...')
    const api = `/v4/wsb_refund/refund_confirm`;
    HttpUtils.get.bind(this.props)(api, {
      store_id: store_id,
      order_id: order_id,
      access_token: accessToken
    }).then((res) => {
      hideModal()
      JbbAlert.show({
        title: res?.title,
        actionText: res?.actionText,
        closeText: res?.closeText,
        onPress: () => {
          showModal("提交中...")

          const api = `/v4/wsb_refund/order_refund`
          let params = {
            agree: 1,
            access_token: accessToken,
            order_id,
            reason: ''
          }
          HttpUtils.get.bind(this.props)(api, params).then(() => {
            hideModal()
            fetchData && fetchData()
          }, (res) => {
            ToastShort(res?.reason, 0)
          }).catch((res) => {
            ToastShort(res?.reason, 0)
          })

        },
      })

    }).catch((e) => {
      ToastShort(e?.reason)
    })
  }


}

export default AgreeRefundModal
