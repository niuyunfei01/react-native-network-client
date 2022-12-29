import React, {PureComponent} from "react";
import {View, StyleSheet, TouchableOpacity, Text, Dimensions, Appearance} from "react-native";
import colors from "../../../../pubilc/styles/colors";
import {SvgXml} from "react-native-svg";
import {down, this_up} from "../../../../svg/svg";
import AntDesign from "react-native-vector-icons/AntDesign";
import tool from "../../../../pubilc/util/tool";
import dayjs from "dayjs";
import HttpUtils from "../../../../pubilc/util/http";
import AlertModal from "../../../../pubilc/component/AlertModal";
import DateTimePicker from "react-native-modal-datetime-picker";
import Dialog from "../../../common/component/Dialog";
import pxToDp from "../../../../pubilc/util/pxToDp";
import CustomDateComponent from "../../../../pubilc/component/CustomDateComponent";

const {height, width} = Dimensions.get('window')
const styles = StyleSheet.create({
  zoneWrap: {marginBottom: 10, borderRadius: 6, backgroundColor: colors.white, paddingHorizontal: 12},
  rowCenter: {flexDirection: 'row', alignItems: 'center'},

  rowCenterBetween: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  selectBtnWrap: {
    width: 0.2186 * width,
    height: 0.0443 * height,
    borderRadius: 18,
    backgroundColor: colors.main_color,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notSelectBtnWrap: {
    width: 0.2186 * width,
    height: 0.0443 * height,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectBtnText: {fontSize: 14, fontWeight: '500', color: colors.white, lineHeight: 20},
  notSelectBtnText: {fontSize: 14, fontWeight: '400', color: colors.color666, lineHeight: 20},
  detailDataWrap: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  detailDataHeaderTitle: {fontSize: 14, color: colors.color666},
  detailDataText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.color333,
    lineHeight: 25,
    paddingTop: 4,
    paddingBottom: 15
  },
  deliveryName: {
    fontSize: 16,
    color: colors.color333,
    fontWeight: 'bold',
    lineHeight: 22,
    paddingTop: 14,
  },
  deliveryLabel: {fontSize: 14, color: colors.color666, lineHeight: 20, paddingTop: 15},
  deliveryValue: {
    fontSize: 14,
    color: colors.color333,
    fontWeight: 'bold',
    lineHeight: 20,
    paddingTop: 7,
    paddingBottom: 17
  },
  deliveryHeaderTitle: {paddingVertical: 15, fontSize: 16, fontWeight: 'bold', color: colors.color333},
  deliveryHeaderExtraTitle: {fontSize: 14, color: colors.color999, lineHeight: 20, paddingLeft: 10},
  showExtraInfo: {fontSize: 14, color: colors.main_color, lineHeight: 20},
  notHasMoreInfo: {marginBottom: 10, textAlign: 'center', fontSize: 14, color: colors.color999},
  modalCancel: {
    width: '100%',
    height: 40,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,

  },
  modalCancelText1: {
    color: colors.theme,
    fontSize: 20
  },
  modalCancel1: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    marginTop: 10
  },
  modalCancelText: {
    color: 'black',
    fontSize: 20,
    fontWeight: "bold",
    textAlign: 'center'
  },
})

const DATE_CATEGORY = [
  {
    index: 0,
    name: '今日'
  },
  {
    index: 1,
    name: '昨日'
  },
  {
    index: 2,
    name: '本周'
  },
  {
    index: 3,
    name: '自定义'
  },
]

export default class DeliveryDataComponent extends PureComponent {

  constructor(props) {
    super(props);
    const time = new Date()
    this.state = {
      selectDate: 0,
      start_date: tool.fullDay(time),
      end_date: tool.fullDay(time),
      current_datetime: tool.fullDay(time),
      yesterday_datetime: tool.fullDay(time - 24 * 3600 * 1000),
      current_week_datetime: dayjs().day(1).add(8, 'h').toJSON().toString().substring(0, 10),
      delivery_Data: [],
      visible: false,
      title: '',
      desc: '',
      custom_date_visible: false,
    }
  }


  componentWillUnmount() {
    this.focus && this.focus()
  }

  getData = (start_date, end_date) => {
    if (!start_date || !end_date)
      return
    const {store_id, accessToken} = this.props
    const url = `/v1/new_api/analysis/delivery_stat?access_token=${accessToken}`
    const params = {store_id: store_id, start_date: start_date, end_date: end_date}
    HttpUtils.get(url, params).then((res = []) => {
      this.setState({delivery_Data: res, custom_date_visible: false})
    })
  }

  getInitData = () => {
    const {start_date, end_date} = this.state
    this.getData(start_date, end_date)
  }

