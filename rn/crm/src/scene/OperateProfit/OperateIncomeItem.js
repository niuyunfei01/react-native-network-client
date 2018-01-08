import React, {PureComponent} from 'react'
import {Text, View, StyleSheet} from 'react-native'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";


class OperateIncomeItem extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <View style={item.wrapper}>
          <View style={item.title_wrapper}>
            <Text style = {item.title_text}>配送费收入</Text>
            <View style={item.money}>
              <Text>135.66</Text>
              <Text>置为无效</Text>
            </View>
          </View>
        </View>
    )
  }
}

const item = StyleSheet.create({
  wrapper: {
    paddingHorizontal: pxToDp(30),
  },
  title_wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    height: pxToDp(90),
    alignItems: 'center'
  },
  title_text: {
    height: pxToDp(30),
    color: "#3f3f3f",
  },
  title_money:{
    height: pxToDp(36),
    color: "#3f3f3f",
  },
  money: {
    flexDirection: 'row',
  }
})

export default OperateIncomeItem;