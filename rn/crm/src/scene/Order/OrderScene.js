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

// create a component
class OrderScene extends PureComponent {

    state: {
        info: Object,
        isRefreshing: false
    }

    static navigationOptions = ({ navigation }) => ({
        headerTitle: '订单详情',
        headerStyle: { backgroundColor: 'white' },
        headerRight: (
            <NavigationItem
                icon={{uri: '../../img/Public/icon_navigationItem_share.png'}}
                onPress={() => {

                }}
            />
        ),
    });

    constructor(props: Object) {
        super(props);

        this.state = {
            info: {},
            isRefreshing: false
            // dataSource: ds.cloneWithRows([]),
        }
    }

    componentDidMount() {

        InteractionManager.runAfterInteractions(() => {
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ position: 'absolute', width: screen.width, height: screen.height / 2, backgroundColor: color.theme }} />
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
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
        this.requestData()
    }

    renderHeader() {
        let info = {}; //this.props.navigation.state.params.info
        return (
            <View>
                <View>

                    <Text>王若曲女士</Text>
                    <Button>15600003456</Button>
                    <Text>第2次</Text>
                    <Text>#33</Text>
                    <Image style={styles.icon} source={require('../../img/Public/wx_yes_icon.png')}/>

                    <Paragraph>
                        国风美唐二期回龙观东大街科星西路5号楼3单元
                    </Paragraph>
                    <Button>地图</Button>
                    <Button>呼叫门店</Button>

                    <Paragraph>期望配送：<Text> 2017-07-09 10:11</Text></Paragraph>
                    <Paragraph>支付方式：<Text> 在线支付</Text></Paragraph>

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
                        title='立即抢购'
                        style={{ color: 'white', fontSize: 18 }}
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

    info () {
        return {id: 655439}
    }

    async requestData() {

        this.setState({
            isRefreshing: true
        })

        let info = this.info(); //this.props.navigation.state.params.info
        let response = await fetch(orderUrlWithId(info.id))
        let json = await response.json()

        this.setState({
            isRefreshing: false
        })
    }

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

//make this component available to the app
export default OrderScene;