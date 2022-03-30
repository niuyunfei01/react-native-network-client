import React, {PureComponent} from "react";
import {
  Alert,
  Image,
  InteractionManager,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import colors from "../../styles/colors";
import {hideModal, showError, showModal, showSuccess, ToastLong} from "../../util/ToastUtils";
import * as globalActions from "../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import Styles from "../../themes/Styles";
import Metrics from "../../themes/Metrics";
import tool from "../../common/tool";
import Icon from "react-native-vector-icons/Entypo";
import config from "../../config";
import {Cell, CellBody, Cells, Input} from "../../weui";
import CommonStyle from "../../common/CommonStyles";
import JbbText from "../component/JbbText";
import BottomModal from "../component/BottomModal";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class DeliveryList extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      show_type: 0,
      platform_delivery_bind_list: [],
      platform_delivery_unbind_list: [],
      master_delivery_bind_list: [],
      master_delivery_unbind_list: [],
      uuVisible: false,
      phone: '',
      uuCode: '',
      count_down: -1,
      msg: [
        '阿里旗下开放即时配送平台',
        '为饿了么平台的商户提供即时配送'
      ],
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  componentDidMount() {
  }

  fetchData() {
    showModal("请求中...")
    const {accessToken, currStoreId} = this.props.global
    const api = `/v1/new_api/Delivery/shop_bind_list?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId}).then((res) => {
      this.setState({
        platform_delivery_bind_list: res.wsb_deliveries.bind,
        platform_delivery_unbind_list: res.wsb_deliveries.unbind,
        master_delivery_bind_list: res.store_deliveries.bind,
        master_delivery_unbind_list: res.store_deliveries.unbind,
        show_type: res.from_bd !== undefined && res.from_bd ? 2 : 1,
      })
      hideModal()
    }).catch(() => {
      hideModal()
    })
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  renderHeader() {
    let show_type = this.state.show_type
    return (
      <View style={{
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.white,
        height: 40,
      }}>
        <TouchableOpacity style={{width: '50%', alignItems: "center"}} onPress={() => {
          this.setState({
            show_type: 1,
          })
        }}>
          <View style={{
            borderColor: colors.main_color,
            borderBottomWidth: show_type === 1 ? 3 : 0,
            height: 40,
            justifyContent: 'center',
          }}>
            <Text>外送帮自带</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={{width: '50%', alignItems: "center"}} onPress={() => {
          this.setState({
            show_type: 2,
          })
        }}>
          <View style={{
            borderColor: colors.main_color,
            borderBottomWidth: show_type === 2 ? 3 : 0,
            height: 40,
            justifyContent: 'center',
          }}>
            <Text>商家自有</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  rendermsg(type = []) {
    let items = []
    if (tool.length(type) > 0) {
      for (let msg of type) {
        items.push(<View style={[Styles.between, {marginTop: pxToDp(4), marginEnd: pxToDp(10)}]}>
          <Text style={{
            color: '#595959',
            fontSize: pxToDp(20)
          }}>{msg} </Text>
        </View>)
      }
    }
    return (
      <View style={{flex: 1}}>
        {items}
      </View>
    )
  }


  rendererrormsg(type = []) {
    let items = []
    if (tool.length(type) > 0) {
      for (let msg of type) {
        items.push(<View style={[Styles.between, {marginTop: pxToDp(4), marginEnd: pxToDp(10)}]}>
          <Text style={{
            color: '#EE2626',
            fontSize: pxToDp(20)
          }}>{msg} </Text>
        </View>)
      }
    }
    return (
      <View style={{flex: 1}}>
        {items}
      </View>
    )
  }

  bind(type) {
    showModal("请求中...")
    const {accessToken, currStoreId} = this.props.global
    const api = `/v1/new_api/Delivery/get_delivery_auth_url?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId, delivery_type: type}).then((res) => {
      hideModal()
      if (res.alert === 0) {
        if (res.route === 'BindDeliveryUU') {
          this.setState({
            uuVisible: true
          })
          return null;
        }
        this.onPress(res.route, {url: res.auth_url})
      } else if (res.alert === 2) {
        Alert.alert('绑定' + res.name, res.alert_msg, [
          {text: '取消', style: 'cancel'},
          {
            text: '去绑定', onPress: () => {

              if (res.route === 'BindDelivery') {
                this.onPress(res.route, {id: res.type, name: res.name});
                return null;
              }

              this.onPress(res.route, {url: res.auth_url});
            }
          },
        ])
      } else if (res.alert === 3) {
        this.onPress(res.route, {url: res.auth_url});
      } else {
        ToastLong(res.alert_msg)
      }
    }).catch(() => {
      hideModal()
    })
  }

  getUUPTAuthorizedToLog() {
    let {accessToken, currStoreId} = this.props.global
    let {phone, uuCode} = this.state
    let {currVendorId} = tool.vendor(this.props.global);
    if (!tool.length(phone) > 0 || !tool.length(uuCode) > 0) {
      ToastLong('请输入手机号或者验证码')
      return null;
    }
    showModal("加载中");
    const api = `/uupt/openid_auth/?access_token=${accessToken}&vendorId=${currVendorId}`
    HttpUtils.post.bind(this.props)(api, {
      user_mobile: phone,
      validate_code: uuCode,
      store_id: currStoreId
    }).then(res => {
      hideModal()
      this.fetchData()
      showSuccess('授权绑定成功')
      this.setState({
        uuVisible: false
      })
    }).catch((reason) => {
      hideModal()
      showError(reason)
    })
  }

  getUUPTPhoneCode() {
    let {accessToken} = this.props.global
    let {phone, count_down} = this.state
    let {currVendorId} = tool.vendor(this.props.global);
    if (count_down <= 0) {
      showModal("加载中");
      HttpUtils.get.bind(this.props)(`/uupt/message_authentication/${phone}`, {
        access_token: accessToken,
        vendorId: currVendorId
      }).then(res => {
        hideModal()
      }).catch((reason) => {
        hideModal()
        showError(reason)
      })
    }
  }

  getCountdown() {
    return this.state.count_down;
  }

  setCountdown(count_down) {
    this.setState({
      count_down: count_down
    });
  }

  startCountDown() {
    this.interval = setInterval(() => {
      this.setState({
        count_down: this.getCountdown() - 1
      })
      let countdown = Math.round(this.state.count_down)
      if (countdown === 0) {
        clearInterval(this.interval)
        this.setState({
          count_down: countdown
        })
      }
    }, 3200)
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


  renderItem(info) {
    return (
      <View style={[Styles.between, {
        paddingTop: pxToDp(14),
        paddingBottom: pxToDp(14),
        borderTopWidth: Metrics.one,
        borderTopColor: colors.colorDDD,
        backgroundColor: colors.white
      }]}>
        <Image style={[style.img]} source={{uri: info.img}}/>
        <View style={{flexDirection: 'column', paddingBottom: 5, flex: 1}}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginRight: pxToDp(20)
          }}>
            <Text style={{
              fontSize: pxToDp(28),
              color: colors.listTitleColor
            }}>{info.name} </Text>
          </View>
          <View style={{marginTop: pxToDp(10)}}>
            {info.has_diff ? this.rendererrormsg(info.diff_info) : this.rendermsg([info.desc])}
          </View>
        </View>


        <If condition={!tool.length(info.id) > 0}>
          {info.bind_type === 'wsb' ? <Text style={[style.status_err]}>申请开通</Text> :
            <Text style={[style.status_err]}>去授权</Text>}
        </If>

        <If condition={tool.length(info.id) > 0}>
          <View style={{
            width: pxToDp(120),
            marginRight: pxToDp(30),
            flexDirection: 'row'
          }}>
            <Text
              style={{
                height: 30,
                color: colors.main_color,
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                textAlignVertical: 'center',
                fontSize: pxToDp(26),
                ...Platform.select({
                  ios: {
                    lineHeight: 30,
                  },
                  android: {}
                }),
              }}>已绑定</Text>
            <Icon name='chevron-thin-right' style={{
              color: colors.main_color,
              fontSize: pxToDp(30),
              paddingTop: pxToDp(12),
              marginLeft: pxToDp(10),
            }}/>
          </View>
        </If>


        <If condition={info.platform === '9'}>
          <View style={{
            width: pxToDp(120),
            marginRight: pxToDp(30),
            flexDirection: 'row'
          }}>
            <Text
              style={{
                height: 30,
                color: "#EE2626",
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                textAlignVertical: 'center',
                ...Platform.select({
                  ios: {
                    lineHeight: 30,
                  },
                  android: {}
                }),
              }}>已停用</Text>
            <Icon name='chevron-thin-right' style={{
              color: "#EE2626",
              fontSize: pxToDp(40),
              paddingTop: pxToDp(7),
              marginLeft: pxToDp(10),
            }}/>
          </View>
        </If>
      </View>
    )
  }

  renderList(type = 1) {
    let list = [];
    if (type === 1) {
      list = list.concat(this.state.platform_delivery_unbind_list)
      list = list.concat(this.state.platform_delivery_bind_list)
    } else {
      list = list.concat(this.state.master_delivery_unbind_list)
      list = list.concat(this.state.master_delivery_bind_list)
    }
    let items = []
    for (let i in list) {
      const info = list[i]
      items.push(
        <TouchableOpacity
          style={{
            borderBottomWidth: pxToDp(1),
            borderBottomColor: colors.fontGray,
            marginLeft: pxToDp(10),
            marginRight: pxToDp(10),
          }}
          onPress={() => {
            if (tool.length(info.id) > 0) {
              this.onPress(config.ROUTE_DELIVERY_INFO, {delivery_id: info.id})
            } else {
              if (info.bind_type === 'wsb') {
                this.onPress(config.ROUTE_APPLY_DELIVERY, {delivery_id: info.v2_type});
              } else {
                this.bind(info.type)
              }
            }
          }}>
          {this.renderItem(info)}
        </TouchableOpacity>)
    }
    return (
      <ScrollView style={{
        flex: 1,
        margin: pxToDp(20),
        borderRadius: pxToDp(10),
        backgroundColor: colors.white
      }}>
        {items}
      </ScrollView>
    )
  }


  render() {
    return (<View>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
        <View style={{flex: 1}}>
          {this.renderHeader()}
          {this.renderList(this.state.show_type)}
        </View>
        <BottomModal
          title={'绑定UU跑腿'}
          actionText={'授权并登录'}
          onPress={() => this.getUUPTAuthorizedToLog()}
          visible={this.state.uuVisible}
          btnStyle={{
            backgroundColor: colors.main_color,
            borderWidth: 0,
          }}
          onClose={() => this.setState({
            uuVisible: false
          })}
        >
          <Cells style={styles.deliverCellBorder}>
            <Cell>
              <CellBody>
                <Input
                  value={this.state.phone}
                  editable={true}
                  underlineColorAndroid={"transparent"}
                  style={CommonStyle.inputH35}
                  clearButtonMode={true}
                  onChangeText={(value) => {
                    this._onChangePhone(value)
                  }}
                  keyboardType="numeric"
                  placeholder="请输入手机号"
                />
              </CellBody>
            </Cell>
            <Cell>
              <CellBody>
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginVertical: pxToDp(10)
                }}>
                  <Input
                    value={this.state.uuCode}
                    onChangeText={(code) => {
                      this._onChangeCode(code)
                    }}
                    editable={true}
                    underlineColorAndroid={"transparent"}
                    style={CommonStyle.inputH35}
                    clearButtonMode={true}
                    keyboardType="numeric"
                    placeholder="请输入验证码"
                  />
                  {this.state.count_down > 0 ?
                    <TouchableOpacity activeOpacity={1} style={{marginVertical: pxToDp(10)}}>
                      <JbbText style={styles.btn_style1}>{`${this.state.count_down}秒后重新获取`}</JbbText>
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => {
                      showSuccess('验证码发送成功！')
                      this.getUUPTPhoneCode()
                      this.setCountdown(60)
                      this.startCountDown()
                    }} style={{marginLeft: pxToDp(20)}}>
                      <JbbText style={styles.btn_style}>获取验证码</JbbText>
                    </TouchableOpacity>}
                </View>
              </CellBody>
            </Cell>
          </Cells>
        </BottomModal>
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryList)


const styles = StyleSheet.create({
  btn_style: {
    height: 35,
    backgroundColor: colors.main_color,
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
  cell_box: {
    margin: 0,
    padding: 10,
    backgroundColor: colors.main_back,
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  deliverCellBorder: {
    borderRadius: pxToDp(20)
  },
});


const style = StyleSheet.create({
  header_text: {
    height: 40,
    width: "50%",
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    color: colors.white,
    ...Platform.select({
      ios: {
        lineHeight: 40,
      },
      android: {}
    }),
  },
  check_staus: {
    backgroundColor: colors.white,
    color: colors.title_color,
  },

  img: {
    width: pxToDp(68),
    height: pxToDp(68),
    margin: pxToDp(30),
  },

  status_err: {
    fontSize: pxToDp(26),
    fontWeight: 'bold',
    padding: pxToDp(10),
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(5),
    marginRight: pxToDp(20),
    textAlign: 'center',
    width: pxToDp(130),
    color: colors.f7,
  },

})
