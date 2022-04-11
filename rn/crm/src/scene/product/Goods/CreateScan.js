import React, {Component} from "react";
import {TouchableOpacity, View} from "react-native";
import pxToDp from "../../../pubilc/util/pxToDp";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default class CreateScan extends Component {
  //导航
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerLeft: () => (
          <TouchableOpacity
            style={{
              width: pxToDp(48),
              height: pxToDp(48),
              marginLeft: pxToDp(31),
              marginTop: pxToDp(20)
            }}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome5 name={'arrow-left'} style={{fontSize: 25}}/>
          </TouchableOpacity>
      )
    };
  };

  render() {
    return <View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.8)"}}/>;
  }
}
