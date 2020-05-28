//import liraries
import React, {PureComponent} from "react";
import {
    RefreshControl,
    ScrollView, StyleSheet,
    View,
    Text
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
import {Cell, CellBody, CellHeader, Cells, CellsTitle} from "../../weui/Cell";
import {Input, Label, TextArea} from "../../weui/Form";
import {Button} from "../../weui/Button";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";

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

class BindDelivery extends PureComponent {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: '绑定配送信息',
        }
    }
    constructor(props) {
        super(props);
        const {
            currentUser,
            currStoreId,
            currentUserProfile,
        } = this.props.global;
        this.onBind =this.onBind.bind(this)
    }
    render() {
        return (
            <ScrollView style={styles.container}
                        automaticallyAdjustContentInsets={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
            >
                <CellsTitle style={styles.cell_title}>门店信息</CellsTitle>
                <Cells style={[styles.cell_box]}>
                    <Cell customStyle={[styles.cell_row]}>
                        <CellHeader>
                            <Label style={[styles.cell_label]}>店铺名称</Label>
                        </CellHeader>
                        <CellBody>
                            <Input
                                onChangeText={name => this.setState({name})}
                                value={name}
                                style={[styles.cell_input]}
                                placeholder="64个字符以内"
                                underlineColorAndroid="transparent" //取消安卓下划线

                            />
                        </CellBody>
                    </Cell>
                </Cells>
                <Button
                    onPress={() => {
                        this.onBind();
                    }}
                    type="primary"
                    style={styles.btn_submit}
                >
                    确认绑定
                </Button>
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
