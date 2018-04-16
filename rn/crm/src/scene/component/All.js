import React, { PureComponent } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput
} from "react-native";

import pxToDp from "../../util/pxToDp";
class Left extends PureComponent {
  static defaultProps = {
    isOne: true
  };
  render() {
    const {
      title,
      info,
      right,
      onPress,
      onChangeText,
      category,
      placeholder,
      value,
      type,
      isOne,
      maxLength
    } = this.props;
    return (
      <TouchableOpacity onPress={onPress}>
        <View
          style={{
            paddingVertical: 15,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            paddingHorizontal: pxToDp(31)
          }}
        >
          <Text style={{ fontSize: 16, color: "#333", width: 85 }}>
            {title}
          </Text>
          {info ? (
            <Text
              numberOfLines={1}
              style={{ fontSize: 14, color: "#7A7A7A", flex: 1 }}
            >
              {info}
            </Text>
          ) : (
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder={placeholder}
                underlineColorAndroid="transparent"
                style={{ padding: 0, fontSize: 14 }}
                maxLength={maxLength}
                placeholderTextColor={"#7A7A7A"}
                keyboardType={type}
                value={value}
                onChangeText={onChangeText}
              />
            </View>
          )}

          {right}
        </View>
        <View style={{ height: 1, backgroundColor: "#f2f2f2" }} />
      </TouchableOpacity>
    );
  }
}

class Adv extends PureComponent {
  render() {
    const {
      title,
      right,
      onChangeText,
      placeholder,
      value,
      maxLength
    } = this.props;
    return (
      <TouchableOpacity>
        <View
          style={{
            paddingVertical: 15,
            backgroundColor: "#fff",
            paddingHorizontal: pxToDp(31)
          }}
        >
          <Text style={{ fontSize: 16, color: "#333", width: 85 }}>
            {title}
          </Text>
          <TextInput
            placeholder={placeholder}
            underlineColorAndroid="transparent"
            style={{ padding: 0, fontSize: 14 }}
            maxLength={maxLength}
            style={{ marginTop: 6, marginBottom: 3 }}
            placeholderTextColor={"#7A7A7A"}
            value={value}
            onChangeText={onChangeText}
          />
          <Text style={{ fontSize: 14, color: "#ccc", textAlign: "right" }}>
            {right}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: "#f2f2f2" }} />
      </TouchableOpacity>
    );
  }
}

export { Left, Adv };
