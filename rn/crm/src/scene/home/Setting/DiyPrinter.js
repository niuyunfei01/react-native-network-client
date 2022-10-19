import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {InteractionManager, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import * as globalActions from "../../../reducers/global/globalActions";
import {Button, Slider, Switch} from "react-native-elements";
import Entypo from 'react-native-vector-icons/Entypo';
import Config from "../../../pubilc/common/config";
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
      show_shelves_code: false,
      upc: false,
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
        upc: res.upc !== undefined ? res.upc : false,
        show_shelves_code: res.show_shelves_code !== undefined ? res.show_shelves_code : false,
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
        show_goods_code,
        upc,
        show_shelves_code
      } = this.state;
      let fromData = {
        font_size: font_size,
        remark_max: remark_max,
        show_product_price: show_product_price,
        show_product_discounts: show_product_discounts,
        show_distribution_distance: show_distribution_distance,
        show_goods_code: show_goods_code,
        store_id: currStoreId,
        upc: upc,
        show_shelves_code: show_shelves_code,
      }
      const api = `api/set_printer_custom_cfg?access_token=${accessToken}`
      HttpUtils.post.bind(this.props)(api, fromData).then(() => {
        ToastLong('操作成功')
        this.setState({
          isRefreshing: false
        })
      }, (err) => {
        ToastLong("操作失败：" + err.desc)
        this.setState({isRefreshing: false})
      })
    }, 1000)
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor='gray'
            />
          } style={{flex: 1, backgroundColor: colors.f2, marginHorizontal: 10}}>

          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            marginVertical: 10,
            padding: 10,
            paddingBottom: 4,
          }}>
            <TouchableOpacity onPress={() => {
              this.onPress(Config.ROUTE_RECEIPT);
            }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: 30,
                              }}>
              <Text style={{
                fontSize: 14,
                color: colors.color333,
                flex: 1
              }}>用户联 </Text>
              <Text style={{
                fontSize: 14,
                color: colors.color666,
              }}>预览 </Text>
              <Entypo name="chevron-thin-right" style={{
                color: colors.color999,
                fontSize: 18,
              }}/>
            </TouchableOpacity>
          </View>


          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            padding: 10,
            paddingBottom: 4,
          }}>
            <View style={{
              borderBottomWidth: 1,
              paddingBottom: 2,
              borderColor: colors.colorEEE
            }}>
              <Text style={{
                color: colors.color333,
                padding: 10,
                paddingLeft: 8,
                fontSize: 15,
                fontWeight: 'bold',
              }}>字体设置 </Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: "space-between", alignItems: 'flex-end', height: 30}}>
              <Text style={{fontSize: 12, color: colors.color666}}>小 </Text>
              <Text style={{fontSize: 12, color: colors.color666, textAlign: 'center'}}>标准 </Text>
              <Text style={{fontSize: 12, color: colors.color666, textAlign: 'right'}}>较大 </Text>
            </View>
            <Slider
              maximumValue={2}
              value={this.state.font_size}
              step={1}
              thumbStyle={{
                width: 20,
                height: 20,
                backgroundColor: colors.main_color
              }}
              onValueChange={value => {
                this.setState({
                  font_size: value
                })
              }}
            />
          </View>

          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            padding: 10,
            paddingBottom: 4,
            marginVertical: 10,
          }}>
            <View style={{
              borderBottomWidth: 1,
              paddingBottom: 2,
              borderColor: colors.colorEEE
            }}>
              <Text style={{
                color: colors.color333,
                padding: 10,
                paddingLeft: 8,
                fontSize: 15,
                fontWeight: 'bold',
              }}>信息设置 </Text>
            </View>

            <TouchableOpacity onPress={() => {
              this.setState({
                show_product_price: !this.state.show_product_price
              })

            }}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorEEE,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{
                fontSize: 14,
                color: colors.color333,
                flex: 1,
              }}>商品价格 </Text>
              <Switch color={colors.main_color} style={{
                fontSize: 16,
              }} onChange={() => {
                this.setState({
                  show_product_price: !this.state.show_product_price
                })
              }} value={this.state.show_product_price}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.setState({
                show_product_discounts: !this.state.show_product_discounts
              })

            }}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorEEE,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{
                fontSize: 14,
                color: colors.color333,
                flex: 1,
              }}>商品优惠信息 </Text>
              <Switch color={colors.main_color} style={{
                fontSize: 16,
              }} onChange={() => {
                this.setState({
                  show_product_discounts: !this.state.show_product_discounts
                })
              }} value={this.state.show_product_discounts}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              this.setState({
                show_distribution_distance: !this.state.show_distribution_distance
              })

            }}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorEEE,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{
                fontSize: 14,
                color: colors.color333,
                flex: 1,
              }}>配送距离 </Text>
              <Switch color={colors.main_color} style={{
                fontSize: 16,
              }} onChange={() => {
                this.setState({
                  show_distribution_distance: !this.state.show_distribution_distance
                })
              }} value={this.state.show_distribution_distance}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              this.setState({
                show_goods_code: !this.state.show_goods_code
              })

            }}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorEEE,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <View style={{flex: 1,}}>
                <Text style={{
                  fontSize: 14,
                  color: colors.color333,
                }}>显示货号 </Text>
                <Text style={{
                  fontSize: 10,
                  color: colors.color999,
                }}>暂仅显示美团货号</Text>
              </View>
              <Switch color={colors.main_color} style={{
                fontSize: 16,
              }} onChange={() => {
                this.setState({
                  show_goods_code: !this.state.show_goods_code
                })
              }} value={this.state.show_goods_code}/>
            </TouchableOpacity>


            <TouchableOpacity onPress={() => {
              this.setState({
                upc: !this.state.upc
              })

            }}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorEEE,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{
                fontSize: 14,
                color: colors.color333,
                flex: 1,
              }}>显示UPC </Text>
              <Switch color={colors.main_color} style={{
                fontSize: 16,
              }} onChange={() => {
                this.setState({
                  upc: !this.state.upc
                })
              }} value={this.state.upc}/>
            </TouchableOpacity>


            <TouchableOpacity onPress={() => {
              this.setState({
                show_shelves_code: !this.state.show_shelves_code
              })

            }}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorEEE,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <View style={{flex: 1,}}>
                <Text style={{
                  fontSize: 14,
                  color: colors.color333,
                }}>显示货架码 </Text>
                <Text style={{
                  fontSize: 10,
                  color: colors.color999,
                }}>开启后显示外送帮货架码</Text>
              </View>
              <Switch color={colors.main_color} style={{
                fontSize: 16,
              }} onChange={() => {
                this.setState({
                  show_shelves_code: !this.state.show_shelves_code
                })
              }} value={this.state.show_shelves_code}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              this.onPress(Config.DIY_PRINTER_ITEM, {type: 'font'});
            }}
                              style={{
                                borderBottomWidth: 1,
                                borderColor: colors.colorEEE,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{
                fontSize: 14,
                color: colors.color333,
                flex: 1,
              }}>部分字号设置 </Text>
              <Entypo name="chevron-thin-right" style={{
                color: colors.color999,
                fontSize: 18,
              }}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              this.onPress(Config.DIY_PRINTER_ITEM, {type: 'privacy'});
            }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{
                fontSize: 14,
                color: colors.color333,
                flex: 1,
              }}>敏感信息 </Text>
              <Entypo name="chevron-thin-right" style={{
                color: colors.color999,
                fontSize: 18,
              }}/>
            </TouchableOpacity>
          </View>


          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            marginBottom: 100,
            padding: 10,
            paddingBottom: 4,
          }}>
            <View style={{
              borderBottomWidth: 1,
              paddingBottom: 2,
              borderColor: colors.colorEEE
            }}>
              <Text style={{
                color: colors.color333,
                padding: 10,
                paddingLeft: 8,
                fontSize: 15,
                fontWeight: 'bold',
              }}>自定义内容 </Text>
            </View>
            <TouchableOpacity onPress={() => {
              this.onPress(Config.ROUTE_REMARK);
            }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                height: pxToDp(90),
                              }}>
              <Text style={{
                fontSize: 14,
                color: colors.color333,
                flex: 1,
              }}>定制内容 </Text>
              <Entypo name="chevron-thin-right" style={{
                color: colors.color999,
                fontSize: 18,
              }}/>
            </TouchableOpacity>
          </View>

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

export default connect(mapStateToProps, mapDispatchToProps)(DiyPrinter)
