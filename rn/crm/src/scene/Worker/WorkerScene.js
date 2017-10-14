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
} from "../../weui/index";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import * as mineActions from '../../reducers/mine/mineActions';

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
class WorkerScene extends PureComponent {
    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;

        return {
            headerTitle: (
                <View>
                    <Text style={{color: '#111111', fontSize: pxToDp(30), fontWeight: 'bold'}}>员工管理</Text>
                </View>
            ),
            headerStyle: {backgroundColor: colors.back_color, height: pxToDp(78)},
            headerRight: '',
        }
    };

    constructor(props: Object) {
        super(props);
        const {
            currentUser,
            currStoreId,
            canReadStores,
            accessToken,
        } = this.props.global;

        this.state = {
            isRefreshing: false,
            accessToken: accessToken,
            currentUser: currentUser,
            currVendorId: canReadStores[currStoreId]['vendor_id'],
            currVendorName: canReadStores[currStoreId]['vendor'],
        }
    }

    componentWillMount() {
    }

    onSearchWorkers(){
        const {
            currVendorId,
            accessToken,
        } = this.state;
        let _this = this;
        InteractionManager.runAfterInteractions(() => {
            this.props.actions.fetchWorkers(currVendorId, accessToken, (resp) => {
                console.log('resp => ', resp);
                _this.setState({ isRefreshing: false })
            });
        });
    }

    onHeaderRefresh() {
        this.setState({ isRefreshing: true });

        setTimeout(() => {
            this.setState({ isRefreshing: false })
        }, 1000);
    }

    renderAddUser() {
        return (
            <View>
                <CellsTitle style={styles.cell_title}>新增员工</CellsTitle>
                <Cells style={[styles.cells, styles.border_top]}>
                    <Cell access style={[styles.worker_box, {justifyContent: 'center'}]}>
                        <CellHeader>
                            <Icon name="person-add" style={[styles.add_user_icon]}/>
                        </CellHeader>
                        <CellBody style={[styles.worker_info]}>
                            <Text style={[styles.worker_name]}>新增员工</Text>
                        </CellBody>
                        <CellFooter/>
                    </Cell>
                </Cells>
            </View>
        )
    }

    renderList() {
        return (
            <View>
                <CellsTitle style={styles.cell_title}>员工列表</CellsTitle>
                <Cells style={[styles.cells, styles.border_top]}>
                    <Cell access style={[styles.worker_box]}>
                        <CellHeader>
                            <Image source={require('../../img/Mine/avatar.png')} alt="" style={[styles.worker_img]}/>
                        </CellHeader>
                        <CellBody style={[styles.worker_info]}>
                            <Text style={[styles.worker_name]}>阿凡达</Text>
                            <Text style={[styles.worker_tel]}>13708989898</Text>
                        </CellBody>
                        <CellFooter/>
                    </Cell>
                    <Cell access style={[styles.worker_box]}>
                        <CellHeader>
                            <Image source={require('../../img/Mine/avatar.png')} alt="" style={[styles.worker_img]}/>
                        </CellHeader>
                        <CellBody style={[styles.worker_info]}>
                            <Text style={[styles.worker_name]}>阿凡达</Text>
                            <Text style={[styles.worker_tel]}>13708989898</Text>
                        </CellBody>
                        <CellFooter/>
                    </Cell>
                    <Cell access style={[styles.worker_box]}>
                        <CellHeader>
                            <Image source={require('../../img/Mine/avatar.png')} alt="" style={[styles.worker_img]}/>
                        </CellHeader>
                        <CellBody style={[styles.worker_info]}>
                            <Text style={[styles.worker_name]}>阿凡达</Text>
                            <Text style={[styles.worker_tel]}>13708989898</Text>
                        </CellBody>
                        <CellFooter/>
                    </Cell>
                </Cells>
            </View>
        );
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
                }
                style={{backgroundColor: '#f2f2f2'}}
            >
                {this.renderAddUser()}
                {this.renderList()}
            </ScrollView>
        );
    }

}

// define your styles
const styles = StyleSheet.create({
    cell_title: {
        marginBottom: pxToDp(5),
        paddingLeft: pxToDp(30),
    },
    cells: {
        marginTop: 0,
    },
    border_top: {
        borderTopWidth: pxToDp(1),
        borderTopColor: colors.color999,
    },
    worker_box: {
        borderColor: colors.color999,
        borderBottomWidth: pxToDp(1),
        height: pxToDp(90),
    },
    worker_img: {
        width: pxToDp(50),
        height: pxToDp(50),
        marginVertical: pxToDp(20),
        borderRadius: 50,
    },
    worker_info: {

    },
    worker_name: {
        fontSize: pxToDp(28),
        fontWeight: 'bold',
        color: colors.color333,
    },
    worker_tel: {
        fontSize: pxToDp(22),
        fontWeight: 'bold',
        color: colors.color999,
    },
    add_user_icon: {
        marginRight: pxToDp(10),
        fontSize: pxToDp(50),
        color: '#449af8',
    },
});


//make this component available to the app
// export default WorkerScene;
export default connect(mapStateToProps, mapDispatchToProps)(WorkerScene)
