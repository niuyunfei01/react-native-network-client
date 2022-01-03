import React, {PureComponent} from 'react'
import {
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
import {Button} from '@ant-design/react-native';
import {tool} from "../../common";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import * as globalActions from "../../reducers/global/globalActions";
import {ToastLong} from "../../util/ToastUtils";


function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}


class DiyPrinter extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: true,
      font_size: 1,
      remark_max: false,
      show_product_price: false,
      show_product_discounts: false,
      show_distribution_distance: false,
      show_goods_code: false,
    }
    this.get_printer_custom_cfg()
  }

  get_printer_custom_cfg() {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/get_printer_custom_cfg/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        font_size: res.font_size,
        remark_max: res.remark_max,
        show_product_price: res.show_product_price,
        show_product_discounts: res.show_product_discounts,
        show_distribution_distance: res.show_distribution_distance,
        show_goods_code: res.show_goods_code,
        isRefreshing: false
      })
    })
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
    this.setState({isRefreshing: true});
    tool.debounces(() => {
      const {currStoreId, accessToken} = this.props.global;
      const {
        font_size,
        remark_max,
        show_product_price,
        show_product_discounts,
        show_distribution_distance,
        show_goods_code
      } = this.state;
      let fromData = {
        font_size: font_size,
        remark_max: remark_max,
        show_product_price: show_product_price,
        show_product_discounts: show_product_discounts,
        show_distribution_distance: show_distribution_distance,
        show_goods_code: show_goods_code,
        store_id: currStoreId,
      }
      console.log(fromData)
      const api = `api/set_printer_custom_cfg?access_token=${accessToken}`
      HttpUtils.post.bind(this.props)(api, fromData).then(res => {
        ToastLong('操作成功')
        this.setState({
          isRefreshing: false
        })
      }, () => {
        this.setState({isRefreshing: false, errorMsg: `操作失败`})
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
                  value={this.state.font_size}
                  step={1}
                  onSlidingComplete={value => {
                    this.setState({
                      font_size: value
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
                <Switch value={this.state.remark_max}
                        onValueChange={(val) => {
                          this.setState({
                            remark_max: val
                          })
                        }}/>
              </CellFooter>
            </Cell>

            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>商品价格</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.show_product_price}
                        onValueChange={(val) => {
                          this.setState({
                            show_product_price: val
                          })
                        }}/>
              </CellFooter>
            </Cell>


            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>商品优惠信息</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.show_product_discounts}
                        onValueChange={(val) => {
                          this.setState({
                            show_product_discounts: val
                          })
                        }}/>
              </CellFooter>
            </Cell>


            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>配送距离</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.show_distribution_distance}
                        onValueChange={(val) => {
                          this.setState({
                            show_distribution_distance: val
                          })
                        }}/>
              </CellFooter>
            </Cell>

            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>显示货号（暂仅显示美团货号）</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.show_goods_code}
                        onValueChange={(val) => {
                          this.setState({
                            show_goods_code: val
                          })
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
          <Button onPress={() => this.submit()} type="primary"
                  style={{backgroundColor: colors.main_color, borderWidth: 0}}>保存</Button>
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
    width: pxToDp(100)
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
    backgroundColor: colors.main_color,
    marginHorizontal: pxToDp(30),
    borderRadius: pxToDp(20),
    textAlign: 'center',
    height: pxToDp(65),
    marginBottom: pxToDp(70),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(DiyPrinter)
