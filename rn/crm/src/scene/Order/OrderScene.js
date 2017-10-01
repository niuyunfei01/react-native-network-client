/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, InteractionManager, RefreshControl } from 'react-native'
import { color, NavigationItem, RefreshListView, RefreshState, Separator, SpacingView } from '../../widget'
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
import {Button, ButtonArea, Toast, Msg, Dialog} from "../../weui/index";
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

const hasRemark = (order) => (!!order.user_remark) || (!!order.store_remark)

class OrderScene extends PureComponent {

    static navigationOptions = ({navigation}) => ({
        headerTitle: '订单详情',
        headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
        headerTitleStyle: {color: '#111111',},
        headerRight: (<View style={{flexDirection: 'row'}}>
            <NavigationItem
                icon={require('../../img/Order/print.png')}
                onPress={() => {

                }}
            /><NavigationItem
            icon={require('../../img/Public/menu.png')}
            onPress={() => {

            }}
            />
        </View>),
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

        return !order ? <Text>Empty Order, refreshing</Text>
            :
            (
            <View style={styles.topContainer}>
                <View style={{backgroundColor: '#fff'}}>
                    <View style={[styles.row, {height: pxToDp(40), alignItems:'center'}]}>
                        <Text style={{fontSize: pxToDp(32), color: colors.color333}}>{order.userName}</Text>
                        <TouchableOpacity>
                        <Image source={require('../../img/Order/profile.png')} style={{width: pxToDp(152), height: pxToDp(40), alignSelf: 'center', marginLeft: pxToDp(20)}}/>
                        </TouchableOpacity>
                        <View style={{flex: 1}}/>
                        <Image style={styles.icon} source={require('../../img/Order/talk.png')}/>
                    </View>
                    <Text style={[styles.row, {fontSize: pxToDp(30), fontWeight: 'bold', color: colors.color666, marginTop: pxToDp(20), marginRight: pxToDp(114 + 20)}]}>
                        {order.address}
                    </Text>
                    <View style={[styles.row, {paddingLeft: 0, marginBottom: pxToDp(14)}]}>
                        <TouchableOpacity style={{width: pxToDp(96), height: pxToDp(42), backgroundColor: colors.main_color, borderRadius: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: pxToDp(22), fontWeight: 'bold', color: colors.white}}>第{order.order_times}次</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flexDirection: 'row', marginLeft: pxToDp(14)}}>
                            <Text style={{fontSize: pxToDp(32), color: colors.mobile_color}}>{order.mobile}</Text>
                            <CallImg/>
                        </TouchableOpacity>
                        <View style={{flex: 1}}/>
                        <Image style={styles.icon} source={require('../../img/Order/navi.png')}/>
                    </View>
                    {(order.user_remark && order.store_remark) &&
                    <Separator style={{backgroundColor: colors.color999}}/>}

                    { hasRemark(order) &&
                    <View style={[styles.row, {marginBottom: pxToDp(14), flexDirection: 'column'}]}>
                        {!!order.user_remark &&
                        <Remark label="客户备注" remark={order.user_remark}/>}
                        {!!order.store_remark &&
                        <Remark label="商家备注" remark={order.store_remark}/>}
                    </View>}

                </View>

                <View style={{marginTop: pxToDp(20), backgroundColor:'#f0f9ef'}}>
                    <View style={styles.row}>
                        <Text>{shortOrderDay(order.orderTime)}#{order.dayId}</Text>
                        <View style={{flex: 1}}/>
                        <Text>{order.store_name}</Text>
                        <CallImg/>
                    </View>
                    <View style={styles.row}>
                        <Text>订单号：{order.id}</Text>
                        <View style={{flex: 1}}/>
                        <Text>期望送达 {orderExpectTime(order.expectTime)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text>{order.pl_name}#{order.platformId} {order.platform_oid}</Text>
                        <View style={{flex: 1}}/>
                        <Text>{orderOrderTimeShort(order.orderTime)}下单</Text>
                    </View>
                    <View style={{height: pxToDp(170), backgroundColor: colors.white, flexDirection: 'row',
                        justifyContent:'space-around'}}>
                        <OrderStep/>
                        <OrderStep/>
                        <OrderStep/>
                        <OrderStep/>

                    </View>
                </View>

                <View style={{marginTop: pxToDp(20), backgroundColor: colors.white}}>
                    <View style={styles.row}>
                        <Text>商品明细</Text>
                        <Text>{(order.items||{}).length}种商品</Text>
                        <View style={{flex: 1}}/>
                        <Button title="修改商品"/>
                        <Button title="下拉" style={{marginLeft: 10}}/>
                    </View>
                    {(order.items||{}).map((item, idx) => {
                        return (<View key={idx}><View style={styles.row}>
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

class CallImg extends PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return <Image source={require('../../img/Public/call.png')} style={styles.callIcon}/>;
    }
}

class Remark extends  PureComponent {

    constructor(props) {
        super(props)
    }

    render() {
        const {label, remark} = this.props;
        return (<View style={{flexDirection: 'row'}}>
            <Text style={styles.remarkText}>{label}:</Text>
            <Text style={[styles.remarkText, styles.remarkTextBody]}>{remark}</Text>
        </View>)
    }
}

class OrderStep extends PureComponent {

    constructor(props) {
        super(props)
    }

    render() {
        return <View style={{flexDirection: 'column', flex: 1, alignItems:'center'}}>
            <View style={{borderColor: colors.main_color, height: pxToDp(4), width: '100%', borderTopWidth: pxToDp(4), marginTop: pxToDp(10), position: 'absolute', top: pxToDp(-20)}}></View>
            <View style={[{borderRadius: pxToDp(10), padding: pxToDp(10), width:pxToDp(10), height:pxToDp(10), backgroundColor: colors.main_color, position: 'absolute', top: pxToDp(2)}]}/>
            <Text style={styles.stepText}>打包中</Text>
            <Text style={styles.stepText}>刘子墨分拣</Text>
            <Text style={styles.stepText}>27分钟前</Text>
        </View>;
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.back_color,
    },
    icon: {
        width: pxToDp(74),
        height: pxToDp(56),
        alignItems: 'flex-end'
    },
    callIcon: {
        width: pxToDp(20),
        height: pxToDp(28),
        marginLeft: pxToDp(6)
    },
    banner: {
        width: screen.width,
        height: screen.width * 0.5
    },
    row: {
        flexDirection: 'row',
        marginLeft: pxToDp(30),
        marginRight: pxToDp(40),
        alignContent: 'center',
        marginTop: pxToDp(14)
    },
    remarkText: {
        color: '#808080',
        fontWeight: 'bold',
        fontSize: pxToDp(24),
    },
    remarkTextBody: {
        marginLeft: pxToDp(6), marginRight: pxToDp(140)
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