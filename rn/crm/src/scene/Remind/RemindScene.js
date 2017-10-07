/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React from 'react'
import ReactNative from 'react-native'

const {
    StyleSheet,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    InteractionManager,
    ActivityIndicator,
    Image,
    View
} = ReactNative;

const {PureComponent} = React;
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import ScrollableTabView, {DefaultTabBar,} from 'react-native-scrollable-tab-view';
import * as Alias from './Alias';
import LoadingView from './LoadingView';
import {ToastShort} from '../../util/ToastUtils';
import pxToDp from '../../util/pxToDp';

import {fetchRemind} from '../../reducers/remind/remindActions'
import * as globalActions from '../../reducers/global/globalActions'

import Config from '../../config'

function mapStateToProps(state) {
    const {remind, global} = state;
    return {remind: remind, global: global}
}

function mapDispatchToProps(dispatch) {
    return {dispatch, ...bindActionCreators({fetchRemind, ...globalActions}, dispatch)}
}


let canLoadMore;
let _typeIds = [5, 4, 1, 3];
let loadMoreTime = 0;

// create a component
class RemindScene extends PureComponent {

    static navigationOptions = {title: 'Remind', header: null};

    constructor(props) {
        super(props);
        this.state = {
            dataSource: []
        };
        this.renderItem = this.renderItem.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        canLoadMore = false;
    }

    componentDidMount() {
        const {dispatch} = this.props;
        let token = this._getToken();
        InteractionManager.runAfterInteractions(() => {
            _typeIds.forEach((typeId) => {
                dispatch(fetchRemind(false, true, typeId, false, 1, token, 0));
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
        let token = this._getToken();
        dispatch(fetchRemind(true, false, typeId, false, 1, token, 0));
        canLoadMore = true;
    }

    _getToken() {
        const {global} = this.props;
        return global['accessToken']
    }

    onPress(route, params) {
        let self = this;
        InteractionManager.runAfterInteractions(() => {
            self.props.navigation.navigate(route, params);
        });
    }

    onEndReached(typeId) {
        let time = Date.parse(new Date()) / 1000;
        const {remind} = this.props;
        let token = this._getToken();
        let pageNum = remind.currPage[typeId];
        let totalPage = remind.totalPage[typeId];
        if (pageNum + 1 > totalPage) {
            canLoadMore = false;
            ToastShort('没有更多数据了');
        } else {
            canLoadMore = true;
        }
        if (canLoadMore && time - loadMoreTime > 1) {
            const {dispatch} = this.props;
            dispatch(fetchRemind(false, false, typeId, true, pageNum + 1, token, 0));
            loadMoreTime = Date.parse(new Date()) / 1000;
        }
    }

    renderFooter() {
        const {remind} = this.props;
        if (!remind.isLoadMore) return null;
        return (
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator styleAttr='Inverse' color='#3e9ce9'/>
                <Text style={{textAlign: 'center', fontSize: 16}}>
                    加载中…
                </Text>
            </View>
        );
    }

    renderItem(remind) {
        let {item, index} = remind;
        return (
            <TouchableOpacity style={top_styles.container}
                              onPress={() => this.onPress(Config.ROUTE_ORDER, {orderId: item.order_id})}
                              activeOpacity={0.9}>
                <View style={[top_styles.order_box]}>
                    <View style={top_styles.box_top}>
                        <View style={[top_styles.order_head]}>
                            {item.quick ? <Image style={[top_styles.icon_ji]}
                                                 source={require('../../img/Alert/quick.png')}/> : null}
                            <View>
                                <Text style={top_styles.o_index_text}>{item.orderDate}#{item.dayId}</Text>
                            </View>
                            <View>
                                <Text style={top_styles.o_store_name_text}>{item.store_id}</Text>
                            </View>
                            <TouchableOpacity style={[top_styles.icon_dropDown]}>
                                <Image style={[top_styles.icon_img_dropDown]}
                                       source={require('../../img/Alert/drop-down.png')}/>
                            </TouchableOpacity>
                        </View>
                        <View style={[top_styles.order_body]}>
                            <Text style={[top_styles.order_body_text]}>
                                <Text style={top_styles.o_content}>
                                    {item.remark}
                                </Text>
                            </Text>
                            <View style={[top_styles.ship_status]}>
                                <Text style={[top_styles.ship_status_text]}>{item.orderStatus}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={bottom_styles.container}>
                        <View style={bottom_styles.time_date}>
                            <Text style={bottom_styles.time_date_text}>{item.noticeDate}</Text>
                        </View>
                        <View>
                            <Text style={bottom_styles.time_start}>{item.noticeTime}生成</Text>
                        </View>
                        <Image style={[bottom_styles.icon_clock]} source={require('../../img/Alert/clock.png')}/>
                        <View>
                            <Text style={bottom_styles.time_end}>{item.expect_end_time}</Text>
                        </View>
                        <View style={bottom_styles.operator}>
                            <Text style={bottom_styles.operator_text}>
                                处理人：{item.delegation_to_user}
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
                        />}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{fontSize: 16}}>
                            正在加载...
                        </Text>
                    </View>
                </ScrollView>
            );
        }
        return (
            <FlatList
                extraData={this.state.dataSource}
                data={dataSource}
                legacyImplementation={false}
                directionalLockEnabled={true}
                viewabilityConfig={{
                    minimumViewTime: 3000,
                    viewAreaCoveragePercentThreshold: 100,
                    waitForInteraction: true,
                }}
                onEndReachedThreshold={pxToDp(250)}
                renderItem={this.renderItem}
                onEndReached={this.onEndReached.bind(this, typeId)}
                onRefresh={this.onRefresh.bind(this, typeId)}
                refreshing={remind.isRefreshing}
                ListFooterComponent={this.renderFooter}
                keyExtractor={this._keyExtractor}
                shouldItemUpdate={this._shouldItemUpdate}
                getItemLayout={this._getItemLayout}
                initialNumToRender={5}
            />
        );
    }

    _shouldItemUpdate = (prev, next) => {
        return prev.item !== next.item;
    }

    _getItemLayout = (data, index) => {
        return {length: pxToDp(250), offset: pxToDp(250) * index, index}
    }

    _keyExtractor = (item) => {
        return item.id.toString();
    }


    render() {
        const {remind} = this.props;
        let lists = [];
        _typeIds.forEach((typeId) => {
            lists.push(
                <View
                    key={typeId}
                    tabLabel={Alias.CATEGORIES[typeId]}
                    style={{flex: 1}}>
                    {this.renderContent(this.state.dataSource = remind.remindList[typeId] == undefined ? [] : remind.remindList[typeId], typeId)}
                </View>);
        });
        return (
            <ScrollableTabView
                initialPage={0}
                renderTabBar={() => <DefaultTabBar/>}
                tabBarActiveTextColor={"#333"}
                tabBarUnderlineStyle={{backgroundColor: "#59b26a"}}
                tabBarTextStyle={{fontSize: pxToDp(26)}}>
                {lists}
            </ScrollableTabView>
        );
    }

}

const styles = StyleSheet.create({
    listView: {
        backgroundColor: '#eeeeec'
    },
    no_data: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 100
    }
});

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

export default connect(mapStateToProps, mapDispatchToProps)(RemindScene)
