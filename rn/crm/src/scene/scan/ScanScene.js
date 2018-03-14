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
import BarcodeScanner from 'react-native-barcodescanner';
export  default class ScanScene extends PureComponent{
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '扫码'
    }
  };
  constructor(props){
    super(props)
    this.state = {
      torchMode: 'off',
      cameraType: 'back',
    };
  }

  render(){
    return(
          <BarcodeScanner
              onBarCodeRead={this.barcodeReceived}
              style={{ flex: 1 }}
              torchMode={'off'}
              cameraType={this.state.cameraType}
          />
    )
  }
}