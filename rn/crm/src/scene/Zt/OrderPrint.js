import React from 'react'
import BaseComponent from "../BaseComponent"
import {StyleSheet, View} from 'react-native'
import {connect} from "react-redux"
import {Button, DatePicker, List} from 'antd-mobile-rn'

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
      date: new Date()
    }
  }
  
  render () {
    return (
      <View style={style.container}>
        <List>
          <List.Item arrow="horizontal">自提点</List.Item>
          <DatePicker
            mode="date"
            extra={this.state.date}
            value={this.state.date}
            onChange={date => this.setState({date})}
          >
            <List.Item arrow="horizontal">日期</List.Item>
          </DatePicker>
        </List>
        <View style={style.printBtnBox}>
          <Button type={'primary'} style={style.printBtn}>打印</Button>
        </View>
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