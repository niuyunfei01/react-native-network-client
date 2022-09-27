import React from 'react'
import {connect} from "react-redux";
import {View} from "react-native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Cts from "../../pubilc/common/Cts";
import colors from "../../pubilc/styles/colors";
import {Badge} from 'react-native-elements'
import Icon from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import store from "../../reducers/store/index"
import tool from "../../pubilc/util/tool";

import OrderListScene from '../order/OrderListScene'
import PropTypes from "prop-types";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

const Tab = createBottomTabNavigator();

const tabBarOptions = {
  activeTintColor: colors.main_color,
  inactiveTintColor: colors.color666,
  style: {backgroundColor: colors.white},
  animationEnabled: false,
  lazy: true,
  labelStyle: {fontSize: 15}
}

class TabHome extends React.Component {

  static propTypes = {
    route: PropTypes.object,
    remind: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = {
      showFlag: false
    }
  }

  componentDidMount() {
    this.unSubscribe = store.subscribe(() => {
      this.setState({
        showFlag: store.getState().payload
      })
    })
  }

  componentWillUnmount() {
    this.unSubscribe()
  }


  render() {
    let isBlx = false;
    let remind = this.props.remind?.remindNum;
    let {route} = this.props
    let {co_type} = tool.vendor(this.props.global) !== undefined ? tool.vendor(this.props.global) : global.noLoginInfo.co_type;
    let storeVendorId = Number(this.props?.global?.vendor_id !== undefined ? this.props?.global?.vendor_id : global.noLoginInfo.vendor_id || 0)

    let enabledGoodMgr = Number(this.props.global?.enabled_good_mgr !== undefined ? this.props.global.enabled_good_mgr : global.noLoginInfo.enabledGoodMgr)
    if (storeVendorId && (storeVendorId === Cts.STORE_TYPE_BLX || storeVendorId === Cts.STORE_TYPE_SELF)) {
      isBlx = true;
    }

    const initialRouteName = route.params?.initialRouteName ?? 'Login'
    const initTab = initialRouteName === "Tab" && (route.params?.initTab || "Orders") || initialRouteName
    let {showFlag} = this.state
    return (
      <Tab.Navigator
        initialRouteName={initTab}
        tabBarOptions={tabBarOptions}>
        <If condition={co_type !== 'peisong'}>
          <Tab.Screen
            name="Home"
            getComponent={() => require("../notice/NoticeList").default}
            options={
              {
                tabBarBadge: remind > 99 ? '99+' : remind,
                tabBarLabel: "提醒",
                tabBarIcon: ({focused}) => (
                  <View style={{position: "relative"}}>
                    <FontAwesome5 name={'bell'} size={22}
                                  color={focused ? colors.main_color : colors.colorCCC}
                    />
                  </View>
                )
              }
            }
          />
        </If>
        <If condition={this.props.global?.store_info?.fn_stall === '1'}>
          <Tab.Screen name={'Console'}
                      getComponent={() => require("../console/ConsoleScene").default}
                      options={{
                        tabBarLabel: '控制台',
                        tabBarIcon: ({focused}) => (
                          <Icon name={'grid'} size={26} color={focused ? colors.main_color : colors.colorCCC}/>)
                      }}/>
        </If>
        <If condition={co_type === 'peisong'}>
          <Tab.Screen
            name="CreateOrder"
            getComponent={() => require("../order/OrderSettingPack").default}
            options={
              {
                tabBarLabel: "创建",
                tabBarIcon: ({focused}) => (
                  <View style={{position: "relative"}}>
                    <Icon name={"circle-with-plus"} size={26}
                          style={{color: focused ? colors.main_color : colors.colorCCC}}/>

                  </View>
                )
              }
            }
          />
        </If>

        <Tab.Screen
          name="Orders"
          component={OrderListScene}
          options={
            {
              tabBarLabel: "订单",
              tabBarIcon: ({focused}) => (
                <FontAwesome5 name={'file-alt'} size={22} color={focused ? colors.main_color : colors.colorCCC}/>
              ),

            }
          }
        />
        <If condition={enabledGoodMgr}>
          <Tab.Screen
            name="Goods"
            getComponent={() => require("../product/Goods/StoreGoodsList").default}
            options={
              {
                tabBarLabel: "商品",
                tabBarIcon: ({focused}) => (
                  <Icon name={"shopping-bag"}
                        style={{fontSize: 22, color: focused ? colors.main_color : colors.colorCCC}}/>
                ),
              }
            }
          />
        </If>
        <If condition={isBlx}>
          <Tab.Screen
            name="Operation"
            getComponent={() => require("../operation/Operation").default}
            options={{
              tabBarLabel: "运营",
              tabBarIcon: ({focused}) => (
                <View style={{position: "relative"}}>
                  <FontAwesome5 name={'cloudsmith'} size={22}
                                color={focused ? colors.main_color : colors.colorCCC}
                  />
                  <If condition={showFlag}>
                    <Badge
                      value={'点我'}
                      status="error"
                      containerStyle={{position: 'absolute', top: -5, right: -30}}
                    />
                  </If>
                </View>
              )
            }
            }/>
        </If>
        <Tab.Screen
          name="Mine"
          getComponent={() => require("../home/Mine/MineScene").default}
          options={
            {
              tabBarLabel: "我的",
              tabBarIcon: ({focused}) => (
                <FontAwesome5 name={'user-cog'} size={22}
                              color={focused ? colors.main_color : colors.colorCCC}
                />
              )
            }
          }
        />
      </Tab.Navigator>
    )
  }
}

export default connect(mapStateToProps)(TabHome)
