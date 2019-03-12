import React, {PureComponent} from 'react'
import {TouchableOpacity, Text, View, ViewPropTypes} from 'react-native'
import CallImg from './CallImg'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {native} from "../../common"
import PropTypes from 'prop-types'

class CallBtn extends PureComponent {
  static propTypes = {
    mobile: PropTypes.string,
    label: PropTypes.string,
    onPress: PropTypes.func,
    style: View.propTypes.style,
  }
  
  constructor (props) {
    super(props)
    
    this._doDial = this._doDial.bind(this)
  }
  
  _doDial () {
    const {mobile} = this.props;
    if (mobile) {
      native.dialNumber(mobile)
    }
  }
  
  render () {
    
    let {label, mobile, onPress, style} = this.props;
    label = label || mobile;
    
    return (
      <TouchableOpacity
        style={{flexDirection: 'row', alignItems: 'center', marginLeft: pxToDp(14)}}
        onPress={onPress ? onPress : this._doDial}>
        <Text selectable={true} style={[{fontSize: pxToDp(32), color: colors.mobile_color}, style]}>{label}</Text>
        <CallImg/>
      </TouchableOpacity>
    );
  }
}

export default CallBtn