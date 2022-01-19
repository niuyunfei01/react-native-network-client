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


class StoreOrderMsg extends Component {
    constructor(props) {
        super(props);


    }

    componentWillMount() {

    }


    render() {


        return (
            <View style={{
                flexDirection: "column",
                flex: 1,
                maxHeight: 6000
            }}>
                <Text>33333</Text>


            </View>

        );
    }
}

export default StoreOrderMsg;
