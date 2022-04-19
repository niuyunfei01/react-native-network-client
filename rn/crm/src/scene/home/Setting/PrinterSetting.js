import React, {PureComponent} from 'react'
import {InteractionManager, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {setPrinterName} from '../../../reducers/global/globalActions';

import Config from "../../../pubilc/common/config";
import native from "../../../pubilc/util/native";
import tool from "../../../pubilc/util/tool";
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


function Fetch({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
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
      printer_status_color: colors.main_color
    }

    native.getAutoBluePrint((auto, msg) => {
      this.setState({auto_blue_print: auto})
    })
    this.check_printer_connected();
  }

  check_printer_connected() {
    const {printer_id} = this.props.global
    if (printer_id && this.state.checkingPrinter !== true) {
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
    this.setState({isRefreshing: true});
    this.get_print_settings(() => {
      this.setState({isRefreshing: false});
    });
  }

  componentWillUnmount() {

  }

  get_print_settings(callback = () => {
  }) {

    const {dispatch} = this.props
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/read_store/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(store_info => {
      let printer_name = this.state.printer_name;
      let printers_name = [];
      if (store_info.printer_cfg.length !== 0) {
        printer_name = store_info.printer_cfg.name
        printers_name = store_info.printer_cfg;
      }
      dispatch(setPrinterName(printers_name));
      if (tool.length(store_info.printer_status) > 0) {
        this.setState({
          printer_status: store_info.printer_status.text,
          printer_status_color: store_info.printer_status.color,
        })
      }
      this.setState({
        print_pre_order: store_info.print_pre_order,
        order_print_time: store_info.order_print_time,
        reservation_order_print: parseInt(store_info.reservation_order_print),
        printer_name: printer_name
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
    this.check_printer_connected()
    const {printer_id, printer_name,} = this.props.global
    const {printer_status, printer_status_color} = this.state

    let items = []
    items.push(
      <TouchableOpacity onPress={() => {
        this.setPrintSettings({print_pre_order: 0})
      }} style={{
        flexDirection: "row",
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.fontColor,
        borderTopWidth: pxToDp(1),
      }}>
        <Text style={{color: colors.color333, fontSize: 14, fontWeight: 'bold'}}>来单立刻打印</Text>
        <View style={{flex: 1}}></View>
        <If condition={this.state.reservation_order_print === 0}>
          <Entypo name={'check'} style={{
            fontSize: 22,
            color: colors.main_color,
          }}/>
        </If>
      </TouchableOpacity>
    )
    items.push(
      <TouchableOpacity onPress={() => {
        this.setPrintSettings({print_pre_order: this.state.order_print_time})
      }} style={{
        flexDirection: "row",
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.fontColor,
        borderTopWidth: pxToDp(1),
      }}>
        <Text
          style={{color: colors.color333, fontSize: 14, fontWeight: 'bold'}}>送达前{this.state.order_print_time}分钟打印</Text>
        <View style={{flex: 1}}></View>
        <If condition={this.state.reservation_order_print === this.state.order_print_time}>
          <Entypo name={'check'} style={{
            fontSize: 22,
            color: colors.main_color,
          }}/>
        </If>
      </TouchableOpacity>
    )


    if (this.state.reservation_order_print === -1) {

      items.push(
        <TouchableOpacity onPress={() => {
          this.setPrintSettings({print_pre_order: -1})
        }} style={{
          flexDirection: "row",
          paddingHorizontal: 10,
          paddingVertical: 10,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: colors.fontColor,
          borderTopWidth: pxToDp(1),
        }}>
          <Text style={{color: colors.color333, fontSize: 14, fontWeight: 'bold'}}>到点自动打印</Text>
          <View style={{flex: 1}}></View>
          <Entypo name={'check'} style={{
            fontSize: 22,
            color: colors.main_color,
          }}/>
        </TouchableOpacity>
      )
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        } style={{backgroundColor: colors.main_back}}>
        <Fetch navigation={this.props.navigation} onRefresh={this.check_printer_connected.bind(this)}/>

        <Text style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          paddingBottom: 4,
          fontSize: pxToDp(26),
          color: colors.color999,
        }}>云打印机</Text>

        <TouchableOpacity onPress={() => {
          this.onPress(Config.ROUTE_CLOUD_PRINTER);
        }} style={{
          flexDirection: "row",
          paddingHorizontal: 10,
          paddingVertical: 10,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: colors.fontColor,
          borderWidth: pxToDp(1),
          backgroundColor: colors.white,
        }}>
          <Text
            style={{
              color: colors.color333,
              fontSize: 16,
              fontWeight: 'bold'
            }}>{printer_name ? printer_name : '暂无打印机'} </Text>
          <View style={{flex: 1}}></View>
          <Text
            style={[{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.color999,
            }, {color: printer_status_color}]}>{printer_name ? printer_status : '去添加'} </Text>
          <Entypo name='chevron-thin-right' style={{
            fontSize: 18,
          }}/>
        </TouchableOpacity>

        <If condition={Platform.OS !== 'ios'}>

          <Text style={{
            paddingVertical: 15,
            paddingHorizontal: 10,
            paddingBottom: 4,
            fontSize: pxToDp(26),
            color: colors.color999,
          }}>蓝牙打印机</Text>

          <TouchableOpacity onPress={() => null} style={{
            flexDirection: "row",
            paddingHorizontal: 10,
            paddingVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: colors.fontColor,
            borderWidth: pxToDp(1),
            backgroundColor: colors.white,
          }}>
            <Text
              style={{
                color: colors.color333,
                fontSize: 16,
                fontWeight: 'bold'
              }}>自动打印 </Text>
            <View style={{flex: 1}}></View>
            <Switch style={{
              fontSize: 16,
            }} value={this.state.auto_blue_print}
                    onValueChange={(val) => {
                      this.setState({auto_blue_print: val});
                      native.setAutoBluePrint(val)
                    }}/>
          </TouchableOpacity>


          <If condition={printer_id}>
            <TouchableOpacity onPress={() => {
              this.onPress(Config.ROUTE_PRINTER_CONNECT);
            }} style={{
              flexDirection: "row",
              paddingHorizontal: 10,
              paddingVertical: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderColor: colors.fontColor,
              borderWidth: pxToDp(1),
              backgroundColor: colors.white,
            }}>
              <View style={{flexDirection: "row"}}>
                <Text style={{
                  color: colors.color333,
                  fontSize: 16,
                  fontWeight: 'bold'
                }}>打印机: {this.state.printerName} </Text>
                <Text style={{
                  color: colors.color333,
                  fontSize: 16,
                  fontWeight: 'bold'
                }}>信号: {this.state.printerRssi} </Text>
              </View>
              <View style={{flex: 1}}></View>
              <Text
                style={[{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: colors.color999,
                }, {color: this.state.printerConnected ? colors.main_color : colors.warn_color}]}>{this.state.printerConnected ? '已连接' : '已断开'} </Text>
              <Entypo name='chevron-thin-right' style={{
                fontSize: 18,
              }}/>
            </TouchableOpacity>
          </If>

          <If condition={!printer_id}>
            <TouchableOpacity onPress={() => {
              this.onPress(Config.ROUTE_PRINTER_CONNECT);
            }} style={{
              flexDirection: "row",
              paddingHorizontal: 10,
              paddingVertical: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderColor: colors.fontColor,
              borderWidth: pxToDp(1),
              backgroundColor: colors.white,
            }}>
              <Text
                style={{
                  color: colors.color333,
                  fontSize: 16,
                  fontWeight: 'bold'
                }}>无 </Text>

              <View style={{flex: 1}}></View>
              <Text
                style={[{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: colors.color999,
                }]}>添加打印机</Text>
              <Entypo name='chevron-thin-right' style={{
                fontSize: 18,
              }}/>
            </TouchableOpacity>
          </If>
        </If>


        <Text style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          paddingBottom: 4,
          fontSize: pxToDp(26),
          color: colors.color999,
        }}>预订单打印时间</Text>
        <View style={{backgroundColor: colors.white, borderColor: colors.fontColor, borderWidth: pxToDp(1)}}>
          {items}
        </View>

        <Text style={{
          paddingVertical: 15,
          paddingHorizontal: 10,
          paddingBottom: 4,
          fontSize: pxToDp(26),
          color: colors.color999,
        }}>自定义设置</Text>


        <TouchableOpacity onPress={() => {
          this.onPress(Config.DIY_PRINTER);
        }} style={{
          flexDirection: "row",
          paddingHorizontal: 10,
          paddingVertical: 10,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: colors.fontColor,
          borderWidth: pxToDp(1),
          backgroundColor: colors.white,
        }}>
          <Text
            style={{
              color: colors.color333,
              fontSize: 16,
              fontWeight: 'bold'
            }}>自定义打印小票 </Text>
          <View style={{flex: 1}}></View>
          <Entypo name='chevron-thin-right' style={{
            fontSize: 18,
          }}/>
        </TouchableOpacity>

      </ScrollView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PrinterSetting)
