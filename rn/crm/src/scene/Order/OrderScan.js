import BaseComponent from "../BaseComponent";
import React from "react";
import {DeviceEventEmitter, LayoutAnimation, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import swipeable from '../../widget/react-native-gesture-recognizers/swipeable';
import OrderList from "./_OrderScan/OrderList";
import {ToastShort} from "../../util/ToastUtils";
import pxToDp from "../../util/pxToDp";
import HttpUtils from "../../util/http";
import EmptyData from "../component/EmptyData";

const {directions: {SWIPE_UP, SWIPE_LEFT, SWIPE_DOWN, SWIPE_RIGHT}} = swipeable;
var Dimensions = require('Dimensions');
var screenWidth = Dimensions.get('window').width;
var screenHeight = Dimensions.get('window').height;
var footerHeight = pxToDp(80)

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class OrderScan extends BaseComponent {
  static navigationOptions = ({navigation}) => {
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
  }
  
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
    const self = this
    if (this.listenScanBarCode) {
      this.listenScanBarCode.remove()
    }
    this.listenScanBarCode = DeviceEventEmitter.addListener('listenScanBarCode', function ({orderId}) {
      console.log('scan bar code listener => order id :', orderId)
      let {orderIds = []} = self.state
      console.log('scan bar code listener => state order ids :', orderIds)
      const idx = orderIds.indexOf(orderId)
      if (idx >= 0) {
        self.swipeToOrder(idx)
      } else {
        self.fetchOrder(orderId)
      }
    })
    
    if (this.listenScanProductCode) {
      this.listenScanProductCode.remove()
    }
    this.listenScanProductCode = DeviceEventEmitter.addListener('listenScanProductCode', function (code) {
      console.log('scan bar code listener => product info :', code)
      self.handleScanProduct(code)
    })
  }
  
  componentWillUnmount () {
    this.listenScanBarCode.remove()
    this.listenScanProductCode.remove()
  }
  
  fetchOrder (orderId) {
    const self = this
    const navigation = self.props.navigation
    const accessToken = self.props.global.accessToken
    const api = `/api/order_info_by_scan_order_code/${orderId}?access_token=${accessToken}`
    HttpUtils.get.bind(navigation)(api).then(res => {
      let {dataSource = [], orderIds = []} = self.state
      dataSource.push(res)
      orderIds.push(orderId)
      console.log('fetch order => state order ids :', orderIds)
      let newIdx = orderIds.indexOf(orderId)
      self.setState({dataSource, orderIds, currentOrder: res}, () => {
        self.swipeToOrder(newIdx)
      })
    })
  }
  
  swipeToOrder (toIdx) {
    let {x, y, idx, dataSource} = this.state;
    if (toIdx != idx) {
      let viewHeight = screenHeight - footerHeight
      x = 0 - toIdx * screenWidth
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
      console.log(`auto swipe to x ${x} y ${y} idx ${idx} toIdx ${toIdx}`)
      this.setState({x, y, idx: toIdx});
    }
  }
  
  handleScanProduct (prodCode) {
    const self = this
    let {currentOrder, orderIds, dataSource} = this.state
    const {id, items} = currentOrder
    const {tagCode} = prodCode
    const idx = orderIds.indexOf(id)
    
    if (!currentOrder || Object.keys(currentOrder).length === 0) {
      ToastShort('无订单数据！')
      native.speakText('无订单数据！')
      return
    }
    
    for (let item of items) {
      if (item.sku && item.sku.material_code > 0 && item.sku.material_code == tagCode) {
        if (item.scan_num && item.scan_num >= item.num) {
          ToastShort('该商品已经拣够了！')
          native.speakText('该商品已经拣够了！')
          return
        } else {
          item.scan_num = item.scan_num ? item.scan_num + 1 : 1
          dataSource = dataSource.splice(idx, 1, currentOrder)
          self.setState({dataSource})
          ToastShort('商品减一！')
          native.speakText('商品减一！')
          return
        }
      }
    }
    ToastShort('该订单不存在此商品！')
    native.speakText('该订单不存在此商品！')
  }
  
  onForcePickUp () {
  
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
          ToastShort('没有更多了')
          break;
        }
        x = x - screenWidth;
        idx = idx + 1
        break;
      case SWIPE_RIGHT:
        if (idx === 0) {
          ToastShort('已经到头了')
          break;
        }
        x = x + screenWidth;
        idx = idx - 1
        break;
      default:
        break
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    
    this.setState({
      x, y, idx,
      currentOrder: dataSource[idx]
    });
  }
  
  renderBtn () {
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => console.log(1)}>
          <View style={[styles.footerBtn, styles.successBtn]}>
            <Text style={styles.footerBtnText}>联系用户</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => console.log(1)}>
          <View style={[styles.footerBtn, styles.errorBtn]}>
            <Text style={styles.footerBtnText}>强制打包完成</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  render () {
    const {x, y, dataSource} = this.state;
    
    return dataSource.length ? (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={{flex: 1}}>
          <OrderList
            footerHeight={footerHeight}
            dataSource={this.state.dataSource}
            onSwipeBegin={this.onSwipeBegin}
            swipeDecoratorStyle={{
              left: x,
              top: y,
              position: 'absolute',
            }}
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
})
export default connect(mapStateToProps)(OrderScan)