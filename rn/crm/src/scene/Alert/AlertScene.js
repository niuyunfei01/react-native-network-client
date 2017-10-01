/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent, Component } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, Touchable, TouchableOpacity, RefreshControl} from 'react-native';
import {connect} from "react-redux";
import pxToDp from './pxToDp';
import LoadingView from '../../widget/LoadingView';

import * as alertActions from '../../reducers/alert/alertActions'
import * as globalActions from '../../reducers/global/globalActions'

import {bindActionCreators} from "redux";
let ScrollableTabView = require('react-native-scrollable-tab-view');
import ModalDropdown from 'react-native-modal-dropdown';
import Config from '../../config'

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
            idUpdating : false,
            type: 5,
            group_num: {},
            result_obj: {},
            next_less_than_id: 0,
            row_index_ok: false,
        };
        this.loadData = this.loadData.bind(this);
        this.setTaskStatus = this.setTaskStatus.bind(this);
        this._onRowClick = this._onRowClick.bind(this);
    }

    componentDidMount() {

    }

    componentWillMount() {
        this.loadData();
    }

    _onRowClick (route, params) {
        this.props.navigation.navigate(route, params);
    }

    loadData(type, page = 1, status = 0){
        console.log('load_data_type => ', type, this.state.type);
        let search_type = type ? type : this.state.type;
        if(search_type > 0){
            this.setState({
                isProcessing: true,
            });
            let less_than_id = parseInt(page) === 1 ? 0 : this.state.next_less_than_id;
            let self_ = this;
            console.log('less_than_id =====>', less_than_id);
            this.props.actions.FetchAlert(this.props.accessToken, search_type, status, page, less_than_id, ((result)=>{
                // console.log('fetch =====>', result);
                if(result.ok){
                    let {total_num, next_less_than_id} = result.obj;
                    self_.setState({
                        result_obj: result.obj,
                        type: search_type,
                        group_num: total_num,
                        isProcessing: false,
                        next_less_than_id: next_less_than_id,
                    });
                } else {
                    self_.setState({
                        type: search_type,
                        isProcessing: false,
                        next_less_than_id: 0,
                    });
                    console.log("error result => ", result);
                }
                // console.log("result_desc => ", result);
            }));
        } else {
            alert('查询参数有误!');
        }
    }

    setTaskStatus(task_id, status, row_index){
        if(this.state.idUpdating){
            return false;
        }
        this.setState({
            idUpdating: true,
            row_index_ok: false,
        });
        let self_ = this;
        this.props.actions.setTaskNoticeStatus(this.props.accessToken, task_id, status,(result) => {
            console.log('update =====>', result);
            alert(result.desc);
            if(result.ok){
                self_.setState({
                    idUpdating: false,
                    row_index_ok: row_index,
                });
                setTimeout(function () {
                    self_.setState({
                        row_index_ok: false,
                    });
                }, 1000);
            }else{
                self_.setState({
                    idUpdating: false,
                });
            }
        });
    }

    render() {
        let {group_num, type, isProcessing, result_obj, row_index_ok} = this.state;

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

                    if (this.state.type !== type) {
                        this.setState({
                            type: type,
                            next_less_than_id: 0,
                        });
                        this.loadData(type);
                    } else {
                        this.setState({
                            type: type,
                        });
                    }
                }}
                // locked={true}
            >
                <AlertList
                    tabLabel={group_num.refund_type > 0 ? "待退款("+group_num.refund_type+")" : "待退款"}
                    result_obj={result_obj}
                    alert_type={type}
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                    onPress={(route, params)=>this._onRowClick(route, params)}
                    setTaskStatus={(task_id, status, row_index) => this.setTaskStatus(task_id, status, row_index)}
                    row_index_ok={row_index_ok}
                />
                <AlertList
                    tabLabel={group_num.remind_type > 0 ? "催单/异常("+group_num.remind_type+")" : "催单/异常"}
                    result_obj={result_obj}
                    alert_type={type}
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                    onPress={(route, params)=>this._onRowClick(route, params)}
                    setTaskStatus={(task_id, status, row_index) => this.setTaskStatus(task_id, status, row_index)}
                    row_index_ok={row_index_ok}
                />
                <AlertList
                    tabLabel={group_num.complain_type > 0 ? "售后单("+group_num.complain_type+")" : "售后单"}
                    result_obj={result_obj}
                    alert_type={type}
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                    onPress={(route, params)=>this._onRowClick(route, params)}
                    setTaskStatus={(task_id, status, row_index) => this.setTaskStatus(task_id, status, row_index)}
                    row_index_ok={row_index_ok}
                />
                <AlertList
                    tabLabel={group_num.other_type > 0 ? "其他("+group_num.other_type+")" : "其他"}
                    result_obj={result_obj}
                    alert_type={type}
                    callbackLoadData={this.loadData}
                    isProcessing={isProcessing}
                    onPress={(route, params)=>this._onRowClick(route, params)}
                    setTaskStatus={(task_id, status, row_index) => this.setTaskStatus(task_id, status, row_index)}
                    row_index_ok={row_index_ok}
                />
            </ScrollableTabView>
        );
    }
}

