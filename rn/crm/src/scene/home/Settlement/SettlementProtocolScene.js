import React, {PureComponent} from "react";
import {Dimensions, StyleSheet, View, Text, BackHandler} from "react-native";
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import WebView from "react-native-webview";
import 'react-native-get-random-values';
import Entypo from "react-native-vector-icons/Entypo";
import Config from "../../../pubilc/common/config";

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
  },
  headerLeft: {
    color: colors.color333,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10
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
      ptl_sign: this.props.route.params?.ptl_sign || '',
      isShow: this.props.route.params?.showPrompt || false
    };
  }

  componentDidMount() {
    let {navigation} = this.props;
    navigation.setOptions({
      headerLeft: () => this.renderHeaderLeft()
    })
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress", () => this.handlerBackPress());
  }

  handlerBackPress = () => {
    let {isShow} = this.state;
    if (this.props.navigation.isFocused() && isShow) {
      this.props.route.params.onBack && this.props.route.params.onBack(isShow)
    }
  }

  componentWillUnmount() {
    this.backHandler.remove()
  }

  renderHeaderLeft = () => {
    return (
      <Entypo name={"chevron-thin-left"} style={Styles.headerLeft} onPress={() => this.goBack()} />
    )
  }

  goBack = () => {
    let {isShow} = this.state;
    this.props.route.params.onBack && this.props.route.params.onBack(isShow)
    this.props.navigation.goBack()
  }

  render() {
    let {ptl_sign} = this.state;
    let {store_id, accessToken} = this.props.global;
    return (
      <View style={Styles.Content}>
        <WebView
          style={{
            width: width * 0.9,
            flex: 1,
            backgroundColor: 'white'
          }}
          automaticallyAdjustContentInsets={true}
          source={{uri: `${Config.serverUrl('/api/settle_protocol_page')}/${store_id}?access_token=${accessToken}`}}
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
