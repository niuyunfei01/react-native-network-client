import {Text, View} from 'react-native'
import React from 'react';

const EmptyListView = (props) => {
  return (
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 1, height: 500}}><Text>暂无数据</Text></View>)
};

export default EmptyListView
