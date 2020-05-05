import React, {PureComponent} from 'react';
import {View, StyleSheet, Image, Text, ScrollView, Linking} from 'react-native'
import {bindActionCreators} from "redux";
import {Checkbox} from "antd-mobile-rn";
import pxToDp from '../../util/pxToDp';
import {CountDownText} from "../../widget/CounterText";
import * as globalActions from '../../reducers/global/globalActions'
import {
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Button,
    Input,
    Cells,
    ButtonArea,
    Flex,
    Toast,
    Dialog
} from "../../weui/index";
import {NavigationItem} from "../../widget/index"
import {create} from  'dva-core';
import stringEx from "../../util/stringEx"
import colors from "../../styles/colors";
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
const requestCodeSuccessMsg = "短信验证码已发送";
const requestCodeErrorMsg = "短信验证码发送失败";
const RegisterSuccessMsg = "申请成功";
const RegisterErrorMsg = "申请失败，请重试!";


const validErrorMobile = "手机号有误";
const validEmptyCode = "请输入短信验证码";
const validEmptyCheckBox = "请阅读并同意「外送帮使用协议」";

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
                }}>我要注册</Text>
            </View>
        ),
        headerStyle: {backgroundColor: '#59b26a'},
        headerRight: (<View/>),
        headerLeft: (
            <NavigationItem
                icon={require('../../img/Register/back_.png')}
                iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
                onPress={() => {
                    navigation.navigate('Login')
                }}
            />),
    })

    constructor(props) {
        super(props)
        this.state = {
            mobile: '',
            verifyCode: '',
            name: '',
            address: '',
            shopName: '',
            classify: '',
            canAskReqSmsCode: false,
            reRequestAfterSeconds: 60,
            doingRegister: false,
            opSuccessMsg: '',
            opErrorMsg: '',
            visibleSuccessToast: false,
            visibleErrorToast: false,
            visibleDialog: false,
            toastTimer: null,
            loadingTimer: null,
            checkBox:true,
        }

        this.doRegister = this.doRegister.bind(this)
        this.onRegister = this.onRegister.bind(this)
        this.onRequestSmsCode = this.onRequestSmsCode.bind(this)
        this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this)
        this.doneRegister = this.doneRegister.bind(this)
        this.showSuccessToast = this.showSuccessToast.bind(this)
        this.showErrorToast = this.showErrorToast.bind(this)
    }

    onRegister() {
        if (!this.state.mobile || !stringEx.isMobile(this.state.mobile)) {
            this.showErrorToast(validErrorMobile)
            return false
        }
        if (!this.state.verifyCode) {
            this.showErrorToast(validEmptyCode)
            return false
        }
        if (!this.state.checkBox) {
            this.showErrorToast(validEmptyCheckBox)
            return false
        }

        if (this.state.doingRegister) {
            return false;
        }
        this.doRegister();
    }

    doRegister() {
        var self = this;
        this.setState({doingRegister: true});
        let data = {
            mobile: this.state.mobile,
            address: this.state.address,
            shop_name: this.state.shopName,
            verifyCode: this.state.verifyCode,
            classify: this.state.classify,
            name: this.state.name
        };
        this.props.actions.customerRegister(data, (success) => {
            self.doneRegister();
            if (success) {
                this.showSuccessToast(RegisterSuccessMsg);
                setTimeout(()=>this.props.navigation.goBack(),2000)
            } else {
                this.showErrorToast(RegisterErrorMsg)
            }
        })
    }

    doneRegister() {
        this.setState({doingRegister: false})
    }

    clearTimeouts() {
        if (this.state.toastTimer) clearTimeout(this.state.toastTimer);
        if (this.state.loadingTimer) clearTimeout(this.state.loadingTimer);
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
        if (this.state.mobile && stringEx.isMobile(this.state.mobile)) {
            this.setState({canAskReqSmsCode: true});
            this.props.actions.requestSmsCode(this.state.mobile, 0, (success) => {
                if (success) {
                    this.showSuccessToast(requestCodeSuccessMsg)
                } else {
                    this.setState({canAskReqSmsCode: false});
                    this.showErrorToast(requestCodeErrorMsg)
                }
            });
        } else {
            this.setState({canAskReqSmsCode: false});
            this.showErrorToast(validErrorMobile)
        }
    }

    onCounterReReqEnd() {
        this.setState({canAskReqSmsCode: false});
    }

    componentWillUnmount() {
        this.clearTimeouts();
    }

    componentDidMount() {
        this.setState({})
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.register_panel}>
                    <Cells style={{borderTopWidth: 0, borderBottomWidth: 0,}}>
                        <Cell first>
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
                                       style={styles.input}
                                       keyboardType="numeric"
                                       placeholder={mobileInputPlaceHold}
                                       placeholderTextColor={'#ccc'}
                                       underlineColorAndroid="transparent"/>
                            </CellBody>
                        </Cell>

                        <Cell first>
                            <CellHeader>
                                <Image source={require('../../img/Register/login_message_.png')} style={{
                                    width: pxToDp(39),
                                    height: pxToDp(29),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input onChangeText={(verifyCode) => this.setState({verifyCode})}
                                       value={this.state.verifyCode}
                                       style={styles.input}
                                       placeholder={validCodePlaceHold}
                                       placeholderTextColor={'#ccc'}
                                       underlineColorAndroid="transparent"/>
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
                        <Cell first>

                            <CellBody>
                                <Checkbox
                                    checked={this.state.checkBox}
                                    onChange={event => {
                                        this.setState({ checkBox: event.target.checked });
                                    }}
                                >我已阅读并同意</Checkbox>
                            </CellBody>
                            <CellFooter>
                                <Text onPress={()=>{
                                    Linking.openURL("https://e.waisongbang.com/PrivacyPolicy.html")
                                }} style={{color:colors.main_color}}>外送帮使用协议</Text>
                            </CellFooter>
                        </Cell>
                    </Cells>
                  <ButtonArea style={{marginBottom: pxToDp(20), marginTop: pxToDp(50)}}>
                        <Button type="primary" onPress={()=>this.onRegister()}>我要开店</Button>
                    </ButtonArea>

                    <Toast icon="loading" show={this.state.doingRegister} onRequestClose={() => {
                    }}>提交中</Toast>
                    <Toast icon="success_circle" show={this.state.visibleSuccessToast} onRequestClose={() => {
                    }}>{this.state.opSuccessMsg}</Toast>
                    <Toast icon="warn" show={this.state.visibleErrorToast} onRequestClose={() => {
                    }}>{this.state.opErrorMsg}</Toast>
                    <Dialog
                        onRequestClose={() => {
                        }}
                        visible={this.state.visibleDialog}
                        title="申请成功"
                        buttons={[
                            {
                                type: 'default',
                                label: '确定',
                                onPress: this.hideDialog1,
                            }
                        ]}
                    ><Text>客服马上会联系你</Text></Dialog>
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    register_panel: {
        flex: 1,
        backgroundColor: 'white',
        marginLeft: pxToDp(72),
        marginRight: pxToDp(72)
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
    },
    input: {
        color: "#999",
        borderBottomWidth:pxToDp(1),
        borderBottomColor:'#999'
    }
});

export default RegisterScene;
