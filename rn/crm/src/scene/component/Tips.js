import ReactNative from "react-native";
import {Cell, CellBody, CellFooter, CellsTitle, Cells} from "../../weui";
import Button from "react-native-vector-icons/Entypo";
import colors from "../../styles/colors";
import React, {Component} from "react";
import PropTypes from "prop-types";


const {
    StyleSheet,
    Text,
    TouchableOpacity,

    View,

} = ReactNative;

import pxToDp from "../../util/pxToDp";
import Config from "../../config";
import {ToastShort} from "../../util/ToastUtils";
import native from "../../common/native";
import {Styles} from "../../themes";
import JbbText from "./JbbText";


class Tips extends Component {
    static propTypes = {
        onItemClick: PropTypes.func,
    }
    state = {
        addTipDialog: true,
        addTipMoney: true,


    }

    onPress(route, params = {}) {
        this.props.onItemClick();

        this.props.navigation.navigate(route, params);
    }

    onCallThirdShips() {

        this.props.onItemClick();
        this.props.navigation.navigate(Config.ROUTE_ORDER_TRANSFER_THIRD, {
            orderId: this.props.orderId,
            storeId: this.props.storeId,
            selectedWay: [],
            onBack: (res) => {
                if (res && res.count > 0) {
                    ToastShort('发配送成功')
                } else {
                    ToastShort('发配送失败，请联系运营人员')
                }
            }
        });
    }

    render() {
        return (

            <View style={{
                padding: 5,
                paddingBottom: 10
            }}>
                <Cells>
                    <CellsTitle style={styles.cell_title}>长时间没骑手接单怎么办？</CellsTitle>

                    <Cell customStyle={[styles.cell_row]}>
                        <TouchableOpacity
                            onPress={() => {

                                this.onCallThirdShips()
                            }}
                        >

                            <View style={[styles.cell_body]}>
                                <Text>1.追加同等价位的配送（蜂鸟众包：闪送）</Text>

                            </View>
                            <Button name='chevron-right' style={styles.right_btn}/>
                        </TouchableOpacity>
                    </Cell>

                    <Cell customStyle={[styles.cell_row]}>
                        <TouchableOpacity
                            onPress={() => {
                                this.onCallThirdShips()
                            }}
                        >

                            <View style={[styles.cell_body]}>
                                <Text>2.使用接单率高的配送方式（美团快速达）</Text>

                            </View>
                            <Button name='chevron-right' style={styles.right_btn}/>
                        </TouchableOpacity>
                    </Cell>
                    <Cell customStyle={[styles.cell_row]}>
                        <TouchableOpacity
                            onPress={() => {
                                console.log("1111")
                            }}
                        >

                            <View style={[styles.cell_body]}>
                                <Text style={{fontsize: 14, color: colors.main_color}}> 3.加小费</Text>
                            </View>
                            <Button name='chevron-right' style={styles.right_btn}/>
                        </TouchableOpacity>
                    </Cell>
                    <Cell customStyle={[styles.cell_row]}>
                        <TouchableOpacity
                            onPress={() => {
                                console.log("134")
                                // Config.ROUTE_DELIVERY_INFO
                                this.onPress(Config.ROUTE_DELIVERY_LIST)
                            }}
                        >

                            <View style={[styles.cell_body]}>
                                <JbbText>4.您开通的配送较少 请开通美团快速达：顺丰（不需审核，立即开通）</JbbText>
                                <Button name='chevron-right' style={styles.right_btn2}/>
                            </View>
                        </TouchableOpacity>
                    </Cell>

                </Cells>
            </View>

        )
    }
}

const styles = StyleSheet.create({
    cell_body: {
        width: 280,
        paddingTop: pxToDp(30),
        paddingBottom: pxToDp(30),
    },

    right_btn: {
        position: "absolute",
        top: pxToDp(20),
        right: pxToDp(-100),

        fontSize: pxToDp(50),
        textAlign: 'center',
        width: pxToDp(90),
        height: pxToDp(70),
        color: colors.color999,

    },
    right_btn2: {
        position: "absolute",
        top: pxToDp(40),
        right: pxToDp(-100),

        fontSize: pxToDp(50),
        textAlign: 'center',
        width: pxToDp(90),
        height: pxToDp(70),
        color: colors.color999,

    },
})
export default Tips;
