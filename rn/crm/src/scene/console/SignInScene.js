import React, {PureComponent} from "react";
import {View, StyleSheet, FlatList, Text, TouchableOpacity} from "react-native";
import {connect} from "react-redux";
import AntDesign from "react-native-vector-icons/AntDesign";
import dayjs from "dayjs";
import DateTimePicker from "react-native-modal-datetime-picker";
import {getSimpleTime} from "../../pubilc/util/TimeUtil";
import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import tool from "../../pubilc/util/tool";
import {showError, showSuccess} from "../../pubilc/util/ToastUtils";

const styles = StyleSheet.create({
    mainZoneWrap: {
        margin: 10,
        backgroundColor: colors.white,
        borderRadius: 8
    },
    signInText: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.color333,
        lineHeight: 22,
        textAlign: 'center',
        paddingTop: 12
    },
    innerWrap: {
        paddingTop: 89,
        paddingBottom: 122,
        alignItems: 'center',
    },
    inner: {
        width: 139,
        height: 139,
        borderRadius: 69.5,
        borderColor: "#FAB100",
        borderWidth: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    showTimeText: {fontSize: 32, fontWeight: 'bold', color: '#6c5b43', lineHeight: 37, letterSpacing: 1},
    showSignFlag: {fontSize: 14, fontWeight: '400', color: '#6c5b43', lineHeight: 20},
    currentDateWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomColor: colors.colorEEE,
        borderBottomWidth: 1
    },
    currentDate: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.color333,
        lineHeight: 21,
        marginRight: 4
    },
    bottomWrap: {
        margin: 10,
        backgroundColor: colors.white,
        borderRadius: 8
    },
    listHeadWrap: {
        flexDirection: 'row',
        padding: 12,
        borderBottomColor: colors.colorEEE,
        borderBottomWidth: 1
    },
    listHeadDateText: {fontSize: 16, fontWeight: '600', color: colors.color333, lineHeight: 22, width: 40},
    listHeadTimeText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.color333,
        lineHeight: 22,
        flex: 1,
        textAlign: 'center'
    },
    itemWrap: {
        flexDirection: 'row',
        paddingTop: 11,
        paddingLeft: 16,
        paddingBottom: 10,
        paddingRight: 30
    },
    itemText: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20, height: 40},
    itemCenter: {fontSize: 14, fontWeight: '400', color: colors.color333, lineHeight: 20, flex: 1, textAlign: 'center'}
})
const today = dayjs().format('YYYY-MM-DD');

class SignInScene extends PureComponent {

    state = {
        selectDate: today,
        showDatePicker: false,
        sigInInfo: {
            records: [],
            sign_status: 0
        },
        currentDatetime: getSimpleTime()
    }

    componentDidMount() {
        const {global, navigation} = this.props
        this.focus = navigation.addListener('focus', async () => {
            this.getTime = setInterval(() => {
                this.setState({currentDatetime: getSimpleTime()})
            }, 1000)
        })
        this.blur = navigation.addListener('blur', () => {
            this.getTime && clearInterval(this.getTime)
        })
        const {selectDate} = this.state
        this.getLogList(selectDate.substring(0, 7))
    }

    getLogList = (selectDate) => {
        const {currStoreId, accessToken} = this.props.global;
        const api = `/api/sign_status_with_record/${currStoreId}/${selectDate}?access_token=${accessToken}`
        HttpUtils.get.bind(this.props)(api).then(res => {
            this.setState({sigInInfo: res})
            console.log('res', res)
        }).catch((error) => {
            showSuccess(error)
        })
    }

    componentWillUnmount() {
        this.focus()
        this.blur()
    }

