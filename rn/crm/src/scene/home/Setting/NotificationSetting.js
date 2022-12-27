import React, {PureComponent} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  KeyboardAvoidingView, Platform
} from "react-native";
import Slider from "@react-native-community/slider";
import {connect} from "react-redux";
import SystemSetting from 'react-native-system-setting'
import {Switch} from "react-native-elements";
import colors from "../../../pubilc/styles/colors";
import {SvgXml} from "react-native-svg";
import {right, close, rightCheck} from "../../../svg/svg";
import CommonModal from "../../../pubilc/component/goods/CommonModal";
import HttpUtils from "../../../pubilc/util/http";
import AlertModal from "../../../pubilc/component/AlertModal";
import native from "../../../pubilc/util/native";
import {showError, ToastShort} from "../../../pubilc/util/ToastUtils";
import AntDesign from "react-native-vector-icons/AntDesign";

const {width} = Dimensions.get('window')
const styles = StyleSheet.create({
  line: {borderBottomColor: colors.e5, borderBottomWidth: 0.5, marginHorizontal: 12,},
  zoneWrap: {borderRadius: 6, backgroundColor: colors.white, marginHorizontal: 12, marginVertical: 10,},
  zoneRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 12,
    paddingVertical: 15
  },
  rowLeftText: {fontSize: 15, color: colors.color333, lineHeight: 21},
  rowRightText: {fontSize: 14, color: colors.color333, lineHeight: 20},
  headerText: {fontSize: 14, color: colors.color999, paddingLeft: 12, lineHeight: 20},
  headerDescText: {fontSize: 13, color: colors.color999, marginTop: 4, lineHeight: 18},
  rowCenter: {flexDirection: 'row', alignItems: 'center',},
  btnText: {fontSize: 13, color: colors.main_color, lineHeight: 18, marginRight: 12, marginTop: 4},
  setNotificationPhone: {fontSize: 13, color: colors.color666, lineHeight: 18, marginRight: 2, marginTop: 4},
  balanceText: {color: '#FF862C', lineHeight: 18},
  modalWrap: {backgroundColor: colors.white, borderTopLeftRadius: 10, borderTopRightRadius: 10},
  modalHeaderWrap: {justifyContent: 'space-between', padding: 20},
  modalHeaderText: {fontSize: 16, fontWeight: 'bold', color: colors.color333, lineHeight: 22},
  modalItemNotSelectWrap: {borderRadius: 6, backgroundColor: colors.f5, marginHorizontal: 20, marginBottom: 10},
  modalItemSelectWrap: {
    borderRadius: 6,
    borderColor: colors.main_color,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 10
  },
  modalItemHeaderText: {
    fontSize: 15,
    color: colors.color333,
    fontWeight: 'bold',
    lineHeight: 21,
    paddingTop: 20,
    paddingLeft: 12
  },
  modalItemDescText: {
    fontSize: 13,
    color: colors.color999,
    lineHeight: 18,
    paddingBottom: 20,
    paddingLeft: 12,
    paddingTop: 4
  },
  modalBtnWrap: {backgroundColor: colors.main_color, margin: 20, marginTop: 10, borderRadius: 24,},
  modalBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
    paddingVertical: 10,
    textAlign: 'center'
  },
  rightCheck: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#26B942',
    borderLeftWidth: 1,
    borderLeftColor: 'transparent'
  },
  recommendWrap: {
    backgroundColor: '#E4FFE7',
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    position: 'absolute',
    top: 0,
    right: 0
  },
  recommendText: {color: colors.main_color, fontSize: 12, lineHeight: 17, paddingHorizontal: 6, paddingVertical: 4},

  notSelectBalanceWrap: {
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.colorDDD,
    height: 36,
    width: (width - 2 * 20 - 2 * 10) / 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10
  },
  notSelectBalanceText: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20},
  selectBalanceWrap: {
    borderColor: colors.main_color,
    borderWidth: 0.5,
    borderRadius: 4,
    backgroundColor: '#DFFAE2',
    height: 36,
    width: (width - 2 * 20 - 2 * 10) / 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10
  },
  selectBalanceText: {fontSize: 14, fontWeight: '500', color: colors.main_color, lineHeight: 20},
  customerInput: {
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: colors.colorDDD,
    height: 36,
    width: (width - 2 * 20 - 2 * 10) / 3,
    marginRight: 10,
    marginBottom: 10,
    textAlign: 'center'
  },
  notificationPhoneWrap: {
    marginHorizontal: 20,
    borderRadius: 6,
    backgroundColor: colors.f5,
    paddingVertical: 13,
    paddingLeft: 16,
    marginBottom: 10,
    fontSize: 16,
    color: colors.color333,
    lineHeight: 22
  },
  modalHeaderExtraText: {fontSize: 12, color: colors.color666, marginLeft: 4},
  modalBalanceWrap: {marginLeft: 20, marginRight: 10, flexWrap: 'wrap', flexDirection: 'row'}
})

