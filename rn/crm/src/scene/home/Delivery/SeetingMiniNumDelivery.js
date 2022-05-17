import React, {PureComponent} from "react";
import {RefreshControl, ScrollView, Text, View,} from "react-native";
import colors from "../../../pubilc/styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Switch} from "../../../weui";
import {Button, Checkbox} from '@ant-design/react-native';
import * as globalActions from "../../../reducers/global/globalActions";
import tool from "../../../pubilc/util/tool";

const CheckboxItem = Checkbox.CheckboxItem;
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
      isRefreshing: true,
      menus: [],
      ship_ways: [],
      mini_num: false,
      ship_ways_name: '',
    };
  }

  componentDidMount() {
    this.getDeliveryConf();
  }

  onHeaderRefresh() {
    this.getDeliveryConf();
  }

  getDeliveryConf() {
    this.props.actions.showStoreDelivery(this.props.route.params.ext_store_id, (success, response) => {
      let ship_ways_name = ''
      if (tool.length(response.ship_ways) > 0 && tool.length(response.menus) > 0) {
        for (let i of response.ship_ways) {
          for (let j of response.menus) {
            if (i === j.id) {
              if (tool.length(ship_ways_name) === 0) {
                ship_ways_name = j.name
              } else {
                ship_ways_name = ship_ways_name + ',' + j.name
              }
            }
          }
        }
      }
      this.setState({
        isRefreshing: false,
        menus: response.menus ? response.menus : [],
        ship_ways: response.ship_ways ? response.ship_ways : [],
        mini_num: response.auto_call && response.auto_call === 1 ? true : false,
        ship_ways_name: ship_ways_name
      })

    })
  }


  render() {
    const {menus, ship_ways} = this.state;
    let ship_ways_arr = []
    if (Array.isArray(ship_ways)) {
      ship_ways_arr = ship_ways
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
              <Switch value={this.state.mini_num}
                      onValueChange={(res) => {
                        this.setState({mini_num: res});
                      }}/>
            </View>
          </View>

          <If condition={this.state.mini_num}>
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
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottomColor: colors.colorEEE,
                  borderBottomWidth: 1,
                  paddingHorizontal: 15,
                  paddingVertical: 5
                }} key={idx}>
                  {
                    item.is_preference && item.is_preference === true ?
                      <View style={{flexDirection: "row", alignItems: 'center'}}>
                        <Text style={{fontSize: pxToDp(32)}}>{item.name} </Text>
                        <View style={{
                          backgroundColor: '#59B26A',
                          borderRadius: pxToDp(5),
                          paddingVertical: pxToDp(5),
                          paddingHorizontal: pxToDp(10),
                          marginLeft: pxToDp(20)
                        }}>
                          <Text style={{color: colors.white, fontSize: pxToDp(20)}}>偏好</Text>
                        </View>
                      </View> :
                      <View style={{flexDirection: "row", alignItems: 'center'}}>
                        <Text style={{color: colors.color333}}>{item.name} </Text>
                      </View>
                  }
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <CheckboxItem
                      checked={ship_ways_arr.find(value => value == item.id)}
                      onChange={event => {
                        let {ship_ways, ship_ways_name} = this.state;
                        if (event.target.checked) {
                          ship_ways.push(item.id);
                          if (tool.length(ship_ways_name) > 0) {
                            ship_ways_name = ship_ways_name + ',' + item.name;
                          } else {
                            ship_ways_name = item.name;
                          }
                        } else {
                          ship_ways.splice(ship_ways.findIndex(index => Number(index) == item.id), 1)
                          if (ship_ways_name.includes(',' + item.name)) {
                            ship_ways_name = ship_ways_name.replace(',' + item.name, '')
                          } else if (ship_ways_name.includes(item.name + ',')) {
                            ship_ways_name = ship_ways_name.replace(item.name + ',', '')
                          } else {
                            ship_ways_name = ship_ways_name.replace(item.name, '')
                          }
                        }
                        this.setState({ship_ways, ship_ways_name})
                      }}
                    />
                  </View>
                </View>
              </For>
            </View>
          </If>
        </ScrollView>

        <View style={{
          backgroundColor: colors.white,
          marginHorizontal: pxToDp(30),
          borderRadius: pxToDp(20),
          textAlign: 'center',
          height: pxToDp(65),
          marginBottom: pxToDp(70),
        }}>
          <Button type="primary" onPress={() => {

          }} style={{backgroundColor: colors.main_color, borderWidth: 0}}>
            保存
          </Button>
        </View>
      </View>

    );
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(SeetingMiniNumDelivery);
