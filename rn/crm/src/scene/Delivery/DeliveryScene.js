import React, {PureComponent} from 'react'
import {
  Alert,
  Image,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import {WingBlank} from '@ant-design/react-native'
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions"
import pxToDp from "../../util/pxToDp";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {hideModal, showError, showModal, showSuccess} from "../../util/ToastUtils";
import HttpUtils from "../../util/http";
import JbbText from "../component/JbbText";
import * as tool from "../../common/tool";
import Dialog from "../../weui/Dialog/Dialog";
import {Input} from "../../weui/index";


function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const customerOpacity = 0.6;
var ScreenWidth = Dimensions.get("window").width;


function FetchDeliveryData({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class DeliveryScene extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      menu: [],
      isRefreshing: false,
      phone: '',
      uuVisible: false,
      uuCode: '',
      count_down: -1
    };
    this.queryDeliveryList();
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval)
  }

  checkAlert(route, params = {}) {
    if (params !== {} && params.alert === true && route !== 'BindDeliveryUU') {
      Alert.alert('绑定提示', params.alert_msg, [{
        text: '取消授权'
      }, {
        text: '开始授权',
        onPress: () => {
          this.onPress(route, params);
        }
      }])
    } else if (route === 'BindDeliveryUU') {
      Alert.alert('绑定提示', '验证手机号绑定UU跑腿', [{
        text: '取消授权'
      }, {
        text: '开始授权',
        onPress: () => {
          this.setState({
            uuVisible: true
          })
        }
      }])
    } else {
      this.onPress(route, params);
    }
  }


  queryDeliveryList() {
    let {accessToken} = this.props.global
    showModal("加载中");
    HttpUtils.get.bind(this.props)(`/v1/new_api/Delivery/index`, {access_token: accessToken}).then(res => {
      this.setState({data: res.data, menu: res.menus});
      hideModal()
    })
  }

  onPress(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      if (route === '') {
        showError("当前版本不支持改配送")
      } else {
        this.props.navigation.navigate(route, params);
      }
    });
  }

  getUUPTPhoneCode() {
    let {accessToken} = this.props.global
    let {phone, count_down} = this.state
    let {currVendorId} = tool.vendor(this.props.global);
    if (count_down <= 0) {
      showModal("加载中");
      HttpUtils.get.bind(this.props)(`/uupt/message_authentication/${phone}`, {access_token: accessToken, vendorId: currVendorId}).then(res => {
        hideModal()
      }).catch((reason) => {
        hideModal()
        showError(reason)
      })
    }
  }

  getUUPTAuthorizedToLog() {
    let {accessToken} = this.props.global
    let {phone, uuCode} = this.state
    let {currVendorId} = tool.vendor(this.props.global);
    const vendorId = currVendorId
    showModal("加载中");
    const api = `/uupt/openid_auth/?access_token=${accessToken}&vendorId=${vendorId}`
    HttpUtils.post.bind(this.props)(api, {
      user_mobile: phone,
      validate_code: uuCode,
      store_id: currVendorId
    }).then(res => {
      hideModal()
      showSuccess('授权绑定成功')
    }).catch((reason) => {
      hideModal()
      showError(reason)
    })
  }

  onRequestClose() {
    this.setState({uuVisible: false})
  }

  _onChangePhone(value) {
    this.setState({
      phone: value
    })
  }

  _onChangeCode(code) {
    this.setState({
      uuCode: code
    })
  }

  startCountDown() {
    this.interval = setInterval(() => {
      this.setState({
        count_down: this.getCountdown() - 1
      })
      let countdown = Math.round(this.state.count_down)
      if(countdown == 0) {
        clearInterval(this.interval)
        this.setState({
          count_down: countdown
        })
      }
    }, 3200)
  }

  getCountdown() {
    return this.state.count_down;
  }

  setCountdown(count_down) {
    this.setState({
      count_down: count_down
    });
  }

  render() {
    let {count_down} = this.state
    let data = this.state.data ? this.state.data : [];
    let menu = this.state.menu ? this.state.menu : [];
    return (
      <ScrollView style={styles.container}
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.isRefreshing}
                      onRefresh={() => this.queryDeliveryList()}
                      tintColor='gray'/>
                  }>
        <FetchDeliveryData navigation={this.props.navigation} onRefresh={this.queryDeliveryList.bind(this)}/>
        {data.length > 0 ? (
          <View>
            <WingBlank style={{marginTop: 20, marginBottom: 5,}}>
              <Text style={{marginBottom: 10}}>已绑定</Text>
            </WingBlank>
            <View style={[block_styles.container]}>
              {data.map(item => (
                <TouchableOpacity
                  style={[block_styles.block_box]}
                  onPress={() => {
                    showError("当前版本不能修改或删除")
                  }}
                  activeOpacity={customerOpacity}>
                  {
                    <Image
                      style={[block_styles.block_img]}
                      source={{uri: item.img}}
                    />
                  }
                  <JbbText style={[block_styles.block_name]}>{item.name}</JbbText>
                </TouchableOpacity>
              ))}

            </View>
          </View>
        ) : (<View>
        </View>)}
        <WingBlank style={{marginTop: 20, marginBottom: 5,}}>
          <Text style={{marginBottom: 10}}>未绑定</Text>
        </WingBlank>
        {menu.length > 0 ? (
          <View style={[block_styles.container]}>

            {menu.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[block_styles.block_box]}
                onPress={() => this.checkAlert(item.route, {...item})}
                activeOpacity={customerOpacity}>
                <Image
                  style={[block_styles.block_img]}
                  source={!!item.img
                    ? {uri: item.img}
                    : require("../../img/My/touxiang180x180_.png")}
                />
                <JbbText style={[block_styles.block_name]}>{item.name}</JbbText>
              </TouchableOpacity>
            ))}
          </View>
        ) : (<View>
        </View>)}
        <Dialog onRequestClose={() => {
          this.onRequestClose()
        }} visible={this.state.uuVisible}
        title={'绑定UU跑腿'}
        titleStyle={{textAlign: 'center'}}
        >
          <View style={{backgroundColor: colors.white, flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", marginLeft: pxToDp(30)}}>
            <View style={{marginVertical: pxToDp(10)}}>
              <Input
                  value={this.state.phone}
                  underlineColorAndroid={"transparent"}
                  style={styles.inputH35}
                  clearButtonMode={true}
                  onChangeText={(value) => {this._onChangePhone(value)}}
                  placeholder=" 请 输 入 手 机 号                 "
                  keyboardType="numeric"
                  borderWidth={1}
              />
            </View>
            <View style={{flexDirection: "row", marginVertical: pxToDp(10), alignItems: "center"}}>
              <Input
                  value={this.state.uuCode}
                  onChangeText={(code) => {this._onChangeCode(code)}}
                  underlineColorAndroid={"transparent"}
                  style={styles.inputH35}
                  clearButtonMode={true}
                  placeholder=" 请 输 入 验 证 码                 "
                  keyboardType="numeric"
                  borderWidth={1}
              />
              {count_down > 0 ?
                  <TouchableOpacity style={{marginLeft: pxToDp(20)}} activeOpacity={1}>
                    <JbbText style={styles.btn_style1}>{`验证码${count_down}秒`}</JbbText>
                  </TouchableOpacity> :
                  <TouchableOpacity onPress={() => {
                    this.getUUPTPhoneCode()
                    this.setCountdown(30)
                    this.startCountDown()
                  }} style={{marginLeft: pxToDp(20)}}>
                    <JbbText style={styles.btn_style}>获取验证码</JbbText>
                  </TouchableOpacity>}
            </View>
            <View style={{marginLeft: '30%'}}>
              <TouchableOpacity onPress={() => {this.getUUPTAuthorizedToLog()}}>
                <JbbText style={styles.btn_style}>授权并登录</JbbText>
              </TouchableOpacity>
            </View>
          </View>
        </Dialog>
      </ScrollView>

    );
  }
}

