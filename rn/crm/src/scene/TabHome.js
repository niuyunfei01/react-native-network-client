import React from 'react'
import color from "../widget/color";
import {connect} from "react-redux";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import RemindScene from "./Remind/RemindScene";
import MyTabBarItem from "../common/MyTabBarItem";
import native from "../common/native";
import TabBarItem from "../widget/TabBarItem";
import MineScene from "./Mine/MineScene";
import _ from "lodash";
import Cts from "../Cts";
import Operation from "./Tab/Operation";
import OrderListScene from "./Order/OrderListScene";
import {createStackNavigator} from "@react-navigation/stack";
import StoreGoodsList from "./Goods/StoreGoodsList";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

const Stack = createStackNavigator();
export function GoodStackNavigations() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Goods" component={StoreGoodsList}  screenOptions={{
                headerTitleStyle: {
                    fontSize: 15,
                },
            }}
            />
        </Stack.Navigator>
    );
}

class TabHome extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isRefreshing: false,
    }
  }

    render() {
        let isBlx = false;
        let global = this.props.global
        let storeVendorId = Number(_.get(global, 'config.vendor.id'))
        let enabledGoodMgr = Number(_.get(global, 'config.enabled_good_mgr'))
        if (storeVendorId && (storeVendorId === Cts.STORE_TYPE_BLX || storeVendorId === Cts.STORE_TYPE_SELF)) {
            isBlx = true;
        }
        const Tab = createBottomTabNavigator();

        const initialRouteName = this.props.route.params?.initialRouteName ?? 'Login'
        const initTab = initialRouteName === "Tab" && (this.props.route.params?.initTab || "Orders") || initialRouteName
        console.log("initTab", initTab)
        return (
            <Tab.Navigator
                initialRouteName={initTab}
                tabBarOptions={{
                    activeTintColor: color.theme,
                    inactiveTintColor: "#666",
                    style: {backgroundColor: "#ffffff"},
                    animationEnabled: false,
                    lazy: true,
                }} >
                <Tab.Screen
                    name="Home"
                    component={RemindScene}
                    options={
                        {
                            tabBarLabel: "提醒",
                            tabBarIcon: ({focused, tintColor}) => (
                                <MyTabBarItem
                                    tintColor={tintColor}
                                    focused={focused}
                                    normalImage={require("../img/tabbar/tab_warn.png")}
                                    selectedImage={require("../img/tabbar/tab_warn_pre.png")}
                                />
                            )
                        }
                    }
                />

                <Tab.Screen
                    name="Orders"
                    component={OrderListScene}
                    options={
                        {
                            tabBarLabel: "订单",
                            tabBarIcon: ({focused, tintColor}) => (
                                <TabBarItem
                                    tintColor={tintColor}
                                    focused={focused}
                                    normalImage={require("../img/tabbar/tab_list.png")}
                                    selectedImage={require("../img/tabbar/tab_list_pre.png")}
                                />
                            ),

                        }
                    }
                />
                {enabledGoodMgr ? <Tab.Screen
                    name="Goods"
                    component={GoodStackNavigations}
                    listeners={({navigation}) => ({
                        tabPress: e => {
                            native.toGoods(global, null, navigation);
                        },
                    })}
                    options={
                        {
                            tabBarLabel: "商品",
                            tabBarIcon: ({focused, tintColor}) => (
                                <TabBarItem
                                    tintColor={tintColor}
                                    focused={focused}
                                    normalImage={require("../img/tabbar/tab_goods.png")}
                                    selectedImage={require("../img/tabbar/tab_goods_pre.png")}
                                />
                            ),
                        }
                    }
                /> : null}
                {isBlx ?
                    <Tab.Screen
                        name="Operation"
                        component={Operation}
                        options={{
                            tabBarLabel: "运营",
                            tabBarIcon: ({focused, tintColor}) => (
                                <TabBarItem
                                    tintColor={tintColor}
                                    focused={focused}
                                    normalImage={require("../img/tabbar/tab_operation.png")}
                                    selectedImage={require("../img/tabbar/tab_operation_pre.png")}
                                />
                            )
                        }
                        }/> : null
                }
                <Tab.Screen
                    name="Mine"
                    component={MineScene}
                    options={
                        {
                            tabBarLabel: "我的",
                            tabBarIcon: ({focused, tintColor}) => (
                                <TabBarItem
                                    tintColor={tintColor}
                                    focused={focused}
                                    normalImage={require("../img/tabbar/tab_me.png")}
                                    selectedImage={require("../img/tabbar/tab_me_pre.png")}
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
