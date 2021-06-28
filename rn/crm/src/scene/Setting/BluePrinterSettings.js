import React, {PureComponent, useState, useEffect} from 'react'
import {Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView, View, NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight
} from 'react-native';
import colors from "../../styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import BleManager from 'react-native-ble-manager';

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

console.log("bleManager: ", BleManager)

class BluePrinterSettings extends PureComponent {

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '蓝牙打印设置',
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      isScanning: false,
      setIsScanning: false,
      peripherals: new Map(),
      list: [],
      askEnableBle: false
    }

    this.navigationOptions(this.props)

    console.log("ble_manager_in_constructor:", BleManager)

  }

  startScan = () => {
    if (!this.state.isScanning) {
      BleManager.scan([], 3, false).then((results) => {
        this.setState({setIsScanning: true});
      }).catch(err => {
        console.error("scanning ", err);
      });
    }
  }

  handleStopScan = () => {
    console.log('Scan is stopped');
    this.setState({setIsScanning: false})
  }

  handleDisconnectedPeripheral = (data) => {
    let peripheral = this.state.peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;

      let newPeripherals = this.state.peripherals;
      newPeripherals.set(peripheral.id, peripheral)

      this.setState({
        list: Array.from(this.state.peripherals.values()),
        peripherals: newPeripherals
      });
    }
    console.log('Disconnected from ' + data.peripheral);
  }


  retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length === 0) {
        console.log('No connected peripherals')
      }
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({list: Array.from(peripherals.values())});
      }
    });
  }

  handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = '未名蓝牙设备';
    }
    this.state.peripherals.set(peripheral.id, peripheral);
    this.setState({list: Array.from(this.state.peripherals.values())});
  }

  handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  testPeripheral = (peripheral) => {
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
          console.log('Connected to ' + peripheral.id);
          setTimeout(() => {

            /* Test read current RSSI value */
            BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
              console.log('Retrieved peripheral services', peripheralData);
              BleManager.readRSSI(peripheral.id).then((rssi) => {
                console.log('Retrieved actual RSSI value', rssi);
                let p = peripherals.get(peripheral.id);
                if (p) {
                  p.rssi = rssi;
                  peripherals.set(peripheral.id, p);
                  this.setState({list: Array.from(peripherals.values())});
                }
              });
            });

            // Test using bleno's pizza example
            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
            /*
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(peripheralInfo);
              var service = '13333333-3333-3333-3333-333333333337';
              var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
              var crustCharacteristic = '13333333-3333-3333-3333-333333330001';

              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                  console.log('Started notification on ' + peripheral.id);
                  setTimeout(() => {
                    BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                      console.log('Writed NORMAL crust');
                      BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
                        console.log('Writed 351 temperature, the pizza should be BAKED');

                        //var PizzaBakeResult = {
                        //  HALF_BAKED: 0,
                        //  BAKED:      1,
                        //  CRISPY:     2,
                        //  BURNT:      3,
                        //  ON_FIRE:    4
                        //};
                      });
                    });

                  }, 500);
                }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 200);
            });*/


          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
      }
    }
  }

  componentDidMount() {

    console.log("bleManager did Mount: ", BleManager)
    BleManager.start({showAlert: false}).then(() => {
      console.log("BleManager Module initialized");
    });

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      BleManager.enableBluetooth()
          .then(() => {
            console.log("The bluetooth is already enabled or the user confirm");
          })
          .catch((error) => {
            console.log("The user refuse to enable bluetooth:", error);
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
  }

  componentWillUnmount() {
    console.log('unmount');
    bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    bleManagerEmitter.removeListener('BleManagerStopScan', this.handleStopScan);
    bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
    bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);
  }

  renderItem = (item) => {
    const color = item.connected ? 'green' : '#fff';
    return (
        <TouchableHighlight onPress={() => this.testPeripheral(item) }>
          <View style={[styles.row, {backgroundColor: color}]}>
            <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
            <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text>
            <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item.id}</Text>
          </View>
        </TouchableHighlight>
    );
  }

  render() {
    return (<SafeAreaView>
          <ScrollView
              refreshControl={
                <RefreshControl contentInsetAdjustmentBehavior="automatic" tintColor='gray' refreshing={this.state.isScanning}/>
              }
              style={{backgroundColor: colors.main_back}}>
            <View style={styles.body}>
              {this.state.askEnableBle && <View style={{margin: 10}}>
                <Button title={`开启蓝牙打印`} onPress={() => {}}/>
              </View>}
              <View style={{margin: 10}}>
                <Button
                    title={`搜索蓝牙打印机${this.state.isScanning ? '(搜索中...)' : ''}`}
                    onPress={() => this.startScan()}
                />
              </View>
              <View style={{margin: 10}}>
                <Button title="Retrieve connected peripherals" onPress={() => this.retrieveConnected()}/>
              </View>
              {(this.state.list.length === 0) &&
              <View style={{flex: 1, margin: 20, borderWidth: 1, borderColor: 'black'}}>
                <Text style={{textAlign: 'center'}}>暂无打印机</Text>
              </View>
              }
            </View>
          </ScrollView>
          <FlatList
              data={this.state.list}
              renderItem={({item}) => this.renderItem(item)}
              keyExtractor={item => item.id}
          />
        </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
});


export default connect(mapStateToProps, mapDispatchToProps)(BluePrinterSettings)
