import BaseComponent from "../../common/BaseComponent";
import {connect} from "react-redux";
import React from "react";
import {FlatList, StyleSheet, Text, View} from "react-native";
import HttpUtils from "../../../pubilc/util/http";
import pxToDp from "../../../pubilc/util/pxToDp";
import EmptyData from "../../common/component/EmptyData";
import dayjs from "dayjs";
import colors from "../../../pubilc/styles/colors";
import Entypo from "react-native-vector-icons/Entypo";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import {hideModal, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";
import tool from "../../../pubilc/util/tool";
import PopPicker from "rmc-date-picker/lib/Popup";
import DatePicker from "rmc-date-picker/lib/DatePicker";
import zh_CN from "rmc-date-picker/lib/locale/zh_CN";
import styles from 'rmc-picker/lib/PopupStyles';

const width = Dimensions.get("window").width;

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class Detail extends BaseComponent {

  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      lists: [],
      isLastPage: false,
      isLoading: false,
      date: new Date(),
      dateHtp: dayjs(new Date()).format('YYYY-MM'),
      activity: 'specifications_one',
      rules: {
        sku_id: 0,
        sku_name: '全部规格'
      },
      rulesArray: [],
      start_day: this.format(new Date()),
      date_type: 1
    }

    this.navigationOptions(this.props)
  }

  onChange = (date) => {
    this.setState({date: date, start_day: this.format(date)}, function () {
      if (this.state.choseTab === 1) {
        this.fetchExpenses();
      } else {
        this.fetchRechargeRecord();
      }
    })
  }

  onDismiss = () => {

  }

  format = (date) => {
    let month = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    return `${date.getFullYear()}-${month}`;
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.renderModal()}
    navigation.setOptions(option);
  }

  componentDidMount() {
    this.navigationOptions()
    this.fetchData()
  }

  fetchData = (val) => {
    const {productId, storeId} = this.props.route.params
    let {dateHtp, date_type, rules} = this.state
    const uri = `/api_products/inventory_detail_history?access_token=${this.props.global.accessToken}`
    this.setState({isLoading: true})
    let params = {
      productId,
      storeId,
      page: val ? 1 : this.state.page,
      date: dateHtp,
      sku_id: rules.sku_id ? rules.sku_id : 0,
      pageSize: 20,
      date_type: date_type
    }
    HttpUtils.get.bind(this.props)(uri, params).then(res => {

      const lists = (this.state.page === 1 ? [] : this.state.lists).concat(res.lists)
      const skus_arr = []
      skus_arr.push({id: '0', label: '全部规格'})
      res.skus && res.skus.map(item => {
        skus_arr.push({id: item.sku_id, label: item.sku_name})
      })
      this.setState({
        isLastPage: res.isLastPage,
        lists: lists,
        isLoading: false,
        rulesArray: skus_arr
      })
    }).catch(() => {

      this.setState({isLoading: false})
    })
  }

  onRefresh = () => {
    this.setState({
      page: 1,
      rules: {
        sku_id: 0,
        sku_name: '全部规格'
      }
    }, () => this.fetchData())
  }

  onConfirmDate = (date) => {
    this.setState({
      dateHtp: dayjs(date).format('YYYY-MM'),
      date: date,
      start_day: dayjs(date).format('YYYY-MM')
      }, () => {
      this.navigationOptions()
      this.setState({page: 1}, () => this.fetchData())
    })
  }

  onEndReached = () => {
    const {isLastPage, page} = this.state
    if (isLastPage) {
      ToastShort("暂无更多数据")
      return;
    }
    this.setState({page: page + 1})
    this.fetchData()
  }

  renderSelectHeader = () => {
    let {rules, rulesArray} = this.state
    return (
      <View style={Styles.selectHeader}>
        <View style={Styles.selectHeaderContent}>
          <ModalSelector onChange={value => {
            this.setState({
              rules: {
                sku_id: value.id,
                sku_name: value.label
              }
            }, () => this.fetchData(value))
          }}
                         data={rulesArray}
                         skin="customer"
                         defaultKey={-999}>
            <Text style={Styles.selectHeaderText}>
              {rules.sku_name}
            </Text>
          </ModalSelector>
          <Entypo name='chevron-down' style={Styles.navigationIcon}/>
        </View>
      </View>
    )
  }

  renderListBox = () => {
    let {isLoading, lists} = this.state
    return (
      <FlatList data={lists}
                style={{marginBottom: 10}}
                onEndReachedThreshold={0.1}
                onEndReached={this.onEndReached}
                onRefresh={this.onRefresh}
                refreshing={isLoading}
                initialNumToRender={5}
                renderItem={(item) => this.renderItem(item)}
                keyExtractor={(item, index) => `${index}`}
      />
    )
  }

  renderItem = (val) => {
    let {item} = val
    return (
      <View style={Styles.item}>
        <View style={Styles.itemRow}>
          <Text style={Styles.itemRowText}> 商品：{tool.jbbsubstr(item.name, 17)} </Text>
          <Text style={Styles.itemRowText}> 规格：{item.sku_name} </Text>
        </View>
        <View style={Styles.itemRow}>
          <Text style={Styles.itemRowText}>操作时间：{item.updated} </Text>
          <If condition={item.operator_user}>
            <Text style={Styles.itemRowText}>操作人：{item.operator_user.nickname} </Text>
          </If>
        </View>
        <View style={Styles.itemRow}>
          <Text style={Styles.itemRowText}>操作类型：{item.operate_type} </Text>
          <Text style={Styles.itemRowText}> 库存变动 {item.num > 0 ? `+${item.num}` : item.num} </Text>
          <Text style={Styles.itemRowText}>库存：{item.stock} </Text>
        </View>
        <If condition={item.remark}>
          <View style={Styles.itemRow}>
            <Text style={Styles.itemRowText}>备注信息：{item.remark} </Text>
          </View>
        </If>
      </View>
    )
  }

  renderModal = () => {
    let {date, start_day} = this.state;
    const datePicker = (
      <DatePicker
        rootNativeProps={{'data-xx': 'yy'}}
        minDate={new Date(2015, 8, 15, 10, 30, 0)}
        maxDate={new Date()}
        defaultDate={date}
        mode="month"
        locale={zh_CN}
      />
    );
    return (
      <PopPicker
        datePicker={datePicker}
        transitionName="rmc-picker-popup-slide-fade"
        maskTransitionName="rmc-picker-popup-fade"
        styles={styles}
        title={'选择月份'}
        okText={'确认'}
        dismissText={'取消'}
        date={date}
        onDismiss={this.onDismiss}
        onChange={this.onConfirmDate}
      >
        <Text style={Styles.selectMonthText}> {start_day} <Entypo
          name='chevron-thin-down' style={Styles.selectMonthIcon}/></Text>
      </PopPicker>
    )
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.renderSelectHeader()}
        <If condition={this.state.lists.length}>
          {this.renderListBox()}
        </If>
        <If condition={!this.state.lists.length}>
          <EmptyData/>
        </If>
      </View>
    )
  }
}

