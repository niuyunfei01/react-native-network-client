import React, {Component} from "react";
import {View} from "react-native";
import {NavigationItem} from "../../widget";
import pxToDp from "../../util/pxToDp";

export default class CreateScan extends Component {
  //导航
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerLeft: ()=>(
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31),
            marginTop: pxToDp(20)
          }}
          onPress={() => navigation.goBack()}
        />
      )
    };
  };

  render() {
    return <View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.8)"}}/>;
  }
}
