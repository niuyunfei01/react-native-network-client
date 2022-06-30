import React, {PureComponent} from "react";
import ReactNative, {ScrollView, Text, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";

import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import WebView from "react-native-webview";
import HttpUtils from "../../../pubilc/util/http";

const {StyleSheet} = ReactNative

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        ...globalActions
      },
      dispatch
    )
  };
}

class HistoryNoticeScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      time: '',
      content: '',
      height: Dimensions.get('window').height,
      id: 0
    };
  }

  componentDidMount() {
    let data = this.props.route.params.content
    this.setState({
      title: data.title,
      time: data.created_format,
      content: data.detail,
      id: data.id
    }, () => {
      setTimeout(() => {
        this.clearRecord()
      }, 1000)
    })
  }

  // 去除提示小红点
  clearRecord = () => {
    const {accessToken} = this.props.global;
    const api = `/v1/new_api/advice/recordAdvice/${this.state.id}`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken
    }).then((res) => {
      console.log(res, 'res')
    })
  }

  render() {
    let {title, time, content, height} = this.state
    return (
      <ScrollView style={Styles.scrollStyle}>
        <View style={Styles.Content}>
          <Text style={Styles.Title}>{title}</Text>
          <WebView
            style={{
              width: Dimensions.get('window').width * 0.90,
              height: height * 0.9
            }}
            automaticallyAdjustContentInsets={true}
            source={{html: `${content}`}}
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
            onMessage={(event) => {
              this.setState({height: +event.nativeEvent.data})
            }}
          />
          <Text style={Styles.timeText}>{time}</Text>
        </View>
      </ScrollView>
    );
  }

  cutAdvicesContent = (val) => {
    let str = val
    if (str.length > 30) {
      str = str.substr(0, 30) + '.....'
    }
    return str
  }

}

const Styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  scrollStyle: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.background
  },
  Content: {
    width: '98%',
    marginLeft: '1%',
    backgroundColor: colors.white,
    borderRadius: pxToDp(20),
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative"
  },
  Title: {
    fontSize: 22,
    fontWeight: "bold",
    color: '#000000'
  },
  ContentText: {
    fontSize: 22,
    color: colors.color333,
    marginVertical: 30
  },
  timeText: {
    position: "absolute",
    bottom: 10, left: 25,
    fontSize: 20,
    color: colors.color999,
    marginBottom: 10
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HistoryNoticeScene);
