import React from 'react'
import BaseComponent from "../BaseComponent";
import {connect} from 'react-redux'
import {Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import HttpUtils from "../../util/http";
import InputNumber from "rc-input-number";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import {Button} from '@ant-design/react-native'
import {ToastShort} from "../../util/ToastUtils";
import ModalSelector from "react-native-modal-selector";

function mapStateToProps(state) {
  return {global: state.global}
}

const MENU_TYPE_ALL_ENTRY = 1
const MENU_TYPE_ALL_LOSS = 2
const MENU_TYPE_ALL_SOLD = 3

class OrderCancelToEntry extends BaseComponent {
  navigationOptions = ({navigation}) => {
    const menu = [
      {key: MENU_TYPE_ALL_ENTRY, label: '全部入库'},
      {key: MENU_TYPE_ALL_LOSS, label: '全部报损'},
      {key: MENU_TYPE_ALL_SOLD, label: '全部售出'},
    ]
    navigation.setOptions({
      headerRight: (
        <ModalSelector
          onChange={(option) => this.onSelectAll(option)}
          cancelText={'取消'}
          data={menu}>
          <View style={styles.headerRight}><Text>全选</Text></View>
        </ModalSelector>
      )
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      orderItems: []
    }

    this.navigationOptions(this.props)
  }

  UNSAFE_componentWillMount() {
    this.fetchData()
  }

  fetchData() {
    const self = this
    const {global, navigation} = self.props
    const uri = `/crm_orders/order_cancel_to_entry_info/${this.props.route.params.orderId}?access_token=${global.accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      self.setState({orderItems: res})
    })
  }

  onSelectAll(option) {
    let {orderItems} = this.state

    orderItems = orderItems.map(item => {
      item.cancelToEntry = 0
      item.cancelToLoss = 0
      item.cancelToSale = 0
      return item
    })

    this.setState({orderItems}, () => this.onResetAllNum(option))
  }

  onResetAllNum(option) {
    let {orderItems} = this.state
    orderItems = orderItems.map(item => {
      switch (option.key) {
        case MENU_TYPE_ALL_ENTRY:
          item.cancelToEntry = item.num - item.dealNum
          break;
        case MENU_TYPE_ALL_LOSS:
          item.cancelToLoss = item.num - item.dealNum
          break;
        case MENU_TYPE_ALL_SOLD:
          item.cancelToSale = item.num - item.dealNum
          break;
        default:
          break;
      }
      return item
    })

    this.setState({orderItems})
  }

  onNumChanged(idx, value, type) {
    let {orderItems} = this.state
    switch (type) {
      case MENU_TYPE_ALL_ENTRY:
        orderItems[idx].cancelToEntry = value
        break;
      case MENU_TYPE_ALL_LOSS:
        orderItems[idx].cancelToLoss = value
        break;
      case MENU_TYPE_ALL_SOLD:
        orderItems[idx].cancelToSale = value
        break;
      default:
        break;
    }
    this.setState({orderItems})
  }

  onSubmit() {
    const self = this
    const {orderItems} = this.state
    let entryProdNum = 0
    let entryNum = 0
    let lossNum = 0
    let saleNum = 0

    let postData = []
    orderItems.map(item => {
      let flag = false
      if (item.cancelToEntry > 0) {
        flag = true
        entryNum += Number(item.cancelToEntry)
      }
      if (item.cancelToLoss > 0) {
        flag = true
        lossNum += Number(item.cancelToLoss)
      }
      if (item.cancelToSale > 0) {
        flag = true
        saleNum += Number(item.cancelToSale)
      }

      if (flag) {
        entryProdNum++
        postData.push({
          orderItemId: item.id,
          cancelToEntry: item.cancelToEntry ? item.cancelToEntry : 0,
          cancelToLoss: item.cancelToLoss ? item.cancelToLoss : 0,
          cancelToSale: item.cancelToSale ? item.cancelToSale : 0,
          productId: item.product_id
        })
      }
    })

    if (entryNum == 0 || entryProdNum == 0) {
      ToastShort('请选择入库商品')
      return
    }
    const {global} = self.props
    const uri = `/crm_orders/order_cancel_to_entry?access_token=${global.accessToken}`
    Alert.alert('提示', `确定处理${entryProdNum}个商品：\n入库${entryNum}件\n报损${lossNum}件\n未收回${saleNum}件`, [
      {text: '取消'},
      {
        text: '确定', onPress: () => {
          HttpUtils.post.bind(this.props)(uri, {
            orderItems: postData,
            orderId: self.props.route.params.orderId,
          }).then(res => {
            ToastShort('提交成功')
            self.fetchData()
            // self.props.navigation.goBack()
          })
        }
      }
    ])
  }

  render() {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={() => this.fetchData()}/>}>
        <For of={this.state.orderItems} each="item" index="idx">
          <View key={item.id} style={styles.productBox}>
            {Number(item.num) - item.dealNum <= 0 ? <View style={styles.checkImage}/> : <Image
              source={
                item.cancelToEntry > 0 || item.cancelToLoss > 0 || item.cancelToSale > 0 ? require('../../img/checked.png') : require('../../img/checked_disable.png')
              }
              style={styles.checkImage}
            />}
            <Image
              source={
                !!item.productImage ? {uri: item.productImage} : require('../../img/Order/zanwutupian_.png')
              }
              style={styles.productImage}/>
            <View style={styles.productRight}>
              <Text>{item.name}</Text>
              <View style={styles.productBottom}>
                <Text>售出<Text style={{color: '#f00'}}>{item.num}</Text>件</Text>
                <Text>已处理<Text style={{color: '#f00'}}>{item.dealNum}</Text>件</Text>
              </View>
              <View>
                <View style={styles.operateRow}>
                  <Text>重新入库</Text>
                  <View style={styles.numberInput}>
                    <InputNumber
                      styles={numberInputStyle}
                      min={0}
                      max={item.num - item.dealNum - item.cancelToLoss - item.cancelToSale}
                      value={Number(item.cancelToEntry)}
                      onChange={(v) => this.onNumChanged(idx, v, MENU_TYPE_ALL_ENTRY)}
                      keyboardType={'numeric'}
                    />
                  </View>
                </View>
                <View style={styles.operateRow}>
                  <Text>报&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;损</Text>
                  <View style={styles.numberInput}>
                    <InputNumber
                      styles={numberInputStyle}
                      min={0}
                      max={item.num - item.dealNum - item.cancelToEntry - item.cancelToSale}
                      value={Number(item.cancelToLoss)}
                      onChange={(v) => this.onNumChanged(idx, v, MENU_TYPE_ALL_LOSS)}
                      keyboardType={'numeric'}
                    />
                  </View>
                </View>
                <View style={styles.operateRow}>
                  <Text>未&nbsp;&nbsp;取&nbsp;&nbsp;回</Text>
                  <View style={styles.numberInput}>
                    <InputNumber
                      styles={numberInputStyle}
                      min={0}
                      max={item.num - item.dealNum - item.cancelToEntry - item.cancelToLoss}
                      value={Number(item.cancelToSale)}
                      onChange={(v) => this.onNumChanged(idx, v, MENU_TYPE_ALL_SOLD)}
                      keyboardType={'numeric'}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </For>

        <View style={styles.btnContainer}>
          <Button type={'primary'} onPress={() => this.onSubmit()}>提交处理结果</Button>
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
    backgroundColor: '#fff',
    borderBottomColor: '#bbb',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40
  },
  operateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40
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
