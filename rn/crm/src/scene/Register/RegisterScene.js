import React, {Component} from 'react';
import { View, ScrollView , Image} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {CellsTitle, Cell,CellHeader, CellBody, CellFooter, Label, Input, Cells} from "../../weui/index";

/**
 * ## Redux boilerplate
 */

function mapStateToProps ({register}) {
    return {

    }
}

function mapDispatchToProps (dispatch) {
    return {
        actions: bindActionCreators({ }, dispatch)
    }
}

class RegisterScene extends Component {

    static navigationOptions = ({ navigation }) => ({
        header: null
    });

    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: ''
        }
    }

    componentDidMount() {
        this.setState({

        })
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <ScrollView style={{ flex: 1 }}>
                    <CellsTitle>表单</CellsTitle>
                    <Cells>
                        <Cell>
                            <CellHeader><Label>qq</Label></CellHeader>
                            <CellBody>
                                <Input
                                    placeholder="请输入 qq 号"
                                    value={this.state.text}
                                />
                            </CellBody>
                        </Cell>
                        <Cell vcode error>
                            <CellHeader><Label>验证码</Label></CellHeader>
                            <CellBody><Input placeholder="请输入验证码" defaultValue="111" /></CellBody>
                            <CellFooter><Image source={{ uri: 'https://weui.io/images/vcode.jpg' }} /></CellFooter>
                        </Cell>
                    </Cells>
                </ScrollView>
            </View>
        )
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(RegisterScene)