  componentDidMount() {
    const {navigation} = this.props
    this.getInitData()
    this.focus = navigation.addListener('focus', () => {
      console.log('focus')
      this.getInitData()
    })
  }

  setTime = (start_date, end_date) => {
    this.setState({start_date: start_date, end_date: end_date})
  }
  setHeaderBtn = (index) => {
    const {selectDate, current_datetime, yesterday_datetime, current_week_datetime} = this.state
    if (selectDate === index)
      return
    switch (index) {
      case 0:
        this.setTime(current_datetime, current_datetime)
        this.getData(current_datetime, current_datetime)
        break
      case 1:
        this.setTime(yesterday_datetime, yesterday_datetime)
        this.getData(yesterday_datetime, yesterday_datetime)
        break
      case 2:
        this.setTime(current_week_datetime, current_datetime)
        this.getData(current_week_datetime, current_datetime)
        break
      case 3:
        this.setState({custom_date_visible: true})
        break
    }
    this.setState({selectDate: index})
  }

  renderBtn = () => {
    const {selectDate} = this.state
    return (
      <View style={[styles.rowCenterBetween, {marginBottom: 10}]}>
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

  renderShowExtraInfo = (key) => {
    const value = this.state[key]
    return (
      <TouchableOpacity style={styles.rowCenter} onPress={() => this.setState({[key]: !value})}>
        <Text style={styles.showExtraInfo}>
          {value ? '收起' : '展开'}
        </Text>
        <SvgXml xml={value ? this_up(colors.main_color) : down(16, 16, colors.main_color)}/>
      </TouchableOpacity>
    )

  }

  setModal = (visible, title, desc) => {
    this.setState({visible: visible, title: title, desc: desc})
  }

  renderData = (info, index) => {
    const {name, summary, detail, key} = info
    return (
      <View style={styles.zoneWrap} key={index}>
        <View style={styles.rowCenterBetween}>
          <View style={styles.rowCenter}>
            <Text style={styles.deliveryHeaderTitle}>
              {name}
            </Text>
            <Text style={styles.deliveryHeaderExtraTitle}>
              {tool.dateTimeShort(new Date())}
            </Text>
          </View>
          {this.renderShowExtraInfo(key)}
        </View>
        <View style={styles.detailDataWrap}>
          {
            summary && summary.map((item, key) => {
              return (
                <View key={key} style={{width: '50%'}}>
                  <View style={styles.rowCenter}>
                    <Text style={styles.detailDataHeaderTitle}>
                      {item.label}
                    </Text>
                    <AntDesign name={'questioncircle'}
                               color={colors.color999}
                               style={{paddingLeft: 4}}
                               onPress={() => this.setModal(true, item.label, item.tip)}/>
                  </View>
                  <Text style={styles.detailDataText}>
                    {item.value}
                  </Text>
                </View>
              )
            })
          }
        </View>
        <If condition={this.state[key]}>
          {
            detail && detail.map((item, index) => {
              return (
                <View key={index} style={{borderTopColor: colors.e5, borderTopWidth: 0.5}}>
                  <Text style={styles.deliveryName}>
                    {item.name}
                  </Text>
                  <View style={styles.rowCenterBetween}>
                    <View>
                      <Text style={styles.deliveryLabel}>
                        {item.ship_fee_name}
                      </Text>
                      <Text style={styles.detailDataText}>
                        {item.ship_fee}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.deliveryLabel}>
                        {item.order_num_name}
                      </Text>
                      <Text style={styles.deliveryValue}>
                        {item.order_num}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.deliveryLabel}>
                        {item.avg_ship_fee_name}
                      </Text>
                      <Text style={styles.deliveryValue}>
                        {item.avg_ship_fee}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.deliveryLabel}>
                        {item.tip_fee_name}
                      </Text>
                      <Text style={styles.deliveryValue}>
                        {item.tip_fee}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })
          }
        </If>

      </View>
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

  renderCustomerDate = () => {
    const {custom_date_visible} = this.state
    return (
      <CustomDateComponent visible={custom_date_visible}
                           getData={(startTime, endTime) => {
                             this.setTime(startTime, endTime)
                             this.getData(startTime, endTime)
                           }}
                           onClose={() => this.setState({custom_date_visible: false})}/>
    )
  }

  render() {
    const {delivery_Data} = this.state
    return (
      <View style={{marginHorizontal: 12}}>
        {this.renderBtn()}
        {
          delivery_Data.map((item, index) => {
            return this.renderData(item, index)
          })
        }
        {this.renderNotMoreInfo()}
        {this.renderTip()}
        {this.renderCustomerDate()}
      </View>
    )
  }
}
