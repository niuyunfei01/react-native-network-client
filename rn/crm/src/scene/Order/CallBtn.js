import React, {PureComponent} from 'react'
import {TouchableOpacity, Text} from 'react-native'
import CallImg from './CallImg'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

class CallBtn extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {

    const {label} = this.props;

    return <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: pxToDp(14)}}>
      <Text style={{fontSize: pxToDp(32), color: colors.mobile_color}}>{label}</Text>
      <CallImg/>
    </TouchableOpacity>;
  }
}

export default CallBtn