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
import pxToDp from "../../../pubilc/util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import {hideModal, showModal, showSuccess, ToastShort} from "../../../pubilc/util/ToastUtils";
import * as globalActions from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import tool from "../../../pubilc/util/tool";
import Icon from "react-native-vector-icons/Entypo";
import config from "../../../pubilc/common/config";
import {Cell, CellBody, Cells, Input} from "../../../weui";
import JbbText from "../../common/component/JbbText";
import BottomModal from "../../../pubilc/component/BottomModal";
import PixelRatio from "react-native/Libraries/Utilities/PixelRatio";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {Button} from "react-native-elements";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
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
      gxdVisible: false,
      phone: '',
      phone_code: '',
      count_down: -1,
      msg: [],
      show_unbind_all: false,
      unbind_id: 0,
      unbind_name: "",
      unbind_url: null,
      show_modal: false,
      modal_msg: ""
    }

    const {navigation} = props;
    navigation.setOptions(
      {
        headerRight: (() => (
            <TouchableOpacity
              style={{
                marginRight: 10,
              }}
              onPress={() => {
                this.setState({
                  show_unbind_all: !this.state.show_unbind_all,
                  unbind_url: null,
                  unbind_name: "",
                  show_type: 2,
                  unbind_id: 0
                })
              }}
            >
              <Text style={{fontSize: 14, color: colors.color333}}>解绑</Text>
            </TouchableOpacity>)
        )
      }
    );
  }

  fetchData = () => {
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

  onPress = (route, params = {}, callback = {}) => {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  renderHeader = () => {
    let show_type = this.state.show_type
    if (this.props.route.params && this.props.route.params.tab !== undefined) {
      this.setState({
        show_type: this.props.route.params.tab
      })
    }
    return (
      <View style={{
        width: '100%',
        flexDirection: 'row',
        backgroundColor: colors.white,
        height: 40,
      }}>
        <TouchableOpacity style={{width: '50%', alignItems: "center"}} onPress={() => {
          if (this.state.show_unbind_all) {
            ToastShort("暂不支持解绑外送帮账户");
            return;
          }
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
            <Text style={{color: colors.color333}}>外送帮自带</Text>
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
            <Text style={{color: colors.color333}}>商家自有</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  rendermsg = (type = []) => {
    let items = []
    if (tool.length(type) > 0) {
      for (let msg of type) {
        items.push(<View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: pxToDp(4),
          marginEnd: pxToDp(10)
        }}>
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


  rendererrormsg = (type = []) => {
    let items = []
    if (tool.length(type) > 0) {
      for (let msg of type) {
        items.push(<View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: pxToDp(4),
          marginEnd: pxToDp(10)
        }}>
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


  handleGrandAuth = (res) => {
    switch (res.alert) {
      case 0:
        if (res.route === 'BindDeliveryUU') {
          this.setState({
            uuVisible: true
          })
          return null;
        }

        if (res.route === 'GuoXiaoDi') {
          this.setState({
            gxdVisible: true
          })
          return null;
        }
        this.onPress(res.route, {url: res.auth_url})
        break
      case 1:

        break
      case 2:
        this.onPress('BindShunfeng', {res: res})

        break
      case 3:
        this.onPress(res.route, {url: res.auth_url});
        break
      default:
        ToastShort(res.alert_msg)
        break
    }
  }

  bind = (type) => {
    showModal("请求中...")
    const {accessToken, currStoreId} = this.props.global
    const api = `/v1/new_api/Delivery/get_delivery_auth_url?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId, delivery_type: type}).then((res) => {
      hideModal()
      this.handleGrandAuth(res)
    }).catch(() => {
      hideModal()
    })
  }

  getUUPTAuthorizedToLog = () => {
    let {accessToken, currStoreId} = this.props.global
    let {phone, phone_code} = this.state
    let {currVendorId} = tool.vendor(this.props.global);
    if (!tool.length(phone) > 0 || !tool.length(phone_code) > 0) {
      ToastShort('请输入手机号或者验证码')
      return null;
    }
    const api = `/uupt/openid_auth/?access_token=${accessToken}&vendorId=${currVendorId}`
    HttpUtils.post.bind(this.props)(api, {
      user_mobile: phone,
      validate_code: phone_code,
      store_id: currStoreId
    }).then(res => {
      this.fetchData()
      this.setState({
        uuVisible: false
      }, () => ToastShort(res.desc))
    }).catch((reason) => {
      ToastShort(reason.desc)
    })
  }

  getUUPTPhoneCode = () => {
    let {accessToken} = this.props.global
    let {phone, count_down} = this.state
    let {currVendorId} = tool.vendor(this.props.global);
    if (count_down <= 0) {
      HttpUtils.get.bind(this.props)(`/uupt/message_authentication/${phone}`, {
        access_token: accessToken,
        vendorId: currVendorId
      }).then(res => {
        ToastShort(res.desc)
      }).catch((reason) => {
        ToastShort(reason.desc)
      })
    }
  }


  getGxdAuthorizedToLog = () => {
    let {accessToken, currStoreId} = this.props.global
    let {phone, phone_code} = this.state
    let {currVendorId} = tool.vendor(this.props.global);
    if (!tool.length(phone) > 0 || !tool.length(phone_code) > 0) {
      ToastShort('请输入手机号或者验证码')
      return null;
    }
    const api = `/v1/new_api/Delivery/get_bind_user?access_token=${accessToken}&vendorId=${currVendorId}`
    HttpUtils.post.bind(this.props)(api, {
      store_id: currStoreId,
      phone: phone,
      code: phone_code
    }).then(res => {
      this.fetchData()
      this.setState({
        gxdVisible: false
      }, () => ToastShort(res.desc))
    }).catch((reason) => {
      ToastShort(reason.desc)
    })
  }


  getGxdPhoneCode = () => {
    let {accessToken, currStoreId} = this.props.global
    let {phone, count_down} = this.state
    if (count_down <= 0) {
      HttpUtils.post.bind(this.props)(`/v1/new_api/Delivery/get_gxd_code?access_token=${accessToken}`, {
        store_id: currStoreId,
        phone: phone
      }).then(res => {
        ToastShort(res.desc)
      }).catch((reason) => {
        ToastShort(reason.desc)
      })
    }
  }

  unbind = () => {
    let {accessToken, currStoreId} = this.props.global
    let {currVendorId} = tool.vendor(this.props.global);
    HttpUtils.post.bind(this.props)(`/v1/new_api/delivery/unbind_store_delivery?vendorId=${currVendorId}&access_token=${accessToken}`, {
      store_id: currStoreId,
      delivery_type: this.state.unbind_id
    }).then(res => {
      this.setState({
        show_modal: true,
        modal_msg: res.msg,
        unbind_url: res.unauth_url
      })
    }).catch((reason) => {
      this.setState({
        show_modal: true,
        modal_msg: reason.desc
      })
    })
  }

  getCountdown = () => {
    return this.state.count_down;
  }

  setCountdown = (count_down) => {
    this.setState({
      count_down: count_down
    });
  }

  startCountDown = () => {
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


  renderItem = (info) => {
    return (
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: pxToDp(14),
        paddingBottom: pxToDp(14),
        borderTopWidth: 1 / PixelRatio.get(),
        borderTopColor: colors.colorDDD,
        backgroundColor: colors.white
      }}>
        <If condition={this.state.show_unbind_all}>
          <View style={{marginLeft: 6}}>
            <If condition={info.id === undefined}>
              <View style={{backgroundColor: colors.fontColor, borderRadius: 11}}>
                <FontAwesome5 name={'circle'} style={{}}
                              color={colors.fontColor} size={22}/>
              </View>
            </If>

            <If condition={info.id !== undefined}>
              {info.v2_type === this.state.unbind_id ?
                <FontAwesome5 name={'check-circle'} color={colors.main_color} size={22}/> :
                <FontAwesome5 name={'circle'} color={colors.color333} size={22}/>}
            </If>
          </View>
        </If>
        <Image style={[styles.img]} source={{uri: info.img}}/>
        <View style={{flexDirection: 'column', paddingBottom: 5, flex: 1}}>
          <View style={{
            flexDirection: "row",
            // justifyContent: "space-between",
            marginRight: pxToDp(20)
          }}>
            <Text style={{
              fontSize: pxToDp(28),
              color: colors.listTitleColor
            }}>{info.name} </Text>
            <If condition={this.state.show_unbind_all && info.id === undefined}>
              <Text style={{
                fontSize: pxToDp(28),
                color: colors.red
              }}>(未绑定)</Text>
            </If>
          </View>
          <View style={{marginTop: pxToDp(10)}}>
            {info.has_diff ? this.rendererrormsg(info.diff_info) : this.rendermsg([info.desc])}
          </View>
        </View>


        <If condition={!tool.length(info.id) > 0 && !this.state.show_unbind_all}>
          {info.bind_type === 'wsb' ? <Text style={[styles.status_err]}>申请开通</Text> :
            <Text style={[styles.status_err]}>去授权</Text>}
        </If>

        <If condition={tool.length(info.id) > 0 && !this.state.show_unbind_all}>
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


        <If condition={info.platform === '9' && !this.state.show_unbind_all}>
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

  renderList = (type = 1) => {
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
            if (this.state.show_unbind_all) {
              if (info.id !== undefined) {
                this.setState({
                  unbind_id: info.v2_type,
                  unbind_name: info.name,
                })
              }
              return;
            }
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


  render = () => {
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
        <View style={{flex: 1}}>
          {this.renderHeader()}
          {this.renderList(this.state.show_type)}
          <If condition={this.state.show_unbind_all}>
            {this.rendenBtn()}
          </If>
        </View>
        {this.renderModal()}
      </View>
    )
  }

  renderModal = () => {
    return (
      <View>
        <BottomModal
          title={'提示'}
          visible={this.state.show_modal}
          actionText={'确定'}
          btnStyle={{
            backgroundColor: colors.main_color
          }}
          onPress={() => {
            if (this.state.unbind_url !== null && this.state.unbind_url !== undefined) {
              this.setState({
                show_modal: false,
                show_unbind_all: false,
              }, () => {
                this.onPress(config.ROUTE_WEB, {url: this.state.unbind_url})
              })

            } else {
              this.setState({
                show_modal: false,
                show_unbind_all: false,
              }, () => {
                this.fetchData()
              })
            }
          }}
          onClose={() => {
            this.setState({
              show_modal: false,
            })
          }}>
          <View style={{padding: 20, justifyContent: "center", alignItems: "center"}}>
            <Text style={{fontSize: 16, color: colors.color333}}>{this.state.modal_msg} </Text>
          </View>
        </BottomModal>
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
                  style={styles.phoneinput}
                  clearButtonMode={true}
                  onChangeText={(value) => {
                    this.setState({
                      phone: value
                    })
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
                    value={this.state.phone_code}
                    onChangeText={(code) => {
                      this.setState({
                        phone_code: code
                      })
                    }}
                    underlineColorAndroid={"transparent"}
                    style={styles.codeinput}
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
        <BottomModal
          title={'绑定裹小递'}
          actionText={'授权并登录'}
          onPress={() => this.getGxdAuthorizedToLog()}
          visible={this.state.gxdVisible}
          btnStyle={{
            backgroundColor: colors.main_color,
            borderWidth: 0,
          }}
          onClose={() => this.setState({
            gxdVisible: false
          })}
        >
          <Cells style={styles.deliverCellBorder}>
            <Cell>
              <CellBody>
                <Input
                  value={this.state.phone}
                  editable={true}
                  underlineColorAndroid={"transparent"}
                  style={styles.phoneinput}
                  clearButtonMode={true}
                  onChangeText={(value) => {
                    this.setState({
                      phone: value
                    })
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
                    value={this.state.phone_code}
                    onChangeText={(code) => {
                      this.setState({
                        phone_code: code
                      })
                    }}
                    editable={true}
                    underlineColorAndroid={"transparent"}
                    style={styles.codeinput}
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
                      this.getGxdPhoneCode()
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

  rendenBtn = () => {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'确认'}
                onPress={() => {
                  if (this.state.unbind_id !== 0) {
                    Alert.alert('提醒', '确定要解绑' + this.state.unbind_name + '[自有账户]吗？', [
                      {
                        text: '确定',
                        onPress: () => {
                          this.unbind();
                        },
                      }, {
                        text: '取消'
                      }
                    ])
                  }
                }}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: this.state.unbind_id !== 0 ? colors.main_color : colors.fontColor,
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
        />
      </View>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryList)


const styles = StyleSheet.create({

  phoneinput: {
    height: 42,
    lineHeight: 20,
    fontSize: 15,
    marginTop: 0,
    marginBottom: 0,
    color: colors.color999,
    width: 300,
  },
  codeinput: {
    height: 42,
    lineHeight: 20,
    fontSize: 15,
    marginTop: 0,
    marginBottom: 0,
    color: colors.color999,
    width: 160
  },
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

});
