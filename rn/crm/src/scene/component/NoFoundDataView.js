import React from 'react'
import {Text, View} from "react-native";
import colors from "../../pubilc/styles/colors";

export default class NoFoundDataView extends React.Component {
  render() {
    const {msg = "未找到数据"} = this.props;
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Text style={{color: colors.color333, fontSize: 14, fontWeight: "bold"}}>{msg} </Text>
      </View>
    )
  }
}
