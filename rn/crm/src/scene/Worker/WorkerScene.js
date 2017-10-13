/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl, InteractionManager } from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

// create a component
class WorkerScene extends PureComponent {
    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;

        return {
            headerTitle: '员工信息',
            headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
            headerTitleStyle: {color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'},
            headerRight: '',
        }
    };

    constructor(props: Object) {
        super(props);

        this.state = {
            isRefreshing: false
        }
    }

    componentWillMount() {
    }

    onHeaderRefresh() {
        this.setState({ isRefreshing: true });

        setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, 1000);
    }

    render() {
        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => this.onHeaderRefresh()}
                        tintColor='gray'
                    />
                }
            >
               <Text> hello world</Text>
            </ScrollView>
        );
    }

}

// define your styles
const styles = StyleSheet.create({
});


//make this component available to the app
export default WorkerScene;
