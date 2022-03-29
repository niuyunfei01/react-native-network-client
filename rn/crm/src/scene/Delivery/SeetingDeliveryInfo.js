import React, {PureComponent} from "react";
import {
  Alert,
  InteractionManager,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import colors from "../../pubilc/styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Input, Switch} from "../../weui";
import {Button, Checkbox, Radio} from '@ant-design/react-native';
import * as globalActions from "../../reducers/global/globalActions";
import {tool} from "../../common";
import {showError, showSuccess, ToastLong} from "../../pubilc/util/ToastUtils";
import AppConfig from "../../pubilc/common/config";

const CheckboxItem = Checkbox.CheckboxItem;
const RadioItem = Radio.RadioItem;
const mapStateToProps = state => {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global};
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
      default: '',
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
    this.onBindDelivery = this.onBindDelivery.bind(this)
  }

  componentDidMount() {
    this.getDeliveryConf();
  }

  onHeaderRefresh() {
    this.getDeliveryConf();
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  getDeliveryConf() {
    this.props.actions.showStoreDelivery(this.props.route.params.ext_store_id, (success, response) => {
      let showBtn = this.props.route.params.showBtn;
      if (tool.length(response.bind_info) > 0) {
        showBtn = response.bind_info.rebind === 1 ? false : showBtn;
        this.setState({
          showBind: response.bind_info.rebind === 1,
          bind_url: AppConfig.apiUrl(response.bind_info.bind_url),
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
        auto_call: response.auto_call && response.auto_call === 1 ? true : false,
        suspend_confirm_order: response.suspend_confirm_order && response.suspend_confirm_order === "0" ? true : false,
        deploy_time: response.deploy_time ? "" + response.deploy_time : '0',
        max_call_time: response.max_call_time ? "" + response.max_call_time : "10",
        order_require_minutes: response.order_require_minutes ? response.order_require_minutes : 0,
        default: response.default ? response.default : '',
        zs_way: response.zs_way && response.zs_way > 0 ? true : false,
        show_auto_confirm_order: response.vendor_id && response.vendor_id === '68' ? true : false,
        showBtn: showBtn,
        ship_ways_name: ship_ways_name
      }, () => {
        this.get_time_interval()
      })

    })
  }

  onBindDelivery() {

    if (this.state.auto_call && this.state.ship_ways.length === 0) {
      ToastLong("自动呼叫时需要选择配送方式");
      this.setState({isRefreshing: false});
      return;
    }

    if (this.state.zs_way) {
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
          auto_call: this.state.auto_call ? 1 : 2,
          ship_ways: this.state.ship_ways,
          default: this.state.default,
          max_call_time: this.state.max_call_time,
          deploy_time: this.state.deploy_time,
        },
        (success) => {
          this.setState({isRefreshing: false})
          if (success) {
            showSuccess('配置成功');
            this.props.navigation.goBack();
          } else {
            showError('配置失败');
          }
        }
      )
    }, 1000)
  }


  get_time_interval() {
    if (this.state.ship_ways.length == 0 || this.state.max_call_time == 0) {
      return this.state.max_call_time + "分"
    }
    let interval = this.state.max_call_time * 60 / this.state.ship_ways.length
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

  render() {
    const {menus, ship_ways, saveBtnStatus} = this.state;
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
        <ScrollView style={styles.container}
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

          <Cells style={[styles.cell_box]}>
            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>自动呼叫配送</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.auto_call}
                        onValueChange={(res) => {
                          if (saveBtnStatus == 0) {
                            this.setState({auto_call: res, saveBtnStatus: 1});
                          } else {
                            this.setState({auto_call: res, saveBtnStatus: 0});
                          }
                        }}/>
              </CellFooter>
            </Cell>
          </Cells>


          <If condition={this.state.auto_call}>
            <CellsTitle style={styles.cell_title}><Text
              style={{fontSize: pxToDp(30), color: colors.title_color}}>开始发单时间</Text></CellsTitle>
            <Cells style={[styles.cell_box]}>

              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  及时单
                </CellBody>
                <CellFooter>
                  <Text>下单</Text>

                  <Input onChangeText={(deploy_time) => this.setState({deploy_time})}
                         value={this.state.deploy_time}
                         style={Platform.OS === 'ios' ? [styles.cell_inputs] : [styles.cell_input]}
                         placeholder=""
                         underlineColorAndroid='transparent'
                  />
                  <Text>分钟后</Text>
                </CellFooter>
              </Cell>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  预定单
                </CellBody>
                <CellFooter>
                  <Text>预计送达前{this.state.order_require_minutes}分钟</Text>
                </CellFooter>
              </Cell>
              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  最长呼单时间
                </CellBody>
                <CellFooter>
                  <Input
                    placeholder=""
                    onChangeText={val => this.setState({max_call_time: val}, () => {
                      this.get_time_interval()
                    })}
                    value={this.state.max_call_time}
                    underlineColorAndroid="transparent"
                    style={Platform.OS === 'ios' ? [styles.cell_inputs] : [styles.cell_input]}
                  />
                  <Text style={{marginRight: pxToDp(20)}}>分钟</Text>
                </CellFooter>
              </Cell>

              <Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  发单间隔
                </CellBody>
                <CellFooter>
                  <Text>{this.state.time_interval} </Text>
                </CellFooter>
              </Cell>

            </Cells>

            <CellsTitle style={styles.cell_title}>配送方式</CellsTitle>
            <For index="idx" each='item' of={menus}>
              <Cells style={{
                marginLeft: "2%",
                marginRight: "2%",
                marginTop: 5,
                borderRadius: pxToDp(20),
                borderColor: colors.white
              }}>
                <Cell customStyle={{height: pxToDp(100), justifyContent: "center"}}>
                  {
                    item.is_preference && item.is_preference === true ?
                        <CellBody style={{flexDirection: "row", alignItems: 'center'}}>
                          <Text style={{fontSize: pxToDp(32)}}>{item.name}</Text>
                          <View style={{backgroundColor: '#59B26A', borderRadius: pxToDp(5), paddingVertical: pxToDp(5), paddingHorizontal: pxToDp(10), marginLeft: pxToDp(20)}}>
                            <Text style={{color: colors.white, fontSize: pxToDp(20)}}>默认</Text>
                          </View>
                        </CellBody> :
                        <CellBody style={{flexDirection: "row", alignItems: 'center'}}>
                          <Text style={{fontSize: pxToDp(32)}}>{item.name}</Text>
                        </CellBody>
                  }
                  <CellFooter>
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
                        this.setState({ship_ways, ship_ways_name}, () => {
                          this.get_time_interval()
                        })
                      }}
                    />
                  </CellFooter>
                </Cell>
              </Cells>
            </For>
          </If>
        </ScrollView>

        <If condition={this.state.showBtn}>
          <View style={styles.btn_submit}>

            <Button type="primary" onPress={() => {
              this.state.auto_call ?
                Alert.alert('确认', `从现在起新来的订单，将在来单 ${this.state.deploy_time} 分钟后，系统自动按价格从低到高的顺序呼叫骑手。之前的订单不受影响，请注意手动发单。`, [
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
                    text: '确认', onPress: () => {
                      this.onBindDelivery()
                    }
                  },
                ])
            }
            }
                    style={{backgroundColor: colors.main_color, borderWidth: 0}}>
              保存
            </Button>

          </View>
        </If>
      </View>

    );
  }
}

const
  styles = StyleSheet.create({
    container: {
      marginBottom: pxToDp(22),
      backgroundColor: colors.f7
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
