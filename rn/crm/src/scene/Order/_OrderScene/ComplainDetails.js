import React, {Component} from 'react';
import {Platform, View} from 'react-native'


import {WebView} from "react-native-webview"
import AppConfig from "../../../config";


class ComplainDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            weburl: AppConfig.apiUrl('help/delivery?type_id=1')
        }

    }

    componentWillMount() {
       console.log(this.state.weburl)

    }



    render() {

        let uri = this.state.weburl
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

export default ComplainDetails;
