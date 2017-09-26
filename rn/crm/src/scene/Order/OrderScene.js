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
import { screen, system, tool } from '../../common'
import api, { orderUrlWithId} from '../../api'
import {bindActionCreators} from "redux";

/**
 * The actions we need
 */
import * as orderActions from '../../reducers/order/orderActions'
import * as globalActions from '../../reducers/global/globalActions'
import {connect} from "react-redux";

/**
 * ## Redux boilerplate
 */

function mapStateToProps (state) {
    return {
        isFetching: state.isFetching,
        order_id: state.order_id,
        order: state.order,
        global: {
            currentUser: state.global.currentUser,
            currentState: state.global.currentState,
            showState: state.global.showState
        }
    }
}

function mapDispatchToProps (dispatch) {
    return {
        actions: bindActionCreators({ ...orderActions, ...globalActions }, dispatch)
    }
}

class OrderScene extends PureComponent {

    static access_token = '19917687f923260dd9fa87caf0cf04a9cdb06a2d';

    static navigationOptions = ({ navigation }) => ({
        headerTitle: '订单详情',
        headerStyle: { backgroundColor: 'white' },
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
    }

    /**
     * ### componentWillReceiveProps
     *
     * Since the Forms are looking at the state for the values of the
     * fields, when we we need to set them
     */
    componentWillReceiveProps (props) {

    }

    componentDidMount() {
        // this.requestData();

        const order_id = (this.props.navigation.state.params||{}).order_id;//this.props.navigation.state.params.order_id;

        InteractionManager.runAfterInteractions(() => {
        });

        if (!this.props.order || !this.props.order.id || this.props.order.id !== order_id) {
            this.props.actions.getOrder(OrderScene.access_token, order_id)
            this.setState({order_id: order_id});
        } else {
            this.setState({
                order: this.props.order
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>
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
            </View>
        );
    }

    renderGoods() {

    }

    onHeaderRefresh() {
        //this.requestData()

        this.props.actions.getOrder(OrderScene.access_token, this.state.order_id)
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
            <View>
                <View>
                    <View style={{flexDirection: 'column'}}>
                    <Paragraph>{order.userName}</Paragraph>
                    <Button>{order.mobile}</Button>
                    <Paragraph>第{order.order_times}次</Paragraph>
                    <Paragraph>#{order.dayNo}</Paragraph>
                        <View style={{ flex: 1 }} />
                    <Image style={styles.icon} source={require('../../img/Public/wx_yes_icon.png')}/>
                    </View>

                    <Paragraph>
                        {order.address}
                    </Paragraph>
                    <Button>地图</Button>
                    <Button>呼叫门店</Button>

                    <Paragraph>期望配送：<Text> {order.expectTime}</Text></Paragraph>
                    <Paragraph>支付方式：<Text> {order.paid_done === '1' ? '在线支付':'货到付款'}</Text></Paragraph>

                </View>

                <Separator />

                <View>
                    <View style={styles.tagContainer}>
                        <Image style={{ width: 20, height: 20 }} source={require('../../img/Home/icon_deal_anytime_refund.png')} />
                        <Paragraph style={{ color: '#89B24F' }}>  随时退</Paragraph>
                        <View style={{ flex: 1 }} />
                        <Paragraph>已售{1234}</Paragraph>
                    </View>

                </View>

                <Separator/>

                <View>
                    <Heading1>订单状态： 已送达</Heading1>
                    <Paragraph>订单号：659864（饿了么回龙观-300093902094802）</Paragraph>
                    <Paragraph>下单时间： 2017-09-22</Paragraph>
                </View>

                <Separator/>

                <View style={styles.topContainer}>
                    <Heading1 style={{ color: color.theme }}>￥</Heading1>
                    <HeadingBig style={{ marginBottom: -8 }}>{info.price}</HeadingBig>
                    <Paragraph style={{ marginLeft: 10 }}>门市价：￥{(info.price * 1.1).toFixed(0)}</Paragraph>
                    <View style={{ flex: 1 }} />
                    <Button
                        title='延迟送达'
                        style={{ color: 'white', fontSize: 18 }}
                        onPress={onButtonPress}
                        containerStyle={styles.buyButton}
                    />
                </View>

                <SpacingView />

                <View style={styles.tipHeader}>
                    <Heading2>看了本团购的用户还看了</Heading2>
                </View>
            </View>
        )
    }

    // info () {
    //     return {id: 655439}
    // }

    // async requestData() {
    //
    //     this.setState({
    //         isRefreshing: true
    //     })
    //
    //     let info = this.info(); //this.props.navigation.state.params.info
    //     let response = await fetch(orderUrlWithId(info.id))
    //     let json = await response.json()
    //
    //     console.log(json)
    //
    //     this.setState({
    //         isRefreshing: false,
    //         order: json
    //     })
    // }

    async requestRecommend() {
        try {
            let info = this.info(); //this.props.navigation.state.params.info
            let response = await fetch(orderUrlWithId(info.id))
            let json = await response.json()

            console.log(JSON.stringify(json));

            let dataList = json.data.items.map((info) => {
                return {
                    id: info.id,
                    imageUrl: info.imgurl,
                    title: info.brandname,
                    subtitle: `[${info.range}]${info.title}`,
                    price: info.price
                }
            })

            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(dataList)
            })
            setTimeout(() => {
            }, 500);
        } catch (error) {
        }
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
    topContainer: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
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