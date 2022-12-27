import React, {PureComponent} from "react";
import {
  Animated,
  Easing,
  FlatList,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {get_supply_bill_list} from "../../../reducers/settlement/settlementActions";

import Config from "../../../pubilc/common/config";
import tool, {dateTime} from "../../../pubilc/util/tool.js";
import colors from "../../../pubilc/styles/colors";
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import dayjs from "dayjs";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import HttpUtils from "../../../pubilc/util/http";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {Button} from "react-native-elements";
import CommonModal from "../../../pubilc/component/goods/CommonModal";
import WebView from "react-native-webview";
import 'react-native-get-random-values';
import {SvgXml} from "react-native-svg";
import {back} from "../../../svg/svg";
import MonthPicker from "react-native-month-year-picker";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        get_supply_bill_list,
        ...globalActions
      },
      dispatch
    )
  };
}

const {width, height} = Dimensions.get("window");

class SettlementScene extends PureComponent {

  constructor(props) {
    super(props);
    let date = new Date();
    this.state = {
      list: [],
      orderNum: 0,
      totalPrice: 0,
      status: 0,
      date: date,
      dates: tool.fullMonth(date),
      store_pay_info: [],
      show_pay_info: false,
      showAgreement: props.route.params?.showSettle || false,
      showPrompt: false,
      settleProtocolInfo: {},
      fadeOutOpacity: new Animated.Value(0),
      visible: false
    };

  }

  componentDidMount() {
    this.fetchSettleProtocol()
    this.getSupplyList()
  }

  onPress(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  fetchSettleProtocol = () => {
    let {store_id, accessToken} = this.props.global;
    let url = `/api/settle_protocol_desc/${store_id}`;
    HttpUtils.get(url, {
      access_token: accessToken
    }).then(res => {
      this.setState({
        settleProtocolInfo: res
      })
    })
  }

  getSupplyList = () => {
    let {store_id, accessToken, vendor_id} = this.props.global;
    const params = {new_format: 1}
    let url = `/api/get_supply_bill_list_v2/${vendor_id}/${store_id}/${this.state.dates}?access_token=${accessToken}`;
    HttpUtils.get(url, params).then(res => {
      const {bills = [], store_pay_info = [], support_payment = 0} = res
      const today = bills[0]
      this.setState({
        status: today.status,
        orderNum: today.order_num,
        totalPrice: today.bill_price,
        id: today.id,
        list: bills,
        store_pay_info: store_pay_info,
        show_pay_info: Number(support_payment) === 1
      })
    }).catch((res) => {
      ToastShort(res.reason)
    })
  }

  startAnimation() {
    this.state.fadeOutOpacity.setValue(1);
    Animated.timing(this.state.fadeOutOpacity, {
      toValue: 0,
      duration: 5000,
      useNativeDriver: true,
      easing: Easing.linear,
    }).start();
  }

  renderHead = () => {
    return (
      <View style={styles.head}>
        <SvgXml onPress={() => this.props.navigation.goBack()} xml={back()}/>
        <Text style={styles.headTitle}>结算 </Text>
        <TouchableOpacity onPress={() => this.toSettleProtocol(false)}>
          <Text style={styles.headerRightText}>结算协议 </Text>
        </TouchableOpacity>
      </View>
    )
  }

  toDetail(date, status, id, profit) {
    let {navigation, route} = this.props;
    let {settleProtocolInfo} = this.state;
    navigation.navigate(Config.ROUTE_SETTLEMENT_DETAILS, {
      date: date,
      status: status,
      id: id,
      profit,
      key: route.key,
      totalPrePriceDesc: settleProtocolInfo.toast_total,
      shipPriceDesc: settleProtocolInfo.toast_ship
    });
  }

  toSettleProtocol = (flag = false) => {
    let {settleProtocolInfo} = this.state;
    this.setState({
      showPrompt: false
    })
    this.onPress(Config.ROUTE_SETTLEMENT_PROTOCOL, {
      ptl_sign: settleProtocolInfo?.ptl_sign || '',
      showPrompt: flag,
      onBack: (res) => {
        this.setState({showPrompt: res})
      }
    })
  }

  onChange = (event, date) => {
    if (event === 'dismissedAction') {
      this.setState({visible: false})
      return
    }
    this.setState({
      date: date,
      dates: tool.fullMonth(date)
    }, () => {
      this.getSupplyList()
    })
  }

  closeAgreeModal = () => {
    this.setState({showAgreement: false, showPrompt: true})
  }

  closePromptModal = () => {
    this.setState({showPrompt: false})
  }

  touchPromptBtn = (type) => {
    let {navigation} = this.props;
    this.closePromptModal()
    switch (type) {
      case 'no':
        this.clickProtocol('tip_reject')
        navigation.goBack()
        break
      case 'agree':
        this.clickProtocol('tip_agree')
        this.submitAgree()
        break
      default:
        break
    }
  }

  submitAgree = () => {
    let {store_id, accessToken} = this.props.global;
    let url = `/api/settle_protocol_agree/${store_id}`;
    HttpUtils.get(url, {
      access_token: accessToken
    }).then(res => {
      ToastShort('操作成功')
      this.startAnimation()
      this.fetchSettleProtocol()
    }).catch((res) => {
      ToastShort(res.reason)
    })
  }

  clickProtocol = (type = '') => {
    let {store_id, accessToken} = this.props.global;
    let url = `/api/protocol_click_stat/${store_id}`;
    HttpUtils.get(url, {
      access_token: accessToken,
      type: type
    }).then(res => {
    }).catch((res) => {
      ToastShort(res.reason)
    })
  }

  render() {
    const {show_pay_info, visible, date} = this.state
    return (
      <View style={{flex: 1}}>
        {this.renderHead()}
        {this.renderAnimated()}
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.page}>
          <If condition={show_pay_info}>
            {this.renderPayList()}
          </If>
          {this.renderToday()}
          {this.renderList()}
          {this.renderAgreementModal()}
          {this.renderPromptModal()}
        </ScrollView>
        <CommonModal visible={visible} onRequestClose={() => this.onChange('dismissedAction')}>
          <MonthPicker value={date}
                       cancelButton={'取消'}
                       okButton={'确定'}
                       autoTheme={true}
                       mode={'number'}
                       onChange={(event, newDate) => this.onChange(event, newDate)}
                       maximumDate={new Date()}
                       minimumDate={new Date(2015, 8, 15)}/>
        </CommonModal>
      </View>
    );
  }

