import React, {PureComponent} from 'react';
import {View, StyleSheet, Image, Text, SearchButton, ScrollView} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
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

import stringEx from "../../util/stringEx"

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
const namePlaceHold = "负责人";
const shopNamePlaceHold = "店名";
const classifyPlaceHold = "经营项目 如:生鲜、水果";
const addressPlaceHold = "店铺详细地址";
const requestCodeSuccessMsg = "短信验证码已发送";
const requestCodeErrorMsg = "短信验证码发送失败";
const applySuccessMsg = "申请成功";
const applyErrorMsg = "申请失败，请重试!";


const validErrorMobile = "手机号有误";
const validEmptyName = "请输入负责人";
const validEmptyAddress = "请输入店铺地址";
const validEmptyCode = "请输入短信验证码";
const validEmptyShopName = "请输入店铺名字";
const validEmptyClassify = "请输入经营项目";

class ApplyScene extends PureComponent {

    static navigationOptions = ({navigation}) => ({
        headerTitle: (
            <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <Text style={{
                    textAlignVertical: "center",
                    textAlign: "center",
                    color: "#ffffff",
                    fontWeight: 'bold',
                    fontSize: 20
                }}>我要开店</Text>
            </View>
        ),
        headerStyle: {backgroundColor: '#59b26a'},
        headerRight: (<View/>),
        headerLeft: (
            <NavigationItem
                icon={require('../../img/Register/back_.png')}
                iconStyle={{width: pxToDp(87), height: pxToDp(79)}}
                onPress={() => {
                    navigation.navigate('Login')
                }}
            />),
    })

    constructor(props) {
        super(props)
        this.state = {
            mobile: '18295711875',
            verifyCode: '123456',
            name: 'shi',
            address: 'glg',
            shopName: 'jjj',
            classify: 'aaa',
            canAskReqSmsCode: false,
            reRequestAfterSeconds: 60,
            doingApply: false,
            opSuccessMsg: '',
            opErrorMsg: '',
            visibleSuccessToast: false,
            visibleErrorToast: false,
            visibleDialog: false,
            toastTimer: null,
            loadingTimer: null,
        }

        this.doApply = this.doApply.bind(this)
        this.onApply = this.onApply.bind(this)
        this.onRequestSmsCode = this.onRequestSmsCode.bind(this)
        this.onCounterReReqEnd = this.onCounterReReqEnd.bind(this)
        this.doneApply = this.doneApply.bind(this)
        this.showSuccessToast = this.showSuccessToast.bind(this)
        this.showErrorToast = this.showErrorToast.bind(this)
    }

    onApply() {
        if (!this.state.mobile || !stringEx.isMobile(this.state.mobile)) {
            this.showErrorToast(validErrorMobile)
            return false
        }
        if (!this.state.verifyCode) {
            this.showErrorToast(validEmptyCode)
            return false
        }
        if (!this.state.name) {
            this.showErrorToast(validEmptyName)
            return false
        }
        if (!this.state.shopName) {
            this.showErrorToast(validEmptyShopName)
            return false
        }
        if (!this.state.classify) {
            this.showErrorToast(validEmptyClassify)
            return false
        }
        if (!this.state.address) {
            this.showErrorToast(validEmptyAddress)
            return false
        }
        if (this.state.doingApply) {
            return false;
        }
        this.doApply();
    }

    doApply() {
        var self = this;
        this.setState({doingApply: true});
        let data = {
            mobile: this.state.mobile,
            address: this.state.address,
            shop_name: this.state.shopName,
            verifyCode: this.state.verifyCode,
            classify: this.state.classify,
            name: this.state.name
        };
        this.props.actions.customerApply(data, (success) => {
            self.doneApply();
            if (success) {
                this.showSuccessToast(applySuccessMsg)
            } else {
                this.showErrorToast(applyErrorMsg)
            }
        })
    }

    doneApply() {
        this.setState({doingApply: false})
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
                                       style={styles.input}
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
                                       style={styles.input}
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
                                <Input placeholder={namePlaceHold}
                                       onChangeText={(name) => {
                                           this.setState({name})
                                       }}
                                       value={this.state.name}
                                       placeholderStyle={{color: "#999"}}
                                       style={styles.input}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                        </Cell>

                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/dianming_.png')} style={{
                                    width: pxToDp(39),
                                    height: pxToDp(35),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input placeholder={shopNamePlaceHold}
                                       onChangeText={(shopName) => {
                                           this.setState({shopName})
                                       }}
                                       value={this.state.shopName}
                                       placeholderStyle={{color: "#999"}}
                                       style={styles.input}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                        </Cell>

                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/jingying_.png')} style={{
                                    width: pxToDp(39),
                                    height: pxToDp(39),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input placeholder={classifyPlaceHold}
                                       onChangeText={(classify) => {
                                           this.setState({classify})
                                       }}
                                       value={this.state.classify}
                                       placeholderStyle={{color: "#999"}}
                                       style={styles.input}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                        </Cell>
                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/map_.png')} style={{
                                    width: pxToDp(39),
                                    height: pxToDp(45),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input placeholder={addressPlaceHold}
                                       onChangeText={(address) => {
                                           this.setState({address})
                                       }}
                                       value={this.state.address}
                                       placeholderStyle={{color: "#999"}}
                                       style={styles.input}
                                       underlineColorAndroid="#999"/>
                            </CellBody>
                        </Cell>
                    </Cells>

                    <ButtonArea style={{marginBottom: pxToDp(20), marginTop: pxToDp(30)}}>
                        <Button type="primary" onPress={this.onApply}>我要开店</Button>
                    </ButtonArea>

                    <Flex direction="row" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 16}}>有不明处?</Text>
                        <Text> </Text>
                        <Text style={{fontSize: 16, color: '#59b26a'}} onPress={() => {
                        }}>
                            联系客服
                        </Text>
                    </Flex>
                    <Toast icon="loading" show={this.state.doingApply} onRequestClose={() => {
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
        color: "#999"
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ApplyScene)
