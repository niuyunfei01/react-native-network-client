import React from 'react'
import {Modal, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import {Button} from "react-native-elements";
import HttpUtils from "../util/http";
import {hideModal, showModal, ToastShort} from "../util/ToastUtils";

let that = null, interval = null

class ZsAlertModal extends React.PureComponent {
  constructor(props) {
    super(props);
    that = this;
    this.state = {
      show: false,
      order_id: '',
      access_token: '',
      to_call_delivery: undefined,
      left_time: 0
    }
  }

  static checkZsOrderCallDelivery = (order_id, access_token = '', to_call_delivery = undefined) => {
    that.setState({order_id, access_token, to_call_delivery})
    showModal('加载中...')
    const api = `/v4/wsb_order/checkZsOrderCallDelivery/${order_id}?access_token=${access_token}`
    HttpUtils.get.bind(that.props)(api).then((res) => {
      if (res?.left_time <= 0) {
        return to_call_delivery && to_call_delivery()
      }
      that.setState({
        show: true,
        left_time: res?.left_time
      }, () => {
        that.startInterval()
      })
      hideModal()
    }, (res) => {
      ToastShort(res?.reason)
      that.closeModal()
      hideModal()
    }).catch((res) => {
      ToastShort(res?.reason)
      that.closeModal()
      hideModal()
    })
  }

  componentWillUnmount() {
    this.closeModal()
  }

  timeOut = () => {
    let {left_time, to_call_delivery} = this.state;
    this.setState({
      left_time: left_time - 1
    }, () => {
      if (this.state.left_time <= 0) {
        this.closeModal()
        to_call_delivery && to_call_delivery()
      }
    })
  }

  startInterval = () => {
    interval = setInterval(this.timeOut, 1000)
  }

  closeModal = () => {
    clearInterval(interval)
    this.setState({
      show: false,
    })
  }


  render = () => {
    let {show, left_time} = this.state;
    let str = '0秒';

    if (left_time > 0 && left_time < 60) {
      str = Math.trunc(left_time) + '秒'
    } else if (left_time >= 60) {
      let m = Math.trunc(left_time / 60)
      let s = Math.trunc(left_time - (m * 60))
      str = m + ':' + s + '秒'
    }

    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={() => this.closeModal()}
             maskClosable transparent={true}
             animationType="slide"
             visible={show}>
        <TouchableOpacity onPress={() => this.closeModal()} style={[{
          backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1
        }]}>
          <TouchableHighlight style={{
            backgroundColor: colors.white,
            borderRadius: 15,
            width: '88%',
          }}>
            <View style={{padding: 20,}}>

              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.color333,
                    fontWeight: 'bold',
                    marginVertical: 10,
                  }}>剩余{str}平台可转自配，请等待。 </Text>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>

                <Button title={'知道了'}
                        onPress={() => this.closeModal()}
                        containerStyle={{
                          flex: 1,
                          borderRadius: 20,
                          length: 40,
                        }}
                        buttonStyle={{
                          backgroundColor: colors.main_color,
                        }}
                        titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
              </View>
            </View>

          </TouchableHighlight>
        </TouchableOpacity>
      </Modal>
    )
  }
}


export default ZsAlertModal
