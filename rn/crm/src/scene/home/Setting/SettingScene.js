import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
  Alert,
  Dimensions,
  InteractionManager,
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
import {setFloatSerciceIcon, setOrderListExtStore} from '../../../reducers/global/globalActions';
import {Button, Switch} from "react-native-elements";
import JPush from "jpush-react-native";
import Entypo from "react-native-vector-icons/Entypo";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
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
  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track('设置页')
    this.state = {
      isRefreshing: false,
      switch_val: false,
      enable_notify: true,
      hide_good_titles: false,
      show_good_remake: true,
      invoice_serial_set: '',
      ship_order_list_set: '',
      use_real_weight: false,
      enable_new_order_notify: true,
      notificationEnabled: 1,
      showDeliveryModal: false,
      servers: [
        {name: '正式版1', host: "www.cainiaoshicai.cn"},
        {name: '正式版2', host: "api.waisongbang.com"},
        {name: '预览版', host: "rc.waisongbang.com"},
        {name: 'beta版', host: "beta7.waisongbang.com"},
        {name: '测试版2', host: "fire2.waisongbang.com"},
        {name: '测试版7', host: "fire7.waisongbang.com"},
      ],
      invoice_serial_setting_labels: {},
      auto_pack_setting_labels: [],
      auto_pack_done: 0,
      isRun: true,
      show_orderlist_ext_store: false,
      show_float_service_icon: false,
      shouldShowModal: false,
      bd_mobile: '',
      bd_err: '',
      show_bd: '',
      funds_threshold_mapping: [],
      funds_threshold: 0,
      funds_thresholds: 0,
      threshold_key: 0,
      storeMgrMobile: ''
    }
  }

  get_msg() {
    const {storeMgrMobile} = this.state
    let msg = '设置后，将不会对您进行余额电话提醒';
    if (this.state.funds_thresholds > 0) {
      msg = `设置后，当余额≤0及≤该阈值时将免费对您的电话：${storeMgrMobile}进行提醒。`
    } else if (this.state.funds_thresholds >= 0) {
      msg = `设置后，当余额≤0时将免费对您进行电话：${storeMgrMobile}进行提醒`;
    }
    return msg
  }

  onHeaderRefresh = () => {
    let {show_orderlist_ext_store, show_float_service_icon} = this.props.global;

    this.setState({show_orderlist_ext_store, show_float_service_icon})
    this.setState({isRefreshing: true});
    if (Platform.OS !== 'ios') {
      native.getDisableSoundNotify((disabled, msg) => {
        this.setState({enable_notify: !disabled})
      })

      native.getNewOrderNotifyDisabled((disabled, msg) => {
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
    this.get_store_settings();
  }

  componentDidMount() {
    this.onHeaderRefresh();
  }

  get_store_settings = () => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/read_store/${currStoreId}/1?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(store_info => {
      if (tool.length(store_info.servers) > 0) {
        this.setState({
          servers: store_info.servers,
          storeMgrMobile: Number(store_info.mobile)
        })
      }
      let funds_threshold_mapping = [];
      if (store_info.funds_threshold_mapping !== undefined) {
        tool.objectMap(store_info.funds_threshold_mapping, (item, idx) => {
          funds_threshold_mapping.push(item);
        })
      }
      this.setState({
        isRefreshing: false,
        ship_order_list_set: Number(store_info.ship_order_list_set) === 1,
        use_real_weight: Number(store_info.use_real_weight) === 1,
        invoice_serial_set: store_info.invoice_serial_set,
        hide_good_titles: Boolean(store_info.hide_good_titles),
        show_good_remake: Boolean(store_info.show_remark_to_rider),
        invoice_serial_setting_labels: store_info.invoice_serial_setting_labels,
        auto_pack_setting_labels: store_info.auto_pack_setting_labels,
        auto_pack_done: Number(store_info.auto_pack_done),
        bd_mobile: tool.length(store_info.delivery_bd_info) > 0 ? store_info.delivery_bd_info.mobile : '',
        show_bd: store_info.show_delivery_bd_set !== undefined && store_info.show_delivery_bd_set === 1,
        funds_threshold: Number(store_info.funds_threshold),
        funds_threshold_mapping,
        funds_thresholds: Number(store_info.funds_threshold),
      })
    })
  }

  set_funds_threshold = () => {
    if (this.state.threshold_key > 0) {
      const {currStoreId, accessToken} = this.props.global;
      const api = `/v1/new_api/stores/set_funds_threshold/${currStoreId}/?access_token=${accessToken}`
      let params = {
        threshold_key: this.state.threshold_key
      }
      HttpUtils.post.bind(this.props)(api, params).done((res) => {
        ToastShort(res.desc)
      })
    }
  }

  onPress(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  band_bd = () => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_store_delivery_bd/${currStoreId}?access_token=${accessToken}`
    let data = {
      mobile: this.state.bd_mobile
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

  save_invoice_serial_set = (invoice_serial_set) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_invoice_serial_setting/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {invoice_serial_set}).then(() => {
      this.setState({
        invoice_serial_set
      }, () => {
        ToastShort("已保存");
      });
    })
  }

  save_auto_pack_done = (auto_pack_done) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_auto_pack_done/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {auto_pack_done}).then(() => {
      this.setState({
        auto_pack_done
      }, () => {
        ToastShort("已保存");
      });
    })
  }

  save_hide_good_titles = (hide_good_titles) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_hide_good_titles/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {hide_good_titles}).then(() => {
      this.setState({
        hide_good_titles
      }, () => {
        ToastShort("已保存");
      });
    })
  }

  save_show_good_remake = (show_good_remake) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `/v1/new_api/stores/set_switch_remark_show_rider/${currStoreId}?access_token=${accessToken}`
    const parameter = {show_remark_to_rider: show_good_remake ? 1 : 0}
    HttpUtils.get.bind(this.props)(api, parameter).then(() => {
      this.setState({
        show_good_remake: show_good_remake
      }, () => {
        ToastShort("设置成功");
      });
    }).catch(e => ToastShort(e.reason))
  }
  save_ship_order_list_set = (ship_order_list_set) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_ship_order_list/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {ship_order_list_set}).then(() => {
      this.setState({
        ship_order_list_set
      }, () => {
        ToastShort("已保存");
      });
    })
  }

  save_use_real_weight = (use_real_weight) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_prod_real_weight/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, {use_real_weight: use_real_weight ? 1 : 0}).then(() => {
      this.setState({
        use_real_weight
      }, () => {
        ToastShort("已保存");
      });
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
        {this.renderAutomaticPackaging()}
        {this.renderGoods()}
        {this.renderMarket()}
        {this.renderServer()}
        {this.renderPrivacyPolicy()}
        {this.renderModal()}
      </ScrollView>
    );
  }

  renderRemind = () => {
    let {enable_new_order_notify, enable_notify, funds_threshold, notificationEnabled, isRun} = this.state
    return (
      <View style={styles.item_body}>
        <View style={styles.item_head}>
          <Text style={styles.item_title}>提醒 </Text>
        </View>

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
          this.setState({showDeliveryModal: true})
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
                  native.toOpenNotifySettings((resp, msg) => {

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
                  native.toRunInBg((resp, msg) => {

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
    )
  }


  renderOrderSetting = () => {
    let {dispatch} = this.props
    let {ship_order_list_set, show_orderlist_ext_store, show_float_service_icon, show_good_remake} = this.state
    return (
      <View>
        <View style={styles.item_body}>
          <View style={styles.item_head}>
            <Text style={styles.item_title}>订单 </Text>
          </View>
          <TouchableOpacity onPress={() => {
            let val = !ship_order_list_set
            this.save_ship_order_list_set(val)
          }}
                            style={styles.item_row}>
            <View style={{flex: 1}}>
              <Text style={styles.row_label}>配送版订单列表 </Text>
              <Text style={styles.row_label_desc}>开启后定位新订单,待接单,待取货,配送中,异常 </Text>
            </View>
            <Switch onValueChange={(val) => {
              this.save_ship_order_list_set(val)
            }} color={colors.main_color}
                    value={ship_order_list_set}
            />
          </TouchableOpacity>


          <TouchableOpacity onPress={() => {
            let val = !show_orderlist_ext_store;
            this.setState({
              show_orderlist_ext_store: val,
            }, () => {
              dispatch(setOrderListExtStore(val));
            })
          }}
                            style={styles.item_row}>
            <View style={{flex: 1}}>
              <Text style={styles.row_label}>是否展示外卖店铺筛选 </Text>
              <Text style={styles.row_label_desc}>订单列表控制 </Text>
            </View>
            <Switch onValueChange={(val) => {
              this.setState({
                show_orderlist_ext_store: val,
              }, () => {
                dispatch(setOrderListExtStore(val));
              })
            }} color={colors.main_color}
                    value={show_orderlist_ext_store}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            let val = !show_good_remake
            this.save_show_good_remake(val)
          }}
                            style={styles.item_row}>
            <View style={{flex: 1}}>
              <Text style={styles.row_label}>对骑手展示订单备注 </Text>
              <Text style={styles.row_label_desc}>开启后骑手可以看到顾客下单的备注 </Text>
            </View>
            <Switch onValueChange={(val) => {
              this.save_show_good_remake(val)
            }} color={colors.main_color}
                    value={show_good_remake}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            let val = !show_float_service_icon;
            this.setState({
              show_float_service_icon: val,
            }, () => {
              dispatch(setFloatSerciceIcon(val));
            })
          }}
                            style={styles.item_row}>
            <View style={{flex: 1}}>
              <Text style={styles.row_label}>是否展示联系客服 </Text>
              <Text style={styles.row_label_desc}>开启后可在列表页直接联系客服 </Text>
            </View>
            <Switch onValueChange={(val) => {
              this.setState({
                show_float_service_icon: val,
              }, () => {
                dispatch(setFloatSerciceIcon(val));
              })
            }} color={colors.main_color}
                    value={show_float_service_icon}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderAutomaticPackaging = () => {
    let {auto_pack_setting_labels, auto_pack_done} = this.state
    return (
      <View>
        <View style={styles.item_body}>
          <View style={styles.item_head}>
            <Text style={styles.item_title}>自动打包 </Text>
          </View>
          <For index='idx' each='item' of={auto_pack_setting_labels}>
            <TouchableOpacity key={idx} onPress={() => {
              if (auto_pack_done !== Number(idx)) {
                this.save_auto_pack_done(Number(idx))
              }

            }}
                              style={styles.item_row}>
              <Text style={styles.row_label}>{item} </Text>
              <If condition={auto_pack_done === Number(idx)}>
                <Entypo name={'check'} style={{
                  fontSize: 22,
                  color: colors.main_color,
                }}/>
              </If>
            </TouchableOpacity>
          </For>

        </View>
      </View>
    )
  }


  renderGoods = () => {
    let {hide_good_titles, use_real_weight} = this.state
    let {vendor_id} = this.props.global;
    return (
      <View>
        <View style={styles.item_body}>
          <View style={styles.item_head}>
            <Text style={styles.item_title}>商品 </Text>
          </View>
          <TouchableOpacity onPress={() => {
            let val = !hide_good_titles;
            this.save_hide_good_titles(val)
          }}
                            style={styles.item_row}>
            <Text style={styles.row_label}>对骑手隐藏商品敏感信息 </Text>
            <Switch onValueChange={(val) => {
              this.save_hide_good_titles(val)
            }} color={colors.main_color} value={hide_good_titles}
            />
          </TouchableOpacity>

          <If condition={Number(vendor_id) === 13}>
          <TouchableOpacity onPress={() => {
            let val = !use_real_weight;
            this.save_use_real_weight(val)
          }}
                            style={styles.item_row}>
            <Text style={styles.row_label}>按照商品实际重量上传 </Text>
            <Switch onValueChange={(val) => {
              this.save_use_real_weight(val)
            }} color={colors.main_color} value={use_real_weight}
            />
          </TouchableOpacity>
          </If>
        </View>
      </View>
    )
  }

  renderMarket = () => {
    let {show_bd, bd_mobile} = this.state
    if (!show_bd) {
      return null;
    }
    return (
      <View style={styles.item_body}>
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
        <View style={styles.item_head}>
          <Text style={styles.item_title}>选择服务器 </Text>
        </View>
        <For index='idx' each='item' of={servers}>
          <TouchableOpacity key={idx} onPress={() => this.onServerSelected(item.host)} style={styles.item_row}>
            <Text style={styles.row_label}>{item.name} </Text>
            <If condition={host === item.host}>
              <Entypo name={'check'} style={{
                fontSize: 22,
                color: colors.main_color,
              }}/>
            </If>
          </TouchableOpacity>
        </For>
      </View>
    )
  }

  renderPrivacyPolicy = () => {
    return (
      <View style={[styles.item_body, {marginBottom: 100}]}>
        <TouchableOpacity onPress={() => {
          this.onReadProtocol()
        }}
                          style={styles.item_row}>
          <Text style={styles.row_label}>外送帮隐私政策 </Text>
          <Entypo name="chevron-thin-right" style={styles.row_right}/>
        </TouchableOpacity>
      </View>
    )
  }


  renderModal() {
    return (
      <View>
        <BottomModal
          title={'绑定销售经理'}
          actionText={'绑定'}
          onPress={() => this.band_bd()}
          visible={this.state.shouldShowModal}
          onClose={() => this.setState({
            shouldShowModal: false,
            bd_mobile: '',
            bd_err: '',
          })}
        >
          <View style={{
            flexDirection: 'row',
            marginTop: 10,
            borderColor: colors.fontGray,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{fontSize: 16}}>手机号: </Text>
            <TextInput
              underlineColorAndroid="transparent"
              style={[{marginLeft: 10, height: 40, flex: 1}]}
              placeholderTextColor={"#7A7A7A"}
              value={this.state.shopId}
              onChangeText={text => this.setState({bd_mobile: text})}
            />
          </View>
          <If condition={this.state.bd_err}>
            <View style={{
              marginVertical: pxToDp(15),
              paddingHorizontal: pxToDp(40),
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row'
            }}>
              <Entypo name='info-with-circle' style={{fontSize: 30, color: 'red', marginRight: pxToDp(10)}}/>
              <Text style={{color: colors.color333}}>{this.state.bd_err}   </Text>
            </View>
          </If>
        </BottomModal>

        <JbbModal visible={this.state.showDeliveryModal} onClose={() =>
          this.setState({showDeliveryModal: false})}>
          <View>
            <Text style={{fontWeight: 'bold', fontSize: pxToDp(30), lineHeight: pxToDp(60)}}>设置通知</Text>
            <Text style={{color: 'red', lineHeight: pxToDp(40)}}>{this.get_msg()} </Text>

            <View style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 15,
              flex: 1,
              alignItems: 'center',
              flexWrap: "wrap",
            }}>
              <For each="item" index='idx' of={this.state.funds_threshold_mapping}>
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
                          backgroundColor: this.state.funds_thresholds === item ? colors.main_color : colors.white,
                          borderWidth: this.state.funds_thresholds === item ? 0 : pxToDp(1),
                          borderColor: colors.color999,
                        }}
                        titleStyle={{
                          color: this.state.funds_thresholds === item ? colors.white : colors.color333,
                          fontSize: 16
                        }}
                />
              </For>
            </View>

            <View style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 15,

            }}>
              <Button title={'取消'}
                      onPress={() => {
                        this.setState({showDeliveryModal: false})
                      }}
                      buttonStyle={{
                        width: width * 0.3,
                        borderRadius: pxToDp(10),
                        backgroundColor: colors.gray,
                      }}
                      titleStyle={{
                        color: colors.white,
                        fontSize: 16
                      }}
              />
              <Button title={'确定'}
                      onPress={() => {
                        this.set_funds_threshold()
                        this.setState({showDeliveryModal: false, funds_threshold: this.state.funds_thresholds})
                      }}
                      buttonStyle={{
                        width: width * 0.3,
                        marginLeft: width * 0.2,
                        borderRadius: pxToDp(10),
                        backgroundColor: colors.main_color,
                      }}
                      titleStyle={{
                        color: colors.white,
                        fontSize: 16
                      }}
              />
            </View>

          </View>
        </JbbModal>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  Content: {backgroundColor: colors.main_back, paddingVertical: 12, paddingHorizontal: 10,},
  item_body: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 10,
  },
  item_head: {
    borderBottomWidth: 1,
    paddingBottom: 2,
    borderColor: colors.colorCCC
  },
  item_title: {
    color: colors.color333,
    padding: 12,
    fontSize: 15,
    fontWeight: 'bold',
  },
  item_row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
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
