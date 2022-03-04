import React, {PureComponent} from "react";
import {Alert, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View,Modal,Image,} from 'react-native'
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import {hideModal, showModal} from "../../util/ToastUtils";
import * as globalActions from "../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import Styles from "../../themes/Styles";
import tool from "../../common/tool";
import {Cell, CellBody, CellFooter, Cells, CellsTitle, Icon} from "../../weui";
import colors from "../../styles/colors";
import {Button, Provider} from "@ant-design/react-native";
import BottomModal from "../component/BottomModal";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import config from "../../config";
import AppConfig from "../../config";
import native from "../../common/native";

function mapStateToProps(state) {
    const {mine, global} = state;
    return {mine: mine, global: global};
}

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators({...globalActions}, dispatch)
    }
}

class DeliveryInfo extends PureComponent {
    constructor(props) {
        super(props)
        let delivery_id = this.props.route.params.delivery_id;
        this.state = {
            show_body: true,
            isModal:true

        }
    }





    sync_shop_info() {
        showModal("同步中...")
        const {accessToken, currStoreId} = this.props.global
        const api = `/v1/new_api/Delivery/sync_shop_info?access_token=${accessToken}`
        HttpUtils.post.bind(this.props)(api, {store_id: currStoreId, delivery_id: this.state.delivery_id}).then((res) => {
            if (!res.ok) {
                this.setState({
                    apply_status: 3,
                    err_msg: [res.msg],
                    show_btn_type: 4,
                })
            } else {
                this.setState({
                    show_btn_type: this.state.need_audit ? 4 : 5,
                    apply_status: this.state.need_audit ? 1 : 2,
                })
            }

            hideModal()
        }).catch(() => {
            hideModal()
        })
    }



