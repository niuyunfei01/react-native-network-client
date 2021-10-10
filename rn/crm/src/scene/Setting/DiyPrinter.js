import React, {PureComponent} from 'react'
import {
  Alert,
  InteractionManager,
  RefreshControl,
  ScrollView,
  Slider,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Switch} from "../../weui/index";
import Config from "../../config";
import Buttons from 'react-native-vector-icons/Entypo';
import {Button, Toast} from '@ant-design/react-native';
import native from "../../common/native";
import {tool} from "../../common";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import HttpUtils from "../../util/http";
import {setPrinterName} from "../../reducers/global/globalActions";


class DiyPrinter extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '小票设置',
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
    }
    this.navigationOptions(this.props)
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }

  onHeaderRefresh() {

  }


  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }


  submit = () => {
    tool.debounces(() => {
      this.setState({isRefreshing: true});
      let that = this;
      if (!that.state.sn || !that.state.printer) {
        ToastLong("参数缺失");
        this.setState({isRefreshing: false});
        return;
      }
      const {currStoreId, accessToken} = this.props.global;
      let fromData = {
        storeId: currStoreId,
        printer: that.state.printer,
      }
      const api = `api/bind_store_printers/${currStoreId}?access_token=${accessToken}`
      HttpUtils.post.bind(this.props)(api, fromData).then(res => {
        Toast.success('操作成功')

      }, () => {
        this.setState({isRefreshing: false, errorMsg: `绑定失败`})
      })
    }, 1000)
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
          } style={{backgroundColor: colors.main_back}}>
          <Cells style={[styles.cell_box_top]}>

            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text
                  style={[styles.cell_body_text]}>用户联</Text>
              </CellBody>
              <CellFooter>
                <TouchableOpacity style={[styles.right_box]}
                                  onPress={() => {
                                    this.onPress(Config.ROUTE_RECEIPT);
                                  }}>
                  <Text style={[styles.right_text]}>预览</Text>
                  <Buttons name='chevron-thin-right' style={[styles.right_btn]}/>
                </TouchableOpacity>
              </CellFooter>
            </Cell>
          </Cells>


          <CellsTitle style={styles.cell_title}>字体设置</CellsTitle>
          <Cells style={[styles.cell_box]}>
            <Cell customStyle={[styles.cell_row]}>
              <Text style={{width: '33%'}}>小</Text>
              <Text style={{width: '33%', textAlign: 'center'}}>标准</Text>
              <Text style={{width: '33%', textAlign: 'right'}}>较大</Text>
            </Cell>

            <Cell customStyle={[styles.cell_row]}>
              <View style={{width: "100%"}}>
                <Slider
                  maximumValue={2}
                  value={1}
                  step={1}
                  onSlidingComplete={value => {
                    native.setSoundVolume(value, (resp, msg) => {
                      this.setState({
                        Volume: value
                      })
                    })
                  }}
                />
              </View>
            </Cell>
          </Cells>

          <Cells style={[styles.cell_box]}>
            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>备注变大</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.isRun}
                        onValueChange={() => {

                        }}/>
              </CellFooter>
            </Cell>

            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>商品价格</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.isRun}
                        onValueChange={() => {

                        }}/>
              </CellFooter>
            </Cell>
          </Cells>


          <CellsTitle style={styles.cell_title}>自定义内容</CellsTitle>
          <Cells style={[styles.cell_box]}>

            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text
                  style={[styles.cell_body_text]}>定制内容</Text>
              </CellBody>
              <CellFooter>
                <TouchableOpacity style={[styles.right_box]}
                                  onPress={() => {
                                    this.onPress(Config.ROUTE_REMARK);
                                  }}>
                  <Buttons name='chevron-thin-right' style={[styles.right_btn]}/>
                </TouchableOpacity>
              </CellFooter>
            </Cell>
          </Cells>

        </ScrollView>
        <View style={styles.btn_submit}>
          <Button onPress={this.submit} type="primary"
                  style={{backgroundColor: colors.fontGray, borderWidth: 0}}>保存</Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cell_title: {
    marginBottom: pxToDp(5),
    fontSize: pxToDp(26),
    color: colors.color999,
  },

  cell_box_top: {
    marginTop: pxToDp(15),
    borderTopWidth: pxToDp(1),
    borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },

  cell_box: {
    marginTop: 0,
    borderTopWidth: pxToDp(1),
    // borderBottomWidth: pxToDp(1),
    borderColor: colors.color999,
  },
  cell_row: {
    height: pxToDp(70),
    justifyContent: 'center',
    paddingRight: pxToDp(10),
    borderBottomWidth: 0,
  },
  cell_body_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color333,
  },
  cell_body_comment: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.color999,
  },
  body_status: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.main_color,
  },
  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(15),
    padding: pxToDp(3),
    color: colors.f7,
  },
  printer_status_error: {
    color: '#f44040',
  },
  right_box: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: pxToDp(60),
    paddingTop: pxToDp(10),
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },

  right_text: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.color999,
  },

  btn_submit: {
    backgroundColor: '#808080',
    marginHorizontal: pxToDp(30),
    borderRadius: pxToDp(20),
    textAlign: 'center',
    height: pxToDp(65),
    marginBottom: pxToDp(70),
  },
});


export default DiyPrinter
