import React from "react";
import PropTypes from "prop-types";
import Config from "../../config";
import JbbText from "./JbbText";
import {Line} from "./All";
import {PixelRatio, TouchableOpacity, View} from "react-native";
import {Styles} from "../../themes";
import colors from "../../styles/colors";

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
        return (
            <TouchableOpacity onPress={() => {onPress(Config.ROUTE_ORDER, {orderId: item.id})}}>
                <View style={[Styles.columnStart, {backgroundColor: colors.white, marginTop: 10, marginHorizontal: 10, padding: 6}]}>
                    <View style={[Styles.between]}><JbbText style={{color: colors.main_color}}>#{item.dayId} </JbbText>
                        <JbbText style={{color: colors.main_color}}>预计{item.expectTimeStr}送达</JbbText>
                    </View>
                    <View style={[Styles.between]}><JbbText>#{item.userName} </JbbText><JbbText>{item.expectTimeStr}</JbbText></View>
                    <View style={[Styles.row]}><JbbText>电话: </JbbText><JbbText>{item.mobile}</JbbText></View>
                    <View style={[Styles.columnStart]}>
                        <View><JbbText>{item.address}</JbbText></View>
                        <View style={[Styles.between]}><JbbText>{item.userName}</JbbText><JbbText>{item.mobile}</JbbText></View>
                    </View>

                    <View style={[Styles.columnStart, {borderTopColor: colors.back_color, borderTopWidth: 1/PixelRatio.get() * 2, borderStyle: "dashed" }]}>
                        <View style={[Styles.between]}><JbbText>下单: {item.orderTimeInList} </JbbText><JbbText>支付: {item.moneyInList}</JbbText></View>
                        <View style={[Styles.between]}><JbbText>单号: {item.id} </JbbText><JbbText>{item.platform_oid}</JbbText><JbbText style={{color: colors.main_color}}>复制</JbbText></View>
                    </View>
                </View>
                <Line/>
            </TouchableOpacity>
        );
    }
}