class AlertList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
            loadMore: false,
            result_obj: [],
            list_pages: [],
            data_list: [],
            alert_type: this.props.alert_type,
        };
        this._onRefresh = this._onRefresh.bind(this);
        this._onScroll = this._onScroll.bind(this);
        this._onSelectOperate = this._onSelectOperate.bind(this);
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
            result_obj: [],
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
        let {result_obj, row_index_ok} = this.props;
        let {list_pages, data_list, alert_type} = this.state;
        let {curr_page, total_page, list} = result_obj;
        if(row_index_ok !== false){
            data_list.splice(row_index_ok, 1);
            this.setState({data_list: data_list});
            list = data_list;
        }
        let new_alert_type = this.props.alert_type;
        if(curr_page && total_page){
            if(list_pages.indexOf(curr_page) === -1){//不存在
                if(parseInt(curr_page) === 1 || alert_type !== new_alert_type){
                    data_list = [];
                    list_pages = [];
                }
                list_pages.push(curr_page);
                data_list.push.apply(data_list, list);
                console.log('list_pages => ', list_pages);

                this.setState({
                    result_obj: result_obj,
                    curr_page: curr_page,
                    total_page: total_page,
                    data_list: data_list,
                    alert_type: this.props.alert_type,
                });
            }
        }
    }

    _onSelectOperate(_row_index, task_id, status){
        const {setTaskStatus} = this.props;
        console.log('_row_index => '+_row_index+';   task_id:'+task_id+';status:'+status);
        setTaskStatus(task_id, status, _row_index);
        this._onRefresh(this.state.curr_page);
    }

    render() {
        let {data_list, loadMore, isRefreshing} = this.state;
        // if(isRefreshing){
        //     return (
        //         <LoadingView isLoading={true} tip='加载中...'/>
        //     );
        // }
        if(data_list.length === 0){
            //返回没有订单的图片
        }

        const {isProcessing, onPress} = this.props;
        let _this_onSelectOperate = this._onSelectOperate;
        let alert_row = data_list.map(function (row, index) {
            return (
                <AlertRow
                    alert_detail={row}
                    key={index}
                    row_index={index}
                    onPress={onPress}
                    _this_onSelectOperate={(_row_index, task_id, status) => _this_onSelectOperate(_row_index, task_id, status)}
                />
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

class AlertRow extends Component {
    static get defaultProps() {
        return {
            alert_detail: {},
        }
    }

    constructor(props) {
        super(props);
    }

    _onPressSelect(key, task_id){
        let {_this_onSelectOperate, row_index} = this.props;
        console.log('_onPressSelect =====>', key, task_id);
        if(parseInt(key) === 0){//暂停提示
            alert(task_id+'暂停提示; index: '+row_index);
        } else {//强制关闭
            // alert(task_id+'强制关闭; index: '+row_id);
            let status = Config.TASK_STATUS_DONE;
            _this_onSelectOperate(row_index, task_id, status);
        }
        return false;
    }

    render() {
        const {onPress} = this.props;

        let row = this.props.alert_detail;
        if(row){
            // {"order_id":"653848","remark":"饿了么 望京 南湖西园 用户 赵佳玮 的 59 号订单 催单了, 请尽快处理","delegation_to":"830885","created_by":"0","deleted":"0","created":"2017-09-06 17:47:11","modified":"2017-09-06 17:47:11","remind_id":"532151529","orderTime":"2017-09-06 16:59:40","store_id":"望京","dayId":"59","orderStatus":"已送达","orderDate":"0906","delegation_to_user":"吴冬梅","noticeDate":"09\/06","noticeTime":"17:47","expect_end_time":"18:17","quick":false}]}}
            return (
                <TouchableOpacity style={top_styles.container} onPress={() => onPress(Config.ROUTE_ORDER, {orderId: row.order_id})} activeOpacity={0.9}>
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
                                        onSelect={(event) => this._onPressSelect(event, row.id)}
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
                </TouchableOpacity>
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
