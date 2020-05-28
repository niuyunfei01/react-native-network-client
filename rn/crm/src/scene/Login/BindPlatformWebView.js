import React, {PureComponent} from 'react'
import {BackHandler, InteractionManager, StyleSheet, View, WebView} from 'react-native'
import Config from "../../config"
import {bindActionCreators} from "redux"
import {connect} from "react-redux"
import NavigationItem from "../../widget/NavigationItem"
import PropType from "prop-types"

mapStateToProps = (state) => {
  return {
    global: state.global,
  }
}

mapDispatchToProps = (dispatch) => {
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
  }

  postMessage = (obj) => {
    if (this.webview) {
      this.webview.postMessage(JSON.stringify(obj))
      console.log('post----', obj)
    }
  }

  onMessage =(e, origin)=> {
    console.log(222222);
      console.log(e);
    console.log('###############');
    console.log(origin);
    console.log(3333333);
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
    console.log(this)
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
      let {url, action} = this.props.navigation.state.params

      if (action === Config.LOC_PICKER) {
        let {center,} = this.props.navigation.state.params
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
          source={this.state.source}
          onLoadEnd={(e) => this.onLoadEnd(e)}
          scalesPageToFit
        />
      </View>
    )
  }

  onLoadEnd(e: any) {
    if (e.nativeEvent.title.length > 0) {
      this.props.navigation.setParams({title: e.nativeEvent.title})
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  webView: {
    flex: 1,
    backgroundColor: 'white',
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BindPlatformWebView)
