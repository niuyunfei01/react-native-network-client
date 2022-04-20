import React, {Component} from 'react'
import _ from 'lodash';
import {Alert, Platform, StyleSheet, TouchableOpacity, View} from 'react-native'

import BleModule from '../../../pubilc/util/ble/BleModule';
import ESC from "../../../pubilc/util/ble/Ecs";

global.BluetoothManager = new BleModule();
export default class BlueToothPrinterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      scaning: false,
      isConnected: false,
      text: '',
      writeData: '',
      receiveData: '',
      readData: '',
      isMonitoring: false
    }

    this.bluetoothReceiveData = [];//蓝牙接收的数据缓存
    this.deviceMap = new Map();
  }

  componentDidMount() {

    BluetoothManager.start();//蓝牙初始化
    this.updateStateListener = BluetoothManager.addListener('BleManagerDidUpdateState', this.handleUpdateState);
    this.stopScanListener = BluetoothManager.addListener('BleManagerStopScan', this.handleStopScan);
    this.discoverPeripheralListener = BluetoothManager.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    this.connectPeripheralListener = BluetoothManager.addListener('BleManagerConnectPeripheral', this.handleConnectPeripheral);
    this.disconnectPeripheralListener = BluetoothManager.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectPeripheral);
    this.updateValueListener = BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue);

  }

  componentWillUnmount() {

    this.updateStateListener.remove();
    this.stopScanListener.remove();
    this.discoverPeripheralListener.remove();
    this.connectPeripheralListener.remove();
    this.disconnectPeripheralListener.remove();

    this.updateValueListener.remove();

    if (this.state.isConnected) {

      BluetoothManager.disconnect();//退出时断开蓝牙连接

    }

  }

//蓝牙状态改变

  handleUpdateState = (args) => {


    BluetoothManager.bluetoothState = args.state;

    if (args.state === 'on') {//蓝牙打开时自动搜索

      this.scan();

    }

  }


  handleStopScan = () => {
    this.setState({scaning: false});
  }


  handleDiscoverPeripheral = (data) => {

    let id;//蓝牙连接id
    let macAddress;//蓝牙Mac地址
    if (Platform.OS === 'android') {
      macAddress = data.id;
      id = macAddress;
    } else {
//ios连接时不需要用到Mac地址，但跨平台识别同一设备时需要Mac地址
      //如果广播携带有Mac地址，ios可通过广播0x18获取蓝牙Mac地址，
      macAddress = BluetoothManager.getMacAddressFromIOS(data);
      id = data.id;
    }

    this.deviceMap.set(data.id, data);//使用Map类型保存搜索到的蓝牙设备，确保列表不显示重复的设备
    this.setState({data: [...this.deviceMap.values()]});
  }

//蓝牙设备已连接

  handleConnectPeripheral = (args) => {
  }

//蓝牙设备已断开连接

  handleDisconnectPeripheral = (args) => {
    let newData = [...this.deviceMap.values()]
    BluetoothManager.initUUID();//断开连接后清空UUID
    this.setState({
      data: newData,

      isConnected: false,

      writeData: '',

      readData: '',

      receiveData: '',

      text: '',

    });

  }

