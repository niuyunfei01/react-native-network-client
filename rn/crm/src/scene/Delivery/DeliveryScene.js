//import liraries
import React, {PureComponent} from "react";
import {
    RefreshControl,
    ScrollView, StyleSheet,
    View,
    Text, TouchableOpacity, Image, InteractionManager, ToastAndroid
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import { WingBlank } from 'antd-mobile-rn'
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions"
import Config from "../../config";
import pxToDp from "../../util/pxToDp";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import _ from 'lodash';
mapStateToProps=state=> {
    const {mine, user, global} = state;
    return {mine: mine, user: user, global: global};
}
var ScreenWidth = Dimensions.get("window").width;
mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators({...globalActions}, dispatch)
    }
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
            currStoreId
        } = this.props.global;

        this.state={
            data:[],
            menu : []
        };
        this.onPress =this.onPress.bind(this);
        this.queryDeliveryList =this.queryDeliveryList.bind(this)
        this.showErrorToast = this.showErrorToast.bind(this)
    }
    componentDidMount () {

        this.queryDeliveryList();
    }
    showErrorToast(msg) {
        ToastAndroid.showWithGravity(msg,ToastAndroid.SHORT, ToastAndroid.CENTER)
    }
    onPress (route, params = {}) {
        InteractionManager.runAfterInteractions(() => {
            if(route == ''){
                this.showErrorToast("当前版本不支持改配送")
            }else{
                this.props.navigation.navigate(route, params);
            }

        });
    }
    queryDeliveryList(){
        this.setState({isRefreshing: true});
        this.props.actions.DeliveryList( this.props.global.currStoreId, (success,response) => {
            this.setState({data:response.data})
            this.setState({menu:response.menus});
            this.setState({isRefreshing: false});
            ToastAndroid.show('加载成功', ToastAndroid.SHORT);
        })
    }

    render() {

        let data = this.state.data?this.state.data:[];
        let menu =this.state.menu?this.state.menu:[];

        return (

            <ScrollView style={styles.container}

                  refreshControl={
                      <RefreshControl
                          refreshing={this.state.isRefreshing}
                          onRefresh={() => this.queryDeliveryList()}
                          tintColor='gray'
                      />
                  }
            >
                {data.length>0 ?(
                    <View>
                    <WingBlank style={{ marginTop: 20, marginBottom: 5,}}>
                        <Text style={{ marginBottom: 10 }}>已绑定</Text>
                    </WingBlank>
                    <View style={[block_styles.container]}>
                        {data.map(item=>(
                            <TouchableOpacity
                                style={[block_styles.block_box]}
                                onPress={() => this.showErrorToast("当前版本不能修改或删除")}
                                activeOpacity={customerOpacity}
                            >
                                {
                                    <Image
                                        style={[block_styles.block_img]}
                                        source={{uri: item.img}}
                                    />
                                }
                                <Text style={[block_styles.block_name]}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}

                        </View>
                    </View>
                ):(  <View>
                </View>)}
                <WingBlank style={{ marginTop: 20, marginBottom: 5,}}>
                    <Text style={{ marginBottom: 10 }}>未绑定</Text>
                </WingBlank>
                        <View style={[block_styles.container]}>

                            {menu.map(item=>(
                                <TouchableOpacity
                                    style={[block_styles.block_box]}
                                    onPress={() => this.onPress(item.route,item)}
                                    activeOpacity={customerOpacity}
                                >
                                    <Image
                                        style={[block_styles.block_img]}
                                        source={ !!item.img
                                            ? {uri: item.img}
                                            : require("../../img/My/touxiang180x180_.png")}
                                    />
                                    <Text style={[block_styles.block_name]}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

        );
    }
}

const styles = StyleSheet.create({
    fn_price_msg: {
        fontSize: pxToDp(30),
        color: "#333"
    },
    help_msg: {
        fontSize: pxToDp(30),
        fontWeight: "bold",
        textDecorationLine: "underline",
        color: "#00aeff"
    }
});
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
