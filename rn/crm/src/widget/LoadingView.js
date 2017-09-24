'use strict';
import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    ActivityIndicator
} from 'react-native';

import CommonStyles from '../styles/common';
import Colors from '../styles/colors';

export default class LoadingView extends Component {
    constructor (props) {
        super(props)
    }

    render() {
        return (
            <View style={[CommonStyles.container,CommonStyles.flexVCenter,CommonStyles.flexHCenter]}>
                <View style={this.props.style}>
                    <ActivityIndicator animating={this.props.isLoading} size='large' color={Colors.toolbarbg}/>
                    <Text style={[CommonStyles.font20,CommonStyles.marginTop10,{color:this.props.tipColor?this.props.tipColor:'#666'}]}>{this.props.tip?this.props.tip:''}</Text>
                </View>
            </View>
        );
    }
}
