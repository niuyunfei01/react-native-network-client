/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Heading1, Heading2, Paragraph } from '../../widget/Text'
import { screen, system, tool } from '../../common'
import { color, DetailCell, NavigationItem, SpacingView } from '../../widget'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";

// create a component
class MyScene extends PureComponent {
    static navigationOptions = {title: 'My', header: null};

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
        }, 2000);
    }

    renderHeader() {
        return (
            <View style={header_styles.container}>
                <View style={[header_styles.main_box]}>
                    <Text style={header_styles.shop_name}>我是店名</Text>
                    <Text style={header_styles.change_shop}>切换门店</Text>
                </View>
                <View style={[header_styles.icon_box]}>
                    <Image style={[header_styles.icon_open]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={header_styles.open_text}>营业中</Text>
                </View>
                <View style={[header_styles.sales_box]}>
                    <Text style={[header_styles.sale_text]}>进入成功交易订单: 50</Text>
                    <Text style={[header_styles.sales_money, header_styles.sale_text]}>营业额: ¥ 3800.00</Text>
                </View>
            </View>
        )
    }

    renderWorker() {
        return (
            <View style={worker_styles.container}>
                <View>
                    <Image style={[worker_styles.icon_head]} source={require('../../img/Mine/avatar.png')} />
                </View>
                <View style={[worker_styles.main_box]}>
                    <Text style={worker_styles.worker_name}>我是姓名</Text>
                    <Text style={worker_styles.job}>我是职位</Text>
                </View>
                <View style={[worker_styles.main_box]}>
                    <Text style={worker_styles.order_num}>10000</Text>
                    <Text style={[worker_styles.tips_text]}>完成订单数</Text>
                </View>
                <View style={[worker_styles.main_box]}>
                    <Text style={worker_styles.order_num}>100</Text>
                    <Text style={[worker_styles.tips_text]}>问题订单</Text>
                </View>
            </View>
        )
    }

    renderBlock () {
        return (
            <View style={[block_styles.container]}>
                <View style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </View>
                <View style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </View>
                <View style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </View>
                <View style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </View>
                <View style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </View>
            </View>
        )
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
                }>
                {this.renderHeader()}
                {this.renderWorker()}
                {this.renderBlock()}
            </ScrollView>
        );
    }
}

class blockItem extends PureComponent {
    render() {
        return (
            <View>
                <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                <Text style={[block_styles.block_name]}>预留功能</Text>
            </View>
        )
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
        // borderWidth: pxToDp(1),
        // borderColor: colors.color999,
        // paddingVertical: pxToDp(30),
    },
    change_shop: {
        color: colors.main_color,
        fontSize: pxToDp(34),
        fontWeight: 'bold',
        lineHeight: pxToDp(34),
        // borderWidth: pxToDp(1),
        // borderColor: colors.color999,
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

const worker_styles = StyleSheet.create({
    container: {
        borderTopWidth: pxToDp(1),
        borderBottomWidth: pxToDp(1),
        borderColor: colors.color999,
        // paddingHorizontal: pxToDp(30),
        backgroundColor: colors.white,
        marginBottom: pxToDp(14),
        flexDirection: 'row',
    },
    main_box: {
        borderWidth: pxToDp(1),
        borderColor: 'red',
    },
    worker_name: {
        color: colors.title_color,
        fontSize: pxToDp(30),
        lineHeight: pxToDp(30),
        fontWeight: 'bold',
        marginVertical: pxToDp(30),
    },
    job: {
        color: '#555',
        fontSize: pxToDp(30),
        lineHeight: pxToDp(30),
        fontWeight: 'bold',
    },
    icon_head: {
        marginHorizontal: pxToDp(30),
        marginVertical: pxToDp(30),
        width: pxToDp(90),
        height: pxToDp(90),
    },
    order_num: {
        color: colors.title_color,
        fontSize: pxToDp(40),
        lineHeight: pxToDp(40),
        fontWeight: 'bold',
    },
    tips_text: {
        color: colors.color999,
        fontSize: pxToDp(24),
        lineHeight: pxToDp(24),
    },

});

const block_styles = StyleSheet.create({
    container: {
        paddingHorizontal: pxToDp(23),
        marginBottom: pxToDp(7),
        flexDirection: 'row',
        flexWrap: 'wrap',

        // borderWidth: pxToDp(1),
        // borderColor: 'red',
    },
    block_box: {
        // borderWidth: pxToDp(1),
        // borderColor: 'red',
        width: pxToDp(210),
        height: pxToDp(156),
        backgroundColor: colors.white,
        borderRadius: pxToDp(10),
        margin: pxToDp(7),
    },
    block_img: {
        marginHorizontal: pxToDp(60),
        marginTop: pxToDp(20),
        marginBottom: pxToDp(10),
        width: pxToDp(90),
        height: pxToDp(90),
    },
    block_name: {
        color: colors.color999,
        fontSize: pxToDp(24),
        lineHeight: pxToDp(24),
        textAlign: 'center',
    },

});


//make this component available to the app
export default MyScene;
