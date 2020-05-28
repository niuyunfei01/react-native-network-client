//import liraries
import React, {PureComponent} from "react";
import {
    RefreshControl,
    ScrollView, StyleSheet,
    View,
    Text, TouchableOpacity, Image, InteractionManager
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import { Grid, WingBlank } from 'antd-mobile-rn'
import {bindActionCreators} from "redux";
import {
    fetchDutyUsers,
    fetchStoreTurnover,
    fetchUserCount,
    fetchWorkers,
    userCanChangeStore
} from "../../reducers/mine/mineActions";
import {fetchUserInfo} from "../../reducers/user/userActions";
import {default as globalActions, upCurrentProfile} from "../../reducers/global/globalActions";
import {get_supply_orders} from "../../reducers/settlement/settlementActions";
import NavigationItem from "../../widget/NavigationItem";
import tool from "../../common/tool";
import Config from "../../config";
import pxToDp from "../../util/pxToDp";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import native from "../../common/native";
const data = Array.from(new Array(9)).map((_val, i) => ({
    icon: 'https://os.alipayobjects.com/rmsportal/IptWdCkrtkAUfjE.png',
    text: `Name${i}`,
}));
function mapStateToProps (state) {
    const {mine, user, global} = state;
    return {mine: mine, user: user, global: global};
}
var ScreenWidth = Dimensions.get("window").width;
function mapDispatchToProps (dispatch) {
    return {
        dispatch,
        ...bindActionCreators(
            {
                fetchUserCount,
                fetchWorkers,
                fetchDutyUsers,
                fetchStoreTurnover,
                fetchUserInfo,
                upCurrentProfile,
                userCanChangeStore,
                get_supply_orders,
                ...globalActions
            },
            dispatch
        )
    };
}
const customerOpacity = 0.6;

class DeliveryScene extends PureComponent {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: '配送列表',
        }
    }
    constructor(props) {
        super(props);
        const {
        } = this.props.global;
        this.onPress =this.onPress.bind(this)
    }
    onPress (route, params = {}) {
        InteractionManager.runAfterInteractions(() => {
            this.props.navigation.navigate(route, params);
        });
    }
    render() {
        return (
            <ScrollView style={style.container}
                        automaticallyAdjustContentInsets={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
            >
                <WingBlank style={{ marginTop: 20, marginBottom: 5,}}>
                    <Text style={{ marginBottom: 10 }}>已绑定</Text>
                </WingBlank>
                <View style={[{ padding: 10 }]}>
                    <TouchableOpacity
                        style={[block_styles.block_box]}
                        onPress={() => this.onPress(Config.ROUTE_BIND_DELIVERY)}
                        activeOpacity={customerOpacity}
                    >
                        <Image
                            style={[block_styles.block_img]}
                            source={require("../../img/My/yunyingshouyi_.png")}
                        />
                        <Text style={[block_styles.block_name]}>配送设置</Text>
                    </TouchableOpacity>
                </View>

                <WingBlank style={{ marginTop: 20, marginBottom: 5,}}>
                    <Text style={{ marginBottom: 10 }}>未绑定</Text>
                </WingBlank>
                <View style={[{ padding: 10 }]}>
                    <TouchableOpacity
                        style={[block_styles.block_box]}
                        onPress={() => this.onPress(Config.ROUTE_SEETING_DELIVERY)}
                        activeOpacity={customerOpacity}
                    >
                        <Image
                            style={[block_styles.block_img]}
                            source={require("../../img/My/yunyingshouyi_.png")}
                        />
                        <Text style={[block_styles.block_name]}>配送设置</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[block_styles.block_box]}
                        onPress={() => this.onPress(Config.ROUTE_DELIVERY_LIST)}
                        activeOpacity={customerOpacity}
                    >
                        <Image
                            style={[block_styles.block_img]}
                            source={require("../../img/My/yunyingshouyi_.png")}
                        />
                        <Text style={[block_styles.block_name]}>配送设置</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[block_styles.block_box]}
                        onPress={() => this.onPress(Config.ROUTE_DELIVERY_LIST)}
                        activeOpacity={customerOpacity}
                    >
                        <Image
                            style={[block_styles.block_img]}
                            source={require("../../img/My/yunyingshouyi_.png")}
                        />
                        <Text style={[block_styles.block_name]}>配送设置</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

        );
    }
}
const  style = StyleSheet.create({
    container: {
        marginBottom: pxToDp(22),
        backgroundColor: colors.white
    },
})

const block_styles = StyleSheet.create({
    container: {
        marginBottom: pxToDp(22),
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: colors.white
    },
    block_box: {
        //剩1个格子用正常样式占位
        // width: pxToDp(239),
        // height: pxToDp(188),
        width: ScreenWidth / 4,
        height: ScreenWidth / 4,
        backgroundColor: colors.white,

        // borderColor: colors.main_back,
        // borderWidth: pxToDp(1),
        alignItems: "center"
    },
    empty_box: {
        //剩2个格子用这个样式占位
        width: pxToDp(478),
        height: pxToDp(188),
        backgroundColor: colors.white,

        borderColor: colors.main_back,
        borderWidth: pxToDp(1),
        alignItems: "center"
    },
    block_img: {
        marginTop: pxToDp(30),
        marginBottom: pxToDp(16),
        width: pxToDp(60),
        height: pxToDp(60)
    },
    block_name: {
        color: colors.color666,
        fontSize: pxToDp(26),
        lineHeight: pxToDp(28),
        textAlign: "center"
    },
    notice_point: {
        width: pxToDp(30),
        height: pxToDp(30),
        borderRadius: pxToDp(15),
        backgroundColor: '#f00',
        position: 'absolute',
        right: pxToDp(60),
        top: pxToDp(20),
        zIndex: 99
    }
});
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(DeliveryScene);
