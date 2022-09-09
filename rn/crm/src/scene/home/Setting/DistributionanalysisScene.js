import React, {PureComponent} from 'react'
import {
  PixelRatio,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {connect} from "react-redux";
import HttpUtils from "../../../pubilc/util/http";
import {hideModal, showError, ToastShort} from "../../../pubilc/util/ToastUtils";
import Dialog from "../../common/component/Dialog";
import DateTimePicker from "react-native-modal-datetime-picker";
import Cts from "../../../pubilc/common/Cts";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

const Distribution_Analysis = 'distribution_analysis';
const Profit_AndLoss_Analysis = 0;
const timeOptions = [
  {label: '今天', value: 0},
  {label: '近7天', value: 1},
  {label: '本月', value: 2},
  {label: '自定义', value: 3},
]
const styleLine = {
  borderTopColor: colors.colorDDD,
  borderTopWidth: 1 / PixelRatio.get() * 2,
  borderStyle: "dotted"
};

class DistributionAnalysisScene extends PureComponent {
  constructor(props) {

    super(props);

    const {accessToken, currStoreId} = this.props.global;

    this.state = {
      timeType: "",
      showDateModal: false,
      currStoreId: currStoreId,
      accessToken: accessToken,
      DistributionAnalysisData: [],
      tableTitle: ['配送方式', '配送费', '总发单量', '平均成本', '平均距离'],
      total_delivery: '',
      total_fee: '',
      dateStatus: 0,
      filterPlatform: 0,
      showLeftDateModal: false,
      showRightDateModal: false,
      startNewDateValue: "",
      startTime: "",
      endNewDateValue: "",
      endTime: "",
      headerType: 1,
      analysis_by: Distribution_Analysis,
      analysis_done: Profit_AndLoss_Analysis,
      showHeader: true,
      cardStatus: 0,
      profitAndLoss: [],
      startTimeSaveValue: new Date(),
      endTimeSaveValue: new Date(),
    }
    this.getDistributionAnalysisData = this.getDistributionAnalysisData.bind(this);
    this.getProfitAndLossAnalysisData = this.getProfitAndLossAnalysisData.bind(this);
  }

  componentDidMount() {
    this.initializeTime()
  }

  initializeTime = () => {
    let startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
    let endTime = Math.round(new Date().getTime() / 1000)
    this.getDistributionAnalysisData(startTime, endTime)
  }

  getDistributionAnalysisData = (startTime, endTime) => {
    const {currStoreId, filterPlatform, accessToken} = this.state;
    ToastShort("查询中");
    const api = `/v1/new_api/analysis/delivery/${currStoreId}/${filterPlatform}?access_token=${accessToken}&starttime=${startTime}&endtime=${endTime}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({
        DistributionAnalysisData: res?.data?.statistic,
        total_delivery: res?.data?.total_delivery,
        total_fee: res?.data?.total_fee,
        startTimeSaveValue: startTime,
        endTimeSaveValue: endTime
      })
    }).catch(reason => {
      showError(reason?.desc)
    })
  }

  getProfitAndLossAnalysisData(startTime, endTime) {
    const {currStoreId, accessToken} = this.state;
    ToastShort("查询中");
    const api = `/v1/new_api/analysis/profitAndLoss/${currStoreId}?access_token=${accessToken}&starttime=${startTime}&endtime=${endTime}`
    HttpUtils.get.bind(this.props)(api).then(res => {
      this.setState({
        profitAndLoss: res?.data,
        startTimeSaveValue: startTime,
        endTimeSaveValue: endTime
      })
    }).catch((reason => {
      showError(reason?.desc)
    }))
  }

  setFilterPlatform = (pl) => {
    this.setState({
      filterPlatform: pl
    }, () => {
      let {startTimeSaveValue, endTimeSaveValue} = this.state
      this.getDistributionAnalysisData(startTimeSaveValue, endTimeSaveValue)
    })
  }

  setLeftDateStatus = (type) => {
    if (type == 3) {
      this.setState({
        dateStatus: type,
        showLeftDateModal: true
      })
      return
    }
    let startTime
    switch (type) {
      case 0:
        startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
        break
      case 1:
        startTime = Math.round(new Date(new Date() - (new Date().getDay() + 2) * 86400000).setHours(0, 0, 0, 0) / 1000)
        break
      case 2:
        startTime = Math.round(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0) / 1000)
        break
      default:
        break
    }
    let endTime = Math.round(new Date().getTime() / 1000)
    this.getDistributionAnalysisData(startTime, endTime)
    this.setState({
      dateStatus: type,
    })
  }

  p(s) {
    return s < 10 ? '0' + s : s
  }

  setRightDateStatus = (type) => {
    if (type == 3) {
      this.setState({
        dateStatus: type,
        showRightDateModal: true
      })
      return
    }
    let startTime
    switch (type) {
      case 0:
        startTime = Math.round(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000)
        break
      case 1:
        startTime = Math.round(new Date(new Date() - (new Date().getDay() + 2) * 86400000).setHours(0, 0, 0, 0) / 1000)
        break
      case 2:
        startTime = Math.round(new Date(new Date().setDate(1)).setHours(0, 0, 0, 0) / 1000)
        break
      default:
        break
    }
    let endTime = Math.round(new Date().getTime() / 1000)
    this.getProfitAndLossAnalysisData(startTime, endTime)
    this.setState({
      dateStatus: type
    })
  }

  onRequestClose() {
    this.setState({
      showLeftDateModal: false,
      showRightDateModal: false,
    })
  }

  renderDistributionAnalysis() {
    const {DistributionAnalysisData, tableTitle, total_delivery, total_fee, filterPlatform, dateStatus} = this.state
    let Array = []
    for (let i in DistributionAnalysisData) {
      Array.push(DistributionAnalysisData[i])
    }
    if (this.state.analysis_by === Distribution_Analysis && this.state.headerType === 1)
      return (
        <ScrollView style={Styles.scrollContainer}>
          <View style={[styles.cell_box_header, {marginBottom: 10, paddingVertical: 10}]}>
            <For index='i' each='info' of={Cts.PLAT_ARRAY}>
              <TouchableOpacity
                key={i}
                style={[filterPlatform === info.id ? Styles.cell_rowTitleChecked : Styles.cell_rowTitleNoChecked, filterPlatform === info.id ? styles.cell_rowTitleText_today : styles.cell_rowTitleText_today1]}
                onPress={() => this.setFilterPlatform(info.id)}>
                <Text style={{fontSize: 12, color: filterPlatform === info.id ? colors.white : colors.fontBlack}}>{info.label}</Text>
              </TouchableOpacity>
            </For>
          </View>
          <View style={[styles.cell_box_header]}>
            <For index='i' each='info' of={timeOptions}>
              <View key={i} style={styles.cell_box_info}>
                <Text style={dateStatus === info.value ? styles.cell_rowTitleText_today : styles.cell_rowTitleText_today1}
                  onPress={() => {
                    this.setLeftDateStatus(info.value)
                  }}> {info.label} </Text>
              </View>
            </For>
          </View>

          <View style={[styles.cell_box]}>
            <View style={styles.cell_box_info}>
              <Text style={[styles.cell_rowTitleText]}>配送费</Text>
              <Text style={[styles.cell_rowTitleText1]}>¥{total_fee} </Text>
            </View>
            <View style={styles.totalDelivery}/>
            <View style={styles.cell_box_info}>
              <Text style={[styles.cell_rowTitleText]}>总发单量</Text>
              <Text style={[styles.cell_rowTitleText1]}>{total_delivery}单</Text>
            </View>
          </View>
          <View style={[styles.cell_box1]}>
            <View style={styles.itemInfo}>
              <For of={tableTitle} index='index' each='item'>
                <View style={styles.box} key={index}>
                  <Text style={styles.name1}>{item} </Text>
                </View>
              </For>
            </View>
            <For index='index' each='item' of={Array}>
              <View
                style={styles.tableItem} key={index}>
                <View style={styles.box}>
                  <Text style={styles.name}>{item.platform} </Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.total_fee}元</Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.total_count} </Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.avg_fee}元</Text>
                </View>
                <View>
                  <Text style={styles.name}>{((item.avg_distance) / 1000).toString().substring(0, 3)}km</Text>
                </View>
              </View>
            </For>
          </View>
          <Dialog visible={this.state.showLeftDateModal} onRequestClose={() => this.onRequestClose()}>
            {this.showDatePicker()}
          </Dialog>
        </ScrollView>
      )
  }

  renderProfitAndLossAnalysis() {
    const {cardStatus, profitAndLoss, headerType, dateStatus, showRightDateModal} = this.state
    if (headerType !== 1) {
      return (
        <ScrollView style={Styles.scrollContainer}>
          <View style={[styles.cell_box_header]}>
            <For index='i' each='info' of={timeOptions}>
              <View key={i} style={styles.cell_box_info}>
                <Text style={dateStatus === info.value ? styles.cell_rowTitleText_today : styles.cell_rowTitleText_today1}
                  onPress={() => {
                    this.setRightDateStatus(info.value)
                  }}> {info.label} </Text>
              </View>
            </For>
          </View>
          <For of={profitAndLoss} each='item' index='idx'>
            <View style={styles.profitBox} key={idx}>
              <View style={styles.cell_box_info}>
                <Text style={[styles.cell_rowTitleTextR1]}>{item.store_name} </Text>
                <View style={cardStatus == 0 ? {flexDirection: "row", justifyContent: "space-between"} : {flexDirection: "column", alignItems: "center"}}>
                  <Text style={[styles.cell_rowTitleTextR2]}>毛利额/毛利率</Text>
                  <Text style={[cardStatus == 0 ? {fontSize: pxToDp(28)} : {fontSize: pxToDp(38), fontWeight: "bold"}, {color: colors.main_color, marginVertical: pxToDp(10)}]}>
                    ¥{item.good_profit}/{item.good_profit_ratio}%
                  </Text>
                </View>

                {cardStatus == 1 &&
                <View>
                  <View style={[styles.cardContent, {marginVertical: pxToDp(5)}]}>
                    <Text style={[styles.cell_rowTitleTextR4]}>订单总数 </Text>
                    <Text style={styles.cell_rowText}>{item.num_of_orders}单</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cell_rowTitleTextR4]}>亏损单占比 </Text>
                    <Text style={styles.cell_rowText}>{item.ratio} </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cell_rowTitleTextR4]}>平台结算金额 </Text>
                    <Text style={styles.cell_rowText}>{item.sum_of_total_income_from_platform}元</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cell_rowTitleTextR4]}>客单价 </Text>
                    <Text style={styles.cell_rowText}>{item.avg_income_from_platform}元</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cell_rowTitleTextR4]}>商品成本 </Text>
                    <Text style={styles.cell_rowText}>{item.goods_cost}元</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cell_rowTitleTextR4]}>三方配送成本 </Text>
                    <Text style={styles.catInfo} onPress={() => {
                      this.setState({
                        headerType: 1
                      })
                    }}>去查看 </Text>
                  </View>
                </View>
                }

                <View style={[cardStatus == 1 && styleLine, styles.cardContent]}>
                  <Text style={[styles.cell_rowTitleTextR3]}>盈亏明细</Text>
                  {cardStatus == 0 ? <Text style={styles.catBtn} onPress={() => this.setState({cardStatus: 1})}>展开</Text> : <Text style={styles.catBtn} onPress={() => this.setState({cardStatus: 0})}>关闭</Text>}
                </View>
              </View>
            </View>
          </For>
          <Dialog visible={showRightDateModal} onRequestClose={() => this.onRequestClose()}>
            {this.showDatePicker()}
          </Dialog>
        </ScrollView>
      )
    }
  }

  renderHeaderTab() {
    let {showHeader} = this.state
    if (showHeader) {
      return (
        <View style={styles.headerTab}>
          <Text onPress={() => {
              this.setState({
                headerType: 1,
                dateStatus: 0
              }, () => {
                this.setLeftDateStatus(0)
              })
            }}
            style={this.state.headerType === 1 ? [styles.header_text] : [styles.header_text, styles.check_staus]}>配送分析</Text>
          <Text
            onPress={() => {
              this.setState({
                headerType: 2,
                dateStatus: 0
              }, () => {
                this.setRightDateStatus(0)
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
    return <View>
      <TouchableOpacity style={styles.modalCancel} onPress={() => {
        let self = this
        self.state.timeType = "start";
        this.setState({
          showDateModal: true
        })
      }}>
        <Text style={styles.modalCancelText}>{this.state.startTime ? this.state.startTime : '开始时间'} </Text>
      </TouchableOpacity>
      <View style={styles.modalCancel}><Text style={styles.modalCancelText}>——</Text></View>
      <TouchableOpacity style={styles.modalCancel} onPress={() => {
        let self = this
        self.state.timeType = "end";
        this.setState({
          showDateModal: true
        })
      }}>
        <Text style={styles.modalCancelText}>{this.state.endTime ? this.state.endTime : '结束时间'} </Text>
      </TouchableOpacity>
      <DateTimePicker
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        date={new Date()}
        mode='date'
        isVisible={this.state.showDateModal}
        onConfirm={(value) => {
          let d = new Date(value)
          let resDate = d.getFullYear() + '-' + this.p((d.getMonth() + 1)) + '-' + this.p(d.getDate())
          let timeJs = 0
          if (this.state.timeType === 'start') {
            timeJs = Math.round(new Date(new Date(value).setHours(0, 0, 0, 0)).getTime() / 1000)
            this.setState({startNewDateValue: timeJs, showDateModal: false, startTime: resDate})
          } else if (this.state.timeType === 'end') {
            timeJs = Math.round(new Date(value).getTime() / 1000)
            this.setState({endNewDateValue: timeJs, showDateModal: false, endTime: resDate})
          }
        }
        }
        onCancel={() => {
          this.setState({
            showDateModal: false,
          });
        }}
      />
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
    let {startNewDateValue, endNewDateValue, analysis_by, headerType} = this.state
    if (analysis_by === Distribution_Analysis && headerType === 1) {
      this.getDistributionAnalysisData(startNewDateValue, endNewDateValue)
    } else {
      this.getProfitAndLossAnalysisData(startNewDateValue, endNewDateValue)
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
  headerTab: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.main_color,
    marginBottom: pxToDp(20)
  },
  cell_box: {
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  cell_box_header: {
    marginHorizontal: 10,
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  cell_box_info: {flexDirection: "column", marginVertical: pxToDp(20), padding: 10},
  cell_box1: {
    marginHorizontal: 10,
    borderRadius: pxToDp(10),
    backgroundColor: colors.white,
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  totalDelivery: {
    width: pxToDp(2),
    height: pxToDp(120),
    backgroundColor: colors.colorDDD,
    marginTop: pxToDp(20)
  },
  itemInfo: {width: pxToDp(356), flexDirection: "row", marginTop: pxToDp(20), paddingLeft: pxToDp(10)},
  tableItem: {
    width: pxToDp(356),
    flexDirection: "row",
    marginVertical: pxToDp(10),
    paddingLeft: pxToDp(10)
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
  cell_rowText: {
    fontSize: pxToDp(26),
    color: colors.title_color,
    marginVertical: pxToDp(10)
  },
  catInfo: {
    fontSize: pxToDp(30),
    fontWeight: "bold",
    color: colors.main_color,
    marginVertical: pxToDp(10)
  },
  catBtn: {
    fontSize: pxToDp(30),
    color: colors.main_color,
    marginVertical: pxToDp(20),
    marginRight: pxToDp(10)
  },
  cell_rowTitleText_today: {
    fontSize: pxToDp(28),
    color: colors.white,
    paddingHorizontal: pxToDp(40),
    backgroundColor: colors.main_color,
    paddingVertical: pxToDp(25),
    borderRadius: pxToDp(10)
  },
  cell_rowTitleText_today1: {
    fontSize: pxToDp(26),
    color: colors.title_color,
    paddingVertical: pxToDp(25),
    paddingHorizontal: pxToDp(15)
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
    marginTop: pxToDp(40),

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
    fontWeight: "bold",
    textAlign: 'center'
  },
  modalCancelText1: {
    color: colors.theme,
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
  profitBox: {
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: pxToDp(10),
    backgroundColor: colors.white
  },
  cardContent: {flexDirection: "row", justifyContent: "space-between"}
});

const Styles = StyleSheet.create({
  cell_rowTitleChecked: {
    backgroundColor: colors.main_color,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: pxToDp(20)
  },
  cell_rowTitleNoChecked: {
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: pxToDp(20)
  },
  scrollContainer: {backgroundColor: colors.main_back}
})

export default connect(mapStateToProps)(DistributionAnalysisScene)
