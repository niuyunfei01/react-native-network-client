import BleManager from 'react-native-ble-manager';
import {Alert, DeviceEventEmitter, NativeEventEmitter, NativeModules, PermissionsAndroid, Platform} from "react-native";
import store from '../../util/configureStore'
import {
  setBleStarted, setBlueToothDeviceList, setIsScanningBlueTooth, setPrinterId
} from "../../../reducers/global/globalActions";
import ESC from "./Ecs";
import tool from "../tool";
import Config from "../../common/config";
import {sendDeviceStatus} from "../../component/jpushManage";
import {print_order_to_bt} from './OrderPrinter'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

let initBleResult = null
let global = null
const peripherals = new Map()
let iosBluetoothPrintListener = null
let androidBluetoothPrintListener = null
export const startScan = async () => {
  try {
    if (global.isScanningBluetoothDevice)
      return
    await BleManager.scan([], 10, false)
    store.dispatch(setIsScanningBlueTooth(true))
  } catch (e) {

  }
}
const handleDiscoverPeripheral = (peripheral) => {
  if (!peripheral.name) {
    peripheral.name = '未知设备名称'
  }
  peripherals.set(peripheral.id, peripheral)

  store.dispatch(setBlueToothDeviceList(Array.from(peripherals.values())))
}
const handleStopScan = () => {
  store.dispatch(setIsScanningBlueTooth(false))
}
const handleConnectPeripheral = () => {

}
export const handleDisconnectedPeripheral = async (id) => {
  let peripheral = peripherals.get(id)
  if (peripheral) {

    await BleManager.disconnect(peripheral.id)
    peripheral.connected = false
    peripherals.set(peripheral.id, peripheral)
    store.dispatch(setBlueToothDeviceList(Array.from(peripherals.values())))
    store.dispatch(setPrinterId('0'))
  }
}

const openBluetooth = async () => {
  needShowOpenBluetoothStatus = false
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    try {
      await BleManager.enableBluetooth()
      const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      if (!result)
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    } catch (e) {

    }
  }
}
let needShowOpenBluetoothStatus = true//防止多次提示
const handleDidUpdateState = (args, printer_id) => {
  switch (Platform.OS) {
    case "android":
      if (args.state === 'off' && printer_id && needShowOpenBluetoothStatus) {
        Alert.alert('蓝牙未开启', '请打开蓝牙，使用蓝牙打印机', [
          {text: '取消', onPress: () => needShowOpenBluetoothStatus = false},
          {text: '开启蓝牙', onPress: () => openBluetooth()}
        ])
      }
      break
    case "ios":
      if (args.state === 'off' && printer_id && needShowOpenBluetoothStatus) {
        Alert.alert('蓝牙未开启', '请到设置打开蓝牙，使用蓝牙打印机', [
          {
            text: '确定',
            onPress: () => needShowOpenBluetoothStatus = false
          }
        ])
      }
      break
  }
  if (args.state === 'on') {
    needShowOpenBluetoothStatus = true
  }
}

const handleCentralManagerWillRestoreState = () => {
}
export const connectBluetoothDevice = async (peripheral) => {
  try {
    await BleManager.stopScan()
    if (peripheral.connected) {
      await BleManager.disconnect(peripheral.id)
    }
    await BleManager.connect(peripheral.id)
    let p = peripherals.get(peripheral.id)
    p.connected = true;
    if (p) {
      peripherals.set(peripheral.id, p);
      await BleManager.retrieveServices(peripheral.id)
      p.rssi = await BleManager.readRSSI(peripheral.id)
      store.dispatch(setBlueToothDeviceList(Array.from(peripherals.values())))
      store.dispatch(setPrinterId(peripheral.id))
    }
  } catch (e) {
    Alert.alert('提示', '连接失败', [{text: '确定'}]);
  }

}
export const initBlueTooth = async (reduxGlobal) => {

  bleManagerEmitter.addListener('BleManagerCentralManagerWillRestoreState', handleCentralManagerWillRestoreState)
  bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
  bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
  bleManagerEmitter.addListener('BleManagerConnectPeripheral', handleConnectPeripheral);
  bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
  bleManagerEmitter.addListener("BleManagerDidUpdateState", (args) => handleDidUpdateState(args, reduxGlobal.printer_id))


  try {
    if (!initBleResult) {
      const options = Platform.select({
        android: {},
        ios: {
          showAlert: !!reduxGlobal.printer_id,
          restoreIdentifierKey: 'com.waisongbang.app.bt.restoreIdentifierKey',
          queueIdentifierKey: 'com.waisongbang.app.bt.queueIdentifierKey'
        }
      })
      initBleResult = await BleManager.start(options)
      store.dispatch(setBleStarted(true));
    }
    if (!global)
      global = reduxGlobal
    BleManager.checkState()

  } catch (e) {

  }
}

