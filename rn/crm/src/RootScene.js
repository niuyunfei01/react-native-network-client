/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan  
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { StatusBar } from 'react-native'
import { StackNavigator, TabNavigator, TabBarBottom } from 'react-navigation';

import color from './widget/color'
import { screen, system, tool } from './common'
import TabBarItem from './widget/TabBarItem'

import HomeScene from './scene/Home/HomeScene'
import MineScene from './scene/Mine/MineScene'
import OrderScene from './scene/Order/OrderScene'

import WebScene from './widget/WebScene'
import GroupPurchaseScene from './scene/GroupPurchase/GroupPurchaseScene'

import {Provider} from 'react-redux'

/**
 * ## Actions
 *  The necessary actions for dispatching our bootstrap values
 */
import {setPlatform, setVersion} from './reducers/device/deviceActions'
import {setStore} from './reducers/global/globalActions'

/**
 * ## States
 * Snowflake explicitly defines initial state
 *
 */
import AuthInitialState from './reducers/auth/authInitialState'
import DeviceInitialState from './reducers/device/deviceInitialState'
import GlobalInitialState from './reducers/global/globalInitialState'
import ProfileInitialState from './reducers/profile/profileInitialState'
import configureStore from "./common/configureStore";
import {VERSION} from "./api";

/**
 *
 * ## Initial state
 * Create instances for the keys of each structure in snowflake
 * @returns {Object} object with 4 keys
 */
function getInitialState () {
    const _initState = {
        auth: new AuthInitialState(),
        device: (new DeviceInitialState()).set('isMobile', true),
        global: (new GlobalInitialState()),
        profile: new ProfileInitialState()
    }
    return _initState
}

const lightContentScenes = ['Home', 'Mine']

function getCurrentRouteName(navigationState) {
    if (!navigationState) {
        return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
        return getCurrentRouteName(route);
    }
    return route.routeName;
}

// create a component
class RootScene extends PureComponent {
    constructor() {
        super()
        StatusBar.setBarStyle('light-content')
    }

    render() {


        const store = configureStore(getInitialState())

        // configureStore will combine reducers from snowflake and main application
        // it will then create the store based on aggregate state from all reducers
        store.dispatch(setPlatform('android')) //FIXME: should be determined dynamically
        store.dispatch(setVersion(VERSION))
        store.dispatch(setStore(store))

        return (
            <Provider store={store}>
            <Navigator
                onNavigationStateChange={
                    (prevState, currentState) => {
                        const currentScene = getCurrentRouteName(currentState);
                        const previousScene = getCurrentRouteName(prevState);
                        if (previousScene !== currentScene) {
                            if (lightContentScenes.indexOf(currentScene) >= 0) {
                                StatusBar.setBarStyle('light-content')
                            } else {
                                StatusBar.setBarStyle('dark-content')
                            }
                        }
                    }
                }
            />
            </Provider>
        );
    }
}

const Tab = TabNavigator(
    {
        Home: {
            screen: HomeScene,
            navigationOptions: ({ navigation }) => ({
                tabBarLabel: '提醒',
                tabBarIcon: ({ focused, tintColor }) => (
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('./img/tabbar/tab_warn.png')}
                        selectedImage={require('./img/tabbar/tab_warn_pre.png')}
                    />
                )
            }),
        },

        Nearby: {
            screen: OrderScene,
            navigationOptions: ({ navigation }) => ({
                tabBarLabel: '订单',
                tabBarIcon: ({ focused, tintColor }) => (
                    <TabBarItem
                        tintColor={tintColor}
                        focused={focused}
                        normalImage={require('./img/tabbar/tab_list.png')}
                        selectedImage={require('./img/tabbar/tab_list_pre.png')}
                    />
                )
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
                        normalImage={require('./img/tabbar/tab_goods.png')}
                        selectedImage={require('./img/tabbar/tab_goods_pre.png')}
                    />
                )
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
                        normalImage={require('./img/tabbar/tab_me.png')}
                        selectedImage={require('./img/tabbar/tab_me_pre.png')}
                    />
                )
            }),
        },
    },
    {
        tabBarComponent: TabBarBottom,
        tabBarPosition: 'bottom',
        swipeEnabled: true,
        animationEnabled: true,
        lazy: true,
        tabBarOptions: {
            activeTintColor: color.theme,
            inactiveTintColor: '#99579797',
            style: { backgroundColor: '#ffffff' },
        },
    }

);

const Navigator = StackNavigator(
    {
        Tab: { screen: Tab },
        Web: { screen: WebScene },
        GroupPurchase: { screen: GroupPurchaseScene },
    },
    {
        navigationOptions: {
            // headerStyle: { backgroundColor: color.theme }
            headerBackTitle: null,
            headerTintColor: '#333333',
            showIcon: true,
        },
    }
);
//make this component available to the app
export default RootScene;
