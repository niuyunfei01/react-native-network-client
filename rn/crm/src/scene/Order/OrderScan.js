import BaseComponent from "../BaseComponent";
import React from "react";
import {DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from 'react-redux'
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import OrderList from "./_OrderScan/OrderList";
import {ToastShort} from "../../util/ToastUtils";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import config from '../../config'
import EmptyData from "../component/EmptyData";
import Moment from 'moment'

let footerHeight = pxToDp(80);

function mapStateToProps (state) {
  const {global, user, mine} = state;
  return {global, user, mine};
}

class OrderScan extends BaseComponent {
  static navigationOptions = () => {
    return {
      headerStyle: {backgroundColor: '#59b26a', height: 40},
      headerTitleStyle: {color: '#fff', fontSize: 16},
      headerTitle: '订单过机',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.toOrders()}
        />
      )
    }
  };
  
  constructor (props) {
    super(props);
    this.state = {
      currentOrder: {},
      isLoading: false,
      scanEnough: false,
    }
  }
  
  componentWillMount () {
    const self = this;
    // 监听扫描订单条码
    if (this.listenScanBarCode) {
      this.listenScanBarCode.remove()
    }
    this.listenScanBarCode = DeviceEventEmitter.addListener(config.Listener.KEY_SCAN_ORDER_BAR_CODE, function ({orderId}) {
      console.log('scan bar code listener => order id :', orderId);
      self.fetchOrder(orderId)
    });
  
    // 监听扫描打包品扫码
    if (this.listenScanProductCode) {
      this.listenScanProductCode.remove()
    }
    this.listenScanProductCode = DeviceEventEmitter.addListener(config.Listener.KEY_SCAN_PROD_QR_CODE, function (code) {
      console.log('scan bar code listener => product info :', code);
      self.handleScanProduct(code, false)
    });
  
    // 监听标品品扫码
    if (this.listenScanUpc) {
      this.listenScanUpc.remove()
    }
    this.listenScanUpc = DeviceEventEmitter.addListener(config.Listener.KEY_SCAN_STANDARD_PROD_BAR_CODE, function ({barCode}) {
      console.log('listen scan upc => barCode :', barCode);
      self.handleScanStandardProduct(barCode)
    })
  }
  
  componentDidMount () {
    super.componentDidMount();
    if (this.props.navigation.state.params.orderId) {
      this.fetchOrder(this.props.navigation.state.params.orderId)
    }
  }
  
  componentWillUnmount () {
    if (this.listenScanBarCode) {
      this.listenScanBarCode.remove()
    }
    if (this.listenScanProductCode) {
      this.listenScanProductCode.remove()
    }
  }
  
  fetchOrder (orderId) {
    const self = this;
    const accessToken = self.props.global.accessToken;
    this.setState({isLoading: true})
    const api = `/api/order_info_by_scan_order_code/${orderId}?access_token=${accessToken}`;
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({currentOrder: res, isLoading: false}, () => self.checkScanNum())
    })
  }
  
  handleScanProduct (prodCode, isStandard, num = 1) {
    const self = this
    let {currentOrder} = this.state
    if (!currentOrder || Object.keys(currentOrder).length === 0) {
      ToastShort('无订单数据！')
      native.speakText('无订单数据！')
      return
    }
    const {tagCode, weight = 0, barCode = ''} = prodCode
    const {id, items, scan_count} = currentOrder
    for (let i in items) {
      let item = items[i]
      if (
        (!isStandard && item.sku && item.sku.material_code > 0 && item.sku.material_code == tagCode) ||
        (isStandard && item.product.upc && item.product.upc == tagCode)
      ) {
        if (item.scan_num && item.scan_num >= item.num) {
          // ToastShort('该商品已经拣够了！')
          // native.speakText('该商品已经拣够了！')
        } else {
          item.scan_num = item.scan_num ? item.scan_num + num : num
          // 如果拣货数量够，就置底
          // if (Number(item.scan_num) >= Number(item.num)) {
          //   items.splice(i, 1)
          //   items.push(item)
          // }
          currentOrder.items = items
          currentOrder.scan_count = scan_count ? scan_count + num : num
          console.log('handle scan product current order : ', currentOrder)
          self.addScanProdLog(id, item.id, num, tagCode, barCode, isStandard ? 2 : 1, parseFloat(weight))
          self.setState({currentOrder})
          
          let msg = `商品减${num}！`
          if (!isStandard) {
            const {datetime} = prodCode
            let shortTime = Moment(datetime).format('MM月DD日')
            msg = `${msg}${shortTime}打包`
          }
          ToastShort(msg)
          native.speakText(msg)
          // native.playWarningSound()
          if (currentOrder.scan_count >= currentOrder.items_count) {
            self.onForcePickUp()
          }
          return
        }
      }
    }
    ToastShort('该订单不存在此商品！')
    native.speakText('该订单不存在此商品！')
  }
  
  handleScanStandardProduct (barCode) {
    const self = this
    let {currentOrder} = this.state
    
    if (!currentOrder || Object.keys(currentOrder).length === 0) {
      ToastShort('无订单数据！')
      native.speakText('无订单数据！')
      return
    }
    const {items} = currentOrder
    for (let item of items) {
      if (
        (item.product.upc && item.product.upc == barCode) ||
        (barCode.indexOf('JBBUPC') && item.product.upc && item.product.upc.substring(0, 8) == barCode.substring(0, 8))
      ) {
        if (item.scan_num && item.scan_num >= item.num) {
          ToastShort('该商品已经拣够了！')
          native.speakText('该商品已经拣够了！')
          return
        } else {
          self.handleScanProduct({tagCode: barCode}, true, 1)
          return
        }
      }
    }
    ToastShort('该订单不存在此商品！')
    native.speakText('该订单不存在此商品！')
  }
  
  addScanProdLog (order_id, item_id, num, code, bar_code, type, weight) {
    const self = this
    const accessToken = self.props.global.accessToken
    const api = `/api_products/add_inventory_exit_log?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      order_id, item_id, num, code, type, weight, bar_code
    }).then(res => {
      self.checkScanNum()
    })
  }
  
  onForcePickUp () {
    const self = this
    let {currentOrder} = this.state
    const {id} = currentOrder
  
    const accessToken = self.props.global.accessToken
    const api = `api/order_set_ready_by_id/${id}.json?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api, {from: 'ORDER_SCAN'}).then(() => {
      self.afterPackUp(currentOrder, self)
    }).catch(e => {
      if (e.obj == 'ALREADY_PACK_UP') {
        self.afterPackUp(currentOrder, self)
      }
    })
  }
  
  afterPackUp (currentOrder, self) {
    currentOrder = {}
    self.setState({currentOrder})
    ToastShort('打包完成操作成功')
    native.speakText('打包完成操作成功')
  }
  
  onChgProdNum (prodIdx, number) {
    let {currentOrder} = this.state
    const oldNumber = currentOrder.items[prodIdx].scan_num
    currentOrder.items[prodIdx].scan_num = number
    const item = currentOrder.items[prodIdx]
    // 如果拣货数量够，就置底
    // if (Number(currentOrder.items[prodIdx].scan_num) >= Number(currentOrder.items[prodIdx].num)) {
    //   currentOrder.items.splice(prodIdx, 1)
    //   currentOrder.items.push(item)
    // }
    currentOrder.scan_count = currentOrder.scan_count - oldNumber + Number(number)
    this.setState({currentOrder})
  
    this.addScanProdLog(currentOrder.id, item.id, number)
  }
  
  checkScanNum () {
    let {currentOrder} = this.state
    if (currentOrder.items_need_scan_num <= currentOrder.scan_count) {
      this.setState({scanEnough: true})
    } else {
      this.setState({scanEnough: false})
    }
  }
  
  renderBtn () {
    const {scanEnough, currentOrder} = this.state
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => this.onForcePickUp()}>
          <View style={[styles.footerBtn, scanEnough ? styles.successBtn : styles.errorBtn]}>
            <Text style={styles.footerBtnText}>
              共{currentOrder.items_count}件|
              应扫{currentOrder.items_need_scan_num}件 |
              已扫{currentOrder.scan_count}件 =>
              {scanEnough ? '' : '强制'}打包完成
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  render () {
    const {currentOrder} = this.state;
    return currentOrder && Object.keys(currentOrder).length ? (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={{flex: 1}}>
          <OrderList
            isLoading={this.state.isLoading}
            onRefresh={() => this.fetchOrder(currentOrder.id)}
            footerHeight={footerHeight}
            dataSource={this.state.currentOrder}
            onChgProdNum={(prodIdx, number) => this.onChgProdNum(prodIdx, number)}
          />
        </View>
        
        {this.renderBtn()}
      </View>
    ) : <EmptyData/>
  }
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    height: footerHeight,
    width: '100%'
  },
  footerItem: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%'
  },
  successBtn: {
    backgroundColor: '#59b26a'
  },
  errorBtn: {
    backgroundColor: '#e94f4f'
  },
  footerBtnText: {
    color: '#fff'
  }
});
export default connect(mapStateToProps)(OrderScan)