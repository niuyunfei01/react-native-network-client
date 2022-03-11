import React, {PureComponent} from 'react'
import {InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import styles from 'rmc-picker/lib/PopupStyles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {Icon, List} from '@ant-design/react-native';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import HttpUtils from "../../util/http";
import Config from "../../config";
// import 'rmc-date-picker/assets/index.css';
// import 'rmc-picker/assets/popup.css';
import zh_CN from 'rmc-date-picker/lib/locale/zh_CN';
import DatePicker from 'rmc-date-picker/lib/DatePicker';
import PopPicker from 'rmc-date-picker/lib/Popup';
import {hideModal, showModal} from "../../util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo"

const Item = List;
const Brief = Item;

function mapStateToProps(state) {
    const {mine, user, global} = state;
    return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch, ...bindActionCreators({
            ...globalActions
        }, dispatch)
    }
}

class SeparatedExpense extends PureComponent {
    constructor(props: Object) {
        super(props);
        // const {navigation} = props;
        // navigation.setOptions(
        //   {
        //     headerRight: (() => (
        //         <TouchableOpacity onPress={() => navigation.navigate(Config.ROUTE_ACCOUNT_FILL)}>
        //           <View style={{
        //             width: pxToDp(96),
        //             height: pxToDp(46),
        //             backgroundColor: colors.main_color,
        //             marginRight: 8,
        //             borderRadius: 10,
        //             justifyContent: "center",
        //             alignItems: "center"
        //           }}>
        //             <Text style={{color: colors.white, fontSize: 14, fontWeight: "bold"}}> 充值 </Text>
        //           </View>
        //         </TouchableOpacity>
        //       )
        //     )
        //   }
        // );
        let date = new Date();
        this.state = {
            balanceNum: 0,
            records: [],
            records2: [],
            by_labels: [],
            data_labels: [],
            date: date,
            choseTab: 1,
            start_day: this.format(date)
        }
    }

    UNSAFE_componentWillMount() {
        this.fetchExpenses()
        this.getBanlance()
    }


    fetchExpenses() {
        const self = this;
        showModal('加载中')
        const {global} = self.props;
        const url = `api/store_separated_items_statistics/${global.currStoreId}/${this.state.start_day}?access_token=${global.accessToken}&start_day=`;
        HttpUtils.get.bind(this.props)(url).then(res => {
            self.setState({records: res.records, by_labels: res.by_labels, data_labels: res.data_labels}, () => {
                hideModal()
            })
        }, () => {
            hideModal();
        })
    }

    //获取余额
    getBanlance() {
        // const url = `new_api/stores/store_remaining_fee/${global.currStoreId}?access_token=${global.accessToken}`;
        const self = this;
        const {global} = self.props;
        const url = `new_api/stores/store_remaining_fee/${global.currStoreId}?access_token=${global.accessToken}`;
        HttpUtils.get.bind(this.props)(url).then(res => {
            console.log('res->', res)
            this.setState({
                balanceNum: res
            })
        })
    }

    // 获取充值记录
    fetchaddExpenses() {
        const self = this;
        const {global} = self.props;

        const url = `new_api/stores/store_recharge_log/${global.currStoreId}/${this.state.start_day}?access_token=${global.accessToken}`;
        HttpUtils.get.bind(this.props)(url).then(res => {
            if (res.records) {
                self.setState({records2: res.records})
            }

        })
    }

    onHeaderStyle(record) {
        return record.sa === 1 ? record.day_balanced > 0 ? style.saAmountAddStyle : style.saAmountStyle : {};
    }

    onChange = (date) => {
        console.log(date, this.format(date));
        var that = this;
        this.setState({date: date, start_day: this.format(date)}, function () {
            if (that.state.choseTab === 1) {
                this.fetchExpenses();
            } else {
                this.fetchaddExpenses();
            }

        })

    }

    format = (date) => {
        let mday = date.getDate();
        let month = date.getMonth() + 1;
        month = month < 10 ? `0${month}` : month;
        return `${date.getFullYear()}-${month}`;
    }

    onDismiss() {
        console.log('onDismiss');
    }

