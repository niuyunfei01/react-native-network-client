/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ListView, Image, StatusBar, FlatList } from 'react-native'
import pxToDp from './pxToDp';
import api from '../../api'



// create a component
class AlertScene extends PureComponent {

    state: {
        discounts: Array<Object>,
        dataList: Array<Object>,
        refreshing: boolean,
    }

    static navigationOptions = { title: 'Welcome', header: null };

    constructor(props: Object) {
        super(props)
        this.state = {
            discounts: [],
            dataList: [],
            refreshing: false,
        }

         { (this: any).requestData = this.requestData.bind(this) }
         { (this: any).keyExtractor = this.keyExtractor.bind(this) }
    }

    componentDidMount() {
        this.requestData()
    }

    requestData() {
        this.setState({ refreshing: true })

        this.requestDiscount()
        this.requestRecommend()
    }

    async requestRecommend() {
        try {
            let response = await fetch(api.recommend)
            let json = await response.json()

            let dataList = json.data.map(
                (info) => {
                    return {
                        id: info.id,
                        imageUrl: info.squareimgurl,
                        title: info.mname,
                        subtitle: `[${info.range}]${info.title}`,
                        price: info.price
                    }
                }
            )

            this.setState({
                dataList: dataList,
                refreshing: false,
            })
        } catch (error) {
            this.setState({ refreshing: false })
        }
    }

    async requestDiscount() {
        try {
            let response = await fetch(api.discount)
            let json = await response.json()
            this.setState({ discounts: json.data })
        } catch (error) {
            alert(error)
        }
    }


    keyExtractor(item: Object, index: number) {
        return item.id
    }

    render() {
        return (
            <App/>
            // {/*<View style={styles.container}>*/}
            //     {/*<NavBox/>*/}
            //     {/*<NodeBox/>*/}
            //     {/*<NodeBox/>*/}
            // {/*</View>*/}
        );
    }
}
let ScrollableTabView = require('react-native-scrollable-tab-view');

let App = React.createClass({
    render() {
        return (
            <ScrollableTabView>
                <ReactPage tabLabel="React" />
                <FlowPage tabLabel="Flow" />
                <JestPage tabLabel="Jest" />
            </ScrollableTabView>
        );
    }
});


class ReactPage extends React.Component {
    render() {
        return (
            <Text>Hello React</Text>
        );
    }
}
class FlowPage extends React.Component {
    render() {
        return (
            <Text>Hello Flow</Text>
        );
    }
}
class JestPage extends React.Component {
    render() {
        return (
            <Text>Hello Jest</Text>
        );
    }
}







// define your styles
const styles = StyleSheet.create({

});



