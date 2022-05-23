import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';


import {enableScreens} from "react-native-screens";

import RootScene from "./src/RootScene";
enableScreens(true)

export default class crm extends Component {
    render() {
        return (
            <RootScene launchProps={this.props}/>
        );
    }
}

AppRegistry.registerComponent('crm', () => crm);
