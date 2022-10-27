import React, {PureComponent} from 'react'
import {

  FlatList,
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
import {Button} from "@ant-design/react-native";
import {CellsTitle} from "../../../weui";
import pxToDp from "../../../pubilc/util/pxToDp";
import tool from "../../../pubilc/util/tool";
import {
  connectBluetoothDevice,
  handleDisconnectedPeripheral,
  retrieveConnected,
  startScan,
  testPrint
} from "../../../pubilc/util/ble/handleBlueTooth";

const _ = require('lodash');

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
      askEnableBle: false
    }
  }

  componentDidMount = async () => {
    await retrieveConnected()
  }

  renderItem = (item) => {
    return (
      <TouchableHighlight>
        <View style={[styles.between, {marginStart: 10, borderBottomColor: colors.back_color, borderBottomWidth: 1}]}>
          <View style={[styles.columnStart]}>
            <Text style={{fontSize: 16, padding: 2}}>{item.name}  </Text>
          </View>
          <View style={[styles.between, {paddingEnd: 10, paddingVertical: 5}]}>
            <If condition={item.connected}>
              <View style={[styles.between]}>
                <View style={{marginEnd: 10}}>
                  <Button size="small" type={"primary"} style={styles.testPrintBtn} onPress={() => testPrint(item)}>
                    测试打印
                  </Button>
                </View>
                <Button size="small" type={"primary"} style={styles.disConnectBTBtn}
                        onPress={() => handleDisconnectedPeripheral(item.id)}>
                  断开
                </Button>
              </View>
            </If>
            <If condition={!item.connected}>
              <Button type={'primary'}
                      size={'small'}
                      style={styles.connectBTBtn}
                      onPress={() => connectBluetoothDevice(item)}>
                连接
              </Button>
            </If>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    const {bluetoothDeviceList, isScanningBluetoothDevice} = this.props.global
    const connectedList = _.filter(bluetoothDeviceList, "connected");
    const notConnectedList = _.filter(bluetoothDeviceList, function (o) {
      return !o.connected;
    });
    return (
      <SafeAreaView style={{flex: 1}}>
        <If condition={bluetoothDeviceList}>
          <View style={[{flex: 1}, styles.columnStart]}>
            <CellsTitle style={[styles.cell_title]}>已连接打印机</CellsTitle>
            <FlatList style={{height: 50 * tool.length(connectedList), flexGrow: 0}}
                      data={connectedList}
                      initialNumToRender={1}
                      renderItem={({item}) => this.renderItem(item)}
                      keyExtractor={item => item.id}/>
            <CellsTitle style={[styles.cell_title]}>未连接打印机</CellsTitle>
            <FlatList data={notConnectedList}
                      initialNumToRender={10}
                      renderItem={({item}) => this.renderItem(item)}
                      keyExtractor={item => item.id}/>
          </View>
        </If>
        <If condition={tool.length(bluetoothDeviceList) === 0 && !isScanningBluetoothDevice}>
          <View style={{flex: 1, margin: 20}}>
            <Text style={{textAlign: 'center'}}>
              {this.state.didSearch ? '未搜索到蓝牙设备' : '点击搜索按钮搜索蓝牙设备'}
            </Text>
          </View>
        </If>

        <View style={{backgroundColor: colors.f2}}>
          <View style={{margin: 10}}>
            <Button type={'primary'}
                    style={styles.searchBluetoothBtn}
                    onPress={() => startScan()}>
              搜索蓝牙打印机 {isScanningBluetoothDevice ? `(搜索中...${bluetoothDeviceList.length})` : `(共${bluetoothDeviceList.length}个)`}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  searchBluetoothBtn: {
    backgroundColor: '#4a98e7',
    marginHorizontal: pxToDp(30),
    borderRadius: pxToDp(20),
    textAlign: 'center',
    marginBottom: pxToDp(30),
  },
  testPrintBtn: {
    color: colors.white,
    paddingVertical: 2,
    height: pxToDp(70),
    paddingLeft: pxToDp(30),
    paddingRight: pxToDp(30),
  },
  disConnectBTBtn: {
    backgroundColor: '#818181',
    paddingVertical: 2,
    height: pxToDp(70),
    paddingLeft: pxToDp(30),
    borderWidth: 0,
    paddingRight: pxToDp(30),
  },
  connectBTBtn: {
    borderWidth: 0,
    backgroundColor: colors.main_color,
    // paddingVertical: 2,
    // padding: pxToDp(30),
    textAlign: 'center',
    height: pxToDp(70),
    paddingLeft: pxToDp(30),
    paddingRight: pxToDp(30),
    fontSize: pxToDp(40),
  },
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
