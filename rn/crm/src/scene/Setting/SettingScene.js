import React, {PureComponent} from 'react'
import {Alert, InteractionManager, RefreshControl, ScrollView, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import Config, {hostPort} from "../../config";
import Button from 'react-native-vector-icons/Entypo';
import {List, Radio} from "@ant-design/react-native";
import GlobalUtil from "../../util/GlobalUtil";
import JbbText from "../component/JbbText";
import {native} from "../../common";
import BleManager from "react-native-ble-manager";
import {Styles} from "../../themes";
import JPush from "jpush-react-native";

const {HOST_UPDATED} = require("../../common/constants").default;
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
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '设置',
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      switch_val: false,
      enable_notify: true,
      enable_new_order_notify: true,
      auto_blue_print: false,
      notificationEnabled: 1,
      servers: [
        {name: '正式版1', host: "www.cainiaoshicai.cn"},
        {name: '正式版2', host: "api.waisongbang.com"},
        {name: '预览版', host: "rc.waisongbang.com"},
        {name: 'Beta版', host: "beta7.waisongbang.com"},
        {name: '测试版4', host: "fire4.waisongbang.com"},
        {name: '测试版5', host: "fire5.waisongbang.com"},
        {name: '测试版6', host: "fire6.waisongbang.com"},
        {name: '测试版7', host: "fire7.waisongbang.com"},
        {name: '测试版8', host: "fire8.waisongbang.com"},
      ]
    }

    native.getDisableSoundNotify((disabled, msg) => {
      this.setState({enable_notify: !disabled })
    })

    native.getNewOrderNotifyDisabled((disabled, msg) => {
      this.setState({enable_new_order_notify: !disabled})
    })

    native.getAutoBluePrint((auto, msg) => {
      this.setState({auto_blue_print: auto})
    })

    this.check_printer_connected();
    this.navigationOptions(this.props)
  }

  check_printer_connected() {
    const {printer_id} = this.props.global
    if (printer_id && this.state.checkingPrinter !== true) {
      this.setState({checkingPrinter: true})
      setTimeout(() => {
        BleManager.retrieveServices(printer_id).then((peripheralData) => {
          console.log('Retrieved peripheral services', peripheralData);
          this.setState({
            printerId: printer_id,
            printerName: peripheralData.name,
            printerConnected: true,
            printerRssi: peripheralData.rssi
          })
          BleManager.readRSSI(printer_id).then((rssi) => {
            console.log('Retrieved actual RSSI value', rssi);
            this.setState({printerRssi: rssi});
          });
        }).catch((error) => {
          this.setState({printerId: printer_id, printerConnected: false})
          console.log("error:", error)
        });

        this.setState({checkingPrinter: false})
      }, 900);
    }
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  onPress(route, params = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params);
    });
  }

  render() {
    this.check_printer_connected()
    JPush.isNotificationEnabled((enabled) => {
        this.setState({notificationEnabled: enabled})
    })

    const {printer_id} = this.props.global
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back}}>
        <CellsTitle style={[styles.cell_title]}>蓝牙打印机</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>自动打印</Text>
            </CellBody>
            <CellFooter>
              <Switch
                value={this.state.auto_blue_print}
                onValueChange={(val) => {
                  this.setState({auto_blue_print: val});
                  native.setAutoBluePrint(val)
                }}
              />
            </CellFooter>
          </Cell>

          {!!printer_id &&
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
                <View style={[Styles.row]}>
                  <Text style={[styles.cell_body_text]}>打印机: {this.state.printerName}</Text>
                  <Text style={[styles.cell_body_comment, {alignSelf: "center", marginStart: 8}]}>信号: {this.state.printerRssi}</Text>
                </View>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                onPress={() => { this.onPress(Config.ROUTE_PRINTER_CONNECT); }}>
                <Text style={[styles.printer_status, this.state.printerConnected ? styles.printer_status_ok : styles.printer_status_error]}>{this.state.printerConnected ? '已连接' : '已断开'}</Text>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>}

          {!printer_id  &&
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>无</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                onPress={() => { this.onPress(Config.ROUTE_PRINTER_CONNECT); }}>
                <Text style={[styles.printer_status]}>添加打印机</Text>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>}

        </Cells>

        <CellsTitle style={styles.cell_title}>云打印机</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>添加云打印机</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                onPress={() => { this.onPress(Config.ROUTE_CLOUD_PRINTER); }}>
                <Text style={[styles.printer_status, styles.printer_status_error]}>异常</Text>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>

        <CellsTitle style={styles.cell_title}>提醒</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>系统通知</Text>
            </CellBody>
            <CellFooter>
              {this.state.notificationEnabled && <Text>已开启</Text> || <Text style={[styles.printer_status, styles.printer_status_error]}>去系统设置中开启</Text>}
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>后台运行</Text>
            </CellBody>
            <CellFooter>
              <Text style={[styles.printer_status, styles.printer_status_error]}>未开启，去设置</Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>语音播报</Text>
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
              <Text style={[styles.cell_body_text]}>新订单通知</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.enable_new_order_notify}
                onValueChange={(val) => { this.setState({enable_new_order_notify: val});
                  native.setDisabledNewOrderNotify(!val)
                }} />
            </CellFooter>
          </Cell>
        </Cells>
        {this.renderServers()}
      </ScrollView>
    );
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
      items.push(<RadioItem key={i} style={{fontSize: 12, fontWeight:'bold'}} checked={host === server.host} onChange={event => {
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
  cell_body_comment: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.color999,
  },
  printer_status: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color999,
  },
  printer_status_ok: {
    color: colors.main_color,
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


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SettingScene)
