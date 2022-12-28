import React from 'react'
import PropTypes from 'prop-types'
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import tool from "../util/tool";
import JbbModal from "./JbbModal";
import {Button, CheckBox} from "react-native-elements";
import {check_circle_icon, cross_icon, radioUnSelected} from "../../svg/svg";
import {SvgXml} from "react-native-svg";
import {TextArea} from "../../weui";
import HttpUtils from "../util/http";

class RefundReasonModal extends React.Component {
  static propTypes = {
    accessToken: PropTypes.string,
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    show_add_tip_modal: PropTypes.bool,
    setState: PropTypes.func,
    fetchData: PropTypes.func,
  }

  state = {
    show_modal: false,
    is_loading: true,
    refund_reason: '',
    input_refund_reason: '',
    reason_list: [
      {label: '已和用户电话沟通', value: 1, tip: '推荐'},
      {label: '商品已开始制作', value: 2, tip: ''},
      {label: '商品已经打包完成', value: 3, tip: ''},
      {label: '商品正在配送中', value: 5, tip: ''},
      {label: '其他', value: 0, tip: ''},
    ]
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {id, show_add_tip_modal} = nextProps;
    if (tool.length(id) <= 0 || Number(id) <= 0 || !show_add_tip_modal || this.state.show_modal) {
      return null;
    }
    this.state.show_modal = true;
    this.fetchRefundReasonList()
  }

  fetchRefundReasonList = () => {
    const {accessToken = ''} = this.props;
    const api = `/v1/new_api/stores/sale_categories?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        is_loading: false,
        // reason_list: res
      })
    })
  }


  closeModal = () => {
    let {setState, fetchData} = this.props
    this.setState({
      refund_reason: 0,
      show_modal: false,
    }, () => {

    })
  }

  submit = () => {
    this.closeModal()
  }

  render(): React.ReactNode {
    let {show_modal, is_loading, refund_reason, remark_input_value, reason_list} = this.state;
    if (!show_modal) {
      return null;
    }
    return (
      <JbbModal
        visible={show_modal}
        HighlightStyle={{padding: 0}}
        onClose={this.closeModal}
      >

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
                <Text style={{fontWeight: 'bold', fontSize: 14, color: colors.color333, lineHeight: 20, marginLeft: 8}}>
                  建议先联系顾客协商撤销退款，避免顾客投诉
                </Text>
                <SvgXml onPress={this.closeModal} xml={cross_icon()}/>
              </View>
              <View style={{marginBottom: 10, marginLeft: 10}}>
                <For index='index' each='info' of={reason_list}>
                  <TouchableOpacity onPress={() => {
                    this.setState({refund_reason: Number(info.value)})
                  }} key={index} style={{
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
                      checked={refund_reason === info?.value}
                      onPress={() => {
                        this.setState({refund_reason: Number(info.value)})
                      }}
                    />
                    <Text style={{
                      fontSize: 14,
                      color: colors.color333,
                    }}>{info.label} </Text>
                    <If condition={tool.length(info?.tip) > 0}>
                      <View style={{borderRadius: 2, paddingHorizontal: 4, marginLeft: 4, backgroundColor: '#FF8309'}}>
                        <Text style={{fontSize: 11, color: colors.white, lineHeight: 16}}> {info?.tip} </Text>
                      </View>
                    </If>
                  </TouchableOpacity>
                </For>
              </View>
              <View style={{paddingHorizontal: 20,}}>
                <If condition={refund_reason === 0}>
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
                        onPress={() => {
                          this.submit()
                        }}
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
      </JbbModal>
    )
  }
}


export default RefundReasonModal
