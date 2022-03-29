import {Text} from "react-native";
import React, {Component} from "react";
import colors from "../../pubilc/styles/colors";

export default class JbbTextBtn extends Component {
  render() {
    const {props} = this
    let style = {
      fontFamily: 'Helvetica',
      color: colors.color999,
      borderColor: colors.color999,
      borderWidth: 1,
      fontSize: 12,
      paddingHorizontal: 5,
      paddingVertical: 1
    };
    return <Text {...props} style={[style, props.style]}>{props.children} </Text>
  }
}
