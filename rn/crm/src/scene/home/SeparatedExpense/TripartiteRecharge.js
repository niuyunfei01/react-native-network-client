import React, {PureComponent} from 'react'
import ReactNative, {
  ImageBackground,
  InteractionManager,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import styles from 'rmc-picker/lib/PopupStyles';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import pxToDp from "../../../pubilc/util/pxToDp";
import colors from "../../../pubilc/styles/colors";
import HttpUtils from "../../../pubilc/util/http";
import Config from "../../../pubilc/common/config";
import zh_CN from 'rmc-date-picker/lib/locale/zh_CN';
import DatePicker from 'rmc-date-picker/lib/DatePicker';
import PopPicker from 'rmc-date-picker/lib/Popup';
import {hideModal, showError, showModal, ToastLong} from "../../../pubilc/util/ToastUtils";
import Entypo from "react-native-vector-icons/Entypo"
import {Button, Image} from "react-native-elements";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import LinearGradient from "react-native-linear-gradient";
import JbbModal from "../../../pubilc/component/JbbModal";
import {InputItem} from "@ant-design/react-native";
const {StyleSheet} = ReactNative

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const WSB_ACCOUNT = 0;
const THIRD_PARTY_ACCOUNT = 1;

function FetchView({navigation, onRefresh}) {
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onRefresh()
    });
    return unsubscribe;
  }, [navigation])
  return null;
}

class SeparatedExpense extends PureComponent {
  constructor(props: Object) {
    super(props);
    let date = new Date();
    this.state = {
      isRefreshing: false,
      switchType: WSB_ACCOUNT,
      balanceNum: 0,
      records: [],
      records2: [],
      by_labels: [],
      data_labels: [],
      date: date,
      choseTab: 1,
      start_day: this.format(date),
      freeze_show: false,
      freeze_msg: "",
      prompt_msg: '外送帮仅支持充值，如需查看充值记录和账单明细，请登录配送商家版查看',
      thirdAccountList: [],
      pay_url: '',
      dadaAccountModal: false,
      dadaAccountNum: 0
    }
  }

