import React, {PureComponent} from 'react'
import {TouchableOpacity, Text} from 'react-native'
import CallImg from './CallImg'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {native} from "../../common"
import PropTypes from 'prop-types'

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

    let {label, mobile, onPress} = this.props;
    label = label || mobile;

    return <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: pxToDp(14)}}
                             onPress={onPress ? onPress : this._doDial}>
      <Text style={{fontSize: pxToDp(32), color: colors.mobile_color}}>{label}</Text>
      <CallImg/>
    </TouchableOpacity>;
  }
}

CallBtn.PropTypes = {
  mobile: PropTypes.string,
  label: PropTypes.string,
  onPress: PropTypes.func
}

export default CallBtn