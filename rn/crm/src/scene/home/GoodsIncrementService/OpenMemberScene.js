import React, {PureComponent} from "react";
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {LineView, Styles} from "./GoodsIncrementServiceStyle";
import HttpUtils from "../../../pubilc/util/http";
import {showError, showSuccess} from "../../../pubilc/util/ToastUtils";
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import {SvgXml} from "react-native-svg";
import {
  autoPackMember,
  autoReplyMember,
  badReminderMember,
  contactCustomerService,
  notActivateMemberIcon,
  radioSelected,
  radioUnSelected
} from "../../../svg/svg";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import AntDesign from "react-native-vector-icons/AntDesign";
import Config from "../../../pubilc/common/config";
import {getConfig} from "../../../reducers/global/globalActions";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import AlertModal from "../../../pubilc/component/AlertModal";

const styles = StyleSheet.create({
  saveZoneWrap: {
    paddingLeft: 17,
    paddingRight: 10,
    justifyContent: "space-between",
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    marginTop: 20
  },
  saveWrap: {
    margin: 10,
    borderRadius: 2,
    backgroundColor: '#F4D59B',
  },

  saveText: {
    paddingVertical: 28,
    paddingHorizontal: 7,
    fontSize: 16,
    fontWeight: '400',
    color: '#5C3813',
    lineHeight: 22,
    paddingTop: 7,
    paddingBottom: 7,
    textAlign: 'center'
  },
  headerIcon: {
    paddingRight: 15
  },
  memberDescription: {
    backgroundColor: '#40455A', paddingTop: 26, borderBottomLeftRadius: 8, borderBottomRightRadius: 8
  },
  memberText: {fontSize: 15, fontWeight: 'bold', color: colors.white, lineHeight: 21},
  memberStatus: {fontSize: 12, color: colors.white, lineHeight: 17},
  memberDescriptionText: {
    fontSize: 12,
    color: colors.colorCCC,
    lineHeight: 19,
  },
  memberItemWrap: {

    marginLeft: 32,
    marginTop: 18,
    marginBottom: 21,
  },
  rowCenterBetween: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 34, marginRight: 15
  },
  rowCenter: {flexDirection: 'row', alignItems: 'center'},
  setMealWrap: {flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 23, flexWrap: 'wrap'},
  setMealItemWrap: {
    marginBottom: 8,
    paddingTop: 18,
    alignItems: 'center',
    borderRadius: 8,
    borderColor: colors.colorEEE,
    borderWidth: 1,
    width: 98,
    height: 129,
    marginLeft: 12
  },
  selectMealItemWrap: {
    marginBottom: 8,
    paddingTop: 18,
    alignItems: 'center',
    borderRadius: 8,
    borderColor: '#f64e30',
    backgroundColor: '#FFF6F0',
    borderWidth: 1,
    width: 98,
    height: 129,
    marginLeft: 12
  },
  memberMonthText: {fontSize: 14, color: '#5C3813', lineHeight: 20},
  memberMonthPresentPrice: {fontSize: 14, color: '#f64e30', fontWeight: 'bold'},
  memberMonthPresentPriceLarge: {fontSize: 25},
  memberMonthOriginalPrice: {fontSize: 12, color: colors.color999, lineHeight: 17, textDecorationLine: 'line-through'},
  memberMonthRecommendWrap: {
    backgroundColor: '#F64E30',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  memberMonthRecommendText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 8
  },
  memberExclusiveWrap: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  viewDetailText: {fontSize: 14, color: colors.colorCCC, lineHeight: 20, marginRight: 4},
  memberExclusiveItem: {marginTop: 19, marginLeft: 17, marginBottom: 38, flexDirection: 'row', alignItems: 'center'},
  memberExclusiveItemText: {fontSize: 12, color: '#5c3813', lineHeight: 17, marginTop: 8},
  agreeMemberWrap: {marginTop: 13, marginLeft: 17, flexDirection: 'row', alignItems: 'center'},
  agreeMemberText: {fontSize: 10, color: colors.color333, lineHeight: 14, marginLeft: 4},
  agreeMemberGreenText: {color: colors.main_color, textDecorationLine: 'underline'},

})


