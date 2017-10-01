import React, {PureComponent} from 'react';
import {View, StyleSheet, Image, Text, SearchButton} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../Alert/pxToDp';
import {CountDownText} from "../../widget/CounterText";
import * as globalActions from '../../reducers/global/globalActions'

import {Cell, CellHeader, CellBody, CellFooter, Button, Input, Cells, ButtonArea, Flex, Toast} from "../../weui/index";


/**
 * ## Redux boilerplate
 */
function mapStateToProps(state) {
    return {
        userProfile: state.global.currentUserPfile
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({...globalActions}, dispatch)
    }
}

const mobileInputPlaceHold = "手机号码";
const validCodePlaceHold = "短信验证码";
const namePlaceHold = "姓名";
const passwordPlaceHold = "密码";
const rePasswordPlaceHold = "确认密码";
const requestCodeSuccessMsg = "";
const requestCodeErrorMsg = "";
const registerSuccessMsg = "";
const registerErrorMsg = "";

class RegisterScene extends PureComponent {

    static navigationOptions = ({navigation}) => ({
        headerTitle: (
            <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <Text style={{
                    textAlignVertical: "center",
                    textAlign: "center",
                    color: "#ffffff",
                    fontWeight: 'bold',
                    fontSize: 20
                }}>注册</Text>
            </View>
        ),
        headerStyle: {backgroundColor: '#59b26a'},
        headerRight: (<View/>),
        headerLeft: (<View/>),
    })

    constructor(props) {
        super(props)
        this.state = {
            mobile: '',
            verifyCode: '',
            name: '',
            password: '',
            rePassword: '',
            canAskReqSmsCode: false,
            reRequestAfterSeconds: 60,
            doingRegister: false,
            opSuccessMsg: '',
            opErrorMsg: '',
            visibleSuccessToast: false,
            visibleErrorToast: false,
            toastTimer: null,
        }

        this.onMobileChanged = this.onMobileChanged.bind(this);
        this.doRegister = this.doRegister.bind(this);
        this.onRequestSmsCode = this.onRequestSmsCode.bind(this);
        this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this)
        this.doneRegister = this.doneRegister.bind(this)
        this.showSuccessToast = this.showSuccessToast.bind(this)
        this.showErrorToast = this.showErrorToast.bind(this)
    }

    doRegister() {
        this.setState({doingRegister: true});
    }

    doneRegister() {
        this.setState({doingRegister: false})
    }

    clearTimeouts() {
        this.timeouts.forEach(clearTimeout);
    }

    showSuccessToast(msg) {
        this.setState({
            visibleSuccessToast: true,
            opSuccessMsg: msg
        });
        this.state.toastTimer = setTimeout(() => {
            this.setState({visibleSuccessToast: false});
        }, 2000);
    }

    showErrorToast(msg) {
        this.setState({
            visibleErrorToast: true,
            opErrorMsg: msg
        });
        this.state.toastTimer = setTimeout(() => {
            this.setState({visibleErrorToast: false});
        }, 2000);
    }

    onRequestSmsCode() {
        if (this.state.mobile) {
            this.setState({canAskReqSmsCode: true});
            this.props.actions.requestSmsCode(this.state.mobile, (success) => {
                if (success) {
                    this.showSuccessToast("短信验证码已发送")
                } else {
                    this.showErrorToast("短信验证码发送失败")
                }
            });
        } else {
            this.showErrorToast("请输入您的手机号")
        }
    }

    onCounterReReqEnd() {
        this.setState({canAskReqSmsCode: false});
    }

    onMobileChanged() {

    }

    componentWillUnmount() {
        this.clearTimeouts();
    }

    componentDidMount() {
        this.setState({})
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{height: 20}}/>
                <View style={styles.register_panel}>
                    <Cells>
                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/login_phone_.png')} style={{
                                    width: pxToDp(33),
                                    height: pxToDp(47),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input onChangeText={(mobile) => {
                                    this.setState({mobile})
                                }}
                                       value={this.state.mobile}
                                       keyboardType="numeric"
                                       placeholder={mobileInputPlaceHold} placeholderStyle={{color: "#999"}}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                        </Cell>

                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/login_message_.png')} style={{
                                    width: pxToDp(39),
                                    height: pxToDp(29),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input onChangeText={(verifyCode) => this.setState({verifyCode})}
                                       value={this.state.verifyCode}
                                       placeholder={validCodePlaceHold} placeholderStyle={{color: "#999"}}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                            <CellFooter>
                                {this.state.canAskReqSmsCode ?
                                    <CountDownText
                                        ref={counter => this.counterText = counter}
                                        style={styles.counter}
                                        countType='seconds' // 计时类型：seconds / date
                                        auto={false}
                                        afterEnd={this.onCounterReReqEnd}
                                        timeLeft={this.state.reRequestAfterSeconds}
                                        step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                                        startText='获取验证码'
                                        endText='获取验证码'
                                        intervalText={(sec) => {
                                            this.setState({reRequestAfterSeconds: sec});
                                            return sec + '秒重新获取';
                                        }
                                        }
                                    />
                                    : <Button type="primary" plain size="small"
                                              onPress={this.onRequestSmsCode}>获取验证码</Button>
                                }
                            </CellFooter>
                        </Cell>

                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/login_name_.png')} style={{
                                    width: pxToDp(39),
                                    height: pxToDp(39),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input placeholder={namePlaceHold} placeholderStyle={{color: "#999"}}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                        </Cell>

                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/password.png')} style={{
                                    width: pxToDp(35),
                                    height: pxToDp(41),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input secureTextEntry={true} placeholder={passwordPlaceHold}
                                       placeholderStyle={{color: "#999"}}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                        </Cell>

                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/re_password.png')} style={{
                                    width: pxToDp(35),
                                    height: pxToDp(41),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input secureTextEntry={true} placeholder={rePasswordPlaceHold}
                                       placeholderStyle={{color: "#999"}}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                        </Cell>
                    </Cells>

                    <ButtonArea style={{marginBottom: 2}}>
                        <Button type="primary" onPress={() => {
                        }}>注册</Button>
                    </ButtonArea>

                    <Flex direction="row" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 16}}>已有账号?</Text>
                        <Text> </Text>
                        <Text style={{fontSize: 16, color: '#59b26a'}} onPress={() => {
                        }}>
                            返回登录
                        </Text>
                    </Flex>
                    <Toast icon="success_circle" show={this.state.visibleSuccessToast} onRequestClose={() => {
                    }}>{this.state.opSuccessMsg}</Toast>
                    <Toast icon="warn" show={this.state.visibleErrorToast} onRequestClose={() => {
                    }}>{this.state.opErrorMsg}</Toast>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },

    register_panel: {
        flex: 1, backgroundColor: 'white', marginLeft: 25, marginRight: 25
    },
    counter: {
        borderRadius: 5,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#5A5A5A',
        backgroundColor: 'transparent',
        paddingLeft: 14 * 0.75,
        paddingRight: 14 * 0.75,
        paddingTop: 6 * 0.75,
        paddingBottom: 6 * 0.75,
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScene)
