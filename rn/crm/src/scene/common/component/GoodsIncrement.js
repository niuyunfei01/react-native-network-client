import React, {PureComponent} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";
import dayjs from "dayjs";
import {connect} from "react-redux";
import {LineView, Styles} from "../../home/GoodsIncrementService/GoodsIncrementServiceStyle";
import {autoPackage, autoReply, bell} from "../../../svg/svg";
import {SvgXml} from "react-native-svg";

const styles = StyleSheet.create({

  header: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingRight: 21,
    paddingLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerDescription: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 20
  },
  notServiceText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.colorCCC,
    lineHeight: 17,
    paddingLeft: 8
  },
  serviceText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.main_color,
    lineHeight: 17,
    paddingLeft: 8
  },
  row: {flexDirection: 'row'},
  contentWrap: {
    paddingLeft: 12,
    paddingTop: 17,
    paddingBottom: 20,
    flexDirection: 'row'
  },

  iconZoneWrap: {
    width: 65,
    height: 82,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 8,
    marginRight: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {fontSize: 12, fontWeight: '400', color: colors.color000, lineHeight: 17, marginTop: 12},
  expireDate: {fontSize: 12, color: colors.color999, paddingTop: 4}
})


class GoodsIncrement extends PureComponent {

  componentDidMount() {
    const {increment} = this.props.mine
    if (increment.in_white_list === 1)
      return
    const currentDate = dayjs().format('YYYY-MM-DD')
    const expire_date = dayjs(increment.expire_date).format('YYYY-MM-DD')
    const calc = (new Date(expire_date) - new Date(currentDate)) / (24 * 60 * 60 * 1000)
    if (calc < 5 && calc >= 0)
      Alert.alert('提醒', `服务将在${increment.expire_date}过期，是否续费？`, [
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
    navigation.navigate(Config.ROUTE_INCREMENT_SERVICE_DESCRIPTION)
  }

  renderHeader = () => {
    const {increment} = this.props.mine
    return (
      <View style={styles.header}>
        <View>
          <Text style={styles.headerDescription}>
            商品增值月费
          </Text>
          <If condition={increment.in_white_list === 0}>
            <Text style={styles.expireDate}>
              服务到期时间：{increment.expire_date}
            </Text>
          </If>
        </View>
        <If condition={increment.in_white_list === 0}>
          <TouchableOpacity style={styles.row} onPress={this.useIncrementService}>
            <Text style={increment.incrementStatus ? styles.serviceText : styles.notServiceText}>
              {increment.incrementStatus ? '续费' : '未开通'}
            </Text>
            <AntDesign name={'right'} style={styles.notServiceText}/>
          </TouchableOpacity>
        </If>
      </View>
    )
  }

  touchIcon = (routeName) => {
    const {increment} = this.props.mine
    if (increment.incrementStatus) {
      this.props.navigation.navigate(routeName)
      return
    }
    this.useIncrementService()
  }

  renderContent = () => {
    return (
      <View style={styles.contentWrap}>
        <View style={styles.iconZoneWrap}>
          <TouchableOpacity style={styles.iconWrap} onPress={() => this.touchIcon(Config.ROUTE_BAD_REVIEW_REMINDER)}>
            <SvgXml xml={bell()} width={28} height={28}/>
            <Text style={styles.iconText}>差评提醒</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.iconZoneWrap}>
          <TouchableOpacity style={styles.iconWrap} onPress={() => this.touchIcon(Config.ROUTE_AUTOMATIC_FEEDBACK)}>
            <SvgXml xml={autoReply()} width={28} height={28}/>
            <Text style={styles.iconText}>自动回评</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.iconZoneWrap}>
          <TouchableOpacity style={styles.iconWrap} onPress={() => this.touchIcon(Config.ROUTE_AUTOMATIC_PACKAGING)}>
            <SvgXml xml={autoPackage()} width={28} height={28}/>
            <Text style={styles.iconText}>自动打包</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render() {
    const {increment} = this.props.mine
    return (
      <View style={Styles.zoneWrap}>
        {this.renderHeader()}
        <If condition={increment.incrementStatus}>
          <LineView/>
          {this.renderContent()}
        </If>
      </View>
    )
  }
}

function mapStateToProps(state) {
  const {mine} = state;
  return {mine: mine};
}

export default connect(mapStateToProps)(GoodsIncrement)
