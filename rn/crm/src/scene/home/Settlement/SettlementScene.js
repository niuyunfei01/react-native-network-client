import React, {PureComponent} from "react";
import {FlatList, InteractionManager, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {get_supply_bill_list} from "../../../reducers/settlement/settlementActions";

import Config from "../../../pubilc/common/config";
import tool from "../../../pubilc/util/tool.js";
import colors from "../../../pubilc/styles/colors";
import {hideModal, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";
import dayjs from "dayjs";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import HttpUtils from "../../../pubilc/util/http";
import popupStyles from 'rmc-picker/lib/PopupStyles';
import zh_CN from 'rmc-date-picker/lib/locale/zh_CN';
import DatePicker from 'rmc-date-picker/lib/DatePicker';
import PopPicker from 'rmc-date-picker/lib/Popup';
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import {Button} from "react-native-elements";
import CommonModal from "../../../pubilc/component/goods/CommonModal";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import WebView from "react-native-webview";

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

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    return navigation.addListener('focus', () => onRefresh());
  }, [navigation])
  return null;
}
const width = Dimensions.get("window").width;

class SettlementScene extends PureComponent {

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    let date = new Date();
    console.log('this.props.route.params?.showSettle', this.props.route.params?.showSettle)
    this.state = {
      list: [],
      orderNum: 0,
      totalPrice: 0,
      status: 0,
      date: date,
      dates: this.format(date),
      store_pay_info: [],
      show_pay_info: false,
      showAgreement: this.props.route.params?.showSettle || false,
      showPrompt: false,
      agreementInfo: {
        title: '结算协议',
        notice: '尊敬的客户：在查看结算记录之前，为了让您更好的了解我们是如何与您结算金额，请您仔细阅读《结算协议》，协议内容如下：',
        content: '金佛山饭撒减肥哈森女风i拉屎咖啡就那么飒风i阿斯利康你饭撒客服还能撒了房间拿沙发舒服噶看不见风，撒风景好散发生了纠纷和你撒金佛山饭撒减肥哈森女风i拉屎咖啡就那么飒风i阿斯利康你饭撒客服还能撒了房间拿沙发舒服噶看不见风，撒风景好散发生了纠纷和你撒金佛山饭撒减肥哈森女风i拉屎咖啡就那么飒风i阿斯利康你饭撒客服还能撒了房间拿沙发舒服噶看不见风，撒风景好散发生了纠纷和你撒阿斯利康你饭金佛山饭撒减肥哈森女风i拉屎咖啡就那么飒风i阿斯利康你饭撒客服还能撒了房间拿沙发舒服噶看不见风，撒风景好散发生了纠纷和你撒金佛山饭撒减肥哈森女风i拉屎咖啡就那么飒风i阿斯利康你饭撒客服还能撒了房间拿沙发舒服噶看不见风，撒风景好散发生了纠纷和你撒金佛山饭撒减肥哈森女风i拉屎咖啡就那么飒风i阿斯利康你饭撒客服还能撒了房间拿沙发舒服噶看不见风，撒风景好散发生了纠纷和你撒阿斯利康你饭'
      },
      settleProtocolInfo: {}
    };

  }

  // UNSAFE_componentWillMount() {
  //   this.fetchShowSettleProtocol()
  // }

  componentDidMount() {
    this.fetchSettleProtocol()
    let {navigation} = this.props;
    navigation.setOptions({
      headerRight: () => this.renderHeaderRight()
    })
  }

  onPress(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  // fetchShowSettleProtocol = () => {
  //   let {currStoreId, accessToken} = this.props.global;
  //   let url = `/api/show_settle_protocol/20481`;
  //   HttpUtils.get(url, {
  //     access_token: '99adfa584158930ddd8bca1f94cf27709a8ee85d'
  //   }).then(res => {
  //     this.setState({
  //       showAgreement: res.is_show == 0
  //     })
  //   }).catch((res) => {
  //     ToastShort(res.reason)
  //   })
  // }

  fetchSettleProtocol = () => {
    let {currStoreId, accessToken} = this.props.global;
    let url = `/api/settle_protocol_desc/20481`;
    HttpUtils.get(url, {
      access_token: '99adfa584158930ddd8bca1f94cf27709a8ee85d'
    }).then(res => {
      this.setState({
        settleProtocolInfo: res
      })
    }).catch((res) => {
      ToastShort(res.reason)
    })
  }

  getSupplyList = () => {
    let {currStoreId, accessToken, vendor_id} = this.props.global;
    showModal('加载中...')
    const params = {new_format: 1}
    let url = `/api/get_supply_bill_list_v2/${vendor_id}/${currStoreId}/${this.state.dates}?access_token=${accessToken}`;
    HttpUtils.get(url, params).then(res => {
      hideModal()
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
      hideModal()
      ToastShort(res.reason)
    })
  }

  toDetail(date, status, id, profit) {
    let {navigation, route} = this.props;
    navigation.navigate(Config.ROUTE_SETTLEMENT_DETAILS, {
      date: date,
      status: status,
      id: id,
      profit,
      key: route.key
    });
  }

  toSettleProtocol = () => {
    let {settleProtocolInfo} = this.state;
    this.onPress(Config.ROUTE_SETTLEMENT_PROTOCOL, {
      ptl_sign: settleProtocolInfo?.ptl_sign || ''
    })
  }

  onChange = (date) => {
    this.setState({date: date, dates: this.format(date)}, () => {
      this.getSupplyList()
    })
  }

  format = (date) => {
    let month = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    return `${date.getFullYear()}-${month}`;
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
        this.mixpanel.track("温馨提示_暂不");
        navigation.goBack()
        break
      case 'agree':
        this.mixpanel.track("温馨提示_同意");
        break
      default:
        break
    }
  }

  render() {
    const {navigation} = this.props
    const {show_pay_info} = this.state
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.page}>
        <FetchView navigation={navigation} onRefresh={this.getSupplyList}/>
        <If condition={show_pay_info}>
          {this.renderPayList()}
        </If>
        {this.renderToday()}
        {this.renderList()}
        {this.renderAgreementModal()}
        {this.renderPromptModal()}
      </ScrollView>
    );
  }

  renderHeaderRight = () => {
    return (
      <TouchableOpacity onPress={() => this.toSettleProtocol()}>
        <Text style={styles.headerRightText}>结算协议 </Text>
      </TouchableOpacity>
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

  datePicker = () => {
    const {date} = this.state
    return (
      <DatePicker
        rootNativeProps={{'data-xx': 'yy'}}
        minDate={new Date(2015, 8, 15, 10, 30, 0)}
        maxDate={new Date()}
        defaultDate={date}
        mode="month"
        locale={zh_CN}
      />
    )
  }

  renderList() {
    const {list, date, dates} = this.state

    return (
      <View style={styles.listWrap}>
        <View style={styles.listHeaderWrap}>
          <PopPicker
            datePicker={this.datePicker()}
            transitionName="rmc-picker-popup-slide-fade"
            maskTransitionName="rmc-picker-popup-fade"
            styles={popupStyles}
            title={'选择日期'}
            okText={'确认'}
            dismissText={'取消'}
            date={date}
            onChange={this.onChange}
          >
            <Text style={styles.listDateText}>
              {dates}&nbsp;
              <Entypo name={"triangle-down"} color={colors.color999} size={20}/>
            </Text>
          </PopPicker>
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
                打款时间：{pay_datetime}
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
      <CommonModal visible={showAgreement} position={'center'} onRequestClose={this.closeAgreeModal} animationType={'fade'}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {settleProtocolInfo.ptl_title}
          </Text>
          <Text style={[styles.modalContentDesc, {marginVertical: 10}]}>
            {settleProtocolInfo.ptl_desc}
          </Text>
          <WebView
            style={{
              width: width * 0.6,
              backgroundColor: 'white'
            }}
            automaticallyAdjustContentInsets={true}
            source={{uri: 'https://fire7.waisongbang.com/SettlePolicy.html'}}
            scrollEnabled={true}
            scalesPageToFit
          />
          {/*<ScrollView*/}
          {/*  automaticallyAdjustContentInsets={false}*/}
          {/*  showsHorizontalScrollIndicator={false}*/}
          {/*  showsVerticalScrollIndicator={true}*/}
          {/*  style={styles.Content}*/}
          {/*>*/}
          {/*  <Text style={styles.modalContentDesc}>*/}
          {/*    {agreementInfo.content}*/}
          {/*  </Text>*/}
          {/*</ScrollView>*/}
          <View style={styles.modalBtnBottom}>
            <Button title={'不同意'}
                    onPress={() => {
                      this.mixpanel.track("结算协议_不同意");
                      this.closeAgreeModal()
                    }}
                    buttonStyle={[styles.modalBtnWrap, {backgroundColor: colors.f5}]}
                    titleStyle={[styles.modalBtnText, {color: colors.color666}]}
            />
            <Button title={'同意'}
                    onPress={() => {
                      this.mixpanel.track("结算协议_同意");
                      this.setState({showAgreement: false})
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
      <CommonModal visible={showPrompt} position={'center'} onRequestClose={this.closePromptModal} animationType={'fade'}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {settleProtocolInfo.tip_title}
          </Text>
          <Text style={[styles.modalContentDesc, {marginVertical: 10}]}>
            {settleProtocolInfo.tip_desc}<Text style={styles.agreementText} onPress={() => {
              this.setState({
                showPrompt
              }, () => this.toSettleProtocol())
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
  page: {flex: 1, padding: 10},
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
  listHeaderWrap: {flexDirection: 'row', alignItems: 'center', paddingVertical: 6},
  listDateText: {color: colors.color333, fontWeight: 'bold', fontSize: 14, padding: 5},
  countCurrentMonthText: {color: colors.color333, marginLeft: 10, fontWeight: 'bold', fontSize: 14},
  listItemWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: colors.colorEEE,
    borderBottomWidth: 1,
    height: 45,
  },
  listItemDateText: {color: colors.color333, fontSize: 14, fontWeight: 'bold', width: 40},
  listItemPayDatetimeText: {fontSize: 12, color: colors.color666},
  listItemPriceText: {color: colors.color333, fontSize: 16, fontWeight: 'bold'},
  headerRightText: {color: colors.color333, fontSize: 15, marginRight: 10},
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
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SettlementScene);