const styles = StyleSheet.create({
  fn_price_msg: {
    fontSize: pxToDp(30),
    color: "#333"
  },
  help_msg: {
    fontSize: pxToDp(30),
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#00aeff"
  },
  btn_style: {
    height: 35,
    backgroundColor: colors.color333,
    color: 'white',
    fontSize: pxToDp(30),
    textAlign: "center",
    paddingTop: pxToDp(10),
    paddingHorizontal: pxToDp(10),
    borderRadius: pxToDp(10)
  },
  btn_style1: {
    height: 35,
    backgroundColor: colors.colorBBB,
    color: 'white',
    fontSize: pxToDp(30),
    textAlign: "center",
    paddingTop: pxToDp(10),
    paddingHorizontal: pxToDp(10),
    borderRadius: pxToDp(10)
  },
  inputH35: {
    lineHeight: 20,
    fontSize: 15,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: pxToDp(10)
  },
});

const block_styles = StyleSheet.create({
  container: {
    marginBottom: pxToDp(22),
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.white
  },
  block_box: {
    //剩1个格子用正常样式占位
    // width: pxToDp(239),
    // height: pxToDp(188),
    width: ScreenWidth / 4,
    height: ScreenWidth / 4,
    backgroundColor: colors.white,

    // borderColor: colors.main_back,
    // borderWidth: pxToDp(1),
    alignItems: "center"
  },
  empty_box: {
    //剩2个格子用这个样式占位
    width: pxToDp(478),
    height: pxToDp(188),
    backgroundColor: colors.white,

    borderColor: colors.main_back,
    borderWidth: pxToDp(1),
    alignItems: "center"
  },
  block_img: {
    marginTop: pxToDp(30),
    marginBottom: pxToDp(16),
    width: pxToDp(60),
    height: pxToDp(60)
  },
  block_name: {
    color: colors.color666,
    fontSize: pxToDp(26),
    lineHeight: pxToDp(28),
    textAlign: "center"
  },
  notice_point: {
    width: pxToDp(30),
    height: pxToDp(30),
    borderRadius: pxToDp(15),
    backgroundColor: '#f00',
    position: 'absolute',
    right: pxToDp(60),
    top: pxToDp(20),
    zIndex: 99
  }
});
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(DeliveryScene);
