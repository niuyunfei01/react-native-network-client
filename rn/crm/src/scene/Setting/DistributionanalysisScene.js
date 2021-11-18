import React, {PureComponent} from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../reducers/mine/mineActions";
import HttpUtils from "../../util/http";
import {hideModal, showModal} from "../../util/ToastUtils";
import {DatePickerView, List} from "@ant-design/react-native";
import color from "../../widget/color";
import Dialog from "../component/Dialog";

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

class DistributionanalysisScene extends PureComponent {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '配送分析'
    })
  }

  constructor(props) {
    super(props);
    this.getDistributionAnalysisData = this.getDistributionAnalysisData.bind(this);

    this.state = {
      isRefreshing: false,
      currStoreId: props.global.currStoreId,
      DistributionanalysisData: [],
      tabelTitle: ['配送方式', '配送总额', '总发单量', '平均成本', '平均距离'],
      total_delivery: undefined,
      total_fee: '',
      dateStatus: 0,
      showDateModal: false,
      startNewDateValue: new Date(),
      endNewDateValue: new Date(),
    }
    this.navigationOptions(this.props)
  }

  componentDidMount() {
    let startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime()/1000)
    let endTime = Math.round(new Date().getTime()/1000)
    this.getDistributionAnalysisData(startTime, endTime)
  }

  componentWillUnmount() {
  }

  getDistributionAnalysisData(startTime, endTime) {

    const {accessToken} = this.props.global;
    const {currStoreId} = this.state;
    showModal("查询中");
    const api = `/v1/new_api/analysis/delivery/${currStoreId}?access_token=${accessToken}&starttime=${startTime}&endtime=${endTime}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      hideModal()
        this.setState({
          DistributionanalysisData: res.data.statistic,
          total_delivery: res.data.total_delivery,
          total_fee: res.data.total_fee,
        })
    })
  }

  setDateStatus(type) {
      if(type == 3) {
        this.setState({
          showDateModal: true
        })
      }else{
        let startTime
        if (type == 0) {
          startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime()/1000)
          }
          if (type == 1) {
            startTime = Math.round(new Date(new Date() - (new Date().getDay() - 1) * 86400000).setHours(0,0,0,0)/1000)
          }
          if (type == 2) {
            startTime = Math.round(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0)/1000)
          }
        let endTime = Math.round(new Date().getTime()/1000)
        this.getDistributionAnalysisData(startTime,endTime)
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
      showDateModal: false
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

  renderCellItem() {
    const {DistributionanalysisData, tabelTitle, total_delivery, total_fee} = this.state
    let Array = []
    for(let i in DistributionanalysisData){
      Array.push(DistributionanalysisData[i])
    }
    return (
        <ScrollView
            refreshControl={
              <RefreshControl
                  refreshing={this.state.isRefreshing}
                  // onRefresh={() => this.onHeaderRefresh()}
                  tintColor='gray'
              />
            }
            style={{backgroundColor: colors.main_back}}
        >
          <View style={[styles.cell_box_header]}>
            {this.state.dateStatus === 0 ? <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText_today]} onPress={() =>{this.setDateStatus(0)}}>今天</Text>
            </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText_today1]} onPress={() =>{this.setDateStatus(0)}}>今天</Text>
            </View>}
            {this.state.dateStatus === 1 ? <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText_today]} onPress={() =>{this.setDateStatus(1)}}>本周</Text>
            </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText_today1]} onPress={() =>{this.setDateStatus(1)}}>本周</Text>
            </View>}
            {this.state.dateStatus === 2 ? <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText_today]} onPress={() =>{this.setDateStatus(2)}}>本月</Text>
            </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText_today1]} onPress={() =>{this.setDateStatus(2)}}>本月</Text>
            </View>}
            {this.state.dateStatus === 3 ? <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText_today]} onPress={() =>{this.setDateStatus(3)}}>自定义</Text>
            </View> : <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText_today1]} onPress={() =>{this.setDateStatus(3)}}>自定义</Text>
            </View>}
          </View>

          <View style={[styles.cell_box]}>
            <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText]}>配送总额</Text>
              <Text style={[styles.cell_rowTitleText1]}>¥{total_fee}</Text>
            </View>
            <View style={{width: pxToDp(2), height: pxToDp(120), backgroundColor: colors.colorDDD, marginTop: pxToDp(20)}}/>
            <View style={{flexDirection: "column", marginVertical: pxToDp(20), alignItems: "center"}}>
              <Text style={[styles.cell_rowTitleText]}>总发单量</Text>
              <Text style={[styles.cell_rowTitleText1]}>{total_delivery}单</Text>
            </View>
          </View>
          <View style={[styles.cell_box1]}>
            <View style={{width: pxToDp(356), flexDirection: "row", marginTop: pxToDp(20), paddingLeft: pxToDp(10)}}>
              { tabelTitle.map((item, index) => {
                return (
                  <View style={styles.box} key={index}>
                    <Text style={styles.name1}>{item}</Text>
                  </View>
                )
              }) }
            </View>
            {Array.map((item) => {
              const avg_distance = ((item.avg_distance)/1000).toString()
              let str = avg_distance.substring(0, 3)
              return (
                <View style={{width: pxToDp(356), flexDirection: "row", marginVertical: pxToDp(10), paddingLeft: pxToDp(10)}}>
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
          <Dialog visible={this.state.showDateModal} onRequestClose={() => this.onRequestClose()}>
            {this.showDatePicker()}
          </Dialog>
        </ScrollView>
    )
  }

  showDatePicker() {
    const dealTargetDays = this.getNewDate('before', 3)
    return <View>
      <List style={{marginTop: 12, width: '100%'}} renderHeader={<View style={styles.modalCancel}>
        <Text style={styles.modalCancelText}>开始时间</Text><Text style={styles.modalCancelText}>——</Text><Text style={styles.modalCancelText}>结束时间</Text>
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
      showDateModal: false
    })

    let startNewDate = this.state.startNewDateValue
    let endNewDate = this.state.endNewDateValue
    startNewDate = Math.round(new Date(new Date(startNewDate.setHours(0,0,0,0)).getTime()) / 1000);
    endNewDate = Math.round(new Date(new Date(endNewDate.setHours(0,0,0,0)).getTime()+(24*60*60*1000-1)) / 1000);
    this.getDistributionAnalysisData(startNewDate, endNewDate)
  }

  render() {
    return (
        this.renderCellItem()
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
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(DistributionanalysisScene)
