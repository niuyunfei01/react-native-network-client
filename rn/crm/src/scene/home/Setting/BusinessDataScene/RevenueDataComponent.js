import React, {PureComponent} from "react";
import {View, StyleSheet, TouchableOpacity, Text, Dimensions} from "react-native";
import colors from "../../../../pubilc/styles/colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import {LineChart} from "react-native-chart-kit";
import HttpUtils from "../../../../pubilc/util/http";
import tool from "../../../../pubilc/util/tool";
import AlertModal from "../../../../pubilc/component/AlertModal";
import LineChartTipModal from "../../../../pubilc/component/LineChartTipModal";
import {hideModal, showModal} from "../../../../pubilc/util/ToastUtils";

const {width} = Dimensions.get('window')

const today_styles = StyleSheet.create({
  zoneWrap: {marginHorizontal: 12, marginBottom: 10, borderRadius: 6, backgroundColor: colors.white},
  rowCenter: {flexDirection: 'row', alignItems: 'center'},
  headerTitle: {paddingLeft: 12, paddingVertical: 15, fontSize: 16, fontWeight: 'bold', color: colors.color333},
  headerExtraTitle: {fontSize: 14, color: colors.color999, lineHeight: 20, paddingLeft: 10},
  detailDataWrap: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  detailDataHeaderTitle: {fontSize: 14, color: colors.color666, paddingLeft: 12},
  detailDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 25,
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 2
  },
  yesterdayData: {fontSize: 14, color: colors.color333, lineHeight: 20, paddingLeft: 12, paddingBottom: 15}
})

const history_styles = StyleSheet.create({
  headerWrap: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 22,
    paddingLeft: 12,
    paddingTop: 19,
    paddingBottom: 24
  },
  selectHistoryBtn: {
    backgroundColor: colors.main_color,
    borderRadius: 15,
    width: 60,
    height: 30,
    alignItems: 'center',
    justifyContent: "center",
    marginLeft: 8
  },
  selectHistoryBtnText: {color: colors.white, fontSize: 14, lineHeight: 20},
  historyBtn: {
    backgroundColor: colors.f5,
    borderRadius: 15,
    width: 60,
    height: 30,
    alignItems: 'center',
    justifyContent: "center",
    marginLeft: 8
  },
  historyBtnText: {color: colors.color666, fontSize: 14, lineHeight: 20},
  detailWrap: {
    width: (width - 4 * 12 - 10) / 2,
    marginLeft: 12,
    marginBottom: 10,
    backgroundColor: colors.f5,
    borderRadius: 4
  },
  selectDetailWrap: {
    width: (width - 4 * 12 - 10) / 2,
    marginLeft: 12,
    marginBottom: 10,
    backgroundColor: '#EDFFEF',
    borderRadius: 4,
    borderColor: colors.main_color,
    borderWidth: 0.5
  },
  detailHeaderTitle: {paddingTop: 15, paddingLeft: 12, fontSize: 14, color: colors.color666, lineHeight: 20},
  detailDataText: {
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 25
  }
})

let name = ''
export default class RevenueDataComponent extends PureComponent {

  constructor(props) {
    super(props);
    const time = new Date().getTime()

    this.state = {
      selectHistory: 1,
      selectHistoryItem: 'gmv',
      today_data: [],
      yesterday_data: [],
      yesterday_all: [],
      summary: [],
      history: [],
      history_data: {
        label: [],
        touch_label: [],
        value: []
      },
      start_date: time,
      end_date: time,
      current_datetime: time,
      yesterday_datetime: time - 24 * 3600 * 1000,
      week_datetime: time - 24 * 3600 * 1000 * 7,
      month_datetime: time - 24 * 3600 * 1000 * 30,
      visible: false,
      title: '',
      desc: '',
      show_tips_visible: false
    }
  }

  getInitData = () => {
    const {end_date, start_date, selectHistory, selectHistoryItem, yesterday_datetime} = this.state
    this.getData(start_date, end_date, selectHistory, selectHistoryItem)
    this.getData(yesterday_datetime, yesterday_datetime, selectHistory, selectHistoryItem)
  }

  componentDidMount() {
    this.getInitData()

    const {navigation} = this.props
    this.focus = navigation.addListener('focus', () => {

      this.getInitData()
    })

  }

  componentWillUnmount() {
    this.focus()
  }

