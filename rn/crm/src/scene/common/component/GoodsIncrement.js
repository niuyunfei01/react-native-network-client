import React, {PureComponent} from "react";
import {Alert, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";
import dayjs from "dayjs";
import {connect} from "react-redux";
import {
  activateIcon, activateMemberIcon,
  activateNowIcon,
  autoPackage,
  autoReply,
  bell,
  notActivateMemberIcon
} from "../../../svg/svg";
import {SvgXml} from "react-native-svg";
import LinearGradient from 'react-native-linear-gradient'
import {MixpanelInstance} from "../../../pubilc/util/analytics";

const styles = StyleSheet.create({
  zoneWrap: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: colors.white
  },
  notActivateHeader: {
    borderRadius: 8,
    paddingTop: 12,
    paddingBottom: 10,
    paddingRight: 21,
    paddingLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  activateHeader: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingTop: 12,
    paddingBottom: 10,
    paddingRight: 21,
    paddingLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerDescription: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 20
  },
  notServiceText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingRight: 16,
    color: '#5C3813',
    lineHeight: 17,
    paddingLeft: 8
  },
  serviceText: {
    fontSize: 12,
    color: colors.main_color,
    lineHeight: 17,
    paddingLeft: 8
  },
  activateNow: {
    backgroundColor: '#F2CA64',
    borderRadius: 15,
    width: 106,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {flexDirection: 'row', alignItems: 'center',},
  contentWrap: {
    paddingTop: 4,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center'
  },

  iconZoneWrap: {
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  expireDate: {fontSize: 12, color: colors.white, marginRight: 9}
})

const iconColor = ['#064C50', '#35A54B']

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
  componentDidMount() {
    const {store_info} = this.props.global

    const currentDate = dayjs().format('YYYY-MM-DD')
    const calc = (new Date(store_info.vip_info.expire_date) - new Date(currentDate)) / (24 * 60 * 60 * 1000)
    if (calc < 5 && calc >= 0)
      Alert.alert('提醒', `服务将在${store_info.vip_info.expire_date}过期，是否续费？`, [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          style: 'default',
          onPress: () => this.useIncrementService()
        }
      ]);
  }

  useIncrementService = () => {
    const {navigation} = this.props
    this.mixpanel.track('我的_立即开通')
    navigation.navigate(Config.ROUTE_OPEN_MEMBER)
  }

  notActivate = (vip_info) => {
    return (
      <LinearGradient style={styles.notActivateHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={iconColor}>
        <View style={styles.row}>
          <SvgXml xml={notActivateMemberIcon()} style={{paddingTop: 8}}/>
          <Text style={styles.headerDescription}>
            限时抢购年费包立减优惠
          </Text>
        </View>
        <If condition={!vip_info.exist_vip}>
          <TouchableOpacity style={[styles.activateNow, styles.row]} onPress={this.useIncrementService}>
            <Text style={styles.notServiceText}>
              {'立即开通'}
            </Text>
            <SvgXml xml={activateNowIcon()}/>
          </TouchableOpacity>
        </If>
      </LinearGradient>
    )
  }


  activate = (vip_info) => {
    return (
      <LinearGradient style={styles.activateHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={iconColor}>
        <View style={styles.row}>
          <View>
            <SvgXml xml={activateMemberIcon()}/>
          </View>
          <Text style={styles.headerDescription}>
            会员版
          </Text>
        </View>
        <If condition={vip_info.expire_date}>
          <TouchableOpacity style={[styles.row]} onPress={this.useIncrementService}>
            <Text style={styles.expireDate}>
              {vip_info.expire_date}到期
            </Text>
            <SvgXml xml={activateIcon()}/>
          </TouchableOpacity>
        </If>
        <If condition={!vip_info.expire_date}>
          <View style={[styles.row]} onPress={this.useIncrementService}>
            <Text style={styles.expireDate}>
              免费使用
            </Text>

          </View>
        </If>
      </LinearGradient>
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
        {store_info.vip_info.exist_vip ? this.renderContent() : null}
      </View>
    )
  }
}

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

export default connect(mapStateToProps)(GoodsIncrement)
