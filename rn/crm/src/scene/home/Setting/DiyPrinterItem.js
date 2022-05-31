import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {InteractionManager, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import * as globalActions from "../../../reducers/global/globalActions";
import {Button, Switch} from "react-native-elements";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import tool from "../../../pubilc/util/tool";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import HttpUtils from "../../../pubilc/util/http";


function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}


function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}


class DiyPrinterItem extends PureComponent {

  constructor(props) {
    super(props);
    let type = 'font';
    let title = '部分字号设置'
    if (this.props.route.params.type !== undefined && this.props.route.params.type === 'privacy') {
      type = 'privacy';
      title = '敏感信息设置'
    }
    const {navigation} = props;
    navigation.setOptions({headerTitle: title,})
    this.state = {
      isRefreshing: true,
      remark_max: false,
      product_info_max: false,
      show_product_info: false,
      show_store_name: false,
      type: type
    }
    this.get_printer_custom_cfg()
  }

  get_printer_custom_cfg() {
    const {currStoreId, accessToken} = this.props.global;
    const api = `api/get_printer_custom_cfg/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        remark_max: res.remark_max,
        product_info_max: res.product_info_max,
        show_product_info: res.show_product_info,
        show_store_name: res.show_store_name,
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
        remark_max,
        product_info_max,
        show_product_info,
        show_store_name,
      } = this.state;
      let fromData = {
        remark_max: remark_max,
        product_info_max: product_info_max,
        show_product_info: show_product_info,
        show_store_name: show_store_name,
        store_id: currStoreId,
      }
      const api = `api/set_printer_custom_cfg?access_token=${accessToken}`
      HttpUtils.post.bind(this.props)(api, fromData).then(res => {
        ToastLong('操作成功')
        this.setState({
          isRefreshing: false
        })
      }, () => {
        ToastLong("操作失败：" + err.desc)
        this.setState({isRefreshing: false})
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
          } style={{flex: 1, backgroundColor: colors.main_back, marginHorizontal: 10}}>

          <If condition={this.state.type === 'font'}>
            <View>
              <TouchableOpacity onPress={() => {
                this.setState({
                  remark_max: !this.state.remark_max
                })
              }} style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                marginVertical: 10,
                padding: 10,
                paddingBottom: 4,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  height: 30,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: colors.color333,
                    flex: 1
                  }}>备注放大 </Text>
                  <Switch style={{
                    fontSize: 16,
                  }} onValueChange={() => {
                    this.setState({
                      remark_max: !this.state.remark_max
                    })
                  }}
                          disabled={true}
                          value={this.state.remark_max}
                  />
                </View>

              </TouchableOpacity>


              <TouchableOpacity onPress={() => {
                this.setState({
                  product_info_max: !this.state.product_info_max
                })
              }} style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                marginBottom: 10,
                padding: 10,
                paddingBottom: 4,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  height: 30,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: colors.color333,
                    flex: 1
                  }}>商品信息放大 </Text>
                  <Switch style={{
                    fontSize: 16,
                  }} onValueChange={() => {
                    this.setState({
                      product_info_max: !this.state.product_info_max
                    })
                  }}
                          disabled={true}
                          value={this.state.product_info_max}
                  />
                </View>

              </TouchableOpacity>
            </View>
          </If>


          <If condition={this.state.type === 'privacy'}>
            <View>

              <TouchableOpacity onPress={() => {
                this.setState({
                  show_store_name: !this.state.show_store_name
                })
              }} style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                marginVertical: 10,
                padding: 10,
                paddingBottom: 4,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  height: 30,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: colors.color333,
                    flex: 1
                  }}>店铺名称 </Text>
                  <Switch style={{
                    fontSize: 16,
                  }} onValueChange={() => {
                    this.setState({
                      show_store_name: !this.state.show_store_name
                    })
                  }}
                          disabled={true}
                          value={this.state.show_store_name}
                  />
                </View>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => {
                this.setState({
                  show_product_info: !this.state.show_product_info
                })
              }} style={{
                backgroundColor: colors.white,
                borderRadius: 8,
                marginBottom: 10,
                padding: 10,
                paddingBottom: 4,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  height: 30,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: colors.color333,
                    flex: 1
                  }}>商品信息 </Text>
                  <Switch style={{
                    fontSize: 16,
                  }} onValueChange={() => {
                    this.setState({
                      show_product_info: !this.state.show_product_info
                    })
                  }}
                          disabled={true}
                          value={this.state.show_product_info}
                  />
                </View>

              </TouchableOpacity>

            </View>
          </If>

        </ScrollView>
        {this.renderBtn()}
      </View>
    );
  }


  renderBtn() {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'保存'}
                onPress={() => {
                  this.submit()
                }}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: colors.main_color,
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
        />
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DiyPrinterItem)