class NotificationSetting extends PureComponent {

  state = {
    volume: this.props.global.volume,
    close_voice_visible: false,
    visible: false,
    show_type: 1,
    show_header_text: '',
    selected_remind_item: {
      index: -1
    },
    select_balance: {
      index: -1,
      value: '',
      is_input: false
    },
    notification_phone: '',
    menu_settings_head: {},
    menu_settings_body: {},
    menu_settings_tail: {},
    menu_settings_child_delivery_cancel: {},
    menu_settings_child_balance_defect: {},
  }

  async componentDidMount() {

    await this.getNotificationSettingList()

  }

  getNotificationSettingList = async () => {
    const notification_status = await native.getNotificationStatus()
    const {store_id, vendor_id, accessToken} = this.props.global
    const url = `/v4/wsb_notify/getNotifySettingList?access_token=${accessToken}`
    const params = {store_id: store_id, vendor_id: vendor_id}
    HttpUtils.get(url, params).then((res) => {
      const {
        menu_settings_head = {}, menu_settings_body = {}, menu_settings_tail = {},
        menu_settings_child_delivery_cancel = {}, menu_settings_child_balance_defect = {}
      } = res

      const notify_accept = {notify_type: 'v4_notify_accept', name: '接收消息通知', value: notification_status ? 1 : 0}
      menu_settings_head.types = [notify_accept].concat(menu_settings_head.types)

      this.setState({
        menu_settings_head: menu_settings_head,
        menu_settings_body: menu_settings_body,
        menu_settings_tail: menu_settings_tail,
        menu_settings_child_delivery_cancel: menu_settings_child_delivery_cancel,
        menu_settings_child_balance_defect: menu_settings_child_balance_defect,
        select_balance: {
          ...this.state.select_balance,
          index: menu_settings_child_balance_defect.checked_index,
          value: menu_settings_child_balance_defect.types[menu_settings_child_balance_defect.checked_index].value
        }
      })
    })

  }

  setVolume = (value) => {

    const {volume} = this.state
    if (value === volume)
      return
    this.volumeRef.setNativeProps({value: value})
    SystemSetting.setVolume(value, {showUI: true, type: "system"})


  }

  setStatus = async (notify_type, value) => {
    switch (notify_type) {
      case 'v4_sound_tip_open':
        if (value)
          this.setStatusRequestServer(notify_type, value)
        else
          this.setState({close_voice_visible: true})
        break
      case 'v4_notify_accept':
        await SystemSetting.openAppSystemSettings()
        break
      default:
        this.setStatusRequestServer(notify_type, value)
        break
    }

  }

