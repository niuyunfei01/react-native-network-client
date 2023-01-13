import React, {PureComponent} from "react";
import {Platform, View} from "react-native";
import CommonModal from "./goods/CommonModal";
import MonthPicker from "react-native-month-year-picker";
import PropTypes from "prop-types";

export default class CustomMonthPicker extends PureComponent {

  static propTypes = {
    onChange: PropTypes.func,
    visible: PropTypes.bool,
    date: PropTypes.object,
  }

  render() {
    const {date, onChange, visible} = this.props
    if (Platform.OS === 'ios') {
      return (
        <CommonModal visible={visible} onRequestClose={() => onChange('dismissedAction')}>
          <MonthPicker value={date}
                       cancelButton={'取消'}
                       okButton={'确定'}
                       autoTheme={true}
                       mode={'number'}
                       onChange={(event, newDate) => onChange(event, newDate)}
                       maximumDate={new Date()}
                       minimumDate={new Date(2015, 8, 15)}/>
        </CommonModal>
      )
    }
    if (Platform.OS === 'android' && visible) {
      return (
        <MonthPicker value={date}
                     cancelButton={'取消'}
                     okButton={'确定'}
                     autoTheme={true}
                     mode={'number'}
                     onChange={(event, newDate) => onChange(event, newDate)}
                     maximumDate={new Date()}
                     minimumDate={new Date(2015, 8, 15)}/>
      )
    }
    return <View/>
  }
}
