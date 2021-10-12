import React from "react";
import PropTypes from "prop-types";
import Config from "../../config";
import JbbText from "./JbbText";
import {Linking, PixelRatio, Platform, TouchableWithoutFeedback, TouchableOpacity, View} from "react-native";
import {Styles} from "../../themes";
import colors from "../../styles/colors";
import Cts from "../../Cts";
import { Clipboard } from "react-native";
import JbbTextBtn from "./JbbTextBtn";
import {ToastShort} from "../../util/ToastUtils";

export default class OrderListItem extends React.PureComponent {

    static propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
        onPressDropdown: PropTypes.func,
        onPress: PropTypes.func,
        onRefresh: PropTypes.func,
    };

    constructor() {
        super();
    }

    render() {
        let {item, onPress} = this.props;
        let styleLine = {borderTopColor: colors.back_color, borderTopWidth: 1/PixelRatio.get() * 2, borderStyle: "dotted"};
        return (
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
                       <View style={[Styles.between, {paddingTop: 8}]}><JbbText>骑手: {item.shipStatusText}</JbbText>{!!item.ship_worker_mobile&&<JbbText onPress={() => this.dialCall(item.ship_worker_mobile)} style={{color: colors.main_color}}>呼叫</JbbText>}
                       </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
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

    onCopy = (text) => {
        Clipboard.setString(text)
        ToastShort("复制成功")
    }
}
