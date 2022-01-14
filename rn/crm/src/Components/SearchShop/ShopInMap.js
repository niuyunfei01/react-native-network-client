import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View,
    Platform
} from 'react-native'


import {WebView} from "react-native-webview"


import config from "../../config";
import {ToastLong} from "../../util/ToastUtils";


class ShopInMap extends Component {
    constructor(props) {
        super(props);


        this.state = {
            shopmsg: props.name
        }

    }

    componentWillMount() {
        ToastLong("加载中")
        // this.webview.reload()

    }


    render() {
        let gdkey = "85e66c49898d2118cc7805f484243909"
        let uri
        if (Platform.OS !== "ios") {
            //安卓下店铺名称展示有问题
            uri = "https://m.amap.com/navi/?dest=" +
                this.state.shopmsg.location +
                "&destName=" + "" +
                "&hideRouteIcon=1&key=" + gdkey

        } else {
            uri = "https://m.amap.com/navi/?dest=" +
                this.state.shopmsg.location +
                "&destName=" + this.state.shopmsg.name +
                "&hideRouteIcon=1&key=" + gdkey
        }

        return (
            <View style={{
                flexDirection: "column",
                flex: 1,
                maxHeight: 6000
            }}>
                <WebView
                    ref={(webview) => (this.webview = webview)}
                    source={{uri}}
                    style={{width: '100%', height: '100%', opacity: 0.99}}
                />


            </View>

        );
    }
}

export default ShopInMap;
