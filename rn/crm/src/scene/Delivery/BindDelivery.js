//import liraries
import React, {PureComponent} from "react";
import {
    ScrollView, StyleSheet, ToastAndroid,
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import { Grid, WingBlank } from 'antd-mobile-rn'
import {bindActionCreators} from "redux";

import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellHeader, Cells, CellsTitle} from "../../weui/Cell";
import {Input, Label} from "../../weui/Form";
import {Button, ButtonArea} from "../../weui/Button";
import * as globalActions from "../../reducers/global/globalActions";
mapStateToProps = state => {
    let {global} = state
    return {global: global}
}

mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators({...globalActions}, dispatch)
    }
}
let storename;
class BindDelivery extends PureComponent {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: '绑定配送信息',
        }
    }
    constructor(props) {
        super(props);
        const {
            canReadStores,
            currStoreId,
        } = this.props.global;
        this.state={
            app_key:'',
            app_secret:'',
            shop_id:'',
        }
        this.onBindDelivery =this.onBindDelivery.bind(this)
         storename  = canReadStores[currStoreId].vendor+canReadStores[currStoreId].name
    }
    onBindDelivery(){
        this.props.actions.addDelivery({
            name:this.props.navigation.state.params.name,
            type:this.props.navigation.state.params.type,
            app_key:this.state.app_key,
            app_secret:this.state.app_secret,
            shop_id:this.state.shop_id,
            model_id:this.props.global.currStoreId,
        }, (success,response) => {
            if (success){     ToastAndroid.showWithGravity('绑定成功',ToastAndroid.SHORT, ToastAndroid.CENTER)}
        })

    }
    render() {

        return (
            <ScrollView style={styles.container}
                        automaticallyAdjustContentInsets={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
            >
                <CellsTitle style={styles.cell_title}>{storename}</CellsTitle>
                <CellsTitle style={styles.cell_title}>登录顺丰同城急送APP，在商户信息页面授权开发者选择【外送帮】，并复制【店铺ID】填写到下方</CellsTitle>
                <Cells style={[styles.cell_box]}>
                    <Cell customStyle={[styles.cell_row]}>
                        <CellHeader>
                            <Label style={[styles.cell_label]}>开发者appId</Label>
                        </CellHeader>
                        <CellBody>
                            <Input
                                onChangeText={(app_key) => {
                                    app_key = app_key.replace(/[^\w]+/, '');
                                    this.setState({app_key})
                                }}
                                value={this.state.app_key}
                                style={[styles.cell_input]}
                                placeholder="64个字符以内"
                                underlineColorAndroid="transparent" //取消安卓下划线

                            />
                        </CellBody>
                    </Cell>
                </Cells>
                <Cells style={[styles.cell_box]}>
                    <Cell customStyle={[styles.cell_row]}>
                        <CellHeader>
                            <Label style={[styles.cell_label]}>开发者appsecret</Label>
                        </CellHeader>
                        <CellBody>
                            <Input
                                onChangeText={(app_secret) => {
                                    app_secret = app_secret.replace(/[^\w]+/, '');
                                    this.setState({app_secret})
                                }}
                                value={this.state.app_secret}
                                style={[styles.cell_input]}
                                placeholder="64个字符以内"
                                underlineColorAndroid="transparent" //取消安卓下划线
                            />
                        </CellBody>
                    </Cell>
                </Cells>
                <Cells style={[styles.cell_box]}>
                    <Cell customStyle={[styles.cell_row]}>
                        <CellHeader>
                            <Label style={[styles.cell_label]}>配送平台门店id</Label>
                        </CellHeader>
                        <CellBody>
                            <Input
                                onChangeText={(shop_id) => {
                                    shop_id = shop_id.replace(/[^\d]+/, '');
                                    this.setState({shop_id})
                                }}
                                value={this.state.shop_id}
                                style={[styles.cell_input]}
                                keyboardType="numeric"
                                placeholder="64个字符以内"
                                underlineColorAndroid="transparent" //取消安卓下划线

                            />
                        </CellBody>
                    </Cell>
                </Cells>
                <ButtonArea style={{marginBottom: pxToDp(20), marginTop: pxToDp(50)}}>
                    <Button type="primary" onPress={()=>this.onBindDelivery()}>确认绑定</Button>
                </ButtonArea>
            </ScrollView>

        );
    }
}
const
    styles = StyleSheet.create({
        container: {
            marginBottom: pxToDp(22),
            backgroundColor: colors.white
        },
        btn_select: {
            marginRight: pxToDp(20),
            height: pxToDp(60),
            width: pxToDp(60),
            fontSize: pxToDp(40),
            color: colors.color666,
            textAlign: "center",
            textAlignVertical: "center"
        },
        cell_title: {
            marginBottom: pxToDp(10),
            fontSize: pxToDp(26),
            color: colors.color999
        },
        cell_box: {
            marginTop: 0,
            borderTopWidth: pxToDp(1),
            borderBottomWidth: pxToDp(1),
            borderColor: colors.color999
        },
        cell_row: {
            height: pxToDp(70),
            justifyContent: "center"
        },
        cell_input: {
            //需要覆盖完整这4个元素
            fontSize: pxToDp(30),
            height: pxToDp(90)
        },
        cell_label: {
            width: pxToDp(234),
            fontSize: pxToDp(30),
            fontWeight: "bold",
            color: colors.color333
        },
        btn_submit: {
            margin: pxToDp(30),
            marginBottom: pxToDp(50),
            backgroundColor: "#6db06f"
        },
        map_icon: {
            fontSize: pxToDp(40),
            color: colors.color666,
            height: pxToDp(60),
            width: pxToDp(40),
            textAlignVertical: "center"
        },
        body_text: {
            paddingLeft: pxToDp(8),
            fontSize: pxToDp(30),
            color: colors.color333,
            height: pxToDp(60),
            textAlignVertical: "center"

            // borderColor: 'green',
            // borderWidth: 1,
        }
    });
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(BindDelivery);