  getData = (start_date, end_date, selectHistory = 1, key = 'gmv') => {
    const {store_id, accessToken} = this.props
    const {current_datetime, yesterday_datetime} = this.state
    const url = `/v1/new_api/analysis/revenue_stat?access_token=${accessToken}`

    const params = {store_id: store_id, start_date: tool.fullDay(start_date), end_date: tool.fullDay(end_date)}
    showModal('加载数据中')
    HttpUtils.get(url, params).then(({summary = [], history = []}) => {
      hideModal()
      if (start_date === current_datetime) {
        const today = []
        summary && summary.map((item) => {
          if (item.key !== 'valid_user_num' && item.key !== 'user_paid') {
            today.push(item)
          }
        })
        this.setState({today_data: today})
        return
      }
      if (start_date === yesterday_datetime) {
        const yesterday = []
        summary && summary.map((item) => {
          if (item.key !== 'shipping_order_num' && item.key !== 'arrived_order_num') {
            yesterday.push(item)
          }
        })
        this.setState({yesterday_data: yesterday, yesterday_all: summary})
        return;
      }
      const history_data = {label: [], value: [], touch_label: []}
      history && history.map((item, index) => {
        if (index !== history.length - 1) {
          if (selectHistory === 30 && index % 5 === 0 || selectHistory === 7) {
            history_data.label.push(item.date.substring(5))
            history_data.value.push(item[key])
          } else {
            history_data.label.push('')
            history_data.value.push(item[key])
          }
          history_data.touch_label.push(item.date.substring(5))
        }
      })
      const summary_part = []
      summary && summary.map((item) => {
        if (item.key !== 'shipping_order_num' && item.key !== 'arrived_order_num') {
          summary_part.push(item)
        }
      })
      this.setState({
        summary: summary_part,
        history: history,
        history_data: history_data,
        selectHistoryItem: key
      })
    }).catch(() => hideModal())

  }


  setModal = (visible, title, desc) => {
    this.setState({
      visible: visible,
      title: title,
      desc: desc
    })
  }

