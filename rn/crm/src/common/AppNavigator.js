import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NativeModules } from 'react-native';
import { addNavigationHelpers, NavigationActions, StackNavigator, TabNavigator, TabBarBottom } from 'react-navigation';

import color from '../widget/color'
// import { screen, system, tool } from './common'
import TabBarItem from '../widget/TabBarItem'

import AlertScene from '../scene/Alert/AlertScene'
import MineScene from '../scene/Mine/MineScene'
import OrderScene from '../scene/Order/OrderScene'
import LoginScene from '../scene/Login/LoginScene'

import WebScene from '../widget/WebScene'
import RegisterScene from "../scene/Register/RegisterScene";

const Tab = TabNavigator(
    {
        Alert: {
            screen: AlertScene,
            navigationOptions: ({ navigation }) => ({
                tabBarLabel: '提醒',
                tabBarIcon: ({ focused, tintColor }) => (
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
            navigationOptions: ({ navigation }) => ({
                tabBarLabel: '订单',
                tabBarIcon: ({ focused, tintColor }) => (
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('../img/tabbar/tab_list.png')}
                        selectedImage={require('../img/tabbar/tab_list_pre.png')}
                    />
                ),
                tabBarOnPress: () => {
                    console.log('do tabBarOnPress');
                    NativeModules.ActivityStarter.navigateToOrders();
                }
            }),
        },

        Goods: {
            screen: OrderScene,
            navigationOptions: ({ navigation }) => ({
                tabBarLabel: '商品',
                tabBarIcon: ({ focused, tintColor }) => (
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('../img/tabbar/tab_goods.png')}
                        selectedImage={require('../img/tabbar/tab_goods_pre.png')}
                    />
                ),
                tabBarOnPress: () => {
                    console.log('do navigateToGoods');
                    NativeModules.ActivityStarter.navigateToGoods();
                }
            }),
        },


        Mine: {
            screen: MineScene,
            navigationOptions: ({ navigation }) => ({
                tabBarLabel: '我的',
                tabBarIcon: ({ focused, tintColor }) => (
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
        tabBarComponent: TabBarBottom,
        tabBarPosition: 'bottom',
        swipeEnabled: false,
        animationEnabled: true,
        lazy: true,
        tabBarOptions: {
            activeTintColor: color.theme,
            inactiveTintColor: '#99579797',
            style: { backgroundColor: '#ffffff' },
        },
    }

);

class Navigator extends Component {
    render() {
        const {initialRouteName, screenProps} = this.props;
        let stackNavigatorConfigs = {
            navigationOptions: {
                // headerStyle: { backgroundColor: color.theme }
                headerBackTitle: null,
                headerTintColor: '#333333',
                showIcon: true,
            },
        };

        if (initialRouteName) {
            stackNavigatorConfigs = {...stackNavigatorConfigs, initialRouteName: initialRouteName}
        }

        const CustomNavigator = StackNavigator(
            {
                Tab: {screen: Tab},
                Order: {
                    screen: OrderScene,
                    path: 'order/:order_id',
                },
                Web: {screen: WebScene},
                Home: {screen: AlertScene},
                Login: {screen: LoginScene},
                Register: {screen: RegisterScene}
            },
            stackNavigatorConfigs
        );

        return <CustomNavigator screenProps={screenProps}/>
    }
}

export default Navigator