    onItemClicked(item) {
        let _this = this;
        InteractionManager.runAfterInteractions(() => {
            _this.props.navigation.navigate(Config.ROUTE_SEP_EXPENSE_INFO, {
                day: item.day,
                total_balanced: item.total_balanced
            });
        });
    }

    onItemAccountStyle(item) {
        return item.sa === 1 ? (item.amount > 0 ? style.saAmountAddStyle : style.saAmountStyle) : {};
    }


    render() {
        const props = this.props;
        const {date, records, records2} = this.state;
        const datePicker = (
            <DatePicker
                rootNativeProps={{'data-xx': 'yy'}}
                minDate={new Date(2015, 8, 15, 10, 30, 0)}
                maxDate={new Date()}
                defaultDate={date}
                mode="month"
                locale={zh_CN}
            />
        );
        return (
            <ScrollView
                style={{flex: 1, backgroundColor: '#f5f5f9'}}
            >
                <List
                    style={{width: "100%"}}
                    renderHeader={() => {
                        return <View
                            style={{flexDirection: 'row', alignItems: 'center', width: "100%",}}>

                            <View style={[mystyles.topBox]}>
                                <Text style={[mystyles.txt1]}>当前余额（元）</Text>
                                <Text style={[mystyles.txt2]}> {this.state.balanceNum}</Text>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate(Config.ROUTE_ACCOUNT_FILL)}>
                                    <Text style={[mystyles.txt3]}> 去充值</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    }}>

                    <View style={[mystyles.centerbox2]}>
                        <TouchableOpacity style={[mystyles.tabItem]} onPress={() => {
                            this.setState({
                                choseTab: 1
                            })
                            this.fetchExpenses();
                        }}>
                            <View>
                                <Text>费用账单</Text>
                            </View>
                            <If condition={this.state.choseTab === 1}>
                                <View style={[mystyles.tabItemline]}></View>
                            </If>
                        </TouchableOpacity>
                        <TouchableOpacity style={[mystyles.tabItem]} onPress={() => {
                            this.setState({
                                choseTab: 2
                            })
                            this.fetchaddExpenses();
                        }}>

                            <View>
                                <Text>充值记录</Text>

                            </View>
                            <If condition={this.state.choseTab === 2}>
                                <View style={[mystyles.tabItemline]}></View>
                            </If>
                        </TouchableOpacity>
                    </View>
                    {/*费用账单列表部分*/}

                    <View style={[mystyles.centerbox]}>

                        <View style={[mystyles.start_day]}>
                            <Text style={{fontWeight: 'bold'}}>{this.state.start_day}</Text>
                        </View>

                        <PopPicker
                            datePicker={datePicker}
                            transitionName="rmc-picker-popup-slide-fade"
                            maskTransitionName="rmc-picker-popup-fade"
                            styles={styles}
                            title={'选择日期'}
                            okText={'确认'}
                            dismissText={'取消'}
                            date={date}
                            onDismiss={this.onDismiss}
                            onChange={this.onChange}
                        >
                            <Text style={{
                                height: 40,
                                width: "100%",
                                alignItems: 'center',
                                flexDirection: "row",
                                justifyContent: 'space-between',
                                paddingLeft: '5%',
                                paddingRight: '3%',
                                marginTop: 12,
                            }}>
                                <View style={{
                                    width: pxToDp(220),
                                    height: pxToDp(50),
                                    backgroundColor: colors.white,
                                    // marginRight: 8,
                                    borderRadius: 5,
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    // borderWidth: pxToDp(1)
                                }}>
                                    <View><Text
                                        style={{
                                            width: pxToDp(200),
                                            color: colors.title_color,
                                            fontSize: 16,
                                            fontWeight: 'bold'
                                        }}> 请选择月份</Text></View>
                                    <View><Text><Icon name={"caret-down"} size={"xs"} color={"#666"}/></Text></View>
                                </View>
                            </Text>
                        </PopPicker>

                    </View>
                    <If condition={this.state.choseTab === 1}>
                        {records && records.map((item, id) => {
                            return <TouchableOpacity style={[mystyles.tabItem]} onPress={() =>  this.onItemClicked(item)}>
                            <View style={[mystyles.itembox]}>
                                <View style={[mystyles.days]}><Text>{item.day}</Text></View>
                                <View style={[mystyles.money]}><Text style={{textAlign: 'right',}}>
                                    今日支出 &nbsp;&nbsp;
                                    <Text style={{
                                        fontSize: 18,
                                        fontWeight: 'bold'
                                    }}> {item.day_balanced !== '' ? (`${item.day_balanced / 100}`) : ''}&nbsp;&nbsp;&nbsp;&nbsp;
                                        <Entypo name='chevron-thin-right' style={{fontSize: 14,}}/>

                                    </Text>
                                </Text>
                                </View>
                            </View>
                            </TouchableOpacity>


                        })}
                    </If>
                    {/*充值记录*/}
                    <If condition={this.state.choseTab === 2}>
                        {records2 && records2.map((item, idx) => {
                            return <View style={[mystyles.addItem]}>
                                <View style={[mystyles.addItemleft]}>
                                    <Text style={[mystyles.addtxt1]}>{item.remark}</Text>
                                    <Text style={[mystyles.addtxt2]}>{item.created}</Text>
                                </View>
                                <View style={[mystyles.addItemright]}>
                                    <Text
                                        style={[mystyles.addtxt3]}> {item.type === "1" ? '+' : '-'}{item.fee / 100}</Text>
                                </View>
                            </View>
                        })}
                    </If>

                </List>
            </ScrollView>
        )
    }
}

