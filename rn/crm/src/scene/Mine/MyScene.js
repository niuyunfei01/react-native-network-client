/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan 
 * @flow
 */

//import liraries
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl, InteractionManager } from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from 'react-native-vector-icons/Entypo';
import Config from '../../config';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import * as mineActions from '../../reducers/mine/mineActions';
import {Dialog, ActionSheet} from "../../weui/index";
import native from "../../common/native";
import {ToastLong, ToastShort} from '../../util/ToastUtils';
import {fetchUserCount} from "../../reducers/mine/mineActions";

function mapStateToProps(state) {
    const {worker_info, global} = state;
    return {worker_info: worker_info, global: global}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({...mineActions, ...globalActions}, dispatch)
    }
}

// create a component
class MyScene extends PureComponent {
    static navigationOptions = {title: 'My', header: null};

    constructor(props: Object) {
        super(props);
        const {
            currentUser,
            currStoreId,
            accessToken,
            currentUserProfile,
            canReadStores,
            canReadVendors,
        } = this.props.global;

        const {
            prefer_store,
            screen_name,
            mobilephone,
            sex,
            cover_image,
        } = this.props.global.currentUserProfile;

        let _this = this;
        let storeActionSheet = [];
        for(let idx in canReadStores){
            if (canReadStores.hasOwnProperty(idx)) {
                let store = canReadStores[idx];
                // console.log(idx," ==>",store);
                let item = {
                    type: 'default',
                    label: store.name,
                    onPress: () => _this._doChangeStore(store.id),
                };
                storeActionSheet.push(item);
            }
        }

        this.state = {
            isRefreshing: false,
            currStoreId: currStoreId,
            canReadStores: canReadStores,
            prefer_store: prefer_store,
            screen_name: screen_name,
            mobile_phone: mobilephone,
            currStoreName: canReadStores[currStoreId]['name'],
            cover_image: cover_image !== '' ? Config.ServiceUrl + cover_image : '',
            canReadVendors: canReadVendors,

            showChangeStoreDialog: false,
            storeActionSheet: storeActionSheet,
        };

        this._doChangeStore = this._doChangeStore.bind(this);
        this._hideStoreDialog = this._hideStoreDialog.bind(this);
    }

    componentDidMount() {
        const {dispatch} = this.props;
        const {
            currentUser,
            accessToken,
        } = this.props.global;
        this.props.actions.fetchUserCount(currentUser, accessToken, (resp) => {
            console.log('resp => ', resp);
        });
        // InteractionManager.runAfterInteractions(() => {
        // });
    }

    componentWillReceiveProps() {
        const {
            currentUser,
            currStoreId,
            accessToken,
            currentUserProfile,
            canReadStores,
            canReadVendors,
        } = this.props.global;

        const {
            prefer_store,
            screen_name,
            mobilephone,
            sex,
            cover_image,
        } = this.props.global.currentUserProfile;

        this.setState({
            currStoreId: currStoreId,
            currStoreName: canReadStores[currStoreId]['name'],
            canReadStores: canReadStores,
            prefer_store: prefer_store,
            screen_name: screen_name,//员工姓名
            mobile_phone: mobilephone,
            cover_image: cover_image !== '' ? Config.ServiceUrl + cover_image : '',
            canReadVendors: canReadVendors,
        });
        // console.log('state => ', this.state);
    }

