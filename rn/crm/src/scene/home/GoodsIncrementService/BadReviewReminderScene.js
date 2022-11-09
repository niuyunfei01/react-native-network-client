import React, {PureComponent} from "react";
import {Appearance, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import DateTimePicker from "react-native-modal-datetime-picker";
import {connect} from "react-redux";
import HttpUtils from "../../../pubilc/util/http";
import {LineView, Styles} from "./GoodsIncrementServiceStyle";
import {showError, showSuccess} from "../../../pubilc/util/ToastUtils";
import tool from "../../../pubilc/util/tool";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const styles = StyleSheet.create({
  notificationWrap: {
    backgroundColor: colors.white,
    marginTop: 12,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 8
  },
  rowWrap: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 12,
    paddingTop: 11,
    paddingBottom: 10,
    paddingRight: 14
  },
  rowDescriptionText: {
    fontSize: 15,
  },
  showTimeText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.color999,
    lineHeight: 17,
    paddingRight: 4
  },
  row: {flexDirection: 'row'},
  rowContact: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 12,
    paddingTop: 11,
    paddingBottom: 10,
    paddingRight: 14
  },
  customHeaderIOSText: {
    fontSize: 20,
    textAlign: 'center',
    padding: 8
  }
})

const customHeaderIOS = () => {
  return (
    <Text style={styles.customHeaderIOSText}>
      选择时间
    </Text>
  )
}

class BadReviewReminderScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      showDatePicker: false,
      selectTimeType: 'startTime',
      settings: {
        mobile: '',
        mobile_notify: 'off',
        sms_notify: 'off',
        notify_start_at: '',
        notify_end_at: ''
      }
    }
    this.getStatus()
  }

  getStatus = () => {
    const {accessToken, currStoreId} = this.props.global;
    const api = `/v1/new_api/added/bad_notify_info/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get(api).then(res => {
      this.setState({settings: res})
    }).catch(error => showError(error.reason))
  }

  onValueChange = (value, type) => {
    const status = value ? 'on' : 'off'
    const {settings} = this.state
    if ('sms_notify' === type) {
      this.setState({
        settings: {...settings, sms_notify: status}
      })
      return
    }
    this.setState({
      settings: {...settings, mobile_notify: status}
    })
  }

  renderNotificationSwitch = () => {
    const {settings} = this.state
    return (
      <View style={Styles.zoneWrap}>
        <Text style={Styles.headerTitleText}>
          通知开关
        </Text>
        <LineView/>
        <View style={styles.rowWrap}>
          <Text style={styles.rowDescriptionText}>
            中差评短信通知
          </Text>
          <Switch value={settings.sms_notify === 'on'}
                  onValueChange={(value) => this.onValueChange(value, 'sms_notify')}/>
        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.rowDescriptionText}>
            中差评电话通知
          </Text>
          <Switch value={settings.mobile_notify === 'on'}
                  onValueChange={value => this.onValueChange(value, 'mobile_notify')}/>
        </View>
      </View>
    )
  }

  renderNotificationTime = () => {
    const {settings} = this.state
    return (
      <View style={Styles.zoneWrap}>
        <Text style={Styles.headerTitleText}>
          通知开关
        </Text>
        <LineView/>
        <View style={styles.rowWrap}>
          <Text style={styles.rowDescriptionText}>
            开始时间
          </Text>
          <TouchableOpacity style={styles.rowWrap} onPress={() => this.showDateModal('startTime')}>
            <AntDesign name={'clockcircleo'} style={styles.showTimeText}/>
            <Text style={styles.showTimeText}>
              {settings.notify_start_at}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowWrap}>
          <Text style={styles.rowDescriptionText}>
            结束时间
          </Text>
          <TouchableOpacity style={styles.rowWrap} onPress={() => this.showDateModal('endTime')}>
            <AntDesign name={'clockcircleo'} style={styles.showTimeText}/>
            <Text style={styles.showTimeText}>
              {settings.notify_end_at}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  showDateModal = (type) => {
    this.setState({
      showDatePicker: true,
      selectTimeType: type
    })
  }

  renderContactDetails = () => {
    const {settings} = this.state
    return (
      <View style={Styles.zoneWrap}>
        <Text style={Styles.headerTitleText}>
          联系方式
        </Text>
        <LineView/>
        <View style={styles.rowContact}>
          <Text style={styles.rowDescriptionText}>
            手机号码(+86)：
          </Text>
          <TextInput
            style={[styles.rowDescriptionText, {flex: 1}]}
            placeholder={'请输入手机号'}
            placeholderTextColor={colors.colorEEE}
            keyboardType={'numeric'}
            onChangeText={text => this.onChangeText(text)}
            value={settings.mobile}/>
        </View>
      </View>
    )
  }
  onChangeText = (text) => {
    const {settings} = this.state
    this.setState({settings: {...settings, mobile: text}})
  }
  setShowDatePicker = (value) => {
    this.setState({showDatePicker: value})
  }

  onConfirm = (date, selectTimeType) => {

    const time = date.toTimeString().substring(0, 6) + '00'
    const {settings} = this.state
    if ('startTime' === selectTimeType) {
      this.setState({
        settings: {...settings, notify_start_at: time},
        showDatePicker: false
      })
      return
    }
    this.setState({
      settings: {...settings, notify_end_at: time},
      showDatePicker: false
    })
  }

  saveSetting = () => {
    const {settings} = this.state

    if (tool.length(settings.notify_start_at) === 0 || tool.length(settings.notify_end_at) === 0) {
      showError('请选择通知开始时间或者结束时间')
      return;
    }
    if (tool.length(settings.mobile) <= 10) {
      showError('请输入正确的手机号')
      return
    }
    try {
      const startTimeArray = settings.notify_start_at.split(':')
      const endTimeArray = settings.notify_end_at.split(':')

      const startTime = parseInt(startTimeArray[0] * 60) + parseInt(startTimeArray[1])
      const endTime = parseInt(endTimeArray[0] * 60) + parseInt(endTimeArray[1])

      if (endTime - startTime < 30) {
        showError('结束时间应大于开始时间，并且间隔不小于30分钟')
        return;
      }
    } catch (e) {

    }
    const {accessToken, currStoreId} = this.props.global;
    const api = `/v1/new_api/added/bad_notify?access_token=${accessToken}`
    const params = {
      store_id: currStoreId,
      sms_notify: settings.sms_notify,
      mobile_notify: settings.mobile_notify,
      notify_start_at: settings.notify_start_at,
      notify_end_at: settings.notify_end_at,
      mobile: settings.mobile
    }
    HttpUtils.post(api, params).then(() => {
      showSuccess('保存成功')
    }).catch(error => showError('保存失败，原因：' + error.reason))
  }

  render() {
    const {showDatePicker, selectTimeType} = this.state
    return (
      <>
        <KeyboardAwareScrollView enableOnAndroid={false}>

          {this.renderNotificationSwitch()}
          {this.renderNotificationTime()}
          {this.renderContactDetails()}

        </KeyboardAwareScrollView>
        <View style={Styles.saveZoneWrap}>
          <TouchableOpacity style={Styles.saveWrap} onPress={this.saveSetting}>
            <Text style={Styles.saveText}>
              保存
            </Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker cancelTextIOS={'取消'}
                        headerTextIOS={'选择日期'}
                        isDarkModeEnabled={Appearance.getColorScheme() === 'dark'}
                        confirmTextIOS={'确定'}
                        date={new Date()}
                        customHeaderIOS={customHeaderIOS}
                        mode={'time'}
                        isVisible={showDatePicker}
                        onConfirm={(Date) => this.onConfirm(Date, selectTimeType)}
                        onCancel={() => this.setShowDatePicker(false)}/>
      </>
    )
  }
}

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

export default connect(mapStateToProps)(BadReviewReminderScene)