  setStatusRequestServer = (notify_type, value) => {
    const {store_id, accessToken} = this.props.global
    const url = `/v4/wsb_notify/setNotifySettingStatus?access_token=${accessToken}`
    const params = {store_id: store_id, setting_type: notify_type}
    switch (value) {
      case true:
      case 1:
        params.setting_status = 1
        break
      case false:
      case 0:
        params.setting_status = 0
        break
      default:
        params.setting_status = value
        break
    }
    HttpUtils.get(url, params).then(async () => {
      this.closeVoiceModal()
      this.closeModal()
      await this.getNotificationSettingList()
      if (notify_type === 'v4_strong_delivery_order_cancel' || notify_type === 'v4_strong_balance_defect') {
        ToastShort('设置成功', 1)
      }
    })
  }
  renderMessage = () => {
    const {menu_settings_head} = this.state
    const {types = []} = menu_settings_head
    return (
      <View style={styles.zoneWrap}>
        {
          types && types.map((item, index) => {
            const {name, value, notify_type} = item
            return (
              <View key={index}>
                <View style={styles.zoneRowWrap}>
                  <Text style={styles.rowLeftText}>
                    {name}
                  </Text>
                  <Switch color={colors.main_color}
                          value={value === 1}
                          onValueChange={value1 => this.setStatus(notify_type, value1)}/>
                </View>
                <If condition={index !== types.length - 1}>
                  <View style={styles.line}/>
                </If>
              </View>
            )
          })
        }

      </View>
    )
  }

  renderVolume = () => {
    const {volume} = this.state

    return (
      <>
        <Text style={styles.headerText}>
          音量设置
        </Text>
        <View style={styles.zoneWrap}>
          <Slider value={volume}
                  ref={ref => this.volumeRef = ref}
                  minimumTrackTintColor={colors.main_color}
                  maximumTrackTintColor={colors.e5}
                  style={{marginHorizontal: 15, paddingVertical: 28}}
                  minimumValue={0}
                  maximumValue={1}
                  onValueChange={value => this.setVolume(value)}/>
        </View>

      </>
    )
  }

  renderNotification = () => {
    const {menu_settings_body} = this.state
    const {name = '', types = []} = menu_settings_body
    return (
      <>
        <Text style={styles.headerText}>
          {name}
        </Text>
        <View style={styles.zoneWrap}>
          {
            types.map((item, index) => {
              const {notify_type, name, value, tips = ''} = item
              return (
                <View key={index}>
                  <View style={styles.zoneRowWrap}>
                    <View>
                      <Text style={styles.rowLeftText}>
                        {name}
                      </Text>
                      <If condition={tips}>
                        <Text style={styles.headerDescText}>
                          {tips}
                        </Text>
                      </If>
                    </View>
                    <Switch color={colors.main_color}
                            value={value === 1}
                            onValueChange={value1 => this.setStatus(notify_type, value1)}/>
                  </View>
                  <If condition={index !== types.length - 1}>
                    <View style={styles.line}/>
                  </If>
                </View>
              )
            })
          }
        </View>
      </>
    )
  }

  setShowModalByType = (visible, show_type, index, notify_mobile_value) => {
    let show_header_text = ''
    switch (show_type) {
      case 'v4_strong_delivery_order_cancel':
        show_header_text = '设置配送取消通知'
        break
      case 'v4_strong_balance_defect':
        show_header_text = '设置余额不足通知'
        break
      case 0:
        show_header_text = '设置余额'
        break
      case 1:
        show_header_text = '设置电话'
        break
    }
    this.setState({
      visible: visible,
      show_type: show_type,
      show_header_text: show_header_text,
      selected_remind_item: {...this.state.selected_remind_item, index: index, setting_type: show_type},
      notification_phone: notify_mobile_value ? notify_mobile_value : this.state.notification_phone
    })
  }

