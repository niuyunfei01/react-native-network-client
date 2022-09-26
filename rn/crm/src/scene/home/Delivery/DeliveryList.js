import React, {PureComponent} from "react";
import {
  Alert,
  Image,
  InteractionManager,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import BottomModal from "../../../pubilc/component/BottomModal";
import PixelRatio from "react-native/Libraries/Utilities/PixelRatio";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {Button, CheckBox} from 'react-native-elements'
import {unDisable} from "../../../reducers/mine/mineActions";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({unDisable, ...globalActions}, dispatch)
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
      show_type: 1,
      platform_delivery_bind_list: [],
      platform_delivery_unbind_list: [],
      platform_delivery_forbidden_list: [],
      master_delivery_bind_list: [],
      master_delivery_unbind_list: [],
      uuVisible: false,
      gxdVisible: false,
      kfwVisible: false,
      phone: '',
      phone_code: '',
      count_down: -1,
      msg: [],
      show_unbind_all: false,
      show_disable_all: false,
      unbind_id: 0,
      disable_id: 0,
      unbind_name: "",
      unbind_url: null,
      show_modal: false,
      modal_msg: "",
      delivery_way_state: '',
      multipleSelection: [],
      wsbDeliveryList: []
    }
  }

  headerRight = () => {
    let {show_unbind_all, show_disable_all, show_type} = this.state
    return (
      <TouchableOpacity
        style={headerRightStyles.resetBind}
        onPress={() => {
          this.navigationOptions()
          if (show_type === 1) {
            this.setState({
              show_disable_all: !show_disable_all,
              disable_id: 0
            }, () => {
              this.concatWsbDeliveryList()
            })
          } else {
            this.setState({
              show_unbind_all: !show_unbind_all,
              unbind_url: null,
              unbind_name: "",
              unbind_id: 0
            })
          }
        }}
      >
        <Text style={headerRightStyles.text}>{show_type === 1 ? `禁用` : `解绑`}</Text>
      </TouchableOpacity>
    )
  }

  componentDidMount() {
    this.navigationOptions()
    this.fetchData()
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.headerRight()}
    navigation.setOptions(option);
  }

  fetchData = () => {
    showModal("请求中...")
    const {accessToken, currStoreId} = this.props.global
    const api = `/v1/new_api/Delivery/shop_bind_list?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {store_id: currStoreId}).then((res) => {
      this.setState({
        master_delivery_bind_list: res.store_deliveries.bind,
        master_delivery_unbind_list: res.store_deliveries.unbind,
        show_type: res.from_bd !== undefined && res.from_bd ? 2 : 1,
        platform_delivery_forbidden_list: res?.wsb_deliveries?.forbidden,
        platform_delivery_bind_list: res?.wsb_deliveries?.bind,
        platform_delivery_unbind_list: res?.wsb_deliveries?.unbind
      }, () => {
        this.concatWsbDeliveryList()
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
    let {show_unbind_all, show_disable_all, show_type} = this.state
    if (this.props.route.params && this.props.route.params.tab !== undefined) {
      this.setState({
        show_type: this.props.route.params.tab
      }, () => this.navigationOptions())
    }
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerTouch} onPress={() => {
          if (show_unbind_all) {
            ToastShort("暂不支持解绑外送帮账户");
            return;
          }
          this.setState({
            show_type: 1
          }, () => this.navigationOptions())
        }}>
          <View style={[styles.headerTab, {borderBottomWidth: show_type === 1 ? 3 : 0}]}>
            <Text style={styles.textNormal}>外送帮自带</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerTouch} onPress={() => {
          if (show_disable_all) {
            ToastShort("暂不支持禁用商家自有账户");
            return;
          }
          this.setState({
            show_type: 2
          }, () => this.navigationOptions())
        }}>
          <View style={[styles.headerTab, {borderBottomWidth: show_type === 2 ? 3 : 0}]}>
            <Text style={styles.textNormal}>商家自有</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  render_msg = (type = []) => {
    let items = []
    if (tool.length(type) > 0) {
      for (let msg of type) {
        items.push(<View style={styles.msgBox}>
          <Text style={styles.msgText}>{msg} </Text>
        </View>)
      }
    }
    return (
      <View style={{flex: 1}}>
        {items}
      </View>
    )
  }

  render_error_msg = (type = []) => {
    let items = []
    if (tool.length(type) > 0) {
      for (let msg of type) {
        items.push(<View style={styles.errorMsg}>
          <Text style={styles.errorMsgText}>{msg} </Text>
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

        if (res.route === 'KuaiFuWu') {
          this.setState({
            kfwVisible: true
          })
          return null;
        }

        this.onPress(res.route, {url: res.auth_url})
        break
      case 1:
        ToastShort(res.alert_msg)
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

  noticeModalPress = () => {
    if (this.state.unbind_url !== null && this.state.unbind_url !== undefined) {
      this.setState({
        show_modal: false,
        show_unbind_all: false,
      }, () => this.onPress(config.ROUTE_WEB, {url: this.state.unbind_url}))
    } else {
      this.setState({
        show_modal: false,
        show_unbind_all: false,
      }, () => {
        this.fetchData()
      })
    }
  }

  closeModal = () => {
    this.setState({
      show_modal: false,
    })
  }

  closeUUModal = () => {
    this.setState({
      uuVisible: false
    })
  }

  closeGXDModal = () => {
    this.setState({
      gxdVisible: false
    })
  }

  closeKFWModal = () => {
    this.setState({
      kfwVisible: false
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

  getKfwAuthorizedToLog = () => {
    let {accessToken, currStoreId} = this.props.global
    let {phone, phone_code} = this.state
    let {currVendorId} = tool.vendor(this.props.global);
    if (!tool.length(phone) > 0 || !tool.length(phone_code) > 0) {
      ToastShort('请输入手机号或者验证码')
      return null;
    }
    const api = `/v1/new_api/delivery/bind_business_self_account?access_token=${accessToken}&vendorId=${currVendorId}`
    HttpUtils.post.bind(this.props)(api, {
      store_id: currStoreId,
      mobile: phone,
      password: phone_code,
      ship_type: 18
    }).then(res => {
      this.fetchData()
      this.setState({
        kfwVisible: false
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

  undisable = () => {
    let {accessToken, currStoreId} = this.props.global
    let {currVendorId} = tool.vendor(this.props.global);
    let {dispatch} = this.props.route.params;
    let {delivery_way_state, multipleSelection} = this.state
    dispatch(unDisable(accessToken, currStoreId, multipleSelection, delivery_way_state, currVendorId, async (ok, desc) => {
      if (ok) {
        this.setState({
          show_modal: true,
          modal_msg: desc,
          multipleSelection: []
        })
      } else {
        this.setState({
          show_modal: true,
          modal_msg: desc
        })
      }
    }))
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
    }, 1000)
  }

  unBindBtn = () => {
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
  }

  unDisableBtn = (status) => {
    if (this.state.disable_id !== 0) {
      if (status === '禁用') {
        Alert.alert('提醒', `禁用后无法使用此配送发单，确定禁用吗？`, [
          {
            text: '确定',
            onPress: () => {
              this.undisable();
            },
          }, {
            text: '取消'
          }
        ])
      } else {
        this.undisable();
      }
    }
  }

  concatWsbDeliveryList = () => {
    let {
      show_disable_all,
      platform_delivery_forbidden_list,
      platform_delivery_bind_list,
      platform_delivery_unbind_list
    } = this.state
    let list = []
    if (!show_disable_all) {
      list = list.concat(platform_delivery_unbind_list)
      list = list.concat(platform_delivery_forbidden_list)
      list = list.concat(platform_delivery_bind_list)
    } else {
      list = list.concat(platform_delivery_bind_list)
      list = list.concat(platform_delivery_unbind_list)
      list = list.concat(platform_delivery_forbidden_list)
    }
    this.setState({
      wsbDeliveryList: list
    })
  }

  renderItemUnbind = (info) => {
    let {show_unbind_all, unbind_id} = this.state
    return (
      <View style={styles.listItem}>
        <If condition={show_unbind_all}>
          <View style={styles.ml6}>
            <If condition={info?.id === undefined}>
              <View style={styles.info_undefined}>
                <FontAwesome5 name={'circle'} color={colors.fontColor} size={22}/>
              </View>
            </If>

            <If condition={info?.id !== undefined}>
              {info?.v2_type === unbind_id ?
                <FontAwesome5 name={'check-circle'} color={colors.main_color} size={22}/> :
                <FontAwesome5 name={'circle'} color={colors.color333} size={22}/>}
            </If>
          </View>
        </If>

        <Image style={[styles.img]} source={{uri: info?.img}}/>
        <View style={styles.itemBox}>
          <View style={styles.itemBtn}>
            <Text style={styles.itemText}>{info?.name} </Text>
            <If condition={info?.id === undefined && show_unbind_all}>
              <Text style={styles.noBindText}>(未绑定)</Text>
            </If>
          </View>
          <View style={styles.mt10}>
            {info?.has_diff ? this.render_error_msg(info?.diff_info) : this.render_msg([info?.desc])}
          </View>
        </View>

        <If condition={!tool.length(info?.id) > 0 && !show_unbind_all}>
          {info?.bind_type === 'wsb' ? <Text style={[styles.status_err]}>申请开通</Text> :
            <Text style={[styles.status_err]}>去授权</Text>}
        </If>

        <If condition={tool.length(info?.id) > 0 && !show_unbind_all}>
          {info?.bind_type === 'wsb' && info?.is_forbidden === 1 ? null :
            <View style={styles.bindBox}>
              <Text style={styles.bindText}>已绑定</Text>
              <Icon name='chevron-thin-right' style={styles.bindIcon}/>
            </View>}
        </If>

        <If condition={info?.platform === '9' && !show_unbind_all && !show_unbind_all}>
          <View style={styles.bind_block}>
            <Text style={styles.bind_block_text}>已停用</Text>
            <Icon name='chevron-thin-right' style={styles.bind_block_icon}/>
          </View>
        </If>
      </View>
    )
  }

  renderItemDisable = (info, idx) => {
    let {show_disable_all, multipleSelection} = this.state
    return (
      <View style={styles.listItem}>
        <If condition={show_disable_all}>
          <If condition={info?.id !== undefined && info?.is_forbidden === 0}>
            <CheckBox
              checked={info?.checked}
              checkedColor={colors.main_color}
              color={colors.fontBlack}
              onPress={() => {
                let menu = [...this.state.wsbDeliveryList]
                menu[idx].checked = !menu[idx].checked;
                this.setState({
                  wsbDeliveryList: menu,
                  disable_id: info?.v2_type,
                  delivery_way_state: info?.is_forbidden
                })
                if (menu[idx].checked) {
                  multipleSelection.push(info?.v2_type)
                } else {
                  multipleSelection.splice(multipleSelection.findIndex(index => Number(index) == info?.v2_type), 1)
                }
              }}
            />
          </If>
        </If>
        <Image style={[styles.img]} source={{uri: info?.img}}/>
        <View style={styles.itemBox}>
          <View style={styles.itemBtn}>
            <Text style={styles.itemText}>{info?.name} </Text>
            <If condition={info?.is_forbidden === 1}>
              <Text style={styles.noBindText}>(已禁用)</Text>
            </If>
          </View>
          <View style={styles.mt10}>
            {info?.has_diff ? this.render_error_msg(info?.diff_info) : this.render_msg([info?.desc])}
          </View>
        </View>

        <If condition={info?.is_forbidden === 1 && !show_disable_all}>
          <Text style={[styles.status_err]}>恢复使用</Text>
        </If>

        <If condition={!tool.length(info?.id) > 0}>
          {info?.bind_type === 'wsb' ? <Text style={[styles.status_err]}>申请开通</Text> :
            <Text style={[styles.status_err]}>去授权</Text>}
        </If>

        <If condition={tool.length(info?.id) > 0}>
          {info?.bind_type === 'wsb' && info?.is_forbidden === 1 ? null :
            <View style={styles.bindBox}>
              <Text style={styles.bindText}>已绑定</Text>
              <Icon name='chevron-thin-right' style={styles.bindIcon}/>
            </View>}
        </If>

        <If condition={info?.platform === '9'}>
          <View style={styles.bind_block}>
            <Text style={styles.bind_block_text}>已停用</Text>
            <Icon name='chevron-thin-right' style={styles.bind_block_icon}/>
          </View>
        </If>
      </View>
    )
  }

  renderListDisable = () => {
    let {show_disable_all, multipleSelection, wsbDeliveryList} = this.state
    return (
      <ScrollView style={styles.container}>
        <For index="idx" each="info" of={wsbDeliveryList}>
          <TouchableOpacity
            key={idx}
            style={styles.listItemTouch}
            onPress={() => {
              if (show_disable_all) {
                if (info?.id !== undefined && info?.is_forbidden === 0) {
                  this.setState({
                    disable_id: info?.v2_type,
                    delivery_way_state: info?.is_forbidden
                  })
                }
                let menu = [...this.state.wsbDeliveryList]
                menu[idx].checked = !menu[idx].checked;
                this.setState({
                  wsbDeliveryList: menu
                })
                if (menu[idx].checked) {
                  multipleSelection.push(info?.v2_type)
                } else {
                  multipleSelection.splice(multipleSelection.findIndex(index => Number(index) == info?.v2_type), 1)
                }
                return;
              }
              if (tool.length(info?.id) > 0) {
                if (info?.is_forbidden === 1) {
                  this.setState({
                    disable_id: info?.v2_type,
                    delivery_way_state: info?.is_forbidden,
                    multipleSelection: info?.v2_type
                  }, () => {
                    this.unDisableBtn('启用')
                  })
                } else {
                  this.onPress(config.ROUTE_DELIVERY_INFO, {delivery_id: info?.id})
                }
              } else {
                if (info?.bind_type === 'wsb') {
                  this.onPress(config.ROUTE_APPLY_DELIVERY, {delivery_id: info?.v2_type});
                } else {
                  this.bind(info?.type)
                }
              }
            }}>
            {this.renderItemDisable(info, idx)}
          </TouchableOpacity>
        </For>
      </ScrollView>
    )
  }

  renderListUnbind = () => {
    let {show_unbind_all} = this.state
    let list = [];
    list = list.concat(this.state.master_delivery_unbind_list)
    list = list.concat(this.state.master_delivery_bind_list)
    return (
      <ScrollView style={styles.container}>
        <For index="idx" each="info" of={list}>
          <TouchableOpacity
            key={idx}
            style={styles.listItemTouch}
            onPress={() => {
              if (show_unbind_all) {
                if (info?.id !== undefined) {
                  this.setState({
                    unbind_id: info?.v2_type,
                    unbind_name: info?.name,
                  })
                }
                return;
              }
              if (tool.length(info?.id) > 0) {
                if (info?.is_forbidden === 1) {
                  this.setState({
                    disable_id: info?.v2_type,
                    delivery_way_state: info?.is_forbidden
                  }, () => {
                    this.unDisableBtn('启用')
                  })
                } else {
                  this.onPress(config.ROUTE_DELIVERY_INFO, {delivery_id: info?.id})
                }
              } else {
                if (info?.bind_type === 'wsb') {
                  this.onPress(config.ROUTE_APPLY_DELIVERY, {delivery_id: info?.v2_type});
                } else {
                  this.bind(info?.type)
                }
              }
            }}>
            {this.renderItemUnbind(info)}
          </TouchableOpacity>
        </For>
      </ScrollView>
    )
  }

  render() {
    let {show_type, show_unbind_all, show_disable_all} = this.state
    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.fetchData.bind(this)}/>
        <View style={{flex: 1}}>
          {this.renderHeader()}
          <If condition={show_type === 1}>
            {this.renderListDisable()}
          </If>
          <If condition={show_type === 2}>
            {this.renderListUnbind()}
          </If>
          <If condition={show_unbind_all}>
            {this.renderBtn()}
          </If>
          <If condition={show_disable_all}>
            {this.renderDisableBtn()}
          </If>
        </View>
        {this.renderModal()}
      </View>
    )
  }

  renderModal = () => {
    let {show_modal, modal_msg} = this.state
    return (
      <View>
        <BottomModal
          title={'提示'}
          visible={show_modal}
          actionText={'确定'}
          btnStyle={{backgroundColor: colors.main_color}}
          onPress={() => this.noticeModalPress()}
          onClose={() => this.closeModal()}>
          <View style={styles.modalTitle}>
            <Text style={styles.modalTitleText}>{modal_msg} </Text>
          </View>
        </BottomModal>
        <BottomModal
          title={'绑定UU跑腿'}
          actionText={'授权并登录'}
          onPress={() => this.getUUPTAuthorizedToLog()}
          visible={this.state.uuVisible}
          btnStyle={styles.bindModalBtn}
          onClose={() => this.closeUUModal()}
        >
          <TextInput
            style={styles.phone_input}
            value={this.state.phone}
            onChangeText={(value) => {
              this.setState({
                phone: value
              })
            }}
            keyboardType="numeric"
            placeholder="请输入手机号"
            underlineColorAndroid={"transparent"}
            clearButtonMode={"always"}
          />
          <View style={styles.uuModalBody}>
            <TextInput
              value={this.state.phone_code}
              onChangeText={(code) => {
                this.setState({
                  phone_code: code
                })
              }}
              underlineColorAndroid={"transparent"}
              style={styles.code_input}
              clearButtonMode={"always"}
              keyboardType="numeric"
              placeholder="请输入验证码"
            />
            {this.state.count_down > 0 ?
              <TouchableOpacity activeOpacity={1} style={{marginVertical: pxToDp(10)}}>
                <Text style={styles.btn_style1}>{`${this.state.count_down}秒后重新获取`}</Text>
              </TouchableOpacity> :
              <TouchableOpacity onPress={() => {
                showSuccess('验证码发送成功！')
                this.getUUPTPhoneCode()
                this.setCountdown(60)
                this.startCountDown()
              }}>
                <Text style={styles.btn_style}>获取验证码</Text>
              </TouchableOpacity>}
          </View>
        </BottomModal>
        <BottomModal
          title={'绑定裹小递'}
          actionText={'授权并登录'}
          onPress={() => this.getGxdAuthorizedToLog()}
          visible={this.state.gxdVisible}
          btnStyle={styles.bindModalBtn}
          onClose={() => this.closeGXDModal()}
        >
          <TextInput
            style={styles.phone_input}
            value={this.state.phone}
            onChangeText={(value) => {
              this.setState({
                phone: value
              })
            }}
            keyboardType="numeric"
            placeholder="请输入手机号"
            underlineColorAndroid={"transparent"}
            clearButtonMode={"always"}
          />
          <View style={styles.uuModalBody}>
            <TextInput
              style={styles.code_input}
              value={this.state.phone_code}
              onChangeText={(code) => {
                this.setState({
                  phone_code: code
                })
              }}
              keyboardType="numeric"
              placeholder="请输入验证码"
              underlineColorAndroid={"transparent"}
              clearButtonMode={"always"}
            />
            {this.state.count_down > 0 ?
              <TouchableOpacity activeOpacity={1} style={{marginVertical: pxToDp(10)}}>
                <Text style={styles.btn_style1}>{`${this.state.count_down}秒后重新获取`}</Text>
              </TouchableOpacity> :
              <TouchableOpacity onPress={() => {
                showSuccess('验证码发送成功！')
                this.getGxdPhoneCode()
                this.setCountdown(60)
                this.startCountDown()
              }}>
                <Text style={styles.btn_style}>获取验证码</Text>
              </TouchableOpacity>}
          </View>
        </BottomModal>

        <BottomModal
          title={'开通快服务'}
          actionText={'授权并登录'}
          onPress={() => this.getKfwAuthorizedToLog()}
          visible={this.state.kfwVisible}
          btnStyle={styles.bindModalBtn}
          onClose={() => this.closeGXDModal()}
        >
          <View>
            <View style={styles.flexRow}>
              <Text style={styles.f14}>账号： </Text>
              <TextInput
                style={[styles.phone_input, {borderColor: colors.color999, borderBottomWidth: 1, width: 260}]}
                value={this.state.phone}
                onChangeText={(value) => {
                  this.setState({
                    phone: value
                  })
                }}
                keyboardType="numeric"
                placeholder="请输入验证码"
                underlineColorAndroid={"transparent"}
                clearButtonMode={"always"}
              />
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.f14}>密码： </Text>
              <TextInput
                style={[styles.phone_input, {borderColor: colors.color999, borderBottomWidth: 1, width: 260}]}
                value={this.state.phone_code}
                onChangeText={(code) => {
                  this.setState({
                    phone_code: code
                  })
                }}
                keyboardType="numeric"
                placeholder="请输入验证码"
                underlineColorAndroid={"transparent"}
                clearButtonMode={"always"}
              />
            </View>
          </View>
        </BottomModal>

      </View>
    )
  }

  renderBtn = () => {
    return (
      <View style={styles.bottomBtn}>
        <Button title={'确认'}
                onPress={() => this.unBindBtn()}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: this.state.unbind_id !== 0 ? colors.main_color : colors.fontColor,
                }}
                titleStyle={styles.bottomBtnTitle}
        />
      </View>
    )
  }

  renderDisableBtn = () => {
    const {multipleSelection} = this.state
    return (
      <View style={styles.bottomBtn}>
        <Button title={'确认'}
                onPress={() => this.unDisableBtn('禁用')}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: multipleSelection.length > 0 ? colors.main_color : colors.fontColor,
                }}
                titleStyle={styles.bottomBtnTitle}
        />
      </View>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryList)

const headerRightStyles = StyleSheet.create({
  resetBind: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 10,
    width: 100,
    padding: 10
  },
  text: {fontSize: 14, color: colors.color333}
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: pxToDp(20),
    borderRadius: pxToDp(10),
    backgroundColor: colors.white
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.white,
    height: 40,
  },
  headerTouch: {width: '50%', alignItems: "center"},
  headerTab: {
    borderColor: colors.main_color,
    height: 40,
    justifyContent: 'center',
  },
  textNormal: {color: colors.color333},
  msgBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: pxToDp(4),
    marginEnd: pxToDp(10)
  },
  msgText: {
    color: '#595959',
    fontSize: pxToDp(20)
  },
  errorMsg: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: pxToDp(4),
    marginEnd: pxToDp(10)
  },
  errorMsgText: {
    color: '#EE2626',
    fontSize: pxToDp(20)
  },
  phone_input: {
    height: 42,
    lineHeight: 20,
    fontSize: 15,
    marginTop: 0,
    marginBottom: 0,
    color: colors.color999,
    width: 300,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: pxToDp(14),
    paddingBottom: pxToDp(14),
    borderTopWidth: 1 / PixelRatio.get(),
    borderTopColor: colors.colorDDD,
    backgroundColor: colors.white
  },
  code_input: {
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
    paddingTop: pxToDp(15),
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
  ml6: {marginLeft: 6},
  info_undefined: {backgroundColor: colors.fontColor, borderRadius: 11},
  itemBox: {flexDirection: 'column', paddingBottom: 5, flex: 1},
  itemBtn: {
    flexDirection: "row",
    marginRight: pxToDp(20)
  },
  itemText: {
    fontSize: pxToDp(28),
    color: colors.listTitleColor
  },
  noBindText: {
    fontSize: pxToDp(28),
    color: colors.red
  },
  mt10: {marginTop: pxToDp(10)},
  bindBox: {
    width: pxToDp(120),
    marginRight: pxToDp(30),
    flexDirection: 'row'
  },
  bindText: {
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
  },
  bindIcon: {
    color: colors.main_color,
    fontSize: pxToDp(30),
    paddingTop: pxToDp(12),
    marginLeft: pxToDp(10),
  },
  bind_block: {
    width: pxToDp(120),
    marginRight: pxToDp(30),
    flexDirection: 'row'
  },
  bind_block_text: {
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
  },
  bind_block_icon: {
    color: "#EE2626",
    fontSize: pxToDp(40),
    paddingTop: pxToDp(7),
    marginLeft: pxToDp(10),
  },
  listItemTouch: {
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.fontGray,
    marginLeft: pxToDp(10),
    marginRight: pxToDp(10),
  },
  bindModalBtn: {
    backgroundColor: colors.main_color,
    borderWidth: 0,
  },
  modalTitle: {padding: 20, justifyContent: "center", alignItems: "center"},
  modalTitleText: {fontSize: 16, color: colors.color333},
  uuModalBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: pxToDp(10)
  },
  flexRow: {flexDirection: 'row', alignItems: 'center'},
  f14: {fontSize: 14, color: colors.color333},
  bottomBtn: {backgroundColor: colors.white, padding: pxToDp(31)},
  bottomBtnTitle: {
    color: colors.white,
    fontSize: 16
  }
});
