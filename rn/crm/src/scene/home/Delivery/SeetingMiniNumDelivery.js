import React, {PureComponent} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View,} from "react-native";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Button, CheckBox, Switch} from "react-native-elements";
import * as globalActions from "../../../reducers/global/globalActions";
import HttpUtils from "../../../pubilc/util/http";
import {ToastShort} from "../../../pubilc/util/ToastUtils";

const mapStateToProps = state => {
  const {global} = state;
  return {global: global};
}
const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class SeetingMiniNumDelivery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ext_store_id: this.props.route.params.ext_store_id,
      isRefreshing: true,
      menus: [],
      ship_ways: [],
      sync_all: false,
      enable: false,
      wait_min: 0,
    };
  }

  componentDidMount() {
    this.getMiniNumDelivery();
    this.getDeliveryConf();
  }

  onHeaderRefresh() {
    this.getMiniNumDelivery();
    this.getDeliveryConf();
  }

  getMiniNumDelivery() {
    let access_token = this.props.global.accessToken
    const api = `/v1/new_api/ExtStores/get_guarantee_ship_config/${this.state.ext_store_id}?access_token=${access_token}`
    HttpUtils.get.bind(this.props)(api, {}).then(res => {
      this.setState({
        enable: res && res.enable === 1,
        wait_min: res.wait_min,
        ship_ways: res && res.ship_ways ? [...res.ship_ways] : [],
        sync_all: res.sync_all === 1
      })
    })
  }

  getDeliveryConf() {
    this.props.actions.showStoreDelivery(this.state.ext_store_id, (success, response) => {
      this.setState({
        isRefreshing: false,
        menus: response.menus ? response.menus : [],
      })
    })
  }

  setMiniNumDelivery() {
    if (this.state.enable) {
      if (this.state.wait_min <= 0) {
        return ToastShort("请选择保底配送触发时间");
      }
      if (this.state.ship_ways.length <= 0) {
        return ToastShort("请选择保底配送平台");
      }
    }
    let access_token = this.props.global.accessToken
    const api = `/v1/new_api/ExtStores/set_guarantee_ship_config/${this.state.ext_store_id}?access_token=${access_token}`
    HttpUtils.post.bind(this.props)(api, {
      enable: this.state.enable ? 1 : 0,
      ship_ways: this.state.ship_ways,
      sync_all: this.state.sync_all ? 1 : 0,
      wait_min: this.state.wait_min,
    }).then(res => {
      ToastShort(res.desc);
      setTimeout(() => {
        this.props.navigation.goBack()
      }, 800)
    }).catch((res) => {
      ToastShort("操作失败：" + res.desc);
    })
  }


  render() {
    const {menus, ship_ways} = this.state;
    let ship_ways_arr = []
    if (Array.isArray(ship_ways)) {
      ship_ways_arr = [...ship_ways]
    } else {
      for (let i in ship_ways) {
        ship_ways_arr.push(ship_ways[i])
      }
      this.setState({
        ship_ways: ship_ways_arr
      })
    }

    return (
      <View style={{flex: 1}}>
        <ScrollView style={{
          marginBottom: pxToDp(22),
          backgroundColor: colors.f7
        }}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => this.onHeaderRefresh()}
                        tintColor='gray'
                      />
                    }
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
        >

          <View style={{backgroundColor: colors.white, width: '96%', margin: '2%', borderRadius: 10}}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomColor: colors.colorEEE,
              borderBottomWidth: 1,
              paddingHorizontal: 15,
              paddingVertical: 10
            }}>
              <Text style={{color: colors.color333}}>开启保底 </Text>
              <Switch value={this.state.enable}
                      onValueChange={(res) => {
                        this.setState({enable: res});
                      }}/>
            </View>
          </View>

          <If condition={this.state.enable}>
            <View>
              <View style={{backgroundColor: colors.white, width: '96%', margin: '2%', borderRadius: 10}}>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottomColor: colors.colorEEE,
                  borderBottomWidth: 1,
                  paddingHorizontal: 15,
                  paddingVertical: 10
                }}>
                  <Text style={{color: colors.color333, fontWeight: "bold", fontSize: 16}}>设置保底配送方式 </Text>
                </View>
                <For index="idx" each='item' of={menus}>
                  <TouchableOpacity onPress={() => {
                    let arr = [...this.state.ship_ways];
                    if (!ship_ways_arr.find(value => value == item.id)) {
                      arr.push(item.id);
                    } else {
                      arr.splice(arr.findIndex(index => Number(index) == item.id), 1)
                    }
                    this.setState({ship_ways: arr})
                  }} style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottomColor: colors.colorEEE,
                    borderBottomWidth: 1,
                    paddingHorizontal: 15,
                    paddingVertical: 5
                  }} key={idx}>
                    <View style={{flexDirection: "row", alignItems: 'center'}}>
                      <Text style={{color: colors.color333}}>{item.name} </Text>
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <CheckBox
                        checked={ship_ways_arr.find(value => value == item.id)}
                        onPress={() => {
                          let arr = [...this.state.ship_ways];
                          if (!ship_ways_arr.find(value => value == item.id)) {
                            arr.push(item.id);
                          } else {
                            arr.splice(arr.findIndex(index => Number(index) == item.id), 1)
                          }
                          this.setState({ship_ways: arr})
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </For>
              </View>

              <View style={{
                backgroundColor: colors.white,
                marginVertical: 10,
                width: '96%',
                marginHorizontal: '2%',
                borderRadius: 10
              }}>
                <View style={{
                  flexDirection: "column",
                  borderBottomColor: colors.colorEEE,
                  borderBottomWidth: 1,
                  paddingHorizontal: 15,
                  paddingVertical: 10
                }}>
                  <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                    <Text style={{color: colors.color333}}>触发时间 </Text>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                      <Text style={{color: colors.color666, marginRight: 10}}>配送下单</Text>
                      <TextInput placeholder="0"
                                 underlineColorAndroid="transparent"
                                 style={{
                                   height: 40,
                                   borderBottomWidth: 1,
                                   borderColor: colors.colorDDD,
                                   width: 80,
                                   borderRadius: 5
                                 }}
                                 placeholderTextColor={'#ddd'}
                                 keyboardType={'numeric'}
                                 value={this.state.wait_min}
                                 onChangeText={(wait_min) => this.setState({wait_min})}
                                 textAlign='center'
                      />
                      <Text style={{color: colors.color666, marginLeft: 10}}>分钟后</Text>
                    </View>
                  </View>
                </View>
              </View>


              <View style={{
                backgroundColor: colors.white,
                width: '96%',
                marginHorizontal: '2%',
                marginVertical: 10,
                borderRadius: 10
              }}>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottomColor: colors.colorEEE,
                  borderBottomWidth: 1,
                  paddingHorizontal: 15,
                }}>
                  <Text style={{color: colors.color333}}>将保底配送设置应用到所有外卖店铺 </Text>
                  <CheckBox
                    checked={this.state.sync_all}
                    onPress={() => {
                      this.setState({sync_all: !this.state.sync_all})
                    }}
                  />
                </View>
              </View>
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
                  this.setMiniNumDelivery()
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

export default connect(mapStateToProps, mapDispatchToProps)(SeetingMiniNumDelivery);
