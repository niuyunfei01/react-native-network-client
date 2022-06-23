import React from "react";
import {Text} from "react-native";

export const MyText = (props) => {
  return (
    <Text allowFontScaling={false} {...props}>
      {props.children}
    </Text>
  )
}
