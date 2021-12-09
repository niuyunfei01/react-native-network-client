import React, {PureComponent} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import CallImg from './CallImg'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {native} from "../../common"
import PropTypes from 'prop-types'
import ModalSelector from "react-native-modal-selector";

class CallBtn extends PureComponent {
  static propTypes = {
    mobile: PropTypes.string,
    label: PropTypes.string,
    onPress: PropTypes.func,
    style: PropTypes.object,
    phoneList: PropTypes.array
  }

  constructor(props) {
    super(props)

    this._doDial = this._doDial.bind(this)
  }

  _doDial(option) {
    let {mobile} = this.props;
    mobile = option && option.value ? option.value : mobile
    if (mobile) {
      native.dialNumber(mobile)
    }
  }

  render() {

    let {label, mobile, onPress, style, phoneList} = this.props;
    label = label || mobile;
    if (phoneList && phoneList.length) {
      return (
        <ModalSelector
          onChange={(option) => onPress ? onPress(option) : this._doDial(option)}
          cancelText={'取消'}
          data={phoneList}
        >
          <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: pxToDp(14)}}>
            <Text selectable={true} style={[{fontSize: pxToDp(32), color: colors.mobile_color}, style]}>{label}</Text>
            <CallImg/>
          </View>
        </ModalSelector>
      )
    } else {
      return (<TouchableOpacity
          style={{flexDirection: 'row', alignItems: 'center', marginLeft: pxToDp(14)}}
          onPress={onPress ? onPress : this._doDial}>
          <Text selectable={true} style={[{fontSize: pxToDp(32), color: colors.mobile_color}, style]}>{label}</Text>
          <CallImg/>
        </TouchableOpacity>
      )
    }
  }
}

export default CallBtn