  renderAnimated = () => {
    let {settleProtocolInfo, fadeOutOpacity} = this.state;
    return (
      <Animated.View
        style={{
          opacity: fadeOutOpacity, position: 'absolute', top: 25, right: 60, zIndex: 999
        }}>
        <Entypo name={'triangle-up'} style={styles.upIcon}/>
        <View style={styles.msgModal}>
          <Text style={styles.tipText}>{settleProtocolInfo?.toast_ptl || `您可以在这里查看签署的协议。`} </Text>
        </View>
      </Animated.View>
    )
  }

  renderPayList() {
    const {navigation} = this.props
    const {store_pay_info} = this.state
    return (
      <TouchableOpacity onPress={() => navigation.navigate(Config.ROUTE_BIND_PAY, store_pay_info)}
                        style={styles.accountZoneWrap}>
        <View style={styles.accountWrap}>
          <Text style={styles.accountTipText}>收款账号</Text>
          <View style={{flex: 1}}/>
          <Text style={styles.moreInfoText}>更多信息</Text>
          <Entypo name={"chevron-thin-right"} color={colors.color999} size={14}/>
        </View>

        <For each='item' index="idx" of={store_pay_info}>
          <View style={styles.accountListWrap} key={idx}>
            <FontAwesome5 name={item.icon}
                          size={item.icon === 'weixin' ? 25 : 30}
                          color={item.icon === 'weixin' ? colors.main_color : colors.fontBlue}/>
            <Text style={styles.accountNameText}>
              {item.label}
            </Text>
            <If condition={item.default}>
              <View style={{backgroundColor: '#FF8309', borderRadius: 2}}>
                <Text style={{fontSize: 11, paddingHorizontal: 4, paddingVertical: 2, color: colors.white}}>默认</Text>
              </View>
            </If>
            <View style={{flex: 1}}/>
            <Text style={{color: item.status_text === '已绑定' ? colors.color333 : colors.color999, fontSize: 14}}>
              {item.status_text}
            </Text>
          </View>
        </For>
      </TouchableOpacity>
    )
  }