    renderFooter() {
        let canOpen = true
        return (
            <View style={styles.footerContainer}>
                <View style={[styles.footerItem, styles.footerBtn, styles.errorBtn]}>
                    <Text style={styles.footerBtnText}>删除门店</Text>
                </View>
                <TouchableOpacity style={{flex: 1}} onPress={() => {
                    this.setState({isModal: true})
                }}>
                <View style={[styles.footerItem, styles.footerBtn,styles.successBtn]}>
                    <Text style={styles.footerBtnText}>添加门店</Text>
                </View>
                </TouchableOpacity>
            </View>

        )
    }
    renderBody() {
        const business_status = this.state.business_status
        const store_id = this.props.global.currStoreId
        const vendor_id = this.props.global.config.vendor.id
        let items = []
        for (let i in business_status) {
            const store = business_status[i]
            let store_name_str = ''
            if (store.name && store.name.length >= 13) {
                store_name_str = store.name.substring(0, 13) + '...'
            } else {
                store_name_str = store.name
            }
            let suspend_confirm_order = store.suspend_confirm_order === '0' ? true : false
            items.push(
                <TouchableOpacity style={{}} onPress={() => {
                    this.mixpanel.track("mine.wm_store_list.click_store", {store_id, vendor_id});
                    this.onPress(Config.ROUTE_SEETING_DELIVERY, {
                        ext_store_id: store.id,
                        store_id: store_id,
                        poi_name: store.poi_name,
                        showBtn: store.zs_way === '商家自送',
                    })
                }}>
                    <View style={[Styles.between, {
                        paddingTop: pxToDp(14),
                        paddingBottom: pxToDp(14),
                        borderTopWidth: Metrics.one,
                        borderTopColor: colors.colorDDD,
                        backgroundColor: colors.white
                    }]}>

                        <View style={{
                            width: pxToDp(120),
                            height: pxToDp(130),
                            paddingLeft: pxToDp(20),
                            paddingRight: pxToDp(20),
                            marginRight: pxToDp(20),
                        }}>

                            <Image style={{
                                width: pxToDp(100),
                                height: pxToDp(100),
                                marginTop: pxToDp(20),
                            }} source={this.getPlatIcon(store.icon_name)}/>

                            <TouchableOpacity onPress={() => this.showAlert()} style={{
                                position: 'absolute',
                                left: pxToDp(82),
                                top: pxToDp(4),
                                textAlign: 'center',
                            }}>
                                {store.business_id ? <AntDesign name='earth' style={[styles.right_btn, {
                                    fontSize: pxToDp(35)
                                }]}/> : null}
                            </TouchableOpacity>

                        </View>

                        <View style={{flexDirection: 'column', paddingBottom: 5, flex: 1}}>
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginRight: pxToDp(20),
                                position: "relative"
                            }}>
                                <JbbText style={styles.wm_store_name}>{store_name_str}</JbbText>
                                <JbbText
                                    style={[!store.open ? Styles.close_text : Styles.open_text, {
                                        fontSize: pxToDp(24),
                                        position: 'absolute',
                                        top: "10%",
                                        right: "3%"
                                    }]}>{store.status_label}</JbbText>
                            </View>
                            <View style={[Styles.between, {marginTop: pxToDp(4), marginEnd: pxToDp(10)}]}>
                                {store.show_open_time &&
                                    <Text style={{
                                        color: '#595959',
                                        width: pxToDp(300),
                                        fontSize: pxToDp(20)
                                    }}>开店时间：{store.next_open_desc || store.next_open_time}</Text>}
                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={{
                                    fontSize: pxToDp(20),
                                    paddingTop: pxToDp(7),
                                }}>
                                    {store.zs_way}
                                </Text>
                                <View style={{flex: 1,}}></View>
                            </View>
                            {
                                store.zs_way === '商家自送' && <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: pxToDp(10)
                                }}>
                                    <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                                        <Image
                                            source={store.auto_call == '已开启自动呼叫' ? require("../../img/My/correct.png") : require("../../img/My/mistake.png")}
                                            style={{width: pxToDp(24), height: pxToDp(24), marginRight: pxToDp(10)}}/>
                                        <JbbText>自动呼叫配送</JbbText>
                                    </View>
                                    <View style={{flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                                        <Image
                                            source={suspend_confirm_order == 1 ? require("../../img/My/correct.png") : require("../../img/My/mistake.png")}
                                            style={{width: pxToDp(24), height: pxToDp(24), marginRight: pxToDp(10)}}/>
                                        <JbbText>自动接单</JbbText>
                                    </View>
                                    <View style={{width: pxToDp(70)}}>
                                        <Icon name='chevron-thin-right' style={[styles.right_btns]}/>
                                    </View>
                                </View>
                            }
                        </View>
                    </View>
                </TouchableOpacity>)
        }

        return (
            <ScrollView style={styles.bodyContainer}>
                {items}
            </ScrollView>
        )
    }

    render() {

        return (
            <View style={{flex: 1}}>
                {this.renderBody()}
                    {this.renderFooter()}

                <Modal visible={this.state.isModal} hardwareAccelerated={true}
                       onRequestClose={() => this.setState({isModal: false})}
                       transparent={true}>
                    <View style={{flexGrow: 1, backgroundColor: 'rgba(0,0,0,0.25)',}}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => {
                            this.setState({isModal: false})
                        }}></TouchableOpacity>
                        <View style={{
                            backgroundColor: colors.white,
                            height: pxToDp(400),
                            borderTopLeftRadius: pxToDp(30),
                            borderTopRightRadius: pxToDp(30),
                        }}>
                            <View style={{flexDirection: 'row'}}>
                                 <View style={[styles.title]}>
                                     <Text>添加门店</Text>
                                 </View>
                            </View>
                            <View style={[styles.shopitem]}>
                                <View style={[styles.shoplabel]}><Text>门店们称</Text></View>
                                <View style={[styles.shopicon]}>
                                    {/*../../img/My/correct.png*/}
                                    <Image style={styles.add}
                                           source={require('../../img/My/correct.png')}/>
                                    {/*<Image style={styles.add}*/}
                                    {/*       source={require('../../img/Goods/zengjiahui_.png')}/>*/}
                                </View>
                            </View>

                            <View style={[styles.footbtn]}>
                               <Text style={[styles.footbtntxt]}>确定</Text>
                            </View>

                        </View>
                    </View>

                </Modal>
            </View>

        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryInfo)
const styles = StyleSheet.create({
    footerContainer: {
        flexDirection: 'row',
        height: pxToDp(80),
        width: '80%',
        margin:'10%',
    },
    footerItem: {
        marginLeft: '5%',
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    footerBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%'
    },
    successBtn: {
        backgroundColor: '#59b26a'
    },
    errorBtn: {
        backgroundColor: '#999999',
        color:'white'
    },
    title:{
        width: '100%',
        marginTop:pxToDp(30),
        alignItems: 'center',
    },
    shopitem:{
        flexDirection: 'row',
        padding:pxToDp(30)
    },
    shoplabel:{
        width:'80%',

    },
    footerBtnText:{
        color:'white',
    },
    shopicon:{
        width:'10%',
    },
    footbtn:{
        position:'absolute',
        bottom:0,
        borderTopWidth:pxToDp(1),
        borderTopColor:'#999999',
        height: pxToDp(100),
        width:'100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footbtntxt:{
        fontWeight:'bold',
        fontSize:pxToDp(40),
        color:colors.main_color,
    },
    add:{
        width:pxToDp(30),
        height:pxToDp(30),
        marginLeft: pxToDp(30)
    }
})