  UNSAFE_componentWillMount() {
    this.fetchExpenses()
    this.fetchBalance()
    this.fetchFreeze()
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  onRefresh = () => {
    this.fetchThirdDeliveryList()
  }

  fetchExpenses = () => {
    showModal('加载中')
    const {global} = this.props;
    const url = `api/store_separated_items_statistics/${global.currStoreId}/${this.state.start_day}?access_token=${global.accessToken}&start_day=`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({
        records: res.records,
        by_labels: res.by_labels,
        data_labels: res.data_labels
      }, () => {
        hideModal()
      })
    }, () => {
      hideModal();
    })
  }

  //获取余额
  fetchBalance = () => {
    const {global} = this.props;
    const url = `new_api/stores/store_remaining_fee/${global.currStoreId}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({
        balanceNum: res
      })
    })
  }

  //获取冻结
  fetchFreeze = () => {
    const {global} = this.props;
    const url = `/v1/new_api/bill/freeze_info/${global.currStoreId}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      this.setState({
        freeze_show: res.show !== undefined && res.show === 1,
        freeze_msg: res.notice !== undefined ? res.notice : ""
      })
    })
  }

  // 获取充值记录
  fetchRechargeRecord = () => {
    const {global} = this.props;
    const url = `new_api/stores/store_recharge_log/${global.currStoreId}/${this.state.start_day}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      if (res.records) {
        this.setState({records2: res.records})
      }
    })
  }

  // 获取三方配送充值列表
  fetchThirdDeliveryList = () => {
    showModal('加载中')
    const {global} = this.props;
    const url = `/v1/new_api/delivery/delivery_account_balance/${global.currStoreId}?access_token=${global.accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      hideModal()
      this.setState({
        thirdAccountList: res
      })
    })
  }

  // 切换外送帮钱包 三方配送充值tab
  onChangeSwitchType = (val) => {
    if (val === WSB_ACCOUNT) {
      this.fetchExpenses()
      this.fetchBalance()
      this.fetchFreeze()
    } else if (val === THIRD_PARTY_ACCOUNT) {
      this.fetchThirdDeliveryList()
    }
    this.setState({
      switchType: val
    })
  }

  // 切换费用账单 充值记录tab
  onChange = (date) => {
    this.setState({date: date, start_day: this.format(date)}, function () {
      if (this.state.choseTab === 1) {
        this.fetchExpenses();
      } else {
        this.fetchRechargeRecord();
      }
    })
  }

  // 处理月份函数
  format = (date) => {
    let month = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    return `${date.getFullYear()}-${month}`;
  }

  onDismiss() {
  }

  // 跳转到费用账单详情
  onItemClicked = (item) => {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.onPress(Config.ROUTE_SEP_EXPENSE_INFO, {
        day: item.day
      });
    });
  }

  // 顺丰去充值
  toPay = (row) => {
    if (row.type == 2) {
      this.setState({
        dadaAccountModal: true,
        type_dada: row.type
      })
    } else {
      showModal('请求中')
      const {global} = this.props;
      const url = `/v1/new_api/delivery/delivery_pay_url?access_token=${global.accessToken}`;
      HttpUtils.post.bind(this.props)(url, {
        store_id: global.currStoreId,
        delivery_type_v1: row.type,
        amount: 0
      }).then(res => {
        hideModal()
        if (res.msg && res.msg !== '') {
          showError(`${res.msg}`)
        } else {
          this.setState({
            pay_url: res.pay_url,
            switch_type: THIRD_PARTY_ACCOUNT
          }, () => {
            ToastLong('即将前往充值...')
            setTimeout(() => {
              this.onPress(Config.ROUTE_WEB, {url: this.state.pay_url})
            }, 100)
          })
        }
      })
    }
  }

  // 达达去充值
  fetchDeliveryPayUrl = () => {
    showModal('请求中')
    let {type_dada, dadaAccountNum} = this.state
    const {global} = this.props;
    const url = `/v1/new_api/delivery/delivery_pay_url?access_token=${global.accessToken}`;
    HttpUtils.post.bind(this.props)(url, {
      store_id: global.currStoreId,
      delivery_type_v1: type_dada,
      amount: dadaAccountNum
    }).then(res => {
      hideModal()
      if (res.msg && res.msg !== '') {
        showError(`${res.msg}`)
      } else {
        this.setState({
          pay_url: res.pay_url,
          switch_type: THIRD_PARTY_ACCOUNT
        }, () => {
          ToastLong('即将前往充值...')
          setTimeout(() => {
            this.onPress(Config.ROUTE_WEB, {url: this.state.pay_url})
          }, 100)
        })
      }
    })
  }

  // 去授权
  toAuthorization = () => {
    this.onPress(Config.ROUTE_DELIVERY_LIST, {tab: 2})
  }

  closeAccountModal = () => {
    this.setState({
      dadaAccountModal: false,
      dadaAccountNum: 0
    })
  }

  render() {
    const {switchType} = this.state;
    return (
      <View style={Styles.containerContent}>
        <FetchView navigation={this.props.navigation} onRefresh={this.onRefresh.bind(this)}/>
        <ScrollView style={Styles.containerContent} refreshControl={
          <RefreshControl refreshing={this.state.isRefreshing} onRefresh={() => this.onRefresh()}
                          tintColor='gray'/>
        }>
          {this.renderHeaderType()}

          <If condition={switchType === WSB_ACCOUNT}>
            <If condition={this.state.freeze_show}>{this.renderFreezeMsg()}</If>
            {this.renderWSBHeader()}
            {this.renderWSBType()}
            {this.renderWSBContent()}
          </If>

          <If condition={switchType === THIRD_PARTY_ACCOUNT}>
            {this.renderTHIRDContainer()}
          </If>

          {this.renderAccountModal()}

        </ScrollView>
      </View>
    )
  }

  renderFreezeMsg = () => {
    const {freeze_msg} = this.state
    return (
      <TouchableOpacity
        onPress={() => {
          this.onPress(Config.ROUTE_ORDER_SEARCH_RESULT, {additional: true})
        }}
        style={Styles.containerHeader}>
        <Text style={Styles.containerHeaderText}>{freeze_msg} </Text>
        <Button onPress={() => {this.onPress(Config.ROUTE_FREEZE_LIST)}}
                title={'查看'}
                buttonStyle={Styles.containerHeaderBtn}
                titleStyle={Styles.containerHeaderBtnText}>
        </Button>
      </TouchableOpacity>
    )
  }

  renderHeaderType = () => {
    let {switchType} = this.state
    return (
      <View style={Styles.headerType}>
        <TouchableOpacity style={Styles.WSBTypeBtn} onPress={() => this.onChangeSwitchType(0)}>
          <View style={[switchType === WSB_ACCOUNT ? Styles.switchTypeLeft : Styles.switchTypeRight]}>
            <Text style={Styles.color333}> 外送帮钱包 </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={Styles.WSBTypeBtn} onPress={() => this.onChangeSwitchType(1)}>
          <View style={[switchType === THIRD_PARTY_ACCOUNT ? Styles.switchTypeLeft : Styles.switchTypeRight]}>
            <Text style={Styles.color333}>三方配送充值</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  renderWSBHeader = () => {
    return (
      <View style={Styles.WSBHeader}>
        <Text style={Styles.WSBHeaderTitle}>当前余额（元） </Text>
        <Text style={Styles.WSBHeaderBalanceNum}>{this.state.balanceNum} </Text>
        <TouchableOpacity style={Styles.WSBCZBtn} onPress={() => this.onPress(Config.ROUTE_ACCOUNT_FILL)}>
          <Text style={Styles.WSBCZText}> 充 值 </Text>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.WSBSZBtn} onPress={() => this.onPress(Config.ROUTE_SETTING)}>
          <Text style={Styles.WSBSZText}> 去设置余额不足电话通知 </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderWSBType = () => {
    let choseTab = this.state.choseTab
    return (
      <View style={Styles.WSBType}>
        <TouchableOpacity style={Styles.WSBTypeBtn} onPress={() => {
          this.setState({
            choseTab: 1
          })
          this.fetchExpenses();
        }}>
          <View style={[choseTab === 1 ? Styles.switchTypeLeft : Styles.switchTypeRight]}>
            <Text style={Styles.color333}> 费用账单 </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={Styles.WSBTypeBtn} onPress={() => {
          this.setState({
            choseTab: 2
          })
          this.fetchRechargeRecord();
        }}>
          <View style={[choseTab === 2 ? Styles.switchTypeLeft : Styles.switchTypeRight]}>
            <Text style={Styles.color333}>充值记录 </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  renderWSBContent = () => {
    const {date, records, records2, choseTab} = this.state;
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
      <View>

        <View style={Styles.expensesHeader}>
          <Text style={Styles.selectMonthLabel}> 请选择月份 </Text>
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
            <Text style={Styles.selectMonthText}> {this.state.start_day} </Text>
          </PopPicker>
          <Entypo name='chevron-thin-down' style={Styles.selectMonthIcon}/>
        </View>

        <If condition={choseTab === 1}>
          {records && records.map((item, id) => {
            return <TouchableOpacity key={id} style={Styles.recordsContent} onPress={() => this.onItemClicked(item)}>
              <View style={Styles.recordsBody}>
                <Text style={Styles.recordsItemTime}>{item.day} </Text>
                <View style={Styles.flex1}/>
                <Text style={Styles.recordsItemBalanced}> {item.day_balanced !== '' ? (`${item.day_balanced / 100}`) : ''}
                </Text>
                <Entypo name='chevron-thin-right' style={Styles.recordsItemIcon}/>
              </View>
              <View style={Styles.recordsItemDesc}>
                <Text style={Styles.recordsItemDescTextLeft}>使用前金额: {item.total_ideal_balanced} </Text>
                <Text style={Styles.recordsItemDescTextRight}>使用后金额: {item.total_balanced} </Text>
              </View>
            </TouchableOpacity>
          })}
        </If>

        <If condition={choseTab === 2}>
          {records2 && records2.map((item, idx) => {
            return <View key={idx} style={Styles.recordsContainer2}>
              <View style={Styles.flex3}>
                <Text style={Styles.fontBold}>{item.remark} </Text>
                <Text style={Styles.recordsCreated2}>{item.created} </Text>
              </View>
              <View style={[Styles.flex1, Styles.fontBold]}>
                <Text style={Styles.recordsFee2}> {item.type === "1" ? '+' : '-'}{item.fee / 100} </Text>
              </View>
            </View>
          })}
        </If>

      </View>
    )
  }

  renderTHIRDHeader = () => {
    const {prompt_msg} = this.state
    return (
      <View style={Styles.THIRDHeader}>
        <FontAwesome5 name={'exclamation-circle'} style={Styles.THORDHeaderIcon} size={18} />
        <Text style={Styles.THIRDHeaderText}>{prompt_msg}</Text>
      </View>
    )
  }

  renderTHIRDContentItem = () => {
    const {thirdAccountList} = this.state
    return (
      <View style={Styles.THIRDContainerList}>
        <For index='i' each='info' of={thirdAccountList}>
          <LinearGradient style={Styles.THIRDContainerItemLinear}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          colors={info.background_color}>
            <View style={Styles.THIRDContainerItemBody}>
              <View style={Styles.THIRDContainerItemBody}>
                <Image source={{uri: info.img}}
                       style={Styles.THIRDContainerItemIcon}/>
                <Text style={Styles.THIRDContainerItemName}>{info.name}</Text>
              </View>
              <Button buttonStyle={Styles.THIRDContainerBtn}
                      titleStyle={{color: info.btn_title_color, fontSize: pxToDp(25), fontWeight: "bold"}}
                      title={'立即充值'}
                      onPress={() => {this.toPay(info)}}/>
            </View>
            <View style={Styles.THIRDContainerItemBody}>
              <Text style={Styles.currentBanlance}>当前余额： ￥ {info.current_balance}</Text>
              <ImageBackground source={{uri: info.background_img}} style={Styles.THIRDContainerItemIconBg}/>
            </View>
          </LinearGradient>
        </For>
      </View>
    )
  }

  renderNOTHIRDList = () => {
    return (
      <View style={Styles.THIRDContainerNOList}>
        <Text style={Styles.NoTHIRDListText}>
          未授权商家自有账号
        </Text>
        <Button buttonStyle={Styles.NoTHIRDListBtn}
                titleStyle={{fontSize: pxToDp(25), fontWeight: "bold"}}
                title={'去授权'}
                onPress={() => {this.toAuthorization()}}/>
      </View>
    )
  }

  renderTHIRDContainer = () => {
    const {thirdAccountList} = this.state
    return (
      <View>
        {this.renderTHIRDHeader()}
        {thirdAccountList.length > 0 ? this.renderTHIRDContentItem() : this.renderNOTHIRDList()}
      </View>
    )
  }

  renderAccountModal = () => {
    let {dadaAccountModal, dadaAccountNum} = this.state;
    return (
      <JbbModal visible={dadaAccountModal} onClose={() => this.closeAccountModal()} modal_type={'center'}>
        <View style={{padding: pxToDp(20)}}>
          <TouchableOpacity onPress={() => this.closeAccountModal()} style={Styles.flexRowStyle}>
            <Text style={Styles.modalTitle}>充值金额</Text>
            <Entypo name="circle-with-cross" style={Styles.closeIcon}/>
          </TouchableOpacity>
          <InputItem clear error={dadaAccountNum <= 0} type="number" value={dadaAccountNum}
                     onChange={dadaAccountNum => {this.setState({dadaAccountNum});}}
                     extra="元"
                     placeholder="帐户充值金额">
          </InputItem>
          <View style={Styles.modalBtnStyle}>
            <Button buttonStyle={Styles.modalBtnText}
                    titleStyle={{fontSize: pxToDp(30), color: 'white'}}
                    title={'取消'}
                    onPress={() => {this.closeAccountModal()}}/>
            <Button buttonStyle={Styles.modalBtnText1}
                    titleStyle={{fontSize: pxToDp(30), color: 'white'}}
                    title={'确定'}
                    onPress={() => {
                      this.closeAccountModal()
                      this.fetchDeliveryPayUrl()
                    }}/>
          </View>
        </View>
      </JbbModal>
    )
  }

}

const Styles = StyleSheet.create({
  flexRowStyle: {flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', marginBottom: 20},
  modalTitle: {fontWeight: 'bold', fontSize: pxToDp(30), color: colors.color333},
  flex1: {flex: 1},
  flex3: {flex: 3},
  fontBold: {fontWeight: "bold"},
  color333: {color: colors.color333},
  containerContent: {flex: 1, backgroundColor: '#f5f5f9'},
  containerHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#EEDEE0',
    height: 40
  },
  containerHeaderText: {
    color: colors.color666,
    fontSize: 12,
    paddingLeft: 13,
    flex: 1
  },
  containerHeaderBtn: {
    backgroundColor: colors.red,
    borderRadius: 6,
    marginRight: 13,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  containerHeaderBtnText: {
    fontSize: 12,
    color: colors.white,
  },
  expensesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    backgroundColor: colors.white,
    borderBottomWidth: pxToDp(1),
    borderColor: '#ccc',
    paddingVertical: pxToDp(25),
    paddingHorizontal: pxToDp(30),
    zIndex: 999,
  },
  selectMonthLabel: {flex: 1, color: colors.color333, fontWeight: "bold"},
  selectMonthText: {
    color: colors.title_color,
    fontSize: 16,
    fontWeight: 'bold'
  },
  selectMonthIcon: {fontSize: 14, marginLeft: 10},
  recordsContent: {
    paddingVertical: pxToDp(25),
    paddingHorizontal: pxToDp(30),
    flex: 1,
    alignItems: "center",
    flexDirection: 'column',
    backgroundColor: 'white',
    borderBottomWidth: pxToDp(1),
    borderColor: '#ccc',
  },
  recordsBody: {alignItems: "center", flexDirection: 'row'},
  recordsItemTime: {fontSize: 16, color: colors.color333, fontWeight: 'bold'},
  recordsItemBalanced: {
    fontSize: 16,
    fontWeight: 'bold',
    width: "30%",
    textAlign: 'right',
  },
  recordsItemIcon: {fontSize: 14, marginLeft: 10},
  recordsItemDesc: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10},
  recordsItemDescTextLeft: {fontSize: 14, color: colors.color999, flex: 1},
  recordsItemDescTextRight: {fontSize: 14, color: colors.color999},
  recordsContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "100%",
    borderBottomWidth: pxToDp(1),
    borderColor: '#ccc',
    paddingTop: pxToDp(20),
    paddingBottom: pxToDp(20),
    paddingLeft: pxToDp(40),
    backgroundColor: colors.white
  },
  recordsCreated2: {color: '#999', marginTop: pxToDp(8)},
  recordsFee2: {
    textAlign: 'right',
    marginRight: pxToDp(40),
    fontWeight: 'bold',
  },
  WSBHeader: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#28A077',
    margin: pxToDp(20),
    paddingVertical: pxToDp(50),
    borderRadius: pxToDp(8)
  },
  WSBHeaderTitle: {
    width: '100%',
    marginLeft: pxToDp(100),
    textAlign: 'left',
    color: 'white'
  },
  WSBHeaderBalanceNum: {
    marginVertical: pxToDp(30),
    fontSize: pxToDp(120),
    fontWeight: "bold",
    textAlign: 'center',
    color: 'white'
  },
  WSBCZBtn: {
    backgroundColor: 'white',
    width: 140,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: "center",
  },
  WSBCZText: {
    color: colors.main_color,
    textAlign: 'center',
    paddingVertical: pxToDp(10),
  },
  WSBSZBtn: {
    justifyContent: 'center',
    alignItems: "center",
    marginTop: pxToDp(10),
  },
  WSBSZText: {
    color: '#f7f7f7',
    textAlign: 'center',
    paddingVertical: pxToDp(10),
    textDecorationLine: 'underline',
  },
  WSBType: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.white,
    height: 40,
    marginBottom: 5,
  },
  WSBTypeBtn: {width: '50%', alignItems: "center"},
  headerType: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.white,
    height: 40,
  },
  switchTypeLeft: {
    borderColor: colors.main_color,
    borderBottomWidth: 3,
    height: 40,
    justifyContent: 'center'
  },
  switchTypeRight: {
    borderColor: colors.main_color,
    borderBottomWidth: 0,
    height: 40,
    justifyContent: 'center'
  },
  THIRDHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: '#E7E7E7',
    width: '96%',
    marginLeft: '2%',
    borderRadius: pxToDp(10),
    marginTop: pxToDp(10),
    color: '#333333',
    padding: pxToDp(10),
    flexGrow: 1
  },
  THORDHeaderIcon: {
    color: '#F12626',
    marginLeft: pxToDp(5)
  },
  THIRDHeaderText: {
    color: colors.color333,
    fontSize: pxToDp(18)
  },
  THIRDContainerList: {
    display: "flex",
    flexDirection: "column"
  },
  THIRDContainerNOList: {
    display: "flex",
    flexDirection: "column",
    flex: 1
  },
  THIRDContainerItemBody: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: '1%',
    paddingRight: '5%'
  },
  THIRDContainerItemLinear: {
    width: "96%",
    height: 142,
    marginLeft: '2%',
    borderRadius: pxToDp(10),
    marginTop: pxToDp(10),
    padding: pxToDp(40)
  },
  THIRDContainerItemName: {
    fontSize: pxToDp(40),
    fontWeight: "bold",
    color: '#ffffff'
  },
  THIRDContainerItemIcon: {width: 53, height: 53, borderRadius: 26, marginRight: pxToDp(20)},
  THIRDContainerItemIconBg: {width: 97, height: 59},
  THIRDContainerBtn: {
    backgroundColor: '#ffffff',
    width: 88,
    height: 38,
    borderRadius: pxToDp(10),
    padding: pxToDp(10)
  },
  currentBanlance: {
    fontSize: pxToDp(30),
    color: '#ffffff',
    marginTop: pxToDp(30),
    marginLeft: pxToDp(10)
  },
  NoTHIRDListText: {
    fontSize: 30,
    fontWeight: "bold",
    color: '#999999',
    marginTop: '30%',
    marginLeft: '20%'
  },
  NoTHIRDListBtn: {
    width: "96%",
    height: pxToDp(70),
    marginTop: '20%',
    marginLeft: '2%',
    backgroundColor: '#59B26A',
    borderRadius: pxToDp(10)
  },
  closeIcon: {backgroundColor: "#fff", fontSize: pxToDp(45), color: colors.fontGray},
  modalBtnStyle: {
    flexDirection: 'row',
    marginTop: 30,
  },
  modalBtnText: {
    height: 40,
    width: "50%",
    marginHorizontal: '10%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'gray',
    lineHeight: 40,
    borderRadius: pxToDp(10)
  },
  modalBtnText1: {
    height: 40,
    width: "50%",
    marginHorizontal: '10%',
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.main_color,
    color: 'white',
    lineHeight: 40,
    borderRadius: pxToDp(10)
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(SeparatedExpense);
