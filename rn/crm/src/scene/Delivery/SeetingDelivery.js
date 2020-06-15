//import liraries
import React, {PureComponent} from "react";
import {

    ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View,
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody,CellFooter, CellHeader, Cells, CellsTitle} from "../../weui/Cell";
import {Input, Label, Switch} from "../../weui/Form";
import {Button} from "../../weui/Button";
import {Radio, Checkbox, List, WhiteSpace, WingBlank} from 'antd-mobile-rn';
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import Config from "../../config";
const AgreeItem = Checkbox.AgreeItem;
const CheckboxItem = Checkbox.CheckboxItem;
const RadioItem = Radio.RadioItem;
const Item = List.Item;
const Brief = Item.Brief;
import * as globalActions from "../../reducers/global/globalActions";
mapStateToProps=state=> {
    const {mine, user, global} = state;
    return {mine: mine, user: user, global: global};
}
var ScreenWidth = Dimensions.get("window").width;
mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators({...globalActions}, dispatch)
    }
}
class SeetingDelivery extends PureComponent {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: '绑定配送信息',
        }
    }
    constructor(props) {
        super(props);
        const {
            currentUser,
            currStoreId,
            currentUserProfile,
        } = this.props.global;
        this.state = {
            isRefreshing: false,
            onSubmitting: false,
            menus:[],
            deploy_time:"",
            reserve_deploy_time:"",
            ship_ways:[],
            auto_call:1,
            default:'',
        };
        this.onBindDelivery =this.onBindDelivery.bind(this)

    }
    componentDidMount () {
        this.getDeliveryConf();
    }
    getDeliveryConf(){
        this.props.actions.showStoreDelivery( this.props.navigation.state.params.ext_store_id, (success,response) => {
            this.setState({
                menus:response.menus?response.menus:[],
                deploy_time:response.deploy_time?response.deploy_time:'',
                ship_ways:response.ship_ways?response.ship_ways:[],
                auto_call:response.auto_call?response.auto_call:2,
                default:response.default?response.default:'',
            })

        })
    }
    onBindDelivery(){
        this.props.actions.updateStoresAutoDelivery(
            this.props.navigation.state.params.ext_store_id,
            {
                auto_call:this.state.auto_call,
                ship_ways:this.state.ship_ways,
                default:this.state.default,
                deploy_time:this.state.deploy_time
            },
            (success,response) => {
                if (success){
                    ToastAndroid.showWithGravity('配置店铺配送成功',ToastAndroid.SHORT, ToastAndroid.CENTER)
                }else{
                    ToastAndroid.showWithGravity('配置店铺配送失败',ToastAndroid.SHORT, ToastAndroid.CENTER)
                }
                this.props.navigation.navigate('PlatformScene');
            }

        )
    }
    render() {
        const {menus} =this.state;
        return (
            <ScrollView style={styles.container}
                        automaticallyAdjustContentInsets={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
            >
                <CellsTitle style={styles.cell_title}>{ this.props.navigation.state.params.poi_name}</CellsTitle>
                <Cells style={[styles.cell_box]}>
                    <Cell customStyle={[styles.cell_row]}>
                        <CellHeader>
                            <Label style={[styles.cell_label]}>及时单发起配送时间</Label>
                        </CellHeader>
                        <CellBody>
                            <Input
                                onChangeText={deploy_time => this.setState({deploy_time})}
                                value={this.state.deploy_time}
                                style={[styles.cell_input]}
                                placeholder="分钟"
                                underlineColorAndroid="transparent" //取消安卓下划线

                            />
                        </CellBody>
                    </Cell>
                </Cells>
                <CellsTitle style={styles.cell_title}>配送选择</CellsTitle>
                <Cells style={[styles.cell_box]}>
                        {menus.map(item=>(<Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <CheckboxItem
                                        checked={this.state.ship_ways.find(value=>value==item.id)}
                                        onChange={event => {
                                            let {ship_ways} = this.state;
                                            if(event.target.checked ){
                                                ship_ways.push(item.id);
                                            }else{
                                                ship_ways.splice(ship_ways.findIndex(index => Number(index)  == item.id), 1)
                                            }
                                            this.setState({ship_ways})
                                        }}
                                    />
                                </CellHeader>
                                <CellBody>
                                    <RadioItem
                                        checked={this.state.default === item.id}
                                        onChange={event => {
                                            if (event.target.checked) {
                                                this.setState({ default: item.id });
                                            }
                                        }}
                                    >{item.name}
                                    </RadioItem>
                                </CellBody>
                            </Cell>
                            ))}

                </Cells>
            <Cells>
                <Cell>
                    <CellBody><Text style={{color: 'red'}}>是否开启自动呼叫配送</Text></CellBody>
                    <CellFooter>
                        <Switch value={this.state.auto_call==1?true:false} onChange={(v) =>{ this.setState({
                            auto_call: v?1:2,
                        });}}/>
                    </CellFooter>
                </Cell>
            </Cells>
                <Button
                    onPress={this.onBindDelivery}
                    type="primary"
                    style={styles.btn_submit}
                >
                    确认绑定
                </Button>
            </ScrollView>

        );
    }
}
const
    styles = StyleSheet.create({
        container: {
            marginBottom: pxToDp(22),
            backgroundColor: colors.white
        },
        btn_select: {
            marginRight: pxToDp(20),
            height: pxToDp(60),
            width: pxToDp(60),
            fontSize: pxToDp(40),
            color: colors.color666,
            textAlign: "center",
            textAlignVertical: "center"
        },
        cell_title: {
            marginBottom: pxToDp(10),
            fontSize: pxToDp(26),
            color: colors.color999
        },
        cell_box: {
            marginTop: 0,
            borderTopWidth: pxToDp(1),
            borderBottomWidth: pxToDp(1),
            borderColor: colors.color999
        },
        cell_row: {
            height: pxToDp(70),
            justifyContent: "center"
        },
        cell_input: {
            //需要覆盖完整这4个元素
            fontSize: pxToDp(30),
            height: pxToDp(90)
        },
        cell_label: {
            width: pxToDp(234),
            fontSize: pxToDp(30),
            fontWeight: "bold",
            color: colors.color333
        },
        btn_submit: {
            margin: pxToDp(30),
            marginBottom: pxToDp(50),
            backgroundColor: "#6db06f"
        },
        map_icon: {
            fontSize: pxToDp(40),
            color: colors.color666,
            height: pxToDp(60),
            width: pxToDp(40),
            textAlignVertical: "center"
        },
        body_text: {
            paddingLeft: pxToDp(8),
            fontSize: pxToDp(30),
            color: colors.color333,
            height: pxToDp(60),
            textAlignVertical: "center"

            // borderColor: 'green',
            // borderWidth: 1,
        }
    });
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SeetingDelivery);
