import React, {PureComponent} from "react";
import {View, StyleSheet, TouchableOpacity, Text, Dimensions} from "react-native";
import colors from "../../../../pubilc/styles/colors"
import {SvgXml} from "react-native-svg";
import {right} from "../../../../svg/svg";
import tool from "../../../../pubilc/util/tool";
import CustomDateComponent from "../../../../pubilc/component/CustomDateComponent";
import Config from "../../../../pubilc/common/config";
import HttpUtils from "../../../../pubilc/util/http";
import AntDesign from "react-native-vector-icons/AntDesign";
import AlertModal from "../../../../pubilc/component/AlertModal";
import {hideModal, showModal} from "../../../../pubilc/util/ToastUtils";

const DATE_CATEGORY = [

  {
    index: 0,
    name: '昨日'
  },
  {
    index: 1,
    name: '近7天'
  },
  {
    index: 2,
    name: '自定义'
  },
]
const {height, width} = Dimensions.get('window')
const styles = StyleSheet.create({
  rowCenter: {flexDirection: 'row', alignItems: 'center'},
  selectBtnWrap: {
    width: 0.2186 * width,
    height: 0.0443 * height,
    borderRadius: 18,
    backgroundColor: colors.main_color,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  notSelectBtnWrap: {
    width: 0.2186 * width,
    height: 0.0443 * height,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  selectBtnText: {fontSize: 14, fontWeight: 'bold', color: colors.white, lineHeight: 20},
  notSelectBtnText: {fontSize: 14, fontWeight: '400', color: colors.color666, lineHeight: 20},
  zoneWrap: {paddingHorizontal: 12, backgroundColor: colors.white, borderRadius: 6, marginBottom: 10},
  detailWrap: {flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', width: width - 12 * 4},
  detailItemValue: {
    paddingBottom: 20,
    paddingTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.color333,
  },
  storeNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 22,
    width: width * 0.54,
    paddingVertical: 15
  },
  detailItemAllowModify: {fontSize: 12, color: colors.main_color, paddingLeft: 4, fontWeight: '400'},
  viewProfitDetail: {fontSize: 14, color: colors.main_color, lineHeight: 20},
  notHasMoreInfo: {marginBottom: 10, textAlign: 'center', fontSize: 14, color: colors.color999},
  itemWrap: {width: (width - 12 * 4) / 3,}
})

export default class ProfitAndLossComponent extends PureComponent {

  time = new Date()

  state = {
    selectDate: 0,
    current_datetime: tool.fullDay(this.time),
    yesterday_datetime: tool.fullDay(this.time - 24 * 3600 * 1000),
    week_datetime: tool.fullDay(this.time - 24 * 3600 * 1000 * 7),
    visible: false,
    title: '',
    desc: '',
    custom_date_visible: false,
    start_date: tool.fullDay(this.time - 24 * 3600 * 1000),
    end_date: tool.fullDay(this.time - 24 * 3600 * 1000),
    profit_loss: []
  }

  componentWillUnmount() {
    this.focus()
  }

  componentDidMount() {
    const {navigation} = this.props
    this.getData()
    this.focus = navigation.addListener('focus', () => {
      this.getData()
    })
  }

  getData = (start = '', end = '') => {
    const {start_date, end_date} = this.state
    if (!start || !end) {
      start = start_date
      end = end_date
    }
    const {store_id, accessToken} = this.props
    const url = `/v1/new_api/analysis/profit_stat?access_token=${accessToken}`
    const params = {store_id: store_id, start_date: start, end_date: end}
    showModal('加载数据中')
    HttpUtils.get(url, params).then((res = []) => {
      hideModal()
      this.setState({profit_loss: res, custom_date_visible: false})
    }).catch(() => hideModal())
  }
  setTime = (start_date, end_date) => {
    this.setState({start_date: start_date, end_date: end_date, custom_date_visible: false})
  }
  setHeaderBtn = (index) => {
    const {yesterday_datetime, week_datetime} = this.state
    switch (index) {
      case 0:
        this.setTime(yesterday_datetime, yesterday_datetime)
        this.getData(yesterday_datetime, yesterday_datetime)
        break
      case 1:
        this.setTime(week_datetime, yesterday_datetime)
        this.getData(week_datetime, yesterday_datetime)
        break
      case 2:
        this.setState({custom_date_visible: true})
        break
    }
    this.setState({selectDate: index})
  }

  renderBtn = () => {
    const {selectDate} = this.state
    return (
      <View style={[styles.rowCenter, {marginBottom: 10}]}>
        {
          DATE_CATEGORY.map((item, index) => {
            return (
              <TouchableOpacity style={selectDate === index ? styles.selectBtnWrap : styles.notSelectBtnWrap}
                                onPress={() => this.setHeaderBtn(index)}
                                key={index}>
                <Text style={selectDate === index ? styles.selectBtnText : styles.notSelectBtnText}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }
  setModal = (visible, title, desc) => {
    this.setState({visible: visible, title: title, desc: desc})
  }
  renderDetailInfo = (item) => {
    const {
      valid_order_num_name, valid_order_num, good_profit_name, good_profit, good_profit_rate_name, good_profit_rate,
      platform_income_modify = 0, avg_gmv_name, avg_gmv, supply_cost_name, supply_cost, platform_income_name,
      platform_income, ship_outcome_name, ship_outcome, loss_rate_name, loss_rate, platform_income_tip
    } = item
    return (
      <View style={styles.detailWrap}>
        <View style={styles.itemWrap}>
          <Text style={styles.notSelectBtnText}>
            {valid_order_num_name}
          </Text>
          <Text style={styles.detailItemValue}>
            {valid_order_num}
          </Text>
        </View>
        <View style={styles.itemWrap}>
          <Text style={styles.notSelectBtnText}>
            {good_profit_name}
          </Text>
          <Text style={styles.detailItemValue}>
            {good_profit}
          </Text>
        </View>
        <View style={styles.itemWrap}>
          <Text style={styles.notSelectBtnText}>
            {good_profit_rate_name}
          </Text>
          <Text style={styles.detailItemValue}>
            {good_profit_rate}
          </Text>
        </View>
        <View style={styles.itemWrap}>
          <Text style={styles.notSelectBtnText}>
            {avg_gmv_name}
          </Text>
          <Text style={styles.detailItemValue}>
            {avg_gmv}
          </Text>
        </View>
        <View style={styles.itemWrap}>
          <Text style={styles.notSelectBtnText}>
            {supply_cost_name}
          </Text>
          <Text style={styles.detailItemValue}>
            {supply_cost}
          </Text>
        </View>
        <View style={styles.itemWrap}>
          <Text style={styles.notSelectBtnText}>
            {platform_income_name} <If condition={platform_income_modify == 1}>
            <AntDesign name={'questioncircle'}
                       color={colors.color999}
                       style={{paddingLeft: 4}}
                       onPress={() => this.setModal(true, platform_income_name, platform_income_tip)}/>
          </If>
          </Text>
          <Text style={styles.detailItemValue}>
            {platform_income} <If condition={platform_income_modify == 1}>
            <Text style={styles.detailItemAllowModify} onPress={this.navigateToPlatformDetail}>
              修改
            </Text>
          </If>
          </Text>
        </View>
        <View style={styles.itemWrap}>
          <Text style={styles.notSelectBtnText}>
            {ship_outcome_name}
          </Text>
          <Text style={styles.detailItemValue}>
            {ship_outcome}
          </Text>
        </View>
        <View style={styles.itemWrap}>
          <Text style={styles.notSelectBtnText}>
            {loss_rate_name}
          </Text>
          <Text style={styles.detailItemValue}>
            {loss_rate}
          </Text>
        </View>
      </View>
    )
  }

  orderDetail = () => {
    const {start_date, end_date} = this.state
    const {navigation} = this.props
    navigation.navigate(Config.ROUTE_PROFITANDLOSS, {start_date: start_date, end_date: end_date})
  }

  navigateToPlatformDetail = () => {
    const {start_date} = this.state
    const {navigation, store_name} = this.props
    navigation.navigate(Config.ROUTE_SETTLEMENT_PLATFORM, {start_date: start_date, store_name: store_name})
  }

  renderInfo = () => {
    const {profit_loss} = this.state
    return (
      <View style={styles.zoneWrap}>
        {
          profit_loss && profit_loss.map((item, index) => {
            const {name} = item
            return (
              <View key={index}>
                <View style={[styles.rowCenter, {justifyContent: 'space-between'}]}>
                  <Text style={[styles.storeNameText]} numberOfLines={1} ellipsizeMode={'tail'}>
                    {name}
                  </Text>
                  <View style={styles.rowCenter}>
                    <Text style={styles.viewProfitDetail} onPress={() => this.orderDetail()}>
                      订单毛利明细
                    </Text>
                    <SvgXml xml={right(20, 20, colors.main_color)}/>
                  </View>
                </View>
                {
                  this.renderDetailInfo(item)
                }
                <If condition={index !== profit_loss.length - 1}>
                  <View style={{borderBottomColor: colors.e5, borderBottomWidth: 0.5}}/>
                </If>
              </View>
            )
          })
        }
      </View>
    )
  }

  closeCustomDateComponent = () => {
    this.setState({custom_date_visible: false})
  }
  getCustomData = async (startTime, endTime) => {
    await this.setTime(startTime, endTime)
    this.getData()
  }
  renderCustomerDate = () => {
    const {custom_date_visible} = this.state
    return (
      <CustomDateComponent visible={custom_date_visible}
                           getData={(startTime, endTime) => this.getCustomData(startTime, endTime)}
                           onClose={this.closeCustomDateComponent}/>
    )
  }

  renderNotMoreInfo = () => {
    return (
      <Text style={styles.notHasMoreInfo}>
        没有更多了~
      </Text>
    )
  }
  renderTip = () => {
    const {visible, title, desc} = this.state
    return (
      <AlertModal visible={visible}
                  title={title}
                  desc={desc}
                  actionText={'知道了'}
                  onPress={() => this.setModal(false, '', '')}/>
    )
  }

  render() {
    return (
      <View style={{marginHorizontal: 12}}>
        {this.renderBtn()}
        {this.renderInfo()}
        {this.renderCustomerDate()}
        {this.renderNotMoreInfo()}
        {this.renderTip()}
      </View>
    )
  }
}
