import React from 'react'
import {Image, Text, View} from "react-native";
import pxToDp from "../../util/pxToDp";

export default class EmptyData extends React.Component {
  render (): React.ReactNode {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
        <Image style={{width: pxToDp(100), height: pxToDp(135)}}
               source={require('../../img/Goods/zannwujilu.png')}/>
        <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>没有相关记录</Text>
      </View>
    )
  }
}