import {Text, View} from 'react-native'
import React from 'react';
import colors from "../../../pubilc/styles/colors";

const EmptyListView = (props) => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, height: 500}}><Text
      style={{color: colors.color333}}>暂无数据</Text></View>)
};

export default EmptyListView
