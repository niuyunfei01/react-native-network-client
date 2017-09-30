/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, InteractionManager, RefreshControl } from 'react-native'
import { color, Button, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView } from '../../widget'
import { Heading1, Heading2, Paragraph, HeadingBig } from '../../widget/Text'
import { screen, system } from '../../common'
import {shortOrderDay, orderOrderTimeShort, orderExpectTime} from '../../common/tool'
import {bindActionCreators} from "redux";

import Config from '../../config'

/**
 * The actions we need
 */
import * as orderActions from '../../reducers/order/orderActions'
import * as globalActions from '../../reducers/global/globalActions'
import {connect} from "react-redux";
import colors from "../../styles/colors";
import pxToDp from "../Alert/pxToDp";

/**
 * ## Redux boilerplate
 */

function mapStateToProps (state) {
    return {
        isFetching: state.isFetching,
        order: state.order,
        global: state.global,
    }
}

function mapDispatchToProps (dispatch) {
    return {
        actions: bindActionCreators({ ...orderActions, ...globalActions }, dispatch)
    }
}


class OrderScene extends PureComponent {

    static navigationOptions = ({navigation}) => ({
        headerTitle: '订单详情',
        headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
        headerTitleStyle: {color: '#111111',},
        headerRight: (
            <NavigationItem
                icon={require('../../img/Public/icon_navigationItem_share.png')}
                onPress={() => {

                }}
            />
        ),
    });

    constructor(props: Object) {
        super(props);

        this.state={
            isFetching: false,
        }

        this._onLogin = this._onLogin.bind(this)
    }

    /**
     * ### componentWillReceiveProps
     *
     * Since the Forms are looking at the state for the values of the
     * fields, when we we need to set them
     */
    componentWillReceiveProps (props) {

    }

    componentWillMount() {

        const orderId = (this.props.navigation.state.params||{}).orderId;

        console.log("params orderId:", orderId)

        InteractionManager.runAfterInteractions(() => {
        });

        if (!this.props.order || !this.props.order.id || this.props.order.id !== orderId) {
            this.props.actions.getOrder(this.props.global.accessToken, orderId)
            this.setState({order_id: orderId});
        } else {
            this.setState({
                order: this.props.order
            })
        }
    }

