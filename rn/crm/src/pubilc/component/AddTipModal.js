import React from 'react'
import PropTypes from 'prop-types'
import {Dimensions, Text, TextInput, TouchableOpacity, View} from 'react-native'
import colors from "../styles/colors";
import Entypo from "react-native-vector-icons/Entypo";
import tool from "../util/tool";
import JbbModal from "./JbbModal";
import {ToastShort} from "../util/ToastUtils";
import {addTipMoneyNew, addTipMoneys} from "../../reducers/order/orderActions";
import {Button} from "react-native-elements";
import {cross_icon} from "../../svg/svg";
import {SvgXml} from "react-native-svg";

const {width} = Dimensions.get("window");

const tip_list = [
  {label: '1元', value: 1},
  {label: '2元', value: 2},
  {label: '3元', value: 3},
  {label: '5元', value: 5},
  {label: '10元', value: 10}
]

class AddTipModal extends React.Component {
  static propTypes = {
    accessToken: PropTypes.string,
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    show_add_tip_modal: PropTypes.bool,
    add_money: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    orders_add_tip: PropTypes.bool,
    set_add_tip_money: PropTypes.bool,
    setState: PropTypes.func,
    fetchData: PropTypes.func,
    dispatch: PropTypes.func,
  }

  state = {
    show_modal: false,
    add_money: this.props.add_money || 1,
    input_add_money: '',
    respReason: '',
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {id, show_add_tip_modal, add_money} = nextProps;

    if (tool.length(id) <= 0 || Number(id) <= 0 || !show_add_tip_modal || this.state.show_modal) {
      return null;
    }
    this.setState({
      show_modal: true,
      add_money: add_money || 0,
    })
  }

  upAddTip = () => {
    const {dispatch, accessToken, id, orders_add_tip, set_add_tip_money} = this.props;
    let {add_money} = this.state;

    if (Number(add_money) < 1) {
      return this.setState({add_money: 1, respReason: '加小费的金额必须大于等于1元', ok: false});
    }

    if (set_add_tip_money) { //修改上级页面加小费金额
      return this.closeModal(Number(add_money));
    }

    tool.debounces(() => {
      if (orders_add_tip) { //批量加小费
        return dispatch(addTipMoneys(id, add_money, accessToken, (resp) => {
          if (tool.length(resp?.obj?.error_msg) > 0) {
            this.setState({respReason: resp?.obj?.error_msg})
          } else {
            this.closeModal(1)
            ToastShort("加小费成功")
          }
        }));
      }

      //单独加小费
      dispatch(addTipMoneyNew(id, add_money, accessToken, (resp) => {
        if (resp.ok) {
          this.closeModal(1)
          ToastShort(resp.desc)
        } else {
          this.setState({respReason: resp.desc})
        }
      }))
    })

  }


  closeModal = (add_money = 0) => {
    let {set_add_tip_money, setState, fetchData} = this.props
    this.setState({
      add_money: 0,
      respReason: '',
      show_modal: false,
    }, () => {
      let params = {
        show_add_tip_modal: false,
        orders_add_tip: true,
        add_tip_id: 0,
      }
      if (set_add_tip_money) {
        params.add_tips = typeof add_money === 'number' ? add_money : 0;
        setState && setState(params, () => {
          if (add_money > 0) {
            fetchData && fetchData()
          }
        })
      } else {
        setState && setState(params, () => {
          if (add_money > 0) {
            fetchData && fetchData()
          }
        })
      }
    })
  }

  render(): React.ReactNode {
    let {show_modal, add_money, input_add_money, respReason} = this.state;
    if (!show_modal) {
      return null;
    }
    return (
      <JbbModal
        visible={show_modal}
        HighlightStyle={{padding: 0}}
        onClose={this.closeModal}
      >

        <View style={{marginBottom: 20}}>
          <View style={{
            flexDirection: 'row',
            padding: 12,
            paddingBottom: 5,
            justifyContent: 'space-between',
          }}>
            <Text style={{fontWeight: 'bold', fontSize: 16, color: colors.color333, lineHeight: 30}}>
              加小费
              <Text style={{fontWeight: 'normal', fontSize: 12, color: colors.color999, marginLeft: 4}}> 有助更快接起哦 </Text>
            </Text>
            <SvgXml onPress={this.closeModal} xml={cross_icon()}/>

          </View>
          <View style={{paddingHorizontal: 12,}}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                justifyContent: "space-around",
                flexWrap: "wrap"
              }}>
              <For index='index' each='info' of={tip_list}>

                <TouchableOpacity onPress={() => {
                  this.setState({add_money: Number(info.value), input_add_money: ''})
                }} key={index} style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: width * 0.25,
                  height: 36,
                  marginVertical: 5,
                  borderWidth: 0.5,
                  borderRadius: 4,
                  backgroundColor: Number(info.value) === add_money ? '#DFFAE2' : colors.white,
                  borderColor: Number(info.value) === add_money ? colors.main_color : colors.colorDDD,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: Number(info.value) === add_money ? colors.main_color : colors.color333,
                  }}>{info.label} </Text>
                </TouchableOpacity>
              </For>
              <TextInput
                onChangeText={(input_add_money) => {
                  if (/^([0]|[1-9][0-9]*)$/.test(input_add_money)) {
                    this.setState({input_add_money: Number(input_add_money), add_money: Number(input_add_money)})
                  } else {
                    this.setState({input_add_money: '', add_money: ''})
                  }
                }}
                defaultValue={`${input_add_money}`}
                value={`${input_add_money}`}
                placeholderTextColor={colors.color999}
                underlineColorAndroid='transparent'
                maxLength={2}
                placeholder="自定义"
                keyboardType={'numeric'}
                style={{
                  fontSize: 14,
                  width: width * 0.25,
                  borderRadius: 4,
                  borderWidth: 0.5,
                  height: 36,
                  color: colors.color333,
                  borderColor: input_add_money === add_money ? colors.main_color : colors.colorDDD,
                  textAlign: 'center',
                  paddingVertical: 8,
                  marginVertical: 5,
                }}
              />
            </View>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
              marginLeft: 10,
            }}>
              <Text style={{
                color: '#FF8309',
                fontSize: 12,
              }}> 注：美团快速达不支持加小费 </Text>
            </View>

            <If condition={tool.length(respReason) > 0}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 12,
                marginBottom: 5,
              }}>
                <Entypo name={"help-with-circle"}
                        style={{
                          fontSize: 17,
                          color: colors.warn_red,
                          marginHorizontal: 5
                        }}/>
                <Text style={{
                  color: colors.warn_red,
                  fontSize: 14,
                  fontWeight: 'bold',
                  width: width * 0.6
                }}>{respReason} </Text>
              </View>
            </If>

            <Button title={'确 定'}
                    onPress={() => {
                      this.upAddTip()
                    }}
                    buttonStyle={[{
                      backgroundColor: colors.main_color,
                      borderRadius: 21,
                      length: 42,
                    }]}
                    titleStyle={{color: colors.f7, fontWeight: 'bold', fontSize: 16, lineHeight: 22}}/>
          </View>
        </View>
      </JbbModal>
    )
  }
}


export default AddTipModal
