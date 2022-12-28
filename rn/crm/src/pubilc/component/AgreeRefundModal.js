import React from 'react'
import tool from "../util/tool";
import {hideModal, showModal, ToastShort} from "../util/ToastUtils";
import HttpUtils from "../util/http";
import JbbAlert from "./JbbAlert";


class AgreeRefundModal extends React.Component {
  state = {
    loading: false,
    show_modal: false,
    title: '',
    actionText: '',
    closeText: '',
    cs_phone: '',
    rider_phone: '',
  }

  static getInfo = (order_id, accessToken, fetchData = undefined) => {
    showModal('请求中...')
    const api = `/v4/wsb_delivery/preCancelDelivery`;
    HttpUtils.get.bind(this.props)(api, {
      order_id: order_id,
      access_token: accessToken
    }).then((res) => {
      if (tool.length(res?.alert_msg) <= 0) {
        hideModal()
        return this.goCancelDelivery();
      }
      let actionText = '';
      let closeText = '';
      if (res?.btn_list?.btn_cancel) {
        closeText = '取消';
      }
      if (res?.btn_list?.btn_contact_rider) {
        closeText = '联系骑手';
      }
      if (res?.btn_list?.btn_confirm) {
        actionText = '确定';
      }
      if (res?.btn_list?.btn_contact_cs || res?.btn_list?.btn_contact_cs_big) {
        actionText = '联系客服';
      }
      if (res?.btn_list?.btn_think_again) {
        actionText = '再想想';
      }
      hideModal()
      JbbAlert.show({
        title: res?.alert_msg,
        actionText: actionText,
        closeText: closeText,
        onPress: () => {
          fetchData && fetchData()
        },
      })

    }).catch((e) => {
      ToastShort(e?.reason)
    })
  }

}

export default AgreeRefundModal