const mystyles = StyleSheet.create({
    addItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        borderBottomWidth: pxToDp(1),
        borderColor: '#ccc',
        paddingTop: pxToDp(20),
        paddingBottom: pxToDp(20),
        paddingLeft: pxToDp(40),

    },
    addItemleft: {
        flex: 3,

    },
    addtxt1: {
        fontWeight: "bold",
    },
    addtxt2: {
        color: '#999',
        marginTop: pxToDp(8)
    },
    addItemright: {
        fontWeight: "bold",
        flex: 1,
    },
    addtxt3: {
        textAlign: 'right',
        marginRight: pxToDp(40),
        fontWeight: 'bold',

    },
    topBox: {
        width: '100%',
        marginTop: pxToDp(20),
        marginBottom: pxToDp(20),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        paddingTop: pxToDp(50),
        paddingBottom: pxToDp(50)
    },
    txt1: {
        fontWeight: "bold"
    },
    txt2: {
        marginTop: pxToDp(30),
        marginBottom: pxToDp(30),
        fontSize: pxToDp(60),
        fontWeight: "bold"
    },
    txt3: {
        backgroundColor: colors.main_color,
        color: 'white',
        paddingLeft: pxToDp(100),
        paddingRight: pxToDp(100),
        paddingTop: pxToDp(10),
        paddingBottom: pxToDp(10),
    },
    tabItem: {
        paddingTop: pxToDp(30),
        paddingBottom: pxToDp(30),
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    tabItemline: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: colors.main_color,
        height: pxToDp(4)
    },
    start_day: {
        paddingTop: pxToDp(30),
        paddingBottom: pxToDp(30),
        flex: 1,
        paddingLeft: pxToDp(40),
        fontWeight: "bold",
    },
    centerbox2: {
        flexDirection: 'row', alignItems: 'center', width: "100%",
        borderBottomWidth: pxToDp(30),
        borderColor: '#f7f7f7',
    },
    centerbox: {
        flexDirection: 'row', alignItems: 'center', width: "100%",
        borderBottomWidth: pxToDp(1),
        borderColor: '#ccc',
    },
    itembox: {
        flexDirection: 'row', alignItems: 'center', width: "100%",
        borderBottomWidth: pxToDp(1),
        borderColor: '#ccc',
        paddingTop: pxToDp(10),
        paddingBottom: pxToDp(30),
        backgroundColor: 'white'
    },
    days: {

        flex: 1,
        marginLeft: pxToDp(40)
    },
    money: {

        textAlign: 'right',
        flex: 1.5,
        marginRight: pxToDp(60)
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpense);
