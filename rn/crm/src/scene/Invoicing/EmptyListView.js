import {
  View,
  Text
} from 'react-native'
import React, {Component} from 'react';
import pxToDp from "../../util/pxToDp";

const EmptyListView = (props) => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}><Text>暂无数据</Text></View>)
};

export default EmptyListView