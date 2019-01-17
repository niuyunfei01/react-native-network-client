import React from 'react'
import {Styles} from "../../themes";
import {View, Text} from "react-native";

export default class NoFoundDataView extends React.Component {
  render () {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text style={[{}, Styles.tb]}>未找到数据</Text>
      </View>
    )
  }
}