export default connect(mapStateToProps)(Detail)

const Styles = StyleSheet.create({
  selectMonthText: {
    color: colors.color111,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
    textAlign: 'right'
  },
  selectMonthIcon: {fontSize: 18, marginHorizontal: 10, color: colors.color333},
  expensesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: colors.white,
    borderBottomWidth: pxToDp(1),
    borderColor: '#ccc',
    paddingVertical: pxToDp(25),
    paddingHorizontal: pxToDp(30),
    zIndex: 999,
  },
  item: {
    paddingHorizontal: pxToDp(20),
    backgroundColor: '#fff',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: colors.fontGray,
    marginVertical: pxToDp(5)
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: pxToDp(10),
  },
  itemRowText: {
    fontSize: 12
  },
  tab: {flex: 1, alignItems: "center", justifyContent: "center", padding: 10},
  tabActivity: {
    flex: 1,
    borderBottomColor: colors.main_color,
    borderBottomWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 10
  },
  tabText: {color: colors.color111},
  tabTextActivity: {color: colors.main_color},
  navigationBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10
  },
  navigationIcon: {fontSize: 22, color: '#000000'},
  selectHeader: {
    width: width,
    height: pxToDp(70),
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.colorEEE,
    marginBottom: 5
  },
  selectHeaderContent: {flexDirection: "row", alignItems: "center"},
  selectHeaderText: {color: colors.color333, fontSize: 16}
})
