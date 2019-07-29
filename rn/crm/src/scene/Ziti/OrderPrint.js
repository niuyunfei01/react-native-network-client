import React from 'react'
import BaseComponent from "../BaseComponent"
import {Alert, StyleSheet, View} from 'react-native'
import {connect} from "react-redux"
import {Button, DatePicker, List} from 'antd-mobile-rn'
import SearchPopup from "../component/SearchPopup";
import HttpUtils from "../../util/http";
import TimeUtil from "../../util/TimeUtil";

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
      addressPointPopup: false
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
    const accessToken = this.props.global.accessToken
    const uri = `/crm_orders/query_wait_print_order?access_token=${accessToken}`
    return HttpUtils.post.bind(this.props)(uri, {
      ext_store_id: this.state.addressPoint.es_id,
      start: TimeUtil.format('yyyy-MM-dd hh:mm:ss', this.state.start),
      end: TimeUtil.format('yyyy-MM-dd hh:mm:ss', this.state.end)
    })
  }
  
  print () {
    const self = this
    self.fetchPointOrders().then(orders => {
      Alert.alert(orders.length)
    })
  }
  
  render () {
    return (
      <View style={style.container}>
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
        <View style={style.printBtnBox}>
          <Button
            type={'primary'}
            style={style.printBtn}
            onClick={() => this.print()}
          >打印</Button>
        </View>
  
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
    alignItems: 'center'
  },
  printBtn: {
    width: '90%'
  }
})

export default connect(mapStateToProps)(OrderPrint)