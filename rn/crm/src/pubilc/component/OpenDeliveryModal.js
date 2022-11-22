import React, {PureComponent} from "react";
import {InteractionManager, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import CommonModal from "./goods/CommonModal";
import {connect} from "react-redux";
import Config from "../common/config";
import {SvgXml} from "react-native-svg";
import {closeNew, rightCheck} from "../../svg/svg";
import colors from "../styles/colors";
import {showError, showSuccess, ToastLong, ToastShort} from "../util/ToastUtils";
import HttpUtils from "../util/http";
import {JumpMiniProgram} from "../util/WechatUtils";
import tool from "../util/tool";

const styles = StyleSheet.create({
  openDeliveryModalWrap: {backgroundColor: colors.white, borderTopLeftRadius: 10, borderTopRightRadius: 10},
  openDeliveryModalHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  openDeliveryModalHeaderText: {fontSize: 16, fontWeight: '500', color: colors.color333, padding: 20},

  openBtnWrap: {backgroundColor: '#26B942', borderRadius: 24, margin: 20, marginTop: 10},
  openBtnText: {fontSize: 16, fontWeight: '500', color: colors.white, paddingVertical: 10, textAlign: 'center'},

  wsbDeliveryWrap: {borderRadius: 6, borderColor: '#26B942', borderWidth: 1, marginHorizontal: 20, marginBottom: 10},
  storeDeliveryWrap: {borderRadius: 6, backgroundColor: '#F5F5F5', marginHorizontal: 20, marginBottom: 10},
  wsbDeliverHeader: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.color333,
    paddingTop: 15,
    paddingLeft: 12,
    paddingBottom: 8
  },
  wsbDeliverContentDescription: {fontSize: 13, color: colors.color666, paddingHorizontal: 12, paddingBottom: 10},
  wsbDeliverContentText: {fontSize: 13, color: colors.color666, paddingHorizontal: 12, paddingBottom: 15},

  storeDeliveryLeft: {color: '#FF862C'},

  rightCheck: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#26B942',
    borderLeftWidth: 1,
    borderLeftColor: 'transparent'
  },

  mobileStyle: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingLeft: 12,
    paddingVertical: 13
  },
  verificationCodeWrap: {
    borderRadius: 6,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  verificationCodeInput: {paddingLeft: 12, paddingVertical: 13, flex: 1},
  verificationCodeText: {fontSize: 16, color: colors.colorBBB, paddingRight: 12, paddingVertical: 13},
  verificationCodeActiveText: {fontSize: 16, color: '#26B942', paddingRight: 12, paddingVertical: 13},

})

let bottomButton = '立即开通'

class OpenDeliveryModal extends PureComponent {

  constructor(props) {
    super(props);
    const {open_type} = props.delivery
    this.state = {
      mobile: '',//手机号
      verificationCode: '',//验证码
      count_down: '',//倒计时
      selectGeneralDelivery: true,
      selectAccountType: open_type === 3 || open_type === 1 ? 1 : open_type === 2 ? 2 : 0,//1-选择外送帮 2-选择自有
      headerText: '开通运力'
    }
  }

  renderRightCheck = () => {
    return (
      <View style={styles.rightCheck}>
        <SvgXml xml={rightCheck()}/>
      </View>
    )
  }

