import BaseComponent from "../BaseComponent";
import React from "react";
import {DeviceEventEmitter, Dimensions, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from 'react-redux'
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import swipeable from '../../widget/react-native-gesture-recognizers/swipeable';
import OrderList from "./_OrderScan/OrderList";
import {ToastShort} from "../../util/ToastUtils";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import config from '../../config'
import EmptyData from "../component/EmptyData";

const {directions: {SWIPE_LEFT, SWIPE_RIGHT}} = swipeable;
let screenWidth = Dimensions.get('window').width;
let screenHeight = Dimensions.get('window').height;
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
      x: 0,
      y: 0,
      idx: 0,
      orderIds: [],
      dataSource: [],
      currentOrder: {}
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
      let {orderIds = [], dataSource = []} = self.state;
      console.log('scan bar code listener => state order ids :', orderIds);
      console.log('fetch order => state data sources :', dataSource)
      const idx = orderIds.indexOf(orderId);
      if (idx >= 0) {
        self.setState({currentOrder: dataSource[idx]}, () => {
          self.swipeToOrder(idx)
        })
      } else {
        self.fetchOrder(orderId)
      }
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
    const api = `/api/order_info_by_scan_order_code/${orderId}?access_token=${accessToken}`;
    HttpUtils.get.bind(self.props)(api).then(res => {
      let {dataSource = [], orderIds = []} = self.state;
      dataSource.push(res);
      orderIds.push(orderId);
      console.log('fetch order => state order ids :', orderIds);
      let newIdx = orderIds.indexOf(orderId);
      self.setState({dataSource, orderIds, currentOrder: res}, () => {
        self.swipeToOrder(newIdx)
      })
    })
  }
  
  swipeToOrder (toIdx) {
    let {x, y, idx, dataSource} = this.state;
    console.log(`auto swipe to idx ${idx} toIdx ${toIdx}`)
    if (toIdx != idx) {
      let viewHeight = screenHeight - footerHeight
      x = 0 - toIdx * screenWidth
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
      this.setState({x, y, idx: toIdx});
    }
  }
  
  handleScanProduct (prodCode, isStandard, num = 1) {
    const self = this
    let {currentOrder, orderIds, dataSource} = this.state
    if (!currentOrder || Object.keys(currentOrder).length === 0) {
      ToastShort('无订单数据！')
      native.speakText('无订单数据！')
      return
    }
    const {tagCode, weight = 0, barCode = ''} = prodCode
    const {id, items, scan_count} = currentOrder
    const idx = orderIds.indexOf(id)
    for (let i in items) {
      let item = items[i]
      if (
        (!isStandard && item.sku && item.sku.material_code > 0 && item.sku.material_code == tagCode) ||
        (isStandard && item.product.upc && item.product.upc == tagCode)
      ) {
        if (item.scan_num && item.scan_num >= item.num) {
          ToastShort('该商品已经拣够了！')
          native.speakText('该商品已经拣够了！')
          return
        } else {
          item.scan_num = item.scan_num ? item.scan_num + num : num
          // 如果拣货数量够，就置底
          if (Number(item.scan_num) >= Number(item.num)) {
            items.splice(i, 1)
            items.push(item)
          }
          currentOrder.items = items
          currentOrder.scan_count = scan_count ? scan_count + num : num
          console.log('handle scan product current order : ', currentOrder)
          console.log('handle scan product data source  before : ', dataSource)
          dataSource.splice(idx, 1, currentOrder)
          console.log('handle scan product data source after : ', dataSource)
          self.setState({dataSource})
          self.addScanProdLog(id, item.id, num, tagCode, barCode, isStandard ? 2 : 1, parseFloat(weight))
          
          ToastShort(`商品减${num}！`)
          native.speakText(`商品减${num}`)
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
    
    })
  }
  
  updateScanProdLogNum (order_id, item_id, num) {
    const self = this
    const accessToken = self.props.global.accessToken
    const api = `/api_products/update_inventory_exit_log?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      order_id, item_id, num
    }).then(res => {
    
    })
  }
  
  onForcePickUp () {
    const self = this
    let {currentOrder, orderIds, dataSource} = this.state
    const {id} = currentOrder
    const idx = orderIds.indexOf(id)
    console.log('force pick up dataSource before', dataSource, 'orderIds', orderIds, ' currentOrder', currentOrder, 'idx', idx)
  
    const accessToken = self.props.global.accessToken
    const api = `api/order_set_ready_by_id/${id}.json?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(() => {
      dataSource.splice(idx + 1, 1)
      orderIds.splice(idx + 1, 1)
      currentOrder = dataSource.length ? dataSource[0] : {}
      self.setState({dataSource, currentOrder, orderIds}, () => self.swipeToOrder(0))
    })
  }
  
  onSwipeBegin = ({direction, distance, velocity}) => {
    let {x, y, idx, dataSource} = this.state;
    let length = dataSource.length
    let viewHeight = screenHeight - footerHeight
    console.log(`direction ${direction} distance ${distance} viewHeight ${viewHeight} speed ${velocity}`)
    // if (Math.abs(distance) <= 8.5 || Math.abs(velocity) < 0.85) {
    //   return
    // }
    
    // x and y values are hardcoded for an iphone6 screen
    switch (direction) {
      case SWIPE_LEFT:
        if (idx >= length - 1) {
          ToastShort('没有更多了');
          break;
        }
        x = x - screenWidth;
        idx = idx + 1;
        break;
      case SWIPE_RIGHT:
        if (idx === 0) {
          ToastShort('已经到头了');
          break;
        }
        x = x + screenWidth;
        idx = idx - 1;
        break;
      default:
        break
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    
    this.setState({
      x, y, idx,
      currentOrder: dataSource[idx]
    });
  };
  
  onChgProdNum (prodIdx, number) {
    let {currentOrder, orderIds, dataSource} = this.state
    const {id} = currentOrder
    const idx = orderIds.indexOf(id)
    const oldNumber = currentOrder.items[prodIdx].scan_num
    currentOrder.items[prodIdx].scan_num = number
    const item = currentOrder.items[prodIdx]
    // 如果拣货数量够，就置底
    if (Number(currentOrder.items[prodIdx].scan_num) >= Number(currentOrder.items[prodIdx].num)) {
      currentOrder.items.splice(prodIdx, 1)
      currentOrder.items.push(item)
    }
    currentOrder.scan_count = currentOrder.scan_count - oldNumber + Number(number)
    dataSource[idx] = currentOrder
    this.setState({currentOrder, dataSource})
    
    this.updateScanProdLogNum(currentOrder.id, item.id, number)
  }
  
  renderBtn () {
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => console.log(1)}>
          <View style={[styles.footerBtn, styles.successBtn]}>
            <Text style={styles.footerBtnText}>联系用户</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => this.onForcePickUp()}>
          <View style={[styles.footerBtn, styles.errorBtn]}>
            <Text style={styles.footerBtnText}>强制打包完成</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  render () {
    const {x, y, dataSource} = this.state;
    const OrderListStyle = {
      left: x,
      top: y,
      position: 'absolute',
    }
    return dataSource.length ? (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={{flex: 1}}>
          <OrderList
            style={OrderListStyle}
            footerHeight={footerHeight}
            dataSource={this.state.dataSource}
            onSwipeBegin={this.onSwipeBegin}
            swipeDecoratorStyle={{
              left: x,
              top: y,
              position: 'absolute',
            }}
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
    width: '50%',
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