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
import {Cells,
    CellsTitle,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Button,
    ButtonArea,
} from "../../weui/index";
import Icon from 'react-native-vector-icons/MaterialIcons';

// create a component
class UserScene extends PureComponent {
    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;

        return {
            headerTitle: (
                <View>
                    <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>个人详情</Text>
                </View>
            ),
            headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
            headerRight: '',
        }
    };

    constructor(props: Object) {
        super(props);

        let {
            type,
            sign_count,
            bad_cases_of,
            mobile,
            cover_image,
            currentUser,
        } = this.props.navigation.state.params || {};
        this.state = {
            isRefreshing: false,
            type: type,
            sign_count: sign_count > 0 ? sign_count : 0,
            bad_cases_of: bad_cases_of > 0 ? bad_cases_of : 0,
            mobile: mobile,
            cover_image: cover_image,
            currentUser: currentUser,
        }
    }

    componentWillMount() {
    }

    onHeaderRefresh() {
        this.setState({ isRefreshing: true });

        setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, 1000);
    }

    render() {
        let {type} = this.state;
        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => this.onHeaderRefresh()}
                        tintColor='gray'
                    />
                }
                style={{backgroundColor: colors.white}}
            >
                <View style={styles.user_box}>
                    <Image style={[styles.user_img]} source={this.state.cover_image !== '' ? {uri: this.state.cover_image} : require('../../img/Mine/avatar.png')} />
                    <Text style={[styles.user_name]}>变形金刚</Text>
                </View>
                <Cells style={[styles.cells]}>
                    <Cell style={[styles.tel_box]}>
                        <CellBody>
                            <Text style={[styles.user_tel]}>电话</Text>
                        </CellBody>
                        <CellFooter>
                            <Text style={[styles.user_mobile]}>{this.state.mobile}</Text>
                        </CellFooter>
                    </Cell>
                </Cells>
                <View style={[styles.info_box]}>
                    <View style={[styles.info_item, {borderRightWidth: pxToDp(1)}]}>
                        <Text style={[styles.info_num]}>{this.state.sign_count}</Text>
                        <Text style={[styles.info_name]}>当月出勤天数</Text>
                    </View>
                    <View style={[styles.info_item]}>
                        <Text style={[styles.info_num]}>{this.state.bad_cases_of}</Text>
                        <Text style={[styles.info_name]}>30天投诉</Text>
                    </View>
                </View>
                {type === 'mine' ?
                    (<Button type='warn' style={styles.btn_logout}>退出登录</Button>) :
                    (<Button type='primary' style={styles.btn_allow}>取消禁用</Button>)
                }
            </ScrollView>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    user_box: {
        height: pxToDp(300),
        flex: 1,
        alignItems: 'center',
    },
    user_img: {
        width: pxToDp(180),
        height: pxToDp(180),
        borderRadius: 50,
        marginTop: pxToDp(30),
        marginBottom: pxToDp(25),
    },
    user_name: {
        fontSize: pxToDp(30),
        lineHeight: pxToDp(32),
        fontWeight: 'bold',
        color: colors.color333,
        textAlign: 'center',
    },

    cells: {
        marginTop: 0,
    },
    tel_box: {
        height: pxToDp(70),
        borderColor: colors.color999,
        borderTopWidth:pxToDp(1),
        borderBottomWidth:pxToDp(1),
        justifyContent: 'center'
    },
    user_tel: {
        fontSize: pxToDp(30),
        fontWeight: 'bold',
        color: colors.color333,
    },
    user_mobile: {
        fontSize: pxToDp(32),
        color: colors.color999,
    },

    info_box: {
        flexDirection: 'row',
        height: pxToDp(110),
        borderColor: colors.color999,
        // borderTopWidth:pxToDp(1),
        borderBottomWidth:pxToDp(1),
        justifyContent: 'center'
    },
    info_item: {
        marginVertical: pxToDp(10),
        borderColor: colors.color999,
        width: '50%',
    },
    info_num: {
        fontSize: pxToDp(40),
        lineHeight: pxToDp(40),
        fontWeight: 'bold',
        color: colors.color333,
        textAlign: 'center',
        alignItems: 'center',
        marginBottom: pxToDp(15),
    },
    info_name: {
        fontSize: pxToDp(24),
        lineHeight: pxToDp(25),
        fontWeight: 'bold',
        color: colors.color999,
        textAlign: 'center',
        alignItems: 'center',
    },
    btn_logout: {
        marginHorizontal: pxToDp(30),
        marginTop: pxToDp(65),
        backgroundColor: '#dc7b78',
    },
    btn_allow: {
        marginHorizontal: pxToDp(30),
        marginTop: pxToDp(65),
        backgroundColor: '#6db06f',
    },
});


//make this component available to the app
export default UserScene;
