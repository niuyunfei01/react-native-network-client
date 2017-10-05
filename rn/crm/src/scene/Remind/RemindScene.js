/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React, {PureComponent} from 'react'

const {
    StyleSheet,
    ListView,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    PropTypes,
    InteractionManager,
    ProgressBarAndroid,
    Image,
    View
} = React;
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ScrollableTabView from 'react-native-scrollable-tab-view';
import * as Alias from './Alias';
import LoadingView from './LoadingView';
import CustomTabBar from './CustomTabBar';
import {ToastShort} from '../../utils/ToastUtils';
import pxToDp from '../../util/pxToDp';

import * as remindActions from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'

/**
 * ## Redux boilerplate
 */
function mapStateToProps(state) {
    const {remind, global} = state
    return {remind: remind, global: global}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({...remindActions, ...globalActions}, dispatch)
    }
}

const propTypes = {
    dispatch: PropTypes.func.isRequired,
    remind: PropTypes.object.isRequired
};

var canLoadMore;
var _typeIds = new Array();
var loadMoreTime = 0;

// create a component
class RemindScene extends PureComponent {

    static navigationOptions = {title: 'Remind', header: null};

    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            })
        };
        this.renderItem = this.renderItem.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        this.onScroll = this.onScroll.bind(this);
        canLoadMore = false;
    }

    componentDidMount() {
        const {dispatch} = this.props;
        InteractionManager.runAfterInteractions(() => {
            _typeIds = [5, 4, 1, 3];
            _typeIds.forEach((typeId) => {
                dispatch(fetchRemind(false, true, typeId));
            });
        });

    }

    componentWillReceiveProps(nextProps) {
        const {remind} = this.props;
        if (remind.isLoadMore && !nextProps.remind.isLoadMore && !nextProps.remind.isRefreshing) {
            if (nextProps.remind.noMore) {
                ToastShort('没有更多数据了');
            }
        }
    }

    onRefresh(typeId) {
        const {dispatch} = this.props;
        canLoadMore = false;
        dispatch(fetchRemind(true, false, typeId));
    }

    onPress() {
        InteractionManager.runAfterInteractions(() => {
            //TODO redirect order detail view
        });
    }


    onScroll() {
        if (!canLoadMore) {
            canLoadMore = true;
        }
    }

    onEndReached(typeId) {
        let time = Date.parse(new Date()) / 1000;
        const {remind} = this.props;
        if (canLoadMore && time - loadMoreTime > 1) {
            const {dispatch} = this.props;
            dispatch(fetchRemind(false, false, typeId, true, 25, remind.remindAfter[typeId]));
            canLoadMore = false;
            loadMoreTime = Date.parse(new Date()) / 1000;
        }
    }

    renderFooter() {
        const {remind} = this.props;
        if (remind.isLoadMore) {
            return (
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <ProgressBarAndroid styleAttr='Inverse' color='#3e9ce9'/>
                    <Text style={{textAlign: 'center', fontSize: 16}}>
                        加载中…
                    </Text>
                </View>
            );
        }
    }

    renderItem(remind, sectionID, rowID) {
        return (
            <TouchableOpacity style={top_styles.container} onPress={() => {}} activeOpacity={0.9}>
                <View style={[top_styles.order_box]}>
                    <View style={top_styles.box_top}>
                        <View style={[top_styles.order_head]}>
                            {remind.quick ? <Image style={[top_styles.icon_ji]} source={require('../../img/Alert/quick.png')}/> : null}
                            <View>
                                <Text style={top_styles.o_index_text}>{remind.orderDate}#{remind.dayId}</Text>
                            </View>
                            <View>
                                <Text style={top_styles.o_store_name_text}>{remind.store_id}</Text>
                            </View>
                            <TouchableOpacity style={[top_styles.icon_dropDown]}>
                                <Image style={[top_styles.icon_img_dropDown]} source={require('../../img/Alert/drop-down.png')}/>
                            </TouchableOpacity>
                        </View>
                        <View style={[top_styles.order_body]}>
                            <Text style={[top_styles.order_body_text]}>
                                <Text style={top_styles.o_content}>
                                    {remind.remark}
                                </Text>
                            </Text>
                            <View style={[top_styles.ship_status]}>
                                <Text style={[top_styles.ship_status_text]}>{remind.orderStatus}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={bottom_styles.container}>
                        <View style={bottom_styles.time_date}>
                            <Text style={bottom_styles.time_date_text}>{remind.noticeDate}</Text>
                        </View>
                        <View>
                            <Text style={bottom_styles.time_start}>{remind.noticeTime}生成</Text>
                        </View>
                        <Image style={[bottom_styles.icon_clock]} source={require('../../img/Alert/clock.png')}/>
                        <View>
                            <Text style={bottom_styles.time_end}>{remind.expect_end_time}</Text>
                        </View>
                        <View style={bottom_styles.operator}>
                            <Text style={bottom_styles.operator_text}>
                                处理人：{remind.delegation_to_user}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    renderContent(dataSource, typeId) {
        const {remind} = this.props;
        if (remind.loading) {
            return <LoadingView/>;
        }
        let isEmpty = remind.remindList[typeId] == undefined || remind.remindList[typeId].length == 0;
        if (isEmpty) {
            return (
                <ScrollView
                    automaticallyAdjustContentInsets={false}
                    horizontal={false}
                    contentContainerStyle={styles.no_data}
                    style={{flex: 1}}
                    refreshControl={
                        <RefreshControl
                            refreshing={remind.isRefreshing}
                            onRefresh={this.onRefresh.bind(this, typeId)}
                            title="Loading..."
                            colors={['#ffaa66cc', '#ff00ddff', '#ffffbb33', '#ffff4444']}
                        />
                    }
                >
                    <View style={{alignItems: 'center'}}>
                        <Text style={{fontSize: 16}}>
                            正在加载...
                        </Text>
                    </View>
                </ScrollView>
            );
        }
        return (
            <ListView
                initialListSize={1}
                dataSource={dataSource}
                renderRow={this.renderItem}
                style={styles.listView}
                onEndReached={this.onEndReached.bind(this, typeId)}
                onEndReachedThreshold={10}
                onScroll={this.onScroll}
                renderFooter={this.renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={reddit.isRefreshing}
                        onRefresh={this.onRefresh.bind(this, typeId)}
                        title="Loading..."
                        colors={['#ff0000', '#ff0000', '#ff0000', '#ff0000']}
                    />
                }
            />
        );
    }

    render() {
        const {remind} = this.props;
        var lists = [];
        _typeIds.forEach((typeId) => {
            lists.push(
                <View
                    key={typeId}
                    tabLabel={Alias.CATEGORIES[typeId]}
                    style={{flex: 1}}
                >
                    {this.renderContent(this.state.dataSource.cloneWithRows(remind.remindList[typeId] == undefined ? [] : remind.remindList[typeId]), typeId)}
                </View>);
        });
        return (
            <ScrollableTabView
                renderTabBar={() => <CustomTabBar/>}
                tabBarBackgroundColor="#fcfcfc"
                tabBarUnderlineColor="#FF0000"
                tabBarActiveTextColor="#FF0000"
                tabBarInactiveTextColor="#aaaaaa">
                {lists}
            </ScrollableTabView>
        );
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


RemindScene.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(RemindScene)
