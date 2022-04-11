import React, {PureComponent} from "react";
import {StyleSheet, Text, View} from "react-native";
import colors from "../../pubilc/styles/colors";
import pxToDp from "../../pubilc/util/pxToDp";

class OperateHeader extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    let {text, money, customStyle} = this.props;
    return (
        <View style={[header.header, customStyle ? customStyle : null]}>
          <Text style={header.text}>{text}  </Text>
          <Text style={header.text}>{money}  </Text>
        </View>
    );
  }
}

const header = StyleSheet.create({
  header: {
    height: pxToDp(60),
    backgroundColor: colors.main_color,
    paddingHorizontal: pxToDp(30),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  text: {
    alignItems: "center",
    fontSize: pxToDp(30),
    color: colors.white
  }
});

export default OperateHeader;
