import BleManager from 'react-native-ble-manager';
import {Alert, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform} from "react-native";
import store from '../../util/configureStore'
import {setBlueToothDeviceList, setPrinterId} from "../../../reducers/global/globalActions";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

let initBleResult = null
const peripherals = new Map()
let isScanning = false

const startScan = async () => {
  try {
    if (isScanning)
      return
    await BleManager.scan([], 10, false)
    isScanning = true
  } catch (e) {

  }
}
const handleDiscoverPeripheral = (peripheral) => {
  if (!peripheral.name) {
    peripheral.name = '未知设备'
  }
  peripherals.set(peripheral.id, peripheral)
  store.dispatch(setBlueToothDeviceList(Array.from(peripherals.values())))
}
const handleStopScan = () => {
  isScanning = false
}
const handleConnectPeripheral = () => {

}
const handleDisconnectedPeripheral = async (data) => {
  let peripheral = peripherals.get(data.peripheral)
  if (peripheral) {
    peripheral.connected = false
    await BleManager.disconnect(peripheral.id)
    peripherals.set(peripheral.id, peripheral)
    store.dispatch(setBlueToothDeviceList(Array.from(peripherals.values())))
    store.dispatch(setPrinterId('0'))
  }
}

const openBluetooth = async (printer_id) => {
  if (Platform.OS === 'android' && Platform.Version >= 23 && printer_id) {
    try {
      await BleManager.enableBluetooth()
      const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      if (!result)
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    } catch (e) {

    }
  }
}
const handleDidUpdateState = (args, printer_id) => {
  if (args.state === 'off' && printer_id) {
    Alert.alert('蓝牙未开启', '请打开蓝牙，使用蓝牙打印机', [
      {text: '取消'},
      {text: '开启蓝牙', onPress: () => openBluetooth(printer_id)}
    ])
  }
}
export const initBlueTooth = async (showAlert, {printer_id}) => {

  try {
    if (!initBleResult) {
      const options = Platform.select({
        android: {},
        ios: {
          showAlert: showAlert,
          restoreIdentifierKey: 'com.waisongbang.app.bt.restoreIdentifierKey',
          queueIdentifierKey: 'com.waisongbang.app.bt.queueIdentifierKey'
        }
      })
      initBleResult = await BleManager.start(options)
    }
    BleManager.checkState()
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener('BleManagerConnectPeripheral', handleConnectPeripheral);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleManagerEmitter.addListener("BleManagerDidUpdateState", (args) => handleDidUpdateState(args, printer_id))
  } catch (e) {

  }
}

export const unInitBlueTooth = () => {
  bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
  bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
  bleManagerEmitter.removeListener('BleManagerConnectPeripheral', handleConnectPeripheral);
  bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
  bleManagerEmitter.removeListener("BleManagerDidUpdateState", handleDidUpdateState)
}
