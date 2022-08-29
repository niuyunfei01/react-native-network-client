//import liraries
import React, {PureComponent} from "react";
import {
  Alert,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Cell, CellBody, CellFooter, Cells} from "../../../weui";
import Entypo from "react-native-vector-icons/Entypo"
import * as globalActions from "../../../reducers/global/globalActions";
import {showError, showSuccess, ToastLong} from "../../../pubilc/util/ToastUtils";
import tool from "../../../pubilc/util/tool";
import native from "../../../pubilc/util/native";
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import config from "../../../pubilc/common/config";
import {Button, Switch} from "react-native-elements";
import {MixpanelInstance} from "../../../pubilc/util/analytics";

const mapStateToProps = state => {
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

class SeetingDelivery extends PureComponent {
  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.state = {
      isRefreshing: true,
      menus: [],
      auto_call: false,
      suspend_confirm_order: false,
      deploy_time: "10",
      max_call_time: "10",
      ship_ways: [],
      order_require_minutes: 0,
      default_str: '',
      zs_way: false,
      show_auto_confirm_order: false,
      showBtn: false,
      time_interval: '0分',
      showBind: false,
      bind_url: '',
      notice: false,
      alert_title: '',
      alert_msg: '',
      alert_mobile: '',
      saveBtnStatus: 0,
      isShowSettingText: false,
      showSetMeituanBtn: false,
    };
    this.onBindDelivery = this.onBindDelivery.bind(this)
  }

  componentDidMount() {
    this.getDeliveryConf();
  }

  onHeaderRefresh = () => {
    this.getDeliveryConf();
  }

  onPress = (route, params = {}, callback = {}) => {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  getDeliveryConf = () => {
    this.props.actions.showStoreDelivery(this.props.route.params.ext_store_id, (success, response) => {
      let showBtn = this.props.route.params.showBtn;
      if (tool.length(response.bind_info) > 0) {
        showBtn = response.bind_info.rebind === 1 ? false : showBtn;
        this.setState({
          showBind: response.bind_info.rebind === 1,
          bind_url: config.apiUrl(response.bind_info.bind_url),
          notice: response.bind_info.notice === 1,
        })
        if (tool.length(response.bind_info.notice_info) > 0) {
          this.setState({
            alert_title: response.bind_info.notice_info.title,
            alert_msg: response.bind_info.notice_info.body,
            alert_mobile: response.bind_info.notice_info.mobile,
          })
        }
      }

      this.setState({
        isRefreshing: false,
        // menus: response.menus ? response.menus : [],
        ship_ways: response.ship_ways ? response.ship_ways : [],
        auto_call: response.auto_call && response.auto_call === 1,
        suspend_confirm_order: response.suspend_confirm_order && response.suspend_confirm_order === "0",
        deploy_time: response.deploy_time ? "" + response.deploy_time : '0',
        max_call_time: response.max_call_time ? "" + response.max_call_time : "10",
        order_require_minutes: response.order_require_minutes ? response.order_require_minutes : 0,
        default_str: response.default ? response.default : '',
        zs_way: response.zs_way && response.zs_way > 0,
        show_auto_confirm_order: this.props.global?.config?.vendor?.wsb_store_account === '1',
        disabled_auto_confirm_order: response.platform === '3' && response.business_id === '16',
        showBtn: showBtn,
        isShowSettingText: JSON.parse(response.preference_ship_config).is_open === 1,
        showSetMeituanBtn: response.platform === '3',
      })

    })
  }

  onBindDelivery = () => {

    const {
      suspend_confirm_order,
      auto_call,
      ship_ways,
      zs_way,
      max_call_time,
      deploy_time,
      order_require_minutes,
      default_str,
    } = this.state

    this.setState({
      isRefreshing: true,
      suspend_confirm_order: !suspend_confirm_order
    })

    if (auto_call && ship_ways.length === 0) {
      ToastLong("自动呼叫时需要选择配送方式");
      this.setState({isRefreshing: false});
      return;
    }

    if (zs_way) {
      ToastLong("暂不支持平台专送修改");
      this.setState({isRefreshing: false});
      return;
    }

    let {accessToken} = this.props.global;
    tool.debounces(() => {
      this.props.actions.updateStoresAutoDelivery(
        accessToken,
        this.props.route.params.ext_store_id,
        {
          auto_call: auto_call ? 1 : 2,
          suspend_confirm_order: suspend_confirm_order ? "1" : "0",
          ship_ways: ship_ways,
          default: default_str,
          max_call_time: max_call_time,
          deploy_time: deploy_time,
          order_require_minutes: order_require_minutes
        },
        (success, response) => {
          this.setState({isRefreshing: false})
          if (success) {
            showSuccess('配置成功');
          } else {
            showError('配置失败');
          }
        }
      )
    }, 1000)
  }


  render() {
    const {ship_ways} = this.state;
    let {isShowSettingText} = this.state
    const {navigation} = this.props;
    let ship_ways_arr = []
    if (Array.isArray(ship_ways)) {
      ship_ways_arr = ship_ways
    } else {
      for (let i in ship_ways) {
        ship_ways_arr.push(ship_ways[i])
      }
      this.setState({
        ship_ways: ship_ways_arr
      })
    }

    return (
      <View style={{flex: 1}}>
        <FetchView navigation={this.props.navigation} onRefresh={this.onHeaderRefresh.bind(this)}/>
        <ScrollView style={styles.container}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => this.onHeaderRefresh()}
                        tintColor='gray'
                      />
                    }
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
        >

          {this.state.showBind ?
            <View style={{
              flexDirection: 'row',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: pxToDp(10),
              marginBottom: pxToDp(10),
              alignItems: "center"
            }}>
              <Entypo name="help-with-circle"
                      style={{marginTop: pxToDp(7), fontSize: pxToDp(30), color: colors.warn_color}}/>
              <Text style={{
                fontSize: pxToDp(30),
                marginTop: pxToDp(7),
                marginLeft: pxToDp(10),
                color: '#333333'
              }}>绑定已失效，请重新绑定 </Text>
              <Button title={'去绑定'}
                      onPress={() => {
                        if (this.state.notice) {
                          Alert.alert(this.state.alert_title, this.state.alert_msg, [{text: '取消', style: 'cancel'},
                            {
                              text: '联系客服', onPress: () => {
                                native.dialNumber(this.state.alert_mobile);
                              }
                            }])
                        } else {
                          navigation.navigate(config.ROUTE_WEB, {url: this.state.bind_url});
                        }
                      }}
                      buttonStyle={{
                        backgroundColor: colors.warn_color,
                        borderRadius: pxToDp(10)
                      }}
                      containerStyle={{height: 30}}
                      titleStyle={{
                        color: colors.white,
                        fontSize: 12
                      }}
              />
            </View>
            :
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                paddingTop: pxToDp(15),
                paddingBottom: pxToDp(15),
                paddingLeft: pxToDp(15)
              }}
              onPress={() => {
                // this.onPress()
              }}>
              <Text style={{
                margin: pxToDp(10),
                fontSize: pxToDp(26),
                color: colors.color999,
                marginLeft: pxToDp(10)
              }}>自动发单按费用由低到高依次发单 </Text>
              <View style={{flex: 1,}}></View>
              {/*<Text style={{*/}
              {/*  margin: pxToDp(10),*/}
              {/*  fontSize: pxToDp(26),*/}
              {/*  color: colors.color999,*/}
              {/*  marginLeft: pxToDp(10)*/}
              {/*}}>了解详情 </Text>*/}
              {/*<Entypo name='chevron-thin-right' style={[styles.right_btn]}/>*/}
            </TouchableOpacity>}

          <If condition={this.state.show_auto_confirm_order && !this.state.disabled_auto_confirm_order}>

            <Cells style={[styles.cell_box]}>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  <Text style={[styles.cell_body_text]}>自动接单 </Text>
                </CellBody>
                <CellFooter>
                  <Switch color={colors.main_color} style={{
                    fontSize: 16,
                  }} value={this.state.suspend_confirm_order}
                          onChange={() => {
                            this.onBindDelivery()
                          }}/>
                </CellFooter>
              </Cell>
            </Cells>
          </If>


          <If condition={this.state.disabled_auto_confirm_order}>
            <TouchableOpacity onPress={() => {
              ToastLong("此店铺为兼容模式\n不支持自动接单")
            }}>
              <Cells style={[{backgroundColor: '#EBEBEB'}, styles.cell_box]}>
                <Cell customStyle={[styles.cell_row]} onPress={() => {
                  ToastLong("此店铺为兼容模式\n不支持自动接单")
                }}>
                  <CellBody>
                    <Text style={[{color: "#CACACA"}, styles.cell_body_text]}>自动接单</Text>
                  </CellBody>
                  <CellFooter>
                    <Switch color={colors.main_color} disabled={true} style={{
                      fontSize: 16,
                    }}/>
                  </CellFooter>
                </Cell>
              </Cells>
            </TouchableOpacity>
          </If>


          <Cells style={[styles.cell_box, {marginTop: pxToDp(20)}]}>
            <Cell customStyle={[styles.cell_row]} onPress={() => {
              this.mixpanel.track('自动呼叫设置页')
              navigation.navigate(config.ROUTE_SEETING_DELIVERY_INFO, {
                auto_call: this.state.auto_call,
                ext_store_id: this.props.route.params.ext_store_id,
                showBtn: this.props.route.params.showBtn
              })
            }}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>自动呼叫配送</Text>
              </CellBody>
              <CellFooter>
                <Entypo name='chevron-thin-right' style={[styles.right_btns]}/>
              </CellFooter>
            </Cell>
          </Cells>


          <Cells style={[styles.cell_box, {marginTop: pxToDp(20)}]}>
            <Cell customStyle={[styles.cell_row]} onPress={() => {
              this.mixpanel.track('就近分配订单')
              navigation.navigate(config.ROUTE_SEETING_DELIVERY_ORDER, {
                auto_call: this.state.auto_call,
                ext_store_id: this.props.route.params.ext_store_id,
                showBtn: this.props.route.params.showBtn
              })
            }}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>就近分配订单</Text>
              </CellBody>
              <CellFooter>
                <Entypo name='chevron-thin-right' style={[styles.right_btns]}/>
              </CellFooter>
            </Cell>
          </Cells>

          <Cells style={[styles.cell_box, {marginTop: pxToDp(20)}]}>
            <Cell customStyle={[styles.cell_row]} onPress={() => {
              this.mixpanel.track('偏好发单设置页')
              navigation.navigate(config.ROUTE_SEETING_PREFERENCE_DELIVERY, {
                auto_call: this.state.auto_call,
                ext_store_id: this.props.route.params.ext_store_id,
              })
            }}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>偏好发单设置</Text>
              </CellBody>
              <CellFooter>
                <>
                  <If condition={isShowSettingText}>
                    <Text style={{marginRight: pxToDp(5), color: colors.color333}}>已设置</Text>
                  </If>
                  <Entypo name='chevron-thin-right' style={[styles.right_btns]}/>
                </>
              </CellFooter>
            </Cell>
          </Cells>


          <Cells style={[styles.cell_box, {marginTop: pxToDp(20)}]}>
            <Cell customStyle={[styles.cell_row]} onPress={() => {
              this.mixpanel.track('保底配送页')
              navigation.navigate(config.ROUTE_SEETING_MININUM_DELIVERY, {
                ext_store_id: this.props.route.params.ext_store_id,
              })
            }}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>设置保底配送</Text>
              </CellBody>
              <CellFooter>
                <Entypo name='chevron-thin-right' style={[styles.right_btns]}/>
              </CellFooter>
            </Cell>
          </Cells>

        </ScrollView>

        {this.state.showSetMeituanBtn ? this.rendenBtn() : false}
      </View>

    );
  }

  rendenBtn = () => {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'更换绑定'}
                onPress={() => {
                  this.props.navigation.navigate(config.ROUTE_BIND_SET_MEITUAN)
                }}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: colors.main_color,
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

