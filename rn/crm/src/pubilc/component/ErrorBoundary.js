import React from 'react'
import {errorPage} from "../../svg/svg";
import {SvgXml} from "react-native-svg";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import colors from "../styles/colors";
import HttpUtils from "../util/http";
import {connect} from "react-redux";
import GlobalUtil from "../util/GlobalUtil";
import {setDeviceInfo} from "../../reducers/device/deviceActions";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {hasError: false, error: '', errorInfo: ''}
    // global.ErrorUtils.setGlobalHandler(e => {
    //   const parseErrorStack = require('react-native/Libraries/Core/Devtools/parseErrorStack')
    //   const stack = parseErrorStack(e);
    //   const symbolicateStackTrace = require('react-native/Libraries/Core/Devtools/symbolicateStackTrace')
    //   symbolicateStackTrace(stack).then(prettyStack => {
    //     if (prettyStack) {
    //       // const errorInfo = 'file:' + prettyStack[0].file
    //       //   + '\nmethodName:' + prettyStack[0].methodName
    //       //   + '\nlineNumber:' + prettyStack[0].lineNumber
    //       //   + '\nerrorInfo:' + e.toString();
    //       this.setState({
    //         hasError: true,
    //         errorInfo: JSON.stringify(prettyStack)
    //       })
    //     }
    //   }).catch(error => this.setState({
    //     hasError: true,
    //     errorInfo: error
    //   }))
    // })

  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {hasError: true, error: error}
  }

  componentDidMount() {
    const {dispatch} = this.props
    GlobalUtil.getDeviceInfo().then(deviceInfo => {
      dispatch(setDeviceInfo(deviceInfo))
    })
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo.componentStack
    })

  }

  uploadData = () => {
    const {error, errorInfo} = this.state
    const {device} = this.props
    const {currStoreId, currentUser} = this.props.global
    const url = '/util/crm_error_report/1'
    const params = {
      APP_VERSION_CODE: device.deviceInfo.appVersion,
      CUSTOM_DATA: {
        'CURR-STORE': currStoreId,
        'UID': currentUser
      },
      BRAND: device.deviceInfo.brand,
      PHONE_MODEL: device.deviceInfo.device,
      STACK_TRACE: {
        error: `${error}`,
        errorInfo: `${errorInfo}`,
        currentRouteName: global.currentRouteName
      }
    };

    HttpUtils.post(url, params).then(res => {

    }).catch(error => {

    })
  }


  goBack = () => {
    this.uploadData()
    this.setState({hasError: false})
  }
  getErrorPage = () => {
    return (
      <View style={styles.page}>
        <SvgXml xml={errorPage()}/>
        <TouchableOpacity style={styles.btnWrap} onPress={this.goBack}>
          <Text style={styles.text} allowFontScaling={false}>
            返回订单页
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return this.getErrorPage()
    }

    return this.props.children
  }
}

function mapStateToProps(state) {
  const {global, device} = state;
  return {global: global, device: device}
}

export default connect(mapStateToProps)(ErrorBoundary)

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f7f7f7',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnWrap: {
    marginTop: 75,
    borderRadius: 2,
    backgroundColor: colors.main_color
  },
  text: {
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 16,
    color: colors.white,
    lineHeight: 22
  }
})
