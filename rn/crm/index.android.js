import React, { Component } from 'react';
import {AppRegistry} from 'react-native';


import RootScene from "./src/RootScene";
import TrackPlayer from "react-native-track-player";
import {PlaybackService} from "./src/pubilc/component/musicService";

export default class crm extends Component {
    render() {
        return (
            <RootScene launchProps={this.props}/>
        );
    }
}

AppRegistry.registerComponent('crm', () => crm);
TrackPlayer.registerPlaybackService(() => PlaybackService);
