import React from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {Button, InputItem, List, TextareaItem, WhiteSpace} from '@ant-design/react-native';
import {tool} from "../../common";
import JbbCellTitle from "../component/JbbCellTitle";
import pxToDp from "../../util/pxToDp";
import BaseComponent from "../BaseComponent";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import HttpUtils from "../../pubilc/util/http";
import ModalSelector from "react-native-modal-selector";
import $V from "../../weui/variable";
import color from '../../widget/color'
import C from '../../pubilc/common/config'
import Config from '../../pubilc/common/config'
import {ToastShort} from "../../pubilc/util/ToastUtils";
import colors from "../../pubilc/styles/colors";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

class StockCheck extends BaseComponent {
  constructor(props: Object) {
    super(props);
    const store = tool.store(this.props.global)
    this.state = {
      productId: this.props.route.params.productId,
      storeId: store.id,
      storeName: store.name,
      storeCity: store.city,
      storeVendor: store.vendor,
      productName: this.props.route.params.productName,
      shelfNo: this.props.route.params.shelfNo,
      remainNum: 0,
      orderUse: 0,
      totalRemain: 0,
      actualNum: 0,
      remark: '',
      submitting: false,
      productInfo: {},
      checkTypes: [],
      checkType: {},
      loading: false
    }

    this.navigationOptions(this.props)
  }

  navigationOptions = ({navigation, global, route}) => {
    const store = tool.store(global)
    const productId = route.params.productId
    navigation.setOptions({
      headerRight: () => (<View style={{height: pxToDp(60), flexDirection: "row", justifyContent: "flex-end", alignItems: "center"}}>
          <NavigationItem
            iconStyle={{tintColor: colors.color333, width: pxToDp(28), height: pxToDp(28), marginRight: 16}}
            icon={require('../../img/more_vert.png')}
            onPress={() => {
              navigation.navigate(Config.ROUTE_INVENTORY_DETAIL, {storeId: store.id, productId});
            }}/>
        </View>
      )
    })
  }

  componentDidMount() {
    this.fetchData()
    this.fetchStockCheckType()
  }

  fetchData() {
    const self = this
    const api = `api_products/inventory_check_info?access_token=${this.props.global.accessToken}`
    self.setState({loading: true})
    HttpUtils.get.bind(self.props)(api, {
      productId: this.props.route.params.productId,
      storeId: self.state.storeId
    }).then(res => {
      self.setState({
        productInfo: res,
        remainNum: res.left_since_last_stat,
        orderUse: res.orderUse,
        totalRemain: res.totalRemain,
        actualNum: res.totalRemain,
        loading: false
      })
    })
  }

  fetchStockCheckType() {
    const self = this
    const api = `api_products/inventory_check_types?access_token=${this.props.global.accessToken}`
    HttpUtils.get.bind(self.props)(api, {}).then(res => {
      self.setState({checkTypes: res})
    })
  }

