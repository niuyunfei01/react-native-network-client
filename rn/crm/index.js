import React, {Component} from 'react';
import {AppRegistry, UIManager} from 'react-native';
import RootScene from "./src/RootScene";

// 启用Android Layout动画
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export default class crm extends Component {
    render() {
        return (
            <RootScene launchProps={this.props}/>
        );
    }
}

AppRegistry.registerComponent('crm', () => crm);
