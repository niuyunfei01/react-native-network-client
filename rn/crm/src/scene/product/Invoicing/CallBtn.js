import React, {PureComponent} from 'react'
import {Text, TouchableOpacity, ViewPropTypes} from 'react-native'
import pxToDp from "../../../util/pxToDp";
import {native} from "../../../util"
import PropTypes from 'prop-types'
import font from './fontStyles'
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import colors from "../../../pubilc/styles/colors";

class CallBtn extends PureComponent {

  constructor(props) {
    super(props)
    this._doDial = this._doDial.bind(this)
  }

  _doDial() {
    const {mobile} = this.props;
    if (mobile) {
      native.dialNumber(mobile)
    }
  }

  render() {
    let {label, mobile, onPress, style} = this.props;
    label = label || mobile;
    return <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: pxToDp(14)}}
                             onPress={onPress ? onPress : this._doDial}>
      <FontAwesome5 name={'phone-square'}
                    style={{fontSize: pxToDp(38), color: colors.main_color, marginRight: pxToDp(10)}}/>

      <Text style={[font.fontBlue]}>{label} </Text>
    </TouchableOpacity>;
  }
}

CallBtn.PropTypes = {
  mobile: PropTypes.string,
  label: PropTypes.string,
  onPress: PropTypes.func,
  style: ViewPropTypes.style,
}

export default CallBtn
