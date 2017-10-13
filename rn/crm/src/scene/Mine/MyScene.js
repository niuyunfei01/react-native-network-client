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
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from 'react-native-vector-icons/Entypo';
import Config from '../../config';

// create a component
class MyScene extends PureComponent {
    static navigationOptions = {title: 'My', header: null};

    constructor(props: Object) {
        super(props);

        this.state = {
            isRefreshing: false
        };
    }

    componentWillMount() {
    }

    onHeaderRefresh() {
        this.setState({ isRefreshing: true });

        setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, 1000);
    }

    renderHeader() {
        return (
            <View style={header_styles.container}>
                <View style={[header_styles.main_box]}>
                    <Text style={header_styles.shop_name}>我是店名</Text>
                    <TouchableOpacity style={{flexDirection: 'row'}} >
                        <Icon name='exchange' style={header_styles.change_shop} />
                        <Text style={header_styles.change_shop}> 切换门店</Text>
                    </TouchableOpacity>
                </View>
                <View style={[header_styles.icon_box]}>
                    <Image style={[header_styles.icon_open]} source={require('../../img/My/open_.png')} />
                    <Text style={header_styles.open_text}>营业中</Text>
                </View>
                <View style={[header_styles.sales_box]}>
                    <Text style={[header_styles.sale_text]}>今日成功交易订单: 50</Text>
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
                <View style={[worker_styles.worker_box]}>
                    {/*姓名需截取取多四个字*/}
                    <Text style={worker_styles.worker_name}>我是姓名</Text>
                    <Text style={worker_styles.job}>职位</Text>
                </View>
                <View style={[worker_styles.order_box]}>
                    <Text style={worker_styles.order_num}>666</Text>
                    <Text style={[worker_styles.tips_text]}>完成订单数</Text>
                </View>
                <View style={[worker_styles.question_box]}>
                    <Text style={worker_styles.order_num}>88</Text>
                    <Text style={[worker_styles.tips_text]}>问题订单</Text>
                </View>
                <TouchableOpacity style={[worker_styles.chevron_right]}>
                    <Button name='chevron-thin-right' style={worker_styles.right_btn} />
                </TouchableOpacity>
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

    renderBlock () {
        const { navigate } = this.props.navigation;
        return (
            <View style={[block_styles.container]}>
                <TouchableOpacity
                    style={[block_styles.block_box]}
                    onPress={
                        () => navigate(Config.ROUTE_WORKER)
                    }
                >
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>


                <TouchableOpacity style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>
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

const worker_styles = StyleSheet.create({
    container: {
        borderTopWidth: pxToDp(1),
        borderBottomWidth: pxToDp(1),
        borderColor: colors.color999,
        backgroundColor: colors.white,
        marginBottom: pxToDp(7),
        height: pxToDp(140),
        flexDirection: 'row',
    },
    worker_box: {
        marginLeft: pxToDp(5),
        width: pxToDp(130),
    },
    worker_name: {
        color: colors.title_color,
        fontSize: pxToDp(30),
        lineHeight: pxToDp(30),
        fontWeight: 'bold',
        marginTop: pxToDp(30),
    },
    job: {
        color: '#555',
        fontSize: pxToDp(30),
        lineHeight: pxToDp(30),
        fontWeight: 'bold',
        marginTop: pxToDp(25),
    },
    icon_head: {
        marginHorizontal: pxToDp(30),
        marginVertical: pxToDp(25),
        width: pxToDp(90),
        height: pxToDp(90),
        borderRadius: pxToDp(50),
    },
    order_box: {
        marginLeft: pxToDp(30),
        justifyContent: 'center',
    },
    question_box: {
        marginLeft: pxToDp(60),
        justifyContent: 'center',
    },
    order_num: {
        color: colors.title_color,
        fontSize: pxToDp(40),
        lineHeight: pxToDp(40),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tips_text: {
        color: colors.color999,
        fontSize: pxToDp(24),
        lineHeight: pxToDp(24),
        textAlign: 'center',
        marginTop: pxToDp(16),
    },
    chevron_right: {
        position: 'absolute',
        right: pxToDp(30),
        top: pxToDp(50),
    },
    right_btn: {
        fontSize: pxToDp(40),
        textAlign: 'center',
        width: pxToDp(50),
        height: pxToDp(50),
    },
});

const block_styles = StyleSheet.create({
    container: {
        paddingHorizontal: pxToDp(23),
        marginBottom: pxToDp(7),
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    block_box: {
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
        color: colors.color333,
        fontSize: pxToDp(24),
        lineHeight: pxToDp(24),
        textAlign: 'center',
    },

});


//make this component available to the app
export default MyScene;
