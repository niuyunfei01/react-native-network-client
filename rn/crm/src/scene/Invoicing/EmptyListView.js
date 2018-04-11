import {
  View,
  Text
} from 'react-native'
import React, {Component} from 'react';
import pxToDp from "../../util/pxToDp";

const EmptyListView = (props) => {
  return (
    <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: pxToDp(300)}}><Text style={{flex: 1}}>暂无数据</Text></View>)
};

export default EmptyListView