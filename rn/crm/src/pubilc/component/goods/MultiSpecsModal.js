import React, {PureComponent} from "react";
import {FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import Config from "../../common/config";
import {showError, showSuccess} from "../../util/ToastUtils";
import colors from "../../styles/colors";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
import HttpUtils from "../../util/http";

const height = Dimensions.get("window").height;
let checkStatus = true

export default class MultiSpecsModal extends PureComponent {

  state = {
    editGood: {},
    data: {}
  }

  componentDidMount() {
    const {storePro} = this.props
    if (storePro?.skus?.length > 0 && storePro.sp?.product_id) {
      const data = [{...storePro.sp}].concat(storePro.skus)
      this.setState({
        data: data
      })
      return
    }
    if (storePro) {
      const {strict_providing, product_id, left_since_last_stat, sku_name, supply_price, skus, sp} = storePro
      let data = []
      data.push({
        strict_providing: strict_providing && strict_providing || sp.strict_providing,
        product_id: product_id && product_id || sp.product_id,
        supply_price: supply_price && supply_price || sp.supply_price,
        left_since_last_stat: left_since_last_stat && left_since_last_stat || sp.left_since_last_stat,
        sku_name: sku_name && sku_name || sp?.sku_name && sp.sku_name || '',
      })
      if (Array.isArray(skus) && skus.length > 0) {
        data = data.concat(skus)
      }
      this.setState({
        data: data
      })
    }
  }

  onChangeText = (product_id, amount, totalRemain, price, before_price, strict_providing, type) => {
    const amountLength = amount.length, priceLength = price.split('.')[0].length
    if ('amount' === type && amountLength > 4)
      amount = '9999'
    if ('price' === type && priceLength > 4)
      price = '9999'
    const {editGood} = this.state
    editGood[product_id] = {
      product_id: product_id,
      auto_on_sale: 0,
      apply_price: price,
      actualNum: amount,
      before_price: before_price,
      strict_providing: strict_providing,
      totalRemain: totalRemain
    }
    this.setState({
      editGood: {...editGood}
    })
  }

  inventoryHistory = (id) => {
    const {navigation, storeId, onClose} = this.props
    onClose()
    navigation.navigate(Config.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
      productId: id,
      storeId: storeId
    })
  }

  saveRef = (ref, index) => {
    if (index === 0)
      this.priceRef = ref
  }

  renderItem = (item) => {
    const {product_id, sku_name, left_since_last_stat, supply_price, strict_providing} = item.item
    const {index} = item
    const {editGood} = this.state
    const {storePro, productName} = this.props
    const price = undefined === editGood[product_id] ? parseFloat(supply_price / 100).toFixed(2) : editGood[product_id].apply_price
    const amount = undefined === editGood[product_id] ? left_since_last_stat : editGood[product_id].actualNum
    const specName = sku_name && `[${sku_name}]` || storePro.sku_name && `[${storePro.sku_name}]`
    return (
      <View style={styles.itemWrap}>
        <Text style={styles.skuName}>
          {productName} {specName}
        </Text>
        <View style={styles.rowWrap}>
          <View style={styles.row}>
            <Text style={styles.text}>
              价格（报价）
            </Text>
          </View>
          <View style={styles.row}>
            <TextInput value={price}
                       ref={ref => this.saveRef(ref, index)}
                       style={styles.textInput}
                       keyboardType={'numeric'}
                       placeholder={'请输入价格'}
                       placeholderTextColor={'#999999'}
                       onChangeText={price => this.onChangeText(product_id, amount, left_since_last_stat, price, supply_price, strict_providing, 'price')}/>
            <Text style={styles.text}>
              元
            </Text>
          </View>
        </View>
        <If condition={storePro.strict_providing === '1' || strict_providing === '1'}>
          <View style={styles.rowWrap}>
            <View style={styles.row}>
              <Text style={styles.text}>
                库存
              </Text>
              <Text style={styles.inventoryHistory} onPress={() => this.inventoryHistory(product_id)}>
                盘点历史
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.clearBtn}
                    onPress={() => this.onChangeText(product_id, '0', left_since_last_stat, price, supply_price, strict_providing, 'amount')}>
                清零
              </Text>
              <TextInput value={amount}
                         style={styles.textInput}
                         keyboardType={'numeric'}
                         placeholder={'请输入库存数量'}
                         placeholderTextColor={'#999999'}
                         onChangeText={amount => this.onChangeText(product_id, amount, left_since_last_stat, price, supply_price, strict_providing, 'amount')}/>
              <Text style={styles.text}>
                件
              </Text>
            </View>
          </View>
        </If>
      </View>
    )
  }

  done = (onClose) => {
    const {editGood} = this.state
    const {accessToken, storeId, vendor_id} = this.props
    const prices = [], inventory = []
    Object.keys(editGood).map((key) => {
      const obj = editGood[key]
      if (obj.apply_price.length <= 0) {
        showError('金额不可为空', 1);
        checkStatus = false
        return
      }
      obj.apply_price = parseFloat(obj.apply_price) * 100
      prices.push({
        product_id: parseInt(obj.product_id),
        apply_price: `${obj.apply_price}`,
        before_price: obj.before_price,
        remark: '',
        auto_on_sale: 0
      })
      if ('1' === obj.strict_providing) {
        if (obj.actualNum.length <= 0) {
          checkStatus = false
          showError('库存不可为空', 1);
          return
        }
        inventory.push({
          productId: obj.product_id,
          actualNum: obj.actualNum,
          totalRemain: obj.totalRemain,
          remark: '快速盘点',
          differenceType: 2,
          skipCheckChange: false
        })
      }
    })
    if (!checkStatus)
      return
    const url = `/api_products/batch_update_store_price_inventory?access_token=${accessToken}&&store_id=${storeId}&&vendor_id=${vendor_id}`
    let params = {prices: prices}
    if (inventory.length > 0)
      params = {...params, inventorys: inventory}
    if (prices.length > 0)
      HttpUtils.post.bind(this.props)(url, params).then(() => {
        showSuccess('已完成', 3)

      }).catch(e => {
        showError(e.reason, 1)
      })
    onClose()
  }

  getItemLayout = (data, index) => ({
    length: 120, offset: 120 * index, index
  })
  onShow = () => {
    setTimeout(() => {
      this.priceRef && this.priceRef.focus()
    }, 80)
  }

  render() {
    const {onClose, visible} = this.props
    const {data} = this.state
    return (
      <Modal hardwareAccelerated={true} onRequestClose={onClose} transparent={true} visible={visible}
             onShow={this.onShow}>
        <View style={styles.container}>
          <View style={styles.visibleArea}>
            <View style={styles.btn}>
              <Pressable onPress={onClose}>
                <Text style={styles.cancelBtn}>
                  取消
                </Text>
              </Pressable>
              <Pressable onPress={() => this.done(onClose)}>
                <Text style={styles.doneStyle}>
                  完成
                </Text>
              </Pressable>
            </View>
            <FlatList data={data}
                      renderItem={(item) => this.renderItem(item)}
                      initialNumToRender={4}
                      getItemLayout={(data, index) => this.getItemLayout(data, index)}
                      keyExtractor={(item, index) => `${index}`}
            />
          </View>
        </View>
      </Modal>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: Platform.OS === 'ios' ? 'center' : 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  visibleArea: {
    backgroundColor: colors.white,
    padding: 10,
    width: '100%',
    maxHeight: height * 0.7
  },
  btn: {
    flexDirection: 'row',
    justifyContent: "space-between",
    padding: 8,
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: 1
  },
  cancelBtn: {
    fontWeight: '400', color: '#666666', fontSize: 16, lineHeight: 22
  },
  doneStyle: {
    fontWeight: '400', color: '#59B26A', fontSize: 16, lineHeight: 22
  },
  textInput: {
    padding: 4, width: 120, borderWidth: 1, borderColor: '#979797', borderRadius: 4, marginRight: 4
  },

  text: {paddingTop: 4, paddingBottom: 4, fontSize: 14, fontWeight: '400', color: '#666666', lineHeight: 20},
  clearBtn: {
    color: '#59B26A',
    borderColor: '#979797',
    borderWidth: 1,
    marginRight: 4,
    borderRadius: 4,
    fontSize: 14,
    padding: 4,
    lineHeight: 17
  },
  itemWrap: {
    padding: 8, borderBottomColor: '#EEEEEE', borderBottomWidth: 1, height: 120, justifyContent: 'center'
  },
  skuName: {
    marginTop: 12,
    paddingLeft: 4,
    paddingRight: 4,
    fontSize: 12,
    fontWeight: '400',
    color: '#333333',
    lineHeight: 17
  },
  rowWrap: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 4, paddingRight: 4
  },
  row: {
    flexDirection: 'row', alignItems: 'center'
  },
  inventoryHistory: {
    color: '#59B26A', marginLeft: 4, fontSize: 12, lineHeight: 17, fontWeight: '400'
  }
})