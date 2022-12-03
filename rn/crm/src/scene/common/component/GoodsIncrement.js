import React, {PureComponent} from "react";
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";
import dayjs from "dayjs";
import {connect} from "react-redux";
import {autoPackage, autoReply, bell} from "../../../svg/svg";
import {SvgXml} from "react-native-svg";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import Entypo from "react-native-vector-icons/Entypo";
import * as globalActions from "../../../reducers/global/globalActions";
import {bindActionCreators} from "redux";
import AlertModal from "../../../pubilc/component/AlertModal";
import {getRemindTime, setRemindTime} from "../../../pubilc/common/noLoginInfo";


const styles = StyleSheet.create({
  zoneWrap: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  notActivateHeader: {
    borderRadius: 6,
    paddingRight: 21,
    paddingLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  activateHeader: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingRight: 21,
    paddingLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  row: {flexDirection: 'row', alignItems: 'center',},
  contentWrap: {
    paddingTop: 4,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center'
  },
  ValueAddBoxLeft: {flexDirection: "row", alignItems: "center"},
  ValueAddLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#985800',
    marginRight: 5
  },
  ValueAddDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: '#C5852C'
  },
  ValueAddBtn: {
    fontWeight: '400',
    fontSize: 12,
    color: '#AD6500'
  },
  ValueAddIcon: {
    fontSize: 12,
    color: '#AD6500'
  },
})

const member = [
  {
    id: 0,
    icon: <SvgXml xml={bell()}/>,
    routeName: Config.ROUTE_BAD_REVIEW_REMINDER
  },
  {
    id: 1,
    icon: <SvgXml xml={autoReply()}/>,
    routeName: Config.ROUTE_AUTOMATIC_FEEDBACK
  },
  {
    id: 2,
    icon: <SvgXml xml={autoPackage()}/>,
    routeName: Config.ROUTE_AUTOMATIC_PACKAGING
  },
]

class GoodsIncrement extends PureComponent {

  constructor(props) {
    super(props);
    this.mixpanel = MixpanelInstance;

  }

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    const {global, navigation} = this.props
    const {store_info, store_id} = global