  handleSubmit() {
    const self = this
    const {global, navigation} = self.props;
    const api = `api_products/inventory_check?access_token=${global.accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      storeId: this.state.storeId,
      productId: this.state.productId,
      remainNum: this.state.remainNum,
      orderUse: this.state.orderUse,
      totalRemain: this.state.totalRemain,
      actualNum: this.state.actualNum,
      differenceType: this.state.checkType.value,
      remark: this.state.remark
    }).then(res => {
      ToastShort(`#${self.state.productId} 实际库存 ${self.state.actualNum}`)
      navigation.goBack()
    }).catch(e => {
      if (e.obj == 'THEORY_NUM_CHANGED') {
        self.fetchData()
      }
    })
  }

  toSearchUseOrders() {
    const useOrderIds = this.state.productInfo.useOrderIds
    if (!useOrderIds || !useOrderIds.length) {
      ToastShort('无占用订单')
      return
    }

    let searchStr = 'id:' + useOrderIds.join(',')
    native.ordersSearch(searchStr)
  }

  renderInfoItem(label, value, extra = '') {
    return (
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{label}：</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text>{value} </Text>
          <Text>{extra} </Text>
        </View>
      </View>
    )
  }

  renderInfo() {
    const {storeName, storeCity, storeVendor, productName, shelfNo, productId} = this.state
    return (
      <View>
        <JbbCellTitle>商品信息</JbbCellTitle>
        <View style={styles.infoContainer}>
          {this.renderInfoItem('店铺名称', `${storeVendor}-${storeCity}-${storeName}`)}
          {this.renderInfoItem(`商品(ID:${productId})`, productName, `货架号:${shelfNo ? shelfNo : '无'}`)}
        </View>
      </View>
    )
  }

  renderFormHeader() {
    return (
      <View style={cellStyles.cellTitle}>
        <Text style={cellStyles.cellsTitle}>商品库存</Text>
        <TouchableOpacity onPress={() => this.props.navigation.navigate(C.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
          productId: this.state.productId,
          storeId: this.state.storeId
        })}>
          <Text style={[cellStyles.cellsTitle, styles.historyBtn]}>盘点历史</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const {
      remainNum = 0,
      orderUse = 0,
      totalRemain = 0,
      actualNum = 0,
      loading = false,
      productInfo = {}
    } = this.state
    return (
      <ScrollView refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => this.fetchData()}/>
      }>
        {this.renderInfo()}
        <WhiteSpace/>
        <List renderHeader={this.renderFormHeader()}>
          <List.Item
            extra={`${String(remainNum)}件`}
          >剩余库存</List.Item>
          <List.Item
            arrow={'horizontal'}
            extra={`${String(orderUse)}件`}
            onPress={() => this.toSearchUseOrders()}
          >待打包</List.Item>
          <List.Item
            extra={`${String(totalRemain)}件`}
          >理论库存</List.Item>
        </List>
        <WhiteSpace/>
        <List>
          <InputItem
            value={String(actualNum)}
            defaultValue={String(actualNum)}
            type='number'
            placeholder="请输入实际库存"
            onVirtualKeyboardConfirm={v => console.log('onVirtualKeyboardConfirm:', v)}
            clear
            extra={'件'}
            onChange={(actualNum) => this.setState({actualNum})}
          >实际库存</InputItem>
        </List>
        <WhiteSpace/>

        <If condition={actualNum != totalRemain}>
          <List renderHeader={() => '备注'}>
            <ModalSelector
              onChange={(option) => this.setState({checkType: option})}
              cancelText={'取消'}
              data={this.state.checkTypes}
            >
              <List.Item arrow={'horizontal'} extra={this.state.checkType.label}>原因</List.Item>
            </ModalSelector>
            <TextareaItem
              rows={5}
              count={100}
              onChange={(remark) => this.setState({remark})}
            />
          </List>
        </If>
        <WhiteSpace/>
        <Button type="primary" onPress={() => this.handleSubmit()}>提交</Button>
      </ScrollView>
    )
  }
}


export default connect(mapStateToProps)(StockCheck)

const styles = StyleSheet.create({
  infoContainer: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: '#fff'
  },
  infoItem: {
    marginVertical: pxToDp(10)
  },
  infoLabel: {
    fontSize: pxToDp(26),
    fontWeight: 'bold'
  },
  historyBtn: {
    fontSize: 12,
    color: color.theme
  }
})

const cellStyles = StyleSheet.create({
  cellTitle: {
    paddingBottom: pxToDp(10),
    backgroundColor: '#f5f5f9',
    borderBottomColor: '#ddd',
    borderBottomWidth: pxToDp(1),
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: pxToDp(80),
    width: '100%'
  },
  cellsTitle: {
    marginTop: $V.weuiCellTipsFontSize * 0.77 + (14 * $V.baseLineHeight - 14) * 0.5,
    paddingLeft: $V.weuiCellGapH,
    paddingRight: $V.weuiCellGapH,
    fontSize: $V.weuiCellTipsFontSize,
    color: $V.globalTextColor,
  }
})
