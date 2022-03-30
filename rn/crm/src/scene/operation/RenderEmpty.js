import pxToDp from "../../util/pxToDp";
import React, {PureComponent} from 'react';
import {Image, Text, View,} from 'react-native';

class RenderEmpty extends PureComponent {
  render() {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: pxToDp(200)}}>
        <Image style={{width: pxToDp(100), height: pxToDp(135)}}
               source={require('../../pubilc/img/Goods/zannwujilu.png')}/>
        <Text style={{fontSize: pxToDp(24), color: '#bababa', marginTop: pxToDp(30)}}>没有相关记录</Text>
      </View>
    )

  }
}

export default RenderEmpty;
