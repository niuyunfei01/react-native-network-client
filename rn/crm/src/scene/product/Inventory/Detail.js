import BaseComponent from "../../common/BaseComponent";
import {connect} from "react-redux";
import React from "react";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import HttpUtils from "../../../pubilc/util/http";
import pxToDp from "../../../pubilc/util/pxToDp";
import EmptyData from "../../common/component/EmptyData";
import dayjs from "dayjs";
import colors from "../../../pubilc/styles/colors";
import Entypo from "react-native-vector-icons/Entypo";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import ModalSelector from "../../../pubilc/component/ModalSelector";
import DateTimePicker from "react-native-modal-datetime-picker";
import {hideModal, showModal, ToastShort} from "../../../pubilc/util/ToastUtils";

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
      datePickerDialog: false,
      dateHtp: dayjs(new Date()).format('YYYY-MM-DD'),
      activity: 'specifications_one',
      rules: {
        sku_id: 0,
        sku_name: '全部规格'
      },
      rulesArray: []
    }

    this.navigationOptions(this.props)
  }

  headerRight = () => {
    const {date} = this.state
    return (
      <TouchableOpacity style={styles.navigationBtn} onPress={() => {
        this.setState({datePickerDialog: true})
      }}>
        <Text>{dayjs(date).format('YYYY-MM-DD')} </Text>
        <Entypo name='chevron-down' style={styles.navigationIcon}/>
      </TouchableOpacity>
    )
  }

  navigationOptions = () => {
    const {navigation} = this.props
    const option = {headerRight: () => this.headerRight()}
    navigation.setOptions(option);
  }

  componentDidMount() {
    this.navigationOptions()
    this.fetchData()
  }

  fetchData = (val) => {
    showModal('加载中')
    const {productId, storeId} = this.props.route.params
    let {dateHtp} = this.state
    const uri = `/api_products/inventory_detail_history?access_token=${this.props.global.accessToken}`
    this.setState({isLoading: true})
    let params = {
      productId,
      storeId,
      page: val ? 1 : this.state.page,
      date: dateHtp,
      sku_id: val ? val.id : '',
      pageSize: 20
    }
    HttpUtils.get.bind(this.props)(uri, params).then(res => {
      hideModal()
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
      hideModal()
    })
  }

  onRefresh = () => {
    this.setState({page: 1}, () => this.fetchData())
  }

  onRequestClose = () => {
    this.setState({
      datePickerDialog: false
    })
  }

  onConfirmDate = (date) => {
    this.setState({datePickerDialog: false, dateHtp: dayjs(date).format('YYYY-MM-DD'), date: date}, () => {
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

  showDatePicker = () => {
    let {date, datePickerDialog} = this.state
    return <View style={{backgroundColor: colors.white}}>
      <DateTimePicker
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        customHeaderIOS={() => {
          return (<View/>)
        }}
        date={date}
        mode='date'
        isVisible={datePickerDialog}
        onConfirm={(date) => this.onConfirmDate(date)}
        onCancel={() => this.onRequestClose()}
      />
    </View>
  }

  renderSelectHeader = () => {
    let {rules, rulesArray} = this.state
    return (
      <View style={styles.selectHeader}>
        <View style={styles.selectHeaderContent}>
          <ModalSelector onChange={value => this.fetchData(value)}
                         data={rulesArray}
                         skin="customer"
                         defaultKey={-999}>
            <Text style={styles.selectHeaderText}>
              {rules.sku_name}
            </Text>
          </ModalSelector>
          <Entypo name='chevron-down' style={styles.navigationIcon}/>
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
    if (item.name && item.name.length >= 17) {
      item.name = item.name.substring(0, 17) + '...'
    }
    return (
      <View style={styles.item}>
        <View style={styles.itemRow}>
          <Text style={styles.itemRowText}> 商品：{item.name} </Text>
          <Text style={styles.itemRowText}> 规格：{item.sku_name} </Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemRowText}>操作时间：{item.updated} </Text>
          <If condition={item.operator_user}>
            <Text style={styles.itemRowText}>操作人：{item.operator_user.nickname} </Text>
          </If>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemRowText}>操作类型：{item.operate_type} </Text>
          <Text style={styles.itemRowText}> 库存变动 {item.num > 0 ? `+${item.num}` : item.num} </Text>
          <Text style={styles.itemRowText}>库存：{item.stock} </Text>
        </View>
        <If condition={item.remark}>
          <View style={styles.itemRow}>
            <Text style={styles.itemRowText}>备注信息：{item.remark} </Text>
          </View>
        </If>
      </View>
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
        {this.showDatePicker()}
      </View>
    )
  }
}

export default connect(mapStateToProps)(Detail)

const styles = StyleSheet.create({
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
  tabText: {color: colors.title_color},
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
