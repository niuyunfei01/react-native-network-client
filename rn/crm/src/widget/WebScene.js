/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

import React, {PureComponent} from 'react'
import {View, Text, StyleSheet, WebView, InteractionManager, Platform} from 'react-native'
import Config from "../config";

// create a component
class WebScene extends PureComponent {

  static navigationOptions = ({navigation}) => ({
    headerStyle: {backgroundColor: 'white'},
    title: navigation.state.params.title,
    header: null,
  });

  constructor(props: Object) {
    super(props)
    this.state = {
      source: {},
    }

    this._do_go_back = this._do_go_back.bind(this)
  }

  postMessage = (obj) => {
    if (this.webview) {
      this.webview.postMessage(JSON.stringify(obj));
      console.log('post----', obj)
    }
  }

  onMessage = (e) => {
    const msg = e.nativeEvent.data;
    if (typeof msg === 'string') {
      this._do_go_back(msg);
    }
  }

  _do_go_back(msg) {
    const data = JSON.parse(msg)
    if (data.name && data.location && data.address) {
      const {goBack, state} = this.props.navigation;
      const params = state.params;
      if (params.actionBeforeBack) {
        params.actionBeforeBack(data)
      }
      console.log('goback', params)
      goBack()
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.setParams({title: '加载中'})
      let {url, action} = this.props.navigation.state.params;

      if (action === Config.LOC_PICKER) {
        let {center,} = this.props.navigation.state.params;
        const key = '608d75903d29ad471362f8c58c550daf';
        url = `https://www.cainiaoshicai.cn/amap.php?key=${key}&center=${center}`;
      }
      this.setState({source: {uri: url}})
    })
  };


  render() {
    return (
      <View style={styles.container}>
        <WebView
          ref={webview => {
            this.webview = webview;
          }}
          onMessage={this.onMessage}
          automaticallyAdjustContentInsets={false}
          style={styles.webView}
          source={this.state.source}
          onLoadEnd={(e) => this.onLoadEnd(e)}
          scalesPageToFit
        />
      </View>
    );
  }

  onLoadEnd(e: any) {
    if (e.nativeEvent.title.length > 0) {
      this.props.navigation.setParams({title: e.nativeEvent.title})
    }
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  webView: {
    flex: 1,
    backgroundColor: 'white',
  }
});

//make this component available to the app
export default WebScene;
