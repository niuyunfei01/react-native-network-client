/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl} from 'react-native';
import {connect} from "react-redux";
import pxToDp from './pxToDp';
import LoadingView from '../../widget/LoadingView';

import * as alertActions from '../../reducers/alert/alertActions'
import * as globalActions from '../../reducers/global/globalActions'

import {bindActionCreators} from "redux";
let ScrollableTabView = require('react-native-scrollable-tab-view');
import ModalDropdown from 'react-native-modal-dropdown';

/**
 * ## Redux boilerplate
 */

function mapStateToProps ({alert, global}) {
    return {
        type: alert.type,
        status: alert.status,
        result: alert.result,
        accessToken: global.accessToken
    }
}

function mapDispatchToProps (dispatch) {
    return {
        actions: bindActionCreators({ ...alertActions,...globalActions }, dispatch)
    }
}

const tab_list = new Map([
    ['refund_type' , '待退款'],
    ['remind_type' , '催单/异常'],
    ['complain_type' , '售后单'],
    ['other_type' , '其他'],
]);

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

    }

    componentWillMount() {
        this.loadData();
    }

    loadData(type, page = 1, status = 0){
        // console.log('load_data_type => ', type, this.state.type);
        let search_type = type ? type : this.state.type;
        if(search_type > 0){
            this.setState({
                isProcessing: true,
            });
            let self_ = this;
            this.props.actions.FetchAlert(this.props.accessToken, search_type, status, page, ((result)=>{
                console.log('=====>', result);
                if(result.ok){
                    let {total_num} = result.obj;
                    self_.setState({
                        type: search_type,
                        group_num: total_num,
                        isProcessing: false,
                    });
                } else {
                    self_.setState({
                        type: search_type,
                        isProcessing: false,
                    });
                }
            }));
        } else {
            alert('查询参数有误!');
        }
    }

    render() {

        let {group_num, type, isProcessing} = this.state;
        let result = this.props.result;

        /*console.log("item => ",group_num);
        let AlertLists = [];
        let group_num_key = 1;
        for(let type_bar in group_num){
            if (group_num.hasOwnProperty(type_bar) === true){
                let type_num = group_num[type_bar];
                let tab_text = tab_list.get(type_bar);
                console.log("tab_text => ",tab_text);
                AlertLists.push(<AlertList key={group_num_key}
                    tabLabel={type_num > 0 ? tab_text+"("+type_num+")" : tab_text}
                    result={result}
                    alert_type={type}
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                />);
                group_num_key++;
            }
        }*/

        return (
            <ScrollableTabView
                tabBarActiveTextColor={"#333"}
                tabBarUnderlineStyle={{backgroundColor: "#59b26a"}}
                tabBarTextStyle={{fontSize: pxToDp(26)}} onChangeTab={(obj) => {
                    let tab_bar = obj.i;
                    if (tab_bar === 0) {
                        type = 5;//用户申请退款
                    } else if (tab_bar === 1) {
                        type = 4;//催单
                    } else if (tab_bar === 2) {
                        type = 1;//待处理评价
                    } else if (tab_bar === 3) {
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
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                />
                <AlertList
                    tabLabel={group_num.remind_type > 0 ? "催单/异常("+group_num.remind_type+")" : "催单/异常"}
                    result={result}
                    alert_type={type}
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                />
                <AlertList
                    tabLabel={group_num.complain_type > 0 ? "售后单("+group_num.complain_type+")" : "售后单"}
                    result={result}
                    alert_type={type}
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                />
                <AlertList
                    tabLabel={group_num.other_type > 0 ? "其他("+group_num.other_type+")" : "其他"}
                    result={result}
                    alert_type={type}
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                />
            </ScrollableTabView>
        );
    }
}

class AlertList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            loadMore: false,
            result: [],
            list_pages: [],
            data_list: [],
            alert_type: this.props.alert_type,
        };
        this._onRefresh = this._onRefresh.bind(this);
        this._onScroll = this._onScroll.bind(this);
    }

    _onRefresh() {
        let {isRefreshing} = this.state;
        let {isProcessing} = this.props;
        if(isRefreshing || isProcessing){
            return;
        }
        this.setState({
            // isRefreshing: true,
            data_list: [],
            list_pages: [],
            result: [],
        });
        this.props.callbackLoadData(this.props.alert_type);
        // this.setState({
        //     isRefreshing: false,
        // });
    }

    _onScroll(event) {
        let {curr_page, total_page, loadMore, list_pages} = this.state;
        let {isProcessing} = this.props;
        let next_page = parseInt(curr_page)+1;
        if(loadMore || isProcessing || curr_page >= total_page || list_pages.indexOf(next_page) !== -1){
            if(loadMore && !isProcessing){
                this.setState({
                    loadMore: false,
                });
            }
            return;
        }
        let y = event.nativeEvent.contentOffset.y;
        let height = event.nativeEvent.layoutMeasurement.height;
        let contentHeight = event.nativeEvent.contentSize.height;
        if(y+height>=contentHeight-10){
            this.setState({
                loadMore:true
            });

            this.props.callbackLoadData(this.props.alert_type, next_page);
        }
    }

    componentWillReceiveProps(){
        let {result} = this.props;//{ ok: 0, desc: '系统异常，请求超时，请重新尝试', obj: null }
        let new_alert_type = this.props.alert_type;
        let {list_pages, data_list, alert_type} = this.state;
        if(result.ok){
            let {curr_page, total_page, list} = result.obj;
            if(list_pages.indexOf(curr_page) === -1){//不存在
                if(parseInt(curr_page) === 1 || alert_type !== new_alert_type){
                    data_list = [];
                    list_pages = [];
                }
                list_pages.push(curr_page);
                data_list.push.apply(data_list, list);
                console.log('list_pages => ', list_pages);
                // console.log('data_list => ', data_list);

                this.setState({
                    result: result,
                    curr_page: curr_page,
                    total_page: total_page,
                    data_list: data_list,
                    alert_type: this.props.alert_type,
                });
            }
        } else {
            if(result.length > 0 && !result.ok){
                console.log('error_result =>', result);
                alert(result.desc);
            }
        }
    }

    render() {
        let {data_list, loadMore, isRefreshing} = this.state;
        let {isProcessing, result} = this.props;
        if(isRefreshing){
            return (
                <LoadingView isLoading={true} tip='加载中...'/>
            );
        }
        if(data_list.length === 0){
            //返回没有订单的图片
            // if(result.length > 0 && !result.ok){
            //     alert(result);
            // }
        }

        let alert_row = data_list.map(function (row, index) {
            return (
                <AlertRow alert_detail={row} key={index}/>
            );
        });
        return (
            <ScrollView refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={this._onRefresh}
                    tintColor={'gray'}
                />}
                onScroll={this._onScroll}
                scrollEventThrottle={50}
            >
                {alert_row}

                {isProcessing || loadMore ?
                    <View style={{height: pxToDp(20), marginBottom: pxToDp(20)}}>
                        <Text style={{textAlign: 'center', textAlignVertical: 'center', fontWeight: 'bold', }}>加载中...</Text>
                    </View>
                    : null}
            </ScrollView>
        );
    }
}

