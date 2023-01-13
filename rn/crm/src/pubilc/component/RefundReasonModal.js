import React from 'react'
import {ActivityIndicator, Keyboard, Text, TouchableWithoutFeedback, View} from 'react-native'
import colors from "../styles/colors";
import tool from "../util/tool";
import JbbModal from "./JbbModal";
import {Button, CheckBox} from "react-native-elements";
import {check_circle_icon, cross_icon, radioUnSelected} from "../../svg/svg";
import {SvgXml} from "react-native-svg";
import {TextArea} from "../../weui";
import HttpUtils from "../util/http";
import {hideModal, showModal, ToastShort} from "../util/ToastUtils";

let that = null;

class RefundReasonModal extends React.PureComponent {
  constructor(props) {
    super(props);
    that = this;
    this.state = {
      show: false,
      is_loading: false,
      order_id: '',
      store_id: '',
      access_token: '',
      fetchData: undefined,
      refund_reason: '',
      input_refund_reason: '',
      reason_list: []
    }
  }

  static fetchRefundReasonList = (store_id, order_id, access_token = '', fetchData = undefined) => {
    that.setState({
      is_loading: false,
      order_id,
      store_id,
      access_token,
      fetchData,
    })

    let params = {
      order_id,
      store_id,
      access_token,
    }
    const api = `/v4/wsb_refund/reason_list`
    HttpUtils.get.bind(that.props)(api, params).then((res) => {
      that.setState({
        show: true,
        is_loading: false,
        reason_list: res
      })
    }, (res) => {
      ToastShort(res?.reason)
      that.closeModal()
    }).catch((res) => {
      ToastShort(res?.reason)
      that.closeModal()
    })
  }
  closeModal = () => {
    this.setState({
      refund_reason: '',
      show: false,
    })
  }

  submit = () => {
    let {refund_reason, remark_input_value, access_token, order_id, fetchData} = this.state
    const api = `/v4/wsb_refund/order_refund`

    if (tool.length(refund_reason) <= 0) {
      return ToastShort('请选择拒绝原因', 100)
    }

    if (refund_reason === '其他' && tool.length(remark_input_value) <= 0) {
      return ToastShort('请填写拒绝原因', 100)
    }

    let params = {
      agree: 0,
      access_token,
      order_id,
      reason: refund_reason === '其他' ? remark_input_value : refund_reason
    }
    this.closeModal()
    showModal("提交中...")
    HttpUtils.get.bind(this.props)(api, params).then(() => {
      hideModal()
      fetchData && fetchData()
    }, (res) => {
      ToastShort(res?.reason, 0)
    }).catch((res) => {
      ToastShort(res?.reason, 0)
    })
  }

  render() {
    let {show, is_loading, refund_reason, remark_input_value, reason_list} = this.state;
    if (!show) {
      return null;
    }
    return (
      <JbbModal
        visible={show}
        HighlightStyle={{padding: 0}}
        onClose={this.closeModal}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss()
        }}>
          <View>
            <If condition={is_loading}>
              <View style={{
                height: 200,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ActivityIndicator color={colors.color666} size={60}/>
              </View>
            </If>
            <If condition={!is_loading}>
              <View style={{marginBottom: 20}}>
                <View style={{
                  flexDirection: 'row',
                  padding: 12,
                  paddingBottom: 5,
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text
                    style={{fontWeight: 'bold', fontSize: 14, color: colors.color333, lineHeight: 20, marginLeft: 8}}>
                    建议先联系顾客协商撤销退款，避免顾客投诉
                  </Text>
                  <SvgXml onPress={this.closeModal} xml={cross_icon()}/>
                </View>
                <View style={{marginBottom: 10, marginLeft: 10}}>
                  <For index='index' each='info' of={reason_list}>
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 7,
                    }}>
                      <CheckBox
                        size={18}
                        checkedIcon={<SvgXml xml={check_circle_icon()} width={18} height={18}/>}
                        uncheckedIcon={<SvgXml xml={radioUnSelected()} width={18} height={18}/>}
                        checkedColor={colors.main_color}
                        containerStyle={{margin: 0, padding: 0}}
                        checked={refund_reason === info?.label}
                        onPress={() => {
                          this.setState({refund_reason: info?.label})
                        }}
                      />
                      <Text onPress={() => {
                        this.setState({refund_reason: info?.label})
                      }} style={{
                        fontSize: 14,
                        color: colors.color333,
                      }}>{info.label} </Text>
                      <If condition={tool.length(info?.tip) > 0}>
                        <View
                          style={{borderRadius: 2, paddingHorizontal: 4, marginLeft: 4, backgroundColor: '#FF8309'}}>
                          <Text style={{fontSize: 11, color: colors.white, lineHeight: 16}}> {info?.tip} </Text>
                        </View>
                      </If>
                    </View>
                  </For>
                </View>
                <View style={{paddingHorizontal: 20,}}>
                  <If condition={refund_reason === "其他"}>
                    <TextArea
                      multiline={true}
                      numberOfLines={3}
                      maxLength={30}
                      value={remark_input_value}
                      onChange={(remark_input_value) => this.setState({remark_input_value})}
                      showCounter={false}
                      placeholder={'请填写拒绝原因'}
                      placeholderTextColor={colors.color999}
                      underlineColorAndroid="transparent" //取消安卓下划线
                      style={{
                        padding: 10,
                        marginBottom: 12,
                        height: 100,
                        fontSize: 14,
                        color: colors.color333,
                        backgroundColor: colors.f5,
                        borderRadius: 4
                      }}
                    >
                    </TextArea>
                  </If>
                  <Button title={'提 交'}
                          onPress={this.submit}
                          buttonStyle={[{
                            backgroundColor: colors.main_color,
                            borderRadius: 21,
                            length: 42,
                          }]}
                          titleStyle={{color: colors.f7, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
                </View>
              </View>
            </If>
          </View>
        </TouchableWithoutFeedback>
      </JbbModal>
    )
  }
}


export default RefundReasonModal
