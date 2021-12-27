import React from 'react';
import {Text, View, TouchableOpacity, Image} from 'react-native';
import {List, Radio, WhiteSpace} from '@ant-design/react-native';
import pxToDp from "../util/pxToDp";

const RadioItem = Radio.RadioItem;
export default class BasicRadioExample extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            chosed: 1,
        };
    }


    render() {
        return (
            <View>
                <List style={{margin: 10}}>
                    <View style={{padding: 8}}>
                        <View style={{paddingTop: 10, paddingBottom: 20, flexDirection: "row"}}>
                            <Text style={{flex: 4, marginLeft: 12, fontWeight: "bold"}}>默认方式</Text>
                            <View style={{flex: 1}}>
                                <TouchableOpacity style={{
                                    width: 20,
                                    height: 20,
                                    marginLeft: 30
                                }} onPress={() => {
                                    this.setState({
                                        chosed: 1
                                    })
                                }

                                }>
                                    <Image
                                        source={this.state.chosed == 1 ? require("../img/My/correct.png") : require("../img/My/mistake.png")}
                                        style={{width: pxToDp(40), height: pxToDp(40), marginRight: pxToDp(10)}}/>

                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={{fontSize: 12, color: '#333333', lineHeight: 17}}>
                            未使用云打印机也没绑定其他第三方否的系统接单时，请继续使用原接单方式，外送帮将不给您自动接单。
                        </Text>

                    </View>

                </List>
                <List style={{margin: 10}}>
                    <View style={{padding: 8}}>
                        <View style={{paddingTop: 10, paddingBottom: 20, flexDirection: "row"}}>
                            <Text style={{flex: 4, marginLeft: 12, fontWeight: "bold"}}>云打印机</Text>
                            <View style={{flex: 1}}>
                                <TouchableOpacity style={{
                                    width: 20,
                                    height: 20,
                                    marginLeft: 30
                                }} onPress={() => {
                                    this.setState({
                                        chosed: 2
                                    })
                                }}>
                                    <Image
                                        source={this.state.chosed == 2 ? require("../img/My/correct.png") : require("../img/My/mistake.png")}
                                        style={{width: pxToDp(40), height: pxToDp(40), marginRight: pxToDp(10)}}/>

                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={{fontSize: 12, color: '#333333', lineHeight: 17}}>
                            通过入飞蛾、中午、芯烨云等云打印机接单打印，应先把打印机绑定到外送帮，再去绑定美团。外送帮将自动为您接单。
                        </Text>

                        <Text
                            style={{fontSize: 12, color: '#59B26A', lineHeight: 17, textAlign: "right", marginTop: 20}}>
                            已绑定云打印机：芯烨云
                        </Text>

                    </View>

                </List>

                <List style={{margin: 10}}>
                    <View style={{padding: 8}}>
                        <View style={{paddingTop: 10, paddingBottom: 20, flexDirection: "row"}}>
                            <Text style={{flex: 4, marginLeft: 12, fontWeight: "bold"}}>收银系统</Text>
                            <View style={{flex: 1}}>
                                <TouchableOpacity style={{
                                    width: 20,
                                    height: 20,
                                    marginLeft: 30
                                }} onPress={() => {
                                    this.setState({
                                        chosed: 3
                                    })
                                }}>
                                    <Image
                                        source={this.state.chosed == 3 ? require("../img/My/correct.png") : require("../img/My/mistake.png")}
                                        style={{width: pxToDp(40), height: pxToDp(40), marginRight: pxToDp(10)}}/>

                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={{fontSize: 12, color: '#333333', lineHeight: 17}}>
                            已绑定如美团收银，客如云，哗啦啦或由总部控制的系统，如兼容建议选择此模式，但暂不支持在外送帮发起美团商户端的美团跑腿。

                        </Text>

                    </View>

                </List>
            </View>
        );
    }
}
