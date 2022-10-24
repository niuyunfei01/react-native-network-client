import React, {PureComponent} from "react";
import {Alert, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";
import dayjs from "dayjs";
import {connect} from "react-redux";
import {autoPackage, autoReply, bell} from "../../../svg/svg";
import {SvgXml} from "react-native-svg";
import {MixpanelInstance} from "../../../pubilc/util/analytics";
import Entypo from "react-native-vector-icons/Entypo";


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
      <TouchableOpacity onPress={() => this.useIncrementService()}>
        <ImageBackground
          style={[{flex: 1, height: 50}, styles.notActivateHeader]}
          source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E5%A2%9E%E5%80%BC%E6%9C%8D%E5%8A%A1-bj%403x.png'}}
          imageStyle={{flex: 1, height: 53}}>
          <View style={styles.ValueAddBoxLeft}>
            <Text style={styles.ValueAddLabel}>增值服务 </Text>
            <Text style={styles.ValueAddDesc}>开通年包立省999元发单更便宜 </Text>
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
