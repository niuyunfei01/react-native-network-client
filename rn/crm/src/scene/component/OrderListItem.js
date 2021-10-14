import React from "react";
import PropTypes from "prop-types";
import Config from "../../config";
import JbbText from "./JbbText";
import ReactNative, {Linking, PixelRatio, Platform, TouchableWithoutFeedback, TouchableOpacity, View, Modal} from "react-native";
import {Styles} from "../../themes";
import colors from "../../styles/colors";
import Cts from "../../Cts";
import { Clipboard } from "react-native";
import JbbTextBtn from "./JbbTextBtn";
import {ToastShort} from "../../util/ToastUtils";
import pxToDp from "../../util/pxToDp";

const {StyleSheet} = ReactNative

const ProgressData = [
    { title: '配送完成', letter: ['美团众包-已送达'], isCurrent: false },
    { title: '配送中', letter: ['张三-17678024876'], isCurrent: false },
    { title: '待配送', letter: ['张三-17678024876'], isCurrent: true },
    { title: '自动呼叫', letter: ['美团众包-呼叫中', '美团快速达-呼叫中'], isCurrent: true, status: 0 }
];

const initState = {
    modalType: false
}

export default class OrderListItem extends React.PureComponent {

    static propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
        onPressDropdown: PropTypes.func,
        onPress: PropTypes.func,
        onRefresh: PropTypes.func,
    };

    state = initState;

    constructor() {
        super();
    }

    render() {
        let {item, onPress} = this.props;
        console.log('返回的订单状态数据', item)
        let styleLine = {borderTopColor: colors.back_color, borderTopWidth: 1/PixelRatio.get() * 2, borderStyle: "dotted"};
        return (
            <>
            <TouchableWithoutFeedback onPress={() => {onPress(Config.ROUTE_ORDER, {orderId: item.id})}}>
                <View style={[Styles.columnStart, {backgroundColor: colors.white, marginTop: 10, paddingVertical: 10, marginHorizontal: 12, paddingHorizontal: 12}]}>
                    <View style={[Styles.between, {paddingBottom: 8}]}>
                      <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between"
                      }}>
                        <If condition={item.is_right_once}>
                          <JbbText
                            style={{
                              backgroundColor: colors.main_color,
                              color: colors.white,
                              borderRadius: 3,
                              paddingLeft: 2,
                              paddingRight: 2,
                              marginRight: 4,
                              fontWeight: 'bold',
                              fontSize: item.dayIdSize || 16,
                            }}>预</JbbText>
                        </If>
                        <JbbText style={{
                          color: colors.main_color,
                          fontSize: item.dayIdSize || 16,
                          fontWeight: 'bold'
                        }}>{item.dayIdInList} </JbbText>
                      </View>
                        {Number(item.orderStatus) !== Cts.ORDER_STATUS_INVALID && <JbbText style={{color: colors.main_color, fontSize: 16, fontWeight: 'bold'}}>{item.expectTimeStrInList}</JbbText>}
                        {Number(item.orderStatus) === Cts.ORDER_STATUS_INVALID && <JbbText style={{color: colors.warn_color, fontSize: 16, fontWeight: 'bold'}}>订单已取消</JbbText>}
                    </View>
                    <View style={[Styles.row, {paddingBottom: 8}]}>
                        <JbbText style={{fontSize: 16}}>{item.userName} </JbbText>
                        <JbbTextBtn onPress={() => this.onClickTimes(item) }>
                            {item.order_times <= 1 ? '新客户' : `第${item.order_times}次`} </JbbTextBtn>
                    </View>
                    <View style={[Styles.row]}><JbbText>电话: </JbbText>
                        <JbbText>{item.mobileReadable}</JbbText>
                        <JbbText onPress={() => this.dialCall(item.mobile)} style={{paddingBottom: 8, color: colors.main_color, paddingStart: 2}}>呼叫</JbbText></View>
                    <View style={[Styles.columnStart, {paddingBottom: 8}]}>
                        <View style={[Styles.row]}><JbbText>地址: </JbbText><JbbText style={{marginRight: 24}}>{item.address}</JbbText></View>
                    </View>

                    <View style={[Styles.columnStart, styleLine]}>
                        <View style={[Styles.between, {paddingTop: 8}]}><JbbText>下单: {item.orderTimeInList} </JbbText><JbbText>{item.moneyLabel}: ¥{item.moneyInList}</JbbText></View>
                        <View style={[Styles.between]}>
                            <JbbText style={{paddingTop: 8}}>单号: {item.id} </JbbText>
                            <View style={[Styles.between]}>
                                <JbbText selectable={true} style={{paddingTop: 8}}>{item.platform_oid}</JbbText>
                                <JbbText onPress={()=>this.onCopy(item.platform_oid)} style={{color: colors.main_color, paddingStart: 2, paddingTop: 8}}>复制</JbbText>
                            </View>
                        </View>
                    </View>
                    <View style={[Styles.columnStart, styleLine, {marginTop: 8}]}>
                       <View style={[Styles.between, {paddingTop: 8}]}><JbbText>骑手: {item.shipStatusText}</JbbText><JbbText onPress={() => this.setState({modalType:true})} style={{color: colors.main_color}}>查看</JbbText>
                       </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <Modal visible={this.state.modalType} onRequestClose={()=>this.setState({modalType: false})}
                   transparent={true} animationType="slide"
            >
                <TouchableOpacity style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.25)'}} onPress={()=>this.setState({modalType: false})}/>
                <View style={{backgroundColor: colors.white, flex: 1}}>
                    <TouchableOpacity style={[styles.toOnlineBtn, {borderRightWidth: 0}]}>
                        <View style={{ flex: 1}}>
                            <MapProgress data={[...ProgressData]} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.btn}>
                        {1===1 && <TouchableOpacity><JbbText style={styles.btnText}>我要自己送</JbbText></TouchableOpacity>}
                        {1!==1 && <TouchableOpacity><JbbText style={styles.btnText}>加小费</JbbText></TouchableOpacity>}
                        {1!==1 && <TouchableOpacity><JbbText style={styles.btnText}>追加配送</JbbText></TouchableOpacity>}
                        {1===1 && <TouchableOpacity><JbbText style={styles.btnText}>去充值</JbbText></TouchableOpacity>}
                        {1!==1 && <TouchableOpacity><JbbText style={styles.btnText}>暂停调度</JbbText></TouchableOpacity>}
                        {1!==1 && <TouchableOpacity><JbbText style={styles.btnText}>取消配送</JbbText></TouchableOpacity>}
                        {1!==1 && <TouchableOpacity><JbbText style={styles .btnText}>呼叫第三方配送</JbbText></TouchableOpacity>}
                        {1!==1 && <TouchableOpacity><JbbText style={styles .btnText}>补送</JbbText></TouchableOpacity>}
                        {1!==1 && <TouchableOpacity><JbbText style={styles .btnText}>投诉</JbbText></TouchableOpacity>}
                        <TouchableOpacity><JbbText style={styles .btnText}>联系骑手</JbbText></TouchableOpacity>
                    </View>
                </View>
            </Modal>
            </>
        );
    }

    onClickTimes = (item) => {
        let searchTerm = `@@${item['real_mobile']}|||store:${item['store_id']}`
        const {navigation} = this.props
        navigation.navigate(Config.ROUTE_ORDER_SEARCH_RESULT, {term: searchTerm, max_past_day: 10000})
    }

    dialCall = (number) => {
        let phoneNumber = '';
        if (Platform.OS === 'android') {
            phoneNumber = `tel:${number}`;
        } else {
            phoneNumber = `telprompt:${number}`;
        }
        Linking.openURL(phoneNumber).then(r => {console.log(`call ${phoneNumber} done:`, r)});
    }

    onOpenModal(modalType) {
        this.setState({
            modalType: modalType
        }, () => {
        })
    }

    onCopy = (text) => {
        Clipboard.setString(text)
        ToastShort("复制成功")
    }
}