  renderWSBDelivery = () => {
    const {selectAccountType = 0} = this.state
    const {delivery} = this.props
    const {open_type, cs_phone} = delivery
    if (1 === open_type || 3 === open_type)// open_type: 0,//开通类型，0-不需要开通 1-外送帮 2-自有 3-外送帮，自有
      return (
        <TouchableOpacity style={selectAccountType === 1 ? styles.wsbDeliveryWrap : styles.storeDeliveryWrap}
                          onPress={() => this.setState({selectAccountType: 1})}
                          key={0}>
          <Text style={styles.wsbDeliverHeader}>
            外送帮省钱配送
          </Text>
          <Text style={styles.wsbDeliverContentDescription}>
            开通后在外送帮充值即可发8大主流运力，优惠区间2-8元视当地城市动态调整，免收发单费用。
          </Text>
          <Text style={styles.wsbDeliverContentText}>
            有任何配送问题请联系{cs_phone}
          </Text>
          <If condition={selectAccountType === 1}>
            {this.renderRightCheck()}
          </If>
        </TouchableOpacity>
      )
  }
  renderStoreDelivery = () => {
    const {selectAccountType = 0} = this.state
    const {delivery} = this.props
    const {open_type, name} = delivery
    if (2 === open_type || 3 === open_type)
      return (
        <TouchableOpacity style={selectAccountType === 2 ? styles.wsbDeliveryWrap : styles.storeDeliveryWrap}
                          onPress={() => this.setState({selectAccountType: 2})}
                          key={1}>
          <Text style={styles.wsbDeliverHeader}>
            自有账号绑定
          </Text>
          <Text style={styles.wsbDeliverContentDescription}>
            使用商户自主注册账号授权进行发单，订单及优惠券，账户余额与账号同步，免费使用！
          </Text>
          <Text style={styles.wsbDeliverContentText}>
            <Text style={styles.storeDeliveryLeft}>注：</Text>当您账户余额不足时请去{name}充值
          </Text>
          <If condition={selectAccountType === 2}>
            {this.renderRightCheck()}
          </If>
        </TouchableOpacity>
      )
  }

  getGxdPhoneCode = () => {
    let {accessToken} = this.props.global
    let {phone, count_down} = this.state
    const {store_id} = this.props
    if (count_down <= 0) {
      HttpUtils.post(`/v1/new_api/Delivery/get_gxd_code?access_token=${accessToken}`, {
        store_id: store_id,
        phone: phone
      }).then(res => {
        ToastShort(res.desc, 1)
      }).catch((reason) => {
        ToastShort(reason.desc, 1)
      })
    }
  }
  getUUPTPhoneCode = () => {
    let {accessToken, vendor_id} = this.props.global
    let {mobile, count_down} = this.state;
    if (count_down <= 0) {
      const params = {access_token: accessToken, vendorId: vendor_id}
      HttpUtils.get(`/uupt/message_authentication/${mobile}`, params).then(res => {
        ToastShort(res.desc, 1)
      }).catch((reason) => {
        ToastShort(reason.desc, 1)
      })
    }
  }
  getVerificationCode = () => {
    const {mobile, deliveryType, count_down} = this.state
    if (!mobile) {
      ToastShort('请输入手机号', 1)
      return
    }
    if (count_down > 0) {
      ToastShort('请稍后重试', 1)
      return
    }
    showSuccess('验证码发送成功！', 1)
    if (deliveryType === Config.UU_PAO_TUI)
      this.getUUPTPhoneCode()
    if (deliveryType === Config.GUO_XIAO_DI)
      this.getGxdPhoneCode()
    this.startCountDown(60)
  }
  setCountdown = (count_down) => {
    this.setState({
      count_down: count_down
    });
  }
  startCountDown = (code = 60) => {
    this.interval = setInterval(() => {
      code = code - 1
      this.setCountdown(code)

      if (code === 0) {
        this.interval && clearInterval(this.interval)
        this.setState({
          count_down: 0
        })
      }
    }, 1000)
  }
  isValid = (str) => {
    return '' === str || /^\d*$/.test(str);
  }

  setMobile = (mobile) => {
    if (this.isValid(mobile)) {
      this.setState({mobile: mobile})
      return
    }
    showError('请输入正确的手机号')

  }
  renderUUOrGuoXiaoDi = () => {
    const {verificationCode, mobile, count_down} = this.state
    return (
      <>
        <TextInput style={styles.mobileStyle}
                   placeholderTextColor={'#999999'}
                   maxLength={11}
                   keyboardType={'numeric'}
                   value={mobile}
                   onChangeText={mobile => this.setMobile(mobile)}
                   placeholder={'请输入手机号'}/>
        <View style={styles.verificationCodeWrap}>
          <TextInput style={styles.verificationCodeInput}
                     keyboardType={'numeric'}
                     value={verificationCode}
                     onChangeText={verificationCode => this.setState({verificationCode: verificationCode})}
                     placeholderTextColor={'#999999'}
                     placeholder={'请输入验证码'}/>
          <Text style={count_down > 0 ? styles.verificationCodeText : styles.verificationCodeActiveText}
                onPress={this.getVerificationCode}>
            {count_down > 0 ? `${count_down}s后获取` : '获取验证码'}
          </Text>
        </View>
      </>
    )
  }