export const unInitBlueTooth = () => {
  bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
  bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
  bleManagerEmitter.removeListener('BleManagerConnectPeripheral', handleConnectPeripheral);
  bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
  bleManagerEmitter.removeListener("BleManagerDidUpdateState", handleDidUpdateState)
  bleManagerEmitter.removeListener('BleManagerCentralManagerWillRestoreState', handleCentralManagerWillRestoreState)
  iosBluetoothPrintListener && iosBluetoothPrintListener.remove()
  androidBluetoothPrintListener && androidBluetoothPrintListener.remove()
  iosBluetoothPrintListener = null
  androidBluetoothPrintListener = null
}

const testPrintData = (data) => {
  ESC.resetByte()
  ESC.fontNormalHeightWidth();
  ESC.alignLeft();
  ESC.startLine(32);
  ESC.fontHeightTimes();
  ESC.text('   打印测试单');
  ESC.printAndNewLine();
  ESC.fontHeightTimes();
  if (data)
    ESC.text(`   ${data}`);
  else
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

export const testPrint = (peripheral, data = null) => {
  setTimeout(() => {
    BleManager.retrieveServices(peripheral.id).then(() => {
      const service = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
      const bakeCharacteristic = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';
      setTimeout(() => {
        BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
          setTimeout(() => {
            const testData = testPrintData(data);
            BleManager.write(peripheral.id, service, bakeCharacteristic, testData).then(() => {
              alert("打印成功，请查看小票")
            }).catch(() => {
              alert("蓝牙打印失败，请重试")
            });
          }, 500);
        }).catch(() => {
          alert("蓝牙打印失败，请重试",)
        });
      }, 200);
    }).catch(() => {
      alert("蓝牙打印机连接失败")
    });
  })
}

const alert = (text) => {
  Alert.alert('提示', text, [{text: '确定'}]);
}
export const retrieveConnected = async () => {

  const results = await BleManager.getConnectedPeripherals([]);
  if (tool.length(results) === 0) {
    return
  }
  for (let i = 0; i < tool.length(results); i++) {
    const peripheral = results[i];
    peripheral.connected = true;
    peripherals.set(peripheral.id, peripheral);
  }
  store.dispatch(setBlueToothDeviceList(Array.from(peripherals.values())))
}

const handlePrintOrder = (navigation, obj) => {
  let {accessToken, printer_id, bleStarted, autoBluetoothPrint} = global;
  if (!autoBluetoothPrint) {
    sendDeviceStatus(accessToken, obj)
    return;
  }
  if (printer_id && autoBluetoothPrint) {
    setTimeout(async () => {
      const clb = (msg, error) => {
        sendDeviceStatus(accessToken, {...obj, btConnected: `打印结果:${msg}-${error || ''}`})
      };

      try {
        const peripheral = await BleManager.retrieveServices(printer_id)
        print_order_to_bt(accessToken, peripheral, clb, obj.wm_id, false, 1);
      } catch (error) {
        //蓝牙尚未启动时，会导致App崩溃
        if (!bleStarted) {
          sendDeviceStatus(accessToken, {...obj, btConnected: '蓝牙尚未启动'})
          return;
        }
        try {
          await BleManager.connect(printer_id)
          const peripheral = await BleManager.retrieveServices(printer_id)
          print_order_to_bt(accessToken, peripheral, clb, obj.wm_id, false, 1);
        } catch (error2) {
          sendDeviceStatus(accessToken, {...obj, btConnected: `已断开:error1-${error} error2-${error2}`})
          Alert.alert('提示', '无法自动打印: 打印机已断开连接', [
            {
              text: '确定',
              onPress: () => navigation.navigate(Config.ROUTE_PRINTERS)
            },
            {text: '取消'}
          ]);
        }
      }
    }, 300);
    return
  }
  sendDeviceStatus(accessToken, {...obj, btConnected: '未连接或者未开启自动打印'})
  Alert.alert('提示', '无法自动打印: 尚未连接到打印机', [
    {
      text: '确定',
      onPress: () => navigation.navigate(Config.ROUTE_PRINTERS)
    },
    {text: '取消'}
  ]);
}
const printByBluetoothIOS = (navigation) => {
  let {accessToken} = global;
  const iosEmitter = new NativeEventEmitter(NativeModules.IOSToReactNativeEventEmitter)
  iosBluetoothPrintListener = iosEmitter.addListener(Config.Listener.KEY_PRINT_BT_ORDER_ID, (obj) => {
    if (obj.order_type !== 'new_order') {
      sendDeviceStatus(accessToken, {...obj, btConnected: '收到极光推送，不是新订单不需要打印'})
      return
    }
    handlePrintOrder(navigation, obj)
  })
}


const printByBluetoothAndroid = (navigation) => {

  androidBluetoothPrintListener = DeviceEventEmitter.addListener(Config.Listener.KEY_PRINT_BT_ORDER_ID, (obj) => {
    handlePrintOrder(navigation, obj)

  })
}

export const printByBluetooth = (navigation) => {
  switch (Platform.OS) {
    case "ios":
      printByBluetoothIOS(navigation)
      break
    case "android":
      printByBluetoothAndroid(navigation)
      break
  }
}
