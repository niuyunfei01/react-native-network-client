import React from 'react'
import {connect} from "react-redux";
import HttpUtils from "../../../util/http";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {Clipboard, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../../util/pxToDp";
import colors from "../../../styles/colors";
import CallImg from "../CallImg";
import native from "../../../common/native";
import tool from "../../../common/tool";
import {showError, ToastShort} from "../../../util/ToastUtils";

function mapStateToProps(state) {
    const {global} = state;
    return {global: global};
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch, ...bindActionCreators({
            ...globalActions
        }, dispatch)
    }
}

class ComplainDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            accessToken: this.props.global.accessToken,
            delivery_id: this.props.route.params.id,
            store_name: '',
            store_id: '',
            list: [],
            content: '',
            mobile: '',
            complain: []
        }
    }






    render() {
        return (
            <View>
                <View>
                    <Text>1111</Text>
                </View>
            </View>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComplainDetails)
