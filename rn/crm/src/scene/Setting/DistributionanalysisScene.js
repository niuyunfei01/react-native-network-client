import React, {PureComponent} from 'react'
import {
  PixelRatio,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import HttpUtils from "../../util/http";
import {hideModal, showError, showModal} from "../../util/ToastUtils";
import {DatePickerView, List} from "@ant-design/react-native";
import color from "../../widget/color";
import Dialog from "../component/Dialog";
import JbbText from "../component/JbbText";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}

const Distribution_Analysis = 'distribution_analysis';
const Profit_AndLoss_Analysis = 0;

class DistributionanalysisScene extends PureComponent {

  constructor(props) {
    super(props);
    this.getDistributionAnalysisData = this.getDistributionAnalysisData.bind(this);
    this.getProfitAndLossAnalysisData = this.getProfitAndLossAnalysisData.bind(this);

    this.state = {
      isRefreshing: false,
      currStoreId: props.global.currStoreId,
      DistributionanalysisData: [],
      tabelTitle: ['配送方式', '配送费', '总发单量', '平均成本', '平均距离'],
      total_delivery: undefined,
      total_fee: '',
      dateStatus: 0,
      showLeftDateModal: false,
      showRightDateModal: false,
      startNewDateValue: new Date(),
      endNewDateValue: new Date(),
      headerType: 1,
      analysis_by: Distribution_Analysis,
      analysis_done: Profit_AndLoss_Analysis,
      showHeader: true,
      cardStatus: 0,
      profitandloss: [],
      startTimeSaveValue: new Date(),
      endTimeSaveValue: new Date(),
    }
  }

  componentDidMount() {
    let startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
    let endTime = Math.round(new Date().getTime() / 1000)
    this.getDistributionAnalysisData(startTime, endTime)
    this.getProfitAndLossAnalysisData(startTime, endTime)
  }

  componentWillUnmount() {
  }