    onHeaderRefresh() {
        this.setState({ isRefreshing: true });

        setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, 1000);
    }

    onPressChangeStore() {
        this.setState({
            showChangeStoreDialog: true,
        });
    }

    _doChangeStore(store_id) {
        console.log('store_id -----> ', store_id);
        let {canReadStores} = this.state;
        let _this = this;
        native.setCurrStoreId(store_id, function (ok, msg) {
            console.log('setCurrStoreId => ', ok, msg);
            if(ok){
                _this.setState({
                    currStoreId: store_id,
                    currStoreName: canReadStores[store_id]['name'],
                });
            }else{
                ToastShort(msg);
            }
        });
        this._hideStoreDialog();
    }

    _hideStoreDialog() {
        this.setState({
            showChangeStoreDialog: false,
        });
    }

    renderHeader() {
        return (
            <View style={header_styles.container}>
                <View style={[header_styles.main_box]}>
                    <Text style={header_styles.shop_name}>{this.state.currStoreName}</Text>
                    <TouchableOpacity
                        style={{flexDirection: 'row'}}
                        onPress={this.onPressChangeStore.bind(this)}
                    >
                        <Icon name='exchange' style={header_styles.change_shop} />
                        <Text style={header_styles.change_shop}> 切换门店</Text>
                    </TouchableOpacity>
                </View>
                <View style={[header_styles.icon_box]}>
                    <Image style={[header_styles.icon_open]} source={require('../../img/My/open_.png')} />
                    <Text style={header_styles.open_text}>营业中</Text>
                </View>
            </View>
        )
    }

    /*renderWorker() {
        return (
            <View style={worker_styles.container}>
                <View>
                    <Image style={[worker_styles.icon_head]} source={this.state.cover_image !== '' ? {uri: this.state.cover_image} : require('../../img/Mine/avatar.png')} />
                </View>
                <View style={[worker_styles.worker_box]}>
                    <Text style={worker_styles.worker_name}>{this.state.screen_name.substring(0,4)}</Text>
                </View>
                <View style={[worker_styles.sales_box]}>
                    <Text style={[worker_styles.sale_text]}>今日订单: 500</Text>
                    <Text style={[worker_styles.sales_money, worker_styles.sale_text]}>营业额: ¥3800.00</Text>
                </View>
                <TouchableOpacity style={[worker_styles.chevron_right]}>
                    <Button name='chevron-thin-right' style={worker_styles.right_btn} />
                </TouchableOpacity>
            </View>
        )
    }*/
    renderWorker() {
        return (
            <View style={worker_styles.container}>
                <View>
                    <Image style={[worker_styles.icon_head]} source={this.state.cover_image !== '' ? {uri: this.state.cover_image} : require('../../img/Mine/avatar.png')} />
                </View>
                <View style={[worker_styles.worker_box]}>
                    <Text style={worker_styles.worker_name}>{this.state.screen_name.substring(0,4)}</Text>
                </View>
                <View style={[worker_styles.order_box]}>
                    <Text style={worker_styles.order_num}>12</Text>
                    <Text style={[worker_styles.tips_text]}>出勤天数</Text>
                </View>
                <View style={[worker_styles.question_box]}>
                    <Text style={worker_styles.order_num}>3</Text>
                    <Text style={[worker_styles.tips_text]}>30天投诉</Text>
                </View>
                <TouchableOpacity style={[worker_styles.chevron_right]}>
                    <Button name='chevron-thin-right' style={worker_styles.right_btn} />
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => this.onHeaderRefresh()}
                        tintColor='gray'
                    />
                }>
                {this.renderHeader()}
                {this.renderWorker()}
                {this.renderBlock()}
                <ActionSheet
                    visible={this.state.showChangeStoreDialog}
                    onRequestClose={() => this._hideStoreDialog()}
                    menus={this.state.storeActionSheet}
                    actions={[
                        {
                            type: 'default',
                            label: '取消',
                            onPress: this._hideStoreDialog,
                        }
                    ]}
                    style={{height: '40%'}}
                />
            </ScrollView>
        );
    }

    onPress(route) {
        let self = this;
        InteractionManager.runAfterInteractions(() => {
            self.props.navigation.navigate(route);
        });
    }

    renderBlock () {
        return (
            <View style={[block_styles.container]}>
                <TouchableOpacity
                    style={[block_styles.block_box]}
                    onPress={() => this.onPress(Config.ROUTE_WORKER)}
                >
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[block_styles.block_box]}>
                    <Image style={[block_styles.block_img]} source={require('../../img/Mine/avatar.png')} />
                    <Text style={[block_styles.block_name]}>预留功能</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

// define your styles
const header_styles = StyleSheet.create({
    container: {
        borderTopWidth: pxToDp(1),
        borderBottomWidth: pxToDp(1),
        borderColor: colors.color999,
        paddingLeft: pxToDp(30),
        backgroundColor: colors.white,
        marginBottom: pxToDp(14),
    },
    main_box: {
        marginRight: pxToDp(134),
        height: pxToDp(170),
        // borderWidth: pxToDp(1),
        // borderColor: 'red',
    },
    shop_name: {
        color: colors.title_color,
        fontSize: pxToDp(36),
        fontWeight: 'bold',
        marginVertical: pxToDp(30),
        lineHeight: pxToDp(36),
    },
    change_shop: {
        color: colors.main_color,
        fontSize: pxToDp(34),
        fontWeight: 'bold',
        lineHeight: pxToDp(34),
    },
    icon_box: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    icon_open: {
        marginHorizontal: pxToDp(30),
        marginTop: pxToDp(35),
        marginBottom: pxToDp(5),
        width: pxToDp(70),
        height: pxToDp(74),
    },
    open_text: {
        color: colors.main_color,
        fontSize: pxToDp(20),
        textAlign: 'center',
    },
    close_text: {
        color: '#999',
    },
});

const worker_styles = StyleSheet.create({
    container: {
        borderTopWidth: pxToDp(1),
        borderBottomWidth: pxToDp(1),
        borderColor: colors.color999,
        backgroundColor: colors.white,
        marginBottom: pxToDp(7),
        height: pxToDp(140),
        flexDirection: 'row',
    },
    icon_head: {
        marginHorizontal: pxToDp(30),
        marginVertical: pxToDp(25),
        width: pxToDp(90),
        height: pxToDp(90),
        borderRadius: pxToDp(50),
    },
    worker_box: {
        width: pxToDp(130),
        justifyContent: 'center',
    },
    worker_name: {
        color: colors.title_color,
        fontSize: pxToDp(30),
        fontWeight: 'bold',
    },
    order_box: {
        marginLeft: pxToDp(35),
        justifyContent: 'center',
    },
    question_box: {
        marginLeft: pxToDp(60),
        justifyContent: 'center',
    },
    order_num: {
        color: colors.title_color,
        fontSize: pxToDp(40),
        lineHeight: pxToDp(40),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tips_text: {
        color: colors.color999,
        fontSize: pxToDp(24),
        lineHeight: pxToDp(24),
        textAlign: 'center',
        marginTop: pxToDp(16),
    },
    chevron_right: {
        position: 'absolute',
        right: pxToDp(30),
        top: pxToDp(50),
    },
    right_btn: {
        fontSize: pxToDp(40),
        textAlign: 'center',
        width: pxToDp(50),
        height: pxToDp(50),
        color: colors.main_color,
    },
    sales_box: {
        marginLeft: pxToDp(35),
        marginTop: pxToDp(30),
    },
    sale_text: {
        fontSize: pxToDp(30),
        lineHeight: pxToDp(30),
        color: '#555',
    },
    sales_money: {
        marginTop: pxToDp(24),
    },
});

const block_styles = StyleSheet.create({
    container: {
        paddingHorizontal: pxToDp(23),
        marginBottom: pxToDp(7),
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    block_box: {
        width: pxToDp(210),
        height: pxToDp(156),
        backgroundColor: colors.white,
        borderRadius: pxToDp(10),
        margin: pxToDp(7),
    },
    block_img: {
        marginHorizontal: pxToDp(60),
        marginTop: pxToDp(20),
        marginBottom: pxToDp(10),
        width: pxToDp(90),
        height: pxToDp(90),
    },
    block_name: {
        color: colors.color333,
        fontSize: pxToDp(24),
        lineHeight: pxToDp(24),
        textAlign: 'center',
    },

});


//make this component available to the app
// export default MyScene;
export default connect(mapStateToProps, mapDispatchToProps)(MyScene)
