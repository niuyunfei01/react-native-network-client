import React from 'react'
import {StyleSheet, View} from "react-native";
import pxToDp from "../../util/pxToDp";

class GoodsPriceArea extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "同商圈价格调研",
    }
  }
  
  render () {
    return (
      <View style={styles.container}>
      
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: pxToDp(30),
    paddingHorizontal: pxToDp(20)
  }
})

export default (GoodsPriceArea)