  renderToday() {
    const {status, id, orderNum, totalPrice} = this.state
    return (
      <TouchableOpacity style={styles.todayWrap} onPress={() => this.toDetail(tool.fullDay(new Date()), status, id)}>
        <Text style={styles.todayHeaderText}>打款记录</Text>
        <View style={styles.todayDetailWrap}>
          <View style={{paddingVertical: 10, flex: 1}}>
            <Text style={{color: colors.color666, fontSize: 14}}>
              今日数据（{tool.fullDay(new Date())}）
            </Text>
            <Text style={styles.alreadyOrderText}>
              已完成订单: {orderNum}  &nbsp;&nbsp;  金额: {tool.toFixed(totalPrice)}元
            </Text>
          </View>
          <Entypo name={"chevron-thin-right"} color={colors.color999} size={18}/>
        </View>
      </TouchableOpacity>
    )
  }

  toMonthGather = () => {
    let {navigation} = this.props;
    let {dates} = this.state
    navigation.navigate(Config.ROUTE_SETTLEMENT_GATHER, {date: dates});
  }

  renderList() {
    const {list, dates} = this.state

    return (
      <View style={styles.listWrap}>
        <View style={styles.listHeaderWrap}>
          <Text style={styles.listDateText}>
            {dates}&nbsp;
            <Entypo name={"triangle-down"} color={colors.color999} size={20}/>
          </Text>
          <View style={{flex: 1}}/>
          <Text onPress={this.toMonthGather} style={styles.countCurrentMonthText}>
            本月销量汇总
          </Text>
        </View>
        <FlatList data={list}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  renderItem={this.renderItem}
                  initialNumToRender={10}
                  getItemLayout={(data, index) => this.getItemLayout(data, index)}
                  keyExtractor={(item1, index) => `${index}`}/>
      </View>
    )
  }

  getItemLayout = (data, index) => ({
    length: 45, offset: 45 * index, index
  })

  renderItem = ({item}) => {
    const {bill_date, status, id, profit_price, status_label, bill_price, pay_datetime} = item
    if (id)
      return (
        <TouchableOpacity onPress={() => this.toDetail(bill_date, status, id, profit_price)}
                          style={styles.listItemWrap}>
          <Text style={styles.listItemDateText}>
            {dayjs(bill_date).format('MM-DD')}
          </Text>

          <View style={{width: 32}}>
            <If condition={item.icon}>
              <FontAwesome5 name={item.icon}
                            style={{
                              marginLeft: 6,
                              fontSize: item.icon === 'weixin' ? 20 : 25,
                              color: item.icon === 'weixin' ? colors.main_color : colors.fontBlue,
                            }}/>
            </If>
          </View>

          <View style={{marginLeft: 4}}>
            <Text style={{color: pay_datetime ? colors.color666 : colors.warn_color, fontSize: 12}}>
              {status_label}
            </Text>
            <If condition={pay_datetime}>
              <Text style={styles.listItemPayDatetimeText}>
                打款时间：{dateTime(pay_datetime)}
              </Text>
            </If>
          </View>
          <View style={{flex: 1}}/>
          <Text style={styles.listItemPriceText}>
            {tool.toFixed(bill_price)}
          </Text>
          <Entypo name={"chevron-thin-right"} color={colors.color999} size={18}/>
        </TouchableOpacity>
      );
  }

  renderAgreementModal = () => {
    let {showAgreement, settleProtocolInfo} = this.state;
    return (
      <CommonModal visible={showAgreement} position={'center'} onRequestClose={this.closeAgreeModal}
                   animationType={'fade'}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {settleProtocolInfo.ptl_title}
          </Text>
          <Text style={[styles.modalContentDesc, {marginVertical: 10}]}>
            {settleProtocolInfo.ptl_desc}
          </Text>
          <View style={{width: width * 0.8, height: height * 0.4}}>
            <WebView
              style={{
                backgroundColor: colors.white,
                flex: 1
              }}
              automaticallyAdjustContentInsets={true}
              source={{uri: `${Config.serverUrl('/SettlePolicy.html')}`}}
              scrollEnabled={true}
            />
          </View>
          <View style={styles.modalBtnBottom}>
            <Button title={'不同意'}
                    onPress={() => {
                      this.clickProtocol('ptl_reject')
                      this.closeAgreeModal()
                    }}
                    buttonStyle={[styles.modalBtnWrap, {backgroundColor: colors.f5}]}
                    titleStyle={[styles.modalBtnText, {color: colors.color666}]}
            />
            <Button title={'同意'}
                    onPress={() => {
                      this.clickProtocol('ptl_agree')
                      this.setState({showAgreement: false}, () => {
                        this.submitAgree()
                      })
                    }}
                    buttonStyle={[styles.modalBtnWrap, {backgroundColor: colors.main_color}]}
                    titleStyle={[styles.modalBtnText, {color: colors.white}]}
            />
          </View>
        </View>
      </CommonModal>
    )
  }

