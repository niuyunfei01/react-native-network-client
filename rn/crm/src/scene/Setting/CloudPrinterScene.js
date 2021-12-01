import React, {PureComponent} from 'react'
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {setPrinterName} from '../../reducers/global/globalActions';
import {Button, List, Radio} from "@ant-design/react-native";
// import Button from "react-native-vector-icons/Entypo";
import {Cell, CellBody, CellFooter, Cells, Input} from "../../weui";
import JbbText from "../component/JbbText";
import HttpUtils from "../../util/http";
import {hideModal, showError, showModal, showSuccess, ToastLong} from "../../util/ToastUtils";
import {Styles} from "../../themes";
import {tool} from '../../common'

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
      check_key: true,
      count_down: -1
    }

    this.navigationOptions(this.props)
  }


  onHeaderRefresh() {
    this.get_store_print()
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
    this.get_store_print();
  }

  componentWillUnmount() {
    this.interval && clearInterval(this.interval)
  }


  get_store_print() {
    showModal('加载中...')
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/get_store_printers_info/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(print_info => {
      let printer_name = this.state.printer_name;
      let printer = this.state.printer;
      let submit_add = this.state.submit_add;
      let check_key = this.state.check_key;
      let key = this.state.key;
      let sn = this.state.sn;
      if (print_info.printer_cfg.length !== 0) {
        printer_name = print_info.printer_cfg.name;
        printer = print_info.printer_cfg.printer;
        key = print_info.printer_cfg.key;
        sn = print_info.printer_cfg.sn;
        check_key = print_info.printer_cfg.check_key;
        submit_add = false;
      }
      this.setState({
        cloud_printer_list: print_info.printer_list,
        printer_name: printer_name,
        printer: printer,
        key: key,
        sn: sn,
        submit_add: submit_add,
        check_key: check_key,
      }, hideModal())
    })
  }

  printTest() {
    tool.debounces(() => {
      const {currStoreId, accessToken} = this.props.global;
      const api = `api/print_test/${currStoreId}?access_token=${accessToken}`
      if (this.state.count_down <= 0) {
        HttpUtils.get.bind(this.props)(api).then(() => {
          Alert.alert('提示', `打印成功，请查看小票`, [{
            text: '确定',
            onPress: () => {
              this.setCountdown(30)
              this.startCountDown()
            }
          }])
          ToastLong('测试打印成功')
        }, (ok, reason, obj) => {
          Alert.alert('提示', `测试打印失败:${reason}`, [{
            text: '确定'
          }])
          // showError(`测试打印失败:${reason}`)
        })
      }
    }, 1000)
  }

  startCountDown() {
      this.interval = setInterval(() => {
        this.setState({
          count_down: this.getCountdown() - 1
        })
        let countdown = Math.round(this.state.count_down)
        if(countdown == 0) {
          clearInterval(this.interval)
          this.setState({
            count_down: countdown
          })
        }
      }, 3200)
  }

  getCountdown() {
    return this.state.count_down;
  }

  setCountdown(count_down) {
    this.setState({
      count_down: count_down
    });
  }

  submit = () => {
    tool.debounces(() => {
      const {dispatch} = this.props
      let that = this;
      if (!that.state.sn || !that.state.printer) {
        ToastLong("参数缺失");
        return;
      }
      const {currStoreId, accessToken} = this.props.global;
      let fromData = {
        storeId: currStoreId,
        sn: that.state.sn,
        key: that.state.key,
        type: that.state.printer_type,
        printer: that.state.printer,
      }
      let printer_list = that.state.cloud_printer_list;
      for (let i = 0; i < printer_list.length; i++) {
        if ((that.state.printer === printer_list[i].printer && printer_list[i].type === true && !that.state.printer_type) || (that.state.printer === printer_list[i].printer && printer_list[i].check_key === true && !that.state.key)) {
          ToastLong("参数缺失");
          return;
        }
      }
      const api = `api/bind_store_printers/${currStoreId}?access_token=${accessToken}`
      HttpUtils.post.bind(this.props)(api, fromData).then(res => {
        dispatch(setPrinterName(res));
        that.setState({
          submit_add: false,
        });
        Alert.alert('绑定成功', `打印机绑定成功，是否测试打印？`, [{
          text: '取消'
        }, {
          text: '打印',
          onPress: () => that.printTest()
        }])
      }, () => {
        showError('绑定失败')
      })
    }, 1000)

  }

  clearPrinter() {
    tool.debounces(() => {
      const {dispatch} = this.props
      let that = this;
      if (!that.state.sn || !that.state.printer) {
        showError("参数缺失");
        return;
      }
      showModal('解绑中...')
      const {currStoreId, accessToken} = this.props.global;
      const api = `api/clear_printers_and_read_store/${currStoreId}?access_token=${accessToken}`
      HttpUtils.get.bind(this.props)(api).then(() => {
        dispatch(setPrinterName([]));
        that.setState({
          type_name: "打印机型号",
          printer_name: "打印机类型",
          img: '',
          sn: '',
          key: '',
          printer: '',
          printer_type: '',
          submit_add: true,
          check_key: true,
        });
        showSuccess("解绑成功");
      }, () => {
        hideModal();
      })
    }, 1000)
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
      <View style={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor='gray'
            />
          }
          style={{backgroundColor: colors.main_back, flexGrow: 1}}
        >
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
                         placeholder="请输入打印机编码"
                         underlineColorAndroid='transparent' //取消安卓下划线
                  />
                </CellFooter>
              </Cell>

              <If condition={this.state.check_key}>
                <Cell customStyle={[styles.cell_row]}>
                  <CellBody>
                    <Text style={[styles.cell_body_text]}>密钥(KEY)</Text>
                  </CellBody>
                  <CellFooter>
                    <Input onChangeText={(key) => this.setState({key})}
                           value={this.state.key}
                           style={[styles.cell_input]}
                           editable={this.state.submit_add}
                           placeholder="请输入打印机密钥"
                           underlineColorAndroid='transparent' //取消安卓下划线
                    />

                  </CellFooter>
                </Cell>
              </If>

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

          <If condition={this.state.img !== '' && !this.state.changeHide && !this.state.show_type_option}>
            <View style={{padding: '10%'}}>
              <Image source={{uri: this.state.img}} style={styles.image}/>
            </View>
          </If>

        </ScrollView>
        {!this.state.submit_add ?
          <View style={{
            flexDirection: 'row',
            marginLeft: '7%',
            marginBottom: pxToDp(70),
          }}>
            <Button
              type={'primary'}
              onPress={() => {
                Alert.alert('提醒', "确定解绑打印机吗，解绑后将不再打印小票", [{text: '取消'}, {
                  text: '解绑',
                  onPress: () => {
                    this.clearPrinter()
                  }
                }])
              }}
              style={{
                backgroundColor: '#bbb',
                color: colors.white,
                width: '40%',
                lineHeight: pxToDp(60),
                textAlign: 'center',
                borderRadius: pxToDp(20),
                borderWidth: pxToDp(0)
              }}>解绑</Button>
            {
              this.state.count_down > 0 ? <Button
                  type={'primary'}
                  style={{
                    backgroundColor: '#bbb',
                    width: '45%',
                    lineHeight: pxToDp(60),
                    textAlign: 'center',
                    marginLeft: "10%",
                    borderRadius: pxToDp(20),
                    borderWidth: pxToDp(0)
                  }}><Text style={{color: '#fff', fontSize: pxToDp(22)}}>{`(${this.state.count_down})秒后可再次测试打印  `}</Text></Button> :
                  <Button
                  type={'primary'}
                  onPress={() => {
                    this.printTest()
                  }}
                  style={{
                    backgroundColor: colors.main_color,
                    color: colors.white,
                    width: '40%',
                    lineHeight: pxToDp(60),
                    textAlign: 'center',
                    marginLeft: "15%",
                    borderRadius: pxToDp(20),
                    borderWidth: pxToDp(0)
                  }}>测试打印</Button>
            }
          </View> :
          <Button
            type={'primary'}
            style={{
              backgroundColor: '#4a98e7',
              marginHorizontal: pxToDp(30),
              borderRadius: pxToDp(20),
              textAlign: 'center',
              color: colors.yellow,
              marginBottom: pxToDp(70),
            }} onPress={this.submit}>绑定</Button>}
      </View>
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
      sn: '',
      key: '',
      printer_type: '',
      show_type: show_type,
      changeHide: false,
      type_list: type_list,
      printer_name: cloud_printer.name,
      printer: cloud_printer.printer,
      check_key: cloud_printer.check_key,
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
    height: pxToDp(420),
  },
  btn_submit: {},
  pullImg: {
    width: pxToDp(90),
    height: pxToDp(72)
  },
});


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(CloudPrinterScene)