  renderStrongReminder = () => {
    const {menu_settings_tail} = this.state
    const {name = '', types = []} = menu_settings_tail
    return (
      <>
        <Text style={styles.headerText}>
          {name}
        </Text>
        <View style={styles.zoneWrap}>
          {
            types.map((item, index) => {
              const {notify_type, name, buttons = [], tips, value_desc, tips_amount_desc, tips_tail, value} = item
              return (
                <View key={index}>
                  <View style={styles.zoneRowWrap}>
                    <View>
                      <Text style={styles.rowLeftText}>
                        {name}
                      </Text>
                      <Text style={styles.headerDescText}>
                        {tips}
                        <If condition={tips_amount_desc}>
                          <Text style={styles.balanceText}>
                            {tips_amount_desc}
                          </Text>
                        </If>
                        {tips_tail}
                      </Text>
                      <If condition={buttons}>
                        <View style={styles.rowCenter}>
                          {
                            buttons.map((button, key) => {
                              const {notify_mobile_label, notify_mobile_value, btn_index, name} = button
                              if (notify_mobile_value)
                                return (
                                  <View style={styles.rowCenter} key={key}>
                                    <Text style={styles.setNotificationPhone}>
                                      {notify_mobile_label}{notify_mobile_value}
                                    </Text>
                                    <AntDesign name={'edit'}
                                               color={colors.color999}
                                               onPress={() => this.setShowModalByType(true, btn_index, name, notify_mobile_value)}/>
                                  </View>
                                )
                              return (
                                <Text style={styles.btnText}
                                      key={key}
                                      onPress={() => this.setShowModalByType(true, btn_index, name)}>
                                  {name}
                                </Text>
                              )
                            })
                          }

                        </View>
                      </If>
                    </View>
                    <TouchableOpacity style={styles.rowCenter}
                                      onPress={() => this.setShowModalByType(true, notify_type, value)}>
                      <Text style={styles.rowRightText}>
                        {value_desc}
                      </Text>
                      <SvgXml xml={right()}/>
                    </TouchableOpacity>
                  </View>
                  <If condition={index !== types.length - 1}>
                    <View style={styles.line}/>
                  </If>
                </View>
              )
            })
          }
        </View>
      </>
    )
  }

  closeModal = () => {
    this.setState({visible: false})
  }
  setBalance = () => {
    const {select_balance} = this.state
    const {store_id, accessToken} = this.props.global;
    const url = `/v4/wsb_store/setStoreConfig?access_token=${accessToken}`
    const params = {store_id: store_id, field: 'funds_threshold', value: select_balance.value}
    HttpUtils.get(url, params).then(async () => {
      this.closeModal()
      await this.getNotificationSettingList()
      ToastShort('设置成功', 2)
    })
  }
  setNotificationPhone = () => {
    const {store_id, accessToken} = this.props.global;
    const {notification_phone} = this.state
    if (notification_phone.length !== 11) {
      showError('请输入正确的手机号', 1)
      return
    }
    const url = `/v4/wsb_notify/setNotifyMobile?access_token=${accessToken}`
    const params = {store_id: store_id, notify_mobile: notification_phone}
    HttpUtils.get(url, params).then(async () => {
      this.closeModal()
      await this.getNotificationSettingList()
    })
  }
  selectItemAndCloseModal = () => {
    const {show_type, selected_remind_item} = this.state
    const {index} = selected_remind_item
    switch (show_type) {
      case 'v4_strong_delivery_order_cancel':
      case 'v4_strong_balance_defect':
        this.setStatusRequestServer(show_type, index)
        break
      case 0:
        this.setBalance()
        break
      case 1:
        this.setNotificationPhone()
        break
    }
  }
  renderModal = () => {
    const {visible, show_type, show_header_text} = this.state
    return (
      <CommonModal visible={visible} position={'flex-end'} onRequestClose={this.closeModal}>
        <KeyboardAvoidingView style={styles.modalWrap} behavior={Platform.select({android: 'height', ios: 'padding'})}>
          <View style={[styles.rowCenter, styles.modalHeaderWrap]}>
            <View style={styles.rowCenter}>
              <Text style={styles.modalHeaderText}>
                {show_header_text}
              </Text>
              <If condition={show_type === 0}>
                <Text style={styles.modalHeaderExtraText}>
                  小于等于以下额度时提醒
                </Text>
              </If>
            </View>
            <SvgXml xml={close()} onPress={this.closeModal}/>
          </View>
          <If condition={show_type === 0}>
            {this.renderBalance()}
          </If>
          <If condition={show_type === 1}>
            {this.renderPhone()}
          </If>
          <If condition={show_type === 'v4_strong_balance_defect' || show_type === 'v4_strong_delivery_order_cancel'}>
            {this.renderDeliveryCancelNotification()}
          </If>
          <TouchableOpacity style={styles.modalBtnWrap} onPress={this.selectItemAndCloseModal}>
            <Text style={styles.modalBtnText}>
              确 定
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </CommonModal>
    )
  }

  setSelectCancelNotification = (item) => {
    this.setState({selected_remind_item: item})
  }