//接收到新数据

  handleUpdateValue = (data) => {

//ios接收到的是小写的16进制，android接收的是大写的16进制，统一转化为大写16进制

    let value = data.value.toUpperCase();

    this.bluetoothReceiveData.push(value);

    this.setState({receiveData: this.bluetoothReceiveData.join('')})

  }

  connect(item) {

//当前蓝牙正在连接时不能打开另一个连接进程

    if (BluetoothManager.isConnecting) {
      return;
    }

    if (this.state.scaning) {//当前正在扫描中，连接时关闭扫描

      BluetoothManager.stopScan();

      this.setState({scaning: false});

    }

    let newData = [...this.deviceMap.values()]

    newData[item.index].isConnecting = true;

    this.setState({data: newData});

    BluetoothManager.connect(item.item.id)

      .then(peripheralInfo => {

        let newData = [...this.state.data];

        newData[item.index].isConnecting = false; //连接成功，列表只显示已连接的设备
        this.setState({
          data: [item.item],
          isConnected: true
        });
      })
      .catch(err => {
        let newData = [...this.state.data];
        newData[item.index].isConnecting = false;
        this.setState({data: newData});
        this.alert('连接失败');
      })

  }

  disconnect() {

    this.setState({
      data: [...this.deviceMap.values()],
      isConnected: false
    });
    BluetoothManager.disconnect();
  }

  scan() {

    if (this.state.scaning) {//当前正在扫描中
      BluetoothManager.stopScan();
      this.setState({scaning: false});
    }

    if (BluetoothManager.bluetoothState == 'on') {
      BluetoothManager.scan()
        .then(() => {
          this.setState({scaning: true});
        }).catch(err => {
      })

    } else {

      BluetoothManager.checkState();

      if (Platform.OS === 'ios') {
        this.alert('请开启手机蓝牙');
      } else {

        Alert.alert('提示', '请开启手机蓝牙', [
          {
            text: '取消',
            onPress: () => {
            }
          },
          {
            text: '打开',
            onPress: () => {
              BluetoothManager.enableBluetooth()
            }
          }

        ]);

      }

    }

  }

  alert(text) {
    Alert.alert('提示', text, [{
      text: '确定', onPress: () => {
      }
    }]);
  }

  /*write=(index)=>{

  if(this.state.text.length == 0){

              this.alert('请输入消息');

  return;

  }

  BluetoothManager.write(this.state.text,index)

  .then(()=>{

  this.bluetoothReceiveData = [];

  this.setState({

  writeData:this.state.text,

  text:'',

  })

  })

  .catch(err=>{

                  this.alert('发送失败');

  })

  }*/

  write = (index) => {
    BluetoothManager.write(this.print(), index)
      .then(() => {
        this.bluetoothReceiveData = [];
        this.setState({
          writeData: this.state.text,
          text: '',
        })
      })
      .catch(err => {
        this.alert('发送失败');
      })

  }

  print() {
    ESC.resetByte();
// 一定要配置好

    const Config = {
      wordNumber: 48
    };

    ESC.setConfig(Config);

    ESC.init();

    ESC.alignCenter();

    ESC.fontBold();

    ESC.printAndNewLine();

    ESC.text('正定新区许翠蔬菜店');

    ESC.printAndNewLine();

    ESC.text('采购订货单');

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.init();

    ESC.text('下单时间：2016-09-06 19:30:23');

    ESC.printAndNewLine();

    ESC.text('单据编号：T2345-CGD-2017-01-14-00005');

    ESC.printAndNewLine();

    ESC.text('采购单位：小农女供应链优先公司');

    ESC.printAndNewLine();

    ESC.text('采购经办：采购员A');

    ESC.printAndNewLine();

    ESC.text('电    话：15201083760');

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.text('商品明细：共2种商品');

    ESC.printAndNewLine();

// 商品开始

    ESC.text(
      ESC.Util.leftRight('大利(42斤/件)', '', 20)
      + ESC.Util.leftRight('84元/件', '', 11)
      + ESC.Util.leftRight('x1件', '总价：84元', 17)
    );

    ESC.printAndNewLine();
    ESC.text(' （3斤,1斤/斤,要新鲜的）+（5袋,5斤/袋,不要睡分太多的）');
    ESC.printAndNewLine();
    ESC.text(_.times(Config.wordNumber, () => '-').join(''));
    ESC.printAndNewLine();
// 商品结束

    // 商品开始
    ESC.text(
      ESC.Util.leftRight('大利(42斤/件)', '', 20)
      + ESC.Util.leftRight('84元/件', '', 11)
      + ESC.Util.leftRight('x1件', '总价：84元', 17)
    );

    ESC.printAndNewLine();

    ESC.text(' （3斤,1斤/斤,要新鲜的）+（5袋,5斤/袋,不要睡分太多的）');

    ESC.printAndNewLine();

    ESC.text(_.times(Config.wordNumber, () => '-').join(''));

    ESC.printAndNewLine();

// 商品结束

    ESC.text(_.times(Config.wordNumber, () => '-').join(''));

    ESC.printAndNewLine();

    ESC.alignRight();

    ESC.text('合计：168元');

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.init();

    ESC.text(ESC.Util.leftRight('采购经办：', '', 24) + '供应商：');

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.printAndNewLine();

    ESC.sound();
    ESC.init();
    return ESC.getByte();

  }

  writeWithoutResponse = (index) => {

    if (this.state.text.length == 0) {
      this.alert('请输入消息');
      return;
    }

    BluetoothManager.writeWithoutResponse(this.state.text, index)

      .then(() => {

        this.bluetoothReceiveData = [];

        this.setState({

          writeData: this.state.text,

          text: '',

        })

      })

      .catch(err => {

        this.alert('发送失败');

      })

  }

  read = (index) => {

    BluetoothManager.read(index)

      .then(data => {

        this.setState({readData: data});

      })

      .catch(err => {

        this.alert('读取失败');

      })

  }

  notify = (index) => {

    BluetoothManager.startNotification(index)

      .then(() => {

        this.setState({isMonitoring: true});

        this.alert('开启成功');

      })

      .catch(err => {

        this.setState({isMonitoring: false});

        this.alert('开启失败');

      })

  }

  renderItem = (item) => {

    let data = item.item;

    return (<TouchableOpacity activeOpacity={0.7} disabled={this.state.isConnected ? true : false} onPress={() => {
      this.connect(item)
    }} style={styles.item}>
      {data.name ? data.name : ''}
      {data.isConnecting ? '连接中...' : ''}
      {data.id}
    </TouchableOpacity>);
  }

  renderHeader = () => {
    return (<TouchableOpacity
      activeOpacity={0.7} style={[styles.buttonView, {marginHorizontal: 10, height: 40, alignItems: 'center'}]}
      onPress={this.state.isConnected ? this.disconnect.bind(this) : this.scan.bind(this)}>
      {this.state.scaning ? '正在搜索中' : this.state.isConnected ? '断开蓝牙' : '搜索蓝牙'}
      {this.state.isConnected ? '当前连接的设备' : '可用设备'}
    </TouchableOpacity>)
  }

  renderFooter = () => {

    return (this.state.isConnected ? <View>
        {this.renderWriteView('写数据(write)：', '发送', BluetoothManager.writeWithResponseCharacteristicUUID, this.write, this.state.writeData)}
        {this.renderWriteView('写数据(writeWithoutResponse)：', '发送', BluetoothManager.writeWithoutResponseCharacteristicUUID, this.writeWithoutResponse, this.state.writeData)}
        {this.renderReceiveView('读取的数据：', '读取', BluetoothManager.readCharacteristicUUID, this.read, this.state.readData)}
        {this.renderReceiveView('通知监听接收的数据：' + `${this.state.isMonitoring ? '监听已开启' : '监听未开启'}`, '开启通知', BluetoothManager.nofityCharacteristicUUID, this.notify, this.state.receiveData)}
      </View>
      : null)
  }

  renderReceiveView = (label, buttonText, characteristics, onPress, state) => {

    if (characteristics.length == 0) {
      return;
    }

    return (<View>
      {label}
      {state}
      {characteristics.map((item, index) => {
        return (<TouchableOpacity>
          activeOpacity={0.7} style={styles.buttonView} onPress={() => {
          onPress(index)
        }} key={index}>
          {buttonText} ({item})

        </TouchableOpacity>)
      })}
    </View>)
  }

  renderWriteView = (label, buttonText, characteristics, onPress, state) => {
    if (characteristics.length == 0) {
      return;
    }

    return (<View>
      {label}
      {this.state.writeData}
      {characteristics.map((item, index) => {
        return (<View>
          key={index} activeOpacity={0.7} style={styles.buttonView} onPress={() => {
          onPress(index)
        }}>
          {buttonText} ({item})

        </View>)
      })}
      <Input style={[styles.textInput]} value={this.state.text} placeholder='请输入消息'
             onChangeText={(text) => {
               this.setState({text: text});
             }}/>
    </View>)
  }

  render() {
    return (<View>
      renderItem={this.renderItem} ListHeaderComponent={this.renderHeader} ListFooterComponent={this.renderFooter} keyExtractor={item => item.id} data={this.state.data}
      extraData={[this.state.isConnected, this.state.text, this.state.receiveData, this.state.readData, this.state.writeData, this.state.isMonitoring, this.state.scaning]} keyboardShouldPersistTaps='handled'/>

    </View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },

  item: {

    flexDirection: 'column',

    borderColor: 'rgb(235,235,235)',

    borderStyle: 'solid',

    borderBottomWidth: StyleSheet.hairlineWidth,

    paddingLeft: 10,

    paddingVertical: 8,

  },

  buttonView: {

    height: 30,

    backgroundColor: 'rgb(33, 150, 243)',

    paddingHorizontal: 10,

    borderRadius: 5,

    justifyContent: "center",
    alignItems: 'flex-start',
    marginTop: 10

  },

  buttonText: {

    color: "white",

    fontSize: 12,

  },

  content: {

    marginTop: 5,

    marginBottom: 15,

  },

  textInput: {

    paddingLeft: 5,

    paddingRight: 5,

    backgroundColor: 'white',

    height: 50,

    fontSize: 16,

    flex: 1,

  },
})