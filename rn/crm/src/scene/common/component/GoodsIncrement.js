import React, {PureComponent} from "react";
import {View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import colors from "../../../pubilc/styles/colors";
import Config from "../../../pubilc/common/config";
import dayjs from "dayjs";
import {connect} from "react-redux";
import {LineView} from "../../home/GoodsIncrementService/GoodsIncrementServiceStyle";

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    marginBottom: 14
  },
  header: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingRight: 21,
    paddingLeft: 22,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerDescription: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingLeft: 29,
    paddingTop: 17,
    paddingBottom: 20,
    flexDirection: 'row'
  },
  notActiveIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 43,
    backgroundColor: '#D8D8D8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeBellIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 43,
    backgroundColor: '#1BB18A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeAutoReplyIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 43,
    backgroundColor: '#11A20A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeBoxIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 43,
    backgroundColor: '#0F6DA2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  notActiveIcon: {fontSize: 24, color: colors.color000, padding: 13},
  activeIcon: {fontSize: 24, color: colors.white, padding: 13},
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
    const {increment} = this.props.mine
    return (
      <View style={styles.contentWrap}>
        <View>
          <TouchableOpacity
            style={increment.incrementStatus ? styles.activeBellIconWrap : styles.notActiveIconWrap}
            onPress={() => this.touchIcon(Config.ROUTE_BAD_REVIEW_REMINDER)}>
            <FontAwesome5 name={'bell'} style={increment.incrementStatus ? styles.activeIcon : styles.notActiveIcon}/>
          </TouchableOpacity>
          <Text style={styles.iconText}>差评提醒</Text>
        </View>
        <View>
          <TouchableOpacity
            style={increment.incrementStatus ? styles.activeAutoReplyIconWrap : styles.notActiveIconWrap}
            onPress={() => this.touchIcon(Config.ROUTE_AUTOMATIC_FEEDBACK)}>
            <FontAwesome name={'refresh'} style={increment.incrementStatus ? styles.activeIcon : styles.notActiveIcon}/>
          </TouchableOpacity>
          <Text style={styles.iconText}>自动回评</Text>
        </View>
        <View>
          <TouchableOpacity
            style={increment.incrementStatus ? styles.activeBoxIconWrap : styles.notActiveIconWrap}
            onPress={() => this.touchIcon(Config.ROUTE_AUTOMATIC_PACKAGING)}>
            <FontAwesome5 name={'box'} style={increment.incrementStatus ? styles.activeIcon : styles.notActiveIcon}/>
          </TouchableOpacity>
          <Text style={styles.iconText}>自动打包</Text>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.page}>
        {this.renderHeader()}
        <LineView/>
        {this.renderContent()}
      </View>
    )
  }
}

function mapStateToProps(state) {
  const {mine} = state;
  return {mine: mine};
}

export default connect(mapStateToProps)(GoodsIncrement)
