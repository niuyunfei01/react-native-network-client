/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan  
 * @flow
 */

import React, {PureComponent} from 'react'
import {StatusBar, Platform, StyleSheet, View, Text, ToastAndroid} from 'react-native'

import {Provider} from 'react-redux'

/**
 * ## Actions
 *  The necessary actions for dispatching our bootstrap values
 */
import {setPlatform, setVersion} from './reducers/device/deviceActions'
import {setAccessToken} from './reducers/global/globalActions'

import configureStore from "./common/configureStore";
import AppNavigator from './common/AppNavigator'
import Caught from './common/Caught'

import Config from './config'

import SplashScreen from 'react-native-splash-screen'

const lightContentScenes = ['Home', 'Mine']


//global exception handlers
const cauht = new Caught;


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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusBar: {
        height: (Platform.OS === 'ios' ? 20 :  StatusBar.currentHeight),
        backgroundColor: 'rgba(0, 0, 0, 0.20)',
    },
});

// create a component
class RootScene extends PureComponent {
    constructor() {
        super()
        StatusBar.setBarStyle('light-content')

        this.state = {
            rehydrated: false
        }

        this.store = null;
    }

    componentDidMount() {
        SplashScreen.hide()
    }

    componentWillMount() {
        const launchProps = this.props.launchProps;

        this.store = configureStore(function(store){
            const accessToken = launchProps['access_token'];
            if (accessToken) {
                store.dispatch(setAccessToken({access_token: accessToken}));
                store.dispatch(setPlatform('android'))
            }
            this.setState({rehydrated: true});
        }.bind(this));
    }

    render() {

        const launchProps = this.props.launchProps;
        const orderId = launchProps['order_id'];

        let initialRouteName = launchProps['_action'];
        let initialRouteParams = launchProps['_action_params']||{};

        if (this.state.rehydrated) {
            if (!this.store.getState().global.accessToken) {
                ToastAndroid.showWithGravity("请您先登录", ToastAndroid.SHORT, ToastAndroid.CENTER)
                initialRouteName = Config.ROUTE_LOGIN;
                initialRouteParams = {next: '', nextParams: {}};
            } else {
                if (!initialRouteName && orderId) {
                    initialRouteName = Config.ROUTE_ORDER;
                    initialRouteParams = {orderId};
                }
            }
        }


        // on Android, the URI prefix typically contains a host in addition to scheme
        const prefix = Platform.OS === 'android' ? 'blx-crm://blx/' : 'blx-crm://';
        return !this.state.rehydrated ? <Text>Loading...</Text>
            : (
            <Provider store={this.store}>
                <View style={styles.container}>
                <View style={styles.statusBar}>
                    <StatusBar
                        backgroundColor={'transparent'}
                        translucent
                    />
                </View>
            <AppNavigator uriPrefix={prefix} ref={nav => { this.navigator = nav; }}
                          initialRouteName={initialRouteName} initialRouteParams={initialRouteParams}
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
                </View>
            </Provider>
        );
    }
}


export default RootScene;
