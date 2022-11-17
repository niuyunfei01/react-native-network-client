import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as globalActions from '../../../reducers/global/globalActions';
import {logout} from '../../../reducers/global/globalActions';
import {Button, Switch} from "react-native-elements";
import JPush from "jpush-react-native";
import Entypo from "react-native-vector-icons/Entypo";
import {ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import {MixpanelInstance} from "../../../pubilc/util/analytics";


import Config from "../../../pubilc/common/config";
import tool from "../../../pubilc/util/tool";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import native from "../../../pubilc/util/native";
import HttpUtils from "../../../pubilc/util/http";
import GlobalUtil from "../../../pubilc/util/GlobalUtil";


import BottomModal from "../../../pubilc/component/BottomModal";
import JbbModal from "../../../pubilc/component/JbbModal";
import PropTypes from "prop-types";
import {setNoLoginInfo} from "../../../pubilc/common/noLoginInfo";

const {HOST_UPDATED} = require("../../../pubilc/common/constants").default;
const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class SettingScene extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track('设置页')
    this.state = {
      isRefreshing: false,
      hide_good_titles_to_shipper: false,
      show_remark_to_rider: true,
      invoice_serial_font: '',
      use_real_weight: false,
      enable_notify: true,
      enable_new_order_notify: true,
      notificationEnabled: 1,
      isRun: true,
      showAlertModal: false,
      showDeleteModal: false,
      shouldShowModal: false,
      order_list_show_product: false,
      is_alone_pay_vendor: true,
      is_owner: false,
      bd_mobile: '',
      bd_err: '',
      show_bd: '',
      funds_threshold_mapping: [],
      funds_threshold: 0,
      funds_thresholds: 0,
      threshold_key: 0,
      owner_mobile: '',
    }
  }

  onHeaderRefresh = () => {
    this.setState({isRefreshing: true});
    if (Platform.OS !== 'ios') {
      native.getDisableSoundNotify((disabled,) => {
        this.setState({enable_notify: !disabled})
      })

      native.getNewOrderNotifyDisabled((disabled,) => {
        this.setState({enable_new_order_notify: !disabled})
      })

      native.isRunInBg((resp) => {
        let isRun = resp === 1;
        this.setState({isRun: isRun})
      })
    }

    JPush.isNotificationEnabled((enabled) => {
      this.setState({notificationEnabled: enabled})
    })

    // this.get_store_settings();
    this.getConfig();
  }

  componentDidMount() {
    this.onHeaderRefresh();
  }

  getConfig = () => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `/v4/wsb_store/getStoreConfig?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api, {store_id: currStoreId}).then(res => {
      let funds_threshold_mapping = [];
      if (res?.funds_threshold_mapping) {
        tool.objectMap(res.funds_threshold_mapping, (item,) => {
          funds_threshold_mapping.push(item);
        })
      }
      this.setState({
        isRefreshing: false,
        funds_threshold: Number(res.funds_threshold),
        funds_threshold_mapping,
        show_remark_to_rider: Boolean(res.show_remark_to_rider),
        owner_mobile: res?.owner_mobile,
        invoice_serial_font: res?.invoice_serial_font,
        hide_good_titles_to_shipper: Boolean(res.hide_good_titles_to_shipper),
        use_real_weight: Number(res?.use_real_weight) === 1,
        order_list_show_product: Number(res?.order_list_show_product) === 1,
        is_alone_pay_vendor: Boolean(res?.is_alone_pay_vendor),
        is_owner: Boolean(res?.is_owner),
        bd_mobile: tool.length(res?.delivery_bd_info) > 0 ? res.delivery_bd_info.mobile : '',
        show_bd: res?.show_delivery_bd_set !== undefined && res.show_delivery_bd_set === 1,
      })
    })
  }


  setConfig = (field, value) => {
    this.setState({
      [field]: value
    })
    if (typeof (value) === 'boolean') {
      value = value ? 1 : 0
    }
    tool.debounces(() => {
      const {currStoreId, accessToken} = this.props.global;
      const api = `/v4/wsb_store/setStoreConfig?access_token=${accessToken}`
      const params = {store_id: currStoreId, field, value}
      HttpUtils.get.bind(this.props)(api, params).then(() => {
        ToastShort("设置成功");
      }).catch(e => ToastShort(e.reason))
    })
  }

  band_bd = () => {
    const {currStoreId, accessToken} = this.props.global;
    let {bd_mobile} = this.state;
    const api = `api/set_store_delivery_bd/${currStoreId}?access_token=${accessToken}`
    let data = {
      mobile: bd_mobile
    }
    HttpUtils.post.bind(this.props)(api, data).then((res) => {
      ToastShort("已保存");
      this.setState({
        shouldShowModal: false,
        bd_mobile: res.mobile,
        bd_err: ''
      })
    }).catch((res) => {
      this.setState({
        bd_err: res.desc
      })
    })
  }

  onReadProtocol = () => {
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }

  onServerSelected = (host) => {
    const {dispatch} = this.props;
    dispatch({type: HOST_UPDATED, host: host});
    GlobalUtil.setHostPort(host)
  }

  get_msg() {
    const {owner_mobile, funds_thresholds} = this.state
    let msg = '设置后，将不会对您进行余额电话提醒';
    if (funds_thresholds > 0) {
      msg = `设置后，当余额≤0及≤该阈值时将免费对您的电话：${owner_mobile}进行提醒。`
    } else if (this.state.funds_thresholds >= 0) {
      msg = `设置后，当余额≤0时将免费对您进行电话：${owner_mobile}进行提醒`;
    }
    return msg
  }

  cancel = () => {
    const {accessToken, store_id} = this.props.global;
    this.closeModal()
    const url = `/v4/wsb_store/destroyStore?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url,{
      store_id,
    }).then(() => {
        ToastLong('注销成功,正在退出登录', 0)
        setTimeout(() => {
          this._onLogout()
        }, 1000)
      }, (res) => {
        ToastLong(res?.reason, 0)
      }
    ).catch((res) => {
      ToastLong(res?.reason, 0)
    });
  }

  _onLogout = () => {
    const {dispatch, navigation, global} = this.props;
    this.mixpanel.reset();
    const noLoginInfo = {
      accessToken: '',
      currentUser: 0,
      currStoreId: 0,
      host: '',
      enabledGoodMgr: '',
      currVendorId: '',
      printer_id: global.printer_id || '0',
      order_list_by: 'orderTime asc'
    }
    setNoLoginInfo(JSON.stringify(noLoginInfo))

    dispatch(logout(() => {
      tool.resetNavStack(navigation, Config.ROUTE_LOGIN, {})
    }));
  }

  render() {
    const {isRefreshing} = this.state
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />}
        style={styles.Content}>
        {this.renderRemind()}
        {this.renderOrderSetting()}
        {this.renderPrintSetting()}
        {this.renderGoods()}
        {this.renderMarket()}
        {this.renderPrivacyPolicy()}
        {this.renderBtn()}
        {this.renderModal()}
      </ScrollView>
    );
  }


  renderRemind = () => {
    let {enable_new_order_notify, enable_notify, funds_threshold, notificationEnabled, isRun} = this.state
    return (
      <View style={styles.item_body}>
        <Text style={styles.item_title}>提醒 </Text>

        <View style={{backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 12}}>
          <If condition={Platform.OS !== 'ios'}>
            <TouchableOpacity onPress={() => {
              let val = !enable_new_order_notify;
              this.setState({enable_new_order_notify: val});
              native.setDisabledNewOrderNotify(!val)
            }}
                              style={styles.item_row}>
              <Text style={styles.row_label}>新订单通知 </Text>
              <Switch onValueChange={(val) => {
                this.setState({enable_new_order_notify: val});
                native.setDisabledNewOrderNotify(!val)
              }} color={colors.main_color} value={enable_new_order_notify}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              let val = !enable_notify;
              native.setDisableSoundNotify(!val)
              this.setState({enable_notify: val});
            }}
                              style={styles.item_row}>
              <Text style={styles.row_label}>语音通知 </Text>
              <Switch onValueChange={(val) => {
                native.setDisableSoundNotify(!val)
                this.setState({enable_notify: val});
              }} color={colors.main_color} value={enable_notify}
              />
            </TouchableOpacity>
          </If>
          <TouchableOpacity onPress={() => {
            this.setState({showAlertModal: true})
          }}
                            style={styles.item_row}>
            <Text style={styles.row_label}>余额不足通知 </Text>
            <Text style={styles.row_footer}>
              {funds_threshold > 0 ? funds_threshold + '元' : "设置通知"}
            </Text>
            <Entypo name="chevron-thin-right" style={styles.row_right}/>
          </TouchableOpacity>

          <If condition={Platform.OS !== 'ios'}>
            <TouchableOpacity onPress={() => {
              Alert.alert('确认是否已开启', '', [
                {
                  text: '去开启', onPress: () => {
                    native.toOpenNotifySettings(() => {

                    })
                    this.onHeaderRefresh();
                  }
                },
                {
                  text: '确认',
                  onPress: () => {
                    this.onHeaderRefresh();
                  }
                }
              ])
              native.toOpenNotifySettings((ok, msg) => console.log(ok, `:${msg}`))
            }}
                              style={styles.item_row}>
              <Text style={styles.row_label}>系统通知 </Text>
              <Text style={styles.row_footer}>
                {notificationEnabled ? "已开启" : "去系统设置中开启"}
              </Text>
              <Entypo name="chevron-thin-right" style={styles.row_right}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              Alert.alert('确认是否已开启', '', [
                {
                  text: '去开启', onPress: () => {
                    native.toRunInBg(() => {

                    })
                    this.onHeaderRefresh();
                  }
                },
                {
                  text: '确认',
                  onPress: () => {
                    this.onHeaderRefresh();
                  }
                }
              ])
              native.toRunInBg((ok, msg) => console.log(ok, `:${msg}`))
            }}
                              style={styles.item_row}>
              <Text style={styles.row_label}>后台运行 </Text>
              <Text style={styles.row_footer}>
                {isRun ? "已开启" : '未开启 - 去设置'}
              </Text>
              <Entypo name="chevron-thin-right" style={styles.row_right}/>
            </TouchableOpacity>
          </If>
        </View>
      </View>
    )
  }


  renderOrderSetting = () => {
    let {show_remark_to_rider} = this.state
    return (
      <View>
        <View style={styles.item_body}>
          <Text style={styles.item_title}>备注 </Text>
          <View style={{backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 12}}>

            <TouchableOpacity onPress={() => {
              let val = !show_remark_to_rider
              this.setConfig('show_remark_to_rider', val)
            }}
                              style={styles.item_row}>
              <View style={{flex: 1}}>
                <Text style={styles.row_label}>展示订单备注 </Text>
                <Text style={styles.row_label_desc}>开启后骑手端可见客户下单备注 </Text>
              </View>
              <Switch onValueChange={(val) => this.setConfig('show_remark_to_rider', val)}
                      color={colors.main_color}
                      value={show_remark_to_rider}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  renderPrintSetting = () => {
    let {invoice_serial_font} = this.state
    return (
      <View>
        <View style={styles.item_body}>
          <Text style={styles.item_title}>小票设置 </Text>
          <View style={{backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 12}}>
            <TouchableOpacity onPress={() => this.setConfig('invoice_serial_font', 0)}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorEEE,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>
                使用平台店名与平台单号
              </Text>
              <If condition={invoice_serial_font === 0}>
                <Entypo name={'check'} size={22} color={colors.main_color}/>
              </If>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.setConfig('invoice_serial_font', 1)}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90)
                              }}>
              <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>使用商家名称与总单号 </Text>
              <If condition={invoice_serial_font === 1}>
                <Entypo name={'check'} size={22} color={colors.main_color}/>
              </If>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }


  renderGoods = () => {
    let {dispatch} = this.props;
    let {hide_good_titles_to_shipper, use_real_weight, is_alone_pay_vendor, order_list_show_product} = this.state
    return (
      <View>
        <View style={styles.item_body}>
          <Text style={styles.item_title}>商品 </Text>

          <View style={{backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 12}}>
            <TouchableOpacity onPress={() => {
              let val = !hide_good_titles_to_shipper;
              this.setConfig('hide_good_titles_to_shipper', val)
            }}
                              style={styles.item_row}>
              <Text style={styles.row_label}>隐藏商品敏感信息 </Text>
              <Switch onValueChange={(val) => this.setConfig('hide_good_titles_to_shipper', val)}
                      color={colors.main_color}
                      value={hide_good_titles_to_shipper}
              />
            </TouchableOpacity>

            <If condition={!is_alone_pay_vendor}>
              <TouchableOpacity onPress={() => {
                let val = !use_real_weight;
                this.setConfig('use_real_weight', val)
              }}
                                style={styles.item_row}>
                <Text style={styles.row_label}>按照商品实际重量上传 </Text>
                <Switch onValueChange={(val) => this.setConfig('use_real_weight', val)}
                        color={colors.main_color}
                        value={use_real_weight}
                />
              </TouchableOpacity>
            </If>


            <TouchableOpacity onPress={() => {
              let val = !order_list_show_product;
              this.setConfig('order_list_show_product', val)
            }}
                              style={styles.item_row}>
              <View style={{flex: 1}}>
                <Text style={styles.row_label}>订单列表页展示商品 </Text>
                <Text style={styles.row_label_desc}>开启后，订单列表页可见商品信息 </Text>
              </View>
              <Switch onValueChange={(val) => this.setConfig('order_list_show_product', val)}
                      color={colors.main_color}
                      value={order_list_show_product}
              />
            </TouchableOpacity>

          </View>
        </View>
      </View>
    )
  }

  renderMarket = () => {
    let {show_bd, bd_mobile} = this.state
    if (!show_bd) {
      return;
    }
    return (
      <View style={{backgroundColor: colors.white, borderRadius: 8, marginBottom: 10, paddingHorizontal: 12}}>
        <TouchableOpacity onPress={() => {
          if (!bd_mobile) {
            this.setState({
              shouldShowModal: true
            })
          }
        }}
                          style={styles.item_row}>
          <Text style={styles.row_label}>销售经理 </Text>
          <Text style={styles.row_footer}>
            {tool.length(bd_mobile) > 0 ? bd_mobile : '去设置'}
          </Text>
          <Entypo name="chevron-thin-right" style={styles.row_right}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderServer = () => {
    const host = Config.hostPort()
    let {servers} = this.state;
    return (

      <View style={styles.item_body}>
        <Text style={styles.item_title}>选择服务器 </Text>
        <View style={{backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 12}}>
          <For index='idx' each='item' of={servers}>
            <TouchableOpacity key={idx} onPress={() => this.onServerSelected(item.host)} style={styles.item_row}>
              <Text style={styles.row_label}>{item.name}resp, msg </Text>
              <If condition={host === item.host}>
                <Entypo name={'check'} style={{fontSize: 22, color: colors.main_color}}/>
              </If>
            </TouchableOpacity>
          </For>
        </View>
      </View>
    )
  }

  renderPrivacyPolicy = () => {
    return (
      <View style={{backgroundColor: colors.white, borderRadius: 8, marginBottom: 10, paddingHorizontal: 12}}>
        <TouchableOpacity onPress={this.onReadProtocol}
                          style={styles.item_row}>
          <Text style={styles.row_label}>外送帮隐私政策 </Text>
          <Entypo name="chevron-thin-right" style={styles.row_right}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderBtn = () => {
    if (!this.state.is_owner) {
      return null;
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center', marginVertical: 20}}>
        <Button title={'注销账号'}
                onPress={() => this.setState({showDeleteModal: true})}
                buttonStyle={{
                  width: 132,
                  borderRadius: 21,
                  backgroundColor: colors.f2,
                  borderColor: colors.colorDDD,
                  borderWidth: 0.5
                }}
                titleStyle={{color: colors.color666, fontSize: 14}}
        />
      </View>
    )
  }

  closeModal = () => {
    this.setState({
      shouldShowModal: false,
      showAlertModal: false,
      showDeleteModal: false,
      bd_err: '',
    })
  }

  renderModal() {
    let {
      showDeleteModal,
      shouldShowModal,
      bd_err,
      showAlertModal,
      shopId,
      funds_thresholds,
      funds_threshold_mapping
    } = this.state;
    return (
      <View>
        <BottomModal title={'绑定销售经理'} actionText={'绑定'} onPress={() => this.band_bd()} visible={shouldShowModal}
                     onClose={this.closeModal}>
          <>
            <View style={{
              flexDirection: 'row',
              marginTop: 10,
              borderColor: colors.fontGray,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{fontSize: 16}}>手机号: </Text>
              <TextInput
                underlineColorAndroid="transparent"
                style={[{marginLeft: 10, height: 40, flex: 1}]}
                placeholderTextColor={"#7A7A7A"}
                value={shopId}
                onChangeText={text => this.setState({bd_mobile: text})}
              />
            </View>
            <If condition={bd_err}>
              <View style={{
                marginVertical: pxToDp(15),
                paddingHorizontal: pxToDp(40),
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
              }}>
                <Entypo name='info-with-circle' style={{fontSize: 30, color: 'red', marginRight: pxToDp(10)}}/>
                <Text style={{color: colors.color333}}>{bd_err}   </Text>
              </View>
            </If>
          </>
        </BottomModal>

        <JbbModal visible={showAlertModal} onClose={this.closeModal}>
          <View>
            <Text style={{fontWeight: 'bold', fontSize: 15, lineHeight: pxToDp(60)}}>设置通知</Text>
            <Text style={{color: 'red', lineHeight: 20}}>{this.get_msg()} </Text>

            <View style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 15,
              alignItems: 'center',
              flexWrap: "wrap"
            }}>
              <For each="item" index='idx' of={funds_threshold_mapping}>
                <Button key={idx} title={item === -1 ? '不通知' : "≤" + item + '元'}
                        onPress={() => {
                          this.setState({
                            funds_thresholds: item,
                            threshold_key: idx + 1,
                          })
                        }}
                        buttonStyle={{
                          width: width * 0.25,
                          marginTop: 8,
                          borderRadius: pxToDp(10),
                          backgroundColor: funds_thresholds === item ? colors.main_color : colors.white,
                          borderWidth: funds_thresholds === item ? 0 : pxToDp(1),
                          borderColor: colors.color999,
                        }}
                        titleStyle={{color: funds_thresholds === item ? colors.white : colors.color333, fontSize: 16}}
                />
              </For>
            </View>

            <View style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 15
            }}>
              <Button title={'取消'}
                      onPress={() => this.closeModal()}
                      buttonStyle={{
                        width: width * 0.3,
                        borderRadius: pxToDp(10),
                        backgroundColor: colors.colorCCC,
                      }}
                      titleStyle={{color: colors.white, fontSize: 16}}
              />
              <Button title={'确定'}
                      onPress={() => {
                        this.closeModal()
                        this.setConfig('funds_threshold', funds_thresholds)
                      }}
                      buttonStyle={{
                        width: width * 0.3,
                        marginLeft: width * 0.2,
                        borderRadius: pxToDp(10),
                        backgroundColor: colors.main_color,
                      }}
                      titleStyle={{color: colors.white, fontSize: 16}}
              />
            </View>

          </View>
        </JbbModal>

        <JbbModal visible={showDeleteModal} onClose={this.closeModal} modal_type={'center'}>
          <View style={{margin: 20}}>
            <Text style={{fontSize: 17, color: colors.color333, fontWeight: 'bold', textAlign: 'center'}}>
              确定要注销账号吗？
            </Text>

            <Text style={{fontSize: 16, color: colors.color333, marginVertical: 12, lineHeight: 22}}>
              注销账号会清空所有信息和数据，请确认是否要注销？
            </Text>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button title={'取消'}
                      onPress={this.closeModal}
                      containerStyle={{flex: 1, borderRadius: 20, length: 40, marginRight: 10}}
                      buttonStyle={{backgroundColor: colors.f5}}
                      titleStyle={{color: colors.color333, fontWeight: 'bold', fontSize: 16, lineHeight: 28}}/>

              <Button title={'确定'}
                      onPress={this.cancel}
                      containerStyle={{flex: 1, borderRadius: 20, length: 40,}}
                      buttonStyle={{backgroundColor: colors.main_color}}
                      titleStyle={{color: colors.white, fontWeight: 'bold', fontSize: 16, lineHeight: 28}}/>
            </View>
          </View>
        </JbbModal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  Content: {backgroundColor: colors.f2, paddingVertical: 12, paddingHorizontal: 10,},
  item_body: {
    marginBottom: 10,
  },
  item_head: {
    borderBottomWidth: 1,
    paddingBottom: 2,
    borderColor: colors.colorCCC
  },
  item_title: {
    color: colors.color333,
    fontSize: 14,
    marginBottom: 8,
    marginHorizontal: 4,
    fontWeight: 'bold',
  },
  item_row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderColor: colors.f5,
    borderBottomWidth: 0.5,
  },
  row_label: {
    fontSize: 14,
    color: colors.color333,
    flex: 1,
  },
  row_label_desc: {
    fontSize: 12,
    color: colors.color999,
    marginTop: 2,
  },
  row_footer: {
    fontSize: 14,
    color: colors.color999,
    flex: 1,
    textAlign: "right",
  },
  row_right: {
    color: colors.color999,
    fontSize: 18,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingScene)
