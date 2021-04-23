import BaseComponent from "../BaseComponent";
import React from "react";
import {DeviceEventEmitter, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
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
import {List} from "@ant-design/react-native";
import {tool} from "../../common";
import ModalSelector from "react-native-modal-selector";

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
    const store = tool.store(this.props.global)
    this.state = {
      storeId: store.id,
      currentOrder: {},
      isLoading: false,
      scanCount:0,
      scanEnough: false,
      currentWorker: {label: '', key: ''},
      workers: []
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
      self.handleScanProduct({tagCode: barCode}, true, 1)
    })
  }
  
  componentDidMount () {
    super.componentDidMount();
    if (this.props.route.params.orderId) {
      this.fetchOrder(this.props.route.params.orderId)
    }
    this.fetchWorker()
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
      self.setState({
        currentOrder: res,
        isLoading: false,
        currentWorker: {label: res.assignUser.nickname, key: res.assignUser.id}
      }, () => self.checkScanNum())
    })
  }
  
  fetchWorker () {
    const self = this
    const accessToken = self.props.global.accessToken
    const api = `/api/store_contacts/${this.state.storeId}?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      let workers = res.map(item => ({label: item.label, key: item.id}))
      self.setState({workers: workers})
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
    let prodExist = 0;
    for (let i in items) {
      let item = items[i]
      if (
        (!isStandard && item.sku && item.sku.material_code > 0 && item.sku.material_code == tagCode) ||
        (isStandard && item.product.upc && item.product.upc == tagCode)
      ) {
        if (item.scan_num && item.scan_num >= item.num) {
          prodExist = 1
        } else {
          prodExist = 2
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
          if (currentOrder.scan_count >= currentOrder.items_count) {
            self.onForcePickUp()
          }
        }
      }
    }
    console.log('prod exist value => ', prodExist)
    if (prodExist === 1) {
      ToastShort('该商品已经拣够了！')
      native.speakText('该商品已经拣够了！')
    } else if (prodExist === 0) {
      ToastShort('该订单不存在此商品！')
      native.speakText('该订单不存在此商品！')
    }
  }
  
  addScanProdLog (order_id, item_id, num, code, bar_code, type, weight) {
    const self = this
    const accessToken = self.props.global.accessToken
    const api = `/api_products/add_inventory_exit_log?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      order_id, item_id, num, code, type, weight, bar_code,
      packUid: this.state.currentWorker.key
    }).then(res => {
      self.checkScanNum()
    }).catch(e => {
      native.playWarningSound()
      native.speakText(e.reason)
    })
  }
  
  onForcePickUp () {
    const self = this
    let {currentOrder} = this.state
    const {id} = currentOrder
  
    const accessToken = self.props.global.accessToken
    const api = `api/order_set_ready_by_id/${id}.json?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api, {
      from: 'ORDER_SCAN',
      packUid: this.state.currentWorker.key
    }).then(() => {
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
    let count = 0
    this.state.currentOrder.items.map(item => {
      if (item.need_scan > 0) {
        count += Number(item.scan_num)
      }
    })
    if (currentOrder.items_need_scan_num <= count) {
      this.setState({scanEnough: true,scanCount:count})
    } else {
      this.setState({scanEnough: false,scanCount:count})
    }
  }
  
  renderBtn () {
    const {scanEnough, currentOrder} = this.state
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => this.onForcePickUp()}>
          <View style={[styles.footerBtn, scanEnough ? styles.successBtn : styles.errorBtn]}>
            <Text style={styles.footerBtnText}>
              共{currentOrder.items_count}件 |
              已扫{this.state.scanCount}件 =>
              {scanEnough ? '' : '强制'}打包完成
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  renderOrderInfo (item) {
    return (
      <View style={styles.headerContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <Text style={styles.platDayId}>{item.plat_name}：#{item.platform_dayId}</Text>
            <Text style={styles.dayId}>(总单：#{item.dayId})</Text>
          </View>
          <View>
            <Text>期望送达：{item.expectTime}</Text>
          </View>
        </View>
        <View>
          <Text style={{fontSize: 16}}>客户备注：{item.remark}</Text>
        </View>
        <If condition={item.store_remark}>
          <View>
            <Text style={{fontSize: 16}}>商家备注：{item.store_remark}</Text>
          </View>
        </If>
        <List>
          <ModalSelector data={this.state.workers} onChange={item => this.setState({currentWorker: item})}>
            <List.Item extra={this.state.currentWorker.label} arrow={'horizontal'}>
              拣货员
            </List.Item>
          </ModalSelector>
        </List>
      </View>
    )
  }
  
  render () {
    const {currentOrder} = this.state;
    return currentOrder && Object.keys(currentOrder).length ? (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={{flex: 1}}>
          <ScrollView refreshControl={
            <RefreshControl
              refreshing={this.state.isLoading}
              onRefresh={() => this.fetchOrder(currentOrder.id)}
            />
          }>
            {this.renderOrderInfo(this.state.currentOrder)}
            <OrderList
              scanCount={this.state.scanCount}
              footerHeight={footerHeight}
              dataSource={this.state.currentOrder}
              onChgProdNum={(prodIdx, number) => this.onChgProdNum(prodIdx, number)}
            />
          </ScrollView>
        </View>
        
        {this.renderBtn()}
      </View>
    ) : <EmptyData/>
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#f0f9ef',
    padding: pxToDp(20)
  },
  platDayId: {
    fontWeight: 'bold'
  },
  dayId: {
    fontSize: 10
  },
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