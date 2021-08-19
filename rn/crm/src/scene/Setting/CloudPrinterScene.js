import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  InteractionManager
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import Config, {hostPort} from "../../config";
import {List, Radio} from "@ant-design/react-native";
import Button from "react-native-vector-icons/Entypo";
import {Cell, CellBody, CellFooter, Cells, Input} from "../../weui";
import BleManager from "react-native-ble-manager";
import JbbText from "../component/JbbText";
import GlobalUtil from "../../util/GlobalUtil";

const RadioItem = Radio.RadioItem;
const Item = List.Item;

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
      type_list: [
        {name: 'test1', value: '1'},
        {name: 'test2', value: '2'},
        {name: 'test3', value: '3'},
      ],
      type_name: "打印机型号",
      printer_name: "打印机类型",
      img: '',
      cloud_printer_list: [
        {name: '飞蛾打印机', printer: '1', img: '../../img/feie.jpeg', type: false},
        {name: '中午打印机', printer: '2', img: '', type: false},
        {
          name: '易联云打印机', printer: '3', img: '../../img/feie.jpeg', type: true,
          type_list: [
            {name: 'test1', value: '1'},
            {name: 'test2', value: '2'},
            {name: 'test3', value: '3'},
          ]
        },
      ],
      fromData: {
        printer: '',
        sn: '',
        key: '',
        type: '',
      }

    }

    this.navigationOptions(this.props)
  }


  submit = () => {
    console.log("isScanning:", this.state)

  }

  onHeaderRefresh() {
    this.setState({isRefreshing: true});
    this.setState({isRefreshing: false});
  }

  _orderChangeLog() {
    this.setState({changeHide: !this.state.changeHide})
  }

  set_show_type_option() {
    this.setState({show_type_option: !this.state.show_type_option})

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
                           value={this.state.fromData.sn}
                           style={[styles.cell_input]}
                           placeholder="请输入打印机SN"
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
                           value={this.state.fromData.key}
                           style={[styles.cell_input]}
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
                <Image source={require('../../img/feie.jpeg')} style={styles.image}/>
              </View>
            </If>

          </View>
          <Button type='warn' onPress={this.submit} style={styles.btn_submit}>绑定</Button>

        </View>


      </ScrollView>
    )
      ;
  }

  onRrinterSelected = (cloud_printer) => {
    let fromData = this.state.fromData;
    let show_type = false;
    let type_list = [];
    fromData.printer = cloud_printer.printer;
    if (cloud_printer.type) {
      show_type = true;
      type_list = cloud_printer.type_list;
    }
    this.setState({
      show_type: show_type,
      changeHide: true,
      type_list: type_list,
      printer_name: cloud_printer.name,
      img: cloud_printer.img,
      fromData: fromData,
    });
  }
  renderRrinter = () => {
    let items = []
    let that = this;
    for (let i in this.state.cloud_printer_list) {
      const cloud_printer = that.state.cloud_printer_list[i]
      items.push(<RadioItem key={i} style={{fontSize: 12, fontWeight: 'bold'}}
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
    let that = this;
    let fromData = that.state.fromData;
    fromData.type = type.value;
    this.setState({
      show_type_option: false,
      type_name: type.name,
      fromData: fromData,
    });
  }

  renderTypelist = () => {
    let items = []
    let that = this;
    for (let i in that.state.type_list) {
      const type = that.state.type_list[i]
      items.push(<RadioItem key={i} style={{fontSize: 12, fontWeight: 'bold'}}
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
    marginHorizontal: pxToDp(30),
    marginTop: pxToDp(65),
    backgroundColor: '#808080',
    fontSize: 20,
    textAlign: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20
  },
  pullImg: {
    width: pxToDp(90),
    height: pxToDp(72)
  },
});


//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(CloudPrinterScene)
