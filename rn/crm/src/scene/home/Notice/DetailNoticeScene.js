import React, {PureComponent} from "react";
import {Dimensions, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";

import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import WebView from "react-native-webview";
import 'react-native-get-random-values';
import HttpUtils from "../../../pubilc/util/http";

let {width} = Dimensions.get('window');

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
      id: 0,
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
    })
  }

  render() {
    let {title, time, content} = this.state
    return (
      <View style={Styles.Content}>
        <Text style={Styles.Title}>{title} </Text>
        <WebView
          style={{
            width: width * 0.9,
            flex: 1,
            backgroundColor: 'white',
          }}
          automaticallyAdjustContentInsets={true}
          source={{html: `${content}`}}
          scrollEnabled={true}
          scalesPageToFit
        />
        <Text style={Styles.timeText}>{time} </Text>
      </View>
    );
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
    flex: 1
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
    bottom: 10, right: 25,
    fontSize: 20,
    color: colors.color999,
    marginBottom: 10
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HistoryNoticeScene);
