/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React, {PureComponent, Component} from 'react'
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    InteractionManager,
    FlatList,
    StatusBar
} from 'react-native';
import {connect} from "react-redux";
import pxToDp from '../../util/pxToDp';
import LoadingView from '../../widget/LoadingView';

import * as alertActions from '../../reducers/alert/alertActions'
import * as globalActions from '../../reducers/global/globalActions'

import {bindActionCreators} from "redux";

let ScrollableTabView = require('react-native-scrollable-tab-view');
import ModalDropdown from 'react-native-modal-dropdown';
import Config from '../../config'
import Cts from '../../Cts'

function mapStateToProps({alert, global}) {
    return {
        type: alert.type,
        status: alert.status,
        result: alert.result,
        accessToken: global.accessToken
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({...alertActions, ...globalActions}, dispatch)
    }
}

const TASK_TYPE_REFUND = 5;//退款
const TASK_TYPE_REMIND = 4;//催单
const TASK_TYPE_COMPLAIN = 1;//客服待处理退款
const TASK_TYPE_OTHER = 3;//其他事项

// 用于循环导航栏的初始数据
const tab_nav = new Map([
    ['refund_type', '待退款'],
    ['remind_type', '催单/异常'],
    ['complain_type', '售后单'],
    ['other_type', '其他'],
]);

// 定义服务器定义的返回数据类型
const group_type_key = new Map([
    [TASK_TYPE_REFUND, 'refund_type'],
    [TASK_TYPE_REMIND, 'remind_type'],
    [TASK_TYPE_COMPLAIN, 'complain_type'],
    [TASK_TYPE_OTHER, 'other_type'],
]);

// 表示当前在所处分类
let global_alert_type = TASK_TYPE_REFUND;

// 存储分类列表
const global_type_data = new Map([
    [TASK_TYPE_REFUND, []],
    [TASK_TYPE_REMIND, []],
    [TASK_TYPE_COMPLAIN, []],
    [TASK_TYPE_OTHER, []],
]);

function get_type_data(type) {
    return global_type_data.get(type);
}

function get_type_list(type) {
    return global_type_data.get(type)['list'];
}

function get_curr_page(type) {
    return global_type_data.get(type)['curr_page'];
}

function get_total_page(type) {
    return global_type_data.get(type)['total_page'];
}

function get_list_pages(type) {
    return global_type_data.get(type)['list_pages'];
}

function get_less_than_id(type) {
    return global_type_data.get(type)['less_than_id'];
}

// 存储导航栏数据
const global_group_num = new Map();

// create a component
class AlertScene extends PureComponent {

    static navigationOptions = {title: 'Alert', header: null};

    constructor(props) {
        super(props);
        this.state = {
            isProcessing: false,
            idUpdating: false,
            type: TASK_TYPE_REFUND,
        };
        this.loadData = this.loadData.bind(this);
        this.setTaskStatus = this.setTaskStatus.bind(this);
        this._onRowClick = this._onRowClick.bind(this);
    }

    componentDidMount() {
    }

    componentWillMount() {
        let self = this;
        InteractionManager.runAfterInteractions(() => {
            self.loadData();
        });
    }

    _onRowClick(route, params) {
        let self = this;
        InteractionManager.runAfterInteractions(() => {
            self.props.navigation.navigate(route, params);
        });
    }

    _onTabChange(obj) {
        let tab_bar = obj.i;
        if (tab_bar === 0) {
            global_alert_type = TASK_TYPE_REFUND;//用户申请退款
        } else if (tab_bar === 1) {
            global_alert_type = TASK_TYPE_REMIND;//催单
        } else if (tab_bar === 2) {
            global_alert_type = TASK_TYPE_COMPLAIN;//待处理评价
        } else if (tab_bar === 3) {
            global_alert_type = TASK_TYPE_OTHER;//其他事项
        }
        if (this.state.type !== global_alert_type) {
            this.setState({
                type: global_alert_type,
            });
            let self = this;
            InteractionManager.runAfterInteractions(() => {
                self.loadData();
            });
        }
    }

