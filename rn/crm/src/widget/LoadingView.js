"use strict";

import ReactNative from "react-native";
import React from "react";

const {
  ActivityIndicator,
  ActivityIndicatorIOS,
  Platform,
  Text,
  StyleSheet,
  View
} = ReactNative;

export default class LoadingView extends React.Component {
  render() {
    return (
      <View style={styles.loading}>
        {Platform.OS === "android" ? (
          <ActivityIndicator styleAttr="LargeInverse" color="#3e9ce9" />
        ) : (
          <ActivityIndicatorIOS size="large" />
        )}
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center"
  }
});

// export default LoadingView;
