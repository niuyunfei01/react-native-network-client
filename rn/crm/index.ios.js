import React, { Component } from 'react';
import {
    AppRegistry
} from 'react-native';


import RootScene from "./src/RootScene";

export default class crm extends Component {
    render() {
        return (
            <RootScene launchProps={this.props}/>
        );
    }
}

AppRegistry.registerComponent('crm', () => crm);