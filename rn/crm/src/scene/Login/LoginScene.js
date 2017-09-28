import React, {PureComponent} from 'react'
import {TouchableOpacity, StyleSheet, View, ScrollView, Text, ImageBackground, Image, Button, ToastAndroid} from 'react-native'
import { FormLabel, Button as EButton, FormInput, FormValidationMessage } from 'react-native-elements'
import Dimensions from 'Dimensions'
import {Paragraph} from "../../widget/Text";
import colors from '../../styles/colors'
import pxToDp from '../Alert/pxToDp'
import Toast from '../../weui/Toast'

let {CountDownText} = require('react-native-sk-countdown');

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

    },
    counter: {
        fontSize: pxToDp(22),
        color: '#999999',
        alignSelf: 'center',
        borderRadius:pxToDp(40),
        borderWidth: 1,
        borderColor: '#999999'
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

    static navigationOptions = {
        headerStyle: {
            position: 'absolute',
            top: 0,
            left: 0
        },
        headerBackTitleStyle: {
            opacity: 0,
        },
        headerTintColor: '#fff'
    };
    constructor(props) {
        super(props);
        this.timeouts = [];
        this.state = {
            mobile: '',
            password: '',
            doingReqSmsCode: false,
            reRequestAfterSeconds: 60
        };
        this.onMobileChanged = this.onMobileChanged.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.onRequestSmsCode = this.onRequestSmsCode.bind(this)
        this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this)
    }

    clearTimeouts() {
        this.timeouts.forEach(clearTimeout);
    }

    componentWillUnmount() {
        this.clearTimeouts();
    }

    onRequestSmsCode() {
        if (this.state.mobile) {
            this.setState({doingReqSmsCode: true});
            this.refs.counterText.start();
            this.props.actions.requestSmsCode(this.state.mobile, (success) => {
                ToastAndroid.show(success ? "短信验证码已发送" : "短信验证码发送失败", success ? ToastAndroid.SHORT : ToastAndroid.LONG)
            });
        } else {
            ToastAndroid.showWithGravity("请输入您的手机号", ToastAndroid.SHORT, ToastAndroid.CENTER)
        }
    }

    onCounterReReqEnd() {
        this.setState({doingReqSmsCode: false});
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
                    <View>
                        <FormInput onChangeText={(mobile) => {this.setState({mobile})}}
                                   value={this.state.mobile}
                                   keyboardType="numeric"
                                   placeholder="请输入手机号"/>
                    </View>
                    <View style={styles.inputs}>
                        <View style={{flexDirection: 'row'}}>
                        <FormInput onChangeText={this.onMobileChanged} placeholder="请输入验证码"
                                   secureTextEntry={true}
                                   ref={this.state.password}
                                   containerStyle={{width: width - 180}}
                                   placeholderColor={colors.default_container_bg}
                        />
                        {this.state.doingReqSmsCode ?
                            <CountDownText
                                ref='counterText'
                                style={styles.counter}
                                countType='seconds' // 计时类型：seconds / date
                                auto={false} // 自动开始
                                afterEnd={onCounterReReqEnd} // 结束回调
                                timeLeft={60} // 正向计时 时间起点为0秒
                                step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                                startText='获取验证码' // 开始的文本
                                endText='获取验证码' // 结束的文本
                                intervalText={(sec) => sec + '秒重新获取'} // 定时的文本回调
                            />
                            : <TouchableOpacity style={{alignSelf: 'center'}} onPress={this.onRequestSmsCode}>
                                <Text style={{ fontSize: pxToDp(colors.actionSecondSize), color: colors.main_vice_color}}>获取验证码</Text>
                            </TouchableOpacity>
                        }
                        </View>
                    </View>

                    <View style={{marginLeft: 15, marginRight: 15}}>
                        <TouchableOpacity>
                            <Text>比邻鲜使用协议</Text>
                        </TouchableOpacity>
                        <Button style={{marginTop: pxToDp(110)}} color={colors.main_color} title="登录"
                                 onPress={this.onLogin}></Button>

                        <View style={{alignItems:'center'}} >
                        <TouchableOpacity>
                        <Text onPress={() => {this.props.navigation.navigate('Register')}}
                              style={{color:colors.main_color, fontSize: pxToDp(colors.actionSecondSize), marginTop: pxToDp(50)}}>注册新帐号</Text>
                        </TouchableOpacity>
                        </View>
                    </View>


                    <View style={{alignItems: 'center'}}>
                    <Paragraph>语音技术由科大讯飞提供支持</Paragraph>
                    </View>

                </View>
            </ScrollView>
            </View>
        </Image>)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScene)