import React, {Component} from 'react';
import {NativeModules} from 'react-native';
import {addNavigationHelpers, NavigationActions, StackNavigator, TabNavigator, TabBarBottom} from 'react-navigation';

import color from '../widget/color'
import TabBarItem from '../widget/TabBarItem'

import RemindScene from '../scene/Remind/RemindScene'
//import MineScene from '../scene/Mine/MineScene'
import MyScene from '../scene/Mine/MyScene';
import OrderScene from '../scene/Order/OrderScene'
import LoginScene from '../scene/Login/LoginScene'
import GoodsScene from '../scene/Goods/GoodsScene'

import WebScene from '../widget/WebScene'
import ApplyScene from "../scene/Apply/ApplyScene";
import * as native from "./native";
import screen from './screen'
import TestWeuiScene from "../scene/TestWeui/TestWeuiScene";

const Tab = TabNavigator(
    {
        Remind: {
            screen: RemindScene,
            navigationOptions: ({navigation}) => ({
                tabBarLabel: '提醒',
                tabBarIcon: ({focused, tintColor}) => (
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('../img/tabbar/tab_warn.png')}
                        selectedImage={require('../img/tabbar/tab_warn_pre.png')}
                    />
                )
            }),
        },

        Orders: {
            screen: OrderScene,
            navigationOptions: ({navigation}) => ({
                tabBarLabel: '订单',
                tabBarIcon: ({focused, tintColor}) => (
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('../img/tabbar/tab_list.png')}
                        selectedImage={require('../img/tabbar/tab_list_pre.png')}
                    />
                ),
                tabBarOnPress: () => {
                    console.log('do tabBarOnPress');
                    native.toOrders();
                }
            }),
        },

        Goods: {
            screen: GoodsScene,
            navigationOptions: ({navigation}) => ({
                tabBarLabel: '商品',
                tabBarIcon: ({focused, tintColor}) => (
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('../img/tabbar/tab_goods.png')}
                        selectedImage={require('../img/tabbar/tab_goods_pre.png')}
                    />
                ),
                tabBarOnPress: () => {
                    console.log('do navigateToGoods');
                    native.toGoods();
                }
            }),
        },


        Mine: {
            screen: MyScene,
            navigationOptions: ({navigation}) => ({
                tabBarLabel: '我的',
                tabBarIcon: ({focused, tintColor}) => (
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('../img/tabbar/tab_me.png')}
                        selectedImage={require('../img/tabbar/tab_me_pre.png')}
                    />
                )
            }),
        },
    },
    {
        // initialRouteName: 'Mine',
        tabBarComponent: TabBarBottom,
        tabBarPosition: 'bottom',
        swipeEnabled: false,
        animationEnabled: true,
        lazy: true,
        tabBarOptions: {
            activeTintColor: color.theme,
            inactiveTintColor: '#99579797',
            style: {backgroundColor: '#ffffff'},
        },
    }
);

class Navigator extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {initialRouteName, screenProps, initialRouteParams} = this.props;
        let stackNavigatorConfigs = {
            navigationOptions: {
                // headerStyle: { backgroundColor: color.theme }
                headerBackTitle: null,
                headerTintColor: '#333333',
                showIcon: true,
            },
        };

        if (initialRouteName) {
            stackNavigatorConfigs = {
                ...stackNavigatorConfigs,
                initialRouteName: initialRouteName,
                initialRouteParams: initialRouteParams || {}
            }
        }

        const CustomNavigator = StackNavigator(
            {
                Tab: {screen: Tab},
                Order: {
                    screen: OrderScene,
                    path: 'order/:orderId',
                },
                Web: {screen: WebScene},
                Home: {screen: RemindScene},
                Login: {
                    screen: LoginScene,
                    path: 'Login/:next/:nextParams'
                },
                Apply: {screen: ApplyScene},
                TestWeui: {screen: TestWeuiScene}
            },
            stackNavigatorConfigs
        );
        console.log('go with config:', stackNavigatorConfigs, "props", this.props);
      console.log("screen:", screen)
        return <CustomNavigator screenProps={screenProps}/>
    }
}

export default Navigator