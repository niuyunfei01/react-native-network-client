import React from 'react'
import BaseComponent from "../BaseComponent"
import HttpUtils from "../../util/http";
import TimeUtil from "../../util/TimeUtil";
import {connect} from 'react-redux'
import {Alert, ScrollView, StyleSheet, View} from 'react-native'
import {Button, DatePicker, List, WhiteSpace} from '@ant-design/react-native'
import SearchPopup from "../component/SearchPopup";

function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class OrderPrint extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '打印自提单',
    }
  };
  
  constructor (props) {
    super(props)
    this.state = {
      addressPoint: {},
      start: new Date(),
      end: new Date(),
      addressPoints: [],
      addressPointPopup: false,
      orders: [],
      searched: false
    }
  }
  
  componentWillMount () {
    this.fetchAddressPoints()
  }
  
  fetchAddressPoints () {
    const self = this
    const accessToken = this.props.global.accessToken
    const uri = `/crm_orders/get_store_point_list?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      res.forEach((item, idx) => {
        res[idx]['searchStr'] = `${item.name}\n${item.ship_time_range}\n${item.address}`
      })
      self.setState({addressPoints: res})
    })
  }
  
  fetchPointOrders () {
    const self = this
    const accessToken = this.props.global.accessToken
    const uri = `/crm_orders/query_wait_print_order?access_token=${accessToken}`
    HttpUtils.post.bind(this.props)(uri, {
      ext_store_id: this.state.addressPoint.es_id,
      start: TimeUtil.format('yyyy-MM-dd hh:mm:ss', this.state.start),
      end: TimeUtil.format('yyyy-MM-dd hh:mm:ss', this.state.end)
    }).then(orders => {
      self.setState({orders, searched: orders.length > 0})
      if (!orders.length) {
        Alert.alert('提示', '无待打印订单')
      }
    })
  }
  
  printOrder (orderId = 0) {
    const self = this
    const accessToken = this.props.global.accessToken
    const uri = `/crm_orders/print_orders?access_token=${accessToken}`
    let data = {
      ext_store_id: this.state.addressPoint.es_id,
      start: TimeUtil.format('yyyy-MM-dd hh:mm:ss', this.state.start),
      end: TimeUtil.format('yyyy-MM-dd hh:mm:ss', this.state.end)
    }
    if (orderId > 0) {
      data.order_id = orderId
    }
    HttpUtils.post.bind(this.props)(uri, data).then(res => {
      Alert.alert('提示', '打印成功')
    })
  }
  
  printOrderById (orderId) {
    const self = this
    Alert.alert('提示', `打印订单${orderId}?`, [{
      text: '取消'
    }, {
      text: '打印',
      onPress: () => self.printOrder(orderId)
    }])
  }
  
  batchPrint () {
    const self = this
    Alert.alert('提示', `${String(self.state.orders.length)}张待打印订单，全部打印？`, [{
      text: '取消'
    }, {
      text: '打印',
      onPress: () => self.printOrder()
    }])
  }
  
  render () {
    return (
      <View style={style.container}>
        <ScrollView>
          <List>
            <List.Item
              arrow="horizontal"
              extra={this.state.addressPoint.name}
              onClick={() => this.setState({addressPointPopup: true})}
            >自提点</List.Item>
            <DatePicker
              mode="datetime"
              extra={this.state.start}
              value={this.state.start}
              onChange={time => this.setState({start: time})}
            >
              <List.Item arrow="horizontal">期望送达开始时间</List.Item>
            </DatePicker>
            <DatePicker
              mode="datetime"
              extra={this.state.end}
              value={this.state.end}
              onChange={time => this.setState({end: time})}
            >
              <List.Item arrow="horizontal">期望送达结束时间</List.Item>
            </DatePicker>
          </List>
    
          <If condition={this.state.orders.length}>
            <WhiteSpace/>
            <List>
              {this.state.orders.map(item => {
                return (
                  <List.Item
                    key={item.id}
                    arrow="horizontal"
                    extra={'打印'}
                    onClick={() => this.printOrderById(item.id)}
                  >
                    {`订单号：${item.id}`}
                    <List.Item.Brief>{`序号：#${item.dayId}`}</List.Item.Brief>
                  </List.Item>
                )
              })}
            </List>
          </If>
    
          <View style={[
            style.printBtnBox,
            this.state.searched ? {justifyContent: 'space-around'} : {justifyContent: 'center'}
          ]}>
            <Button
              type={'primary'}
              style={[style.printBtn, this.state.searched ? {width: '45%'} : null]}
              onClick={() => this.fetchPointOrders()}
            >{this.state.searched ? '重新搜索' : '搜索订单'}</Button>
            <If condition={this.state.searched}>
              <Button
                type={'primary'}
                style={[style.printBtn, {width: '45%'}]}
                onClick={() => this.batchPrint()}
              >全部打印</Button>
            </If>
          </View>
        </ScrollView>
        
  
        {/*自提点列表*/}
        <SearchPopup
          visible={this.state.addressPointPopup}
          dataSource={this.state.addressPoints}
          rowHeight={60}
          onClose={() => this.setState({addressPointPopup: false})}
          onSelect={item => this.setState({addressPoint: item, addressPointPopup: false})}
          title={'选择自提点'}
        />
      </View>
    )
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%'
  },
  printBtnBox: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row'
  },
  printBtn: {
    width: '90%'
  }
})

export default connect(mapStateToProps)(OrderPrint)