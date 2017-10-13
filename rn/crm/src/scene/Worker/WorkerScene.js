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
import { color, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView } from '../../widget'
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
const header_styles = StyleSheet.create({
    container: {
        borderTopWidth: pxToDp(1),
        borderBottomWidth: pxToDp(1),
        borderColor: colors.color999,
        paddingLeft: pxToDp(30),
        backgroundColor: colors.white,
        marginBottom: pxToDp(14),
    },
    main_box: {
        marginRight: pxToDp(134),
        height: pxToDp(170),
        // borderWidth: pxToDp(1),
        // borderColor: 'red',
    },
    shop_name: {
        color: colors.title_color,
        fontSize: pxToDp(36),
        fontWeight: 'bold',
        marginVertical: pxToDp(30),
        lineHeight: pxToDp(36),
    },
    change_shop: {
        color: colors.main_color,
        fontSize: pxToDp(34),
        fontWeight: 'bold',
        lineHeight: pxToDp(34),
    },
    icon_box: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    icon_open: {
        marginHorizontal: pxToDp(30),
        marginTop: pxToDp(35),
        marginBottom: pxToDp(5),
        width: pxToDp(70),
        height: pxToDp(74),
    },
    open_text: {
        color: colors.main_color,
        fontSize: pxToDp(20),
        textAlign: 'center',
    },
    close_text: {
        color: '#999',
    },
    sales_box: {
        height: pxToDp(70),
        borderTopWidth: pxToDp(1),
        borderTopColor: '#555',
        flexDirection: 'row',
        alignItems: 'center',
    },
    sale_text: {
        fontSize: pxToDp(30),
    },
    sales_money: {
        position: 'absolute',
        right: pxToDp(30),
    },
});


//make this component available to the app
export default WorkerScene;
