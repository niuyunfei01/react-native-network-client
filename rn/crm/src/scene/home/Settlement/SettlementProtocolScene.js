import React, {PureComponent} from "react";
import {Dimensions, StyleSheet, View, Text} from "react-native";
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import WebView from "react-native-webview";
import 'react-native-get-random-values';

let {width} = Dimensions.get('window');

const Styles = StyleSheet.create({
  Content: {
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  signText: {
    color: colors.color333,
    fontSize: 14
  },
  bottomBox: {
    backgroundColor: colors.f5,
    width: width,
    padding: 10,
  }
})

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class SettlementProtocol extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      ptl_sign: this.props.route.params?.ptl_sign || ''
    };
  }

  render() {
    let {ptl_sign} = this.state;
    return (
      <View style={Styles.Content}>
        <WebView
          style={{
            width: width * 0.9,
            flex: 1,
            backgroundColor: 'white'
          }}
          automaticallyAdjustContentInsets={true}
          source={{uri: 'https://fire7.waisongbang.com/SettlePolicy.html'}}
          scrollEnabled={true}
          scalesPageToFit
        />
        <If condition={ptl_sign}>
          <View style={Styles.bottomBox}>
            <Text style={Styles.signText}>{ptl_sign} </Text>
          </View>
        </If>
      </View>
    );
  }

}

export default connect(mapStateToProps)(SettlementProtocol);
