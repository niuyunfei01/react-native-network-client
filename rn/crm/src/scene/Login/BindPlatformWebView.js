import React, {PureComponent} from 'react'
import {BackHandler, InteractionManager, StyleSheet, View} from 'react-native'
import { WebView } from "react-native-webview"
import Config from "../../config"
import {bindActionCreators} from "redux"
import {connect} from "react-redux"
import NavigationItem from "../../widget/NavigationItem"
import PropType from "prop-types"
import {native} from "../../common";

const mapStateToProps = (state) => {
  return {
    global: state.global,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {dispatch, ...bindActionCreators({}, dispatch)}
}

class BindPlatformWebView extends React.Component {
  static propTypes = {
    canGoBack: PropType.bool,
  }
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state
    return {
      headerTitle: '绑定平台信息',
      headerRight: (
        <NavigationItem
          icon={require('../../img/refresh.png')}
          position={'right'}
          onPress={() => params.refresh()}
        />
      )
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      source: {},
      canGoBack: false,
    }
    this.do_go_back = this.do_go_back.bind(this)
    this.receiveMessage = this.receiveMessage.bind(this)
    window.addEventListener("message", this.receiveMessage, false);
  }

  onMessage = (e) => {
    let _this = this
    const msg = e.data
    console.log('on message web view msg canGoBack=>', msg)
  }

  receiveMessage = (e) => {
    let data = e.data
    if (data.method === 'invokeCallbackAndReturnFlushedQueue'){
      console.log('web view data =>', e)
      console.log('web view data =>', e.data)
    }
  }

  backHandler = () => {
    if (this.state.canGoBack) {
      this.webview.goBack()
      return true
    } else {
      this.props.navigation.goBack()
    }
  }

  onRefresh = () => {
    this.webview.reload()
  }

  do_go_back(msg) {
    const data = JSON.parse(msg)
    if (data.name && data.location && data.address) {
      const {goBack, state} = this.props.navigation
      const params = state.params
      if (params.actionBeforeBack) {
        params.actionBeforeBack(data)
      }
      console.log('goback', params)
      goBack()
    }
  }

  _onNavigationStateChange = (navState) => {
    if (navState.canGoBack !== this.state.canGoBack || navState.loading !== this.state.showLoading) {
      this.setState({
        canGoBack: navState.canGoBack,
        showLoading: navState.loading
      })
    }
    if (!navState.loading && 'about:blank' === navState.url && !navState.canGoBack && navState.canGoForward) {
      const {navigation} = this.props
      navigation.goBack()
    }
    return this._jumpIfShould(navState.url, navState)
  }
  _jumpIfShould = (url, navState) => {
  }

  _onShouldStartLoadWithRequest = (e) => {
    console.log(e)
    return this._jumpIfShould(e.url)
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.setParams({title: '加载中'})
      let {url, action} = this.props.route.params

      if (action === Config.LOC_PICKER) {
        let {center,} = this.props.route.params
        const key = '608d75903d29ad471362f8c58c550daf'
        url = Config.serverUrl(`/amap.php?key=${key}&center=${center}`)
        console.log("log_picker url: ", url)
      }
      this.setState({source: {uri: url, headers: {'Cache-Control': 'no-cache'}}})
    })

    BackHandler.addEventListener('hardwareBackPress', this.backHandler)

    this.props.navigation.setParams({backHandler: this.backHandler, refresh: () => this.onRefresh()})
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backHandler)
  }

  render() {
    return (
      <View style={styles.container}>
        <WebView
          ref={webview => {
            this.webview = webview
          }}
          onMessage={this.onMessage}
          onNavigationStateChange={this._onNavigationStateChange.bind(this)}
          onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest}
          automaticallyAdjustContentInsets={true}
          style={styles.webView}
          source={{html: `<iframe width="100%" height="100%" src="${this.state.source.uri}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`}}
          // source={this.state.source}
          onLoadEnd={(e) => this.onLoadEnd(e)}
          scalesPageToFit
        />

      </View>
    )
  }

  onLoadEnd(e) {
    if (e.nativeEvent.title.length > 0) {
      this.props.navigation.setParams({title: e.nativeEvent.title})
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  webView: {
    flex: 1,
    backgroundColor: 'white',
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BindPlatformWebView)
