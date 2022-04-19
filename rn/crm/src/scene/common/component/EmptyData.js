import React from 'react'
import {Text, View} from "react-native";
import pxToDp from "../../../pubilc/util/pxToDp";
import PropTypes from 'prop-types'
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import colors from "../../../pubilc/styles/colors";

export default class EmptyData extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string
  }

  static defaultProps = {
    placeholder: '没有相关记录'
  }

  render(): React.ReactNode {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
        <FontAwesome5 name={'file-signature'} size={52}
                      color={colors.color999}
        />
        <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>
          {this.props.placeholder}
        </Text>
      </View>
    )
  }
}
