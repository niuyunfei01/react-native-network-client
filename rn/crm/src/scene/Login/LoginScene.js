import React, {PureComponent} from 'react'
import {TouchableOpacity, StyleSheet, View, ScrollView, Text, ImageBackground, Image} from 'react-native'
import { FormLabel, Button as EButton, FormInput, FormValidationMessage } from 'react-native-elements'
import Dimensions from 'Dimensions'
import {Paragraph} from "../../widget/Text";
import colors from '../../widget/color'

import * as authActions from '../../reducers/auth/authActions'
import * as globalActions from '../../reducers/global/globalActions'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";


var styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        alignSelf: 'stretch',
        width: null,
    },
    container: {
        flexDirection: 'column',
        flex: 1,
        marginTop: 10
    },
    header: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    mark: {
        height: 100,
        width: 100
    },
    forgotContainer: {

    }
})

var {height, width} = Dimensions.get('window')

function mapStateToProps (state) {
    return {
        auth: state.auth,
    }
}

function mapDispatchToProps (dispatch) {
    return {
        actions: bindActionCreators({ ...authActions,...globalActions }, dispatch)
    }
}

class LoginScene extends PureComponent {

    static navigationOptions = ({ navigation }) => ({
        header: null
    });

    constructor(props) {
        super(props)

        this.onMobileChanged = this.onMobileChanged.bind(this)
        this.onLogin = this.onLogin.bind(this)
    }

    onMobileChanged() {

    }

    onLogin() {

    }

    render () {
        return ( <Image style={styles.backgroundImage} source={require('../../img/Login/login_bg.png')}>
                <View style={styles.container}>
            <ScrollView horizontal={false} width={width} height={height} >
                <View style={{marginTop: 100}}>
                    <View style={styles.inputs}>
                        <FormInput onChangeText={this.onMobileChanged}
                                   keyboardType="numberic"
                                   placeholder="请输入手机号"/>
                        <FormValidationMessage>Error message</FormValidationMessage>
                    </View>

                    <View style={styles.inputs}>
                        <FormInput onChangeText={this.onMobileChanged} placeholder="请输入密码"/>
                        <FormValidationMessage>Error message</FormValidationMessage>
                    </View>

                    <View>
                        <TouchableOpacity>
                            <Text>比邻鲜使用协议</Text>
                        </TouchableOpacity>
                    </View>

                    <EButton disabled={false} color={colors.main_color} title="登录"
                             onPress={this.onLogin}></EButton>

                    <Paragraph>语音技术由科大讯飞提供支持</Paragraph>

                </View>
            </ScrollView>
            </View>
        </Image>)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScene)