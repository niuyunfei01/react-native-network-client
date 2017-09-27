/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl} from 'react-native'
import {connect} from "react-redux";
import pxToDp from './pxToDp';
import LoadingView from '../../widget/LoadingView';

import * as alertActions from '../../reducers/alert/alertActions'
import * as globalActions from '../../reducers/global/globalActions'

import {bindActionCreators} from "redux";
let ScrollableTabView = require('react-native-scrollable-tab-view');

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
        super(props);
        this.state = {
            isProcessing : false,
            type: 5,
            group_num: {},
        };
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    componentWillMount() {
        // this.loadData();
    }

    loadData(type, page = 1, status = 0){
        console.log('load_data_type => ', type, this.state.type);
        let search_type = type ? type : this.state.type;
        const self_ = this;
        this.props.actions.FetchAlert('19917687f923260dd9fa87caf0cf04a9cdb06a2d', search_type, status, page).then(()=>{
            let result = this.props.result;
            if(result.ok){
                let {total_num} = result.obj;
                self_.setState({
                    type: search_type,
                    group_num: total_num,
                });
            } else {
                self_.setState({
                    type: search_type,
                });
            }
        });
    }

    render() {
        let group_num = this.state.group_num;
        let type = this.state.type;
        let result = this.props.result;
        console.log('in render group_num => ', group_num);
        console.log('in render type => ', type);
        console.log('in render result => ', result);
        // let total_page = 0;
        // let curr_page = 0;
        // if(result.ok){
        //     let {curr_page, total_page} = result.obj;
        //     console.log('in_render_before_view', curr_page, total_page);
        // }

        return (
            <ScrollableTabView
                tabBarActiveTextColor={"#333"}
                tabBarUnderlineStyle={{backgroundColor: "#59b26a"}}
                tabBarTextStyle={{fontSize: pxToDp(26)}} onChangeTab={(obj) => {
                    if (obj.i == 0) {
                        type = 5;//用户申请退款
                    } else if (obj.i == 1) {
                        type = 4;//催单
                    } else if (obj.i == 2) {
                        type = 1;//待处理评价
                    } else if (obj.i == 3) {
                        type = 3;//其他事项
                    }
                    this.setState({
                        type: type,
                    });
                    if (this.state.type !== type) {
                        this.loadData(type);
                    }
                }}
                locked={true}
            >
                <AlertList
                    tabLabel={group_num.refund_type > 0 ? "待退款("+group_num.refund_type+")" : "待退款"}
                    result={result}
                    alert_type={type}
                    callbackParent={this.loadData}
                    // total_page={total_page}
                    // curr_page={curr_page}
                />
                <AlertList
                    tabLabel={group_num.remind_type > 0 ? "催单/异常("+group_num.remind_type+")" : "催单/异常"}
                    result={result}
                    alert_type={type}
                    callbackParent={this.loadData}
                    // total_page={total_page}
                    // curr_page={curr_page}
                />
                <AlertList
                    tabLabel={group_num.complain_type > 0 ? "售后单("+group_num.complain_type+")" : "售后单"}
                    result={result}
                    alert_type={type}
                    callbackParent={this.loadData}
                    // total_page={total_page}
                    // curr_page={curr_page}
                />
                <AlertList
                    tabLabel={group_num.other_type > 0 ? "其他("+group_num.other_type+")" : "其他"}
                    result={result}
                    alert_type={type}
                    callbackParent={this.loadData}
                    // total_page={total_page}
                    // curr_page={curr_page}
                />
            </ScrollableTabView>
        );
    }
}