  renderTodayRevenueData = () => {
    const {today_data, yesterday_all, current_datetime} = this.state
    return (
      <View style={today_styles.zoneWrap} key={0}>
        <View style={today_styles.rowCenter}>
          <Text style={today_styles.headerTitle}>
            今日营收数据概览
          </Text>
          <Text style={today_styles.headerExtraTitle}>
            {tool.dateTimeShort(current_datetime)}
          </Text>
        </View>
        <View style={today_styles.detailDataWrap}>
          {
            today_data && today_data.map((item, index) => {
              const {value = ''} = yesterday_all && yesterday_all.filter(children => children.key === item.key)[0] || {}

              return (
                <View key={index} style={{width: '50%'}}>
                  <View style={today_styles.rowCenter}>
                    <Text style={today_styles.detailDataHeaderTitle}>
                      {item.label}
                    </Text>
                    <AntDesign name={'questioncircle'}
                               color={colors.color999}
                               style={{paddingLeft: 4}}
                               onPress={() => this.setModal(true, item.title, item.tip)}/>
                  </View>
                  <Text style={today_styles.detailDataText}>
                    {item.value}
                  </Text>
                  <Text style={today_styles.yesterdayData}>
                    昨日{value}
                  </Text>
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }

  getItemByHistory = (key) => {
    let {history, history_data, selectHistory} = this.state
    if (selectHistory === 1) {
      this.setState({
        selectHistoryItem: key
      })
      return
    }
    history_data = {label: [], value: [], touch_label: []}
    history.map((item, index) => {
      if (index !== history.length - 1) {
        if (selectHistory === 30 && index % 5 === 0 || selectHistory === 7) {
          history_data.label.push(item.date.substring(5))
          history_data.value.push(item[key])
        } else {
          history_data.label.push('')
          history_data.value.push(item[key])
        }
        history_data.touch_label.push(item.date.substring(5))
      }
    })

    this.setState({
      selectHistoryItem: key,
      history_data: history_data
    })
  }

  getHistoryData = (selectHistory, start_date, end_date) => {
    const {selectHistoryItem} = this.state
    this.getData(start_date, end_date, selectHistory, selectHistoryItem)
    this.setState({selectHistory: selectHistory, start_date: start_date, end_date: end_date})
  }
  renderHistoryData = () => {
    const {
      selectHistory, selectHistoryItem, history_data, yesterday_datetime, week_datetime, month_datetime, yesterday_data,
      summary
    } = this.state
    const {value = [], label = []} = history_data
    const decimalPlaces = value.filter(item => item > 10).length > 0 ? 0 : 2
    const history_summary = selectHistory === 1 ? yesterday_data : summary
    return (
      <View style={today_styles.zoneWrap} key={1}>
        <View style={history_styles.headerWrap}>
          <Text style={history_styles.headerTitle}>
            历史数据
          </Text>
          <View style={today_styles.rowCenter}>
            <TouchableOpacity onPress={() => this.getHistoryData(1, yesterday_datetime, yesterday_datetime)}
                              style={selectHistory === 1 ? history_styles.selectHistoryBtn : history_styles.historyBtn}>
              <Text style={selectHistory === 1 ? history_styles.selectHistoryBtnText : history_styles.historyBtnText}>
                昨日
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.getHistoryData(7, week_datetime, yesterday_datetime)}
                              style={selectHistory === 7 ? history_styles.selectHistoryBtn : history_styles.historyBtn}>
              <Text style={selectHistory === 7 ? history_styles.selectHistoryBtnText : history_styles.historyBtnText}>
                近7天
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.getHistoryData(30, month_datetime, yesterday_datetime)}
              style={[selectHistory === 30 ? history_styles.selectHistoryBtn : history_styles.historyBtn, {marginRight: 12}]}>
              <Text style={selectHistory === 30 ? history_styles.selectHistoryBtnText : history_styles.historyBtnText}>
                近30天
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[today_styles.detailDataWrap, selectHistory === 1 ? {marginBottom: 15} : {marginBottom: 0}]}>
          {
            history_summary && history_summary.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => this.getItemByHistory(item.key)}
                  style={selectHistoryItem === item.key ? history_styles.selectDetailWrap : history_styles.detailWrap}>
                  <Text style={history_styles.detailHeaderTitle}>
                    {item.label}
                  </Text>
                  <Text style={history_styles.detailDataText}>
                    {item.value}
                  </Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
        <If condition={(selectHistory === 7 || selectHistory === 30) && label.length > 0}>
          <LineChart
            data={{
              labels: label,
              datasets: [
                {
                  data: value,
                  color: () => `rgba(38, 185, 66, 1)`,
                }
              ]
            }}
            width={width - 12 * 4} // from react-native
            height={220}
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              fillShadowGradientFrom: colors.main_color,
              fillShadowGradientTo: colors.white,
              color: () => 'rgba(102, 102, 102, 1)',
              strokeWidth: 1, // optional, default 3
              // barPercentage: 0.5,
              decimalPlaces: decimalPlaces,
              useShadowColorFromDataset: false, // optional,
              propsForDots: {
                r: 3,
                strokeWidth: "1",
                stroke: colors.main_color
              },
              propsForBackgroundLines: {stroke: colors.colorEEE, strokeDasharray: ''},

            }}
            onDataPointClick={({index, x}) => this.setState({show_tips_visible: true, index: index, x: x})}
            getDotColor={() => colors.white}
            fromZero={true}
            bezier={true}
            withDots={true}
            withVerticalLines={false}
            segments={5}
            style={{marginTop: 6, marginBottom: 15}}
          />
        </If>

      </View>
    )
  }


  onClose = () => {
    this.setState({show_tips_visible: false})
  }
  renderDotData = () => {
    const {index, x, selectHistoryItem, history_data, show_tips_visible} = this.state
    switch (selectHistoryItem) {
      case 'gmv':
        name = '营业额'
        break
      case 'valid_order_num':
        name = '有效订单'
        break
      case 'cancel_order_num':
        name = '无效订单'
        break
      case 'avg_gmv':
        name = '单均价'
        break

      case 'valid_user_num':
        name = '交易用户数'
        break
      case 'user_paid':
        name = '实付营业额'
        break
    }
    return (
      <LineChartTipModal visible={show_tips_visible}
                         x={x}
                         date={history_data.touch_label[index]}
                         num={history_data.value[index]}
                         name={name}
                         onClose={this.onClose}/>
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
      <>
        {this.renderTodayRevenueData()}
        {this.renderHistoryData()}
        {this.renderTip()}
        {this.renderDotData()}
      </>
    );
  }
}
