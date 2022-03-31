import {Text} from "react-native";
import React, {Component} from "react";
import colors from "../../../pubilc/styles/colors";

export default class JbbText extends Component {
  render() {
    const {props} = this
    return <Text {...props}
                 style={[{fontFamily: 'Helvetica', color: colors.color333}, props.style]}>{props.children} </Text>
  }
}