class OpenMemberScene extends PureComponent {

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;
    this.mixpanel.track('会员开通页面')
    this.state = {
      selectedOpenMember: {pay_money_actual: '0', months: 0},
      agreementMember: false,
      showRemind: {visible: false, desc: '', is_open_member: true, touch_text: ''}
    }
  }

  openMiniProgram = async () => {
    const {store_id, currentUser, currentUserProfile, vendor_id} = this.props.global
    let data = {
      v: vendor_id,
      s: store_id,
      u: currentUser,
      m: currentUserProfile.mobilephone,
      place: 'mine'
    }
    await JumpMiniProgram("/pages/service/index", data);
  }

  headerRight = () => {
    return (
      <TouchableOpacity style={styles.headerIcon} onPress={this.openMiniProgram}>
        <SvgXml xml={contactCustomerService(24, 24, colors.white)}/>
      </TouchableOpacity>
    )
  }

  setHeader = () => {
    const {navigation} = this.props
    navigation.setOptions({
      headerRight: this.headerRight,
      headerStyle: {backgroundColor: '#40455A'},
      headerTintColor: colors.white,
      headerTitleStyle: {
        fontWeight: 'bold',
        color: colors.white,
        fontSize: 15
      }
    })

  }

  componentDidMount() {
    this.setHeader()
    const {store_info} = this.props.global
    const {vip_info = {}} = store_info
    Array.isArray(vip_info.pay_type_items) && vip_info.pay_type_items.map(item => {
      if (12 === item.months) {
        this.setState({selectedOpenMember: item})
      }
    })
  }

  useIncrementService = () => {
    const {agreementMember, selectedOpenMember} = this.state
    if (!agreementMember) {
      showError('请先同意会员服务协议')
      return
    }
    const {store_info} = this.props.global
    const {vip_info} = store_info
    if (vip_info.exist_vip) {
      this.mixpanel.track('会员_立即续费')
    } else this.mixpanel.track('会员_立即开通')
    this.setState({
      showRemind: {
        visible: true,
        desc: `会员费${selectedOpenMember.pay_money_actual}元将在外送帮余额中扣除，是否继续开通？`,
        is_open_member: true,
        touch_text: '继续'
      }
    })

  }
  openMember = () => {
    const {store_id, accessToken, store_info, vendor_info} = this.props.global
    const {selectedOpenMember} = this.state
    const {vip_info} = store_info
    const params = {
      store_id: store_id,
      pay_money: selectedOpenMember.pay_money_actual,
      pay_type: selectedOpenMember.months,
      product_package_id: vip_info.id,
    }
    this.mixpanel.track('会员_继续开通')
    const api = `/v1/new_api/product_package/vip_open/${store_id}?access_token=${accessToken}`
    HttpUtils.post(api, params, false, false, false).then(() => {
      showSuccess(vip_info.exist_vip ? '续费成功' : '开通成功')
      this.props.dispatch(getConfig(accessToken, store_id));
    }, error => {
      if ('0' === vendor_info.wsb_store_account) {
        showError('品牌余额不足，请先充值')
      }

      if (-1 === error.obj.error_code) {
        this.setState({
          showRemind: {
            visible: true,
            desc: `余额不足，确定充值吗？`,
            is_open_member: false,
            touch_text: '去充值'
          }
        })
        return
      }
      showError(error.reason)
    }).catch(() => {
    })

  }
  closeModal = () => {
    const {showRemind} = this.state
    this.setState({showRemind: {visible: false, desc: '', is_open_member: true, touch_text: ''}})
    if (showRemind.is_open_member) {
      this.mixpanel.track('会员_取消开通')
      return
    }
    this.mixpanel.track('会员_取消充值')
  }
  touch = () => {
    const {showRemind} = this.state
    this.setState({showRemind: {visible: false, desc: '', is_open_member: true, touch_text: ''}})
    if (showRemind.is_open_member) {
      this.openMember()
      return
    }
    this.mixpanel.track('会员_去充值')
    this.props.navigation.navigate(Config.ROUTE_ACCOUNT_FILL)
  }
  renderRemind = () => {
    const {showRemind} = this.state
    return (
      <AlertModal
        visible={showRemind.visible}
        title={'提示'}
        desc={showRemind.desc}
        actionText={showRemind.touch_text}
        closeText={'取消'}
        onPress={this.touch}
        onClose={this.closeModal}
        onPressClose={this.closeModal}/>
    )
  }
  renderDescription = () => {
    const {store_info} = this.props.global
    const {vip_info = {}} = store_info
    return (
      <View style={styles.memberDescription}>
        <View style={styles.rowCenterBetween}>
          <View style={styles.rowCenter}>
            <Text style={styles.memberText}>
              外送帮会员版
            </Text>
            <SvgXml xml={notActivateMemberIcon(19, 17)}/>
          </View>
          <Text style={styles.memberStatus}>
            {vip_info.exist_vip ? `${vip_info.expire_date}到期` : vip_info.vip_invalid ? '会员已到期' : '未开通'}
          </Text>
        </View>
        <View style={styles.memberItemWrap}>
          {
            Array.isArray(vip_info.rules_format) && vip_info.rules_format.map((item, index) => {
              return (
                <Text style={styles.memberDescriptionText} key={index}>
                  {item}
                </Text>
              )
            })
          }
        </View>


      </View>
    )
  }

  selectMonth = (item) => {
    switch (item.months) {
      case 1:
        this.mixpanel.track('会员_开通月费')
        break
      case 3:
        this.mixpanel.track('会员_开通季费')
        break
      case 12:
        this.mixpanel.track('会员_开通年费')
        break
    }

    this.setState({selectedOpenMember: item})
  }
  renderMember = () => {
    const {selectedOpenMember} = this.state

    const {store_info} = this.props.global
    const {vip_info = {}} = store_info
    return (
      <View style={Styles.zoneWrap}>
        <Text style={Styles.memberTitleText}>
          VIP会员套餐
        </Text>
        <LineView/>
        <View style={styles.setMealWrap}>
          {
            Array.isArray(vip_info.pay_type_items) && vip_info.pay_type_items.map((item, index) => {
              return (
                <TouchableOpacity key={index}
                                  onPress={() => this.selectMonth(item)}
                                  style={item === selectedOpenMember ? styles.selectMealItemWrap : styles.setMealItemWrap}>
                  <Text style={styles.memberMonthText}>
                    {item.months}个月
                  </Text>
                  <Text style={styles.memberMonthPresentPrice}>
                    ￥<Text style={styles.memberMonthPresentPriceLarge}>{item.pay_money_actual} </Text>
                  </Text>
                  <Text style={styles.memberMonthOriginalPrice}>
                    ￥{item.pay_money}
                  </Text>
                  <If condition={12 === item.months}>
                    <View style={styles.memberMonthRecommendWrap}>
                      <Text style={styles.memberMonthRecommendText}>
                        立省{parseInt(item.pay_money - item.pay_money_actual)}元
                      </Text>
                    </View>
                  </If>
                </TouchableOpacity>
              )
            })
          }
        </View>
      </View>
    )
  }

  getIcon = (value) => {
    switch (value) {
      case 'bad_notify':
        return <SvgXml xml={badReminderMember()}/>
      case 'auto_pack':
        return <SvgXml xml={autoPackMember()}/>
      case 'auto_reply':
        return <SvgXml xml={autoReplyMember()}/>

    }
  }
  renderMemberDescription = () => {
    const {store_info} = this.props.global
    const {vip_info = {}} = store_info
    return (
      <View style={Styles.zoneWrap}>
        <View style={styles.memberExclusiveWrap}>
          <Text style={Styles.memberTitleText}>
            VIP会员专享
          </Text>
          <TouchableOpacity style={[{marginRight: 16}, styles.rowCenter]}
                            onPress={() => this.props.navigation.navigate(Config.ROUTE_INCREMENT_SERVICE_DESCRIPTION)}>
            <Text style={styles.viewDetailText}>
              查看详情
            </Text>
            <AntDesign name={'right'} size={18} color={colors.colorCCC}/>
          </TouchableOpacity>
        </View>
        <LineView/>
        <View style={styles.memberExclusiveItem}>
          {
            Array.isArray(vip_info.value_added_services_format) && vip_info.value_added_services_format.map((item, index) => {
              return (
                <View key={index} style={index > 0 ? {marginLeft: 43} : {}}>
                  {this.getIcon(item.value)}
                  <Text style={styles.memberExclusiveItemText}>{item.label} </Text>
                </View>
              )
            })
          }
        </View>
      </View>
    )

  }

  gotoMemberAgreement = () => {
    this.props.navigation.navigate(Config.ROUTE_Member_Agreement)
  }

  setAgreementMember = () => {
    const {agreementMember} = this.state
    this.setState({
      agreementMember: !agreementMember
    })
  }

  renderAgreement = () => {
    const {agreementMember} = this.state
    return (
      <View style={styles.agreeMemberWrap}>
        <TouchableOpacity onPress={this.setAgreementMember}>
          <If condition={agreementMember}>
            <SvgXml xml={radioSelected()}/>
          </If>
          <If condition={!agreementMember}>
            <SvgXml xml={radioUnSelected()}/>
          </If>
        </TouchableOpacity>
        <Text style={styles.agreeMemberText} onPress={this.gotoMemberAgreement}>
          同意并接受<Text style={styles.agreeMemberGreenText}> 会员服务协议</Text>
        </Text>
      </View>
    )
  }

  render() {
    const {store_info} = this.props.global
    const {vip_info} = store_info
    const {selectedOpenMember = {}} = this.state
    return (
      <>

        <ScrollView>
          {this.renderDescription()}
          {this.renderMember()}
          {this.renderMemberDescription()}
          {this.renderAgreement()}
        </ScrollView>
        <View style={styles.saveZoneWrap}>
          <Text style={{fontSize: 26, color: '#5c3813', lineHeight: 37}}>
            ￥{selectedOpenMember.pay_money_actual}
          </Text>
          <TouchableOpacity style={styles.saveWrap} onPress={() => this.useIncrementService()}>
            <Text style={styles.saveText}>
              {vip_info.exist_vip ? '立即续费' : '立即开通'}
            </Text>
          </TouchableOpacity>
        </View>
        {this.renderRemind()}
      </>
    )
  }
}

function mapStateToProps(state) {
  const {global, mine} = state;
  return {global: global, mine: mine};
}

export default connect(mapStateToProps)(OpenMemberScene)