  openWSBDelivery = () => {
    const {fetchData, global, store_id, delivery} = this.props
    const {v2_type} = delivery
    const {accessToken} = global
    let data = {store_id: store_id, platform: v2_type}

    const url = `/v1/new_api/delivery/create_delivery_shop?access_token=${accessToken}`
    HttpUtils.post(url, data).then(async () => {
      await this.closeModal()

      if (Config.FENG_NIAO_ZHONG_BAO == delivery.type)
        ToastShort('申请成功，审核中')
      else ToastShort('开通成功')

      fetchData && fetchData()
    }, async (ret) => {
      await this.closeModal()
      ToastLong(ret.desc);

    })
  }
  // 联系客服
  JumpToServices = async () => {
    let {currentUser, currentUserProfile, vendor_id} = this.props.global;
    let {currStoreId} = this.state;
    let data = {
      v: vendor_id,
      s: currStoreId,
      u: currentUser,
      m: currentUserProfile.mobilephone,
      place: 'cancelOrder'
    }
    await JumpMiniProgram("/pages/service/index", data);
  }
  navigateRoute = (route, params = {}, callback = {}) => {
    const {navigation} = this.props
    InteractionManager.runAfterInteractions(() => {
      navigation.navigate(route, params, callback);
    });
  }
  handleGrandAuth = (res) => {
    const {alert, route, auth_url, alert_msg} = res
    const {delivery, store_id} = this.props
    switch (alert) {
      case 0:
      case 3:
        if (auth_url)
          this.navigateRoute(route, {url: auth_url})
        break
      case 2:
        this.navigateRoute('BindShunfeng', {shunFengInfo: res, delivery: delivery, store_id: store_id})
        break

      default:
        ToastShort(alert_msg)
        break
    }
  }
  requestUrl = async (type) => {
    const {global, store_id} = this.props
    await this.closeModal()
    const {accessToken} = global
    const api = `/v1/new_api/Delivery/get_delivery_auth_url?access_token=${accessToken}`
    HttpUtils.post(api, {store_id: store_id, delivery_type: type}).then((res) => {

      this.handleGrandAuth(res)
    }).catch(() => {

    })

  }
  getGxdAuthorizedToLog = () => {
    const {global, fetchData, store_id} = this.props
    let {accessToken, vendor_id} = global
    let {mobile, verificationCode} = this.state

    if (!tool.length(mobile) > 0 || !tool.length(verificationCode) > 0) {
      this.setState({selectGeneralDelivery: false})
      ToastShort('请输入手机号或者验证码', 1)
      return;
    }
    const api = `/v1/new_api/Delivery/get_bind_user?access_token=${accessToken}&vendorId=${vendor_id}`
    const params = {store_id: store_id, phone: mobile, code: verificationCode}
    HttpUtils.post(api, params).then(async (res) => {
      await this.closeModal()
      fetchData && fetchData()
      ToastShort(res.desc, 1)

    }).catch(async (reason) => {
      await this.closeModal()
      ToastShort(reason.desc, 1)
    })
  }

