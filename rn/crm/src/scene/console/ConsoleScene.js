import React, {PureComponent} from "react";
import {InteractionManager, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import config from "../../pubilc/common/config";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Config from "../../pubilc/common/config";
import {connect} from "react-redux";

const BUTTON_LIST = [
    {
        title: '备货任务',
        iconName: 'list-alt',
        routeName: config.ROUTE_CONSOLE_STOCKING_TASKS
    },
    // {
    //     title: '价格审核',
    //     iconName: 'yen-sign',
    //     routeName: '1'
    // },
    // {
    //     title: '退款审核',
    //     iconName: 'yen-sign',
    //     routeName: '2'
    // },
    // {
    //     title: '评价管理',
    //     iconName: 'info-circle',
    //     routeName: '3'
    // },
    {
        title: '员工打卡',
        iconName: 'check-square',
        routeName: Config.ROUTE_CONSOLE_SIGN_IN
    }
]

class ConsoleScene extends PureComponent {

    componentDidMount() {
        const global = this.props.global
        const show_sign_center = global.config.show_sign_center
        const signInIndex = BUTTON_LIST.findIndex(item => item.title === '员工打卡')
        if (show_sign_center && signInIndex === -1) {
            BUTTON_LIST.push({
                title: '员工打卡',
                iconName: 'check-square',
                routeName: Config.ROUTE_CONSOLE_SIGN_IN
            })
            return
        }
        if (show_sign_center === false && signInIndex !== -1)
            BUTTON_LIST.splice(signInIndex, 1)
    }

    onPress = (routeName) => {
        InteractionManager.runAfterInteractions(() => {
            this.props.navigation.navigate(routeName, {}, {});
        });
    }

    render() {
        return (
            <View style={styles.page}>
                <View style={styles.card}>
                    <Text style={styles.title}>
                        我的工作台
                    </Text>
                    <View style={styles.buttonArrayWrap}>
                        {
                            BUTTON_LIST.map((button, index) => {
                                return (
                                    <TouchableOpacity style={styles.buttonStyle}
                                                      onPress={() => this.onPress(button.routeName)}
                                                      key={index}>
                                        <FontAwesome5 name={button.iconName} style={styles.iconStyle}/>
                                        <Text style={styles.btnTitle}>
                                            {button.title}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    card: {
        margin: 10,
        borderRadius: 8,
        backgroundColor: '#FFFFFF'
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        paddingLeft: 16,
        paddingTop: 22,
        paddingBottom: 12,
        color: '#333333',
        lineHeight: 25
    },
    buttonArrayWrap: {
        paddingLeft: 22,
        paddingBottom: 36,
        paddingRight: 36,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    buttonStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    btnTitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333333',
        lineHeight: 20,
        textAlign: 'center'
    },
    iconStyle: {
        fontSize: 22,
        fontWeight: '400',
        color: '#333333',
        lineHeight: 20,
        textAlign: 'center',
        padding: 4
    }
})

function mapStateToProps(state) {
    const {global} = state;
    return {global: global}
}

export default connect(mapStateToProps)(ConsoleScene)