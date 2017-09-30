/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React, {PureComponent} from 'react'
import {View, Text, StyleSheet, ScrollView} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Button, ButtonArea, Toast, Msg, Dialog} from "../../weui/index";
import S from '../../stylekit/index';


/**
 * ## Redux boilerplate
 */
function mapStateToProps({weui}) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({}, dispatch)
    }
}

// create a component
class TestWeuiScene extends PureComponent {

    static navigationOptions = ({navigation}) => ({
        headerTitle: (
            <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <Text style={{
                    textAlignVertical: "center",
                    textAlign: "center",
                    color: "#ffffff",
                    fontWeight: 'bold',
                    fontSize: 20
                }}>Test WeUi</Text>
            </View>
        ),
        headerStyle: {backgroundColor: '#59b26a'},
        headerRight: (<View/>),
        headerLeft: (<View/>),
    })


    constructor(props: Object) {
        super(props);
        this.state = {
            visibleToast: false,
            visibleLoading: false,
            toastTimer: null,
            loadingTimer: null,
            visible1: false,
            visible2: false,
        };
        this.showToast = this.showToast.bind(this);
        this.showLoadingToast = this.showLoadingToast.bind(this);
        this.showDialog1 = this.showDialog1.bind(this);
        this.showDialog2 = this.showDialog2.bind(this);
        this.hideDialog1 = this.hideDialog1.bind(this);
        this.hideDialog2 = this.hideDialog2.bind(this);
    }

    componentWillMount() {
    }

    componentWillUnmount() {
        if (this.state.toastTimer) clearTimeout(this.state.toastTimer);
        if (this.state.loadingTimer) clearTimeout(this.state.loadingTimer);
    }

    showToast() {
        this.setState({
            visibleToast: true
        });
        this.state.toastTimer = setTimeout(() => {
            this.setState({visibleToast: false});
        }, 2000);
    }

    showLoadingToast() {
        this.setState({
            visibleLoading: true
        });
        this.state.loadingTimer = setTimeout(() => {
            this.setState({visibleLoading: false});
        }, 2000);
    }

    showDialog1() {
        this.setState({
            visible1: true,
        });
    }

    showDialog2() {
        this.setState({
            visible2: true,
        });
    }

    hideDialog1() {
        this.setState({
            visible1: false,
        });
    }

    hideDialog2() {
        this.setState({
            visible2: false,
        });
    }

    render() {
        return (
            <ScrollView style={styles.wrapper}>

                <ButtonArea>
                    <Button type="primary" onPress={this.showToast}>点击弹出 Toast</Button>
                    <Button type="primary" onPress={this.showLoadingToast}>点击弹出 Loading Toast</Button>
                </ButtonArea>

                <ButtonArea>
                    <Button type="primary" onPress={this.showDialog1}>点击弹出 Dialog 样式一</Button>
                    <Button type="primary" onPress={this.showDialog2}>点击弹出 Dialog 样式二</Button>
                </ButtonArea>


                <Msg
                    type="success"
                    title="操作成功"
                    description="内容详情，可根据实际需要安排"
                    buttons={[{
                        type: 'primary',
                        label: '确定',
                        onPress: () => {
                        }
                    }, {
                        type: 'default',
                        label: '取消',
                        onPress: () => {
                        }
                    }]}
                />

                <Toast icon="success_circle" show={this.state.visibleToast} onRequestClose={() => {
                }}>加载成功</Toast>
                <Toast icon="loading" show={this.state.visibleLoading} onRequestClose={() => {
                }}>加载中...</Toast>


                <Dialog
                    onRequestClose={() => {
                    }}
                    visible={this.state.visible1}
                    title="标题一"
                    buttons={[
                        {
                            type: 'default',
                            label: '确定',
                            onPress: this.hideDialog1,
                        }
                    ]}
                ><Text>警告内容</Text></Dialog>
                <Dialog
                    onRequestClose={() => {
                    }}
                    visible={this.state.visible2}
                    title="标题二"
                    buttons={[
                        {
                            type: 'default',
                            label: '取消',
                            onPress: this.hideDialog2,
                        }, {
                            type: 'primary',
                            label: '确定',
                            onPress: this.hideDialog2,
                        },
                    ]}
                ><Text>呵呵</Text></Dialog>
            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingTop: 5,
        backgroundColor: '#fbf9fe'
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(TestWeuiScene)
