import React, {PureComponent} from "react";
import Dialog from "../../scene/common/component/Dialog";
import {Appearance, Text, TouchableOpacity, View, StyleSheet} from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import colors from "../styles/colors";
import PropTypes from "prop-types";
import tool from "../util/tool";
import dayjs from "dayjs";

const styles = StyleSheet.create({
  modalCancel: {
    width: '100%',
    height: 40,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,

  },
  modalCancelText1: {
    color: colors.theme,
    fontSize: 20
  },
  modalCancel1: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    marginTop: 10
  },
  modalCancelText: {
    color: 'black',
    fontSize: 20,
    fontWeight: "bold",
    textAlign: 'center'
  },
})
export default class CustomDateComponent extends PureComponent {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    getData: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  state = {
    startTime: '',
    endTime: '',
    timeType: '',
    showDateModal: false
  }
  onConfirm = (date) => {
    const {timeType, startTime} = this.state
    if ('start' === timeType) {
      this.setState({startTime: tool.fullDay(date), showDateModal: false})
      return
    }
    this.setState({endTime: tool.fullDay(date), showDateModal: false})
    if (dayjs(startTime) > date) {
      this.setState({
        endTime: startTime,
        startTime: tool.fullDay(date)
      })
    }
  }

  render() {
    const {startTime, endTime, timeType, showDateModal} = this.state
    const {visible, getData, onClose,} = this.props
    return (
      <Dialog visible={visible} onRequestClose={onClose}>
        <>
          <TouchableOpacity style={styles.modalCancel}
                            onPress={() => this.setState({timeType: 'start', showDateModal: true})}>
            <Text style={styles.modalCancelText}>{startTime ? startTime : '点击选择开始日期'} </Text>
          </TouchableOpacity>
          <View style={styles.modalCancel}><Text style={styles.modalCancelText}>——</Text></View>
          <TouchableOpacity style={styles.modalCancel}
                            onPress={() => this.setState({timeType: 'end', showDateModal: true})}>
            <Text style={styles.modalCancelText}>{endTime ? endTime : '点击选择结束日期'} </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalCancel1} onPress={() => getData(startTime, endTime)}>
            <Text style={styles.modalCancelText1}>确&nbsp;&nbsp;&nbsp;&nbsp;认</Text>
          </TouchableOpacity>
          <DateTimePicker
            cancelTextIOS={'取消'}
            headerTextIOS={timeType === 'start' ? '选择开始日期' : '选择结束日期'}
            isDarkModeEnabled={Appearance.getColorScheme() === 'dark'}
            confirmTextIOS={'确定'}
            date={new Date()}
            mode='date'
            maximumDate={new Date()}
            isVisible={showDateModal}
            onConfirm={date => this.onConfirm(date)}
            onCancel={() => this.setState({showDateModal: false})}
          />
        </>
      </Dialog>
    )
  }
}
