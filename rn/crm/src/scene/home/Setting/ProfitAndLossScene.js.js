import React, {PureComponent} from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity, FlatList, Image, Dimensions, InteractionManager
} from 'react-native';
import {connect} from "react-redux";
import colors from "../../../pubilc/styles/colors";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import Entypo from "react-native-vector-icons/Entypo";
import tool from "../../../pubilc/util/tool";
import {showError, ToastLong, ToastShort} from "../../../pubilc/util/ToastUtils";
import HttpUtils from "../../../pubilc/util/http";
import pxToDp from "../../../pubilc/util/pxToDp";
import numeral from "numeral";
import Clipboard from "@react-native-community/clipboard";
import Config from "../../../pubilc/common/config";
import JbbModal from "../../../pubilc/component/JbbModal";
import DateTimePicker from "react-native-modal-datetime-picker";

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class ProfitAndLoss extends PureComponent {
  constructor(props) {
    super(props);
    const {currStoreId} = this.props.global;
    const params = this.props.route.params?.info
    this.state = {
      storeId: currStoreId,
      ext_store_id: 0,
      selectTipStore: '全部门店',
      head_store: [
        {label: "全部门店", key: 0}
      ],
      order_type: 1,
      selectTipOrder: '全部订单',
      head_order: [
        {label: '全部订单', key: 1},
        {label: '盈亏订单', key: 2}
      ],
      profitList: [],
      isRefreshing: false,
      query: {
        page: 1,
        pageSize: 20
      },
      count: 0,
      isLastPage: false,
      isCanLoadMore: false,
      isLoading: false,
      startDate: tool.fullDay(params.start_time * 1000),
      endDate: tool.fullDay(params.end_time * 1000),
      showDateModalStart: false,
      showDateModalEnd: false,
      showModal: false
    }
  }

  componentDidMount = () => {
    this.get_profit_list()
    this.getExtStoreList()
  }

  get_profit_list = () => {
    const {accessToken} = this.props.global;
    let {storeId, startDate, endDate, ext_store_id, order_type} = this.state;
    const api = `/v1/new_api/analysis/profit_detail_data/${storeId}`
    HttpUtils.get.bind(this.props)(api, {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      order_type: order_type,
      ext_store_id: ext_store_id
    }).then(profit_info => {
      this.setState({
        profitList: profit_info.data.lists,
        count: profit_info.data.count,
        isLastPage: profit_info.data.isLastPage,
        query: {
          page: profit_info.data.page,
          pageSize: profit_info.data.pageSize
        }
      })
    }).catch(() => {
    })
  }

  getExtStoreList = () => {
    const {global} = this.props
    const {accessToken, currStoreId} = global
    const {head_store} = this.state

    const api = `/v1/new_api/added/ext_store_list/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get(api).then(list => {
      const lists = head_store
      Object.keys(list).map(key => {
        lists.push({
          label: list[key].name,
          key: list[key].id
        })
      })
      this.setState({
        head_store: this.formatArr(lists)
      })
    }).catch(error => showError(error.reason))
  }

  formatArr (arr) {
    let map = new Map()
    for (let item of arr) {
      if (!map.has(item)) {
        map.set(item, item)
      }
    }
    return [...map.values()]
  }

  onMomentumScrollBegin = () => {
    this.setState({
      isCanLoadMore: true
    })
  }

  onEndReached() {
    const {query, isLastPage} = this.state;
    if (isLastPage) {
      ToastShort('没有更多数据了')
      return null
    }
    query.page += 1
    this.setState({query}, () => {
      this.get_profit_list()
    })
  }

  onRefresh = () => {
    tool.debounces(() => {
      let query = this.state.query;
      query.page = 1;
      this.setState({
        isLastPage: false,
        query: query,
        profitList: []
      }, () => {
        this.get_profit_list()
      })
    }, 600)
  }

  copyToClipboard = (val) => {
    Clipboard.setString(val)
    ToastLong('已复制到剪切板')
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  navigateToOrderInfoDetail = (id) => {
    this.onPress(Config.ROUTE_ORDER_NEW, {
      orderId: id
    })
  }

  checkDatePicker = (date) => {
    let {showDateModalStart} = this.state;
    if (showDateModalStart) {
      this.setState({
        startDate: tool.fullDay(date),
        showDateModalStart: false
      })
    } else {
      this.setState({
        endDate: tool.fullDay(date),
        showDateModalEnd: false
      })
    }
  };

  closeModalStart = () => {
    this.setState({
      showDateModalStart: false
    })
  }

  closeModalEnd = () => {
    this.setState({
      showDateModalEnd: false,
      showModal: false
    })
  }

  closeModal = () => {
    this.setState({
      showModal: false
    })
  }

  renderHeaderTab = () => {
    let {head_store, selectTipStore, head_order, selectTipOrder, startDate, endDate} = this.state;
    return (
      <View style={styles.header}>
        <ModalSelector skin="customer" data={head_store}
                       onChange={option => this.setState({ext_store_id: option.key, selectTipStore: option.label}, () => this.get_profit_list())}>
          <View style={styles.flexRow}>
            <Text style={styles.selectTipText}>
              {selectTipStore}
            </Text>
            <Entypo name="chevron-thin-right" style={styles.selectTipText}/>
          </View>
        </ModalSelector>
        <ModalSelector skin="customer" data={head_order}
                       onChange={option => this.setState({order_type: option.key, selectTipOrder: option.label}, () => this.get_profit_list())}>
          <View style={styles.flexRow}>
            <Text style={styles.selectTipText}>
              {selectTipOrder}
            </Text>
            <Entypo name="chevron-thin-right" style={styles.selectTipText}/>
          </View>
        </ModalSelector>
        <TouchableOpacity style={styles.flexRow} onPress={() => this.setState({showModal: true})}>
          <If condition={startDate !== '' || endDate !== ''}>
            <Text style={styles.selectTipText}>
              {startDate}
            </Text>
            <If condition={endDate !== ''}>
              <Text style={styles.selectTipText}>
                至
              </Text>
            </If>
            <Text style={styles.selectTipText}>
              {endDate}
            </Text>
          </If>
          <If condition={startDate === '' && endDate === ''}>
            <Text style={styles.selectTipText}>
              请选择时间
            </Text>
          </If>
          <Entypo name="chevron-thin-right" style={styles.selectTipText}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderDatePickerStart = () => {
    let {showDateModalStart} = this.state;
    return (
      <DateTimePicker
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        date={new Date()}
        mode='date'
        isVisible={showDateModalStart}
        onConfirm={
          (date) => {
            this.checkDatePicker(date)
          }
        }
        onCancel={() => {
          this.setState({
            showDateModalStart: false,
          });
        }}
      />
    )
  }

  renderDatePickerEnd = () => {
    let {showDateModalEnd} = this.state;
    return (
      <DateTimePicker
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        date={new Date()}
        mode='date'
        isVisible={showDateModalEnd}
        onConfirm={
          (date) => {
            this.checkDatePicker(date)
          }
        }
        onCancel={() => {
          this.setState({
            showDateModalEnd: false,
          });
        }}
      />
    )
  }

  renderProfitList = () => {
    let {profitList, isCanLoadMore, isLoading} = this.state;
    return (
      <FlatList
        data={profitList}
        renderItem={this.renderProfitItem}
        onRefresh={this.onRefresh}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          if (isCanLoadMore) {
            this.onEndReached();
            this.setState({isCanLoadMore: false})
          }
        }}
        onMomentumScrollBegin={this.onMomentumScrollBegin}
        refreshing={isLoading}
        keyExtractor={(item, index) => `${index}`}
        ListEmptyComponent={this.listEmptyComponent()}
        initialNumToRender={5}
      />
    )
  }

  renderProfitItem = (info) => {
    let {item, index} = info
    return (
      <TouchableOpacity style={[styles.orderInfoCard, {marginTop: 10}]} key={index} onPress={() => this.navigateToOrderInfoDetail(item?.id)}>
        <View style={styles.orderCardHeader}>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <Image
              source={{uri: item?.platformIcon}}
              style={styles.orderCardIcon}/>
            <View style={styles.orderCardInfo}>
              <Text style={styles.orderCardInfoTop}># {item?.dayId} </Text>
              <Text style={styles.orderCardInfoBottom}>{item?.ext_store_name} </Text>
            </View>
          </View>
          <Entypo name="chevron-thin-right" style={styles.selectTipText}/>
        </View>
        <View style={styles.orderCardContent}>
          <View style={styles.flexRow}>
            <View style={{flex: 1}}>
              <View style={styles.flexRow1}>
                <Text style={[styles.orderCardItemLabel, {marginVertical: 5}]}>毛利：</Text>
                <Text style={styles.orderCardItemValue}>{numeral(item?.good_profit).format('0.00')}元 </Text>
              </View>
              <View style={styles.flexRow1}>
                <Text style={[styles.orderCardItemLabel, {marginVertical: 5}]}>平台结算：</Text>
                <Text style={styles.orderCardItemValue}>{numeral(item?.bill.total_income_from_platform / 100).format('0.00')}元 </Text>
              </View>
            </View>
            <View style={{flex: 1}}>
              <View style={styles.flexRow1}>
                <Text style={[styles.orderCardItemLabel, {marginVertical: 5}]}>毛利率：</Text>
                <Text style={styles.orderCardItemValue}>{numeral(item?.good_profit_rate).format('0.00')}% </Text>
              </View>
              <View style={styles.flexRow1}>
                <Text style={[styles.orderCardItemLabel, {marginVertical: 5}]}>运费：</Text>
                <Text style={styles.orderCardItemValue}>{numeral(item?.ship_fee_outcome).format('0.00')}元 </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.cuttingLine}/>
        <TouchableOpacity style={styles.orderCardContent} onPress={() => this.copyToClipboard(item?.platformId)}>
          <View style={styles.flexRow1}>
            <Text style={[styles.orderCardItemLabel, {marginVertical: 5}]}>平台单号：</Text>
            <Text style={styles.orderCardItemValue}>{item?.platform_oid} </Text>
          </View>
          <Text style={styles.copyText}>复制 </Text>
        </TouchableOpacity>
        <View style={styles.orderCardLength}>
          <View style={styles.flexRow1}>
            <Text style={styles.orderCardItemLabel}>下单时间：</Text>
            <Text style={styles.orderCardItemValue}>{item?.orderTime} </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  listEmptyComponent = () => {
    let {isLoading} = this.state;
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', height: 300}}>
        <If condition={!isLoading}>
          <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/WSB-V4.0/%E6%9A%82%E6%97%A0%E8%AE%A2%E5%8D%95%403x.png'}}
                 style={{width: 100, height: 100, marginBottom: 20}}/>
          <Text style={{fontSize: 18, color: colors.b2}}>
            暂无数据
          </Text>
        </If>
      </View>
    )
  }

  renderModal = () => {
    let {showModal, startDate, endDate} = this.state;
    return (
      <JbbModal visible={showModal} onClose={() => this.closeModal()} modal_type={'bottom'}
                modalStyle={{padding: 0}}
      >
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 50,
          marginHorizontal: 30
        }}>
          <Text style={{fontSize: 18, fontWeight: '500', color: colors.color333}}>时间选择</Text>
          <Text style={{fontSize: 16, fontWeight: '400', color: colors.main_color, padding: 10}} onPress={() => {
            this.setState({showModal: false})
            this.get_profit_list()
          }}>确定</Text>
        </View>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          height: 70
        }}>
          <TouchableOpacity onPress={() => {
            this.setState({showDateModalStart: true})
          }}>
            <Text>{startDate !== '' ? startDate : '开始时间'} </Text>
          </TouchableOpacity>
          <Text>-</Text>
          <TouchableOpacity onPress={() => this.setState({showDateModalEnd: true})}>
            <Text>{endDate !== '' ? endDate : '结束时间'} </Text>
          </TouchableOpacity>
          {this.renderDatePickerStart()}
          {this.renderDatePickerEnd()}
        </View>
      </JbbModal>
    )
  }

  render = () => {
    return (
      <View style={{flex: 1}}>
        {this.renderHeaderTab()}
        {this.renderProfitList()}
        {this.renderModal()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.white,
    height: 50
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  flexRow1: {
    flexDirection: "row",
    alignItems: "center"
  },
  selectTipText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333,
    lineHeight: 17
  },
  orderInfoCard: {
    width: width * 0.94,
    backgroundColor: colors.white,
    marginLeft: width * 0.03,
    borderRadius: 6,
    marginBottom: 10
  },
  orderCardHeader: {
    width: width * 0.94,
    height: 65,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  orderCardIcon: {width: 40, height: 40, borderRadius: 24},
  orderCardInfo: {
    flexDirection: "column",
    marginLeft: 11
  },
  orderCardInfoTop: {fontSize: 16, fontWeight: '500', color: colors.color333, marginBottom: pxToDp(5)},
  orderCardInfoBottom: {fontSize: 12, fontWeight: '400', color: colors.color666},
  orderCardContainer: {
    width: width * 0.90,
    backgroundColor: colors.white,
    padding: 12
  },
  orderCardContent: {
    width: width * 0.94,
    backgroundColor: colors.white,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  orderCardItemLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color999
  },
  orderCardItemValue: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.color333
  },
  cuttingLine: {
    backgroundColor: colors.e5,
    height: 0.5,
    width: width * 0.86,
    marginLeft: width * 0.03
  },
  copyText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.main_color
  },
  orderCardLength: {
    width: width * 0.94,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  }
});

export default connect(mapStateToProps)(ProfitAndLoss)
