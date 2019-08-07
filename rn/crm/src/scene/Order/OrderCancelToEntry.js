import React from 'react'
import BaseComponent from "../BaseComponent";
import {connect} from 'react-redux'
import {Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import HttpUtils from "../../util/http";
import InputNumber from "rc-input-number";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {Button} from 'antd-mobile-rn'
import {ToastShort} from "../../util/ToastUtils";

function mapStateToProps (state) {
  return {global: state.global}
}

class OrderCancelToEntry extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerTitle: '退单商品入库',
      headerRight: (
        <TouchableOpacity style={styles.headerRight} onPress={() => params.selectAll()}>
          <View><Text>{params.isCheckAll ? '取消' : ''}全选</Text></View>
        </TouchableOpacity>
      )
    }
  }
  
  constructor (props) {
    super(props)
    this.state = {
      orderItems: [],
      isCheckAll: false
    }
  }
  
  componentWillMount () {
    this.fetchData()
    this.props.navigation.setParams({selectAll: () => this.onSelectAll(), isCheckAll: this.state.isCheckAll})
  }
  
  componentWillUpdate (nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void {
    console.log('component will update next props => ', nextState)
    if (this.props.navigation.state.params.isCheckAll != nextState.isCheckAll) {
      this.props.navigation.setParams({isCheckAll: nextState.isCheckAll})
    }
  }
  
  fetchData () {
    const self = this
    const {global, navigation} = self.props
    const uri = `/crm_orders/order_cancel_to_entry_info/${navigation.state.params.orderId}?access_token=${global.accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      self.setState({orderItems: res})
    })
  }
  
  onSelectAll () {
    let {isCheckAll, orderItems} = this.state
    isCheckAll = !isCheckAll
    orderItems = orderItems.map(item => {
      item.cancelToEntryNum = isCheckAll ? item.num : 0
      return item
    })
    this.setState({isCheckAll, orderItems})
  }
  
  onEntryNumChanged (idx, value) {
    let {orderItems} = this.state
    orderItems[idx].cancelToEntryNum = value
    this.setState({orderItems})
  }
  
  onSubmit () {
    const self = this
    const {orderItems} = this.state
    let entryProdNum = 0
    let entryNum = 0
    
    let postData = []
    orderItems.map(item => {
      if (item.cancelToEntryNum > 0) {
        entryProdNum++
        entryNum += item.cancelToEntryNum
      }
      postData.push({
        orderItemId: item.id,
        entryNum: item.cancelToEntryNum ? item.cancelToEntryNum : 0,
        productId: item.product_id
      })
    })
    
    if (entryNum == 0 || entryProdNum == 0) {
      ToastShort('请选择入库商品')
      return
    }
    const {global} = self.props
    const uri = `/crm_orders/order_cancel_to_entry?access_token=${global.accessToken}`
    Alert.alert('提示', `确定入库${entryProdNum}个商品共${entryNum}件`, [
      {text: '取消'},
      {
        text: '确定', onPress: () => {
          HttpUtils.post.bind(this.props)(uri, {
            orderItems: postData,
            orderId: self.props.navigation.state.params.orderId,
          }).then(res => {
            ToastShort('提交成功')
            self.fetchData()
          })
        }
      }
    ])
  }
  
  render () {
    return (
      <ScrollView>
        <For of={this.state.orderItems} each="item" index="idx">
          <View key={item.id} style={styles.productBox}>
            <Image
              source={
                item.cancelToEntryNum > 0 ? require('../../img/checked.png') : require('../../img/checked_disable.png')
              }
              style={styles.checkImage}
            />
            <Image
              source={
                !!item.productImage ? {uri: item.productImage} : require('../../img/Order/zanwutupian_.png')
              }
              style={styles.productImage}/>
            <View style={styles.productRight}>
              <Text>{item.name}</Text>
              <View style={styles.productBottom}>
                <Text>购买数量{item.num}件</Text>
                <View style={styles.numberInput}>
                  <InputNumber
                    styles={numberInputStyle}
                    min={0}
                    max={Number(item.num)}
                    value={Number(item.cancelToEntryNum)}
                    onChange={(v) => this.onEntryNumChanged(idx, v)}
                    keyboardType={'numeric'}
                  />
                </View>
              </View>
            </View>
          </View>
        </For>
        
        <View style={styles.btnContainer}>
          <Button type={'primary'} onClick={() => this.onSubmit()}>提交入库</Button>
        </View>
      </ScrollView>
    )
  }
}

export default connect(mapStateToProps)(OrderCancelToEntry)

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 20
  },
  productBox: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    height: 70,
    backgroundColor: '#fff',
    borderBottomColor: '#f8f8f8',
    borderBottomWidth: 1,
    alignItems: 'center',
    flex: 1
  },
  checkImage: {
    width: 20,
    height: 20
  },
  productImage: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#f8f8f8'
  },
  productRight: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'space-between'
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  numberInput: {
    height: 20,
    width: 80
  },
  btnContainer: {
    marginTop: 10,
    paddingHorizontal: '5%'
  }
})

const numberInputStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    textAlign: 'center',
    padding: 0,
    fontSize: 16,
    color: '#222',
  },
  stepWrap: {
    width: 20,
    height: 20,
    borderRadius: 0,
    backgroundColor: colors.default_theme,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    textAlign: 'center',
    fontSize: pxToDp(38),
    color: colors.white,
    backgroundColor: 'transparent',
  },
  stepDisabled: {
    borderColor: '#d9d9d9',
    backgroundColor: 'rgba(239, 239, 239, 0.72)',
  },
  disabledStepTextColor: {
    color: '#ccc',
  },
  highlightStepTextColor: {
    color: '#2DB7F5',
  },
  highlightStepBorderColor: {
    borderColor: '#2DB7F5',
  },
});