class NavBox extends React.Component {
    constructor() {
        super()
    }
    render() {
        return (
            <View style={nav_styles.container}>
                <View style={nav_styles.nav_box}>
                    <View style={nav_styles.nav_bar}>
                        <Text style={nav_styles.nav_bar_text}>待退款</Text>
                    </View>
                    <View style={nav_styles.nav_bar}>
                        <Text style={nav_styles.nav_bar_text}>催单/异常</Text>
                    </View>
                    <View style={nav_styles.nav_bar}>
                        <Text style={nav_styles.nav_bar_text}>售后单</Text>
                    </View>
                    <View style={[nav_styles.nav_bar]}>
                        <Text style={[nav_styles.nav_bar_text, nav_styles.active_bar]}>其他</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const nav_styles = StyleSheet.create({
    nav_box: {
        height: pxToDp(78),
        backgroundColor: '#e6e6e6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nav_bar: {
        height: pxToDp(74),
        flex: 1,
        justifyContent: 'space-between',
    },
    nav_bar_text: {
        height: pxToDp(78),
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    active_bar: {
        fontWeight: 'bold',
        borderBottomWidth: 4,
        borderBottomColor: '#59b26a',
    },
});

class NodeBox extends React.Component {
    constructor() {
        super()
    }
    render() {
        return (
            <View style={top_styles.container}>
                <View style={[top_styles.order_box]}>
                    <View style={top_styles.box_top}>
                        <View style={[top_styles.order_head]}>
                            <Image style={[top_styles.icon_ji]} source={{uri: 'https://facebook.github.io/react/img/logo_og.png',}} />
                            <View>
                                <Text style={top_styles.o_index_text}>0907#97</Text>
                            </View>
                            <View>
                                <Text style={top_styles.o_store_name_text}>回龙观</Text>
                            </View>
                            <Image style={[top_styles.icon_dropDown]} source={{uri: 'https://facebook.github.io/react/img/logo_og.png',}} />
                        </View>
                        <View style={[top_styles.order_body]}>
                            <Text style={[top_styles.order_body_text]}>
                                <Text style={top_styles.o_operate}> 加货 </Text>
                                <Text style={top_styles.o_content}>
                                    糖三角*2 鸡胸肉糖三角*2 鸡胸肉糖三角*2 鸡胸肉糖三角*2 鸡胸肉糖三角*2 鸡胸肉糖三角*2 鸡胸肉糖三角*2 鸡胸肉
                                </Text>

                            </Text>
                            <View style={[top_styles.ship_status]}>
                                <Text style={[top_styles.ship_status_text]}>在途</Text>
                            </View>
                        </View>
                    </View>
                    <View style={bottom_styles.container}>
                        <View style={bottom_styles.time_date}>
                            <Text style={bottom_styles.time_date_text}>9/20</Text>
                        </View>
                        <View>
                            <Text style={bottom_styles.time_start}>17.50生成</Text>
                        </View>
                        <Image style={[bottom_styles.icon_clock]} source={{uri: 'https://facebook.github.io/react/img/logo_og.png',}} />
                        <View>
                            <Text style={bottom_styles.time_end}>18:30</Text>
                        </View>
                        <View style={bottom_styles.operator}>
                            <Text style={bottom_styles.operator_text}>处理人：XXX</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const top_styles = StyleSheet.create({
    container:{
        backgroundColor:'#f2f2f2',
    },
    order_box: {
        backgroundColor: '#fff',
        marginHorizontal: pxToDp(0),
        marginVertical: pxToDp(5),
    },
    active: {
        borderWidth: pxToDp(1),
        borderColor: '#000',
    },
    box_top: {
        marginVertical: pxToDp(12),
        marginHorizontal: pxToDp(20),
    },

    order_head: {
        marginBottom: pxToDp(20),
        height: pxToDp(50),
        flexDirection: 'row',
        // backgroundColor: 'red',
    },

    icon_ji: {
        width: pxToDp(35),
        height: pxToDp(35),
        alignSelf: 'center',
        marginRight: pxToDp(5),
    },
    o_index_text: {
        color: '#666',
        fontSize: pxToDp(32),
        fontWeight: 'bold',
        textAlignVertical: 'center',
    },
    o_store_name_text: {
        height: pxToDp(50),
        textAlignVertical: 'center',
        fontSize: pxToDp(28),
        color: '#999',
        paddingLeft: pxToDp(30),
    },
    icon_dropDown: {
        width: pxToDp(70),
        height: pxToDp(50),
        position: 'absolute',
        right: 0,
    },


    order_body: {
        // backgroundColor: 'green',
    },
    order_body_text: {
        fontSize: pxToDp(30),
        color: '#333',
    },
    o_operate: {
        fontWeight: 'bold',
    },
    o_content: {
        fontWeight: 'bold',
        lineHeight: pxToDp(42),
    },
    ship_status: {
        alignSelf: 'flex-end',
    },
    ship_status_text: {
        fontSize: pxToDp(26),
        color: '#999',
    },
});

const bottom_styles = StyleSheet.create({
    container:{
        height: pxToDp(70),
        borderTopWidth: 1,
        borderTopColor: '#999',
        paddingHorizontal: pxToDp(20),
        flexDirection:'row',
    },

    time_date: {
        marginRight: pxToDp(10),
    },
    time_date_text: {
        color: '#4d4d4d',
        fontSize: pxToDp(28),
        height: pxToDp(70),
        textAlignVertical: 'center',
    },
    time_start: {
        color: '#999',
        fontSize: pxToDp(28),
        height: pxToDp(70),
        textAlignVertical: 'center',
    },
    icon_clock: {
        marginLeft: pxToDp(70),
        width: pxToDp(40),
        height: pxToDp(40),
        alignSelf: 'center',
    },
    time_end: {
        color: '#db5d5d',
        fontSize: pxToDp(34),
        height: pxToDp(70),
        textAlignVertical: 'center',
    },
    operator: {
        position: 'absolute',
        right: pxToDp(20),
    },
    operator_text: {
        fontSize: pxToDp(28),
        height: pxToDp(70),
        textAlignVertical: 'center',
    },
});

//make this component available to the app
export default AlertScene;