    touchSignIn = () => {
        const {sigInInfo} = this.state
        if (sigInInfo.sign_status === 2) {
            showSuccess('今日已签到')
            return;
        }
        const {accessToken, currStoreId} = this.props.global;
        if (sigInInfo.sign_status === 0) {
            const url = `/api/sign_in/${currStoreId}?access_token=${accessToken}`
            console.log('url', url)
            HttpUtils.get.bind(this.props)(url).then(() => {
                showSuccess('签到成功')
            },(res)=>{
                showSuccess('签到失败，原因：'+res.reason)
            }).catch((error) => {
                showError('签到失败，原因：' + error)
            })
            return
        }
        if (sigInInfo.sign_status === 1) {
            const url = `/api/sign_off/${currStoreId}?access_token=${accessToken}`
            HttpUtils.get.bind(this.props)(url).then(() => {
                showSuccess('签退成功')
            }).catch((error) => {
                showError('签退失败，原因：' + error)
            })
        }
    }

    renderMainZone = () => {
        const {currentUserProfile} = this.props.global;
        const {currentDatetime, sigInInfo} = this.state
        return (
            <View style={styles.mainZoneWrap}>
                <Text style={styles.signInText}>
                    {currentUserProfile.screen_name}
                </Text>
                <View style={styles.innerWrap}>
                    <TouchableOpacity style={styles.inner} onPress={this.touchSignIn}>
                        <Text style={styles.showTimeText}>
                            {currentDatetime}
                        </Text>
                        <Text style={styles.showSignFlag}>
                            {sigInInfo.sign_status === 0 ? '上班打卡' : sigInInfo.sign_status === 1 ? '下班打卡' : '今日已打卡'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderItem = (item) => {
        const {day, packed, sign_in_time, sign_off_time} = item.item
        return (
            <View style={styles.itemWrap}>
                <Text style={styles.itemText}>
                    {day.substring(5, 10)}
                </Text>
                <Text style={styles.itemCenter}>
                    {sign_in_time}-{sign_off_time}
                </Text>
                <Text style={styles.itemText}>
                    {packed}
                </Text>
            </View>
        )
    }
    renderList = () => {
        const {selectDate, sigInInfo} = this.state
        return (
            <View style={styles.bottomWrap}>
                <TouchableOpacity style={styles.currentDateWrap} onPress={() => this.setShowDatePicker(true)}>
                    <Text style={styles.currentDate}>
                        {selectDate.substring(0, 7)}
                    </Text>
                    <AntDesign name={'caretdown'} size={15}/>
                </TouchableOpacity>
                <View style={styles.listHeadWrap}>
                    <Text style={styles.listHeadDateText}>
                        日期
                    </Text>
                    <Text style={styles.listHeadTimeText}>
                        时间
                    </Text>
                    <Text style={styles.listHeadDateText}>
                        单量
                    </Text>
                </View>
                <FlatList data={sigInInfo.records}
                          renderItem={this.renderItem}
                          initialNumToRender={5}
                          keyExtractor={(item, index) => `${index}`}/>
            </View>
        )
    }

    emptyView = () => {
        return (
            <View/>
        )
    }
    setShowDatePicker = (value) => {
        this.setState({showDatePicker: value})
    }

    onConfirm = (date) => {
        const newDate = tool.fullDay(date)
        this.getLogList(newDate.substring(0, 7))
        this.setState({showDatePicker: false, selectDate: newDate})
    }

    render() {
        const {selectDate, showDatePicker} = this.state
        return (
            <View>
                {this.renderMainZone()}
                {this.renderList()}
                <DateTimePicker cancelTextIOS={'取消'}
                                confirmTextIOS={'确定'}
                                date={new Date(selectDate)}
                                customHeaderIOS={this.emptyView}
                                mode={'date'}
                                isVisible={showDatePicker}
                                onConfirm={(Date) => this.onConfirm(Date)}
                                onCancel={() => this.setShowDatePicker(false)}/>
            </View>
        )
    }
}

function mapStateToProps(state) {
    const {global} = state;
    return {global: global}
}

export default connect(mapStateToProps)(SignInScene)