  getUUPTAuthorizedToLog = () => {

    const {global, fetchData, store_id} = this.props
    let {accessToken, vendor_id} = global
    let {mobile, verificationCode} = this.state
    if (!tool.length(mobile) > 0 || !tool.length(verificationCode) > 0) {
      this.setState({selectGeneralDelivery: false})
      ToastShort('请输入手机号或者验证码', 1)
      return;
    }
    const api = `/uupt/openid_auth/?access_token=${accessToken}&vendorId=${vendor_id}`
    const params = {
      user_mobile: mobile,
      validate_code: verificationCode,
      store_id: store_id
    }
    HttpUtils.post(api, params).then(async (res) => {
      await this.closeModal()
      fetchData && fetchData()

      ToastShort(res.desc, 1)
    }).catch(async (reason) => {
      await this.closeModal()
      ToastShort(reason.desc, 1)
    })
  }
  handlerOpenDelivery = async () => {
    const {selectAccountType, selectGeneralDelivery} = this.state
    const {delivery} = this.props
    switch (parseInt(delivery.type)) {
      case Config.MEI_TUAN_PEI_SONG:
      case Config.MEI_TUAN_KUAI_SU_DA://美团快速达
      case Config.MEI_TUAN_FEI_SU_DA://美团飞速达
        await this.JumpToServices()
        break
      case Config.SHUN_FENG_TONG_CHENG://顺丰同城
        if (selectAccountType === 1)
          await this.JumpToServices()
        if (selectAccountType === 2)
          await this.requestUrl(delivery.type)
        break
      case Config.SHUAN_SONG://闪送
      case Config.FENG_NIAO_ZHONG_BAO://蜂鸟众包
      case Config.DA_DA_JING_JI://达达经济
      case Config.DA_DA_YOU_ZHI://达达优质
      case Config.DA_DA_JI_SONG://达达急送
        if (selectAccountType === 1)
          this.openWSBDelivery()
        if (selectAccountType === 2)
          await this.requestUrl(delivery.type)
        break
      case Config.UU_PAO_TUI:
        if (selectGeneralDelivery)
          this.setState({selectGeneralDelivery: false, headerText: `绑定${delivery.name} `})
        else {
          this.setState({selectGeneralDelivery: true})
          if (selectAccountType === 1)
            this.openWSBDelivery()
          if (selectAccountType === 2)
            this.getUUPTAuthorizedToLog()
        }
        break
      case Config.GUO_XIAO_DI:
        if (selectGeneralDelivery)
          this.setState({selectGeneralDelivery: false, headerText: `绑定${delivery.name} `})
        else {

          this.setState({selectGeneralDelivery: true})
          if (selectAccountType === 1)
            this.openWSBDelivery()
          if (selectAccountType === 2)
            this.getGxdAuthorizedToLog()

        }
        break
    }
  }

  closeModal = async () => {
    const {onRequestClose} = this.props
    onRequestClose && await onRequestClose()
    await this.setState({
      mobile: '',
      verificationCode: '',
      selectGeneralDelivery: true,
      headerText: '开通运力'
    })
  }

  render() {
    const {visible, deliveryType} = this.props
    const {selectAccountType, selectGeneralDelivery, headerText} = this.state
    switch (parseInt(deliveryType)) {
      case Config.MEI_TUAN_PEI_SONG:
        bottomButton = '联系客服'
        break
      case Config.MEI_TUAN_KUAI_SU_DA://美团快速达
      case Config.MEI_TUAN_FEI_SU_DA://美团飞速达
      case Config.SHUN_FENG_TONG_CHENG://顺丰同城
        bottomButton = selectAccountType === 2 ? '立即绑定' : '联系客服'
        break
      case Config.SHUAN_SONG://闪送
      case Config.FENG_NIAO_ZHONG_BAO://蜂鸟众包
      case Config.DA_DA_JING_JI://达达经济
      case Config.DA_DA_YOU_ZHI://达达优质
      case Config.DA_DA_JI_SONG://达达急送
        bottomButton = selectAccountType === 2 ? '立即授权' : '立即开通'
        break
      case Config.UU_PAO_TUI://UU跑腿
      case Config.GUO_XIAO_DI://裹小弟
        bottomButton = selectAccountType === 2 ? '立即绑定' : '立即开通'
        break
    }
    return (
      <CommonModal visible={visible} position={'flex-end'} onRequestClose={this.closeModal}>
        <View style={styles.openDeliveryModalWrap}>
          <View style={styles.openDeliveryModalHeader}>
            <Text style={styles.openDeliveryModalHeaderText}>
              {headerText}
            </Text>
            <SvgXml xml={closeNew()} style={{marginRight: 12}} onPress={this.closeModal}/>
          </View>
          <If condition={selectGeneralDelivery}>
            {this.renderWSBDelivery()}
            {this.renderStoreDelivery()}
          </If>
          <If condition={!selectGeneralDelivery}>
            {this.renderUUOrGuoXiaoDi()}
          </If>
          <TouchableOpacity style={styles.openBtnWrap} onPress={this.handlerOpenDelivery}>
            <Text style={styles.openBtnText}>
              {bottomButton}
            </Text>
          </TouchableOpacity>
        </View>
      </CommonModal>
    )
  }
}

const mapStateToProps = ({global}) => ({global: global})

export default connect(mapStateToProps)(OpenDeliveryModal)
