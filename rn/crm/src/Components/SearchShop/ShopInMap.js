
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native'


import { WebView } from "react-native-webview"

import Config from "../../config";
import config from "../../config";




class ShopInMap extends Component {
    navigationOptions = ({navigation}) => {
        navigation.setOptions({
            headerTitle: '',
            headerLeft: () => {
                return (
                    <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
                        this.props.navigation.goBack()
                    }}>
                        <Text style={{
                            paddingHorizontal: 9,
                            paddingTop: 16,
                            color: '#2b2b2b',
                            fontWeight: 'bold',
                            marginLeft:20
                        }}>重新选择</Text>

                    </TouchableOpacity>
                )
            },
            headerRight: () => {
                return (
                    <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => {
                       //用户确定  返回选择地址页面
                        this.props.route.params.onBack( this.props.route.params);
                        if( this.props.route.params.isType=="fixed"){
                            this.props.navigation.navigate(config.ROUTE_STORE_ADD, this.props.route.params);
                        }else if (this.props.route.params.isType=="orderSetting"){
                            this.props.navigation.navigate(config.ROUTE_ORDER_SETTING, this.props.route.params);
                        }
                        else{
                            this.props.navigation.navigate('Apply', this.props.route.params);
                        }

                    }}>
                        <Text style={{
                            paddingHorizontal: 9,
                            paddingTop: 16,
                            color: '#2b2b2b',
                            fontWeight: 'bold',
                            marginRight:20
                        }}>确定</Text>

                    </TouchableOpacity>
                )
            },

        })
    }
    constructor(props) {
        super(props);
        this.navigationOptions(this.props)
        this.state = {
                shopmsg:this.props.route.params
        }

    }

    render() {
        let gdkey ="85e66c49898d2118cc7805f484243909"
        let uri="https://m.amap.com/navi/?dest=" +
            this.state.shopmsg.location+
            "&destName=" +
            JSON.stringify(this.state.shopmsg.name) +
            "&hideRouteIcon=1&key="+gdkey
        return (
            <View style={{
                flexDirection: "column",
                flex: 1,
                maxHeight: 6000
            }}>
                <WebView
                    source={{uri}}
                    style={{width:'100%',height:'100%'}}
                />
            </View>

        );
    }
}

export default ShopInMap;