    loadData(page = 1, status = 0) {
        this.setState({
            isProcessing: true,
        });
        let less_than_id = parseInt(page) === 1 ? 0 : get_less_than_id(global_alert_type);
        let self_ = this;
        let type_list = get_type_list(global_alert_type);
        if (this.state.type !== global_alert_type && type_list !== undefined && type_list.length > 0) {
            self_.setState({
                type: global_alert_type,
                isProcessing: false,
            });
        } else {
            this.props.actions.FetchAlert(this.props.accessToken, global_alert_type, status, page, less_than_id, ((result) => {
                if (result.ok) {
                    let {curr_page, total_page, total_num, next_less_than_id, list} = result.obj;
                    let list_pages = get_list_pages(global_alert_type);
                    if (list_pages === undefined || parseInt(curr_page) === 1) {
                        list_pages = [];
                    } else if (parseInt(curr_page) > 1 && list_pages.indexOf(curr_page) === -1) {//不存在
                        let list_data = get_type_list(global_alert_type);
                        list_data.push.apply(list_data, list);
                        list = list_data;
                    }
                    list_pages.push(curr_page);
                    let type_data = {
                        curr_page: curr_page,
                        total_page: total_page,
                        list: list,
                        list_pages: list_pages,
                        less_than_id: next_less_than_id,
                    };
                    global_type_data.set(global_alert_type, type_data);
                    for (let v of group_type_key) {
                        let tab_key = v[1];
                        let g_num = total_num[tab_key];
                        global_group_num.set(tab_key, g_num);
                    }
                    self_.setState({
                        type: global_alert_type,
                        isProcessing: false,
                    });
                } else {
                    self_.setState({
                        type: global_alert_type,
                        isProcessing: false,
                    });
                }
            }));
        }
    }

    // 设置任务状态
    setTaskStatus(task_id, status, row_index) {
        if (this.state.idUpdating) {
            return false;
        }
        this.setState({
            idUpdating: true,
        });
        let self_ = this;
        this.props.actions.setTaskNoticeStatus(this.props.accessToken, task_id, status, (result) => {
            if (result.ok) {
                let type_data = get_type_data(global_alert_type);
                type_data.list.splice(row_index, 1);
                if (status === Cts.TASK_STATUS_DONE) {
                    let tab_key = group_type_key.get(global_alert_type);
                    let type_num = global_group_num.get(tab_key);
                    let new_type_num = type_num > 0 ? type_num - 1 : 0;
                    global_group_num.set(tab_key, new_type_num);
                }
            }
            self_.setState({
                idUpdating: false,
            });
        });
    }

    renderContent() {
        let {isProcessing} = this.state;
        return (<AlertList callbackLoadData={this.loadData} onPress={(route, params) => this._onRowClick(route, params)}
                           setTaskStatus={(task_id, status, row_index) => this.setTaskStatus(task_id, status, row_index)}
                           isProcessing={isProcessing}/>);
    }

    render() {
        let AlertLists = [];
        let group_num_key = 0;
        for (let tab of tab_nav) {
            let tab_key = tab[0];
            let tab_name = tab[1];
            let type_num = global_group_num.get(tab_key);
            AlertLists.push(
                <View style={{flex: 1}} key={group_num_key}
                      tabLabel={type_num > 0 ? tab_name + "(" + type_num + ")" : tab_name}>
                    {this.renderContent()}
                </View>
            );
            group_num_key++;
        }
        if (AlertLists.length === 0) {
            return (<LoadingView isLoading={true} tip='加载中...'/>);
        }
        return (
            <ScrollableTabView
                tabBarActiveTextColor={"#333"}
                tabBarUnderlineStyle={{backgroundColor: "#59b26a"}}
                tabBarTextStyle={{fontSize: pxToDp(26)}}
                onChangeTab={(obj) => this._onTabChange(obj)}>
                {AlertLists}
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
            list_data: false,
        };
        this._onRefresh = this._onRefresh.bind(this);
        this._onScroll = this._onScroll.bind(this);
        this._onSelectOperate = this._onSelectOperate.bind(this);
        this.renderItem = this.renderItem.bind(this);
    }

    _onRefresh() {
        let {isRefreshing} = this.state;
        let {isProcessing} = this.props;
        if (isRefreshing || isProcessing) {
            if (isRefreshing && !isProcessing) {
                let type_list = get_type_list(global_alert_type);
                this.setState({
                    isRefreshing: false,
                    list_data: type_list,
                });
            }
        } else {
            this.setState({
                isRefreshing: true,
            });
            this.props.callbackLoadData(1);
        }
    }

    _onScroll() {
        let curr_page = get_curr_page(global_alert_type);
        let next_page = parseInt(curr_page) + 1;
        let total_page = get_total_page(global_alert_type);
        let list_pages = get_list_pages(global_alert_type);
        let {loadMore} = this.state;
        let {isProcessing} = this.props;
        if (loadMore || isProcessing || curr_page >= total_page || list_pages.indexOf(next_page) !== -1) {
            if (loadMore && !isProcessing) {
                let type_list = get_type_list(global_alert_type);
                this.setState({
                    loadMore: false,
                    list_data: type_list,
                });
            }
        } else {
            this.setState({
                loadMore: true
            });
            this.props.callbackLoadData(next_page);
        }
    }


