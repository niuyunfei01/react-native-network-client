import BaseComponent from "../common/BaseComponent";
import React from "react";
import {DeviceEventEmitter} from "react-native";
import {connect} from 'react-redux'
import native from "../../pubilc/util/native";
import config from '../../pubilc/common/config'
import EmptyData from "../common/component/EmptyData";
import HttpUtils from "../../pubilc/util/http";
import {ToastLong} from "../../pubilc/util/ToastUtils";
import Synthesizer from "../../pubilc/component/react-native-speech-iflytek";

function mapStateToProps(state) {
  const {global} = state;
  return {global};
}

class OrderSetReady extends BaseComponent {

  constructor(props) {
    super(props);
    this.state = {
      orderIds: [],
    }
  }

  UNSAFE_componentWillMount() {
    const self = this
    // 监听扫描订单条码
    if (this.listenScanBarCode) {
      this.listenScanBarCode.remove()
    }
    const accessToken = self.props.global.accessToken
    this.listenScanBarCode = DeviceEventEmitter.addListener(config.Listener.KEY_SCAN_ORDER_BAR_CODE, function ({orderId}) {
      const api = `api/order_set_ready_by_id/${orderId}.json?access_token=${accessToken}`
      HttpUtils.get.bind(self.props)(api, {from: 'ORDER_SCAN'}).then((res) => {
        let text = res.msg
        ToastLong(text)
        Synthesizer.start(text)
      }).catch((resp) => {
        let text = `打包失败, ${resp.reason}`
        ToastLong(text)
        Synthesizer.start(text)
      })
    });
  }

  componentDidMount() {
    super.componentDidMount();
  }

  componentWillUnmount() {
    if (this.listenScanBarCode) {
      this.listenScanBarCode.remove()
    }
  }

  render() {
    return <EmptyData/>;
  }
}

export default connect(mapStateToProps)(OrderSetReady)
