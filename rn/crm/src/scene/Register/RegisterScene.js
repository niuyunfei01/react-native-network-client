import React, {PureComponent} from 'react';
import {View, ScrollView, Image, Text, SearchButton} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from '../Alert/pxToDp';

import {Cell, CellHeader, CellBody, CellFooter, Button, Input, Cells, ButtonArea, Flex, Toast} from "../../weui/index";


/**
 * ## Redux boilerplate
 */
function mapStateToProps({register}) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({}, dispatch)
    }
}

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
            username: '',
            password: ''
        }
    }

    componentDidMount() {
        this.setState({})
    }

    render() {
        let mobileInputPlaceHold = "手机号码";
        let validCodePlaceHold = "短信验证码";
        let namePlaceHold = "姓名";
        let passwordPlaceHold = "密码";
        let rePasswordPlaceHold = "确认密码";
        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <View style={{height: 20}}/>
                <View style={{flex: 1, backgroundColor: 'white', marginLeft: 25, marginRight: 25}}>
                    <Cells>
                        <Cell>
                            <CellHeader>
                                <Image source={require('../../img/Register/login_phone_.png')} style={{
                                    width: pxToDp(33),
                                    height: pxToDp(47),
                                }}/>
                            </CellHeader>
                            <CellBody>
                                <Input placeholder={mobileInputPlaceHold} placeholderStyle={{color: "#999"}} underlineColorAndroid="#999"/>
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
                                <Input placeholder={validCodePlaceHold} placeholderStyle={{color: "#999"}} underlineColorAndroid="#999"/>
                            </CellBody>
                            <CellFooter>
                                <Button type="primary" plain size="small" onPress={() => {
                                }}>获取验证码</Button>
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
                </View>
            </View>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScene)