const
  styles = StyleSheet.create({
    container: {
      marginBottom: pxToDp(22),
      backgroundColor: colors.f7
    },
    btn_select: {
      marginRight: pxToDp(20),
      height: pxToDp(60),
      width: pxToDp(60),
      fontSize: pxToDp(40),
      color: colors.color666,
      textAlign: "center",
      textAlignVertical: "center"
    },
    cell_title: {
      marginBottom: pxToDp(10),
      fontSize: pxToDp(26),
      color: colors.color999
    },
    cell_box: {
      marginLeft: "2%",
      marginRight: "2%",
      marginTop: 3,
      borderRadius: pxToDp(30),

      // borderTopWidth: pxToDp(1),
      // borderBottomWidth: pxToDp(1),
      // borderColor: colors.color999
    },
    cell_row: {
      height: pxToDp(90),
      justifyContent: "center"
    },
    cell_input: {
      //需要覆盖完整这4个元素
      fontSize: pxToDp(30),
      height: pxToDp(70),
      borderWidth: pxToDp(1),
      width: pxToDp(100),
      paddingTop: pxToDp(13),
      marginLeft: pxToDp(10),
      marginRight: pxToDp(10),
    },

    cell_inputs: {
      //需要覆盖完整这4个元素
      textAlign: 'center',
      fontSize: pxToDp(30),
      height: pxToDp(90),
      borderWidth: pxToDp(1),
      width: pxToDp(100),
      marginLeft: pxToDp(10),
      marginRight: pxToDp(10),
    },
    cell_label: {
      width: pxToDp(234),
      fontSize: pxToDp(30),
      fontWeight: "bold",
      color: colors.color333
    },
    btn_submit: {
      backgroundColor: '#808080',
      marginHorizontal: pxToDp(30),
      borderRadius: pxToDp(20),
      textAlign: 'center',
      height: pxToDp(65),
      marginBottom: pxToDp(70),
    },
    map_icon: {
      fontSize: pxToDp(40),
      color: colors.color666,
      height: pxToDp(60),
      width: pxToDp(40),
      textAlignVertical: "center"
    },
    body_text: {
      paddingLeft: pxToDp(8),
      fontSize: pxToDp(30),
      color: colors.color333,
      height: pxToDp(60),
      textAlignVertical: "center"
    },
    right_btn: {
      fontSize: pxToDp(26),
      margin: pxToDp(10),
      color: colors.color999,
      paddingTop: pxToDp(3),
      marginLeft: 0,
    },
    right_btns: {
      fontSize: pxToDp(32),
      color: colors.color999,
      paddingTop: pxToDp(3),
      marginRight: pxToDp(10),
    },
  });
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SeetingDelivery);
