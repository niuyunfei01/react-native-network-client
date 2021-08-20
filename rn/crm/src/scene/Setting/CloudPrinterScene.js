import React, {PureComponent} from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl, TouchableHighlight, Alert
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {List, Radio, Toast} from "@ant-design/react-native";
// import Button from "react-native-vector-icons/Entypo";
import {Cell, CellBody, CellFooter, Cells, Input} from "../../weui";
import JbbText from "../component/JbbText";
import HttpUtils from "../../util/http";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import {Styles} from "../../themes";
import {setPrinterName} from "../../reducers/global/globalActions";

const RadioItem = Radio.RadioItem;

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

class ImageBtn extends PureComponent {
  constructor(props) {
    super(props)
  }

  render() {

    const {source, onPress, imageStyle, ...others} = this.props;

    return <TouchableOpacity onPress={onPress} others>
      <Image source={source} style={[styles.btn4text, {alignSelf: 'center', marginLeft: pxToDp(20)}, imageStyle]}/>
    </TouchableOpacity>
  }
}

// create a component
class CloudPrinterScene extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '云打印机',
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      changeHide: false,
      show_type: false,
      show_type_option: false,
      type_list: [],
      type_name: "打印机型号",
      printer_name: "打印机类型",
      img: '',
      sn: '',
      key: '',
      printer: '',
      printer_type: '',
      cloud_printer_list: [],
      submit_add: true,

    }

    this.navigationOptions(this.props)
  }


  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.get_store_print(() => {
      this.setState({isRefreshing: false})
    })
  }

  _orderChangeLog() {
    if (this.state.submit_add) {
      this.setState({changeHide: !this.state.changeHide})
    }
  }

  set_show_type_option() {
    if (this.state.submit_add) {
      this.setState({show_type_option: !this.state.show_type_option})
    }
  }


  componentDidMount() {
    this.setState({isRefreshing: true});
    this.get_store_print(() => {
      this.setState({isRefreshing: false});
    });
  }

  get_store_print(callback = () => {
  }) {
    const {dispatch} = this.props
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/get_store_printers_info/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(print_info => {
      console.log(print_info);
      let printer_name = this.state.printer_name;
      let printer = this.state.printer;
      let submit_add = this.state.submit_add;
      let key = this.state.key;
      let sn = this.state.sn;
      if (print_info.printer_cfg.length !== 0) {
        printer_name = print_info.printer_cfg.name;
        printer = print_info.printer_cfg.printer;
        key = print_info.printer_cfg.key;
        sn = print_info.printer_cfg.sn;
        submit_add = false;
      }

      this.setState({
        cloud_printer_list: print_info.printer_list,
        printer_name: printer_name,
        printer: printer,
        key: key,
        sn: sn,
        submit_add: submit_add,
      }, callback)
    })
  }

  printTest() {
    this.setState({isRefreshing: true});
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/print_test/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({isRefreshing: false});
      Toast.success('测试打印成功')
    }, (res) => {
      this.setState({isRefreshing: false});
      ToastLong('测试打印失败');
    })
  }


  submit = () => {

    const {dispatch} = this.props
    this.setState({isRefreshing: true});
    let that = this;
    if (!that.state.sn || !that.state.key || !that.state.printer) {
      ToastLong("参数缺失");
      this.setState({isRefreshing: false});
      return;
    }
    const {currStoreId, accessToken} = this.props.global;
    if (that.state.submit_add) {
      let fromData = {
        storeId: currStoreId,
        sn: that.state.sn,
        key: that.state.key,
        type: that.state.type,
        printer: that.state.printer,
      }

      let printer_list = that.state.cloud_printer_list;
      for (let i = 0; i < printer_list.length; i++) {
        if (that.state.printer === printer_list[i].printer && printer_list[i].type === true && !that.state.type) {
          ToastLong("参数缺失");
          this.setState({isRefreshing: false});
          return;
        }
      }

      const api = `api/bind_store_printers/${currStoreId}?access_token=${accessToken}`
      console.log(api, fromData);
      HttpUtils.post.bind(this.props)(api, fromData).then(res => {
        console.log(res);
        dispatch(setPrinterName(res));
        this.setState({isRefreshing: false});
        Toast.success('操作成功')
        that.setState({
          isRefreshing: false,
          submit_add: false,
        });
        Alert.alert('绑定成功', `打印机绑定成功，是否测试打印？`, [{
          text: '取消'
        }, {
          text: '打印',
          onPress: () => that.printTest()
        }])
      })

    } else {
      const api = `api/clear_printers_and_read_store/${currStoreId}?access_token=${accessToken}`
      console.log(api);
      HttpUtils.get.bind(this.props)(api).then(res => {
        console.log(res);
        ToastShort("解绑成功");
        // Toast.success('操作成功')

        dispatch(setPrinterName([]));
        this.setState({isRefreshing: false});
        console.log(this.props.global);
        // setTimeout(() => {
        that.setState({
          type_name: "打印机型号",
          printer_name: "打印机类型",
          img: '',
          sn: '',
          key: '',
          printer: '',
          printer_type: '',
          submit_add: true,
        }, () => {
        });
        // }, 900);
      })

    }

  }
  renderItem = (item) => {
    return (
      <TouchableHighlight>
        <View style={[Styles.between, {marginStart: 10, borderBottomColor: colors.back_color, borderBottomWidth: 1}]}>
          <View style={[Styles.columnStart]}>
            <Text style={{fontSize: 16, padding: 2}}>{item.name || '未名设备'}</Text>
          </View>
          <View style={[Styles.between, {paddingEnd: 10, paddingVertical: 5}]}>
            {item.connected && <View style={[Styles.between]}>
              <View style={{marginEnd: 10}}><Button color={colors.color999}
                                                    style={{color: colors.white, paddingVertical: 2}} title={'测试打印'}
                                                    onPress={() => this.testPrint(item)}/></View>
              <Button color={colors.main_color} style={{color: colors.white, paddingVertical: 2}} title={'断开'}
                      onPress={() => this.handleDisconnectedPeripheral(item.id)}/>
            </View>}
            {!item.connected &&
            <Button color={colors.main_color} style={{color: colors.white, paddingVertical: 2}} title={'连接'}
                    onPress={() => this.connectPrinter(item)}/>}
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={() => this.onHeaderRefresh()}
            tintColor='gray'
          />
        }
        style={{backgroundColor: colors.main_back, flex: 1}}
      >
        <View>

          <View style={{flex: 1, height: 500}}>

            <View style={{marginTop: 4}}>
              <Cells style={[styles.cell_box]}>
                <Cell customStyle={[styles.cell_row]}>
                  <CellBody>
                    <Text style={[styles.cell_body_text]}>{this.state.printer_name}</Text>
                  </CellBody>
                  <CellFooter>
                    <ImageBtn source={
                      this.state.changeHide ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')
                    }
                              imageStyle={styles.pullImg} onPress={() => {
                      this._orderChangeLog()
                    }}
                    />
                  </CellFooter>
                </Cell>

                <If condition={this.state.changeHide}>
                  {this.renderRrinter()}
                </If>
              </Cells>
            </View>

            <View style={{marginTop: 4}}>
              <Cells style={[styles.cell_box]}>
                <Cell customStyle={[styles.cell_row]}>
                  <CellBody>
                    <Text style={[styles.cell_body_text]}>编码(SN)</Text>
                  </CellBody>
                  <CellFooter>

                    <Input onChangeText={(sn) => this.setState({sn})}
                           value={this.state.sn}
                           style={[styles.cell_input]}
                           editable={this.state.submit_add}
                           placeholder="请输入打印机SN  "
                           underlineColorAndroid='transparent' //取消安卓下划线
                    />
                  </CellFooter>
                </Cell>

                <Cell customStyle={[styles.cell_row]}>
                  <CellBody>
                    <Text style={[styles.cell_body_text]}>密匙(KEY)</Text>
                  </CellBody>
                  <CellFooter>
                    <Input onChangeText={(key) => this.setState({key})}
                           value={this.state.key}
                           style={[styles.cell_input]}
                           editable={this.state.submit_add}
                           placeholder="请输入打印机KEY"
                           underlineColorAndroid='transparent' //取消安卓下划线
                    />

                  </CellFooter>
                </Cell>

                <If condition={this.state.show_type}>
                  <Cell customStyle={[styles.cell_row]}>
                    <CellBody>
                      <Text style={[styles.cell_body_text]}>{this.state.type_name}</Text>
                    </CellBody>
                    <CellFooter>
                      <ImageBtn source={
                        this.state.show_type_option ? require('../../img/Order/pull_up.png') : require('../../img/Order/pull_down.png')
                      }
                                imageStyle={styles.pullImg} onPress={() => {
                        this.set_show_type_option()
                      }}
                      />
                    </CellFooter>
                  </Cell>

                  <If condition={this.state.show_type_option}>
                    {this.renderTypelist()}
                  </If>
                </If>
              </Cells>
            </View>


            <If condition={this.state.img !== ''}>
              <View style={{padding: '10%'}}>
                {/*<Image source={require('../../img/feie.jpeg')} style={styles.image}/>*/}
                <Image source={{uri: this.state.img}} style={styles.image}/>
              </View>


            </If>

          </View>
          <View style={styles.btn_submit}>
            <Button onPress={this.submit} color={'#808080'} title={this.state.submit_add ? '绑定' : '解绑'}
                    style={{
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#fff',
                      paddingTop: 20,
                      paddingBottom: 20,
                    }}/>
          </View>
        </View>


      </ScrollView>
    )
      ;
  }

  onRrinterSelected = (cloud_printer) => {
    let show_type = false;
    let type_list = [];
    if (cloud_printer.type) {
      show_type = true;
      type_list = cloud_printer.type_list;
    }
    this.setState({
      show_type: show_type,
      changeHide: false,
      type_list: type_list,
      printer_name: cloud_printer.name,
      printer: cloud_printer.printer,
      img: cloud_printer.img,
    });
  }
  renderRrinter = () => {
    let items = []
    let that = this;
    let printer = that.state.printer;

    for (let i in this.state.cloud_printer_list) {
      const cloud_printer = that.state.cloud_printer_list[i]
      items.push(<RadioItem key={i} style={{fontSize: 12, fontWeight: 'bold'}}
                            checked={printer === cloud_printer.printer}
                            onChange={event => {
                              if (event.target.checked) {
                                this.onRrinterSelected(cloud_printer)
                              }
                            }}><JbbText>{cloud_printer.name}</JbbText></RadioItem>)
    }
    return <List style={{marginTop: 12}}>
      {items}
    </List>
  }

  onTypeSelected = (type) => {
    this.setState({
      show_type_option: false,
      type_name: type.name,
      printer_type: type.value,
    });
  }

  renderTypelist = () => {
    let items = []
    let that = this;
    let printer_type = that.state.printer_type;
    for (let i in that.state.type_list) {
      const type = that.state.type_list[i]
      items.push(<RadioItem key={i} style={{fontSize: 12, fontWeight: 'bold'}}
                            checked={printer_type === type.value}
                            onChange={event => {
                              if (event.target.checked) {
                                that.onTypeSelected(type)
                              }
                            }}><JbbText>{type.name}</JbbText></RadioItem>)
    }
    return <List style={{marginTop: 12}}>
      {items}
    </List>
  }

}


// define your styles
const styles = StyleSheet.create({

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
  cell_input: {
    //需要覆盖完整这4个元素
    fontSize: 15,
    height: 45,
    marginTop: 2,
    marginBottom: 2,
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },

  image: {
    width: '100%',
    height: '60%',
  },
  btn_submit: {
    backgroundColor: '#808080',
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(65),
    fontSize: pxToDp(30),
    borderColor: '#fff',
    borderRadius: pxToDp(10),
    textAlign: 'center',
  },
  pullImg: {
    width: pxToDp(90),
    height: pxToDp(72)
  },
});


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(CloudPrinterScene)
