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
             menu : [
                {id: 6, name: '闪送',img:require("../../img/My/yunyingshouyi_.png"),route:''},
                {id: 4, name: '达达',img:require("../../img/My/yunyingshouyi_.png"),route:''},
                {id: 7, name: '美团跑腿',img:require("../../img/My/yunyingshouyi_.png"),route:''},
                {id: 12, name: '顺丰同城',img:require("../../img/My/yunyingshouyi_.png"),route:Config.ROUTE_BIND_DELIVERY},
                {id: 1, name: '蜂鸟众包',img:require("../../img/My/yunyingshouyi_.png"),route:''},
                {id: 11, name: '点我达',img:require("../../img/My/yunyingshouyi_.png"),route:''},
            ]
        };
        this.onPress =this.onPress.bind(this);
        this.queryDeliveryList =this.queryDeliveryList.bind(this)
    }
    componentDidMount () {
        this.queryDeliveryList();
    }
    onPress (route, params = {}) {
        InteractionManager.runAfterInteractions(() => {
            this.props.navigation.navigate(route, params);
        });
    }
    queryDeliveryList(){
        let{menu} = this.state;
        this.props.actions.DeliveryList( this.props.global.currStoreId, (success,response) => {
            this.setState({data:response})
            response.map(index=>(
                _.drop(menu, _.findIndex(menu, (o)=> { return o.id ==index.type }))
            ))
            this.setState(menu)
            this.setState({data:response})
        })
    }

    render() {

        let data = this.state.data?this.state.data:[];
        return (

            <View style={styles.container}>
                {data.length>0 ?(
                    <View>
                    <WingBlank style={{ marginTop: 20, marginBottom: 5,}}>
                        <Text style={{ marginBottom: 10 }}>已绑定</Text>
                    </WingBlank>
                    <View style={[block_styles.container]}>
                        {data.map(item=>(
                            <TouchableOpacity
                                style={[block_styles.block_box]}
                                onPress={() => this.onPress(Config.ROUTE_BIND_DELIVERY,{name:item.name,type:item.id})}
                                activeOpacity={customerOpacity}
                            >
                                {
                                    <Image
                                        style={[block_styles.block_img]}
                                        source={item.img}
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

                            {this.state.menu.map(item=>(
                                <TouchableOpacity
                                    style={[block_styles.block_box]}
                                    onPress={() => this.onPress(item.route,{name:item.name,type:item.id})}
                                    activeOpacity={customerOpacity}
                                >
                                    <Image
                                        style={[block_styles.block_img]}
                                        source={item.img}
                                    />
                                    <Text style={[block_styles.block_name]}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

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
