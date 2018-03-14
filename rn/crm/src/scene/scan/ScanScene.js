import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import Config from "../../config";
import pxToDp from "../../util/pxToDp";
import Camera from 'react-native-camera';
export  default class ScanScene extends PureComponent{
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '扫码'
    }
  };
  render(){
    return(
        <View>
          <Text>
            999999
          </Text>
        </View>
    )
  }
}