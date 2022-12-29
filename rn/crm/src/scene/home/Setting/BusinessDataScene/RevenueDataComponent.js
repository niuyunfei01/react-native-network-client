import React, {PureComponent} from "react";
import {View, StyleSheet, TouchableOpacity, Text, Dimensions} from "react-native";
import colors from "../../../../pubilc/styles/colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import {LineChart} from "react-native-chart-kit";
import HttpUtils from "../../../../pubilc/util/http";
import tool from "../../../../pubilc/util/tool";
import AlertModal from "../../../../pubilc/component/AlertModal";
import LineChartTipModal from "../../../../pubilc/component/LineChartTipModal";

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
    fontWeight: '500',
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
    fontWeight: '500',
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
      summary: [],
      history: [],
      history_data: {
        show: {},
        line_data: {
          label: [],
          touch_label: [],
          value: []
        }
      },
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

  componentDidMount() {

    const {current_datetime, yesterday_datetime,} = this.state
    const {navigation} = this.props
    this.focus = navigation.addListener('focus', () => {
      this.getDate(yesterday_datetime, current_datetime)
    })

  }

  componentWillUnmount() {
    this.focus()
  }

  getDate = (start_date, end_date, selectHistory = 1, key = 'gmv') => {
    const {store_id, accessToken} = this.props

    const time = end_date - start_date
    const url = `/v1/new_api/analysis/revenue_stat?access_token=${accessToken}`

    const params = {store_id: store_id, start_date: tool.fullDay(start_date), end_date: tool.fullDay(end_date)}
    HttpUtils.get(url, params).then(({summary = [], history = []}) => {
      const history_data = {show: {}, line_data: {label: [], value: [], touch_label: []}}
      let sum = 0
      switch (time) {
        case 24 * 3600 * 1000:
          history_data.show = history[0]
          break
        default:
          history.map((item, index) => {
            if (index !== history.length - 1) {
              if (selectHistory === 30 && index % 5 === 0 || selectHistory === 7) {
                history_data.line_data.label.push(item.date.substring(5))
                history_data.line_data.value.push(item[key])
              } else {
                history_data.line_data.label.push('')
                history_data.line_data.value.push(item[key])
              }
              history_data.line_data.touch_label.push(item.date.substring(5))
            }
          })

          Object.keys(history[0]).map(attr => {
            if (attr !== 'date') {
              sum = 0

              history.map((item, index) => {
                if (index !== history.length - 1) {
                  sum += item[attr]
                }
              })
              if (`${sum}`.indexOf('.') !== -1) {
                history_data.show[attr] = sum.toFixed(2)
              } else
                history_data.show[attr] = sum
            }
          })
          break
      }

      this.setState({
        summary: summary,
        history: history,
        history_data: history_data,
        selectHistoryItem: key
      })
    })
  }


  setModal = (visible, title, desc) => {
    this.setState({
      visible: visible,
      title: title,
      desc: desc
    })
  }

  renderTodayRevenueData = () => {
    const {summary, current_datetime, history} = this.state
    const yesterday_data = history[history.length - 2]
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
            summary && summary.map((item, index) => {
              return (
                <View key={index} style={{width: '50%'}}>
                  <View style={today_styles.rowCenter}>
                    <Text style={today_styles.detailDataHeaderTitle}>
                      {item.label}
                    </Text>
                    <AntDesign name={'questioncircle'}
                               color={colors.color999}
                               style={{paddingLeft: 4}}
                               onPress={() => this.setModal(true, item.label, item.tip)}/>
                  </View>
                  <Text style={today_styles.detailDataText}>
                    {item.value}
                  </Text>
                  <Text style={today_styles.yesterdayData}>
                    昨日{yesterday_data[item.key]}
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
    const {history, history_data, selectHistory} = this.state
    let sum = 0
    history_data.line_data = {label: [], value: [], touch_label: []}
    history.map((item, index) => {
      if (index !== history.length - 1) {
        if (selectHistory === 30 && index % 5 === 0 || selectHistory === 7) {
          history_data.line_data.label.push(item.date.substring(5))
          history_data.line_data.value.push(item[key])
        } else {
          history_data.line_data.label.push('')
          history_data.line_data.value.push(item[key])
        }
        history_data.line_data.touch_label.push(item.date.substring(5))
      }
    })

    Object.keys(history[0]).map(attr => {
      if (attr !== 'date') {
        sum = 0

        history.map((item, index) => {
          if (index !== history.length - 1) {
            sum += item[attr]
          }
        })
        if (`${sum}`.indexOf('.') !== -1) {
          history_data.show[attr] = sum.toFixed(2)
        } else
          history_data.show[attr] = sum
      }
    })

    this.setState({
      selectHistoryItem: key,
      history_data: history_data
    })
  }

  getHistoryData = (selectHistory, start_date, end_date) => {
    const {selectHistoryItem} = this.state
    this.getDate(start_date, end_date, selectHistory, selectHistoryItem)
    this.setState({selectHistory: selectHistory})
  }
  renderHistoryData = () => {
    const {
      selectHistory, selectHistoryItem, history_data, current_datetime, yesterday_datetime, week_datetime,
      month_datetime
    } = this.state
    const {show, line_data} = history_data
    const decimalPlaces = line_data.value.filter(item => item > 10).length > 0 ? 0 : 2
    return (
      <View style={today_styles.zoneWrap} key={1}>
        <View style={history_styles.headerWrap}>
          <Text style={history_styles.headerTitle}>
            历史数据
          </Text>
          <View style={today_styles.rowCenter}>
            <TouchableOpacity onPress={() => this.getHistoryData(1, yesterday_datetime, current_datetime)}
                              style={selectHistory === 1 ? history_styles.selectHistoryBtn : history_styles.historyBtn}>
              <Text style={selectHistory === 1 ? history_styles.selectHistoryBtnText : history_styles.historyBtnText}>
                昨日
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.getHistoryData(7, week_datetime, current_datetime)}
                              style={selectHistory === 7 ? history_styles.selectHistoryBtn : history_styles.historyBtn}>
              <Text style={selectHistory === 7 ? history_styles.selectHistoryBtnText : history_styles.historyBtnText}>
                近7天
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.getHistoryData(30, month_datetime, current_datetime)}
              style={[selectHistory === 30 ? history_styles.selectHistoryBtn : history_styles.historyBtn, {marginRight: 12}]}>
              <Text style={selectHistory === 30 ? history_styles.selectHistoryBtnText : history_styles.historyBtnText}>
                近30天
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[today_styles.detailDataWrap, selectHistory === 1 ? {marginBottom: 15} : {marginBottom: 0}]}>
          <TouchableOpacity
            onPress={() => this.getItemByHistory('gmv')}
            style={selectHistoryItem === 'gmv' ? history_styles.selectDetailWrap : history_styles.detailWrap}>
            <Text style={history_styles.detailHeaderTitle}>
              营业额(元)
            </Text>
            <Text style={history_styles.detailDataText}>
              {show.gmv}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.getItemByHistory('valid_order_num')}
            style={selectHistoryItem === 'valid_order_num' ? history_styles.selectDetailWrap : history_styles.detailWrap}>
            <Text style={history_styles.detailHeaderTitle}>
              有效订单
            </Text>
            <Text style={history_styles.detailDataText}>
              {show.valid_order_num}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.getItemByHistory('cancel_order_num')}

            style={selectHistoryItem === 'cancel_order_num' ? history_styles.selectDetailWrap : history_styles.detailWrap}>
            <Text style={history_styles.detailHeaderTitle}>
              无效订单
            </Text>
            <Text style={history_styles.detailDataText}>
              {show.cancel_order_num}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.getItemByHistory('avg_gmv')}
            style={selectHistoryItem === 'avg_gmv' ? history_styles.selectDetailWrap : history_styles.detailWrap}>
            <Text style={history_styles.detailHeaderTitle}>
              单均价(元)
            </Text>
            <Text style={history_styles.detailDataText}>
              {show.avg_gmv}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.getItemByHistory('valid_user_num')}
            style={selectHistoryItem === 'valid_user_num' ? history_styles.selectDetailWrap : history_styles.detailWrap}>
            <Text style={history_styles.detailHeaderTitle}>
              交易用户数
            </Text>
            <Text style={history_styles.detailDataText}>
              {show.valid_user_num}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.getItemByHistory('user_paid')}
            style={selectHistoryItem === 'user_paid' ? history_styles.selectDetailWrap : history_styles.detailWrap}>
            <Text style={history_styles.detailHeaderTitle}>
              实付营业额
            </Text>
            <Text style={history_styles.detailDataText}>
              {show.user_paid}
            </Text>
          </TouchableOpacity>
        </View>
        <If condition={(selectHistory === 7 || selectHistory === 30) && line_data.label.length > 0}>
          <LineChart
            data={{
              labels: line_data.label,
              datasets: [
                {
                  data: line_data.value,
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
                r: "4",
                strokeWidth: "2",
                stroke: colors.main_color
              },
              propsForBackgroundLines: {stroke: colors.colorEEE, strokeDasharray: ''},

            }}
            onDataPointClick={({index, x}) => this.setState({show_tips_visible: true, index: index, x: x})}
            getDotColor={() => 'transparent'}
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
                         date={history_data.line_data.touch_label[index]}
                         num={history_data.line_data.value[index]}
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