  renderPromptModal = () => {
    let {showPrompt, settleProtocolInfo} = this.state;
    return (
      <CommonModal visible={showPrompt} position={'center'} onRequestClose={this.closePromptModal}
                   animationType={'fade'}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {settleProtocolInfo.tip_title}
          </Text>
          <Text style={[styles.modalContentDesc, {marginVertical: 10}]}>
            {settleProtocolInfo.tip_desc}<Text style={styles.agreementText} onPress={() => {
            this.setState({
              showPrompt
            }, () => this.toSettleProtocol(true))
          }}>《结算协议》 </Text>。
          </Text>
          <View style={styles.modalBtnBottom}>
            <Button title={'暂不'}
                    onPress={() => this.touchPromptBtn('no')}
                    buttonStyle={[styles.modalBtnWrap, {backgroundColor: colors.f5}]}
                    titleStyle={[styles.modalBtnText, {color: colors.color666}]}
            />
            <Button title={'同意'}
                    onPress={() => this.touchPromptBtn('agree')}
                    buttonStyle={[styles.modalBtnWrap, {backgroundColor: colors.main_color}]}
                    titleStyle={[styles.modalBtnText, {color: colors.white}]}
            />
          </View>
        </View>
      </CommonModal>
    )
  }

}

const styles = StyleSheet.create({
  page: {padding: 10},
  accountZoneWrap: {backgroundColor: colors.white, padding: 10, borderRadius: 8},
  accountWrap: {flexDirection: 'row', alignItems: 'center', height: 45},
  accountTipText: {color: colors.color333, fontWeight: 'bold', fontSize: 16, lineHeight: 22},
  moreInfoText: {color: colors.color999, fontSize: 13, lineHeight: 18},
  accountListWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    borderTopWidth: 1,
    borderColor: colors.colorEEE
  },
  accountNameText: {color: colors.color333, marginLeft: 10, fontWeight: "400", fontSize: 16},
  todayWrap: {backgroundColor: colors.white, padding: 10, borderRadius: 8, marginTop: 10, paddingBottom: 6},
  todayHeaderText: {color: colors.color333, fontWeight: 'bold', fontSize: 16, paddingVertical: 12},
  todayDetailWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: colors.colorEEE,
  },
  alreadyOrderText: {color: colors.color333, fontSize: 14, marginTop: 3},
  listWrap: {backgroundColor: colors.white, padding: 10, borderRadius: 8, marginTop: 10},
  listHeaderWrap: {flexDirection: 'row', alignItems: 'center', justifyContent: "space-between", paddingVertical: 6},
  listDateText: {color: colors.color333, fontWeight: 'bold', fontSize: 14, padding: 5},
  countCurrentMonthText: {color: colors.color333, marginLeft: 10, fontWeight: 'bold', fontSize: 14},
  listItemWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    height: 45,
  },
  listItemDateText: {color: colors.color333, fontSize: 14, fontWeight: 'bold', width: 44},
  listItemPayDatetimeText: {fontSize: 12, color: colors.color666},
  listItemPriceText: {color: colors.color333, fontSize: 16, fontWeight: 'bold'},
  headerRightText: {color: colors.color333, fontSize: 15},
  Content: {
    backgroundColor: colors.white,
    maxHeight: 300
  },
  modalContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    width: width * 0.9,
    marginLeft: width * 0.05
  },
  modalTitle: {
    color: colors.color333,
    fontWeight: "bold",
    fontSize: 16
  },
  modalContentDesc: {
    color: colors.color333,
    fontSize: 14,
    lineHeight: 20
  },
  modalBtnBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    width: width * 0.75
  },
  modalBtnWrap: {
    width: width * 0.35,
    height: 40,
    borderRadius: 20
  },
  modalBtnText: {
    fontSize: 16,
    textAlign: 'center'
  },
  agreementText: {
    color: colors.main_color,
    fontSize: 15
  },
  upIcon: {
    color: "rgba(0,0,0,0.7)",
    fontSize: 24,
    marginLeft: 60,
    position: 'absolute',
    top: 0,
    right: -40
  },
  msgModal: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    height: 45,
    width: 128,
    position: 'absolute',
    top: 17,
    right: -50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5
  },
  tipText: {fontSize: 14, color: colors.white, lineHeight: 17, flex: 1, width: 108, height: 35},
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    height: 44,
    backgroundColor: colors.white,
    paddingHorizontal: 6
  },
  headTitle: {
    color: colors.color333,
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 24
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene);