const styles = StyleSheet.create({
    verticalLine: {
        backgroundColor: 'green',
        width: 2,
        height: '150%',
        position: 'absolute',
        marginLeft: 35,
        marginTop: 20,
    },
    verticalLine1: {
        backgroundColor: '#CBCBCB',
        width: 2,
        height: '150%',
        position: 'absolute',
        marginLeft: 35,
        marginTop: 20,
    },
    verticalLine2: {
        backgroundColor: colors.default_container_bg,
        width: 2,
        height: '150%',
        position: 'absolute',
        marginLeft: 35,
        marginTop: 20,
    },
    verticalWrap: {
        justifyContent: 'space-between',
        height: '75%',
    },
    itemWrap: {
        width: '100%',
        height: 40,
        marginLeft: 20,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointWrap: {
        backgroundColor: '#CBCBCB',
        height: 20,
        width: 20,
        borderRadius: 20,
        marginLeft: 5,
        alignItems: 'center',
    },
    pointWrap1: {
        backgroundColor: 'green',
        borderRadius: 20,
        height: 20,
        width: 20,
        marginLeft: 5,
    },
    markerText: { color: 'black', fontSize: pxToDp(30)},
    markerText1: {
        color: colors.color666,
        fontSize: pxToDp(24),
        position: 'absolute',
        marginLeft: 50,
        marginTop: 35,
    },
    markerText2: {
        color: colors.color666,
        fontSize: pxToDp(24),
        position: 'absolute',
        marginLeft: 50,
        marginTop: 55,
    },
    currentMarker: { color: 'green', fontSize: pxToDp(30)},
    toOnlineBtn: {
        borderRightWidth: pxToDp(1),
        borderColor: colors.colorBBB,
        flexDirection: "row",
        justifyContent: 'flex-start',
        alignItems: 'center',
        flex: 1
    },
    btn: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingBottom: pxToDp(50)
    },
    btnText: {
        height: 40,
        width: "100%",
        backgroundColor: "#808080",
        color: 'white',
        fontSize: pxToDp(30),
        fontWeight: "bold",
        textAlign: "center",
        paddingTop: pxToDp(15),
        paddingHorizontal: pxToDp(30),
        borderRadius: pxToDp(5)
    }
});