    render() {
        return (
            <View style={[styles.container, {flex: 1}]}>
                {/*<View style={{ position: 'absolute', width: screen.width, height: screen.height / 2, backgroundColor: color.theme }} />*/}
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isFetching}
                            onRefresh={() => this.onHeaderRefresh()}
                            tintColor='gray'
                        />
                    }>
                    {this.renderHeader()}
                    <SpacingView />
                    {this.renderGoods()}
                </ScrollView>
                <View style={{flexDirection: 'row', justifyContent: 'space-around', }}>
                    <Button title="联系配送"/>
                    <Button title="提醒送达"/>
                </View>
            </View>
        );
    }

    renderGoods() {

    }

    onHeaderRefresh() {
        //this.requestData()

        this.props.actions.getOrder(this.props.global.accessToken, this.state.order_id)
    }

    _onLogin() {
        this.props.navigation.navigate(Config.ROUTE_LOGIN, {next: Config.ROUTE_ORDER, nextParams:{orderId: this.state.order_id}})
    }

    renderHeader() {
        let info = {};
        const {order } = this.props.order;
        let self = this;

        let onButtonPress = () => {
            this.props.actions.updateOrder(
                this.props.order.id,
                this.props.profile.form.fields.username,
                this.props.profile.form.fields.email,
                this.props.global.currentUser)
        }

        return (
            <View style={styles.topContainer}>
                <View style={{backgroundColor: '#fff'}}>
                    <View style={styles.row}>
                        <Text style={{fontSize: pxToDp(32), color: colors.color333}}>{order.userName}</Text>
                        <Text style={{fontSize: pxToDp(24), color: colors.white, backgroundColor: colors.main_color, borderRadius:5}}>用户资料</Text>
                        <View style={{flex: 1}}/>
                        <Image style={styles.icon} source={require('../../img/Public/wx_yes_icon.png')}/>
                    </View>
                    <Text style={[styles.row, {fontSize: pxToDp(30), fontWeight: 'bold', color: colors.color666, marginTop: pxToDp(20)}]}>
                        {order.address}
                    </Text>
                    <View style={[styles.row, {paddingLeft: 0, marginLeft: 15}]}>
                        <Text style={{fontSize: pxToDp(22), fontWeight: 'bold', color: colors.white, backgroundColor: colors.main_color, borderRadius: 1}}>第{order.order_times}次</Text>
                        <TouchableOpacity><Text style={{fontSize: pxToDp(32), color: colors.mobile_color}}>{order.mobile}</Text></TouchableOpacity>
                        <View style={{flex: 1}}/>
                        <Image style={styles.icon} source={require('../../img/Public/icon_food_merchant_address_2x.png')}/>
                    </View>
                    <Separator style={{backgroundColor: colors.color999}}/>
                    <View style={[styles.row]}>
                        <Text style={styles.remarkText}>客户备注:</Text>
                        <Text style={[styles.remarkText, {marginLeft: 5}]}>您好，麻烦把我买的排骨用热水焯一下，不然差评！谢谢！</Text>
                    </View>
                    <View style={[styles.row, {marginRight: 40}]}>
                        <Text style={styles.remarkText}>商家备注:</Text>
                        <Text style={[styles.remarkText, {marginLeft: 5, marginRight:40}]}>好的，我们会切上葱段和生姜加上料酒，一定给您焯干净。</Text>
                    </View>
                </View>

                <View style={{marginTop: pxToDp(20), backgroundColor:'#f0f9ef'}}>
                    <View style={styles.row}>
                        <Text>{shortOrderDay(order.orderTime)}#{order.dayId}</Text>
                        <View style={{flex: 1}}/>
                        <Button title={order.storeName} style={{color:'#407c49'}}/>
                    </View>
                    <View style={styles.row}>
                        <Text>订单号：{order.id}</Text>
                        <View style={{flex: 1}}/>
                        <Text>期望送达 {orderExpectTime(order.expectTime)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text>{order.platform}#{order.platformId} {order.platform_oid}</Text>
                        <View style={{flex: 1}}/>
                        <Text>{orderOrderTimeShort(order.orderTime)}下单</Text>
                    </View>
                    <View style={{height: pxToDp(170), backgroundColor: colors.white, flexDirection: 'row',
                        justifyContent:'space-around'}}>
                        <View style={{flexDirection: 'column',}}>
                            <Text style={styles.stepText}>打包中</Text>
                            <Text style={styles.stepText}>刘子墨分拣</Text>
                            <Text style={styles.stepText}>27分钟前</Text>
                        </View>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={styles.stepText}>打包中</Text>
                            <Text style={styles.stepText}>刘子墨分拣</Text>
                            <Text style={styles.stepText}>27分钟前</Text>
                        </View>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={styles.stepText}>打包中</Text>
                            <Text style={styles.stepText}>刘子墨分拣</Text>
                            <Text style={styles.stepText}>27分钟前</Text>
                        </View>
                        <View style={{flexDirection: 'column'}}>
                            <Text style={styles.stepText}>打包中</Text>
                            <Text style={styles.stepText}>刘子墨分拣</Text>
                            <Text style={styles.stepText}>27分钟前</Text>
                        </View>
                    </View>
                </View>

                <View style={{marginTop: pxToDp(20), backgroundColor: colors.white}}>
                    <View style={styles.row}>
                        <Text>商品明细</Text>
                        <Text>{order.items.length}种商品</Text>
                        <View style={{flex: 1}}/>
                        <Button title="修改商品"/>
                        <Button title="下拉" style={{marginLeft: 10}}/>
                    </View>
                    {order.items.map((item, idx) => {
                        return (<View><View style={styles.row}>
                            <View style={{flex: 1}}>
                                <Text>{item.product_name}</Text>
                                <View style={{flexDirection: 'row'}}>
                                <Text>{item.price}</Text>
                                <Text style={{marginLeft: 30}}>{item.price * item.num}</Text>
                                </View>
                            </View>
                            <Text style={{alignSelf: 'flex-end'}}>X{item.num}</Text>
                        </View>
                            <Separator/>
                        </View>);
                    })}
                </View>

                <Separator/>

                <Separator/>

            </View>
        )
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.back_color,
    },
    icon: {
        width: 32,
        height: 32,
        alignItems: 'flex-end'
    },
    banner: {
        width: screen.width,
        height: screen.width * 0.5
    },
    row: {
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 15,
        alignContent: 'center',
        marginTop: pxToDp(14)
    },
    remarkText: {
        color: '#808080',
        fontWeight: 'bold',
        fontSize: pxToDp(24),
    },
    stepText: {
        textAlign: 'center'
    },
    buyButton: {
        backgroundColor: '#fc9e28',
        width: 94,
        height: 36,
        borderRadius: 7,
    },
    tagContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center'
    },
    tipHeader: {
        height: 35,
        justifyContent: 'center',
        borderWidth: screen.onePixel,
        borderColor: color.border,
        paddingVertical: 8,
        paddingLeft: 20,
        backgroundColor: 'white'
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderScene)