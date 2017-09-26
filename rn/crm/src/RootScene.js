/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan  
 * @flow
 */

import React, {PureComponent} from 'react'
import {StatusBar, Platform} from 'react-native'
import {NavigationActions} from 'react-navigation'

import {Provider} from 'react-redux'

/**
 * ## Actions
 *  The necessary actions for dispatching our bootstrap values
 */
import {setPlatform, setVersion} from './reducers/device/deviceActions'
import {setSessionToken, setStore} from './reducers/global/globalActions'

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
import AppNavigator from './common/AppNavigator'


/**
 *
 * ## Initial state
 * Create instances for the keys of each structure in snowflake
 * @returns {Object} object with 4 keys
 */
function getInitialState () {
    return {
        auth: new AuthInitialState(),
        device: (new DeviceInitialState()).set('isMobile', true),
        global: (new GlobalInitialState()),
        profile: new ProfileInitialState(),
    }
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

    componentDidMount() {
        let launchProps = this.props.launchProps;
        let orderId = launchProps['order_id'];
        if (orderId) {
            this.reset_to(orderId);
        }
    }

    render() {

        // on Android, the URI prefix typically contains a host in addition to scheme
        const prefix = Platform.OS === 'android' ? 'blx-crm://blx/' : 'blx-crm://';
        const store = configureStore(getInitialState());

        let launchProps = this.props.launchProps;

        if (launchProps['access_token']) {
            store.dispatch(setSessionToken(launchProps['access_token']));
        }

        let orderId = launchProps['order_id'];
        if (orderId) {
            this.reset_to(orderId);
        }
        store.dispatch(setPlatform('android')) //FIXME: should be determined dynamically
        store.dispatch(setVersion(VERSION))
        store.dispatch(setStore(store))

        return (
            <Provider store={store}>
            <AppNavigator uriPrefix={prefix} ref={nav => { this.navigator = nav; }}
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

    reset_to(orderId) {
        if (this.navigator) {
            if (this.navigator._navigation) {
                this.navigator._navigation.navigate('Order', {order_id: orderId})
                this.navigator._navigation.dispatch(NavigationActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({routeName: 'Order', params:{'order_id': orderId,}})]
                }));
            }
        }
    }
}


export default RootScene;
