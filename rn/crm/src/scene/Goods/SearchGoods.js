import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput
} from "react-native";
import { NavigationItem } from "../../widget";
import pxToDp from "../../util/pxToDp";

export default class SearchGoods extends Component {
  //导航
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31)
            // marginTop: pxToDp(20)
          }}
          children={
            <View
              style={{
                height: pxToDp(68),
                marginRight: pxToDp(31),
                borderRadius: 30,
                borderColor: "#59b26a",
                borderWidth: 1,
                flexDirection: "row",
                // paddingHorizontal: 5,
                // paddingVertical: 10,

                alignItems: "center"
              }}
            >
              <TextInput
                style={[
                  {
                    fontSize: 14,
                    flex: 1,
                    paddingVertical: 5,
                    paddingLeft: 5
                  }
                ]}
                placeholder={"请输入搜索内容"}
                underlineColorAndroid="transparent"
                placeholderTextColor={"#bfbfbf"}
              />
              <Image
                source={require("../../img/new/searchG.png")}
                style={{ width: 20, height: 20, marginRight: 5 }}
              />
            </View>
          }
          onPress={() => navigation.goBack()}
        />
      )
    };
  };
  render() {
    return <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)" }} />;
  }
}
