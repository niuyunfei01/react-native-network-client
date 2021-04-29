import BaseComponent from "../BaseComponent";
import React from "react";
import {Alert, DeviceEventEmitter, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import {Checkbox, InputItem, List, WhiteSpace} from "@ant-design/react-native";
import SearchPopup from "../component/SearchPopup";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import {ToastLong, ToastShort} from "../../util/ToastUtils";
import * as tool from "../../common/tool";
import C from '../../config'
import InputNumber from "rc-input-number";
import inputNumberStyles from "../Order/inputNumberStyles";
import JbbCellTitle from "../component/JbbCellTitle";
import color from "../../widget/color";
import JbbButton from "../component/JbbButton";
import EmptyData from "../component/EmptyData";

const CheckboxItem = Checkbox.CheckboxItem;
function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}

class StandardPutIn extends BaseComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: '标品入库',
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          onPress={() => native.nativeBack()}
        />
      )
    }
  }
  
  constructor (props) {
    super(props)
    const store = tool.store(this.props.global)
    this.state = {
      storeId: store.id,
      receiptId: null,
      upc: '',
      product: {},
      supplierPopup: false,
      suppliers: [],
      supplier: {},
      number: 0,
      price: '0',
      standardProducts: [],
      standardProdPrompt: false,
      supplement: false,
      checkHistory: []
    }
  }
  
  componentDidMount (): void {
    const navigation = this.props.navigation
    const {params = {}} = navigation.state
    
    this.fetchSuppliers()
    this.listenUpcInterval()
    this.fetchStandardProducts()
  
    let state = {}
    state.receiptId = params.receiptId ? params.receiptId : null
    state.number = params.number ? params.number : '0'
    state.price = params.price ? params.price : '0'
    if (params.upc) {
      state.upc = params.upc
      this.fetchProductByUpc(params.upc)
    }
    if (params.workerId) {
      this.setSupplier(params.workerId)
    }
    this.setState(state)
  
    native.showInputKeyboard();
  }
  
  componentWillUnmount () {
    if (this.listenScanUpc) {
      this.listenScanUpc.remove()
    }
  }
  
  fetchSuppliers () {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `api_products/material_suppliers?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({suppliers: res})
    })
  }
  
  fetchProductByUpc (upc) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `api_products/get_prod_by_upc/${upc}?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      if (!res.id) {
        native.speakText('未知标准品')
        ToastShort('未知标准品！')
        self.setState({upc: ''})
      } else {
        self.setState({product: res})
        self.fetchCheckHistory(res)
      }
    })
  }
  
  setSupplier (supplierCode) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `api_products/material_get_supplier/${supplierCode}?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      if (!res) {
        Alert.alert('错误', '未知供应商')
      } else {
        self.setState({supplier: res})
      }
    })
  }
  
  fetchCheckHistory (product) {
    const self = this
    const accessToken = this.props.global.accessToken
    const uri = `/api_products/inventory_check_history?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(uri, {
      productId: product.id,
      storeId: this.state.storeId,
      page: 1,
      pageSize: 3
    }).then(res => {
      self.setState({checkHistory: res.lists})
    })
  }
  
  doSubmit () {
    if (this.state.supplement) {
      Alert.alert('提示', '您已选择补货模式，此条记录将不记入库存。\n 确定继续操作么？', [
        {text: '取消', style: 'cancel'},
        {text: '继续', onPress: () => this._submit()},
      ])
    } else {
      this._submit()
    }
  }
  
  _submit () {
    const self = this
    if (!this.state.product.upc) {
      ToastShort('未知商品')
    }
    const accessToken = this.props.global.accessToken
    const api = `/api_products/standard_prod_put_in?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      receiptId: self.state.receiptId,
      upc: self.state.product.upc,
      storeId: self.state.storeId,
      supplierId: self.state.supplier.id,
      price: self.state.price,
      number: self.state.number,
      supplement: self.state.supplement
    }).then(res => {
      self.setState({
        product: {},
        number: 0,
        price: '0',
        upc: '',
        supplement: false,
        checkHistory: []
      })
    })
  }
  
  doNext () {
    const self = this
    Alert.alert('警告', '确定当过当前商品？', [
      {text: '取消'},
      {
        text: '确定',
        onPress: () => {
          self.setState({product: {}, upc: ''})
        }
      }
    ])
  }
  
  /**
   * 获取最近一次标品入库信息
   * @param item
   */
  onSelectProduct (item) {
    const self = this
    const accessToken = this.props.global.accessToken
    const api = `api_products/get_last_receipt_info/${item.upc}?access_token=${accessToken}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      if (!res || !res.supplier || !res.weight) {
        ToastLong('暂无最近收货信息，请手动录入')
      }
      this.setState({
        supplier: res.supplier,
        number: res.weight ? res.weight : 0,
        product: item,
        standardProdPrompt: false
      })
      self.fetchCheckHistory(item)
    })
  }
  
  fetchStandardProducts () {
    const self = this
    const accessToken = this.props.global.accessToken
    const currStoreId = this.props.global.currStoreId
    const api = `api_products/standard_products?access_token=${accessToken}&_sid=${currStoreId}`
    HttpUtils.get.bind(self.props)(api).then(res => {
      self.setState({standardProducts: res})
    })
  }
  
  listenUpcInterval () {
    const self = this
    if (this.listenScanUpc) {
      this.listenScanUpc.remove()
    }
    this.listenScanUpc = DeviceEventEmitter.addListener(C.Listener.KEY_SCAN_STANDARD_PROD_BAR_CODE, function ({barCode}) {
      console.log('listen scan upc => barCode :', barCode)
      if (self.state.upc) {
        native.speakText('当前有未处理的标准品入库')
        ToastShort('当前有未处理的标准品入库！')
        return
      }
      self.setState({upc: barCode})
      self.fetchProductByUpc(barCode)
    })
  }
  
  renderProdInfo () {
    return (
      <View>
        <View style={[styles.cell_box]}>
          <TouchableOpacity onPress={() => this.setState({standardProdPrompt: true})}>
            <View style={styles.cell}>
              <View style={[styles.goods_image]}>
                <Image
                  style={[styles.goods_image]}
                  source={this.state.product.coverimg ? {uri: this.state.product.coverimg} : require('../../img/Order/zanwutupian_.png')}
                />
              </View>
              <View style={[styles.item_right]}>
                <Text style={[styles.goods_name]}>
                  {this.state.product.name ? this.state.product.name : '未知商品'}
                </Text>
                <View>
                  <Text style={styles.sku}>商品ID：{this.state.product.id}</Text>
                  <Text style={styles.sku}>商品码：{this.state.product.upc}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  
  renderInput () {
    return (
      <List>
        <List.Item
          arrow="horizontal"
          onPress={() => this.setState({supplierPopup: true})}
          extra={this.state.supplier.name}
        >供货商</List.Item>
        <InputItem
          extra={'元'}
          value={this.state.price}
          defaultValue={this.state.price}
          onChange={(price) => this.setState({price})}
        >总价</InputItem>
      </List>
    )
  }
  
  renderBtn () {
    return (
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => this.doNext()}>
          <View style={[styles.footerBtn, styles.errorBtn]}>
            <Text style={styles.footerBtnText}>下一个</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => this.doSubmit()}>
          <View style={[styles.footerBtn, styles.successBtn]}>
            <Text style={styles.footerBtnText}>入库</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  
  renderStepper () {
    return (
      <View style={styles.stepperRow}>
        <InputNumber
          styles={inputNumberStyles}
          min={0}
          value={this.state.number}
          style={{backgroundColor: 'white', width: '100%', height: 40}}
          onChange={(number) => this.setState({number})}
          keyboardType={'numeric'}
        />
      </View>
    )
  }
  
  renderCheckHistory () {
    const self = this
    return (
      <View>
        <JbbCellTitle
          right={<JbbButton
            type={'text'}
            text={'查看更多>>'}
            onPress={() => self.props.navigation.navigate(C.ROUTE_INVENTORY_STOCK_CHECK_HISTORY, {
              productId: self.state.product.id,
              storeId: self.state.storeId
            })}
            disabled={!(self.state.product && self.state.product.id)}
            fontColor={color.theme}
          />}
        >盘点历史</JbbCellTitle>
        {
          this.state.checkHistory.length ? (
            <For of={this.state.checkHistory} each="item" index="idx">
              <View key={idx} style={styles.item}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemRowText}>盘点时间：{item.check_time}</Text>
                  <Text style={styles.itemRowText}>盘点人：{item.check_user.nickname}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemRowText}>理论库存：{item.theoretical_num}</Text>
                  <Text style={styles.itemRowText}>实际库存：{item.actual_num}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemRowText}>备注信息：{item.remark}</Text>
                </View>
              </View>
            </For>
          ) : (<EmptyData/>)
        }
      
      </View>
    )
  }
  
  render () {
    const {supplement} = this.state
    return (
      <View style={{flex: 1}}>
        <ScrollView>
          <View>
            {this.renderProdInfo()}
            <WhiteSpace/>
            {this.renderInput()}
            {this.renderStepper()}
        
            <List>
              <CheckboxItem
                multipleLine
                checked={supplement}
                onChange={() => this.setState({supplement: !supplement})}
              >
                补充录入
                <List.Item.Brief>(不增加库存)</List.Item.Brief>
              </CheckboxItem>
            </List>
        
            <WhiteSpace/>
            {this.renderCheckHistory()}
          </View>
        </ScrollView>
  
        {this.renderBtn()}
    
        <SearchPopup
          visible={this.state.supplierPopup}
          dataSource={this.state.suppliers}
          title={'选择供应商'}
          onClose={() => this.setState({supplierPopup: false})}
          onSelect={(item) => this.setState({
            supplier: item,
            supplierPopup: false
          })}
        />
    
        <SearchPopup
          visible={this.state.standardProdPrompt}
          dataSource={this.state.standardProducts}
          title={'选择商品'}
          onClose={() => this.setState({standardProdPrompt: false})}
          onSelect={(item) => this.onSelectProduct(item)}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cell_box: {
    paddingHorizontal: pxToDp(30),
    paddingVertical: pxToDp(26),
    backgroundColor: '#ffffff'
  },
  cell: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#eeeeee',
    flexDirection: 'row',
  },
  goods_image: {
    width: pxToDp(120),
    height: pxToDp(120)
  },
  item_right: {
    flex: 1,
    height: pxToDp(120),
    marginLeft: pxToDp(20),
    justifyContent: 'space-between',
  },
  sku: {
    fontSize: pxToDp(20)
  },
  arrow: {
    width: pxToDp(40),
    flex: 1,
    justifyContent: 'center'
  },
  stepperRow: {
    width: '100%',
    height: 70,
    paddingHorizontal: pxToDp(20),
    paddingVertical: pxToDp(15),
    backgroundColor: '#fff'
  },
  footerContainer: {
    flexDirection: 'row',
    height: pxToDp(80),
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
  },
  
  item: {
    paddingHorizontal: pxToDp(20),
    backgroundColor: '#fff',
    borderBottomWidth: pxToDp(1),
    borderBottomColor: color.fontGray
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: pxToDp(10),
  },
  itemRowText: {
    fontSize: 12
  }
})

export default connect(mapStateToProps)(StandardPutIn)