  renderDeliveryCancelNotification = () => {
    const {selected_remind_item, menu_settings_child_delivery_cancel} = this.state
    const {types = []} = menu_settings_child_delivery_cancel
    return types.map((item, key) => {
      const {index, name, tips, tips_amount_desc, recommend} = item
      return (
        <TouchableOpacity key={key}
                          onPress={() => this.setSelectCancelNotification(item)}
                          style={selected_remind_item.index === index ? styles.modalItemSelectWrap : styles.modalItemNotSelectWrap}>
          <Text style={styles.modalItemHeaderText}>
            {name}
          </Text>
          <Text style={styles.modalItemDescText}>
            {tips}<Text style={styles.balanceText}>{tips_amount_desc}</Text>
          </Text>
          <If condition={selected_remind_item.index === index}>
            {this.renderRightCheck()}
          </If>
          <If condition={recommend === 1}>
            <View style={styles.recommendWrap}>
              <Text style={styles.recommendText}>
                推荐
              </Text>
            </View>
          </If>
        </TouchableOpacity>
      )
    })
  }

  setBalanceText = (item) => {
    if (item.value === '' || /^[1-9]\d*$/.test(item.value)) {
      this.setState({select_balance: item})
      return
    }
    showError('请输入正确的余额', 1)
  }

  renderBalance = () => {
    const {select_balance, menu_settings_child_balance_defect} = this.state
    const {types = []} = menu_settings_child_balance_defect
    return (
      <View style={styles.modalBalanceWrap}>
        {
          types.map((item, key) => {
            const {index, name} = item
            if (name === '自定义')
              return (
                <TextInput style={[styles.customerInput, styles.notSelectBalanceText]}
                           key={key}
                           value={select_balance.is_input ? `${select_balance.value}` : ''}
                           onChangeText={text => this.setBalanceText({index: index, value: text})}
                           keyboardType={'numeric'}
                           onFocus={() => this.setBalanceText({index: index, value: '', is_input: true})}
                           placeholderTextColor={colors.color999}
                           placeholder={name}/>
              )
            return (
              <TouchableOpacity key={index}
                                onPress={() => this.setBalanceText({...item, is_input: false})}
                                style={select_balance.index === index ? styles.selectBalanceWrap : styles.notSelectBalanceWrap}>
                <Text style={select_balance.index === index ? styles.selectBalanceText : styles.notSelectBalanceText}>
                  {name}
                </Text>
              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }

  setPhone = (text) => {
    if (text === '' || /^[1-9]\d*$/.test(text)) {
      this.setState({notification_phone: text})
      return
    }
    showError('请输入正确的手机号', 1)
  }
  renderPhone = () => {
    const {notification_phone} = this.state
    return (
      <TextInput onChangeText={text => this.setPhone(text)}
                 keyboardType={'numeric'}
                 style={styles.notificationPhoneWrap}
                 value={notification_phone}
                 placeholder={'请输入通知电话'}
                 placeholderTextColor={colors.color999}/>
    )
  }
  renderRightCheck = () => {
    return (
      <View style={styles.rightCheck}>
        <SvgXml xml={rightCheck()}/>
      </View>
    )
  }

  closeVoiceModal = () => {
    this.setState({close_voice_visible: false})
  }

  renderCloseVoice = () => {
    const {close_voice_visible} = this.state
    return (
      <AlertModal
        visible={close_voice_visible}
        onClose={this.closeVoiceModal}
        onPressClose={this.closeVoiceModal}
        onPress={() => this.setStatusRequestServer('v4_sound_tip_open', 0)}
        title={'关闭后您将无法听到订单提醒的声音，确定关闭吗？'}
        closeText={'取消'}
        actionText={'确定'}/>
    )
  }

  render() {
    return (
      <ScrollView>
        {this.renderMessage()}
        {this.renderVolume()}
        {this.renderNotification()}
        {this.renderStrongReminder()}
        {this.renderModal()}
        {this.renderCloseVoice()}
      </ScrollView>
    )
  }
}

const mapStateToProps = ({global}) => ({global: global})
export default connect(mapStateToProps)(NotificationSetting)