  getDistributionAnalysisData(startTime, endTime) {

    const {accessToken} = this.props.global;
    const {currStoreId} = this.state;
    showModal("查询中");
    const api = `/v1/new_api/analysis/delivery/${currStoreId}?access_token=${accessToken}&starttime=${startTime}&endtime=${endTime}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      this.setState({
        DistributionanalysisData: res.data.statistic,
        total_delivery: res.data.total_delivery,
        total_fee: res.data.total_fee,
        startTimeSaveValue: startTime,
        endTimeSaveValue: endTime
      })
      hideModal()
    })
  }

  getProfitAndLossAnalysisData(startTime, endTime) {
    const {accessToken} = this.props.global;
    const {currStoreId} = this.state;
    showModal("查询中");
    const api = `/v1/new_api/analysis/profitandloss/${currStoreId}?access_token=${accessToken}&starttime=${startTime}&endtime=${endTime}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      hideModal()
      this.setState({
        profitandloss: res.data,
        startTimeSaveValue: startTime,
        endTimeSaveValue: endTime
      })
    }).catch((reason => {
      hideModal()
      showError(reason.desc)
    }))
  }

  setLeftDateStatus(type) {
    if (type == 3) {
      this.setState({
        showLeftDateModal: true
      })
    } else {
      let startTime
      if (type == 0) {
        startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
      }
      if (type == 1) {
        startTime = Math.round(new Date(new Date() - (new Date().getDay() + 6) * 86400000).setHours(0, 0, 0, 0) / 1000)
      }
      if (type == 2) {
        startTime = Math.round(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0) / 1000)
      }
      let endTime = Math.round(new Date().getTime() / 1000)
      this.getDistributionAnalysisData(startTime, endTime)
    }
    this.setState({
      dateStatus: type,
    })
  }

  setRightDateStatus(type) {
    if (type == 3) {
      this.setState({
        showRightDateModal: true
      })
    } else {
      let startTime
      if (type == 0) {
        startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
      }
      if (type == 1) {
        startTime = Math.round(new Date(new Date() - (new Date().getDay() + 6) * 86400000).setHours(0, 0, 0, 0) / 1000)
      }
      if (type == 2) {
        startTime = Math.round(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0) / 1000)
      }
      let endTime = Math.round(new Date().getTime() / 1000)
      this.getProfitAndLossAnalysisData(startTime, endTime)
    }
    this.setState({
      dateStatus: type,
    })
  }

  // onHeaderRefresh() {
  //   this.getDistributionAnalysisData()
  // }

  onRequestClose() {
    this.setState({
      showLeftDateModal: false,
      showRightDateModal: false,
    })
  }

  getNewDate(flag, many) {
    const thirtyDays = [4, 6, 9, 11]
    const thirtyOneDays = [1, 3, 5, 7, 8, 10, 12]
    const currDate = new Date()
    const year = currDate.getFullYear()
    let month = currDate.getMonth() + 1
    let targetDateMilli = 0
    let GMTDate = ''
    let targetYear = ''
    let targetMonth = ''
    let targetDate = ''
    let dealTargetDays = ''
    const isLeapYear =
      !!((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)
    let countDays = 0
    for (let i = 0; i < many; i++) {
      if (flag === 'before') {
        month = month - 1 <= 0 ? 12 : month - 1
      } else {
        month = month + 1 > 12 ? 1 : month + 1
      }
      thirtyDays.includes(month)
        ? (countDays += 30)
        : thirtyOneDays.includes(month)
          ? (countDays += 31)
          : isLeapYear
            ? (countDays += 29)
            : (countDays += 28)
    }
    targetDateMilli = currDate.setDate(
      currDate.getDate() - (flag === 'before' ? countDays : countDays * -1)
    )
    GMTDate = new Date(targetDateMilli)
    targetYear = GMTDate.getFullYear()
    targetMonth = GMTDate.getMonth() + 1
    targetDate = GMTDate.getDate()
    targetMonth = targetMonth.toString().padStart(2, '0')
    targetDate = targetDate.toString().padStart(2, '0')
    dealTargetDays = `${targetYear}-${targetMonth}-${targetDate}`
    return dealTargetDays
  }

  renderDistributionAnalysis() {
    const {DistributionanalysisData, tabelTitle, total_delivery, total_fee} = this.state
    let Array = []
    for (let i in DistributionanalysisData) {
      Array.push(DistributionanalysisData[i])
    }
    if (this.state.analysis_by === Distribution_Analysis && this.state.headerType === 1) {
      return (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              tintColor='gray'
            />
          }
          style={{backgroundColor: colors.main_back}}
        >
          <View style={[styles.cell_box_header]}>
            {this.state.dateStatus === 0 ?
              <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today]} onPress={() => {
                  this.setLeftDateStatus(0)
                }}>今天</Text>
              </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today1]} onPress={() => {
                  this.setLeftDateStatus(0)
                }}>今天</Text>
              </View>}
            {this.state.dateStatus === 1 ?
              <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today]} onPress={() => {
                  this.setLeftDateStatus(1)
                }}>近7天</Text>
              </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today1]} onPress={() => {
                  this.setLeftDateStatus(1)
                }}>近7天</Text>
              </View>}
            {this.state.dateStatus === 2 ?
              <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today]} onPress={() => {
                  this.setLeftDateStatus(2)
                }}>本月</Text>
              </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today1]} onPress={() => {
                  this.setLeftDateStatus(2)
                }}>本月</Text>
              </View>}
            {this.state.dateStatus === 3 ?
              <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today]} onPress={() => {
                  this.setLeftDateStatus(3)
                }}>自定义</Text>
              </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today1]} onPress={() => {
                  this.setLeftDateStatus(3)
                }}>自定义</Text>
              </View>}
          </View>

          <View style={[styles.cell_box]}>
            <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText]}>配送费</Text>
              <Text style={[styles.cell_rowTitleText1]}>¥{total_fee}</Text>
            </View>
            <View
              style={{width: pxToDp(2), height: pxToDp(120), backgroundColor: colors.colorDDD, marginTop: pxToDp(20)}}/>
            <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText]}>总发单量</Text>
              <JbbText style={[styles.cell_rowTitleText1]}>{total_delivery}单</JbbText>
            </View>
          </View>
          <View style={[styles.cell_box1]}>
            <View style={{width: pxToDp(356), flexDirection: "row", marginTop: pxToDp(20), paddingLeft: pxToDp(10)}}>
              {tabelTitle.map((item, index) => {
                return (
                  <View style={styles.box} key={index}>
                    <Text style={styles.name1}>{item}</Text>
                  </View>
                )
              })}
            </View>
            {Array.map((item) => {
              const avg_distance = ((item.avg_distance) / 1000).toString()
              let str = avg_distance.substring(0, 3)
              return (
                <View
                  style={{
                    width: pxToDp(356),
                    flexDirection: "row",
                    marginVertical: pxToDp(10),
                    paddingLeft: pxToDp(10)
                  }}>
                  <View style={styles.box}>
                    <Text style={styles.name}>{item.platform}</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{item.total_fee}元</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{item.total_count}</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{item.avg_fee}元</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{str}km</Text>
                  </View>
                </View>
              )
            })}
          </View>
          <Dialog visible={this.state.showLeftDateModal} onRequestClose={() => this.onRequestClose()}>
            {this.showDatePicker()}
          </Dialog>
        </ScrollView>
      )
    }
  }

  renderProfitAndLossAnalysis() {
    let styleLine = {
      borderTopColor: colors.colorDDD,
      borderTopWidth: 1 / PixelRatio.get() * 2,
      borderStyle: "dotted"
    };
    const {cardStatus, profitandloss} = this.state
    if (this.state.headerType !== 1) {
      return (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              tintColor='gray'
            />
          }
          style={{backgroundColor: colors.main_back}}
        >
          <View style={[styles.cell_box_header]}>
            {this.state.dateStatus === 0 ?
              <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today]} onPress={() => {
                  this.setRightDateStatus(0)
                }}>今天</Text>
              </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today1]} onPress={() => {
                  this.setRightDateStatus(0)
                }}>今天</Text>
              </View>}
            {this.state.dateStatus === 1 ?
              <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today]} onPress={() => {
                  this.setRightDateStatus(1)
                }}>近7天</Text>
              </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today1]} onPress={() => {
                  this.setRightDateStatus(1)
                }}>近7天</Text>
              </View>}
            {this.state.dateStatus === 2 ?
              <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today]} onPress={() => {
                  this.setRightDateStatus(2)
                }}>本月</Text>
              </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today1]} onPress={() => {
                  this.setRightDateStatus(2)
                }}>本月</Text>
              </View>}
            {this.state.dateStatus === 3 ?
              <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today]} onPress={() => {
                  this.setRightDateStatus(3)
                }}>自定义</Text>
              </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
                <Text style={[styles.cell_rowTitleText_today1]} onPress={() => {
                  this.setRightDateStatus(3)
                }}>自定义</Text>
              </View>}
          </View>

          {profitandloss.map(item => {
            return (
              <View style={{
                marginVertical: 15,
                marginHorizontal: 10,
                borderRadius: pxToDp(10),
                backgroundColor: colors.white
              }}>
                <View style={{flexDirection: "column", margin: pxToDp(20), justifyContent: "flex-start"}}>
                  <Text style={[styles.cell_rowTitleTextR1]}>{item.store_name}</Text>
                  <View style={cardStatus == 0 ? {
                    flexDirection: "row",
                    justifyContent: "space-between"
                  } : {flexDirection: "column", alignItems: "center"}}>
                    <JbbText style={[styles.cell_rowTitleTextR2]}>毛利额/毛利率</JbbText>
                    <JbbText style={cardStatus == 0 ? {
                      fontSize: pxToDp(28),
                      color: colors.main_color,
                      marginVertical: pxToDp(10)
                    } : {
                      fontSize: pxToDp(38),
                      color: colors.main_color,
                      marginVertical: pxToDp(10),
                      fontWeight: "bold"
                    }}>¥{item.good_profit}/{item.good_profit_ratio}%</JbbText>
                  </View>

                  {cardStatus == 1 &&
                  <View>
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginVertical: pxToDp(5)}}>
                      <Text style={[styles.cell_rowTitleTextR4]}>订单总数 </Text>
                      <JbbText style={{
                        fontSize: pxToDp(26),
                        color: colors.title_color,
                        marginVertical: pxToDp(10)
                      }}>{item.num_of_orders}单</JbbText>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                      <Text style={[styles.cell_rowTitleTextR4]}>亏损单占比 </Text>
                      <JbbText style={{
                        fontSize: pxToDp(26),
                        color: colors.title_color,
                        marginVertical: pxToDp(10)
                      }}>{item.ratio} </JbbText>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                      <Text style={[styles.cell_rowTitleTextR4]}>平台结算金额 </Text>
                      <JbbText style={{
                        fontSize: pxToDp(26),
                        color: colors.title_color,
                        marginVertical: pxToDp(10)
                      }}>{item.sum_of_total_income_from_platform}元</JbbText>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                      <Text style={[styles.cell_rowTitleTextR4]}>客单价 </Text>
                      <JbbText style={{
                        fontSize: pxToDp(26),
                        color: colors.title_color,
                        marginVertical: pxToDp(10)
                      }}>{item.avg_income_from_platform}元</JbbText>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                      <Text style={[styles.cell_rowTitleTextR4]}>商品成本 </Text>
                      <JbbText style={{
                        fontSize: pxToDp(26),
                        color: colors.title_color,
                        marginVertical: pxToDp(10)
                      }}>{item.goods_cost}元</JbbText>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                      <Text style={[styles.cell_rowTitleTextR4]}>三方配送成本 </Text>
                      <Text style={{
                        fontSize: pxToDp(30),
                        fontWeight: "bold",
                        color: colors.main_color,
                        marginVertical: pxToDp(10)
                      }} onPress={() => {
                        this.setState({
                          headerType: 1,
                        })
                      }}>去查看 </Text>
                    </View>
                  </View>
                  }

                  <View style={[cardStatus == 1 && styleLine, {flexDirection: "row", justifyContent: "space-between"}]}>
                    <Text style={[styles.cell_rowTitleTextR3]}>盈亏明细</Text>
                    {cardStatus == 0 ? <Text style={{
                      fontSize: pxToDp(30),
                      color: colors.main_color,
                      marginVertical: pxToDp(20),
                      marginRight: pxToDp(10)
                    }} onPress={() => this.setState({cardStatus: 1})}>展开</Text> : <Text style={{
                      fontSize: pxToDp(30),
                      color: colors.main_color,
                      marginVertical: pxToDp(20),
                      marginRight: pxToDp(10),
                      fontWeight: "bold"
                    }} onPress={() => this.setState({cardStatus: 0})}>关闭</Text>}
                  </View>
                </View>
              </View>
            )
          })}
          <Dialog visible={this.state.showRightDateModal} onRequestClose={() => this.onRequestClose()}>
            {this.showDatePicker()}
          </Dialog>
        </ScrollView>
      )
    }
  }

  renderHeaderTab() {
    let startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
    let endTime = Math.round(new Date().getTime() / 1000)
    let {startTimeSaveValue, endTimeSaveValue} = this.state
    if (this.state.showHeader) {
      return (
        <View style={{
          width: '100%',
          flexDirection: 'row',
          backgroundColor: colors.main_color,
          marginBottom: pxToDp(20)
        }}>
          <Text
            onPress={() => {
              this.setState({
                headerType: 1,
              }, () => {
                this.getDistributionAnalysisData(startTimeSaveValue, endTimeSaveValue)
              })
            }}
            style={this.state.headerType === 1 ? [styles.header_text] : [styles.header_text, styles.check_staus]}>配送分析</Text>
          <Text
            onPress={() => {
              this.setState({
                headerType: 2,
              }, () => {
                this.getProfitAndLossAnalysisData(startTimeSaveValue, endTimeSaveValue)
              })
            }}
            style={this.state.headerType !== 1 ? [styles.header_text] : [styles.header_text, styles.check_staus]}>盈亏分析</Text>
        </View>
      )
    } else {
      return null
    }
  }

  showDatePicker() {
    const dealTargetDays = this.getNewDate('before', 3)
    return <View>
      <List style={{marginTop: 12, width: '100%'}} renderHeader={<View style={styles.modalCancel}>
        <Text style={styles.modalCancelText}>开始时间</Text><Text style={styles.modalCancelText}>——</Text><Text
        style={styles.modalCancelText}>结束时间</Text>
      </View>}/>
      <DatePickerView value={this.state.startNewDateValue} minDate={new Date(dealTargetDays)} maxDate={new Date()}
                      mode='date'
                      onChange={(value) => this.setState({startNewDateValue: value})}>
      </DatePickerView>
      <DatePickerView value={this.state.endNewDateValue} minDate={new Date(dealTargetDays)} maxDate={new Date()}
                      mode='date'
                      onChange={(value) => this.setState({endNewDateValue: value})}>
      </DatePickerView>
      <TouchableOpacity onPress={() => {
        this.onConfirm()
      }} style={styles.modalCancel1}>
        <View>
          <Text style={styles.modalCancelText1}>确&nbsp;&nbsp;&nbsp;&nbsp;认</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  onConfirm() {
    this.setState({
      showLeftDateModal: false,
      showRightDateModal: false
    })

    let startNewDate = this.state.startNewDateValue
    let endNewDate = this.state.endNewDateValue
    startNewDate = Math.round(new Date(new Date(startNewDate.setHours(0, 0, 0, 0)).getTime()) / 1000);
    endNewDate = Math.round(new Date(new Date(endNewDate.setHours(0, 0, 0, 0)).getTime() + (24 * 60 * 60 * 1000 - 1)) / 1000);
    if (this.state.analysis_by === Distribution_Analysis && this.state.headerType === 1) {
      this.getDistributionAnalysisData(startNewDate, endNewDate)
    } else {
      this.getProfitAndLossAnalysisData(startNewDate, endNewDate)
    }

  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderHeaderTab()}
        {this.renderDistributionAnalysis()}
        {this.renderProfitAndLossAnalysis()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cell_box: {
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  cell_box_header: {
    marginTop: 5,
    marginHorizontal: 10,
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  cell_box1: {
    marginHorizontal: 10,
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  cell_box2: {
    margin: 15,
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  cell_rowTitleText: {
    fontSize: pxToDp(26),
    color: colors.title_color,
    marginVertical: pxToDp(10)
  },
  cell_rowTitleTextR1: {
    fontSize: pxToDp(40),
    color: colors.main_color,
    marginVertical: pxToDp(10),
    fontWeight: "bold"
  },
  cell_rowTitleTextR2: {
    fontSize: pxToDp(30),
    color: colors.title_color,
    marginVertical: pxToDp(10),
    fontWeight: "bold"
  },
  cell_rowTitleTextR3: {
    fontSize: pxToDp(30),
    color: colors.title_color,
    marginVertical: pxToDp(20)
  },
  cell_rowTitleTextR4: {
    fontSize: pxToDp(26),
    color: colors.title_color,
    marginVertical: pxToDp(10)
  },
  cell_rowTitleText_today: {
    fontSize: pxToDp(28),
    color: colors.white,
    marginVertical: pxToDp(10),
    paddingHorizontal: pxToDp(40),
    backgroundColor: colors.main_color,
    paddingVertical: pxToDp(15),
    borderRadius: pxToDp(10)
  },
  cell_rowTitleText_today1: {
    fontSize: pxToDp(26),
    color: colors.title_color,
    marginVertical: pxToDp(10),
    padding: pxToDp(15)
  },
  cell_rowTitleText1: {
    fontSize: pxToDp(40),
    color: colors.main_color,
    marginVertical: pxToDp(10),
    fontWeight: "bold"
  },
  box: {
    height: pxToDp(55)
  },
  name: {
    width: 70,
    textAlign: 'center',
    color: '#333333',
    fontSize: pxToDp(24)
  },
  name1: {
    width: 70,
    textAlign: 'center',
    color: '#333333',
    fontSize: pxToDp(24),
    fontWeight: "bold"
  },
  searchBarPrefix: {
    flexDirection: 'row',
    width: pxToDp(140),
    flex: 1,
    position: 'relative',
    alignItems: 'center'
  },
  modalCancel: {
    width: '100%',
    height: pxToDp(80),
    alignItems: "center",
    borderRadius: pxToDp(10),
    marginTop: pxToDp(20),
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  modalCancel1: {
    width: '100%',
    height: pxToDp(80),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: pxToDp(10),
    marginTop: pxToDp(20)
  },
  modalCancelText: {
    color: 'black',
    fontSize: pxToDp(40),
    fontWeight: "bold"
  },
  modalCancelText1: {
    color: color.theme,
    fontSize: pxToDp(40)
  },
  header_text: {
    height: 40,
    width: "50%",
    fontSize: pxToDp(30),
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    color: colors.white,
    ...Platform.select({
      ios: {
        lineHeight: 40,
      },
      android: {}
    }),
  },
  check_staus: {
    backgroundColor: colors.white,
    color: colors.title_color
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(DistributionanalysisScene)
