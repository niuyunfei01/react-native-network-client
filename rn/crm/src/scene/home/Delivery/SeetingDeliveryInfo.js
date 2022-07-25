import React, {PureComponent} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Alert, InteractionManager, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import Config from "../../../pubilc/common/config";
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import tool from "../../../pubilc/util/tool";
import {Button, Switch} from "react-native-elements";
import * as globalActions from "../../../reducers/global/globalActions";
import {showSuccess, ToastLong} from "../../../pubilc/util/ToastUtils";

const mapStateToProps = state => {
  const {global} = state;
  return {global: global};
}
const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class SeetingDeliveryInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: true,
      menus: [],
      auto_call: false,
      suspend_confirm_order: false,
      deploy_time: "10",
      max_call_time: "10",
      ship_ways: [],
      order_require_minutes: 0,
      default_str: '',
      zs_way: false,
      show_auto_confirm_order: false,
      showBtn: false,
      time_interval: '0分',
      showBind: false,
      bind_url: '',
      notice: false,
      alert_title: '',
      alert_msg: '',
      alert_mobile: '',
      ship_ways_name: '',
      saveBtnStatus: 0
    };
  }

  componentDidMount() {
    this.getDeliveryConf();
  }

  onHeaderRefresh() {
    this.getDeliveryConf();
  }

  onPress(route, params = {}, callback = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params, callback);
    });
  }

  getDeliveryConf = () => {
    this.props.actions.showStoreDelivery(this.props.route.params.ext_store_id, (success, response) => {
      let showBtn = this.props.route.params.showBtn;
      if (tool.length(response.bind_info) > 0) {
        showBtn = response.bind_info.rebind === 1 ? false : showBtn;
        this.setState({
          showBind: response.bind_info.rebind === 1,
          bind_url: Config.apiUrl(response.bind_info.bind_url),
          notice: response.bind_info.notice === 1,
        })
        if (tool.length(response.bind_info.notice_info) > 0) {
          this.setState({
            alert_title: response.bind_info.notice_info.title,
            alert_msg: response.bind_info.notice_info.body,
            alert_mobile: response.bind_info.notice_info.mobile,
          })
        }
      }
      // let ship_ways_name = ''
      // if (tool.length(response.ship_ways) > 0 && tool.length(response.menus) > 0) {
      //   for (let i of response.ship_ways) {
      //     for (let j of response.menus) {
      //       if (i === j.id) {
      //         if (tool.length(ship_ways_name) === 0) {
      //           ship_ways_name = j.name
      //         } else {
      //           ship_ways_name = ship_ways_name + ',' + j.name
      //         }
      //       }
      //     }
      //   }
      // }
      this.setState({
        isRefreshing: false,
        menus: response.menus ? response.menus : [],
        ship_ways: response.ship_ways ? response.ship_ways : [],
        auto_call: response.auto_call && response.auto_call === 1 ? true : false,
        suspend_confirm_order: response.suspend_confirm_order && response.suspend_confirm_order === "0" ? true : false,
        deploy_time: response.deploy_time ? "" + response.deploy_time : '0',
        max_call_time: response.max_call_time ? "" + response.max_call_time : "10",
        order_require_minutes: response.order_require_minutes ? response.order_require_minutes : 0,
        default_str: response.default ? response.default : '',
        zs_way: response.zs_way && response.zs_way > 0 ? true : false,
        show_auto_confirm_order: this.props.global.config.vendor.wsb_store_account === '1',
        showBtn: showBtn,
        // ship_ways_name: ship_ways_name
      }, () => {
        this.get_time_interval()
      })

    })
  }

  onBindDelivery = () => {
    const {auto_call, ship_ways, zs_way, max_call_time, deploy_time,order_require_minutes,default_str} = this.state
    if (auto_call && ship_ways.length === 0) {
      ToastLong("自动呼叫时需要选择配送方式");
      this.setState({isRefreshing: false});
      return;
    }

    if (zs_way) {
      ToastLong("暂不支持平台专送修改");
      this.setState({isRefreshing: false});
      return;
    }

    let {accessToken} = this.props.global;
    tool.debounces(() => {
      this.props.actions.updateStoresAutoDelivery(
        accessToken,
        this.props.route.params.ext_store_id,
        {
          auto_call: auto_call ? 1 : 2,
           ship_ways,
          default: default_str,
          max_call_time,
          deploy_time,
          order_require_minutes,
        },
        (success) => {
          this.setState({isRefreshing: false})
          if (success) {
            showSuccess('配置成功');
            this.props.navigation.goBack();
          }
        }
      )
    }, 1000)
  }

  get_time_interval = () => {
    const {ship_ways, max_call_time} = this.state
    if (ship_ways.length === 0 || max_call_time === 0) {
      return max_call_time + "分"
    }
    let interval = max_call_time * 60 / ship_ways.length
    var theTime = parseInt(interval);
    var theTime1 = 0;
    var theTime2 = 0;
    if (theTime > 60) {
      theTime1 = parseInt(theTime / 60);
      theTime = parseInt(theTime % 60);
      if (theTime1 > 60) {
        theTime2 = parseInt(theTime1 / 60);
        theTime1 = parseInt(theTime1 % 60);
      }
    }
    var result = "" + parseInt(theTime) + "秒";
    if (theTime1 > 0) {
      result = "" + parseInt(theTime1) + "分" + result;
    }
    if (theTime2 > 0) {
      result = "" + parseInt(theTime2) + "小时" + result;
    }
    this.setState({
      time_interval: result
    });
  }

  onValueChange = (saveBtnStatus) => {
    let auto_call = !this.state.auto_call;
    if (saveBtnStatus === 0) {
      this.setState({auto_call: auto_call, saveBtnStatus: 1}, () => {
        if (auto_call === false) {
          Alert.alert('确认', `从现在起，新来的订单需要您手动呼叫骑手。之前的订单不受影响，仍将自动呼叫骑手。`, [
            {text: '稍等再说', style: 'cancel'},
            {
              text: '确认', onPress: () => this.onBindDelivery()
            },
          ])
        }
      })
    } else {
      this.setState({auto_call: auto_call, saveBtnStatus: 0});
    }
  }

  onChange = (check, item) => {


    let {ship_ways, ship_ways_name} = this.state;
    if (check) {
      ship_ways.push(item.id);
      // if (tool.length(ship_ways_name) > 0) {
      //   ship_ways_name = ship_ways_name + ',' + item.name;
      // } else {
      //   ship_ways_name = item.name;
      // }
    } else {
      ship_ways.splice(ship_ways.findIndex(index => Number(index) === item.id), 1)
      // if (ship_ways_name.includes(',' + item.name)) {
      //   ship_ways_name = ship_ways_name.replace(',' + item.name, '')
      // } else if (ship_ways_name.includes(item.name + ',')) {
      //   ship_ways_name = ship_ways_name.replace(item.name + ',', '')
      // } else {
      //   ship_ways_name = ship_ways_name.replace(item.name, '')
      // }
    }
    this.setState({ship_ways, ship_ways_name}, () => {
      this.get_time_interval()
    })
  }

  convertShowText = (length) => {
    if (length === 0)
      return '没有勾选'
    return `勾选${length}方`
  }


  render() {
    const {
      menus,
      ship_ways,
      saveBtnStatus,
      isRefreshing,
      showBtn,
      auto_call,
      deploy_time,
      order_require_minutes,
      max_call_time,
      time_interval
    } = this.state;
    console.log(ship_ways, 'ship_ways_name1')
    return (
      <View style={{flex: 1}}>
        <ScrollView style={styles.container}
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => this.onHeaderRefresh()}
                        tintColor='gray'
                      />
                    }
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
        >
          <View style={styles.row}>
            <Text style={styles.descriptionText}>
              开启自动发单，省心省力
            </Text>
            <Text style={styles.touchMore} onPress={() => this.onPress(Config.ROUTE_AUTO_CALL_DELIVERY, {showId: 1})}>
              了解更多
            </Text>
          </View>
          <View style={styles.titleItemWrap}>

            <View style={styles.titleWrap}>
              <Text style={{color: colors.color333}}>自动呼叫配送 </Text>

              <Switch color={colors.main_color} style={{
                fontSize: 16,
              }} value={this.state.auto_call}
                      onChange={() => {
                        this.onValueChange(saveBtnStatus)
                      }}/>
            </View>
          </View>

          <If condition={auto_call}>
            <View style={styles.areaWrap}>

              <View style={styles.titleWrap}>
                <Text style={{color: colors.color333, fontWeight: "bold", fontSize: 16}}>开始发单时间 </Text>
              </View>

              <View style={{
                flexDirection: "column",
                borderBottomColor: colors.colorEEE,
                borderBottomWidth: 1,
                paddingHorizontal: 15,
                paddingVertical: 10
              }}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                  <Text style={{color: colors.color333, fontSize: 14}}>及时单 </Text>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: colors.color333, fontSize: 14}}>下单后 </Text>
                    <TextInput placeholder="0"
                               underlineColorAndroid="transparent"
                               style={{
                                 height: 40,
                                 borderBottomWidth: 1,
                                 borderColor: colors.color333,
                                 width: 40,
                                 borderRadius: 5
                               }}
                               placeholderTextColor={'#ddd'}
                               keyboardType={'numeric'}
                               value={deploy_time}
                               onChangeText={(deploy_time) => this.setState({deploy_time})}
                               textAlign='center'
                    />
                    <Text style={{color: colors.color333, fontSize: 14}}>分钟后 </Text>
                  </View>
                </View>
                <Text style={{color: '#DD2525', marginTop: 10}}>接到订单{deploy_time}分钟后自动呼叫骑手 </Text>
              </View>

              <View style={{
                borderBottomColor: colors.colorEEE,
                borderBottomWidth: 1,
                paddingHorizontal: 15,
                paddingVertical: 15
              }}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                  <Text style={{color: colors.color333, fontSize: 14}}>预定单 </Text>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: colors.color333, fontSize: 14}}>配送前 </Text>
                    <TextInput placeholder="0"
                               underlineColorAndroid="transparent"
                               style={{
                                 height: 40,
                                 borderBottomWidth: 1,
                                 borderColor: colors.color333,
                                 width: 40,
                               }}
                               placeholderTextColor={'#ddd'}
                               keyboardType={'numeric'}
                               value={order_require_minutes}
                               onChangeText={order_require_minutes => this.setState({order_require_minutes})}
                               textAlign='center'
                    />
                    <Text style={{color: colors.color333, fontSize: 14}}>分钟 </Text>
                  </View>
                </View>
                <Text style={{color: '#DD2525', marginTop: 10}}>订单会在预计送达前{order_require_minutes}分钟后自动呼叫骑手 </Text>
              </View>

              <View style={{
                borderBottomColor: colors.colorEEE,
                borderBottomWidth: 1,
                paddingHorizontal: 15,
                paddingVertical: 10
              }}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                  <Text style={{color: colors.color333, fontSize: 14}}>最长呼单时间 </Text>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <TextInput placeholder="0"
                               underlineColorAndroid="transparent"
                               style={{
                                 height: 40,
                                 borderBottomWidth: 1,
                                 borderColor: colors.color333,
                                 width: 40,
                               }}
                               placeholderTextColor={'#ddd'}
                               keyboardType={'numeric'}
                               value={max_call_time}
                               onChangeText={val => this.setState({max_call_time: val}, () => {
                                 this.get_time_interval()
                               })}
                               textAlign='center'
                    />
                    <Text style={{color: colors.color333, fontSize: 14}}>分钟 </Text>
                  </View>
                </View>
                <Text style={{color: '#DD2525', marginTop: 10}}>订单在{max_call_time}分钟后最多呼叫{ship_ways.length}个配送 </Text>
              </View>

              <View style={{
                borderBottomColor: colors.colorEEE,
                borderBottomWidth: 1,
                paddingHorizontal: 15,
                paddingVertical: 20
              }}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                  <Text style={{color: colors.color333, fontSize: 14}}>发单间隔 </Text>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={{color: colors.color333, fontSize: 14}}>{time_interval} </Text>
                  </View>
                </View>
                <Text style={{
                  color: '#DD2525',
                  marginTop: 10
                }}>您{this.convertShowText(ship_ways.length)}配送，最长呼单时间为10分钟，发单时隔{time_interval}分钟 </Text>
              </View>

            </View>
            <View style={styles.areaWrap}>
              <View style={styles.shipWrap}>
                <Text style={styles.shipText}>配送方式 </Text>
              </View>
              <For index="idx" each='item' of={menus}>
                <View style={styles.itemWrap} key={idx}>
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
                          <Text style={{color: colors.white, fontSize: 17}}>偏好</Text>
                        </View>
                      </View> :
                      <View style={{flexDirection: "row", alignItems: 'center'}}>
                        <Text style={{color: colors.color333}}>{item.name} </Text>
                      </View>
                  }
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Switch color={colors.main_color} style={{
                      fontSize: 16,
                    }} value={Boolean(ship_ways.find(value => value === item.id))}
                            onChange={() => {
                              this.onChange(!ship_ways.find(value => value === item.id), item)
                            }}/>
                  </View>
                </View>
              </For>
            </View>
          </If>
        </ScrollView>

        <If condition={showBtn && auto_call}>
          {this.renderBtn()}
        </If>
      </View>

    );
  }

  renderBtn() {
    const {
      auto_call,
      deploy_time,
    } = this.state;
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'保存'}
                onPress={() => {
                  auto_call ?
                    Alert.alert('确认', `从现在起新来的订单，将在来单 ${deploy_time} 分钟后，系统自动按价格从低到高的顺序呼叫骑手。之前的订单不受影响，请注意手动发单。`, [
                      {text: '稍等再说', style: 'cancel'},
                      {
                        text: '确认', onPress: () => {
                          this.onBindDelivery()
                        }
                      },
                    ]) :
                    Alert.alert('确认', `从现在起，新来的订单需要您手动呼叫骑手。之前的订单不受影响，仍将自动呼叫骑手。`, [
                      {text: '稍等再说', style: 'cancel'},
                      {
                        text: '确认', onPress: () => this.onBindDelivery()
                      },
                    ])
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

const styles = StyleSheet.create({
  row: {
    width: '96%',
    margin: '2%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  descriptionText: {
    color: colors.color333,
    fontSize: 12
  },
  touchMore: {
    fontSize: 12,
    color: colors.main_color,
    textDecorationLine: "underline",
    paddingLeft: 8
  },
  titleItemWrap: {
    backgroundColor: colors.white,
    width: '96%',
    margin: '2%',
    borderRadius: 10
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  container: {
    marginBottom: pxToDp(22),
    backgroundColor: colors.f7
  },
  areaWrap: {
    backgroundColor: colors.white, width: '96%', margin: '2%', borderRadius: 10
  },
  shipWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  shipText: {
    color: colors.color333, fontWeight: "bold", fontSize: 16
  },
  itemWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingRight: 15,
  },
  btn_select: {
    marginRight: pxToDp(20),
    height: pxToDp(60),
    width: pxToDp(60),
    fontSize: pxToDp(40),
    color: colors.color666,
    textAlign: "center",
    textAlignVertical: "center"
  },
  cell_title: {
    marginBottom: pxToDp(10),
    fontSize: pxToDp(26),
    color: colors.color999
  },
  cell_box: {
    marginLeft: "2%",
    marginRight: "2%",
    marginTop: 5,
    borderRadius: pxToDp(30)
  },
  cell_row: {
    height: pxToDp(90),
    justifyContent: "center"
  },
  cell_input: {
    fontSize: pxToDp(30),
    height: pxToDp(70),
    borderWidth: pxToDp(1),
    width: pxToDp(100),
    paddingTop: pxToDp(13),
    marginLeft: pxToDp(10),
    marginRight: pxToDp(10),
  },

  cell_inputs: {
    textAlign: 'center',
    fontSize: pxToDp(30),
    height: pxToDp(90),
    borderWidth: pxToDp(1),
    width: pxToDp(100),
    marginLeft: pxToDp(10),
    marginRight: pxToDp(10),
  },
  cell_label: {
    width: pxToDp(234),
    fontSize: pxToDp(30),
    fontWeight: "bold",
    color: colors.color333
  },
  btn_submit: {
    backgroundColor: '#808080',
    marginHorizontal: pxToDp(30),
    borderRadius: pxToDp(20),
    textAlign: 'center',
    height: pxToDp(65),
    marginBottom: pxToDp(70),
  },
  map_icon: {
    fontSize: pxToDp(40),
    color: colors.color666,
    height: pxToDp(60),
    width: pxToDp(40),
    textAlignVertical: "center"
  },
  body_text: {
    paddingLeft: pxToDp(8),
    fontSize: pxToDp(30),
    color: colors.color333,
    height: pxToDp(60),
    textAlignVertical: "center"
  },
  right_btn: {
    fontSize: pxToDp(26),
    margin: pxToDp(10),
    color: colors.color999,
    paddingTop: pxToDp(3),
    marginLeft: 0,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SeetingDeliveryInfo);
