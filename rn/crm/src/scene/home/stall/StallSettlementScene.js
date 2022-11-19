import React, {PureComponent} from "react";
import {Appearance, FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import colors from "../../../pubilc/styles/colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "react-native-modal-datetime-picker";
import tool from "../../../pubilc/util/tool";
import Config from "../../../pubilc/common/config";
import dayjs from "dayjs";
import {connect} from "react-redux";
import HttpUtils from "../../../pubilc/util/http";

const today = dayjs().format('YYYY-MM-DD');

class StallSettlementScene extends PureComponent {
  state = {
    showDatePicker: false,
    selectedDate: today,
    stallInfo: {
      stall_list: []
    }
  }

  constructor(props) {
    super(props)

  }

  componentDidMount() {
    this.navigationOptions()
    const {selectedDate} = this.state
    this.getAllStallList(selectedDate)
  }

  getAllStallList = (selectedDate) => {
    const {currStoreId, accessToken} = this.props.global;
    const api = `/api/get_all_stall_bill_list/${currStoreId}/${selectedDate}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({stallInfo: res})
    }).catch(error => {
    })
  }

  headerRight = () => {
    const {selectedDate} = this.state
    return (
      <TouchableOpacity style={styles.rowCenter} onPress={() => this.setShowDatePicker(true)}>
        <Text style={styles.itemStallName}>
          {selectedDate !== today ? selectedDate : '今天'}
        </Text>
        <FontAwesome name={'angle-down'} style={styles.itemStallName}/>
      </TouchableOpacity>
    )
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.headerRight()}
    navigation.setOptions(option);
  }

  renderHeader = (price, num) => {
    return (
      <View style={styles.headerWrap}>
        <View style={styles.heaterTitleWrap}>
          <Text style={styles.stallTotal}>
            摊位结算(总)
          </Text>
        </View>
        {this.renderItemRow(styles.headerLeftWrap, styles.width50, price, num)}
      </View>

    )
  }

  renderItemRow = (headerLeftWrap, width50, price, orderTotal) => {
    const priceStyle = tool.length(`${parseInt(price)}`) > 2 ? styles.headerPriceMore : styles.headerPrice
    return (
      <View style={styles.row}>
        <View style={headerLeftWrap}>
          <Text style={styles.headerPriceTitle}>
            应结金额
          </Text>
          <View style={styles.headerPriceWrap}>
            <Text style={styles.headerPriceFlag}>
              ￥
            </Text>
            <Text style={priceStyle}>
              {price}
            </Text>
          </View>
        </View>
        <View style={width50}>
          <Text style={styles.headerPriceTitle}>
            已完成订单
          </Text>
          <View style={styles.headerPriceWrap}>
            <Text style={priceStyle}>
              {orderTotal}
            </Text>
            <Text style={styles.headerOrderUnit}>
              单
            </Text>
          </View>
        </View>
      </View>
    )
  }

  renderItem = (item) => {
    const {stall_name, f_settle_amount, order_num} = item.item
    return (
      <View style={item.index % 2 === 0 ? styles.itemWrapComplex : styles.itemWrapSingle}>
        <View style={styles.heaterTitleWrap}>
          <TouchableOpacity style={styles.row}
                            onPress={() => this.viewStallDetailScene(item.item)}>
            <Text style={styles.itemStallName}>
              {stall_name}
            </Text>
            <FontAwesome name={'angle-right'} style={styles.viewDetail}/>
          </TouchableOpacity>
        </View>
        {this.renderItemRow(styles.listItemLeftWrap, styles.listItemRightWrap, f_settle_amount, order_num)}
      </View>
    )
  }

  viewStallDetailScene = (item) => {
    const {navigation} = this.props
    const {selectedDate} = this.state
    const {accessToken, currStoreId} = this.props.global;
    const {stall_id, stall_name, f_settle_amount, f_refund_fee, order_num} = item
    const params = {
      stall_id: stall_id,
      stall_name: stall_name,
      settle_amount: f_settle_amount,
      refund_fee: f_refund_fee,
      order_num: order_num,
      selectedDate: selectedDate,
      accessToken: accessToken,
      currStoreId: currStoreId
    }
    navigation.navigate(Config.ROUTE_HOME_SETTLEMENT_STALL_DETAIL, params);
  }

  renderList = (stall_list) => {
    return (
      <FlatList data={stall_list}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                numColumns={2}
                keyExtractor={(item, index) => `${index}`}
                renderItem={(item) => this.renderItem(item)}
                initialNumToRender={10}

      />
    )
  }

  onConfirm = (date) => {
    const selectedDate = tool.fullDay(date)
    this.setState({selectedDate: selectedDate, showDatePicker: false})
    this.navigationOptions()
    this.getAllStallList(selectedDate)
  }

  setShowDatePicker = (value) => {
    this.setState({showDatePicker: value})
  }

  emptyView = () => {
    return (
      <View/>
    )
  }

  render() {
    const {showDatePicker, selectedDate, stallInfo} = this.state
    const {f_total_settle_amount, total_order_num} = stallInfo
    return (
      <>
        {this.renderHeader(f_total_settle_amount, total_order_num)}
        <DateTimePicker cancelTextIOS={'取消'}
                        headerTextIOS={'选择日期'}
                        isDarkModeEnabled={Appearance.getColorScheme() === 'dark'}
                        confirmTextIOS={'确定'}
                        date={new Date(selectedDate)}
                        customHeaderIOS={this.emptyView}
                        mode={'date'}
                        isVisible={showDatePicker}
                        onConfirm={(Date) => this.onConfirm(Date)}
                        onCancel={() => this.setShowDatePicker(false)}/>
        <View style={styles.listWrap}>
          {this.renderList(stallInfo.stall_list)}
        </View>

      </>
    )
  }
}

const styles = StyleSheet.create({
  headerWrap: {backgroundColor: colors.white, height: 125},
  heaterTitleWrap: {flexDirection: 'row', justifyContent: 'space-between', padding: 12, paddingLeft: 16,},
  stallTotal: {fontSize: 18, fontWeight: '600', color: colors.color000, lineHeight: 25},
  stallFlagWrap: {backgroundColor: '#EE2626', height: 18, width: 40, justifyContent: 'center'},
  stallFlagText: {fontSize: 10, fontWeight: '400', color: colors.white, lineHeight: 14, textAlign: 'center'},
  row: {flexDirection: 'row', alignItems: 'center'},
  rowCenter: {flexDirection: 'row', alignItems: 'center', marginRight: 8},
  width50: {alignItems: 'center', width: '50%', paddingBottom: 7},
  headerLeftWrap: {alignItems: 'center', width: '50%', borderRightColor: colors.colorEEE, borderRightWidth: 1},
  alignItems_center: {alignItems: 'center'},
  headerPriceTitle: {fontSize: 11, fontWeight: '400', color: colors.color999, lineHeight: 17},
  headerPriceWrap: {flexDirection: 'row', marginTop: 4, alignItems: 'flex-end'},
  headerPriceFlag: {fontSize: 12, fontWeight: '400', color: colors.color333},
  headerPrice: {fontSize: 20, fontWeight: '400', color: colors.color333, textAlign: 'center'},
  headerPriceMore: {fontSize: 12, fontWeight: '400', color: colors.color333, textAlign: 'center'},
  headerOrderUnit: {fontSize: 12, fontWeight: '400', color: colors.color333},
  listWrap: {paddingTop: 8, paddingBottom: 12, marginTop: 8, maxHeight: '80%', marginBottom: 8},
  listItemLeftWrap: {paddingLeft: 16, width: '50%', paddingBottom: 12},
  listItemRightWrap: {
    width: '50%', paddingBottom: 12
  },
  itemWrapComplex: {
    backgroundColor: colors.white,
    width: '50%',
    borderTopWidth: 0.5,
    borderTopColor: colors.colorEEE,
    borderRightWidth: 0.5,
    borderRightColor: colors.colorEEE
  },
  itemWrapSingle: {
    backgroundColor: colors.white,
    width: '50%',
    borderTopWidth: 0.5,
    borderTopColor: colors.colorEEE,
  },
  viewDetail: {
    fontSize: 16,
    marginLeft: 2,
    textAlign: 'right',
    fontWeight: '400',
    color: colors.color999,
    lineHeight: 17
  },
  itemStallName: {fontSize: 16, fontWeight: '600', color: colors.color333, lineHeight: 20},
})

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

export default connect(mapStateToProps)(StallSettlementScene)
