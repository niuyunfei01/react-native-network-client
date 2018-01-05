import React, {PureComponent} from 'react'
import {Text, View,StyleSheet} from 'react-native'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";


class OperateHeader extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    let {text,money} = this.props;
    return (
          <View style={header.header}>
            <Text style={header.text}>{text}</Text>
            <Text style={header.text}>{money}</Text>
          </View>
    )
  }
}

const header = StyleSheet.create({
  header: {
    height: pxToDp(120),
    backgroundColor: colors.main_color,
    paddingHorizontal: pxToDp(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  text: {
    alignItems: 'center',
    fontSize: pxToDp(30),
    color: colors.white
  }
});

export default OperateHeader;