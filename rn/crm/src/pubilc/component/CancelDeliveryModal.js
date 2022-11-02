import React from 'react'
import PropTypes from 'prop-types'
import {Dimensions, Modal, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import {Button} from "react-native-elements";
import tool from "../util/tool";
import {hideModal, showModal} from "../util/ToastUtils";
import HttpUtils from "../util/http";
import Config from "../common/config";
import native from "../util/native";

const {height} = Dimensions.get("window")

class CancelDeliveryModal extends React.Component {
  static propTypes = {
    order_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    ship_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    accessToken: PropTypes.string,
    show_modal: PropTypes.bool,
    fetchData: PropTypes.func,
    onClose: PropTypes.func,
    onPress: PropTypes.func,
  }

  state = {
    show_modal: false,
    title: '',
    actionText: '',
    closeText: '',
    cs_phone: '',
    rider_phone: '',
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {order_id, show_modal} = nextProps;
    if (tool.length(order_id) <= 0 || Number(order_id) <= 0 || !show_modal) {
      return null;
    }
    showModal('请求中...')
    tool.debounces(() => {
      this.getInfo()
    })
  }

  getInfo = () => {
    let {order_id, accessToken} = this.props;
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
      this.setState({
        show_modal: true,
        title: res?.alert_msg,
        cs_phone: res?.cs_phone,
        rider_phone: res?.rider_phone,
        actionText: actionText,
        closeText: closeText,
      })
      hideModal()
    }).catch(() => {
      this.closeModal()
      hideModal()
    })
  }

  confirm = () => {
    this.closeModal()
    let {actionText, cs_phone} = this.state;
    switch (actionText) {
      case '确定':
        this.goCancelDelivery();
        break;
      case '再想想':
        break;
      case '联系客服':
        this.dialNumber(cs_phone);
        break;
    }
  }

  cancel = () => {
    this.closeModal()
    let {closeText, rider_phone} = this.state;
    switch (closeText) {
      case '取消':
        this.goCancelDelivery();
        break;
      case '联系骑手' :
        this.dialNumber(rider_phone);
        break;
    }
  }

  dialNumber = (phone) => {
    native.dialNumber(phone)
  }

  goCancelDelivery = () => {
    let {order_id, fetchData, ship_id} = this.props;
    this.closeModal();
    this.props.onPress(Config.ROUTE_ORDER_CANCEL_SHIP,
      {
        order: {id: order_id},
        ship_id: ship_id,
        onCancelled: () => {
          fetchData();
        }
      });
  }

  closeModal = () => {
    this.setState({
      show_modal: false,
      title: '',
      actionText: '',
      closeText: '',
    }, () => {
      this.props.onClose();
    })
  }


  render = () => {
    let {show_modal, title, closeText, actionText} = this.state;
    return (
      <Modal hardwareAccelerated={true}
             onRequestClose={this.closeModal}
             maskClosable transparent={true}
             animationType="fade"
             visible={show_modal}>
        <TouchableOpacity onPress={this.closeModal} style={[{
          backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1
        }]}>
          <TouchableHighlight style={{
            backgroundColor: colors.white,
            maxHeight: height * 0.8,
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
                  }}>{title} </Text>
              </View>

              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                <If condition={tool.length(closeText) > 0}>
                  <Button title={closeText}
                          onPress={this.cancel}
                          containerStyle={{
                            flex: 1,
                            borderRadius: 20,
                            length: 40,
                            marginRight: 10
                          }}
                          buttonStyle={{
                            backgroundColor: colors.f5,
                          }}
                          titleStyle={{color: colors.color666, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
                </If>
                <Button title={actionText}
                        onPress={this.confirm}
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

export default CancelDeliveryModal
