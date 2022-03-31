import React, {PureComponent} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";
import {native} from "../../util"
import PropTypes from 'prop-types'
import ModalSelector from "react-native-modal-selector";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

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
            <Text selectable={true} style={[{fontSize: pxToDp(32), color: colors.mobile_color}, style]}>{label} </Text>


            <FontAwesome5 name={'check-circle'} size={25} style={{
              width: pxToDp(20),
              height: pxToDp(28),}}/>

          </View>
        </ModalSelector>
      )
    } else {
      return (<TouchableOpacity
          style={{flexDirection: 'row', alignItems: 'center', marginLeft: pxToDp(14)}}
          onPress={onPress ? onPress : this._doDial}>
          <Text selectable={true} style={[{fontSize: pxToDp(32), color: colors.mobile_color}, style]}>{label} </Text>

            <FontAwesome5 name={'check-circle'} size={25} style={{
              width: pxToDp(20),
              height: pxToDp(28),}}/>
        </TouchableOpacity>
      )
    }
  }
}

export default CallBtn
