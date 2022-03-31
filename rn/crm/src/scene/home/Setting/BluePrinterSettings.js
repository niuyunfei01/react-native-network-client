import React, {PureComponent} from 'react'
import {
  Alert,
  FlatList,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {setPrinterId} from '../../../reducers/global/globalActions';
import {Button} from "@ant-design/react-native";
import BleManager from 'react-native-ble-manager';
import ESC from "../../../util/ble/Ecs"
import {CellsTitle} from "../../../weui";
import pxToDp from "../../../util/pxToDp";

const _ = require('lodash');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

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

class BluePrinterSettings extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      isScanning: false,
      didSearch: false,
      peripherals: new Map(),
      list: [],
      askEnableBle: false
    }
  }

  startScan = () => {
    if (!this.state.isScanning) {
      BleManager.scan([], 10, false).then((results) => {
        this.setState({isScanning: true});
      }).catch(err => {
        console.error("scanning ", err);
      });
    }
  }

  handleStopScan = () => {
    this.setState({isScanning: false})
  }

  handleDisconnectedPeripheral = (id) => {
    let peripheral = this.state.peripherals.get(id);
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id).then(r => console.log("do disconnected: ", peripheral.id, "return", r));
        peripheral.connected = false;
      }

      const {dispatch} = this.props
      const {printer_id} = this.props.global
      if (printer_id === id) {
        dispatch(setPrinterId(''))
      }

      let newPeripherals = this.state.peripherals;
      newPeripherals.set(peripheral.id, peripheral)

      this.setState({
        list: Array.from(this.state.peripherals.values()),
        peripherals: newPeripherals
      });
    }
  }


  retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length === 0) {
        return
      }
      for (let i = 0; i < results.length; i++) {
        const peripheral = results[i];
        peripheral.connected = true;
        this.state.peripherals.set(peripheral.id, peripheral);
      }
      this.setState({list: Array.from(this.state.peripherals.values())});
    });
  }

  handleDiscoverPeripheral = (peripheral) => {
    if (!peripheral.name) {
      peripheral.name = '未名设备';
    }
    this.state.peripherals.set(peripheral.id, peripheral);
    this.setState({list: Array.from(this.state.peripherals.values())});
  }

  handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  testPrintData = () => {
    ESC.resetByte()
    ESC.fontNormalHeightWidth();
    ESC.alignLeft();
    ESC.startLine(32);
    ESC.fontHeightTimes();
    ESC.text('   打印测试单');
    ESC.printAndNewLine();
    ESC.fontHeightTimes();
    ESC.text("合计        X100");
    ESC.printAndNewLine();
    ESC.startLine(32);
    ESC.fontNormalHeightWidth();
    ESC.text('外送帮祝您生意兴隆！');
    ESC.printAndNewLine();
    ESC.hex("0D 0D 0D")
    ESC.walkPaper(4)
    return ESC.getByte()
  }

  testPrint = (peripheral) => {
    setTimeout(() => {
      BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
        const service = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
        const bakeCharacteristic = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';
        setTimeout(() => {
          BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
            setTimeout(() => {
              const testData = this.testPrintData();
              BleManager.write(peripheral.id, service, bakeCharacteristic, testData).then(() => {
                this.alert("打印成功，请查看小票")
              }).catch((error) => {
                this.alert("蓝牙打印失败，请重试")
              });
            }, 500);
          }).catch((error) => {
            this.alert("蓝牙打印失败，请重试")
          });
        }, 200);
      }).catch((error) => {
        this.alert("蓝牙打印机连接失败")
      });
    })
  }

  connectPrinter = (peripheral) => {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id);
      } else {
        BleManager.connect(peripheral.id).then(() => {
          const peripherals = this.state.peripherals;
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            this.setState({list: Array.from(peripherals.values())});
          }
          const {dispatch} = this.props
          dispatch(setPrinterId(peripheral.id))
          setTimeout(() => {
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              BleManager.readRSSI(peripheral.id).then((rssi) => {
                let p = peripherals.get(peripheral.id);
                if (p) {
                  p.rssi = rssi;
                  peripherals.set(peripheral.id, p);
                  this.setState({list: Array.from(peripherals.values())});
                }
              });
            });
          }, 900);
        }).catch((error) => {
          this.alert("蓝牙连接失败，请重试")
        });
      }
    } else {
    }
  }

  alert(text) {
    Alert.alert('提示', text, [{
      text: '确定', onPress: () => {
      }
    }]);
  }


  componentDidMount() {

    BleManager.start({showAlert: false}).then(() => {
    });

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      BleManager.enableBluetooth()
        .then(() => {
        })
        .catch((error) => {
          this.setState({askEnableBle: true})
        });

      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log("定位权限已获得");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log("User 接受");
            } else {
              console.log("User 拒绝");
            }
          });
        }
      });
    }

    this.retrieveConnected()
  }

  componentWillUnmount() {
    bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    bleManagerEmitter.removeListener('BleManagerStopScan', this.handleStopScan);
    bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
    bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);
  }

  renderItem = (item) => {
    return (
      <TouchableHighlight>
        <View style={[styles.between, {marginStart: 10, borderBottomColor: colors.back_color, borderBottomWidth: 1}]}>
          <View style={[styles.columnStart]}>
            <Text style={{fontSize: 16, padding: 2}}>{item.name || '未名设备'}  </Text>
          </View>
          <View style={[styles.between, {paddingEnd: 10, paddingVertical: 5}]}>
            {item.connected && <View style={[styles.between]}>
              <View style={{marginEnd: 10}}>
                <Button
                  size="small"
                  type={"primary"}
                  style={{
                    color: colors.white,
                    paddingVertical: 2,
                    height: pxToDp(70),
                    paddingLeft: pxToDp(30),
                    paddingRight: pxToDp(30),
                  }}
                  onPress={() => this.testPrint(item)}>
                  测试打印
                </Button>
              </View>
              <Button size="small" type={"primary"} style={{
                backgroundColor: '#818181',
                paddingVertical: 2,
                height: pxToDp(70),
                paddingLeft: pxToDp(30),
                borderWidth: 0,
                paddingRight: pxToDp(30),
              }}
                      onPress={() => this.handleDisconnectedPeripheral(item.id)}> 断开</Button>
            </View>}
            {!item.connected &&
            <Button type={"primary"}
                    size="small"
                    style={{
                      borderWidth: 0,
                      backgroundColor: colors.main_color,
                      // paddingVertical: 2,
                      // padding: pxToDp(30),
                      textAlign: 'center',
                      height: pxToDp(70),
                      paddingLeft: pxToDp(30),
                      paddingRight: pxToDp(30),
                      fontSize: pxToDp(40),
                    }}
                    onPress={() => this.connectPrinter(item)}>连接</Button>}
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const connectedList = _.filter(this.state.list, "connected");
    const notConnectedList = _.filter(this.state.list, function (o) {
      return !o.connected;
    });

    return (<SafeAreaView style={{flex: 1}}>
        {this.state.list && <View style={[{flex: 1}, styles.columnStart]}>
          <CellsTitle style={[styles.cell_title]}>已连接打印机</CellsTitle>
          <FlatList style={{height: 50 * connectedList.length, flexGrow: 0}} data={connectedList}
                    renderItem={({item}) => this.renderItem(item)} keyExtractor={item => item.id}/>
          <CellsTitle style={[styles.cell_title]}>未连接打印机</CellsTitle>
          <FlatList data={notConnectedList} renderItem={({item}) => this.renderItem(item)}
                    keyExtractor={item => item.id}/>
        </View>}
        {(this.state.list.length === 0 && !this.state.isScanning) &&
        <View style={{flex: 1, margin: 20}}>
          <Text style={{textAlign: 'center'}}>{this.state.didSearch ? '未搜索到蓝牙设备' : '点击搜索按钮搜索蓝牙设备'}  </Text>
        </View>}

        <View style={{backgroundColor: colors.main_back}}>
          {this.state.askEnableBle && <View style={{margin: 10}}>
            <Button nPress={() => {
            }}>开启蓝牙打印</Button>
          </View>}
          <View style={{margin: 10}}>
            <Button
              type={'primary'}
              style={{
                backgroundColor: '#4a98e7',
                marginHorizontal: pxToDp(30),
                borderRadius: pxToDp(20),
                textAlign: 'center',
                marginBottom: pxToDp(30),
              }}
              onPress={() => this.startScan()}>搜索蓝牙打印机 {this.state.isScanning ? `(搜索中...${this.state.list.length})` :
              `(共${this.state.list.length}个)`}</Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  columnStart: {
    flexDirection: "column",
  },
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BluePrinterSettings)
