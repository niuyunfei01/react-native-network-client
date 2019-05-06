import BaseComponent from "../BaseComponent";
import React from "react";
import {Alert, DeviceEventEmitter, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import pxToDp from "../../util/pxToDp";
import {InputItem, List, WhiteSpace} from "antd-mobile-rn";
import SearchPopup from "../component/SearchPopup";
import HttpUtils from "../../util/http";
import {connect} from "react-redux";
import NavigationItem from "../../widget/NavigationItem";
import native from "../../common/native";
import {ToastShort} from "../../util/ToastUtils";
import * as tool from "../../common/tool";
import C from '../../config'
import InputNumber from "rc-input-number";
import inputNumberStyles from "../Order/inputNumberStyles";

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
      store: store,
      receiptId: null,
      upc: '',
      product: {},
      supplierPopup: false,
      suppliers: [],
      supplier: {},
      number: '0',
      price: '0',
      standardProducts: [],
      standardProdPrompt: false
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
  
  doSubmit () {
    const self = this
    if (!this.state.product.upc) {
      ToastShort('未知商品')
    }
    const accessToken = this.props.global.accessToken
    const api = `/api_products/standard_prod_put_in?access_token=${accessToken}`
    HttpUtils.post.bind(self.props)(api, {
      receiptId: self.state.receiptId,
      upc: self.state.product.upc,
      storeId: self.state.store.id,
      supplierId: self.state.supplier.id,
      price: self.state.price,
      number: self.state.number
    }).then(res => {
      self.setState({product: {}, number: '0', price: '0', supplier: {}})
      self.listenUpcInterval()
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
          onClick={() => this.setState({supplierPopup: true})}
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
          value={parseInt(this.state.number)}
          style={{backgroundColor: 'white', width: '100%', height: 40}}
          onChange={(number) => this.setState({number})}
          keyboardType={'numeric'}
        />
      </View>
    )
  }
  render () {
    return (
      <ScrollView
        contentContainerStyle={{flex: 1, justifyContent: 'space-between'}}
        style={{flex: 1}}
      >
        <View>
          {this.renderProdInfo()}
          <WhiteSpace/>
          {this.renderInput()}
          {this.renderStepper()}
        </View>
        
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
          title={'选择供应商'}
          onClose={() => this.setState({standardProdPrompt: false})}
          onSelect={(item) => this.setState({
            product: item,
            standardProdPrompt: false
          })}
        />
      </ScrollView>
    )
      ;
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
  }
})

export default connect(mapStateToProps)(StandardPutIn)