class AlertList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            loadMore: false,
            result: [],
            list_pages: [],
        };
        this._onRefresh = this._onRefresh.bind(this);
        this._onScroll = this._onScroll.bind(this);
    }

    _onRefresh() {
        this.setState({isRefreshing: true});
        console.log('alert_type', this.props.alert_type);
        this.props.callbackParent(this.props.alert_type);
        setTimeout(() => {
            this.setState({
                isRefreshing: false,
            });
        }, 1000);
    }

    _onScroll(event) {
        let {curr_page, total_page} = this.state;
        if(this.state.loadMore || curr_page >= total_page){
            return;
        }
        let next_page = curr_page+1;
        let y = event.nativeEvent.contentOffset.y;
        let height = event.nativeEvent.layoutMeasurement.height;
        let contentHeight = event.nativeEvent.contentSize.height;
        if(y+height>=contentHeight-20){
            this.props.callbackParent(this.props.alert_type, next_page);
            this.setState({
                loadMore:true
            });
            console.log('lodeMore......');
        }
    }

    componentWillReceiveProps(){
        let result = this.props.result;
        if(result.ok){
            let {curr_page, total_page, list} = result.obj;
            let list_pages = this.state.list_pages;
            console.log('list_pages => ', list_pages);
            if(list_pages.indexOf(curr_page) === -1){
                list_pages.push(curr_page);
                console.log('list_pages => ', list_pages);
            }
            this.setState({
                result: result,
                curr_page: curr_page,
                total_page: total_page,
            });
        }
    }

    render() {
        let result = this.state.result || {};
        if(result.ok){
            let {curr_page, total_page, list} = result.obj;
            console.log('in_alert_list_render:', curr_page, total_page);
            let alert_list = Array.from(list);
            let alert_row = alert_list.map(function (row, index) {
                return (
                    <AlertRow alert_detail={row} key={index}/>
                );
            });
            return (
                <ScrollView refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this._onRefresh}
                        tintColor={'gray'}
                    />}
                    onScroll={this._onScroll}
                    scrollEventThrottle={50}
                >
                    {alert_row}
                </ScrollView>
            );
        }else{
            return (
                <LoadingView isLoading={true} tip='加载中...'/>
            );
        }
    }
}

class AlertRow extends React.Component {
    static get defaultProps() {
        return {
            alert_detail: {},

        }
    }

    _onPressButton(id){
        alert(id);
    }

    render() {
        let row = this.props.alert_detail;
        if(row){
            // {"order_id":"653848","remark":"饿了么 望京 南湖西园 用户 赵佳玮 的 59 号订单 催单了, 请尽快处理","delegation_to":"830885","created_by":"0","deleted":"0","created":"2017-09-06 17:47:11","modified":"2017-09-06 17:47:11","remind_id":"532151529","orderTime":"2017-09-06 16:59:40","store_id":"望京","dayId":"59","orderStatus":"已送达","orderDate":"0906","delegation_to_user":"吴冬梅","noticeDate":"09\/06","noticeTime":"17:47","expect_end_time":"18:17","quick":false}]}}
            return (
                <View style={top_styles.container}>
                    <View style={[top_styles.order_box]}>
                        <View style={top_styles.box_top}>
                            <View style={[top_styles.order_head]}>
                                {row.quick ? <Image style={[top_styles.icon_ji]} source={require('../../img/Alert/quick.png')} /> : null}
                                <View>
                                    <Text style={top_styles.o_index_text}>{row.noticeDate}#{row.dayId}</Text>
                                </View>
                                <View>
                                    <Text style={top_styles.o_store_name_text}>{row.store_id}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[top_styles.icon_dropDown]}
                                    onPress={() => this._onPressButton(row.order_id)}
                                    activeOpacity={0.7} >
                                    <Image
                                        style={[top_styles.icon_dropDown]}
                                        source={require('../../img/Alert/drop-down.png')} />
                                </TouchableOpacity>
                            </View>
                            <View style={[top_styles.order_body]}>
                                <Text style={[top_styles.order_body_text]}>
                                    <Text style={top_styles.o_content}>
                                        {row.remark}
                                    </Text>

                                </Text>
                                <View style={[top_styles.ship_status]}>
                                    <Text style={[top_styles.ship_status_text]}>{row.orderStatus}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={bottom_styles.container}>
                            <View style={bottom_styles.time_date}>
                                <Text style={bottom_styles.time_date_text}>{row.noticeDate}</Text>
                            </View>
                            <View>
                                <Text style={bottom_styles.time_start}>{row.noticeTime}生成</Text>
                            </View>
                            <Image style={[bottom_styles.icon_clock]}  source={require('../../img/Alert/clock.png')} />
                            <View>
                                <Text style={bottom_styles.time_end}>{row.expect_end_time}</Text>
                            </View>
                            <View style={bottom_styles.operator}>
                                <Text style={bottom_styles.operator_text}>
                                    处理人：{row.delegation_to_user}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <Text>数据加载异常</Text>
            );
        }
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
// export default AlertScene;
export default connect(mapStateToProps, mapDispatchToProps)(AlertScene)
