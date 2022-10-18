import React, {PureComponent} from 'react'
import {InteractionManager, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {setPrinterName} from '../../../reducers/global/globalActions';

import Config from "../../../pubilc/common/config";
import native from "../../../pubilc/util/native";
import HttpUtils from "../../../pubilc/util/http";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";

import {Switch} from "react-native-elements";
import BleManager from "react-native-ble-manager";
import Entypo from 'react-native-vector-icons/Entypo';

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

class PrinterSetting extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      switch_val: false,
      enable_new_order_notify: true,
      auto_blue_print: false,
      printer_status: '查看详情',
      printer_status_color: colors.main_color,
      customer_print_item: true,
      master_print_item: false,
    }

  }

  check_printer_connected = () => {
    const {printer_id} = this.props.global
    if (printer_id !== '0' && !this.state.checkingPrinter) {
      this.setState({checkingPrinter: true})
      setTimeout(() => {
        BleManager.retrieveServices(printer_id).then((peripheralData) => {
          this.setState({
            printerId: printer_id,
            printerName: peripheralData.name,
            printerConnected: true,
            printerRssi: peripheralData.rssi
          })
          BleManager.readRSSI(printer_id).then((rssi) => {
            this.setState({printerRssi: rssi});
          });
        }).catch((error) => {
          this.setState({printerId: printer_id, printerConnected: false})
        });

        this.setState({checkingPrinter: false})
      }, 300);
    }
  }

  componentDidMount() {
    const {navigation} = this.props
    this.focus = navigation.addListener('focus', () => {
      this.check_printer_connected()
    })
    native.getAutoBluePrint((auto, msg) => {
      this.setState({auto_blue_print: auto})
    }).then()

    this.onHeaderRefresh()
  }

  componentWillUnmount() {
    this.focus()
  }

  get_print_settings(callback = () => {}) {
    const {dispatch} = this.props
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/read_store/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(store_info => {
      let {printer_name} = this.state;
      if (store_info.printer_cfg) {
        printer_name = store_info.printer_cfg.name
      }
      let printer_status = {text: '无', color: 'red'}
      if (store_info.printer_status) {
        printer_status = store_info.printer_status
      }
      dispatch(setPrinterName(store_info.printer_cfg));
      this.setState({
        printer_status: printer_status.text,
        printer_status_color: printer_status.color,
        print_pre_order: store_info.print_pre_order,
        order_print_time: store_info.order_print_time,
        reservation_order_print: parseInt(store_info.reservation_order_print),
        printer_name: printer_name,
        master_print_item: store_info.master_print_item !== undefined && store_info.master_print_item,
      }, callback)
    })

  }

  setPrintSettings(settings) {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/set_order_print_settings/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, settings).then(() => {
      this.setState({
        print_pre_order: settings.print_pre_order,
        reservation_order_print: settings.print_pre_order,
      }, () => {
        ToastShort("已保存");
      });
    })
  }

  set_master_print_item = () => {
    let data = {master_print_item: !this.state.master_print_item ? 1 : 0, customer_print_item: 1};
    const {currStoreId, accessToken} = this.props.global;
    const api = `/v1/new_api/stores/set_print_item/${currStoreId}?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(api, data).then(() => {
      this.setState({
        master_print_item: !this.state.master_print_item
      }, () => {
        ToastShort("已保存");
      });
    })
  }


  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.get_print_settings(() => {
      this.setState({isRefreshing: false})
    })
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  render() {
    const {printer_id, printer_name} = this.props.global
    const {printer_status, printer_status_color} = this.state
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{flex: 1, backgroundColor: colors.f2, marginHorizontal: 10}}>
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 8,
          marginVertical: 10,
          padding: 10,
          paddingBottom: 4,
        }}>
          <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
            <Text style={{color: colors.color333, padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold'}}>
              云打印机
            </Text>
          </View>
          <TouchableOpacity onPress={() => this.onPress(Config.ROUTE_CLOUD_PRINTER)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 8,
                              height: pxToDp(90),
                            }}>
            <Text style={{fontSize: 14, color: colors.color333}}>
              {printer_name ? printer_name : '暂无打印机'}
            </Text>
            <Text style={[{
              fontSize: 14,
              color: colors.color999,
              flex: 1,
              textAlign: "right"
            }, {color: printer_status_color}]}>
              {printer_name ? printer_status : '去添加'}
            </Text>
            <Entypo name="chevron-thin-right" size={18} color={colors.color999}/>
          </TouchableOpacity>
        </View>

        <If condition={Platform.OS === 'android'}>
          <View style={{backgroundColor: colors.white, borderRadius: 8, marginBottom: 10, padding: 10, paddingBottom: 4}}>
            <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
              <Text style={{color: colors.color333, padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold',}}>
                蓝牙打印机
              </Text>
            </View>

            <TouchableOpacity onPress={() => {
              let auto_blue_print = !this.state.auto_blue_print
              this.setState({auto_blue_print});
              native.setAutoBluePrint(auto_blue_print).then()
            }}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorCCC,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{fontSize: 14, color: colors.color333, flex: 1,}}>自动打印 </Text>
              <Switch color={colors.main_color} style={{fontSize: 16}} value={this.state.auto_blue_print}
                      onChange={(val) => {
                        let auto_blue_print = !this.state.auto_blue_print
                        this.setState({auto_blue_print});
                        native.setAutoBluePrint(auto_blue_print).then()
                      }}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.onPress(Config.ROUTE_PRINTER_CONNECT)}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>
                {printer_id !== '0' && this.state.printerName !== undefined ? "打印机: " + this.state.printerName : '暂无打印机'}
              </Text>
              <Text style={[{
                fontSize: 14,
                color: colors.color999,
                textAlign: "right",
              }, printer_id !== '0' ? {color: this.state.printerConnected ? colors.main_color : colors.warn_color} : {}]}>
                {printer_id !== '0' ? this.state.printerConnected ? '已连接' : '已断开' : "去添加"}
              </Text>
              <If condition={this.state.printerConnected}>
                <Text style={{fontSize: 14, color: colors.color999, textAlign: "right"}}>
                  信号: {this.state.printerRssi}
                </Text>
              </If>
              <Entypo name="chevron-thin-right" size={18} color={colors.color999}/>
            </TouchableOpacity>
          </View>
        </If>

        <View style={{backgroundColor: colors.white, borderRadius: 8, marginBottom: 10, padding: 10, paddingBottom: 4}}>
          <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
            <Text style={{color: colors.color333, padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold'}}>
              预订单打印时间
            </Text>
          </View>

          <TouchableOpacity onPress={() => this.setPrintSettings({print_pre_order: 0})}
                            style={{
                              borderBottomWidth: 1,
                              borderColor: colors.colorCCC,
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 8,
                              height: pxToDp(90),
                            }}>
            <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>
              来单立刻打印
            </Text>
            <If condition={this.state.reservation_order_print === 0}>
              <Entypo name={'check'} size={22} color={colors.main_color}/>
            </If>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.setPrintSettings({print_pre_order: this.state.order_print_time})}
                            style={{
                              borderBottomWidth: 1,
                              borderColor: colors.colorCCC,
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 8,
                              height: pxToDp(90),
                            }}>
            <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>
              送达前{this.state.order_print_time}分钟打印
            </Text>
            <If condition={this.state.reservation_order_print === this.state.order_print_time}>
              <Entypo name={'check'} size={22} color={colors.main_color}/>
            </If>
          </TouchableOpacity>

          <If condition={this.state.reservation_order_print === -1}>
            <TouchableOpacity onPress={() => this.setPrintSettings({print_pre_order: -1})}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>
                到点自动打印
              </Text>
              <If condition={this.state.reservation_order_print === 0}>
                <Entypo name={'check'} size={22} color={colors.main_color}/>
              </If>
            </TouchableOpacity>
          </If>
        </View>
        <View style={{backgroundColor: colors.white, borderRadius: 8, marginBottom: 10, padding: 10, paddingBottom: 4}}>
          <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
            <Text style={{color: colors.color333, padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold'}}>
              自定义设置
            </Text>
          </View>

          <TouchableOpacity onPress={() => this.onPress(Config.DIY_PRINTER)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 8,
                              height: pxToDp(90)
                            }}>
            <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>
              自定义打印小票
            </Text>
            <Entypo name="chevron-thin-right" size={18} color={colors.color999}/>
          </TouchableOpacity>
        </View>

        <View
          style={{backgroundColor: colors.white, borderRadius: 8, padding: 10, paddingBottom: 4, marginBottom: 100}}>
          <View style={{borderBottomWidth: 1, paddingBottom: 2, borderColor: colors.colorCCC}}>
            <Text style={{color: colors.color333, padding: 10, paddingLeft: 8, fontSize: 15, fontWeight: 'bold'}}>
              打印配置
            </Text>
          </View>

          <TouchableOpacity onPress={() => ToastShort("用户联打印暂不支持关闭")}
                            style={{
                              borderBottomWidth: 1,
                              borderColor: colors.colorCCC,
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 8,
                              height: pxToDp(90),
                            }}>
            <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>
              用户联
            </Text>
            <Switch color={colors.main_color} style={{fontSize: 16}} value={this.state.customer_print_item}/>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.set_master_print_item}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 8,
                              height: pxToDp(90),
                            }}>
            <Text style={{fontSize: 14, color: colors.color333, flex: 1}}>
              商户联
            </Text>
            <Switch color={colors.main_color} style={{fontSize: 16}} value={this.state.master_print_item}
                    onChange={this.set_master_print_item}/>
          </TouchableOpacity>
        </View>

      </ScrollView>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrinterSetting)
