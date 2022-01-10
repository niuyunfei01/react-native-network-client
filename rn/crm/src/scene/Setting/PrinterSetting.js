import React, {PureComponent} from 'react'
import {
  InteractionManager,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {setPrinterName} from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import Config from "../../config";
import Button from 'react-native-vector-icons/Entypo';
import {native} from "../../common";
import BleManager from "react-native-ble-manager";
import {Styles} from "../../themes";
import JbbText from "../component/JbbText";
import {List} from "@ant-design/react-native";
import RadioItem from "@ant-design/react-native/es/radio/RadioItem";
import HttpUtils from "../../util/http";
import {showError, ToastShort} from "../../util/ToastUtils";
import tool from "../../common/tool";

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
    items.push(<RadioItem key="0" style={{fontSize: 12, fontWeight: 'bold'}}
                          checked={this.state.reservation_order_print === 0}
                          onChange={event => {
                            if (event.target.checked) {
                              this.setPrintSettings({print_pre_order: 0})
                            }
                          }}><JbbText>来单立刻打印</JbbText></RadioItem>)
    items.push(<RadioItem key="1" style={{fontSize: 12, fontWeight: 'bold'}}
                          checked={this.state.reservation_order_print === this.state.order_print_time}
                          onChange={event => {
                            if (event.target.checked) {
                              this.setPrintSettings({print_pre_order: this.state.order_print_time})
                            }
                          }}><JbbText>送达前{this.state.order_print_time}分钟打印</JbbText></RadioItem>)
    if(this.state.reservation_order_print === -1){
      items.push(<RadioItem key="1" style={{fontSize: 12, fontWeight: 'bold'}}
                            checked={true}
                            onChange={event => {
                              if (event.target.checked) {
                                this.setPrintSettings({print_pre_order: -1})
                              }
                            }}><JbbText>到点自动打印</JbbText></RadioItem>)
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
        <CellsTitle style={styles.cell_title}>云打印机</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text
                style={[styles.cell_body_text]}>{printer_name ? printer_name : '暂无打印机'}</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  this.onPress(Config.ROUTE_CLOUD_PRINTER);
                                }}>
                <Text
                  style={[styles.printer_status, {color: printer_status_color}]}>{printer_name ? printer_status : '去添加'}</Text>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>


        </Cells>


        <If condition={Platform.OS !== 'ios'}>
        <CellsTitle style={[styles.cell_title]}>蓝牙打印机</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>自动打印</Text>
            </CellBody>
            <CellFooter>
              <Switch value={this.state.auto_blue_print}
                      onValueChange={(val) => {
                        if (Platform.OS === 'ios') {
                          showError("ios版本暂不支持");
                        } else {
                          this.setState({auto_blue_print: val});
                          native.setAutoBluePrint(val)
                        }
                      }}/>
            </CellFooter>
          </Cell>

          {!!printer_id &&
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <View style={[Styles.row]}>
                <Text style={[styles.cell_body_text]}>打印机: {this.state.printerName}</Text>
                <Text style={[styles.cell_body_comment, {
                  alignSelf: "center",
                  marginStart: 8
                }]}>信号: {this.state.printerRssi}</Text>
              </View>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  this.onPress(Config.ROUTE_PRINTER_CONNECT);
                                }}>
                <Text
                  style={[styles.printer_status, this.state.printerConnected ? styles.printer_status_ok : styles.printer_status_error]}>{this.state.printerConnected ? '已连接' : '已断开'}</Text>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>}

          {!printer_id &&
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>无</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box]}
                                onPress={() => {
                                  this.onPress(Config.ROUTE_PRINTER_CONNECT);
                                }}>
                <Text style={[styles.printer_status]}>添加打印机</Text>
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>}

        </Cells>
        </If>


        <CellsTitle style={styles.cell_title}>预订单打印时间</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <List style={{marginTop: 12}}>
            {items}
          </List>
        </Cells>
        <CellsTitle style={styles.cell_title}>自定义设置</CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              <Text style={[styles.cell_body_text]}>自定义打印小票</Text>
            </CellBody>
            <CellFooter>
              <TouchableOpacity style={[styles.right_box, {width: pxToDp(100)}]} onPress={() => {
                this.onPress(Config.DIY_PRINTER);
              }}>
                {/*<Text style={[styles.printer_status]}>待开发</Text>*/}
                <Button name='chevron-thin-right' style={[styles.right_btn]}/>
              </TouchableOpacity>
            </CellFooter>
          </Cell>
        </Cells>
      </ScrollView>
    );
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
    fontSize: pxToDp(32),
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
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


export default connect(mapStateToProps, mapDispatchToProps)(PrinterSetting)
