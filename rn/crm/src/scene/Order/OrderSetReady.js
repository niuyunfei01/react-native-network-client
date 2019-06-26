import BaseComponent from "../BaseComponent";
import React from "react";
import {DeviceEventEmitter} from "react-native";
import {connect} from 'react-redux'
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import config from '../../config'
import EmptyData from "../component/EmptyData";
import HttpUtils from "../../util/http";
import {ToastLong} from "../../util/ToastUtils";

function mapStateToProps(state) {
  const {global, user, mine} = state;
  return {global, user, mine};
}

class OrderSetReady extends BaseComponent {
  static navigationOptions = () => {
    return {
      headerStyle: {backgroundColor: '#59b26a', height: 40},
      headerTitleStyle: {color: '#fff', fontSize: 16},
      headerTitle: '扫码打包完成',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.toOrders()}
        />
      )
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      orderIds: [],
    }
  }

  componentWillMount() {
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
        native.speakText(text)
      }).catch((resp) => {
        let text = `打包失败, ${reason.reason}`
        ToastLong(text)
        native.speakText(text)
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