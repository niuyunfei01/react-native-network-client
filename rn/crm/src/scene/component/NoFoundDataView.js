import React from 'react'
import {Styles} from "../../themes";
import {Text, View} from "react-native";

export default class NoFoundDataView extends React.Component {
  render() {
    const {msg = "未找到数据"} = this.props;
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Text style={[{}, Styles.n1b]}>{msg} </Text>
      </View>
    )
  }
}
