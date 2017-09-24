/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView,  Image} from 'react-native'
import {connect} from "react-redux";
import pxToDp from './pxToDp';
import LoadingView from '../../widget/LoadingView';

import * as alertActions from '../../reducers/alert/alertActions'
import * as globalActions from '../../reducers/global/globalActions'

import {bindActionCreators} from "redux";


/**
 * ## Redux boilerplate
 */

function mapStateToProps ({alert}) {
    return {
        type: alert.type,
        status: alert.status,
        result: alert.result
    }
}

function mapDispatchToProps (dispatch) {
    return {
        actions: bindActionCreators({ ...alertActions,...globalActions }, dispatch)
    }
}

// create a component
class AlertScene extends PureComponent {

    static navigationOptions = { title: 'Welcome', header: null };

    constructor(props) {
        super(props)
        this.state = {
            isProcessing:false
        }
        this.loadData = this.loadData.bind(this)
    }

    componentDidMount() {
        this.loadData();
    }

    loadData(){
        const self_ = this;
        this.setState({ isProcessing: true })
        this.props.actions.FetchAlert('19917687f923260dd9fa87caf0cf04a9cdb06a2d', '3', '0', 1)
            .then(()=>{
                self_.setState({isProcessing:false});
            });
    }


    render() {
        if (this.state.isProcessing){
            return (<LoadingView isLoading={this.state.isProcessing} tip='加载中'/>);
        }
        return (
            <ScrollableTabView tabBarActiveTextColor={"#333"} tabBarUnderlineStyle={{backgroundColor: "#59b26a"}} tabBarTextStyle={{fontSize: pxToDp(26)}}>
                <AlertList tabLabel={JSON.stringify((this.props.result||{}).desc)} />
                <AlertList tabLabel="催单/异常" />
                <AlertList tabLabel="售后单" />
                <AlertList tabLabel="其他" />
            </ScrollableTabView>
        );
    }
}
let ScrollableTabView = require('react-native-scrollable-tab-view');

// define your styles
const styles = StyleSheet.create({
});

class AlertList extends React.Component {
    render() {
        return (
            <ScrollView>
                <AlertRow />
                <AlertRow />
                <AlertRow />
                <AlertRow />
            </ScrollView>
        );
    }
}

class AlertRow extends React.Component {
    constructor() {
        super()
    }
    render() {
        return (
            <View style={top_styles.container}>
                <View style={[top_styles.order_box]}>
                    <View style={top_styles.box_top}>
                        <View style={[top_styles.order_head]}>
                            <Image style={[top_styles.icon_ji]} source={require('../../img/Alert/quick.png')} />
                            <View>
                                <Text style={top_styles.o_index_text}>0907#97</Text>
                            </View>
                            <View>
                                <Text style={top_styles.o_store_name_text}>回龙观</Text>
                            </View>
                            <Image style={[top_styles.icon_dropDown]} source={require('../../img/Alert/drop-down.png')} />
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
                        <Image style={[bottom_styles.icon_clock]}  source={require('../../img/Alert/clock.png')} />
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
        marginRight: pxToDp(5),
        width: pxToDp(35),
        height: pxToDp(35),
        marginTop: pxToDp(5),
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
//export default AlertScene;
export default connect(mapStateToProps, mapDispatchToProps)(AlertScene)
