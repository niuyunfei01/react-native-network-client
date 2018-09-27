import React, {Component} from 'react'
import {StyleSheet, Text, View} from "react-native";
import Rate from "../../Components/Goods/Rate";
import pxToDp from "../../util/pxToDp";

export default class GoodsPriceCompete extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "价格竞争力",
    }
  }
  
  render () {
    return (
      <View>
        <View style={styles.header}>
          <View style={styles.rate_box}>
            <Text style={styles.rate_title}>价格竞争力较低</Text>
            <Rate currRecord={2.32} showRecord={true} style={{marginLeft: pxToDp(20)}}/>
          </View>
          <Text style={styles.desc}>
            客户敏感品类偏高，以下商品价格竞争力较弱，请适当调整商品价格，提升店铺整体竞争力
          </Text>
        </View>
      
      </View>
    )
  }
}
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: '#ffffff'
  },
  rate_box: {
    flexDirection: 'row',
    height: pxToDp(68),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f3f3f3'
  },
  rate_title: {
    color: '#fd5b1b',
    fontSize: pxToDp(30)
  },
  desc: {
    fontSize: pxToDp(24),
    color: '#a4a4a4',
    textAlign: 'center',
    height: pxToDp(114),
    lineHeight: pxToDp(40)
  }
})