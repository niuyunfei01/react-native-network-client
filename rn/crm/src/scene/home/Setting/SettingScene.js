import React, {PureComponent} from 'react'
import {
  Alert,
  InteractionManager,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../../weui";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {setOrderListExtStore} from '../../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../../reducers/mine/mineActions";
import Config, {hostPort} from "../../../pubilc/common/config";
import {List, Provider, Radio} from "@ant-design/react-native";
import GlobalUtil from "../../../pubilc/util/GlobalUtil";
import JbbText from "../../common/component/JbbText";
import {native} from "../../../util";
import JPush from "jpush-react-native";
import HttpUtils from "../../../pubilc/util/http";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import _ from "lodash";
import Entypo from "react-native-vector-icons/Entypo";
import tool from "../../../pubilc/common/tool";
import BottomModal from "../../common/component/BottomModal";

const {HOST_UPDATED} = require("../../../util/constants").default;
const RadioItem = Radio.RadioItem;

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}

class SettingScene extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      switch_val: false,
      enable_notify: true,
      hide_good_titles: false,
      invoice_serial_set: '',
      ship_order_list_set: '',
      use_real_weight: false,
      enable_new_order_notify: true,
      notificationEnabled: 1,
      servers: [
        {name: '正式版1', host: "www.cainiaoshicai.cn"},
        {name: '正式版2', host: "api.waisongbang.com"},
        {name: '预览版', host: "rc.waisongbang.com"},
        {name: 'beta版', host: "beta7.waisongbang.com"},
        {name: '测试版2', host: "fire2.waisongbang.com"},
        {name: '测试版7', host: "fire7.waisongbang.com"},
      ],
      invoice_serial_setting_labels: {},
      auto_pack_setting_labels: {},
      auto_pack_done: 0,
      isRun: true,
      show_orderlist_ext_store: false,
      shouldShowModal: false,
      bd_mobile: '',
      bd_err: '',
      show_bd: '',
    }


  }


  onHeaderRefresh = () => {
    let {show_orderlist_ext_store} = this.props.global;
    if (show_orderlist_ext_store === true) {
      this.setState({show_orderlist_ext_store: true})
    }
    this.setState({isRefreshing: true});
    native.getDisableSoundNotify((disabled, msg) => {
      this.setState({enable_notify: !disabled})
    })

    native.getNewOrderNotifyDisabled((disabled, msg) => {
      this.setState({enable_new_order_notify: !disabled})
    })

    JPush.isNotificationEnabled((enabled) => {
      this.setState({notificationEnabled: enabled})
    })

    native.isRunInBg((resp) => {
      let isRun = resp === 1;
      this.setState({isRun: isRun})
    })

    this.get_store_settings();
  }

  componentDidMount() {

    this.onHeaderRefresh();
  }

  componentWillUnmount() {

  }

  get_store_settings() {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/read_store/${currStoreId}/1?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(store_info => {
      if (tool.length(store_info.servers) > 0) {
        this.setState({
          servers: store_info.servers
        })
      }
      this.setState({
        isRefreshing: false,
        ship_order_list_set: Number(store_info.ship_order_list_set) === 1,
        use_real_weight: Number(store_info.use_real_weight) === 1,
        invoice_serial_set: store_info.invoice_serial_set,
        hide_good_titles: Boolean(store_info.hide_good_titles),
        invoice_serial_setting_labels: store_info.invoice_serial_setting_labels,
        auto_pack_setting_labels: store_info.auto_pack_setting_labels,
        auto_pack_done: Number(store_info.auto_pack_done),
        bd_mobile: tool.length(store_info.delivery_bd_info) > 0 ? store_info.delivery_bd_info.mobile : '',
        show_bd: store_info.show_delivery_bd_set !== undefined && store_info.show_delivery_bd_set === 1
      })
    })

  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  band_bd() {
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

  renderSettings = () => {
    return <View>
      <CellsTitle style={styles.cell_title}>提醒</CellsTitle>
      <Cells style={[styles.cell_box]}>
        <Cell customStyle={[styles.cell_row]}>
          <CellBody>
            <Text style={[styles.cell_body_text]}>系统通知 </Text>
          </CellBody>
          <CellFooter>
            {this.state.notificationEnabled && <Text>已开启 </Text> || <Text onPress={() => {

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
            }} style={[styles.printer_status, styles.printer_status_error]}>去系统设置中开启 </Text>}
          </CellFooter>
        </Cell>
        <Cell customStyle={[styles.cell_row]}>
          <CellBody>
            <Text style={[styles.cell_body_text]}>后台运行 </Text>
          </CellBody>
          <CellFooter>
            {this.state.isRun && <Text>已开启 </Text> || <Text onPress={() => {

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
            }} style={[styles.printer_status, styles.printer_status_error]}>未开启，去设置 </Text>}
          </CellFooter>
        </Cell>
        <Cell customStyle={[styles.cell_row]}>
          <CellBody>
            <Text style={[styles.cell_body_text]}>语音播报 </Text>
          </CellBody>
          <CellFooter>
            <Switch value={this.state.enable_notify}
                    onValueChange={(val) => {
                      native.setDisableSoundNotify(!val)
                      this.setState({enable_notify: val});
                    }}/>
          </CellFooter>
        </Cell>
        <Cell customStyle={[styles.cell_row]}>
          <CellBody>
            <Text style={[styles.cell_body_text]}>新订单通知 </Text>
          </CellBody>
          <CellFooter>
            <Switch value={this.state.enable_new_order_notify}
                    onValueChange={(val) => {
                      this.setState({enable_new_order_notify: val});
                      native.setDisabledNewOrderNotify(!val)
                    }}/>
          </CellFooter>
        </Cell>
      </Cells>
    </View>
  }


  render() {
    const {printer_id} = this.props.global
    const {dispatch} = this.props
    return (
        <Provider>
          <ScrollView
              refreshControl={
                <RefreshControl
                    refreshing={this.state.isRefreshing}
                    onRefresh={() => this.onHeaderRefresh()}
                    tintColor='gray'
                />}
              style={{backgroundColor: colors.main_back}}>
            <If condition={Platform.OS !== 'ios'}>
              {this.renderSettings()}
            </If>

            {this.renderSerialNoSettings()}
            {this.renderPackSettings()}
            <CellsTitle style={styles.cell_title}>订单列表控制</CellsTitle>
            <Cells style={[styles.cell_box]}>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  <Text style={[styles.cell_body_text]}>是否展示外卖店铺筛选 </Text>
                </CellBody>
                <CellFooter>
                  <Switch value={this.state.show_orderlist_ext_store}
                          onValueChange={(val) => {
                            this.setState({
                              show_orderlist_ext_store: val,
                            }, () => {
                              dispatch(setOrderListExtStore(val));
                            })
                          }}/>
                </CellFooter>
              </Cell>
            </Cells>

            <CellsTitle style={styles.cell_title}>商品信息</CellsTitle>
            <Cells style={[styles.cell_box]}>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  <Text style={[styles.cell_body_text]}>对骑手隐藏商品敏感信息 </Text>
                </CellBody>
                <CellFooter>
                  <Switch value={this.state.hide_good_titles}
                          onValueChange={(val) => {
                            this.save_hide_good_titles(val)
                          }}/>
                </CellFooter>
              </Cell>
            </Cells>


            <CellsTitle style={styles.cell_title}>开启后定位新订单，待接单，待取货，配送中，异常</CellsTitle>
            <Cells style={[styles.cell_box]}>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  <Text style={[styles.cell_body_text]}>配送版订单列表 </Text>
                </CellBody>
                <CellFooter>
                  <Switch value={this.state.ship_order_list_set}
                          onValueChange={(val) => {
                            this.save_ship_order_list_set(val)
                          }}/>
                </CellFooter>
              </Cell>
            </Cells>

            <CellsTitle style={styles.cell_title}>发单重量控制(仅对达达有效)</CellsTitle>
            <Cells style={[styles.cell_box]}>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  <Text style={[styles.cell_body_text]}>按照商品实际重量上传 </Text>
                </CellBody>
                <CellFooter>
                  <Switch value={this.state.use_real_weight}
                          onValueChange={(val) => {
                            this.save_use_real_weight(val)
                          }}/>
                </CellFooter>
              </Cell>
            </Cells>


            <If condition={this.state.show_bd}>
              <CellsTitle style={styles.cell_title}>店铺销售经理</CellsTitle>
              <Cells style={[styles.cell_box]}>
                <Cell customStyle={[styles.cell_row]} onPress={() => {
                  if (!this.state.bd_mobile) {
                    this.setState({
                      shouldShowModal: true
                    })
                  }
                }}>
                  <CellBody>
                    <Text
                        style={[styles.cell_body_text]}>销售经理 </Text>
                  </CellBody>
                  <CellFooter>
                    {this.state.bd_mobile.length > 0 ?
                        <Text style={[styles.cell_body_text, {marginRight: 10}]}>{this.state.bd_mobile}  </Text>
                        :
                        <View style={{flexDirection: 'row'}}>
                          <Text
                              style={[styles.cell_body_text]}>去设置 </Text>
                          <Entypo name='chevron-thin-right' style={[styles.right_btn]}/>
                        </View>
                    }
                  </CellFooter>
                </Cell>
              </Cells>
            </If>
            {/*<If condition={Platform.OS !== 'ios'}>*/}
            {this.renderServers()}
            {/*</If>*/}
            <CellsTitle style={styles.cell_title}></CellsTitle>

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
                  <Text>{this.state.bd_err}   </Text>
                </View>
              </If>
            </BottomModal>


            <Cells style={[styles.cell_box]}>
              <Cell customStyle={[styles.cell_row]} onPress={() => {
                this.onReadProtocol();
              }}>
                <CellBody>
                  <Text
                      style={[styles.cell_body_text]}>外送帮隐私政策 </Text>
                </CellBody>
                <CellFooter>
                  <Entypo name='chevron-thin-right' style={[styles.right_btn]}/>
                </CellFooter>
              </Cell>
            </Cells>
          </ScrollView>
        </Provider>
    );
  }

  onReadProtocol = () => {
    const {navigation} = this.props;
    navigation.navigate(Config.ROUTE_WEB, {url: "https://e.waisongbang.com/PrivacyPolicy.html"});
  }


  renderPackSettings = () => {
    let items = _.map(this.state.auto_pack_setting_labels, (label, val) => {
      return (<RadioItem key={val} style={{fontSize: 12, fontWeight: 'bold'}}
                         checked={this.state.auto_pack_done === Number(val)}
                         onChange={event => {
                           if (event.target.checked) {
                             this.save_auto_pack_done(Number(val))
                           }
                         }}>
        <JbbText>{label}</JbbText></RadioItem>);
    });
    return <View><CellsTitle style={styles.cell_title}>自动设置打包完成</CellsTitle>
      <Cells style={[styles.cell_box]}>
        <List style={{marginTop: 12}}>
          {items}
        </List>
      </Cells></View>
  }

  onServerSelected = (host) => {
    const {dispatch} = this.props;
    dispatch({type: HOST_UPDATED, host: host});
    GlobalUtil.setHostPort(host)
  }

  renderServers = () => {
    let items = []
    const host = hostPort();
    for (let i in this.state.servers) {
      const server = this.state.servers[i]
      items.push(<RadioItem key={i} style={{fontSize: 12, fontWeight: 'bold'}} checked={host === server.host}
                            onChange={event => {
                              if (event.target.checked) {
                                this.onServerSelected(server.host)
                              }
                            }}><JbbText>{server.name}</JbbText></RadioItem>)
    }
    return <List style={{marginTop: 12}}>
      <Text style={{marginTop: 12, paddingLeft: 15}}>选择服务器</Text>
      {items}
    </List>
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


  renderSerialNoSettings = () => {
    let items = _.map(this.state.invoice_serial_setting_labels, (label, val) => {
      return (<RadioItem key={val} style={{fontSize: 12, fontWeight: 'bold'}}
                         checked={this.state.invoice_serial_set === Number(val)}
                         onChange={event => {
                           if (event.target.checked) {
                             this.save_invoice_serial_set(Number(val))
                           }
                         }}>
        <JbbText>{label}</JbbText></RadioItem>);
    });
    return <View><CellsTitle style={styles.cell_title}>小票/骑手看到的门店名称与序号</CellsTitle>
      <Cells style={[styles.cell_box]}>
        <List style={{marginTop: 12}}>
          {items}
        </List>
      </Cells></View>
  }
}

const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cell_box: {
    marginTop: 0,
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
    paddingRight: pxToDp(10),
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  printer_status_error: {
    color: '#f44040',
  },
  right_box: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: pxToDp(60),
    paddingTop: pxToDp(10),
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingScene)
