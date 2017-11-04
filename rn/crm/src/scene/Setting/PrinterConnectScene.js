//import liraries
import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  AppState,
  Platform,
  ListView,
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {
  Cells,
  CellsTitle,
  Cell,
  CellBody,
  CellFooter,
} from "../../weui/index";

import Button from 'react-native-vector-icons/MaterialCommunityIcons';
import BleManager from 'react-native-ble-manager';

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

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// create a component
class PrinterConnectScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;

    return {
      headerTitle: (
        <View>
          <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>连接蓝牙打印机</Text>
        </View>
      ),
      headerRight: '',
    }
  };

  constructor(props: Object) {
    super(props);

    this.state = {
      isRefreshing: false,
      scanning: false,
      peripherals: new Map(),
      appState: ''
    };

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  componentWillMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    BleManager.start({showAlert: false});
    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }
  }

  componentDidMount() {
  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        console.log('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({appState: nextAppState});
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals});
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({scanning: false});
  }

  startScan() {
    if (!this.state.scanning) {
      BleManager.scan([], 10, true).then(() => {
        console.log('Scanning...');
        this.setState({scanning: true});
      });
    }
  }

  handleDiscoverPeripheral(peripheral) {
    let peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)) {
      console.log('Got ble peripheral', peripheral);
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals})
    }
  }

  test(peripheral) {
    console.log('Connection to ', peripheral.id);
    if (peripheral.connected) {
      BleManager.disconnect(peripheral.id);
    } else {
      BleManager.connect(peripheral.id).then(() => {
        let peripherals = this.state.peripherals;
        let p = peripherals.get(peripheral.id);
        if (p) {
          p.connected = true;
          peripherals.set(peripheral.id, p);
          this.setState({peripherals});
        }
        console.log('Connected to ' + peripheral.id);
      }).catch((error) => {
        console.log('Connection error', error);
      });
    }
  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.startScan();
    setTimeout(() => {
      this.setState({isRefreshing: false})
    }, 10000)
  }

  render() {
    const list = Array.from(this.state.peripherals.values());
    const self = this;
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back}}
      >
        <CellsTitle style={styles.cell_title}>蓝牙设备</CellsTitle>
        {(list.length == 0) &&
        <View style={{flex: 1, margin: 20}}>
          <Text style={{textAlign: 'center'}}>没有设备</Text>
        </View>
        }
        {
          list.length > 0 && list.map(function (item) {
            return (<Cells style={[styles.cells, styles.border_bottom]} key={item.id}>
              <Cell style={[styles.printer_box]} customStyle={{paddingRight: 0,}}>
                <CellBody>
                  <Text style={[styles.printer_name]}>{!!item.name ? item.name : "未知设备"}</Text>
                  <Text style={[styles.printer_number]}>{item.id}</Text>
                </CellBody>

                {item.connected && <CellFooter>
                  <TouchableOpacity
                    style={styles.right_box}
                    onPress={() => {
                      self.test(item)
                    }}
                  >
                    <Button name='link' style={[styles.link_btn, styles.link_status_ok]}/>
                    <Text style={[styles.link_status, styles.link_status_ok]}>已连接</Text>
                  </TouchableOpacity>
                </CellFooter>}
                {!item.connected && <CellFooter>
                  <TouchableOpacity
                    style={styles.right_box}
                    onPress={() => {
                      self.test(item)
                    }}>
                    <Button name='link' style={styles.link_btn}/>
                    <Text style={styles.link_status}>未连接</Text>
                  </TouchableOpacity>
                </CellFooter>}
              </Cell>
            </Cells>)
          })
        }

      </ScrollView>
    );
  }

}


// define your styles
const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },
  cells: {
    marginTop: 0,
  },
  border_bottom: {
    borderBottomWidth: 0,
  },
  printer_box: {
    height: pxToDp(100),
    justifyContent: 'center',
  },
  printer_name: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  printer_number: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.color999,
  },
  right_box: {
    width: pxToDp(120),
    height: '100%',
  },
  link_status_ok: {
    color: colors.main_color,
  },
  link_btn: {
    fontSize: pxToDp(50),
    lineHeight: pxToDp(40),
    fontWeight: 'bold',
    color: colors.color999,
    textAlign: 'center',
  },
  link_status: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.color999,
  },
});

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(PrinterConnectScene)
