//import liraries
import React, {PureComponent} from "react";
import {
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Input, Switch} from "../../weui";
import {Button, Checkbox, List, Radio} from '@ant-design/react-native';
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import * as globalActions from "../../reducers/global/globalActions";
import Icon from "react-native-vector-icons/Entypo";
import {tool} from "../../common";
import {ToastLong} from "../../util/ToastUtils";

const AgreeItem = Checkbox.AgreeItem;
const CheckboxItem = Checkbox.CheckboxItem;
const RadioItem = Radio.RadioItem;
const Item = List.Item;
const Brief = Item.Brief;
const mapStateToProps = state => {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global};
}
var ScreenWidth = Dimensions.get("window").width;
const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}

class SeetingDelivery extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '设置配送方式',
    })
  }

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
    };
    this.onBindDelivery = this.onBindDelivery.bind(this)
    this.navigationOptions(this.props)
  }

  componentDidMount() {
    this.getDeliveryConf();
  }

  onHeaderRefresh() {
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  getDeliveryConf() {
    this.props.actions.showStoreDelivery(this.props.route.params.ext_store_id, (success, response) => {

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
        zs_way: response.zs_way && response.zs_way === "0" ? true : false,
      })

    })
  }

  onBindDelivery() {
    this.setState({isRefreshing: true})
    if (!this.state.zs_way) {
      ToastLong("暂不支持平台专送修改");
      this.setState({isRefreshing: false});
      return;
    }
    tool.debounces(() => {
      this.props.actions.updateStoresAutoDelivery(
        this.props.route.params.ext_store_id,
        {
          auto_call: this.state.auto_call ? 1 : 2,
          suspend_confirm_order: this.state.suspend_confirm_order ? "0" : "1",
          ship_ways: this.state.ship_ways,
          default: this.state.default,
          max_call_time: this.state.max_call_time,
          deploy_time: this.state.deploy_time,
        },
        (success, response) => {
          this.setState({isRefreshing: false})
          if (success) {
            ToastAndroid.showWithGravity('配置店铺配送成功', ToastAndroid.SHORT, ToastAndroid.CENTER)
          } else {
            ToastAndroid.showWithGravity('配置店铺配送失败', ToastAndroid.SHORT, ToastAndroid.CENTER)
          }
        }
      )
    }, 1000)
  }

  render() {
    const {menus} = this.state;
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

          <TouchableOpacity
            style={{flexDirection: 'row', paddingTop: pxToDp(15), paddingBottom: pxToDp(15), paddingLeft: pxToDp(15)}}
            onPress={() => {
              // this.onPress()
            }}>
            <Text style={{
              margin: pxToDp(10),
              fontSize: pxToDp(26),
              color: colors.color999,
              marginLeft: pxToDp(10)
            }}>自动发单按费用由低到高依次发单</Text>
            <View style={{flex: 1,}}></View>
            <Text style={{
              margin: pxToDp(10),
              fontSize: pxToDp(26),
              color: colors.color999,
              marginLeft: pxToDp(10)
            }}>了解详情</Text>
            <Icon name='chevron-thin-right' style={[styles.right_btn]}/>
          </TouchableOpacity>

          <Cells style={[styles.cell_box]}>
            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>自动呼叫配送</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.auto_call}
                        onValueChange={(res) => {
                          this.setState({auto_call: res});

                        }}/>
              </CellFooter>
            </Cell>
            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                <Text style={[styles.cell_body_text]}>自动接单</Text>
              </CellBody>
              <CellFooter>
                <Switch value={this.state.suspend_confirm_order}
                        onValueChange={(res) => {
                          this.setState({suspend_confirm_order: res});

                        }}/>
              </CellFooter>
            </Cell>

          </Cells>


          <CellsTitle style={styles.cell_title}><Text
            style={{fontSize: pxToDp(30), color: colors.title_color}}>开始发单时间</Text></CellsTitle>
          <Cells style={[styles.cell_box]}>
            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                最长呼单时间
              </CellBody>
              <CellFooter>
                <Input
                  placeholder=""
                  onChangeText={val => this.setState({max_call_time: val})}
                  value={this.state.max_call_time}
                  underlineColorAndroid="transparent" //取消安卓下划线
                  style={[styles.cell_input]}
                />
                <Text style={{marginRight: pxToDp(20)}}>分钟</Text>
              </CellFooter>
            </Cell>

            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                及时单
              </CellBody>
              <CellFooter>
                <Text>下单</Text>

                <Input onChangeText={(deploy_time) => this.setState({deploy_time})}
                       value={this.state.deploy_time}
                       style={[styles.cell_input]}
                       placeholder=""
                       underlineColorAndroid='transparent' //取消安卓下划线
                />
                <Text>分钟后</Text>
              </CellFooter>
            </Cell>
            <Cell customStyle={[styles.cell_row]}>
              <CellBody>
                预计单
              </CellBody>
              <CellFooter>
                <Text>预计送达前{this.state.order_require_minutes}分钟</Text>
              </CellFooter>
            </Cell>
          </Cells>

          <CellsTitle style={styles.cell_title}>配送方式</CellsTitle>
          <Cells style={[styles.cell_box]}>
            {menus.map(item => (<Cell customStyle={[styles.cell_row]}>
                <CellBody>
                  <RadioItem
                    checked={this.state.default === item.id}
                    onChange={event => {
                      if (event.target.checked) {
                        this.setState({default: item.id});
                      }
                    }}
                  >{item.name}
                  </RadioItem>
                </CellBody>
                <CellFooter>
                  <CheckboxItem
                    checked={this.state.ship_ways.find(value => value == item.id)}
                    onChange={event => {
                      let {ship_ways} = this.state;
                      if (event.target.checked) {
                        ship_ways.push(item.id);
                      } else {
                        ship_ways.splice(ship_ways.findIndex(index => Number(index) == item.id), 1)
                      }
                      this.setState({ship_ways})
                    }}
                  />
                </CellFooter>
              </Cell>
            ))}
          </Cells>
        </ScrollView>

        <View style={styles.btn_submit}>
          <Button type="primary" onPress={this.onBindDelivery}
                  style={{backgroundColor: colors.colorBBB, borderWidth: 0}}>
            保存
          </Button>
        </View>
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
      marginTop: 0,
      borderTopWidth: pxToDp(1),
      borderBottomWidth: pxToDp(1),
      borderColor: colors.color999
    },
    cell_row: {
      height: pxToDp(70),
      justifyContent: "center"
    },
    cell_input: {
      //需要覆盖完整这4个元素
      fontSize: pxToDp(30),
      // height: pxToDp(90),
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

      // borderColor: 'green',
      // borderWidth: 1,
    },
    right_btn: {
      fontSize: pxToDp(26),
      margin: pxToDp(10),
      color: colors.color999,
      paddingTop: pxToDp(3),
      marginLeft: 0,
    },
  });
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SeetingDelivery);
