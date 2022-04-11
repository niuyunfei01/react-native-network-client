import React from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {TextareaItem} from '@ant-design/react-native';
import {Button} from "react-native-elements";
import {tool} from "../../../util";
import pxToDp from "../../../util/pxToDp";
import BaseComponent from "../../common/BaseComponent";
import native from "../../../util/native";
import HttpUtils from "../../../pubilc/util/http";
import ModalSelector from "react-native-modal-selector";
import $V from "../../../weui/variable";
import color from '../../../pubilc/styles/colors'
import Config from '../../../pubilc/common/config'
import {ToastShort} from "../../../pubilc/util/ToastUtils";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import colors from "../../../pubilc/styles/colors";
import { Input } from 'react-native-elements';
import Entypo from "react-native-vector-icons/Entypo";

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
      headerRight: () => {
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate(Config.ROUTE_INVENTORY_DETAIL, {storeId: store.id, productId})}
            style={{marginRight: 10}}>
            <FontAwesome5 name={'ellipsis-v'} style={{fontSize: 20}}/>
          </TouchableOpacity>
        )
      }
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
      <View style={{marginVertical: 10}}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10, marginTop: 10}}>
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
        <View style={{margin: 10}}>
          <Text style={{color: '#333333'}}>商品信息</Text>
        </View>
        <View style={styles.infoContainer}>
          {this.renderInfoItem('店铺名称', `${storeVendor}-${storeCity}-${storeName}`)}
          {this.renderInfoItem(`商品ID(#${productId})`, productName, `货架号:${shelfNo ? shelfNo : '无'}`)}
        </View>
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
      productName
    } = this.state
    return (
        <View style={{flex: 1}}>
      <ScrollView refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => this.fetchData()}/>
      }>
        {this.renderInfo()}
        <View style={cellStyles.cellTitle}>
          <Text style={cellStyles.cellsTitle}>商品库存</Text>
        </View>
        <View style={[styles.infoContainer, {flexDirection: "column"}]}>
          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingLeft: 5}}>
            <Text style={{fontWeight: "bold"}}>{productName}</Text>
            <TouchableOpacity onPress={() => this.props.navigation.navigate(Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
              productId: this.state.productId,
              storeId: this.state.storeId
            })}>
              <Text style={[styles.historyBtn]}>盘点历史</Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: "column", paddingLeft: 5}}>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10}}>
              <Text>剩余库存</Text>
              <Text>{`${String(remainNum)}件`}</Text>
            </View>
            <TouchableOpacity style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10}} onPress={() => this.toSearchUseOrders()}>
              <Text>待打包</Text>
              <View style={{flexDirection: "row"}}>
                <Text>{`${String(orderUse)}件`}</Text>
                <Entypo name='chevron-thin-right' style={{fontSize: 16, fontWeight: "bold", color: colors.color666}}/>
              </View>
            </TouchableOpacity>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, paddingTop: 10}}>
              <Text>理论库存</Text>
              <Text>{`${String(totalRemain)}件`}</Text>
            </View>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 10}}>
              <Text>实际库存</Text>
              <Input
                  containerStyle={{width: 100}}
                  inputStyle={{fontSize: 14, textAlign: "center"}}
                  value={String(actualNum)}
                  type='number'
                  placeholder="请输入实际库存"
                  clear
                  onChange={(actualNum) => this.setState({actualNum})}
                  rightIcon={<Text>件</Text>}
              />
            </View>
            <If condition={actualNum != totalRemain}>
              <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 10}}>
                <Text>备注</Text>
                <ModalSelector
                    onChange={(option) => this.setState({checkType: option})}
                    cancelText={'取消'}
                    data={this.state.checkTypes}
                >
                  <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, paddingTop: 10}}>
                    <Text>原因</Text>
                    <Text>{this.state.checkType.label}</Text>
                  </View>
                </ModalSelector>
                <TextareaItem
                    rows={5}
                    count={100}
                    onChange={(remark) => this.setState({remark})}
                />
              </View>
            </If>
          </View>
        </View>
      </ScrollView>
      <Button buttonStyle={{backgroundColor: '#59B26A', height: pxToDp(70)}}
              titleStyle={{color: colors.white, fontSize: 18}} title='提交'
              onPress={() => this.handleSubmit()} />
      </View>
    )
  }
}


export default connect(mapStateToProps)(StockCheck)

const styles = StyleSheet.create({
  infoContainer: {
    width: '98%',
    paddingHorizontal: pxToDp(15),
    backgroundColor: '#fff',
    borderRadius: 5,
    marginLeft: '1%'
  },
  infoItem: {
    marginVertical: pxToDp(10)
  },
  infoLabel: {
    fontSize: pxToDp(28),
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
    color: '#333333',
  }
})
