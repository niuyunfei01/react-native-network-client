import React from 'react'
import color from "../../widget/color";
import {connect} from "react-redux";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Cts from "../pubilc/common/Cts";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import colors from "../pubilc/styles/colors";
import { Badge } from 'react-native-elements'
import {View} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";

function mapStateToProps(state) {
  const {global, remind} = state;
  return {global: global, remind: remind};
}


class TabHome extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isRefreshing: false,
    }
  }

  render() {
    let {remindNum} = this.props.remind;
    let isBlx = false;
    let global = this.props.global
    let storeVendorId = Number(global.config.vendor.id)
    let enabledGoodMgr = Number(global.config.enabled_good_mgr)
    if (storeVendorId && (storeVendorId === Cts.STORE_TYPE_BLX || storeVendorId === Cts.STORE_TYPE_SELF)) {
      isBlx = true;
    }
    const Tab = createBottomTabNavigator();

    const initialRouteName = this.props.route.params?.initialRouteName ?? 'Login'
    const initTab = initialRouteName === "Tab" && (this.props.route.params?.initTab || "Orders") || initialRouteName
    return (
      <Tab.Navigator
        initialRouteName={initTab}
        tabBarOptions={{
          activeTintColor: color.theme,
          inactiveTintColor: "#666",
          style: {backgroundColor: "#ffffff"},
          animationEnabled: false,
          lazy: true,
        }}>
        <Tab.Screen
          name="Home"
          getComponent={() => require("../Remind/RemindScene").default}
          options={
            {
              tabBarLabel: "提醒",
              tabBarIcon: ({focused}) => (
                  focused ?
                    <View style={{position: "relative"}}>
                      <FontAwesome5 name={'bell'} size={22}
                                    color={colors.main_color}
                      />
                      <Badge
                          value={remindNum > 99 ? '99+' : remindNum}
                          status="error"
                          containerStyle={{ position: 'absolute', top: -5, right: -25 }}
                      />
                    </View>
                    : <View style={{position: "relative"}}>
                      <FontAwesome5 name={'bell'} size={22}/>
                      <Badge
                          value={remindNum > 99 ? '99+' : remindNum}
                          status="error"
                          containerStyle={{ position: 'absolute', top: -5, right: -25 }}
                      />
                    </View>
              )
            }
          }
        />

        <Tab.Screen
          name="Orders"
          getComponent={() => require("../order/OrderListScene").default}
          options={
            {
              tabBarLabel: "订单",
              tabBarIcon: ({focused}) => (
                  focused ?
                      <FontAwesome5 name={'file-alt'} size={22}
                                    color={colors.main_color}
                      /> : <FontAwesome5 name={'file-alt'} size={22}/>
              ),

            }
          }
        />
        {enabledGoodMgr ? <Tab.Screen
          name="Goods"
          getComponent={() => require("../product/Goods/StoreGoodsList").default}
          options={
            {
              tabBarLabel: "商品",
              tabBarIcon: ({focused}) => (
                  focused ?
                      <Entypo name={"shopping-bag"} style={{fontSize: 22, color: colors.main_color}}></Entypo> : <Entypo name={"shopping-bag"} style={{fontSize: 22, color: colors.color333}}></Entypo>
              ),
            }
          }
        /> : null}
        {isBlx ?
          <Tab.Screen
            name="Operation"
            getComponent={() => require("../operation/Operation").default}
            options={{
              tabBarLabel: "运营",
              tabBarIcon: ({focused}) => (
                  focused ?
                      <FontAwesome5 name={'cloudsmith'} size={22}
                                    color={colors.main_color}
                      /> : <FontAwesome5 name={'cloudsmith'} size={22}/>
              )
            }
            }/> : null
        }
        <Tab.Screen
          name="Mine"
          getComponent={() => require("../home/Mine/MineScene").default}
          options={
            {
              tabBarLabel: "我的",
              tabBarIcon: ({focused}) => (
                  focused ?
                  <FontAwesome5 name={'user-alt'} size={22}
                    color={colors.main_color}
                  /> : <FontAwesome5 name={'user-alt'} size={22}/>
              )
            }
          }
        />
      </Tab.Navigator>
    )
  }
}

export default connect(mapStateToProps)(TabHome)