    componentWillReceiveProps() {
        let {isRefreshing} = this.state;
        let {isProcessing} = this.props;
        if (isRefreshing || isProcessing) {
            if (isRefreshing && !isProcessing) {
                let type_list = get_type_list(global_alert_type);
                if (type_list !== undefined && type_list !== false) {
                    this.setState({
                        isRefreshing: false,
                        list_data: type_list,
                    });
                }
            }
        } else {
            let type_list = get_type_list(global_alert_type);
            if (type_list !== undefined && type_list !== false) {
                this.setState({
                    list_data: type_list,
                });
            }
        }
    }

    _onSelectOperate(_row_index, task_id, status) {
        const {setTaskStatus} = this.props;
        setTaskStatus(task_id, status, _row_index);
    }

    renderItem({item, index}) {
        const {onPress} = this.props;
        let _this_onSelectOperate = this._onSelectOperate;
        return (
            <AlertRow
                alert_detail={item}
                key={index}
                row_index={index}
                onPress={onPress}
                _this_onSelectOperate={(_row_index, task_id, status) => _this_onSelectOperate(_row_index, task_id, status)}
            />
        );
    }

    render() {
        let type_list = this.state.list_data;
        if (type_list === undefined || type_list === false) {
            return (
                <LoadingView isLoading={true} tip='加载中...'/>
            );
        }
        type_list = type_list.map(function (row) {
            row.key = row.id;
            return row;
        });
        return (
            <FlatList
                data={type_list}
                renderItem={this.renderItem}
                onEndReached={() => {
                    // 到达底部，加载更多列表项
                    this._onScroll();
                }}
                onEndReachedThreshold={0.4}
                onRefresh={this._onRefresh}
                refreshing={this.state.isRefreshing}
                getItemLayout={(data, index) => ({length: pxToDp(250), offset: pxToDp(250) * index, index})}
            />
        )
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

    _onPressSelect(key, task_id) {
        let {_this_onSelectOperate, row_index} = this.props;
        if (parseInt(key) === 0) {//暂停提示
        } else {//强制关闭
            let status = Cts.TASK_STATUS_DONE;
            _this_onSelectOperate(row_index, task_id, status);
        }
        return false;
    }

    render() {
        const {onPress} = this.props;
        let row = this.props.alert_detail;
        if (row) {
            return (
                <TouchableOpacity style={top_styles.container}
                                  onPress={() => onPress(Config.ROUTE_ORDER, {orderId: row.order_id})}
                                  activeOpacity={0.9}>
                    <View style={[top_styles.order_box]}>
                        <View style={top_styles.box_top}>
                            <View style={[top_styles.order_head]}>
                                {row.quick ? <Image style={[top_styles.icon_ji]}
                                                    source={require('../../img/Alert/quick.png')}/> : null}
                                <View>
                                    <Text style={top_styles.o_index_text}>{row.orderDate}#{row.dayId}</Text>
                                </View>
                                <View>
                                    <Text style={top_styles.o_store_name_text}>{row.store_id}</Text>
                                </View>
                                <TouchableOpacity style={[top_styles.icon_dropDown]}>
                                    <ModalDropdown
                                        options={['暂停提示', '强制关闭']}
                                        defaultValue={''}
                                        style={top_styles.drop_style}
                                        dropdownStyle={top_styles.drop_listStyle}
                                        dropdownTextStyle={top_styles.drop_textStyle}
                                        dropdownTextHighlightStyle={top_styles.drop_optionStyle}
                                        onSelect={(event) => this._onPressSelect(event, row.id)}>
                                        <Image style={[top_styles.icon_img_dropDown]}
                                               source={require('../../img/Alert/drop-down.png')}/>
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
                            <Image style={[bottom_styles.icon_clock]} source={require('../../img/Alert/clock.png')}/>
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
    container: {
        backgroundColor: '#f2f2f2',
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
        marginTop: -StatusBar.currentHeight,
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

    order_body: {},
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
    container: {
        height: pxToDp(70),
        borderTopWidth: 1,
        borderTopColor: '#999',
        paddingHorizontal: pxToDp(20),
        flexDirection: 'row',
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

export default connect(mapStateToProps, mapDispatchToProps)(AlertScene)