const MapProgress = (props) => {
    if (!props.data || props.data.lenght === 0) return null;

    return (
        <View style={{ flex: 1 }}>
            {/*<View style={styles.verticalLine}></View>*/}
            <View style={styles.verticalWrap}>

                {props.data.map((item) => (
                    <View>
                         {/*<View style={item.status === 0 ? styles.verticalLine2 : styles.verticalLine1}></View>*/}
                        {/*<View style={item.isCurrent ? styles.verticalLine : styles.verticalLine1}></View>*/}
                    {item.status === 0 ? <></> : <View style={item.isCurrent ? styles.verticalLine : styles.verticalLine1}></View>}
                    <View style={styles.itemWrap}>
                        <View style={item.isCurrent ? styles.pointWrap1 : styles.pointWrap}></View>
                        <View style={{ marginLeft: 5, flex: 1 }}>
                            <JbbText style={item.isCurrent ? styles.currentMarker : styles.markerText}>
                                {item.title}
                            </JbbText>
                        </View>
                    </View>
                        <JbbText
                            style={[
                                styles.markerText1
                            ]}>
                            {item.letter[0]}
                        </JbbText>
                        <JbbText
                            style={[
                                styles.markerText2
                            ]}>
                            {item.letter[1]}
                        </JbbText>
                    </View>
                ))}
            </View>
        </View>
    );
};