class AlertRow extends PureComponent {
    static get defaultProps() {
        return {
            alert_detail: {},

        }
    }

    constructor(props) {
        super(props);
    }

    _onPressSelect(index, order_id){
        console.log('_onPressSelect =====>', index, order_id);
        if(parseInt(index) === 0){
            alert(order_id+'暂停提示');
        } else {
            alert(order_id+'强制关闭');
        }
        return false;
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
                                    <Text style={top_styles.o_index_text}>{row.orderDate}#{row.dayId}</Text>
                                </View>
                                <View>
                                    <Text style={top_styles.o_store_name_text}>{row.store_id}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[top_styles.icon_dropDown]}
                                >
                                    <ModalDropdown
                                        options={['暂停提示', '强制关闭']}
                                        defaultValue={''}
                                        style={top_styles.drop_style}
                                        dropdownStyle={top_styles.drop_listStyle}
                                        dropdownTextStyle={top_styles.drop_textStyle}
                                        dropdownTextHighlightStyle={top_styles.drop_optionStyle}
                                        onSelect={(event) => this._onPressSelect(event, row.order_id)}
                                    >
                                        <Image
                                            style={[top_styles.icon_img_dropDown]}
                                            source={require('../../img/Alert/drop-down.png')} />
                                    </ModalDropdown>
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
        width: pxToDp(88),
        height: pxToDp(55),
        position: 'absolute',
        right: 0,
        // backgroundColor: 'green',
    },
    icon_img_dropDown: {
        width: pxToDp(88),
        height: pxToDp(55),
    },
    drop_style: {//和背景图片同框的按钮的样式
        width: pxToDp(88),
        height: pxToDp(55),
    },
    drop_listStyle: {//下拉列表的样式
        width: pxToDp(150),
        height: pxToDp(141),
        backgroundColor: '#5f6660',
    },
    drop_textStyle: {//下拉选项文本的样式
        textAlignVertical: 'center',
        textAlign: 'center',
        fontSize: pxToDp(24),
        fontWeight: 'bold',
        color: '#fff',
        height: pxToDp(69),
        backgroundColor: '#5f6660',
        borderRadius: pxToDp(3),
        borderColor: '#5f6660',
        borderWidth: 1,
        shadowRadius: pxToDp(3),
    },
    drop_optionStyle: {//选项点击之后的文本样式
        color: '#4d4d4d',
        backgroundColor: '#939195',
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