    this.focus = navigation.addListener('focus', async () => {
      const current_date = dayjs().format('YYYY-MM-DD')
      const remind_time = JSON.parse(await getRemindTime()) || []
      const has_date = remind_time && remind_time.findIndex(item => item?.store_id === store_id && item?.current_date === current_date)
      if (has_date > -1)
        return
      const calc = (new Date(store_info.vip_info.expire_date) - new Date(current_date)) / (24 * 60 * 60 * 1000)
      if (calc < 5 && calc >= 0)
        this.setState({showRemind: {visible: true, desc: `服务将在${store_info.vip_info.expire_date}过期，是否续费？`}})

    })
  }

  useIncrementService = () => {
    this.closeModal()
    const {navigation} = this.props
    this.mixpanel.track('我的_立即开通')
    navigation.navigate(Config.ROUTE_OPEN_MEMBER)
  }

  state = {
    showRemind: {
      visible: false,
      desc: '',
    }
  }

  handleRemindTime = async () => {
    try {
      const remind_time = JSON.parse(await getRemindTime()) || []
      const current_date = dayjs().format('YYYY-MM-DD')
      const {store_id} = this.props.global

      if (remind_time.length === 0) {
        remind_time.push({store_id: store_id, current_date: current_date})
        setRemindTime(remind_time)
        return
      }

      const has = remind_time.findIndex(item => item?.store_id === store_id && item?.current_date === current_date)

      if (has === -1) {
        remind_time.push({store_id: store_id, current_date: current_date})
        setRemindTime(remind_time)
      }
    } catch (e) {

    }
  }

  closeModal = () => {
    this.setState({showRemind: {visible: false, desc: ''}})
    this.handleRemindTime().then()
  }

  renderRemind = () => {
    const {showRemind} = this.state
    return (
      <AlertModal
        visible={showRemind.visible}
        title={'提醒'}
        desc={showRemind.desc}
        actionText={'确定'}
        closeText={'取消'}
        onPress={this.useIncrementService}
        onClose={this.closeModal}
        onPressClose={this.closeModal}/>
    )
  }
  notActivate = (vip_info) => {
    const {pay_type_items = []} = vip_info || {}
    const pay_money = pay_type_items.filter(item => item.months === 12)
    let annualFee = {}
    if (pay_money.length > 0)
      annualFee = pay_money[0];
    return (
      <TouchableOpacity onPress={() => this.useIncrementService()}>
        <ImageBackground
          style={[{flex: 1, height: 50}, styles.notActivateHeader]}
          source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E5%A2%9E%E5%80%BC%E6%9C%8D%E5%8A%A1-bj%403x.png'}}
          imageStyle={{flex: 1, height: 53}}>
          <View style={styles.ValueAddBoxLeft}>
            <Text style={styles.ValueAddLabel}>增值服务 </Text>
            <If condition={annualFee}>
              <Text style={styles.ValueAddDesc}>
                开通年包立省{annualFee.pay_money - annualFee.pay_money_actual}元发单更便宜
              </Text>
            </If>
          </View>
          <If condition={!vip_info.exist_vip}>
            <View style={styles.ValueAddBoxLeft}>
              <Text style={styles.ValueAddBtn}>立即查看 </Text>
              <Entypo name="chevron-thin-right" style={styles.ValueAddIcon}/>
            </View>
          </If>
        </ImageBackground>
      </TouchableOpacity>
    )
  }


  activate = (vip_info) => {
    return (
      <ImageBackground
        style={[{flex: 1, height: 50}, styles.activateHeader]}
        source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E5%A2%9E%E5%80%BC%E6%9C%8D%E5%8A%A1-bj%403x.png'}}
        imageStyle={{flex: 1, height: 53}}>
        <View style={styles.ValueAddBoxLeft}>
          <Text style={styles.ValueAddLabel}>增值服务 </Text>
          <If condition={vip_info.expire_date}>
            <TouchableOpacity style={[styles.row]} onPress={this.useIncrementService}>
              <Text style={styles.ValueAddDesc}>
                {!vip_info.vip_invalid ? `${vip_info.expire_date}到期` : vip_info.exist_vip ? '会员已到期' : '未开通'}
              </Text>
            </TouchableOpacity>
          </If>
        </View>
        <If condition={!vip_info.expire_date}>
          <View style={[styles.row]}>
            <Text style={styles.ValueAddDesc}>
              免费使用
            </Text>
          </View>
        </If>
        <If condition={vip_info.expire_date}>
          <TouchableOpacity style={styles.ValueAddBoxLeft} onPress={this.useIncrementService}>
            <Text style={styles.ValueAddBtn}>去续费 </Text>
            <Entypo name="chevron-thin-right" style={styles.ValueAddIcon}/>
          </TouchableOpacity>
        </If>
      </ImageBackground>
    )
  }

  renderHeader = () => {
    const {store_info} = this.props.global
    if (store_info.vip_info.exist_vip)
      return this.activate(store_info.vip_info)
    return this.notActivate(store_info.vip_info)
  }

  touchIcon = (routeName) => {
    const {store_info} = this.props.global
    if (store_info.vip_info.exist_vip) {
      this.props.navigation.navigate(routeName)
      return
    }
    this.useIncrementService()
  }

  renderContent = () => {
    return (
      <View style={styles.contentWrap}>
        {
          member.map((item, index) => {
            return (
              <TouchableOpacity key={index} onPress={() => this.touchIcon(item.routeName)}>
                {item.icon}
              </TouchableOpacity>
            )
          })}
      </View>
    )
  }

  render() {
    const {store_info} = this.props.global
    return (
      <View style={styles.zoneWrap}>
        {this.renderHeader()}
        {!store_info.vip_info.vip_invalid && store_info.vip_info.exist_vip ? this.renderContent() : null}
        {this.renderRemind()}
      </View>
    )
  }
}

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        ...globalActions
      },
      dispatch
    )
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsIncrement)
