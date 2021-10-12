//import liraries
import React, {PureComponent} from "react";
import {ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View,} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells, CellsTitle} from "../../weui/Cell";
import {Input, Switch} from "../../weui/Form";
import {Button} from "../../weui/Button";
import {Checkbox, List, Radio} from '@ant-design/react-native';
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import * as globalActions from "../../reducers/global/globalActions";
import Icon from "react-native-vector-icons/Entypo";
import Config from "../../config";

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
      isRefreshing: false,
      onSubmitting: false,
      menus: [],
      deploy_time: "",
      reserve_deploy_time: "",
      ship_ways: [],
      auto_call: 1,
      max_call_time: 10,
      default: '',
    };
    this.onBindDelivery = this.onBindDelivery.bind(this)
    this.navigationOptions(this.props)
  }

  componentDidMount() {
    this.getDeliveryConf();
  }

  getDeliveryConf() {
    this.props.actions.showStoreDelivery(this.props.route.params.ext_store_id, (success, response) => {
      this.setState({
        menus: response.menus ? response.menus : [],
        deploy_time: response.deploy_time ? response.deploy_time : '',
        ship_ways: response.ship_ways ? response.ship_ways : [],
        auto_call: response.auto_call ? response.auto_call : 2,
        default: response.default ? response.default : '',
      })

    })
  }

  onBindDelivery() {
    this.props.actions.updateStoresAutoDelivery(
      this.props.route.params.ext_store_id,
      {
        auto_call: this.state.auto_call,
        ship_ways: this.state.ship_ways,
        default: this.state.default,
        deploy_time: this.state.deploy_time
      },
      (success, response) => {
        if (success) {
          ToastAndroid.showWithGravity('配置店铺配送成功', ToastAndroid.SHORT, ToastAndroid.CENTER)
        } else {
          ToastAndroid.showWithGravity('配置店铺配送失败', ToastAndroid.SHORT, ToastAndroid.CENTER)
        }
        this.props.navigation.navigate('PlatformScene');
      }
    )
  }

  render() {
    const {menus} = this.state;
    return (
      <ScrollView style={styles.container}
                  automaticallyAdjustContentInsets={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
      >

        <TouchableOpacity
          style={{flexDirection: 'row', paddingTop: pxToDp(15), paddingBottom: pxToDp(15), paddingLeft: pxToDp(15)}}
          onPress={() => {
            this.onPress(Config.ROUTE_SEETING_DELIVERY, {
              ext_store_id: store.id,
              store_id: store_id,
              poi_name: store.poi_name,
            })
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
        </Cells>


        <CellsTitle style={styles.cell_title}><Text
          style={{fontSize: pxToDp(30), color: colors.title_color}}>开始发单时间</Text></CellsTitle>
        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              及时单
            </CellBody>
            <CellFooter>
              <Text>下单</Text>
              <Input
                onChangeText={val => this.setState({max_call_time: val})}
                value={this.state.max_call_time}
                style={[styles.cell_input]}
                underlineColorAndroid="transparent" //取消安卓下划线
              />
              <Text>分钟后</Text>
            </CellFooter>
          </Cell>
          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              最长呼单时间
            </CellBody>
            <CellFooter>
              <Input
                onChangeText={val => this.setState({max_call_time: val})}
                value={this.state.max_call_time}
                underlineColorAndroid="transparent" //取消安卓下划线
                style={[styles.cell_input]}
              />
              <Text>分钟</Text>
            </CellFooter>
          </Cell>

          <Cell customStyle={[styles.cell_row]}>
            <CellBody>
              预计单
            </CellBody>
            <CellFooter>
              <Text>预计送达前50分钟</Text>
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

        <Button
          onPress={this.onBindDelivery}
          type="primary"
          style={styles.btn_submit}
        >
          确认绑定
        </Button>
      </ScrollView>

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
      borderWidth: pxToDp(4),
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
      margin: pxToDp(30),
      marginBottom: pxToDp(50),
      backgroundColor: "#6db06f"
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
