import React, {PureComponent} from "react";
import {FlatList, StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import AntDesign from "react-native-vector-icons/AntDesign";
import colors from "../../pubilc/styles/colors";
import HttpUtils from "../../pubilc/util/http";
import {showError, showSuccess} from "../../pubilc/util/ToastUtils";
import tool from "../../pubilc/util/tool";
import CustomMonthPicker from "../../pubilc/component/CustomMonthPicker";

const styles = StyleSheet.create({
  flex1: {flex: 1},
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
    paddingBottom: 88,
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
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 21,
    marginRight: 4
  },
  bottomWrap: {
    margin: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    flex: 1
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 30
  },
  itemText: {
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,
  },
  itemCenter: {
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,

  },
  itemCenterText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 20,

    textAlign: 'center'
  },
  selectMonthText: {
    color: colors.color111,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
    width: 200,
    textAlign: 'right'
  },
  allowOrderWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12
  }
})
const today = new Date();

class SignInScene extends PureComponent {

  constructor(props) {
    super(props);
    const {sigInInfo} = props.route.params
    this.state = {
      selectDate: today,
      start_day: tool.fullMonth(today),
      sigInInfo: sigInInfo,
      currentDatetime: tool.simpleTime(today),
      shippingAcceptStatus: 1,
      visible: false
    }
  }

  componentDidMount() {
    const {navigation} = this.props
    this.focus = navigation.addListener('focus', async () => {
      this.getTime = setInterval(() => {
        this.setState({currentDatetime: tool.simpleTime(new Date())})
      }, 1000)
    })
    this.blur = navigation.addListener('blur', () => {
      this.getTime && clearInterval(this.getTime)
    })
    const {start_day} = this.state
    this.getLogList(start_day)
    this.getShippingStatus()
  }

  getLogList = (start_day) => {
    const {store_id, accessToken} = this.props.global;
    const api = `/api/sign_status_with_record/${store_id}/${start_day}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({sigInInfo: res})
    })
  }

  getShippingStatus = () => {
    const {store_id, accessToken} = this.props.global;
    const url = `/api/shipping_accept_status/${store_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({shippingAcceptStatus: res.status})
    })
  }

  componentWillUnmount() {
    this.focus()
    this.blur()
  }

  signIn = (url, start_day) => {
    HttpUtils.get.bind(this.props)(url).then(() => {
      showSuccess('签到成功')
      this.getLogList(start_day)
    }, (res) => {
      showError('签到失败，原因：' + res.reason)
    }).catch((error) => {
      showError('签到失败，原因：' + error.reason)
    })
  }

  signOff = (url, start_day) => {
    HttpUtils.get.bind(this.props)(url).then(() => {
      showSuccess('签退成功')
      this.shippingStop()
      this.getLogList(start_day)
    }, res => {
      showError('签退失败，原因：' + res.reason)
    }).catch((error) => {
      showError('签退失败，原因：' + error.reason)
    })
  }
  touchSignIn = () => {
    const {sigInInfo, start_day} = this.state
    const {accessToken, store_id} = this.props.global;
    let url = `/api/sign_in/${store_id}?access_token=${accessToken}`
    switch (sigInInfo.sign_status) {
      case 0:
      case 2:
        this.signIn(url, start_day)
        break
      case 1:
        url = `/api/sign_off/${store_id}?access_token=${accessToken}`
        this.signOff(url, start_day)
        break
    }
  }

  renderMainZone = () => {
    const {currentUserProfile} = this.props.global;
    const {currentDatetime, sigInInfo, shippingAcceptStatus} = this.state
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
              {sigInInfo?.sign_status === 1 ? '下班打卡' : '上班打卡'}
            </Text>
          </TouchableOpacity>

        </View>
        <View style={styles.allowOrderWrap}>
          <Text>{shippingAcceptStatus === 2 ? '开启接单' : '停止接单'} </Text>
          <Switch value={shippingAcceptStatus === 2}
                  onValueChange={() => this.allowOrderOrStopOrder(shippingAcceptStatus)}/>
        </View>
      </View>
    )
  }

  allowOrderOrStopOrder = (shippingAcceptStatus) => {
    const {sigInInfo} = this.state
    switch (shippingAcceptStatus) {
      case 1:
        if (sigInInfo?.sign_status !== 1) {
          showError('请先打卡签到')
          return
        }
        this.shippingStart()
        break
      case 2:
        this.shippingStop()
        break
    }
  }

  shippingStart = () => {
    const {store_id, accessToken} = this.props.global;
    const url = `/api/shipping_start_accept/${store_id}/?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      showSuccess('开始接单')
      this.setState({shippingAcceptStatus: res.status})
    })
  }

  shippingStop = () => {
    const {store_id, accessToken} = this.props.global;
    const url = `/api/shipping_stop_accept/${store_id}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(url).then(res => {
      showSuccess('停止接单')
      this.setState({shippingAcceptStatus: res.status})
    })
  }
  renderItem = (item) => {
    const {day, packed, sign_in_time, sign_off_time, sign_ranges} = item.item
    return (
      <View style={styles.itemWrap}>
        <Text style={styles.itemText}>
          {day.substring(5, 10)}
        </Text>
        <View style={styles.itemCenter}>
          {
            sign_ranges.map((item, index) => {
              return (
                <Text key={index} style={styles.itemCenterText}>
                  {item}
                </Text>
              )
            })
          }
        </View>
        <Text style={styles.itemText}>
          {packed}
        </Text>
      </View>
    )
  }

  setVisible = (value) => {
    this.setState({visible: value})
  }
  renderList = () => {
    const {start_day, sigInInfo} = this.state
    return (
      <View style={styles.bottomWrap}>
        <View style={styles.currentDateWrap}>
          <Text style={styles.currentDate} onPress={() => this.setVisible(true)}>
            {start_day}
            <AntDesign name={'caretdown'} size={15}/>
          </Text>
        </View>

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
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  renderItem={this.renderItem}
                  initialNumToRender={5}
                  style={styles.flex1}
                  keyExtractor={(item, index) => `${index}`}/>
      </View>
    )
  }

  onChange = (event, date) => {
    this.setState({visible: false})
    if (event === 'dateSetAction') {
      const start_day = tool.fullMonth(date)
      this.getLogList(start_day)
      this.setState({start_day: start_day, selectDate: date, visible: false})
    }
  }

  render() {
    const {visible, selectDate} = this.state
    return (
      <>
        {this.renderMainZone()}
        {this.renderList()}
        <CustomMonthPicker visible={visible}
                           onChange={(event, newDate) => this.onChange(event, newDate)}
                           date={selectDate}/>
      </>
    )
  }
}

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

export default connect(mapStateToProps)(SignInScene)
