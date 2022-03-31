import React, {Component} from "react";
import {View} from "react-native";
import {NavigationItem} from "../../../widget";
import pxToDp from "../../../util/pxToDp";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default class CreateScan extends Component {
  //导航
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerLeft: () => (
          <NavigationItem
              icon={<FontAwesome5 name={'arrow-left'} style={{fontSize: 25}}/>}
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
