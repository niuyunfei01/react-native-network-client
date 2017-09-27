import React, {Component} from 'react';
import {StyleSheet, Text, TextInput, Image, View, TouchableHighlight, StatusBar, Dimensions} from 'react-native';
import Button from "react-native-button";
let windowSize = Dimensions.get('window');
import Icon from 'react-native-vector-icons/Ionicons';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

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

    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            height: ''
        }
    }

    componentDidMount() {
        this.setState({
            height: windowSize.height
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.mark}>OSC</Text>
                </View>
                <View style={styles.inputs}>
                    <View style={styles.inputContainer}>
                        <Icon name="ios-person" size={30} color="#D8D8D8"/>
                        <TextInput
                            style={[styles.input, styles.greyFont]}
                            placeholder="用户名或电话号码"
                            placeholderTextColor="#333"
                            value={this.state.username}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Icon name="ios-lock" size={30} color="#D8D8D8"/>
                        <TextInput
                            password={true}
                            style={[styles.input, styles.greyFont]}
                            placeholder="密码"
                            placeholderTextColor="#333"
                            value={this.state.password}
                        />
                    </View>
                    <View style={styles.forgotContainer}>
                        <Text style={styles.greyFont}>忘记密码?</Text>
                    </View>
                </View>
                <View style={styles.signin}>
                    <Button  style={styles.whiteFont}>注册</Button>
                </View>
                <View style={styles.signup}>
                    <Button style={styles.greyFont}>已有账户? 立即登录</Button>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        backgroundColor: 'transparent'
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: .5,
        backgroundColor: 'transparent'
    },
    mark: {
        fontSize: 30
    },
    signin: {
        backgroundColor: '#300e60',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 30,
        marginRight: 30,
        padding: 10,
        alignItems: 'center'
    },
    signup: {
        backgroundColor: 'transparent',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 30,
        marginRight: 30,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputs: {
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 30,
        marginRight: 30,
        flex: .25
    },
    inputPassword: {
        marginLeft: 15,
        width: 20,
        height: 21
    },
    inputUsername: {
        marginLeft: 15,
        width: 20,
        height: 20
    },
    inputContainer: {
        padding: 10,
        borderWidth: 1,
        borderBottomColor: '#CCC',
        borderColor: 'transparent'
    },
    input: {
        position: 'absolute',
        left: 61,
        top: 15,
        right: 0,
        height: 20,
        fontSize: 14
    },
    forgotContainer: {
        alignItems: 'flex-end',
        padding: 15,
    },
    greyFont: {
        color: '#333'
    },
    whiteFont: {
        color: '#FFF'
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(RegisterScene)
